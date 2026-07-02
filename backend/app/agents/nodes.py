from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import SoftwareFactoryState
from app.agents.prompts import TRIAGE_SYSTEM_PROMPT, TriageResult, PLANNER_SYSTEM_PROMPT, ProposedPlan, EXECUTOR_SYSTEM_PROMPT, REFLECTOR_SYSTEM_PROMPT, QAResult, CONSOLIDATOR_SYSTEM_PROMPT
from app.core.llm import get_retry_llm
from app.core.config import settings


def safe_format(template: str, **kwargs) -> str:
    result = template
    for key, value in kwargs.items():
        result = result.replace("{" + key + "}", str(value) if value is not None else "")
    return result


def _get_work_llm(state: SoftwareFactoryState):
    provider = state.get("llm_provider", settings.LLM_PROVIDER)
    model = state.get("llm_model", settings.LLM_MODEL)
    return get_retry_llm(provider, model, settings.LLM_MAX_TOKENS)


def _get_chat_llm(state: SoftwareFactoryState):
    provider = state.get("llm_provider", settings.CHAT_PROVIDER)
    model = state.get("llm_model", settings.CHAT_MODEL)
    return get_retry_llm(provider, model, settings.CHAT_MAX_TOKENS)


def triage_node(state: SoftwareFactoryState) -> dict:
    existing_messages = state.get("messages", [])
    messages_payload = [SystemMessage(content=TRIAGE_SYSTEM_PROMPT)] + list(existing_messages)

    llm = _get_chat_llm(state)
    structured_llm = llm.with_structured_output(TriageResult)
    result: TriageResult = structured_llm.invoke(messages_payload)

    new_assistant_message = AIMessage(content=result.response_to_user)

    return {
        "messages": [new_assistant_message],
        "is_ready_for_planning": result.is_ready_for_planning,
        "final_idea": result.final_idea_summary if result.is_ready_for_planning else None
    }


def planner_node(state: SoftwareFactoryState) -> dict:
    final_idea = state.get("final_idea", "")
    feedback = state.get("human_feedback", "")

    messages_payload = [
        SystemMessage(content=PLANNER_SYSTEM_PROMPT),
        SystemMessage(content=f"Idea de negocio del usuario consolidada:\n{final_idea}")
    ]

    if feedback and feedback != "__APPROVED__":
        messages_payload.append(
            SystemMessage(content=f"FEEDBACK DEL USUARIO (incorpora este feedback en el nuevo plan):\n{feedback}")
        )

    llm = _get_work_llm(state)
    structured_llm = llm.with_structured_output(ProposedPlan)
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
        "plan_approved": False,
        "human_feedback": None
    }


def executor_node(state: SoftwareFactoryState) -> dict:
    tasks = state.get("tasks", [])
    idx = state.get("current_task_index", 0)

    if idx >= len(tasks):
        return {}

    current_task = tasks[idx]
    final_idea = state.get("final_idea", "")
    feedback = state.get("human_feedback", "")

    prompt = safe_format(
        EXECUTOR_SYSTEM_PROMPT,
        final_idea=final_idea,
        task_title=current_task["title"],
        task_description=current_task["description"]
    )

    messages = [SystemMessage(content=prompt)]

    if feedback and feedback != "__APPROVED__":
        messages.append(SystemMessage(content=f"ATENCIÓN: Corrige el diseño considerando este feedback anterior: {feedback}"))

    llm = _get_work_llm(state)
    response = llm.invoke(messages)

    updated_tasks = list(tasks)
    updated_tasks[idx] = {**current_task, "deliverable": response.content, "status": "in_progress"}

    return {
        "tasks": updated_tasks,
        "human_feedback": None
    }


def reflector_node(state: SoftwareFactoryState) -> dict:
    tasks = state.get("tasks", [])
    idx = state.get("current_task_index", 0)
    current_task = tasks[idx]

    messages = [
        SystemMessage(content=REFLECTOR_SYSTEM_PROMPT),
        SystemMessage(content=f"Tarea a evaluar: {current_task['title']}\nEntregable generado:\n{current_task['deliverable']}")
    ]

    llm = _get_work_llm(state)
    structured_llm = llm.with_structured_output(QAResult)
    qa_result: QAResult = structured_llm.invoke(messages)

    if not qa_result.is_valid:
        return {
            "human_feedback": f"[QA IA RECHAZADO]: {qa_result.criticism}"
        }

    return {
        "human_feedback": None
    }


def consolidator_node(state: SoftwareFactoryState) -> dict:
    tasks = state.get("tasks", [])
    final_idea = state.get("final_idea", "")

    deliverables_text = ""
    for task in tasks:
        deliverables_text += f"\n\n---\n## Tarea: {task['title']}\n"
        deliverables_text += f"Descripcion Original: {task['description']}\n\n"
        deliverables_text += f"Entregable Aprobado:\n{task.get('deliverable', 'No disponible.')}\n"

    prompt = safe_format(
        CONSOLIDATOR_SYSTEM_PROMPT,
        final_idea=final_idea,
        approved_deliverables=deliverables_text
    )

    messages = [SystemMessage(content=prompt)]
    llm = _get_work_llm(state)
    response = llm.invoke(messages)

    return {
        "final_specification": response.content
    }
