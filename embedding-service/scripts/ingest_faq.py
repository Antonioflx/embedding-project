import asyncio
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.modules.mongo.connection import get_collection  # noqa: E402
from src.modules.embedding.client import embed  # noqa: E402

FAQ_PATH = Path(__file__).resolve().parent.parent / "data" / "faq.md"


def parse_sections(markdown_text: str) -> list[str]:
    # One chunk per "## " section (question + answer kept together).
    parts = re.split(r"(?=^## )", markdown_text, flags=re.MULTILINE)
    return [part.strip() for part in parts if part.strip().startswith("## ")]


async def main() -> None:
    text = FAQ_PATH.read_text(encoding="utf-8")
    sections = parse_sections(text)
    collection = get_collection()

    for i, section in enumerate(sections, start=1):
        vector = await embed(section)
        await collection.insert_one({"text": section, "embedding": vector})
        print(f"inserted chunk {i}/{len(sections)}")

    print(f"done: {len(sections)} chunks inserted into faq_chunks")


if __name__ == "__main__":
    asyncio.run(main())
