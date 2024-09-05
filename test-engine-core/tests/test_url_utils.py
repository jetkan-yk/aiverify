import os
from unittest.mock import patch

import pytest
from requests.models import Response
from test_engine_core.utils.url_utils import download_from_url, is_url


class TestUrlUtils:
    @pytest.mark.parametrize(
        "input_path, expected_output",
        [
            ("https://example.com/file.zip", True),  # valid URL
            ("http://example.com/file.zip", True),  # valid URL
            ("ftp://example.com/file.zip", True),  # valid URL with different scheme
            ("example.com/file.zip", False),  # invalid URL (no scheme)
            ("C:/path/to/file.zip", False),  # invalid URL (local path)
            ("/path/to/file.zip", False),  # invalid URL (local path)
            ("", False),  # empty string
            (None, False),  # None input
        ],
    )
    def test_is_url(self, input_path, expected_output):
        """
        Tests if the input path is a valid URL.
        """
        assert is_url(input_path) == expected_output

    @patch("requests.get")
    def test_download_from_url_success(self, mock_get):
        """
        Tests the successful download of a file from a URL.
        """
        test_url = "https://example.com/file.zip"
        mock_content = b"Test file content"

        # Create a mock response object
        mock_response = Response()
        mock_response.status_code = 200
        mock_response._content = mock_content

        # Set the mock to return our mock response
        mock_get.return_value = mock_response

        downloaded_file_path = download_from_url(test_url)
        assert os.path.exists(downloaded_file_path)
        with open(downloaded_file_path, "rb") as f:
            content = f.read()
        assert content == mock_content

        # Clean up the temporary file
        os.remove(downloaded_file_path)

    @patch("requests.get")
    def test_download_from_url_failure(self, mock_get):
        """
        Tests download failure due to a bad response status.
        """
        test_url = "https://example.com/file.zip"

        # Create a mock response object with a failed status
        mock_response = Response()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        # Verify that an exception is raised
        with pytest.raises(Exception, match="Failed to download file: HTTP 404"):
            download_from_url(test_url)
