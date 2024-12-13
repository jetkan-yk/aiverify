from fastapi import APIRouter, HTTPException, UploadFile, Form, Depends, Response
from pydantic import BaseModel, Field
from typing import Optional, List, Annotated, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import tempfile
from pathlib import Path, PurePath

from ..lib.logging import logger
from ..lib.constants import ModelType, TestModelMode, TestModelFileType, TestModelStatus
from ..lib.file_utils import check_valid_filename, check_file_size
from ..lib.filestore import save_test_model as fs_save_test_model, delete_test_model as fs_delete_test_model, get_test_model as fs_get_test_model
from ..lib.database import get_db_session
from ..schemas import TestModel
from ..models import TestModelModel, TestResultModel
from ..lib.test_engine import TestEngineValidator, TestEngineValidatorException

router = APIRouter(prefix="/test_models", tags=["test_models"])


class TestModelFileUploadForm(BaseModel):
    modelType: ModelType = Field(description="Type of the model")
    # folderPath: Optional[str] = Field(description="Relative path of folder to save under, can be nested. E.g. folder1/folder2/folder3. If null, assume no folder")


class TestModelFolderUploadForm(BaseModel):
    # modelType: ModelType = Field(description="Type of the model")
    folderPath: Optional[str] = Field(description="Relative path of folder to save under, can be nested. E.g. folder1/folder2/folder3. If null, assume no folder")


file_upload_form_example = [
    "classification"
]


@router.post("/upload", response_model=List[TestModel])
async def upload_model_files(
    model_types: Annotated[Any, Form(examples=[file_upload_form_example])],
    files: List[UploadFile] = [],
    session: Session = Depends(get_db_session)
) -> List[TestModel]:
    """
    Endpoint to upload model files.
    """
    logger.debug(f"upload_model_files, files: {files}, model_types: {model_types}")
    if not files or not model_types:
        raise HTTPException(status_code=400, detail=f"Invalid parameters")
    
    try:
        model_types_array = model_types.split(",")
        if len(files) != len(model_types_array):
            raise HTTPException(status_code=400, detail=f"Number of model files information must be equal to number of files uploaded")
        
        model_types_list = [ModelType(type) for type in model_types_array]
        print(model_types_list)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error validating form data: {e}")
    
    # validate all the models first
    try:
        model_list: List[TestModelModel] = []
        with session.begin():
            with tempfile.TemporaryDirectory() as tmpdirname:
                tmpdir = Path(tmpdirname)
                for index, file in enumerate(files):
                    if not file.filename or not file.size:
                        raise HTTPException(status_code=400, detail=f"Invalid File")
                    if not check_valid_filename(file.filename):
                        raise HTTPException(status_code=400, detail=f"Invalid filename {file.filename}")
                    if not check_file_size(file.size):
                        raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds maximum upload size")
                    
                    # check for duplicate filenames
                    filename = file.filename
                    filepath = PurePath(filename)
                    file_counter = 1
                    while session.query(TestModelModel).filter(TestModelModel.filename == filename).count() > 0:
                        filename = f"{filepath.stem}_{file_counter}{filepath.suffix}"
                        file_counter = file_counter + 1
                    
                    model_path = tmpdir.joinpath(filename)
                    now = datetime.now(timezone.utc)
                    with open(model_path, "wb") as fp:
                        fp.write(file.file.read())
                    test_model = TestModelModel(
                        name=filename,
                        description=None,
                        mode=TestModelMode.Upload,
                        model_type=model_types_list[index],
                        file_type=TestModelFileType.File,
                        filename=filename,
                        size=file.size,
                        # status=TestModelStatus.Pending,
                        # errorMessages=None,
                        created_at=now,
                        updated_at=now
                    )
                    try:
                        (model_format, serializer) = TestEngineValidator.validate_model(model_path)
                        test_model.status = TestModelStatus.Valid
                        test_model.model_format = model_format
                        test_model.serializer = serializer
                    except TestEngineValidatorException as e:
                        logger.debug(f"Model validation error: {e}")
                        test_model.status = TestModelStatus.Invalid
                        test_model.error_message = str(e)

                    model_list.append(test_model)

                # now save to fs
                for model in model_list:
                    if model.status == TestModelStatus.Valid and model.filename:
                        model_path = tmpdir.joinpath(model.filename)
                        try:
                            filehash = fs_save_test_model(model_path)
                        except Exception as e:
                            # if save error, set model to invalid
                            model.status = TestModelStatus.Invalid
                            model.error_message = f"Error saving model: {e}"
                        else:
                            model.zip_hash = filehash
                        session.add(test_model)

        return [TestModel.from_model(model) for model in model_list]
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error uploading model files: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=List[TestModel])
def list_test_models(session: Session = Depends(get_db_session)):
    """
    Endpoint to list all test models.
    """
    try:
        test_models = session.query(TestModelModel).all()
        return [TestModel.from_model(model) for model in test_models]
    except Exception as e:
        logger.error(f"Error retrieving test models: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{model_id}", response_model=TestModel)
def read_test_model(model_id: int, session: Session = Depends(get_db_session)):
    """
    Endpoint to read a specific test model by its ID.
    """
    try:
        test_model = session.query(TestModelModel).filter(TestModelModel.id == model_id).first()
        if not test_model:
            raise HTTPException(status_code=404, detail="Test model not found")
        return TestModel.from_model(test_model)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving test model with ID {model_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    

@router.get("/{model_id}/download", response_class=Response)
def download_test_model(model_id: int, session: Session = Depends(get_db_session)):
    """
    Endpoint to download a specific test model by its ID.
    """
    try:
        test_model = session.query(TestModelModel).filter(TestModelModel.id == model_id).first()
        if not test_model:
            raise HTTPException(status_code=404, detail="Test model not found")
        
        if test_model.mode != TestModelMode.Upload or test_model.filename is None or test_model.size is None:
            raise HTTPException(status_code=400, detail="Model file has not been uploaded")
        
        model_content = fs_get_test_model(test_model.filename)

        if test_model.file_type == TestModelFileType.File:
            headers = {"Content-Disposition": f'attachment; filename="{test_model.filename}"'}
            return Response(content=model_content, media_type="application/octet-stream", headers=headers)
        else:
            headers = {"Content-Disposition": f'attachment; filename="{test_model.filename}.zip"'}
            return Response(content=model_content, media_type="application/zip", headers=headers)
    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model file not found")
    except Exception as e:
        logger.error(f"Error downloading test model with ID {model_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{model_id}", response_model=dict)
def delete_test_model(model_id: int, session: Session = Depends(get_db_session)):
    """
    Endpoint to delete a specific test model by its ID.
    """
    try:
        test_model = session.query(TestModelModel).filter(TestModelModel.id == model_id).first()
        if not test_model:
            raise HTTPException(status_code=404, detail="Test model not found")
        
        if session.query(TestResultModel).filter(TestResultModel.model_id == test_model.id).count() > 0:
            raise HTTPException(status_code=404, detail="Test model cannot be deleted if there are test results referencing this model")
        
        if test_model.mode == TestModelMode.Upload and test_model.filename and test_model.size is not None:
            fs_delete_test_model(test_model.filename)

        session.delete(test_model)
        session.commit()
        return {"detail": "Test model deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting test model with ID {model_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
