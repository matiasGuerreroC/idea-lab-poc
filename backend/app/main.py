import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.core.config import settings

app = FastAPI(
    title="Idea Lab POC - Software Factory Backend",
    version="0.1.0",
    description="Backend de soporte para la fábrica de software asistida por agentes inteligentes con LangGraph."
)

# Permitir solicitudes CORS desde cualquier origen (necesario para Next.js localmente)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar las rutas bajo el prefijo /api
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "running", "project": "Idea Lab POC"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)