from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from app.core.config import settings

def get_llm(provider: str, model_name: str):
    """
    Retorna la instancia del LLM configurado según el proveedor (Gemini o Groq)
    con una temperatura baja (0.2) para asegurar consistencia técnica.
    """
    provider_lower = provider.lower()
    
    if provider_lower == "gemini":
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY no está configurada en las variables de entorno.")
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2
        )
        
    elif provider_lower == "groq":
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY no está configurada en las variables de entorno.")
        return ChatGroq(
            model=model_name,
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.2
        )
        
    else:
        raise ValueError(f"Proveedor '{provider}' no soportado. Usa 'gemini' o 'groq'.")