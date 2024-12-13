from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Annotated
import json
from ..models import WidgetModel


class WidgetMetaSize(BaseModel):
    minW: int = Field(description="Minimum widget width", ge=1, le=12)
    minH: int = Field(description="Minimum widget height", ge=1, le=36)
    maxW: int = Field(description="Maximum widget width", ge=1, le=12)
    maxH: int = Field(description="Maximum widget height", ge=1, le=36)


class WidgetMetaProperty(BaseModel):
    key: str = Field(description="Property key", min_length=1, max_length=128)
    helper: str = Field(description="Helper text for the property", max_length=128)
    default: Optional[str] = Field(default=None, description="Property default value", max_length=128)


class WidgetMetaDependency(BaseModel):
    gid: Optional[str] = Field(
        default=None,
        description="GID of the dependency component plugin. If empty, assume component within same plugin.",
        max_length=128,
    )
    cid: str = Field(description="CID of the dependency component", min_length=1, max_length=128)
    version: Optional[str] = Field(
        default=None, description="Version of the component dependency required", min_length=1, max_length=256
    )


class WidgetMetaMockData(BaseModel):
    type: Literal["Algorithm", "InputBlock"] = Field(description="Type of sample data")
    gid: Optional[str] = Field(
        default=None,
        description="GID of sample data for component dependency. If empty, assume GID of same plugin",
        max_length=128,
    )
    cid: str = Field(description="CID of sample data for component dependency", min_length=1, max_length=128)
    # datapath: str = Field(description="Path to the file containing sample data", min_length=1, max_length=256)


class WidgetMeta(BaseModel):
    cid: str = Field(
        description="Unique identifier for the widget within the plugin",
        min_length=1,
        max_length=128,
        pattern=r"^[a-zA-Z0-9][a-zA-Z0-9-._]*$",
    )
    name: str = Field(description="Widget name", min_length=1, max_length=128)
    version: Optional[str] = Field(
        default=None,
        description="Version of the widget, default to plugin version if not specified",
        min_length=1,
        max_length=256,
    )
    author: Optional[str] = Field(default=None, description="Widget author", min_length=1, max_length=128)
    description: Optional[str] = Field(default=None, description="Widget description", max_length=256)
    widgetSize: WidgetMetaSize = Field(description="Describe the widget size in terms of canvas grid units")
    properties: Optional[List[WidgetMetaProperty]] = Field(
        default=None, description="List of widget properties", max_length=256
    )
    tags: Optional[List[Annotated[str, Field(min_length=1, max_length=128)]]] = Field(
        default=None, description="Widget tags, used for searching", max_length=128
    )
    dependencies: Optional[List[WidgetMetaDependency]] = Field(
        default=None, description="Widget dependencies", max_length=256
    )
    mockdata: Optional[List[WidgetMetaMockData]] = Field(
        default=None, description="Sample data to be fed into the widget in canvas mode", max_length=256
    )
    dynamicHeight: Optional[bool] = Field(default=False, description="Whether this widget has dynamic height")


class WidgetOutput (WidgetMeta):
    gid: Optional[str] = Field(
        description="Unique global identifier for the plugin",
        min_length=1,
        max_length=128,
        pattern=r"^[a-zA-Z0-9][a-zA-Z0-9-._]*$",
    )

    @classmethod
    def from_model(cls, result: WidgetModel) -> "WidgetOutput":
        obj = cls(
            cid=result.cid,
            gid=result.plugin.gid,
            name=result.name,
            version=result.version,
            author=result.author,
            description=result.description,
            widgetSize=WidgetMetaSize.model_validate_json(result.widget_size.decode('utf-8')),
            properties=[WidgetMetaProperty.model_validate_json(prop) for prop in json.loads(
                result.properties.decode('utf-8'))] if result.properties else None,
            # tags=result.tags,
            dependencies=[WidgetMetaDependency.model_validate_json(dep) for dep in json.loads(
                result.dependencies.decode('utf-8'))] if result.dependencies else None,
            mockdata=[WidgetMetaMockData.model_validate_json(mock) for mock in json.loads(
                result.mockdata.decode('utf-8'))] if result.mockdata else None,
            dynamicHeight=result.dynamic_height
        )
        return obj
