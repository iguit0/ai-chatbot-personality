# Virtual Environment
.PHONY: build-venv
build-venv:
	python -m venv venv

# Install Requirements
.PHONY: requirements-dev
requirements-dev:
	@echo "Upgrading pip and installing requirements..."
	python -m pip install --upgrade pip
	pip install wheel
	pip install -r requirements.txt

# Run Development Server
.PHONY: run-dev
run-dev:
	@echo "Starting the development server..."
	uvicorn api.main:app --reload --port 8000

# Load Environment Variables
.PHONY: load-env
load-env:
	@cp .env.example .env
	@echo "Development environment file loaded!"
