from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.agents.graph import compiled_graph

router = APIRouter()

class ChatRequest(BaseModel):
    thread_id: str
    message: str

class ApprovePlanRequest(BaseModel):
    thread_id: str
    approved: bool
    feedback: Optional[str] = None

@router.post("/chat")
async def chat_with_triage(request: ChatRequest):
    """
    Solo ejecuta el nodo de Triage. Nunca avanza al Planner.
    Si is_ready_for_planning=True, el frontend debe llamar a /api/plan.
    """
    try:
        config = {"configurable": {"thread_id": request.thread_id}}

        input_data = {
            "messages": [("user", request.message)]
        }

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
    """
    Ejecuta el nodo Planner. El frontend llama a este endpoint solo cuando
    is_ready_for_planning=True. El LLM del planner puede tardar.
    """
    try:
        config = {"configurable": {"thread_id": request.thread_id}}

        stored_state = compiled_graph.get_state(config)
        stored_messages = stored_state.values.get("messages", [])

        input_data = {
            "messages": [("user", request.message)],
            "is_ready_for_planning": True,
            "messages": stored_messages,
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
async def approve_plan(request: ApprovePlanRequest):
    try:
        config = {"configurable": {"thread_id": request.thread_id}}

        current_state = compiled_graph.get_state(config)

        if request.approved:
            updated_values = {
                "plan_approved": True,
                "messages": current_state.values.get("messages", [])
            }
            if request.feedback:
                from langchain_core.messages import AIMessage
                updated_values["messages"] = list(updated_values["messages"]) + [
                    AIMessage(content=f"Plan aprobado. Feedback adicional: {request.feedback}")
                ]

            compiled_graph.update_state(config, updated_values)
            compiled_graph.invoke(None, config)

            return {
                "approved": True,
                "message": "Plan aprobado. Avanzando a la fase de ejecución."
            }
        else:
            from langchain_core.messages import AIMessage
            current_messages = list(current_state.values.get("messages", []))

            reject_reason = request.feedback or "El usuario solicitó cambios. Revisando el plan."
            current_messages.append(
                AIMessage(content=f"Plan rechazado. El usuario solicita cambios: {reject_reason}")
            )

            compiled_graph.update_state(config, {
                "messages": current_messages,
                "is_ready_for_planning": False,
                "plan_approved": False,
                "proposed_plan": None
            })

            return {
                "approved": False,
                "message": f"Plan rechazado. Regresando a la fase de triage para ajustes: {reject_reason}"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
