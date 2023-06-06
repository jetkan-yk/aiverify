import logging
from typing import Any, Dict, Tuple, Union

from test_engine_core.interfaces.ipipeline import IPipeline
from test_engine_core.interfaces.iserializer import ISerializer
from test_engine_core.utils.import_modules import (
    get_non_python_files,
    import_python_modules,
)
from test_engine_core.utils.log_utils import log_message


class PipelineManager:
    """
    The PipelineManager comprises methods that focuses on reading pipeline files
    As input files are usually serialized before written to a file, this class will perform
    de-serialisation with supported packages, and identify if the pipeline is one of the supported formats
    """

    _logger: logging.Logger = None

    @staticmethod
    def set_logger(logger: logging.Logger) -> None:
        """
        A method to set up the logger instance for logging

        Args:
            logger (Logger): The logger instance
        """
        if isinstance(logger, logging.Logger):
            PipelineManager._logger = logger

    @staticmethod
    def read_pipeline_path(
        pipeline_path: str, pipeline_plugins: Dict, serializer_plugins: Dict
    ) -> Tuple[bool, Union[IPipeline, None], Union[ISerializer, None], str]:
        """
        A method to read the pipeline path and return the pipeline instance and serializer instance
        It is usually serialize by some program such as (pickle, joblib)

        Args:
            pipeline_path (str): The pipeline path
            pipeline_plugins (Dict): A dictionary of supported pipeline plugins
            serializer_plugins (Dict): A dictionary of supported serializer plugins

        Returns:
            Tuple[bool, Union[IPipeline, None], Union[ISerializer, None], str]:
            Returns a tuple consisting of bool that indicates if it succeeds,
            If it succeeds, it will contain an object of IPipeline,
            and an object of ISerializer and returns an empty string
            If it fails to deserialize/identify, it will contain None objects and returns the error message
        """
        return_pipeline_instance = None
        return_pipeline_serializer_instance = None
        log_message(
            PipelineManager._logger,
            logging.INFO,
            f"Attempting to read pipeline: {pipeline_path}",
        )

        # Validate the inputs
        if (
            pipeline_path is None
            or not isinstance(pipeline_path, str)
            or pipeline_plugins is None
            or not isinstance(pipeline_plugins, dict)
            or serializer_plugins is None
            or not isinstance(serializer_plugins, dict)
        ):
            # Failed to deserialize pipeline path and Perform logging
            error_message = (
                f"There was an error validating the input parameters: {pipeline_path}, "
                f"{pipeline_plugins}, {serializer_plugins}"
            )
            log_message(PipelineManager._logger, logging.ERROR, error_message)
            return (
                False,
                return_pipeline_instance,
                return_pipeline_serializer_instance,
                error_message,
            )
        else:
            log_message(
                PipelineManager._logger, logging.INFO, "Pipeline validation successful"
            )

        # Pipeline needs to import accompanying class and load it up.
        # Pipeline path will be in folder, and we will need to import the python modules first,
        # then find out which is the pipeline file to be deserialized and used.
        import_python_modules(pipeline_path)
        non_python_files = get_non_python_files(pipeline_path)
        if non_python_files:
            log_message(
                PipelineManager._logger,
                logging.INFO,
                f"Found these non python files: {non_python_files}",
            )
            pipeline_file = list(non_python_files.values())[0]
        else:
            error_message = "There was an error getting pipeline files in the folder"
            log_message(PipelineManager._logger, logging.ERROR, error_message)
            return (
                False,
                return_pipeline_instance,
                return_pipeline_serializer_instance,
                error_message,
            )

        # Attempt to deserialize the pipeline with the supported serializer.
        # If pipeline is not able to deserialize by any of the supported tool, it will return False
        log_message(
            PipelineManager._logger,
            logging.INFO,
            f"Attempting to deserialize pipeline: {pipeline_path}",
        )
        (
            is_success,
            pipeline,
            return_pipeline_serializer_instance,
        ) = PipelineManager._try_to_deserialize_pipeline(
            pipeline_file, serializer_plugins
        )
        if not is_success:
            # Failed to deserialize pipeline file
            error_message = (
                f"There was an error deserializing the pipeline: {pipeline_file}"
            )
            log_message(PipelineManager._logger, logging.ERROR, error_message)
            return (
                is_success,
                return_pipeline_instance,
                return_pipeline_serializer_instance,
                error_message,
            )

        # Attempt to identify the pipeline format with the supported list.
        # If pipeline is not in the supported list, it will return False
        log_message(
            PipelineManager._logger,
            logging.INFO,
            f"Attempting to identify pipeline format: {type(pipeline)}",
        )
        (
            is_success,
            return_pipeline_instance,
        ) = PipelineManager._try_to_identify_pipeline_format(pipeline, pipeline_plugins)
        if is_success:
            error_message = ""
            log_message(
                PipelineManager._logger,
                logging.INFO,
                f"Supported pipeline format: {type(pipeline)}, "
                f"{return_pipeline_instance.get_pipeline_plugin_type()}"
                f"[{return_pipeline_instance.get_pipeline_algorithm()}]",
            )
        else:
            # Failed to get pipeline format
            return_pipeline_instance = None
            error_message = f"There was an error getting pipeline format (unsupported): {type(pipeline)}"
            log_message(PipelineManager._logger, logging.ERROR, error_message)

        return (
            is_success,
            return_pipeline_instance,
            return_pipeline_serializer_instance,
            error_message,
        )

    @staticmethod
    def _try_to_deserialize_pipeline(
        pipeline_file: str, serializer_plugins: Dict
    ) -> Tuple[bool, Any, Any]:
        """
        A helper method to deserialize the pipeline file path and return the de-serialized pipeline
        and serializer instance

        Args:
            pipeline_file (str): The pipeline file path
            serializer_plugins (Dict): A dictionary of supported serializer plugins

        Returns:
            Tuple[bool, Any, Any]:
            Returns a tuple consisting of bool that indicates if it succeeds,
            If it succeeds, it will contain an object of Any, and an object of Any and returns an empty string
            If it fails to deserialize/identify, it will contain None objects and returns the error message
        """
        is_success = False
        pipeline = None
        serializer = None

        # Scan through all the supported serializer
        # Check that this pipeline is one of the supported pipeline formats and can be deserialized
        for (
            _,
            serializer_plugin,
        ) in serializer_plugins.items():
            try:
                temp_serializer = serializer_plugin.Plugin
                pipeline = temp_serializer.deserialize_data(pipeline_file)
                if pipeline is not None:
                    is_success = True
                    serializer = temp_serializer
                    break
            except Exception:
                continue

        return is_success, pipeline, serializer

    @staticmethod
    def _try_to_identify_pipeline_format(
        pipeline: Any,
        pipeline_plugins: Dict,
    ) -> Tuple[bool, IPipeline]:
        """
        A helper method to read the pipeline and return the respective pipeline format instance

        Args:
            pipeline (Any): The de-serialized pipeline
            pipeline_plugins (Dict): The dictionary of detected pipeline plugins

        Returns:
            Tuple[bool, IPipeline]:
            Returns a tuple consisting of bool that indicates if it succeeds,
            If it succeeds, it will contain an object of IPipeline
            If it fails to deserialize/identify, it will contain None object
        """
        is_success = False
        pipeline_instance = None

        # Scan through all the supported pipeline formats
        # Check that this pipeline is one of the supported pipeline formats
        try:
            for _, pipeline_plugin in pipeline_plugins.items():
                pipeline_instance = pipeline_plugin.Plugin(pipeline)
                if pipeline_instance.is_supported():
                    is_success = True
                    break

        except Exception:
            is_success = False
            pipeline_instance = None

        return is_success, pipeline_instance
