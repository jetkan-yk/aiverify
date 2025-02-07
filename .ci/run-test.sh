#!/bin/bash
source_dir=${1:aiverify_test_engine}

echo "#############################################################################"
echo "###                                                                       ###"
echo "###                        UNIT TEST & CODE COVERAGE                      ###"
echo "###                                                                       ###"
echo "#############################################################################"

if [ "$2" == "-m" ]; then
  test_cmd="python3 -m pytest"
else
  test_cmd=pytest
fi

set +e
$test_cmd --cov=$source_dir --cov-branch --html=test-report.html --json=test-report.json
exit_code=$?
coverage html
coverage json --pretty-print
set -e
if [ $exit_code -ne 0 ]; then
  exit $exit_code
fi
