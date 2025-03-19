from pathlib import Path

import pytest
from aiverify_test_engine.plugins.enums.model_type import ModelType

from aiverify_blur_corruptions.algo_init import AlgoInit

image_pipeline = {
    "data_path": "../../../user_defined_files/data/raw_fashion_image_10",
    "model_path": "../../../user_defined_files/pipeline/multiclass_classification_image_mnist_fashion",
    "ground_truth_path": "../../../user_defined_files/data/pickle_pandas_fashion_mnist_annotated_labels_10.sav",
    "model_type": ModelType.CLASSIFICATION,
    "ground_truth": "label",
    "file_name_label": "file_name",
    "set_seed": 10,
    "core_modules_path": "",
}


@pytest.mark.parametrize(
    "data_set",
    [
        image_pipeline,
    ],
)
def test_aiverify_blur_corruptions_plugin(data_set):
    # Create an instance of PluginTest with defined paths and arguments and Run.
    plugin_argument_values = {
        "corruptions": ["horizontal_motion_blur", "zoom_blur"],
        "zoom_blur_zoom_factor": [1.0, 1.5, 2.0, 2.5, 3.0],
        "glass_blur_max_delta": [1, 3, 5],
    }

    plugin_test = AlgoInit(
        data_path=data_set["data_path"],
        model_path=data_set["model_path"],
        model_type=data_set["model_type"],
        ground_truth_path=data_set["ground_truth_path"],
        ground_truth=data_set["ground_truth"],
        file_name_label=data_set["file_name_label"],
        set_seed=data_set["set_seed"],
        core_modules_path=data_set["core_modules_path"],
        user_defined_params=plugin_argument_values,
    )
    plugin_test.run()

    json_file_path = Path.cwd() / "output" / "results.json"
    assert json_file_path.exists()
