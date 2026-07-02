from typing import Annotated, Optional
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class SoftwareFactoryState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    is_ready_for_planning: bool
    final_idea: Optional[str]
    proposed_plan: Optional[list[dict]]
    plan_approved: bool
    tasks: Optional[list[dict]]
    current_task_index: int
    human_feedback: Optional[str]
    final_specification: Optional[str]
    llm_provider: Optional[str]
    llm_model: Optional[str]
