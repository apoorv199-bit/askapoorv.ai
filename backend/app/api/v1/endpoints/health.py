from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Standard health check endpoint for monitoring, load balancers, and Docker.
    """
    return {"status": "ok", "service": "askapoorv"}