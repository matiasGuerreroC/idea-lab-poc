from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import SoftwareFactoryState
from app.agents.prompts import TRIAGE_SYSTEM_PROMPT, TriageResult, PLANNER_SYSTEM_PROMPT, ProposedPlan, EXECUTOR_SYSTEM_PROMPT, REFLECTOR_SYSTEM_PROMPT, QAResult, CONSOLIDATOR_SYSTEM_PROMPT
from app.core.llm import get_llm
from app.core.config import settings

def triage_node(state: SoftwareFactoryState) -> dict:
    """
    Nodo de Triage. Evalúa la conversación actual para decidir si la idea
    del usuario está lo suficientemente clara o si requiere más preguntas.
    """
    # 1. Obtener el modelo asignado al Triage
    llm = get_llm(settings.TRIAGE_PROVIDER, settings.TRIAGE_MODEL)
    
    # 2. Forzar que el LLM responda estrictamente bajo el esquema Pydantic
    structured_llm = llm.with_structured_output(TriageResult)
    
    # 3. Obtener los mensajes de forma segura usando .get() para diccionarios
    existing_messages = state.get("messages", [])
    
    # 4. Preparar la entrada del modelo
    messages_payload = [SystemMessage(content=TRIAGE_SYSTEM_PROMPT)] + list(existing_messages)
    
    # 5. Invocar al modelo
    result: TriageResult = structured_llm.invoke(messages_payload)
    
    # 6. Crear el nuevo mensaje del asistente
    new_assistant_message = AIMessage(content=result.response_to_user)
    
    # 7. Retornar las actualizaciones del estado como diccionario
    return {
        "messages": [new_assistant_message],
        "is_ready_for_planning": result.is_ready_for_planning,
        "final_idea": result.final_idea_summary if result.is_ready_for_planning else None
    }


def planner_node(state: SoftwareFactoryState) -> dict:
    """
    Nodo de Planificación. Toma la idea estructurada final y genera
    un plan de tareas técnicas secuenciales.
    """
    llm = get_llm(settings.PLANNER_PROVIDER, settings.PLANNER_MODEL)

    structured_llm = llm.with_structured_output(ProposedPlan)

    final_idea = state.get("final_idea", "")

    messages_payload = [
        SystemMessage(content=PLANNER_SYSTEM_PROMPT),
        SystemMessage(content=f"Idea de negocio del usuario consolidada:\n{final_idea}")
    ]

    result: ProposedPlan = structured_llm.invoke(messages_payload)

    tasks_dict_list = [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": "pending",
            "deliverable": None
        }
        for task in result.tasks
    ]

    return {
        "proposed_plan": tasks_dict_list,
        "plan_approved": False
    }


def executor_node(state: SoftwareFactoryState) -> dict:
    """Ejecuta y genera el entregable técnico para la tarea actual."""
    llm = get_llm(settings.EXECUTOR_PROVIDER, settings.EXECUTOR_MODEL)

    tasks = state.get("tasks", [])
    idx = state.get("current_task_index", 0)

    if idx >= len(tasks):
        return {}

    current_task = tasks[idx]
    final_idea = state.get("final_idea", "")
    feedback = state.get("human_feedback", "")

    prompt = EXECUTOR_SYSTEM_PROMPT.format(
        final_idea=final_idea,
        task_title=current_task["title"],
        task_description=current_task["description"]
    )

    messages = [SystemMessage(content=prompt)]

    if feedback and feedback != "__APPROVED__":
        messages.append(SystemMessage(content=f"ATENCIÓN: Corrige el diseño considerando este feedback anterior: {feedback}"))

    response = llm.invoke(messages)

    updated_tasks = list(tasks)
    updated_tasks[idx] = {**current_task, "deliverable": response.content, "status": "in_progress"}

    return {
        "tasks": updated_tasks,
        "human_feedback": None
    }


def reflector_node(state: SoftwareFactoryState) -> dict:
    """Realiza control de calidad automatizado del entregable generado."""
    llm = get_llm(settings.EXECUTOR_PROVIDER, settings.EXECUTOR_MODEL)
    structured_llm = llm.with_structured_output(QAResult)

    tasks = state.get("tasks", [])
    idx = state.get("current_task_index", 0)
    current_task = tasks[idx]

    messages = [
        SystemMessage(content=REFLECTOR_SYSTEM_PROMPT),
        SystemMessage(content=f"Tarea a evaluar: {current_task['title']}\nEntregable generado:\n{current_task['deliverable']}")
    ]

    qa_result: QAResult = structured_llm.invoke(messages)

    if not qa_result.is_valid:
        return {
            "human_feedback": f"[QA IA RECHAZADO]: {qa_result.criticism}"
        }

    return {
        "human_feedback": None
    }


def consolidator_node(state: SoftwareFactoryState) -> dict:
    """Nodo de Consolidacion (Fase 4). Agrupa todos los entregables aprobados y genera un documento maestro."""
    llm = get_llm(settings.EXECUTOR_PROVIDER, settings.EXECUTOR_MODEL)

    tasks = state.get("tasks", [])
    final_idea = state.get("final_idea", "")

    deliverables_text = ""
    for task in tasks:
        deliverables_text += f"\n\n---\n## Tarea: {task['title']}\n"
        deliverables_text += f"Descripcion Original: {task['description']}\n\n"
        deliverables_text += f"Entregable Aprobado:\n{task.get('deliverable', 'No disponible.')}\n"

    prompt = CONSOLIDATOR_SYSTEM_PROMPT.format(
        final_idea=final_idea,
        approved_deliverables=deliverables_text
    )

    messages = [SystemMessage(content=prompt)]
    response = llm.invoke(messages)

    return {
        "final_specification": response.content
    }