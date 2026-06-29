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
| 2. Planificación | ✅ Implementada | Una vez madura la idea, el agente Planner genera un plan de trabajo estructurado (3-4 tareas técnicas). El flujo se detiene (Gate 1) mostrando el plan al usuario para que lo apruebe o solicite cambios. |
| 3. Ejecución, Reflexión & Gate 2 | ✅ Implementada | Cada tarea del plan es ejecutada por el agente Executor (genera entregable técnico con diagramas Mermaid.js). El agente Reflector realiza control de calidad automatizado (QA). Si el QA falla, el executor re-ejecuta la tarea automáticamente. Si pasa, el flujo se detiene (Gate 2) para aprobación humana. El usuario puede aprobar la tarea (avanza a la siguiente) o rechazarla con feedback (re-ejecuta el executor). |
| 4. Consolidación & Entrega Final | ✅ Implementada | Al completar todas las tareas, el agente Consolidador unifica los entregables aprobados en un documento maestro "Especificación Técnica y Arquitectura de Software" con índice, resumen ejecutivo y diagramas Mermaid.js. El usuario puede visualizarlo y descargarlo como archivo .md. |

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

- **Endpoints:**
  - `POST /api/chat` — Interacción con el Triage Agent (solo triage, no ejecuta planner)
  - `POST /api/plan` — Generación del plan de trabajo (llamado separado para evitar timeouts)
  - `POST /api/approve-plan` — Aprobación o rechazo del plan propuesto (Gate 1)
  - `POST /api/approve-task` — Aprobación o rechazo del entregable de cada tarea (Gate 2); devuelve `final_specification` al completar el ciclo
- **Ruteo condicional:** El grafo decide automáticamente si pasar al planner, ejecutor, consolidador o seguir en triage según el estado
- **Interrupción HITL:** LangGraph se detiene después del planner y del reflector (`interrupt_after=["planner", "reflector"]`) hasta que el usuario apruebe
- **Bucle QA interno:** El agente Reflector valida cada entregable. Si el QA automatizado falla, el Executor re-ejecuta la tarea sin interrumpir al usuario
- **Consolidación final:** Al terminar todas las tareas, el agente Consolidador unifica los entregables en un documento maestro (`final_specification`)
- **Enrutamiento de modelos:** Cada agente (Triage, Planner, Executor) puede usar un proveedor y modelo diferente
- **Estado global:** `SoftwareFactoryState` (TypedDict) con campos:
  - `messages` — Historial de la conversación
  - `is_ready_for_planning` — Indica si la idea está madura
  - `final_idea` — Resumen técnico de la idea
  - `proposed_plan` — Lista de tareas del plan propuesto
  - `plan_approved` — Control de aprobación humana (Gate 1)
  - `tasks` — Lista oficial de tareas a ejecutar (copia del plan aprobado)
  - `current_task_index` — Índice de la tarea actual en ejecución
  - `human_feedback` — Feedback correctivo del humano o del reflector QA
  - `final_specification` — Documento maestro consolidado al finalizar todas las tareas (Fase 4)

### Frontend (`/frontend`)

| Componente | Tecnología | Función |
|------------|-----------|---------|
| Framework | Next.js 14 (App Router) | SPA con renderizado del lado del servidor |
| Estilos | Tailwind CSS v4 | Utility-first CSS con dark mode |
| Iconos | Lucide React | Iconografía moderna y ligera |
| Hook | `use-api-chat` | Lógica de estado, envío y reinicio del chat |

- **Chat interactivo:** Input multilínea, indicador de escritura, timestamps, mensajes de "Generando plan..." y "Generando entregable técnico..." con timeout de 120s
- **Aprobación de plan:** Sección de plan propuesto con tareas numeradas y botones de aprobar/solicitar cambios
- **Aprobación de entregable:** Cada tarea finalizada se muestra con renderizado Markdown + diagramas Mermaid.js. Botones de aprobar/rechazar tarea con textarea de feedback (Gate 2)
- **Renderizado Mermaid:** Componente `DeliverableView` que parsea el entregable Markdown, extrae bloques ` ```mermaid ` y los renderiza con la librería Mermaid.js; muestra el código raw en caso de error de sintaxis
- **Especificación final:** Al completar el ciclo, se muestra el documento maestro consolidado con botón de descarga (.md)
- **Panel de control:** Timeline de progreso (fase activa), plan de trabajo, resumen técnico, sidebar colapsable
- **Flujo en dos pasos:** Primero triage (`/api/chat`), luego planificación (`/api/plan`) para evitar timeouts del LLM
- **Toggle:** Cambio entre modo oscuro y claro
- **AbortController:** Manejo de errores de red y timeout con mensajes amigables

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
│   │   │   ├── graph.py          # Grafo LangGraph (5 nodos + 2 interrupts HITL)
│   │   │   ├── state.py          # SoftwareFactoryState (TypedDict)
│   │   │   ├── prompts.py        # Prompts y esquemas Pydantic (Triage, Planner, Executor, Reflector, QA, Consolidador)
│   │   │   └── nodes.py          # Lógica de nodos: triage, planner, executor, reflector, consolidator
│   │   ├── api/
│   │   │   └── routes.py         # Endpoints FastAPI (/chat, /plan, /approve-plan, /approve-task)
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
│   │   │   ├── chat-box.tsx          # Componente principal del chat
│   │   │   ├── chat-message.tsx      # Burbuja de mensaje con avatar
│   │   │   ├── dashboard.tsx         # Sidebar con timeline y resumen
│   │   │   └── deliverable-view.tsx   # Renderizador Markdown + Mermaid.js
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
- [x] Fase 2: Planner Agent con plan estructurado y Gate 1 de aprobación
- [x] Endpoints `/api/plan` y `/api/approve-plan` con interrupt HITL
- [x] UI de aprobación con tareas, botones de aprobar/rechazar y feedback
- [x] Timeout de 120s y flujo en dos pasos para evitar cortes del LLM
- [x] Fase 3: Executor Agent, Reflector QA, bucle de tareas y Gate 2 de aprobación
- [x] Renderizado de entregables con Markdown + diagramas Mermaid.js
- [x] Interrupción HITL en planner y reflector con reanudación automática
- [x] Fase 4: Consolidador que unifica entregables en especificación técnica final
- [x] Descarga de especificación técnica en formato .md
- [ ] Integración de base de datos PostgreSQL (Neon)
- [ ] Persistencia de proyectos e historial de sesiones
