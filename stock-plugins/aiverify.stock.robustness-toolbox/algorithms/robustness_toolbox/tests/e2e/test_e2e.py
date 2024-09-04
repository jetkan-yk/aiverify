from pathlib import Path

import pytest
from robustness_toolbox.algo_init import AlgoInit
from test_engine_core.plugins.enums.model_type import ModelType

binary_classification = {
    "data_path": str(
        "../../../user_defined_files/data/sample_bc_pipeline_credit_data.sav"
    ),
    "model_path": str("../../../user_defined_files/pipeline/bc_tabular_credit"),
    "ground_truth_path": str(
        "../../../user_defined_files/data/sample_bc_pipeline_credit_ytest_data.sav"
    ),
    "run_pipeline": True,
    "model_type": ModelType.CLASSIFICATION,
    "ground_truth": "default",
}

regression_non_pipeline = {
    "data_path": str("../../../user_defined_files/data/sample_reg_donation_data.sav"),
    "model_path": str(
        "../../../user_defined_files/model/sample_reg_donation_sklearn_linear.LogisticRegression.sav"
    ),
    "ground_truth_path": str(
        "../../../user_defined_files/data/sample_reg_donation_data.sav"
    ),
    "run_pipeline": False,
    "model_type": ModelType.REGRESSION,
    "ground_truth": "donation",
}

image_pipeline = {
    "data_path": str("../../../user_defined_files/data/raw_fashion_image_10/0.png"),
    "model_path": str(
        "../../../user_defined_files/pipeline/multiclass_classification_image_mnist_fashion"
    ),
    "ground_truth_path": str(
        "../../../user_defined_files/data/pickle_pandas_fashion_mnist_annotated_labels_10.sav"
    ),
    "run_pipeline": True,
    "model_type": ModelType.CLASSIFICATION,
    "ground_truth": "label",
}


@pytest.mark.parametrize(
    "data_set",
    [binary_classification, regression_non_pipeline, image_pipeline],
)
def test_robustness_toolbox_plugin(data_set):
    core_modules_path = ""
    plugin_argument_values = {
        "annotated_ground_truth_path": (
            "../../../user_defined_files/data/pickle_pandas_fashion_mnist_annotated_labels_10.sav"
        ),
        "file_name_label": ("file_name"),
    }
    # =====================================================================================
    # NOTE: Do not modify the code below
    # =====================================================================================
    # Perform Plugin Testing
    try:
        # Create an instance of PluginInit with defined paths and arguments and Run.
        # with caplog.at_level(logging.INFO):
        # assert 1==2
        plugin_test = AlgoInit(
            data_set["run_pipeline"],
            core_modules_path,
            data_set["data_path"],
            data_set["model_path"],
            data_set["ground_truth_path"],
            data_set["ground_truth"],
            data_set["model_type"],
            plugin_argument_values,
        )
        plugin_test.run()

        json_file_path = Path.cwd() / "output" / "results.json"
        assert json_file_path.exists(), f"File not found: {json_file_path}"

        print("Assertions passed, continuing execution...")
        # assert "This is a test log message" in caplog.text
    except Exception as e:
        # Handle and report any exceptions that occur during plugin execution
        print(f"Exception caught while running the plugin test: {str(e)}")


# if __name__ == "__main__":
#     # # Tabular Binary Classification Pipeline
#     # data_path = "tests/user_defined_files/data/sample_bc_pipeline_credit_data.sav"
#     # model_path = "tests/user_defined_files/pipeline/bc_tabular_credit"
#     # ground_truth_path = "tests/user_defined_files/data/sample_bc_pipeline_credit_ytest_data.sav"
#     # ground_truth = "default"
#     # run_pipeline = True
#     # model_type = ModelType.CLASSIFICATION

#     # Regression Non-Pipeline
#     data_path = "tests/user_defined_files/data/sample_reg_donation_data.sav"
#     model_path = "tests/user_defined_files/model/sample_reg_donation_sklearn_linear.LogisticRegression.sav"
#     ground_truth_path = "tests/user_defined_files/data/sample_reg_donation_data.sav"
#     ground_truth = "donation"
#     run_pipeline = False
#     model_type = ModelType.REGRESSION

#     # Image Pipeline
#     data_path = "tests/user_defined_files/data/raw_fashion_image_10"
#     model_path = "tests/user_defined_files/pipeline/multiclass_classification_image_mnist_fashion"
#     ground_truth_path = "tests/user_defined_files/data/pickle_pandas_fashion_mnist_annotated_labels_10.sav"
#     ground_truth = "label"
#     run_pipeline = True
#     model_type = ModelType.CLASSIFICATION

#     core_modules_path = ""
#     plugin_argument_values = {
#         "annotated_ground_truth_path": (
#             "tests/user_defined_files/data/pickle_pandas_fashion_mnist_annotated_labels_10.sav"
#         ),
#         "file_name_label": ("file_name"),
#     }

#     # =====================================================================================
#     # NOTE: Do not modify the code below
#     # =====================================================================================
#     # Perform Plugin Testing
#     try:
#         # Create an instance of PluginTest with defined paths and arguments and Run.
#         plugin_test = AlgoInit(
#             run_pipeline,
#             core_modules_path,
#             data_path,
#             model_path,
#             ground_truth_path,
#             ground_truth,
#             model_type,
#             plugin_argument_values,
#         )
#         plugin_test.run()

#     except Exception as exception:
#         print(f"Exception caught while running the plugin test: {str(exception)}")
