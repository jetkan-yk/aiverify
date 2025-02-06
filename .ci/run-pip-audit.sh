#!/bin/bash

# Create venv for ci
python3 -m venv ci-venv
source ci-venv/bin/activate

pip install --upgrade pip > /dev/null

# Install dependencies
if [ -z "$1" ]; then
  pip install . > /dev/null
else
  pip install .["$1"] > /dev/null
fi

# License check
echo "License check..."
pip install pip-licenses > /dev/null
pip-licenses --format markdown --output-file licenses-found.md > /dev/null
pip uninstall pip-licenses prettytable wcwidth -y > /dev/null

# Dependency check
echo "Dependency check..."
pip install pip-audit > /dev/null
#pip uninstall setuptools -y > /dev/null
set +e
pip-audit --format markdown --desc on -o pip-audit-report.md &> pip-audit-count.txt
exit_code=$?
pip install mdtree > /dev/null

if [ -f pip-audit-report.md ]; then
  echo "============ Vulnerabilities Found ============"
  cat pip-audit-report.md
  mdtree pip-audit-report.md > pip-audit-report.html
else
  touch pip-audit-report.html
fi

if [ -f licenses-found.md ]; then
  copyleftLic=("GPL" "LGPL" "MPL" "AGPL" "EUPL" "CCDL" "EPL" "CC-BY-SA" "OSL" "CPL")
  echo "============ Copyleft Licenses Found ============"
  head -n 2 licenses-found.md
  while IFS= read -r line; do
    for lic in "${copyleftLic[@]}"; do
      if [[ $line == *"$lic"* ]]; then
        echo "$line"
        break
      fi
    done
  done < licenses-found.md
  mdtree licenses-found.md > license-report.html
else
  touch license-report.html
fi

deactivate
rm -rf ci-venv

set -e
if [ $exit_code -ne 0 ]; then
#  echo "pip-audit failed, exiting..."
  exit $exit_code
fi
