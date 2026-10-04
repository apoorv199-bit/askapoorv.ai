# AskApoorv.ai 🚀
### Autonomous Candidate Intelligence Platform & Recruiter Copilot

**AskApoorv.ai** is a production-grade AI portfolio and candidate screening assistant. It combines an executive candidate dossier with an interactive, real-time AI copilot that answers technical, architectural, and culture-fit questions based on verified experience, projects, and documents.

---

## 🌟 Key Features

- **Executive Recruiter Dossier**:
  - Live availability status, key metrics (latency improvements, production bugs resolved, degree honors).
  - Interactive tabs for **Work Experience**, **Categorized Tech Skills**, **System Architecture Projects**, and **Academic Records**.
  - Formatted bullet-point achievements with automatic metric highlighting.
  - Direct **"Download Official Resume (PDF)"** endpoint.
- **AI Recruiter Copilot**:
  - Powered by **Groq Ultra-Fast LPU** with sub-second token-by-token streaming.
  - Strict zero-hallucination guardrails: answers strictly from verified experience.
  - One-click ATS / Recruiter Notes copy button.
  - Context-aware dynamic question chips (elevator pitch, architecture deep-dive, system metrics).
- **Production Architecture**:
  - **FastAPI** backend with asynchronous request lifecycle (`AsyncGroq`, `StreamingResponse`).
  - **Pydantic v2 & Pydantic Settings** data validation.
  - **Smart Ingestion Cache**: parses resumes once into structured JSON with incremental cache invalidation.
  - **Single Unified Container**: FastAPI serves both the REST API and the responsive web UI.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12+, FastAPI, Uvicorn, Pydantic v2, Pydantic-Settings
- **AI & LLM**: Groq SDK (`AsyncGroq`), Llama 3 / GPT-OSS models
- **Document Processing**: PyPDF, Pathlib
- **Frontend**: Modern ES6+ JavaScript (`ReadableStream`, `TextDecoder`), HTML5, CSS3 Glassmorphism
- **Package & Environment Manager**: [uv](https://github.com/astral-sh/uv)
- **Containerization**: Docker, Google Cloud Run, Render

---

## 📂 Project Architecture

```text
askapoorv-ai/
├── Dockerfile                  # Production container definition
├── .dockerignore               # Protects secrets & virtual environments
├── pyproject.toml              # Dependencies & project configuration
├── uv.lock                     # Deterministic dependency lockfile
│
├── frontend/                   # Interactive Recruiter UI
│   ├── index.html              # Split-pane layout & dossier components
│   ├── style.css               # Modern dark enterprise SaaS theme
│   └── app.js                  # Streaming reader & dynamic data binding
│
└── backend/
    ├── app/
    │   ├── main.py             # FastAPI entrypoint, lifespan & static mounting
    │   ├── api/                # API transport layer (v1 router, health, chat)
    │   ├── core/               # Pydantic settings & environment configuration
    │   ├── prompts/            # System & user interview persona prompts
    │   ├── schemas/            # Pydantic data contracts (Resume, ChatRequest)
    │   └── services/           # Async Groq client, parser & document loader
    │
    └── data/
        ├── resumes/            # Verified PDF resume source
        ├── context/            # Optional markdown / text project notes
        └── cached_resume.json  # Smart ingestion cache
```

---

## 🚀 Quickstart (Local Development)

### 1. Prerequisites
- Python 3.12+
- [uv](https://github.com/astral-sh/uv) (recommended) or `pip`

### 2. Setup Environment
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/askapoorv-ai.git
cd askapoorv-ai

# Copy environment template
cp .env.example .env
```

Add your Groq API key in `.env`:
```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

### 3. Install Dependencies & Run
```bash
# Sync dependencies
uv sync

# Launch the server
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

Open your browser to **`http://localhost:8000`** (or view the interactive Swagger docs at `http://localhost:8000/docs`).

---

## 🐳 Docker & Cloud Deployment

### Local Docker Run
```bash
docker build -t askapoorv .
docker run -p 8000:8000 -e GROQ_API_KEY="your_key" askapoorv
```

### Google Cloud Run Deployment
```bash
gcloud run deploy askapoorv \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GROQ_API_KEY="your_key",GROQ_MODEL="openai/gpt-oss-120b"
```

---

## 📄 License
MIT License. Created by [Apoorv Sahu](https://github.com/apoorvsahu).
