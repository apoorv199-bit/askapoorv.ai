from pathlib import Path
from pypdf import PdfReader

def read_pdf(file_path: Path) -> str:
    """
    Reads a PDF file and extracts its text content.
    """

    if not file_path.exists():
        raise FileNotFoundError(f"The file {file_path} does not exist.")

    reader = PdfReader(str(file_path))
    extracted_pages: list[str] = []

    for index, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            extracted_pages.append(page_text)

    return "\n\n".join(extracted_pages)

def read_markdown(file_path: Path) -> str:
    """
    Reads a Markdown file and returns its content as a string.
    """

    if not file_path.exists():
        raise FileNotFoundError(f"The file {file_path} does not exist.")

    return file_path.read_text(encoding="utf-8").strip()

def load_all_context_documents(context_dir: Path) -> str:
    """
    Scans a directory for all .md and .txt files, reads them,
    and returns them concatenated with document labels.
    """

    if not context_dir.exists() or not context_dir.is_dir():
        return ""

    documents: list[str] = []
    for file_path in sorted(context_dir.glob("*")):
        if file_path.suffix.lower() in [".md", ".txt"]:
            content = read_markdown(file_path)
            if content:
                documents.append(f"--- Document: {file_path.name} ---\n{content}")

    return "\n\n".join(documents)