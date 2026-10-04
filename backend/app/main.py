from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from app.core import settings
from app.api.v1.api import api_router
from app.services import get_or_parse_resume, load_all_context_documents

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events: code before 'yield' runs on server startup,
    and code after 'yield' runs on server shutdown.
    """
    print("\n" + "=" * 50)
    print("Starting up AskApoorv.ai Backend...")

    # Ingest and parse candidate resume (cached or fresh)
    resume_file = settings.RESUME_DIR / "Apoorv_Resume.pdf"
    if resume_file.exists():
        app.state.resume = get_or_parse_resume(resume_file)
        print(f"Loaded Profile for: {app.state.resume.name}")
    else:
        print(f"Warning: Resume file not found at {resume_file}")
        app.state.resume = None

    # Ingest any extra markdown / text context
    app.state.extra_context = load_all_context_documents(settings.CONTEXT_DIR)
    if app.state.extra_context:
        print("Loaded additional context documents from data/context/")

    print("Startup complete! Ready for questions.")
    print("=" * 50 + "\n")

    yield

    print("Shutting down AskApoorv.ai...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve Frontend directly from root /
if settings.FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(settings.FRONTEND_DIR), html=True), name="frontend")