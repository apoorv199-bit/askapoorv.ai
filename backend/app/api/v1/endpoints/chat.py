from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from app.core import settings

from app.schemas import ChatRequest, ChatResponse, Resume
from app.api.deps import get_resume, get_extra_context
from app.services import ask_candidate, stream_candidate_answer

router = APIRouter()


@router.get("/profile", response_model=Resume)
async def get_candidate_profile(
    resume: Resume = Depends(get_resume),
) -> Resume:
    """
    Returns the parsed profile of the candidate for UI display.
    """
    return resume


@router.get("/resume-download")
async def download_resume():
    """
    Serves the original candidate PDF resume for direct recruiter download.
    """
    resume_file = settings.RESUME_DIR / "Apoorv_Resume.pdf"
    if not resume_file.exists():
        raise HTTPException(status_code=404, detail="Resume PDF file not found")
    return FileResponse(
        path=str(resume_file),
        filename="Apoorv_Sahu_Resume.pdf",
        media_type="application/pdf"
    )



@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    resume: Resume = Depends(get_resume),
    extra_context: str = Depends(get_extra_context),
) -> ChatResponse:
    """
    Receives an interview question, queries the candidate persona, and returns the answer.
    """
    answer = await ask_candidate(
        question=request.question,
        resume=resume,
        extra_context=extra_context,
    )
    return ChatResponse(answer=answer)


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    resume: Resume = Depends(get_resume),
    extra_context: str = Depends(get_extra_context),
):
    """
    Streams the interview response token-by-token for a real-time typing experience.
    """
    return StreamingResponse(
        stream_candidate_answer(
            question=request.question,
            resume=resume,
            extra_context=extra_context,
        ),
        media_type="text/plain",
    )


