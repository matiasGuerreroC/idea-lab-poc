from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import SoftwareFactoryState
from app.agents.prompts import TRIAGE_SYSTEM_PROMPT, TriageResult
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