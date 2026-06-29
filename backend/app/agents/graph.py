from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from app.agents.state import SoftwareFactoryState
from app.agents.nodes import triage_node

# 1. Inicializar el constructor de grafos con el esquema de nuestro Estado
workflow = StateGraph(SoftwareFactoryState)

# 2. Registrar el nodo de triage
workflow.add_node("triage", triage_node)

# 3. Definir que el punto de partida del flujo siempre sea el triage
workflow.set_entry_point("triage")

# 4. Por ahora, en la Fase 1, después del triage el flujo siempre finaliza provisionalmente
# para esperar una nueva interacción o mensaje del usuario.
workflow.add_edge("triage", END)

# 5. Compilar el grafo usando persistencia en memoria temporal (Checkpointer)
# Esto nos permite aislar diferentes conversaciones usando un identificador único (thread_id).
memory = MemorySaver()
compiled_graph = workflow.compile(checkpointer=memory)