from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from app.agents.state import SoftwareFactoryState
from app.agents.nodes import triage_node, planner_node

# 1. Inicializar el constructor de grafos con el esquema de nuestro Estado
workflow = StateGraph(SoftwareFactoryState)

# 2. Registrar los nodos
workflow.add_node("triage", triage_node)
workflow.add_node("planner", planner_node)

# 3. Definir el punto de partida del flujo
workflow.set_entry_point("triage")

# 4. Transición condicional después del triage
def route_after_triage(state: SoftwareFactoryState):
    """Decide si continuar entrevistando o pasar al planificador."""
    if state.get("is_ready_for_planning", False):
        return "planner"
    return END

workflow.add_conditional_edges(
    "triage",
    route_after_triage,
    {
        "planner": "planner",
        "END": END
    }
)

# 5. Después de planificar, el grafo finaliza para la pausa humana
workflow.add_edge("planner", END)

# 6. Compilar el grafo con persistencia y pausa automática tras planificar
memory = MemorySaver()
compiled_graph = workflow.compile(
    checkpointer=memory,
    interrupt_after=["planner"]
)
