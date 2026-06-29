from typing import Annotated, Optional
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class SoftwareFactoryState(TypedDict):
    """
    Estado global de la fábrica de software.
    """
    # El historial de mensajes se acumulará de manera automática usando add_messages
    messages: Annotated[list[BaseMessage], add_messages]
    
    # Booleano que indica si la fase de triage ha concluido con éxito
    is_ready_for_planning: bool
    
    # Resumen estructurado de la idea técnica listo para el Planner
    final_idea: Optional[str]

    # Plan de trabajo propuesto por el Planner Agent (lista de tareas)
    proposed_plan: Optional[list[dict]]

    # Indica si el usuario ha aprobado el plan (Gate 1)
    plan_approved: bool

    # Lista oficial de tareas a ejecutar (copia del plan aprobado)
    tasks: Optional[list[dict]]

    # Índice de la tarea actual en ejecución
    current_task_index: int

    # Feedback correctivo del humano o del reflector QA
    human_feedback: Optional[str]

    # Documento maestro consolidado al finalizar todas las tareas (Fase 4)
    final_specification: Optional[str]
