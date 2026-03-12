import os
from pathlib import Path

PROMPT_DIR = Path(__file__).parent / "prompt"


def load_prompt(filename: str) -> str:
    """Load a prompt from the prompt/ directory."""
    prompt_path = PROMPT_DIR / filename
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
    return prompt_path.read_text(encoding="utf-8")


def load_all_prompts() -> dict[str, str]:
    """Load all prompt files from the prompt/ directory."""
    prompts = {}
    for file in PROMPT_DIR.glob("*.md"):
        key = file.stem.replace("-agent-prompt", "").replace("-", "_")
        prompts[key] = load_prompt(file.name)
    return prompts


AUDITOR_PROMPT = load_prompt("auditor-agent-prompt.md")
FORMATTER_PROMPT = load_prompt("formatter-agent-prompt.md")
RANKING_PROMPT = load_prompt("ranking-agent-prompt.md")
