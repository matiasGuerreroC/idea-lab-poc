from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from app.agents.state import SoftwareFactoryState
from app.agents.nodes import triage_node, planner_node, executor_node, reflector_node, consolidator_node

workflow = StateGraph(SoftwareFactoryState)

workflow.add_node("triage", triage_node)
workflow.add_node("planner", planner_node)
workflow.add_node("executor", executor_node)
workflow.add_node("reflector", reflector_node)
workflow.add_node("consolidator", consolidator_node)

workflow.set_entry_point("triage")


def route_after_triage(state: SoftwareFactoryState):
    if state.get("is_ready_for_planning", False):
        return "planner"
    return END


def route_task_loop(state: SoftwareFactoryState):
    tasks = state.get("tasks", [])
    idx = state.get("current_task_index", 0)
    if idx >= len(tasks):
        return "consolidator"
    return "executor"


def route_after_reflector(state: SoftwareFactoryState):
    feedback = state.get("human_feedback")
    tasks = state.get("tasks", [])
    idx = state.get("current_task_index", 0)
    if feedback:
        if idx >= len(tasks):
            return "consolidator"
        return "executor"
    return END


workflow.add_conditional_edges("triage", route_after_triage)
workflow.add_conditional_edges("planner", route_task_loop, {"executor": "executor", "consolidator": "consolidator", END: END})

workflow.add_conditional_edges("executor", lambda x: "reflector", {"reflector": "reflector"})
workflow.add_conditional_edges("reflector", route_after_reflector, {"executor": "executor", "consolidator": "consolidator", END: END})

workflow.add_edge("consolidator", END)

memory = MemorySaver()
compiled_graph = workflow.compile(
    checkpointer=memory,
    interrupt_after=["planner", "reflector"]
)
