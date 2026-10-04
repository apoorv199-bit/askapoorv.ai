from fastapi import Request
from app.schemas import Resume

def get_resume(request: Request) -> Resume:
    """
    Dependency that extracts the pre-loaded Resume from application state.
    """
    resume: Resume | None = getattr(request.app.state, "resume", None)
    if resume is None:
        raise RuntimeError("Resume data has not been initialized in application state.")
    return resume

def get_extra_context(request: Request) -> str:
    """
    Dependency that extracts any extra markdown/text context from application state.
    """
    return getattr(request.app.state, "extra_context", "")