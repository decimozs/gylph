import os
from typing import TypedDict
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph
from langgraph.checkpoint.memory import InMemorySaver
from prompt_loader import (
    FORMATTER_PROMPT,
    RANKING_PROMPT,
    AUDITOR_PROMPT,
)

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
HF_BASE_URL = os.getenv("HF_BASE_URL")
MEDICAL_MODEL = "Intelligent-Internet/II-Medical-8B:featherless-ai"
DEEPSEEK_MODEL = "deepseek-ai/DeepSeek-R1:novita"

if not HF_TOKEN or not HF_BASE_URL:
    raise ValueError("HF_TOKEN and HF_BASE_URL must be set in the .env file")

medical_llm = ChatOpenAI(
    model=MEDICAL_MODEL,
    api_key="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",
    base_url=HF_BASE_URL,
    streaming=True,
)

deepseek_llm = ChatOpenAI(
    model=DEEPSEEK_MODEL,
    api_key="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",
    base_url=HF_BASE_URL,
    streaming=True,
)

checkpointer = InMemorySaver()


class AgentState(TypedDict):
    query: str
    formatter_agent_response: str
    fraud_agent_response: str
    ranking_agent_response: str
    auditor_agent_response: str


def formatter_agent_node(state: AgentState):
    response = deepseek_llm.invoke(
        [
            SystemMessage(content=FORMATTER_PROMPT),
            HumanMessage(content=state["query"]),
        ]
    )
    return {"formatter_agent_response": response.content}


def fraud_agent_node(state: AgentState):
    response = medical_llm.invoke(
        [
            SystemMessage(
                content="You are a Medical Fraud Auditor. Analyze the claim for non-medical jargon and untrained writing. Return a JSON with 'description_score' (0-1) and 'assessment"
            ),
            HumanMessage(content=state["formatter_agent_response"]),
        ]
    )
    return {"fraud_agent_response": response.content}


def ranking_agent_node(state: AgentState):
    response = deepseek_llm.invoke(
        [
            SystemMessage(content=RANKING_PROMPT),
            HumanMessage(content=state["fraud_agent_response"]),
        ]
    )
    return {"ranking_agent_response": response.content}


def auditor_agent_node(state: AgentState):
    response = deepseek_llm.invoke(
        [
            SystemMessage(content=AUDITOR_PROMPT),
            HumanMessage(content=state["ranking_agent_response"]),
        ]
    )
    return {"auditor_agent_response": response.content}


builder = StateGraph(AgentState)
builder.add_node("formatter", formatter_agent_node)
builder.add_node("fraud_detector", fraud_agent_node)
builder.add_node("ranking", ranking_agent_node)
builder.add_node("auditor", auditor_agent_node)

builder.add_edge(START, "formatter")
builder.add_edge("formatter", "fraud_detector")
builder.add_edge("fraud_detector", "ranking")
builder.add_edge("ranking", "auditor")
builder.add_edge("auditor", END)

agent = builder.compile(checkpointer=checkpointer)

if __name__ == "__main__":
    initial_state = AgentState(
        query="HEALTH MEDICAL CLAIM FORM\nPATIENT INFORMATION\nNAME: Maria Santos\nDATE: January 6, 2011\nADDRESS: Quezon City, Metro Manila\nPHILHEALTH ID NO: 12313215412312312\nICO-10 CODE: JOO\nACCREDITED HEALTHCARE PROVIDER: Tricity Medical Center\nCLAIM ID #2\nPROVIDER / FACILITY INFORMATION\nACREDITATION NO: 1235121333\nATTENDING:\nDr. Philip Mendez\nDESCRIPTION OF SERVICES:\nThe patient exhibited acute symptoms of viral rhinitis characterized by persistent\nnasal congestion and a non-productive cough. Clinical evaluation noted erythematous\ninflammation of the nasal mucosa, though pulmonary auscultation remained clear.\nTherapeutic intervention involved a regimen of antihistamines and antipyretics to address\nsystemic malaise and upper airway congestion.\nTOTAL CHARGES: 29,000 Pesos\nSIGNATURE OF ATTENDING PHYSICIAN\nиз\npma",
        fraud_agent_response="",
        formatter_agent_response="",
        ranking_agent_response="",
        auditor_agent_response="",
    )
    for chunk in agent.stream(initial_state, stream_mode="updates"):
        node, update = next(iter(chunk.items()))
        print(f"**{node}**: {update}")
        print("---")
