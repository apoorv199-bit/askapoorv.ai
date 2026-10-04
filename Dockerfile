FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /workspace

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-cache

COPY backend/ ./backend/
COPY frontend/ ./frontend/

ENV PYTHONPATH=/workspace/backend

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]