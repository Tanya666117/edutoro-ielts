import re

import numpy as np


WORD_RE = re.compile(r"[A-Za-z]+(?:[-'][A-Za-z]+)?")
SENTENCE_RE = re.compile(r"[.!?]+")


def extract_text_stats(texts):
    rows = []
    for value in texts:
        text = str(value or "")
        words = WORD_RE.findall(text)
        word_count = len(words)
        unique_words = len({word.lower() for word in words})
        sentence_count = max(1, len(SENTENCE_RE.findall(text)))
        paragraphs = [part for part in re.split(r"\n{2,}", text) if part.strip()]
        paragraph_count = max(1, len(paragraphs))
        avg_word_len = np.mean([len(word) for word in words]) if words else 0
        avg_sentence_len = word_count / sentence_count if sentence_count else 0
        lexical_diversity = unique_words / word_count if word_count else 0
        rows.append(
            [
                word_count,
                sentence_count,
                paragraph_count,
                avg_word_len,
                avg_sentence_len,
                lexical_diversity,
                text.count(","),
                text.count(";"),
                text.count(":"),
            ]
        )
    return np.asarray(rows, dtype=float)
