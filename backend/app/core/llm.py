import time
import random
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_llm(provider: str, model_name: str, max_tokens: int = 4096):
    provider_lower = provider.lower()

    if provider_lower == "gemini":
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY no está configurada en las variables de entorno.")
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
            max_output_tokens=max_tokens,
        )

    elif provider_lower == "groq":
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY no está configurada en las variables de entorno.")
        return ChatGroq(
            model=model_name,
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.2,
            max_tokens=max_tokens,
        )

    else:
        raise ValueError(f"Proveedor '{provider}' no soportado. Usa 'gemini' o 'groq'.")


def invoke_with_retry(callable_fn, *args, max_retries=5, base_delay=1, max_delay=60, **kwargs):
    last_error = None
    for attempt in range(max_retries):
        try:
            return callable_fn(*args, **kwargs)
        except Exception as e:
            last_error = e
            error_str = str(e).lower()
            is_rate_limit = (
                "429" in error_str
                or "rate_limit" in error_str
                or "rate limit" in error_str
                or "resourceexhausted" in error_str.replace(" ", "")
                or "too many requests" in error_str
                or "quota" in error_str
            )
            if is_rate_limit and attempt < max_retries - 1:
                delay = min(base_delay * (2 ** attempt), max_delay)
                jitter = random.uniform(0, delay * 0.1)
                total_delay = delay + jitter
                logger.warning(
                    f"Rate limit alcanzado (intento {attempt + 1}/{max_retries}). "
                    f"Reintentando en {total_delay:.1f}s... Error: {e}"
                )
                time.sleep(total_delay)
                continue

            if not is_rate_limit:
                logger.error(f"Error NO rate limit en LLM (intento {attempt + 1}/{max_retries}): {e}")

            if attempt >= max_retries - 1:
                raise
    raise last_error if last_error else RuntimeError("invoke_with_retry: fallo inesperado")


class RetryLLMWrapper:
    def __init__(self, llm):
        self._llm = llm

    def invoke(self, *args, **kwargs):
        return invoke_with_retry(self._llm.invoke, *args, **kwargs)

    def with_structured_output(self, pydantic_schema):
        structured = self._llm.with_structured_output(pydantic_schema)
        return RetryStructuredWrapper(structured)


class RetryStructuredWrapper:
    def __init__(self, structured_llm):
        self._structured = structured_llm

    def invoke(self, *args, **kwargs):
        return invoke_with_retry(self._structured.invoke, *args, **kwargs)


def get_retry_llm(provider: str, model_name: str, max_tokens: int = 4096):
    llm = get_llm(provider, model_name, max_tokens)
    return RetryLLMWrapper(llm)


def get_default_llm():
    return get_retry_llm(settings.LLM_PROVIDER, settings.LLM_MODEL, settings.LLM_MAX_TOKENS)


def get_chat_llm():
    return get_retry_llm(settings.CHAT_PROVIDER, settings.CHAT_MODEL, settings.CHAT_MAX_TOKENS)
