from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.agents.graph import compiled_graph

router = APIRouter()


class ChatRequest(BaseModel):
    thread_id: str
    message: str


class PlanApprovalRequest(BaseModel):
    thread_id: str
    approve: bool
    feedback: Optional[str] = None


class TaskApprovalRequest(BaseModel):
    thread_id: str
    approve: bool
    feedback: Optional[str] = None


@router.post("/chat")
async def chat_with_triage(request: ChatRequest):
    try:
        config = {"configurable": {"thread_id": request.thread_id}}
        input_data = {"messages": [("user", request.message)]}
        final_state = compiled_graph.invoke(input_data, config=config)

        last_message = final_state["messages"][-1].content

        return {
            "response": last_message,
            "is_ready_for_planning": final_state.get("is_ready_for_planning", False),
            "final_idea": final_state.get("final_idea"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plan")
async def generate_plan(request: ChatRequest):
    try:
        config = {"configurable": {"thread_id": request.thread_id}}

        stored_state = compiled_graph.get_state(config)
        stored_messages = stored_state.values.get("messages", [])

        input_data = {
            "messages": list(stored_messages) + [("user", request.message)],
            "is_ready_for_planning": True,
        }

        final_state = compiled_graph.invoke(input_data, config=config)

        proposed_plan = final_state.get("proposed_plan")

        return {
            "proposed_plan": proposed_plan,
            "plan_approved": final_state.get("plan_approved", False),
            "waiting_for_approval": True,
            "final_idea": final_state.get("final_idea"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/approve-plan")
async def approve_plan(request: PlanApprovalRequest):
    try:
        config = {"configurable": {"thread_id": request.thread_id}}
        state = compiled_graph.get_state(config)

        if not state.values:
            raise HTTPException(status_code=404, detail="Estado de conversación no encontrado.")

        if request.approve:
            proposed = state.values.get("proposed_plan", [])
            compiled_graph.update_state(config, {
                "tasks": proposed,
                "current_task_index": 0,
                "plan_approved": True,
                "human_feedback": None
            })
            final_state_dict = compiled_graph.invoke(None, config=config)
        else:
            compiled_graph.update_state(config, {
                "human_feedback": request.feedback
            })
            final_state_dict = compiled_graph.invoke(None, config=config)

        return {
            "tasks": final_state_dict.get("tasks", []),
            "current_task_index": final_state_dict.get("current_task_index", 0),
            "final_specification": final_state_dict.get("final_specification"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/approve-task")
async def approve_task(request: TaskApprovalRequest):
    try:
        config = {"configurable": {"thread_id": request.thread_id}}
        state = compiled_graph.get_state(config)

        if not state.values:
            raise HTTPException(status_code=404, detail="Estado de conversación no encontrado.")

        idx = state.values.get("current_task_index", 0)
        tasks = state.values.get("tasks", [])

        if request.approve:
            updated_tasks = list(tasks)
            if idx < len(updated_tasks):
                updated_tasks[idx] = {**updated_tasks[idx], "status": "completed"}

            compiled_graph.update_state(config, {
                "tasks": updated_tasks,
                "current_task_index": idx + 1,
                "human_feedback": "__APPROVED__"
            })
            final_state_dict = compiled_graph.invoke(None, config=config)
        else:
            compiled_graph.update_state(config, {
                "human_feedback": request.feedback
            })
            final_state_dict = compiled_graph.invoke(None, config=config)

        return {
            "tasks": final_state_dict.get("tasks", []),
            "current_task_index": final_state_dict.get("current_task_index", 0),
            "final_specification": final_state_dict.get("final_specification"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
