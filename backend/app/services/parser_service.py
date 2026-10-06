import json
from pathlib import Path
from groq import Groq

from app.core import settings
from app.schemas import Resume
from app.prompts import get_parser_system_prompt, get_parser_user_prompt
from app.services.document_loader import read_pdf

def parse_resume_text(resume_text: str, client: Groq | None = None) -> Resume:
    """
    Sends raw resume text to Groq and parses it into a structured Resume object.
    """

    if client is None:
        client = Groq(api_key=settings.GROQ_API_KEY)

    resume_schema = json.dumps(Resume.model_json_schema(), indent=2)
    system_prompt = get_parser_system_prompt(resume_schema)
    user_prompt = get_parser_user_prompt(resume_text)

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
    )

    raw_output = response.choices[0].message.content
    if not raw_output:
        raise ValueError("Empty response received from LLM parser")

    return Resume.model_validate_json(raw_output)

def get_or_parse_resume(
        resume_path: Path,
        cache_path: Path | None = None,
        client: Groq | None = None,
        force_reparse: bool = False,
) -> Resume:
    """
    Loads resume from cache if available. If not or if outdated,
    reads PDF, extracts via LLM, and caches the result.
    """

    if cache_path is None:
        cache_path = settings.DATA_DIR / "cached_resume.json"

    # Check if cache exists and is newer than the resume PDF
    if not force_reparse and cache_path.exists():
        if resume_path.exists() and cache_path.stat().st_mtime >= resume_path.stat().st_mtime:
            print("Loading parsed resume from local cache...")
            return Resume.model_validate_json(cache_path.read_text())

    # Otherwise, extract from PDF and parse with LLM
    print("Parsing resume with Groq LLM (this may take a few seconds)...")
    resume_text = read_pdf(resume_path)
    resume = parse_resume_text(resume_text, client=client)

    # Save to cache
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(resume.model_dump_json(indent=2), encoding="utf-8")
    print(f"Resume successfully parsed and cached at: {cache_path}")
    
    return resume