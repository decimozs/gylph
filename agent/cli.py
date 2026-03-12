import json
import os
import sys
from pathlib import Path
from typing import TypedDict, Optional

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from prompt_loader import (
    FORMATTER_PROMPT,
    RANKING_PROMPT,
    AUDITOR_PROMPT,
)

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
HF_BASE_URL = os.getenv("HF_BASE_URL")
DEEPSEEK_MODEL = "deepseek-ai/DeepSeek-R1:novita"

if not HF_TOKEN or not HF_BASE_URL:
    raise ValueError("HF_TOKEN and HF_BASE_URL must be set in the .env file")

formatter_llm = ChatOpenAI(
    model=DEEPSEEK_MODEL,
    api_key=HF_TOKEN,
    base_url=HF_BASE_URL,
    temperature=0.0,
)

ranking_llm = ChatOpenAI(
    model=DEEPSEEK_MODEL,
    api_key=HF_TOKEN,
    base_url=HF_BASE_URL,
    temperature=0.0,
)

auditor_llm = ChatOpenAI(
    model=DEEPSEEK_MODEL,
    api_key=HF_TOKEN,
    base_url=HF_BASE_URL,
    temperature=0.0,
)


class AgentState(TypedDict):
    raw_ocr_text: str
    signature_score: Optional[float]
    signature_status: Optional[str]
    formatted_document: str
    ranking_result: str
    auditor_result: str


def formatter_agent_node(state: AgentState) -> AgentState:
    response = formatter_llm.invoke(
        [
            SystemMessage(content=FORMATTER_PROMPT),
            HumanMessage(content=state["raw_ocr_text"]),
        ]
    )
    return {"formatted_document": response.content}


def ranking_agent_node(state: AgentState) -> AgentState:
    response = ranking_llm.invoke(
        [
            SystemMessage(content=RANKING_PROMPT),
            HumanMessage(content=state["formatted_document"]),
        ]
    )
    return {"ranking_result": response.content}


def auditor_agent_node(state: AgentState) -> AgentState:
    ranking_data = state.get("ranking_result", "{}")
    signature_score = state.get("signature_score", 1.0)
    signature_status = state.get("signature_status", "authentic")

    auditor_input = f"""Signature Verification Results:
- Signature Status: {signature_status}
- Signature Similarity Score: {signature_score}

Medical Description Analysis:
{ranking_data}"""

    response = auditor_llm.invoke(
        [
            SystemMessage(content=AUDITOR_PROMPT),
            HumanMessage(content=auditor_input),
        ]
    )
    return {"auditor_result": response.content}


def parse_auditor_result(auditor_result: str) -> dict:
    try:
        json_start = auditor_result.find("{")
        json_end = auditor_result.rfind("}") + 1
        if json_start != -1 and json_end != 0:
            json_str = auditor_result[json_start:json_end]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass
    return {}


def print_report(state: AgentState) -> None:
    print("\n" + "=" * 60)
    print("MEDICAL FRAUD DETECTION REPORT")
    print("=" * 60)

    print("\n--- FORMATTED DOCUMENT ---")
    print(state["formatted_document"])

    print("\n--- RANKING ANALYSIS ---")
    print(state["ranking_result"])

    print("\n--- AUDITOR VERDICT ---")
    auditor_json = parse_auditor_result(state["auditor_result"])
    if auditor_json:
        print(json.dumps(auditor_json, indent=2))
    else:
        print(state["auditor_result"])

    print("\n" + "=" * 60)


def build_graph() -> StateGraph:
    builder = StateGraph(AgentState)

    builder.add_node("formatter", formatter_agent_node)
    builder.add_node("ranking", ranking_agent_node)
    builder.add_node("auditor", auditor_agent_node)

    builder.add_edge(START, "formatter")
    builder.add_edge("formatter", "ranking")
    builder.add_edge("ranking", "auditor")
    builder.add_edge("auditor", END)

    return builder.compile()


def run_cli() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Medical Fraud Detection Agent")
    parser.add_argument("--text", "-t", help="Raw OCR text input")
    parser.add_argument("--file", "-f", help="Path to file containing OCR text")
    parser.add_argument(
        "--signature-score",
        "-s",
        type=float,
        default=1.0,
        help="Signature similarity score (0.0-1.0)",
    )
    parser.add_argument(
        "--signature-status",
        "-st",
        default="authentic",
        choices=["authentic", "forged", "needs-review"],
        help="Signature status",
    )
    args = parser.parse_args()

    if args.file:
        raw_text = Path(args.file).read_text(encoding="utf-8").strip()
    elif args.text:
        raw_text = args.text
    else:
        print("=" * 60)
        print("Medical Fraud Detection Agent - CLI")
        print("=" * 60)
        print(
            "\nPaste your raw OCR text below (press Enter twice on empty line to submit):\n"
        )

        lines = []
        empty_count = 0
        while True:
            try:
                line = input()
                if line.strip() == "":
                    empty_count += 1
                    if empty_count >= 2:
                        break
                else:
                    empty_count = 0
                lines.append(line)
            except EOFError:
                break

        raw_text = "\n".join(lines).strip()

    if not raw_text:
        print("Error: No input provided. Use --text or --file argument.")
        sys.exit(1)

    print(f"\n[Input received: {len(raw_text)} characters]")

    if not (args.text or args.file):
        signature_input = input(
            "Enter signature similarity score (0.0-1.0) [default: 1.0]: "
        ).strip()
        signature_score = float(signature_input) if signature_input else 1.0

        signature_status_input = input(
            "Enter signature status (authentic/forged/needs-review) [default: authentic]: "
        ).strip()
        signature_status = (
            signature_status_input if signature_status_input else "authentic"
        )
    else:
        signature_score = args.signature_score
        signature_status = args.signature_status

    print(f"\n[Signature Score: {signature_score}, Status: {signature_status}]")
    print("\nProcessing...")

    graph = build_graph()

    result = graph.invoke(
        {
            "raw_ocr_text": raw_text,
            "signature_score": signature_score,
            "signature_status": signature_status,
        }
    )

    print_report(result)


if __name__ == "__main__":
    run_cli()
