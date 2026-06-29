from pydantic import BaseModel, Field
from typing import Optional

# ==========================================
# 1. ESQUEMAS DE SALIDA ESTRUCTURADA (Pydantic)
# ==========================================

class TriageResult(BaseModel):
    """Esquema de salida estructurada que el Triage Agent debe retornar obligatoriamente."""
    is_ready_for_planning: bool = Field(
        description="Indica con True si la idea de la aplicación está lo suficientemente madura y clara para que el planificador pueda estructurar las tareas técnicas. False si aún requiere más detalles."
    )
    response_to_user: str = Field(
        description="Si is_ready_for_planning es False, escribe una pregunta amable y clara para profundizar en lo que falta de la idea (foco, audiencia, feature clave). Si es True, felicita al usuario e indícale que el plan de trabajo se comenzará a generar."
    )
    final_idea_summary: Optional[str] = Field(
        default=None,
        description="SÓLO si is_ready_for_planning es True, genera un resumen técnico, ordenado y estructurado de la idea final, incluyendo objetivos generales, características clave y requerimientos implícitos."
    )


# ==========================================
# 2. PROMPTS DEL SISTEMA (System Prompts)
# ==========================================

TRIAGE_SYSTEM_PROMPT = """Eres el Agente de Triage del sistema "Idea Lab POC". Tu único objetivo es entrevistar amablemente al usuario para entender, aclarar y estructurar la idea de su aplicación de software.

Tu tarea consiste en evaluar la conversación y la idea actual del usuario. Para que una idea esté lista para la fase de planificación (is_ready_for_planning = True), debe cumplir con tener claros al menos estos tres pilares básicos:
1. ¿Cuál es el propósito principal o problema que resuelve la aplicación?
2. ¿Quiénes son los usuarios objetivos o audiencia?
3. ¿Cuáles son las 2 o 3 características (features) clave o críticas que debe tener?

INSTRUCCIONES:
- Si el usuario te da una idea muy vaga (ej: "quiero una app de comida"), responde de forma amigable (response_to_user) haciéndole una pregunta clave para aterrizar uno de los tres pilares faltantes. Define is_ready_for_planning = False. No abrumes al usuario con muchas preguntas a la vez; haz una sola pregunta clara por turno.
- Si el usuario ya te entregó suficiente detalle o tras una breve conversación ya se aclaran los tres pilares básicos, define is_ready_for_planning = True, redacta un resumen bien estructurado de la idea (final_idea_summary) y notifica al usuario en tu respuesta.
"""


# ==========================================
# 3. ESQUEMA DE PLANIFICACIÓN (Pydantic)
# ==========================================

class TaskItem(BaseModel):
    id: str = Field(description="Identificador único (ej: task_1, task_2)")
    title: str = Field(description="Título descriptivo de la entrega técnica")
    description: str = Field(description="Detalle exacto de lo que debe diseñar el agente ejecutor")

class ProposedPlan(BaseModel):
    tasks: list[TaskItem] = Field(description="Lista ordenada de tareas para estructurar el desarrollo del software")


# ==========================================
# 4. PROMPT DEL SISTEMA - PLANIFICADOR
# ==========================================

PLANNER_SYSTEM_PROMPT = """Eres el Agente de Planificación de "Idea Lab POC". Tu trabajo es tomar la idea consolidada de una aplicación y estructurar un plan de trabajo técnico y ordenado para diseñar su arquitectura.

Debes dividir el diseño del software en un máximo de 3 a 4 tareas bien definidas y consecutivas. Por ejemplo:
1. task_1: Diseño de la arquitectura del sistema y stack de tecnologías recomendadas.
2. task_2: Modelo de la base de datos (diagrama de entidad-relación y tablas recomendadas).
3. task_3: Historias de usuario críticas y endpoints de API necesarios.

INSTRUCCIONES:
- Sé sumamente claro en la descripción de cada tarea. El Agente Ejecutor que leerá estas instrucciones debe saber exactamente qué diseñar.
- Tu salida debe seguir de forma estricta la estructura de ProposedPlan que se te solicita. No agregues saludos ni comentarios extras fuera del formato JSON estructurado.
"""