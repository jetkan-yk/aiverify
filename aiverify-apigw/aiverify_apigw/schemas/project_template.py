from pydantic import BaseModel, Field, model_validator
from typing_extensions import Self
from typing import List, Optional, Self
from datetime import datetime
from enum import StrEnum, auto
import json
from ..models import ProjectTemplateModel


class GlobalVariable(BaseModel):
    key: str = Field(description="Property key", min_length=1, max_length=128)
    value: str = Field(description="Property value", max_length=128)


class LayoutItemProperties(BaseModel):
    justifyContent: Optional[str] = Field(default=None)
    alignItems: Optional[str] = Field(default=None)
    textAlign: Optional[str] = Field(default=None)
    color: Optional[str] = Field(default=None)
    bgcolor: Optional[str] = Field(default=None)


class ReportWidget(BaseModel):
    widgetGID: str = Field(min_length=1, max_length=256)
    key: str = Field(min_length=1, max_length=128)
    layoutItemProperties: Optional[LayoutItemProperties] = None
    properties: Optional[dict] = None


class WidgetLayoutResizeHandleEmum(StrEnum):
    s = auto()
    w = auto()
    e = auto()
    n = auto()
    sw = auto()
    nw = auto()
    se = auto()
    ne = auto()


class WidgetLayout(BaseModel):
    i: str = Field(description="Unique identifier for the layout item", min_length=1, max_length=128)
    x: int = Field(description="X position of the layout item", ge=0, le=12)
    y: int = Field(description="Y position of the layout item", ge=0, le=36)
    w: int = Field(description="Width of the layout item", ge=0, le=12)
    h: int = Field(description="Height of the layout item", ge=0, le=36)
    maxW: Optional[int] = Field(description="Maximum width of the layout item", ge=0, le=12)
    maxH: Optional[int] = Field(description="Maximum height of the layout item", ge=0, le=36)
    minW: Optional[int] = Field(description="Minimum width of the layout item", ge=0, le=12)
    minH: Optional[int] = Field(description="Minimum height of the layout item", ge=0, le=36)
    static: bool = Field(description="Whether the layout item is static")
    isDraggable: Optional[bool] = False
    isResizable: Optional[bool] = False
    resizeHandles: Optional[List[WidgetLayoutResizeHandleEmum]] = Field(description="Resize handle", default=None)
    isBounded: Optional[bool] = False

    @model_validator(mode='after')
    def validate_widget_layout(self) -> Self:
        if self.minW and self.maxW and self.minW > self.maxW:
            raise ValueError("minW has a larger value than maxW")
        if self.minH and self.maxH and self.minH > self.maxH:
            raise ValueError("minH has a larger value than maxH")
        return self


class ProjectInformation(BaseModel):
    name: str = Field(description="Project Name", max_length=128)
    description: Optional[str] = Field(description="Property value", max_length=256, default=None)
    reportTitle: Optional[str] = Field(description="Property value", max_length=128, default=None)
    company: Optional[str] = Field(description="Property value", max_length=128, default=None)


class ProjectTemplateInformation(BaseModel):
    name: str = Field(description="Project Name", max_length=128)
    description: Optional[str] = Field(description="Property value", max_length=256, default=None)


class Page(BaseModel):
    layouts: List[WidgetLayout]
    reportWidgets: List[ReportWidget] = Field(min_length=0, max_length=256)


class ProjectTemplateMeta(BaseModel):
    globalVars: Optional[List[GlobalVariable]] = None
    pages: List[Page] = Field(Page, min_length=1, max_length=256)


class ProjectTemplateInput(ProjectTemplateMeta):
    projectInfo: ProjectTemplateInformation


class ProjectTemplateOutput(ProjectTemplateInput):
    id: int  # project template id
    fromPlugin: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @classmethod
    def from_model(cls, result: ProjectTemplateModel) -> "ProjectTemplateOutput":
        meta = ProjectTemplateMeta.model_validate(json.loads(result.data.decode("utf-8")))
        return ProjectTemplateOutput(
            id=result.id,
            pages=meta.pages,
            globalVars=meta.globalVars,
            fromPlugin=result.from_plugin,
            projectInfo=ProjectTemplateInformation(name=result.name, description=result.description),
            created_at=result.created_at,
            updated_at=result.updated_at,
        )
