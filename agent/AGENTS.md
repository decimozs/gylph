# Agent Guidelines for This Repository

## Project Overview

This is a Python project using LangGraph and LangChain for building LLM-powered agents. The project interacts with medical and reasoning LLMs through OpenAI-compatible APIs.

## Python Version

- **Required**: Python 3.12+
- Version file: `.python-version`

## Build & Dependency Management

### Installation
```bash
pip install -e .
# Or with uv (recommended for this project):
uv sync
```

### Dependencies
All dependencies are defined in `pyproject.toml`:
- `langgraph` - Agent workflow orchestration
- `langchain-core`, `langchain-openai`, `langchain-huggingface`, `langchain-ollama` - LLM integrations
- `python-dotenv` - Environment variable loading
- `huggingface-hub` - HuggingFace model access

## Running the Application

```bash
python main.py
```

Requires `HF_TOKEN` and `HF_BASE_URL` in `.env` file.

## Testing

No tests currently exist in this repository. When adding tests:

### Single Test Execution
```bash
# With pytest
pytest tests/test_file.py::test_function_name -v

# With pytest and verbose output
pytest -xvs test_file.py::TestClass::test_method

# Run a specific test file
pytest tests/test_file.py
```

### Running All Tests
```bash
pytest
# or
pytest .
```

### Test Configuration
- Use `pytest` as the test framework
- Place tests in a `tests/` directory
- Test files should be named `test_*.py`
- Test functions should be named `test_*`

## Code Style Guidelines

### Formatting
- Use **Black** for code formatting (line length: 88)
- Use **Ruff** for linting (includes isort, pyflakes, etc.)

### Import Organization
- Standard library imports first
- Third-party imports second
- Local/application imports third
- Separate each group with a blank line
- Use alphabetical ordering within groups

Example:
```python
import os
from typing import TypedDict

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
```

### Type Hints
- Use **TypedDict** for structured state types (e.g., `AgentState`)
- Use explicit type annotations for function parameters and return types
- Use `from typing import ...` for type hints

### Naming Conventions
- **Functions**: `snake_case` (e.g., `medical_llm_call`)
- **Classes**: `PascalCase` (e.g., `AgentState`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `HF_TOKEN`)
- **Variables**: `snake_case` (e.g., `medical_response`)

### Error Handling
- Use explicit exception types with descriptive messages
- Validate required environment variables at startup:
```python
if not HF_TOKEN or not HF_BASE_URL:
    raise ValueError("HF_TOKEN and HF_BASE_URL must be set in the .env file")
```

### General Practices
- Use `if __name__ == "__main__":` guard for executable scripts
- Use f-strings for string formatting
- Keep lines under 88 characters when possible
- Use descriptive variable and function names
- Add docstrings for public functions and classes

## Lint & Type Check Commands

```bash
# Format code with Black
black .

# Run Ruff linter
ruff check .

# Run Ruff with auto-fix
ruff check . --fix

# Type checking with mypy
mypy .
```

## Environment Variables

Create a `.env` file with the following:
```bash
HF_TOKEN=your_huggingface_token
HF_BASE_URL=your_api_base_url
```

## Project Structure

```
agent/
├── main.py           # Main application entry point
├── pyproject.toml    # Project configuration
├── .python-version   # Python version specification
├── .env              # Environment variables (do not commit)
└── .venv/            # Virtual environment (do not commit)
```

## Common Development Workflow

1. Activate virtual environment: `source .venv/bin/activate`
2. Install dependencies: `uv sync` or `pip install -e .`
3. Run the application: `python main.py`
4. Format code: `black . && ruff check . --fix`
5. Run tests: `pytest`
