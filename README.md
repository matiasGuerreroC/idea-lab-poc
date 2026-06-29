# Idea Lab POC

Plataforma asistida por múltiples agentes inteligentes orientada a transformar ideas de software en propuestas de arquitectura técnica y planes de trabajo detallados.

---

## Visión General

El sistema opera bajo el concepto **Human-in-the-Loop (HITL)**, deteniéndose en puntos clave del proceso para que el usuario revise, ajuste o apruebe el progreso. No opera de manera 100% autónoma; cada fase critica requiere intervención humana antes de avanzar.

---

## Flujo de Operación

| Fase | Estado | Descripción |
|------|--------|-------------|
| 1. Triage & Entrevista | ✅ Implementada | Agente analiza la idea del usuario. Si falta información, inicia un chat interactivo para "aterrizar" la idea. Se valida que existan 3 pilares: propósito, audiencia y features clave. |
| 2. Planificación | 🔲 Pendiente | Una vez madura la idea, un agente genera un plan de trabajo. El flujo se detiene (Gate 1) esperando aprobación o solicitud de cambios del usuario. |
| 3. Ejecución & Reflexión | 🔲 Pendiente | Se desglosan tareas (arquitectura, modelo de datos, stack tecnológico). Un agente ejecutor diseña las soluciones y un agente Reflector las revisa antes de mostrarlas al usuario. |
| 4. Aprobación de Entregables | 🔲 Pendiente | Cada componente técnico se detiene (Gate 2) para aprobación humana definitiva. Los resultados se renderizan visualmente con diagramas Mermaid.js en un dashboard interactivo. |

---

## Arquitectura del Proyecto

Monorepositorio con dos componentes principales:

### Backend (`/backend`)

| Componente | Tecnología | Función |
|------------|-----------|---------|
| Framework | FastAPI + Uvicorn | Servidor HTTP y endpoints REST |
| Orquestación | LangGraph | Grafo de agentes con estado persistente |
| LLMs | LangChain | Abstracción unificada para múltiples proveedores |
| Persistencia | MemorySaver | Historial de conversaciones por `thread_id` |

- **Endpoint principal:** `POST /api/chat` — Interacción con el Triage Agent
- **Enrutamiento de modelos:** Cada agente (Triage, Planner, Executor) puede usar un proveedor y modelo diferente
- **Estado global:** `SoftwareFactoryState` (TypedDict) con campos `messages`, `is_ready_for_planning`, `final_idea`

### Frontend (`/frontend`)

| Componente | Tecnología | Función |
|------------|-----------|---------|
| Framework | Next.js 14 (App Router) | SPA con renderizado del lado del servidor |
| Estilos | Tailwind CSS v4 | Utility-first CSS con dark mode |
| Iconos | Lucide React | Iconografía moderna y ligera |
| Hook | `use-api-chat` | Lógica de estado, envío y reinicio del chat |

- **Chat interactivo:** Input multilínea, indicador de escritura, timestamps
- **Panel de control:** Timeline de progreso, resumen técnico, sidebar colapsable
- **Toggle:** Cambio entre modo oscuro y claro

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI 0.111.0, Uvicorn, Pydantic |
| Orquestación | LangGraph, LangChain Core |
| Frontend | Next.js 14, React 18, TypeScript |
| Estilos | Tailwind CSS v4, Lucide React |
| LLMs | Google Gemini (AI Studio), Groq |
| Base de Datos | PostgreSQL (Neon) — pendiente integración |

---

## Instalación y Ejecución

### Requisitos Previos

- Python 3.10+
- Node.js 18+
- API keys de Google AI Studio y/o Groq

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys

# Ejecutar servidor
uvicorn app.main:app --reload
```

El backend estará disponible en `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`.

---

## Variables de Entorno

Configurar en `backend/.env` (copiar desde `.env.example`):

| Variable | Descripción | Valores posibles |
|----------|-------------|------------------|
| `GEMINI_API_KEY` | API Key de Google AI Studio | — |
| `GROQ_API_KEY` | API Key de Groq | — |
| `TRIAGE_PROVIDER` | Proveedor para el agente de Triage | `gemini` / `groq` |
| `TRIAGE_MODEL` | Modelo para el agente de Triage | `gemini-2.5-flash`, etc. |
| `PLANNER_PROVIDER` | Proveedor para el agente de Planificación | `gemini` / `groq` |
| `PLANNER_MODEL` | Modelo para el agente de Planificación | `llama-3.3-70b-specdec`, etc. |
| `EXECUTOR_PROVIDER` | Proveedor para el agente de Ejecución | `gemini` / `groq` |
| `EXECUTOR_MODEL` | Modelo para el agente de Ejecución | `gemini-2.5-flash`, etc. |

---

## Estructura del Proyecto

```
idea-lab-poc/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── graph.py          # Grafo de LangGraph compilado
│   │   │   ├── state.py          # SoftwareFactoryState (TypedDict)
│   │   │   ├── prompts.py        # Prompts y esquemas Pydantic
│   │   │   └── nodes.py          # Lógica de cada nodo del grafo
│   │   ├── api/
│   │   │   └── routes.py         # Endpoints FastAPI (/chat)
│   │   ├── core/
│   │   │   ├── config.py         # Settings con Pydantic
│   │   │   ├── llm.py            # Factoría de LLMs (Gemini/Groq)
│   │   │   └── database.py       # Configuración de BD (pendiente)
│   │   └── main.py               # Punto de entrada FastAPI
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Layout global con meta tags
│   │   │   ├── globals.css       # Estilos Tailwind + variables CSS
│   │   │   ├── page.tsx          # Página principal (chat + dashboard)
│   │   │   └── project/[id]/     # Página de proyecto (placeholder)
│   │   ├── components/
│   │   │   ├── chat-box.tsx      # Componente principal del chat
│   │   │   ├── chat-message.tsx  # Burbuja de mensaje con avatar
│   │   │   ├── dashboard.tsx     # Sidebar con timeline y resumen
│   │   │   └── diagram.tsx       # Renderizador Mermaid (pendiente)
│   │   ├── hooks/
│   │   │   └── use-api-chat.ts   # Hook con lógica de estado
│   │   └── lib/
│   │       └── api.ts            # Utilidades de API (pendiente)
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## Roadmap

- [x] Fase 1: Triage Agent con chat interactivo y salida estructurada
- [x] UI profesional con Tailwind CSS, dark/light mode, timeline de progreso
- [x] Hook `use-api-chat` con manejo de estado y errores
- [x] Factoría de LLMs multi-proveedor (Gemini / Groq)
- [ ] Fase 2: Planner Agent con Gate 1 de aprobación
- [ ] Fase 3: Executor Agent con diagramas Mermaid.js
- [ ] Fase 4: Aprobación de entregables con Gate 2
- [ ] Integración de base de datos PostgreSQL (Neon)
- [ ] Persistencia de proyectos y historial
