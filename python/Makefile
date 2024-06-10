clean-pycache:
	find . -depth -name "__pycache__" -type d -exec rm -rf {} +
	find . -depth -name ".DS_Store" -type f -exec rm -rf {} +
	find . -depth -name ".ipynb_checkpoints" -type d -exec rm -rf {} +

clean: clean-pycache ## Clean
	rm -rf dist
	rm -rf build
	rm -rf *.egg-info
	rm -rf `find . -type d -name .ipynb_checkpoints`
	rm -rf __pycache__

build: clean ## Build PIPy Package
	python setup.py sdist bdist_wheel

check-content: build  ## List contents of PIPy Package
	tar -tvf dist/*.tar.gz

check: build  ## Check PIPy Package
	twine check dist/*

upload: build  ## Upload PIPy Package
	twine upload dist/*

install:  ## Install from repo
	pip install -e .

uninstall: ## Uninstall
	pip uninstall inspectus

help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

.PHONY: clean build check upload help
.DEFAULT_GOAL := help
