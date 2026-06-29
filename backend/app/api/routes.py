from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.graph import compiled_graph

router = APIRouter()

class ChatRequest(BaseModel):
    thread_id: str  # ID único de conversación/proyecto (ej: "proyecto_123")
    message: str    # Mensaje enviado por el usuario

@router.post("/chat")
async def chat_with_triage(request: ChatRequest):
    """
    Endpoint para interactuar en tiempo real con el Triage Agent.
    Mantiene el estado y el historial usando el thread_id provisto.
    """
    try:
        # 1. Configurar los metadatos de ejecución de LangGraph para identificar el hilo de conversación
        config = {"configurable": {"thread_id": request.thread_id}}
        
        # 2. Inyectar el mensaje del usuario en el estado actual del grafo
        input_data = {
            "messages": [("user", request.message)]
        }
        
        # 3. Ejecutar el grafo de agentes
        # .invoke() buscará el estado persistido para ese thread_id, añadirá el mensaje y correrá el flujo.
        final_state = compiled_graph.invoke(input_data, config=config)
        
        # 4. Extraer el último mensaje generado (que será la respuesta de nuestro agente)
        last_message = final_state["messages"][-1].content
        
        # 5. Responder al cliente con la respuesta del agente y si ya estamos listos para planificar
        return {
            "response": last_message,
            "is_ready_for_planning": final_state.get("is_ready_for_planning", False),
            "final_idea": final_state.get("final_idea")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))