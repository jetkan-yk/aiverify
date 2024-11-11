from __future__ import annotations

from typing import Any

from aiverify_test_engine.interfaces.iserializer import ISerializer
from aiverify_test_engine.plugins.enums.plugin_type import PluginType
from aiverify_test_engine.plugins.enums.serializer_plugin_type import (
    SerializerPluginType,
)
from aiverify_test_engine.plugins.metadata.plugin_metadata import PluginMetadata
# from tensorflow import keras
import numpy as np
import torch
from scipy.io import loadmat


# NOTE: Do not change the class name, else the plugin cannot be read by the system
class Plugin(ISerializer):
    """
    The Plugin(pytorchserializer) class specifies methods on serialization.
    """

    # Some information on plugin
    _name: str = "pytorchserializer"
    _description: str = "pytorchserializer supports deserializing pytorch data"
    _version: str = "0.9.0"
    _metadata: PluginMetadata = PluginMetadata(_name, _description, _version)
    _plugin_type: PluginType = PluginType.SERIALIZER
    _serializer_plugin_type: SerializerPluginType = SerializerPluginType.PYTORCH

    @staticmethod
    def get_metadata() -> PluginMetadata:
        """
        A method to return the metadata for this plugin

        Returns:
            PluginMetadata: Metadata of this plugin
        """
        return Plugin._metadata

    @staticmethod
    def get_plugin_type() -> PluginType:
        """
        A method to return the type for this plugin

        Returns:
             PluginType: Type of this plugin
        """
        return Plugin._plugin_type

    @staticmethod
    def deserialize_data(data_path: str) -> Any:
        """
        A method to read the data path and attempt to deserialize it

        Args:
            data_path (str): data path that is serialized

        Returns:
            Any: deserialized data
        """
        try:
            # return keras.models.load_model(data_path)
            print(f" == inside pytorch deserializer data_path == {data_path}")
            # data = np.load(data_path)

            # # Convert data to tensor for PyTorch
            # data_tensor = torch.tensor(data, dtype=torch.float32)

            # return data_tensor
            return torch.load(data_path)        
        
        except Exception as e :
            print(f" deserialize error: ${e} ")
            raise

    @staticmethod
    def get_serializer_plugin_type() -> SerializerPluginType:
        """
        A method to return SerializerPluginType

        Returns:
            SerializerPluginType: Serializer Plugin Type
        """
        return Plugin._serializer_plugin_type
