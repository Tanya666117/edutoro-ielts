#!/usr/bin/env python3
"""Parse ielts_speaking.html into speaking-topics.json for the frontend."""

import json
import re
from pathlib import Path

HTML_PATH = Path(__file__).resolve().parent.parent / "data" / "ielts_speaking.html"
OUT_PATH = Path(__file__).resolve().parent.parent / "src" / "data" / "speaking-topics.json"

ICON_MAP = {
    "sports": "Trophy",
    "history": "Landmark",
    "films": "Film",
    "cinema": "Film",
    "building": "Building2",
    "evening": "Moon",
    "morning": "Sun",
    "singing": "Music",
    "clothing": "Shirt",
    "jokes": "Laugh",
    "headphones": "Headphones",
    "cars": "Car",
    "garden": "Trees",
    "park": "Trees",
    "science": "FlaskConical",
    "space": "Rocket",
    "star": "Rocket",
    "mirror": "Scan",
    "tidiness": "Sparkles",
    "website": "Globe",
    "watch": "Watch",
    "shopping": "ShoppingBag",
    "music": "Music2",
    "dream": "Star",
    "ambition": "Star",
    "social": "Share2",
    "teacher": "GraduationCap",
}


def slugify(title: str) -> str:
    base = re.sub(r"^\d+\.\s*", "", title).strip().lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    return base or "topic"


def guess_icon(title: str) -> str:
    lower = title.lower()
    for key, icon in ICON_MAP.items():
        if key in lower:
            return icon
    return "MessageCircle"


def parse_question(text: str) -> dict:
    text = text.strip()
    match = re.match(r"^(.*?)\s*\(([^)]+)\)\s*$", text, re.DOTALL)
    if match:
        return {"questionEn": match.group(1).strip(), "questionZh": match.group(2).strip()}
    return {"questionEn": text, "questionZh": ""}


def clean_answer(text: str) -> str:
    text = re.sub(r"\n*---+\n*$", "", text.strip())
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_html(html: str) -> list:
    topics = []
    topic_pattern = re.compile(
        r'<div class="topic-section" data-topic="(\d+)">\s*'
        r'<h2[^>]*>(.*?)</h2>(.*?)</div>\s*(?=<div class="topic-section"|</div>\s*</body>)',
        re.DOTALL,
    )
    qa_pattern = re.compile(
        r'<div class="qa-block" data-qa="([^"]+)">\s*'
        r'<div class="question">(.*?)</div>\s*'
        r'<div class="answer">(.*?)</div>\s*</div>',
        re.DOTALL,
    )

    for match in topic_pattern.finditer(html):
        topic_num = int(match.group(1))
        title_raw = re.sub(r"<[^>]+>", "", match.group(2)).strip()
        body = match.group(3)
        title_en = re.sub(r"^\d+\.\s*", "", title_raw).strip()
        topic_id = slugify(title_en)

        questions = []
        for qa in qa_pattern.finditer(body):
            q = parse_question(re.sub(r"<[^>]+>", "", qa.group(2)))
            questions.append(
                {
                    "id": qa.group(1),
                    **q,
                    "modelAnswerEn": clean_answer(re.sub(r"<[^>]+>", " ", qa.group(3))),
                }
            )

        topics.append(
            {
                "id": topic_id,
                "num": topic_num,
                "titleEn": title_en,
                "titleZh": "",
                "questionCount": len(questions),
                "icon": guess_icon(title_en),
                "questions": questions,
            }
        )

    return topics


def main() -> None:
    html = HTML_PATH.read_text(encoding="utf-8")
    topics = parse_html(html)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(topics, ensure_ascii=False, indent=2), encoding="utf-8")
    total_q = sum(t["questionCount"] for t in topics)
    print(f"Parsed {len(topics)} topics, {total_q} questions -> {OUT_PATH}")


if __name__ == "__main__":
    main()
