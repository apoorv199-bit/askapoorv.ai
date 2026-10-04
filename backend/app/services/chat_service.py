from groq import AsyncGroq

from app.core import settings
from app.schemas import Resume
from app.prompts import get_interview_system_prompt

async def ask_candidate(
        question: str,
        resume: Resume,
        extra_context: str = "",
        client: AsyncGroq | None = None,
) -> str:
    """
    Answers an interview question based on the candidate's profile and extra documents.
    Uses AsyncGroq for non-blocking asynchronous execution.
    """

    if client is None:
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    system_prompt = get_interview_system_prompt(
        candidate_profile_json=resume.model_dump_json(indent=2),
        extra_context=extra_context
    )

    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ]
    )

    answer = response.choices[0].message.content
    return answer or "I don't have enough information to answer that question."


async def stream_candidate_answer(
    question: str,
    resume: Resume,
    extra_context: str = "",
    client: AsyncGroq | None = None,
):
    """
    Streams an interview response token-by-token using Groq's stream=True.
    Yields chunks of text as soon as they are generated.
    """
    if client is None:
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    system_prompt = get_interview_system_prompt(
        candidate_profile_json=resume.model_dump_json(indent=2),
        extra_context=extra_context,
    )

    stream = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        stream=True,
    )

    async for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            yield content