from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.pipeline import FeatureUnion
from sklearn.preprocessing import FunctionTransformer, StandardScaler

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scorers.calibrator_features import extract_text_stats


DEFAULT_DATASET_URL = (
    "https://huggingface.co/datasets/chillies/IELTS-writing-task-2-evaluation/resolve/main/train.csv"
)


def round_half(values):
    return np.clip(np.round(np.asarray(values, dtype=float) * 2) / 2, 0, 9)


def build_training_text(frame: pd.DataFrame) -> pd.Series:
    prompt = frame["prompt"].fillna("").astype(str).str.strip()
    essay = frame["essay"].fillna("").astype(str).str.strip()
    return "Prompt: " + prompt + "\nEssay: " + essay


def make_model(alpha: float):
    return Pipeline(
        steps=[
            (
                "features",
                FeatureUnion(
                    [
                        (
                            "tfidf",
                            TfidfVectorizer(
                                lowercase=True,
                                ngram_range=(1, 2),
                                min_df=2,
                                max_features=12000,
                                strip_accents="unicode",
                            ),
                        ),
                        ("stats", FunctionTransformer(extract_text_stats, validate=False)),
                    ]
                ),
            ),
            ("scale", StandardScaler(with_mean=False)),
            ("ridge", Ridge(alpha=alpha)),
        ]
    )


def train(sample_size: int, dataset_url: str, output: Path, seed: int):
    frame = pd.read_csv(dataset_url, nrows=None if sample_size <= 0 else sample_size)
    frame = frame.dropna(subset=["essay", "band"])
    frame["band"] = pd.to_numeric(frame["band"], errors="coerce")
    frame = frame.dropna(subset=["band"])

    if len(frame) < 80:
        raise ValueError(f"Need at least 80 usable rows, got {len(frame)}.")

    x = build_training_text(frame)
    y = frame["band"].astype(float)

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=max(40, int(len(frame) * 0.2)),
        random_state=seed,
    )

    candidates = []
    for alpha in [4.0, 8.0, 16.0, 32.0, 64.0, 96.0, 128.0]:
        candidate = make_model(alpha)
        candidate.fit(x_train, y_train)
        raw_predictions = candidate.predict(x_test)
        rounded_predictions = round_half(raw_predictions)
        mae = float(mean_absolute_error(y_test, rounded_predictions))
        within_half = float(np.mean(np.abs(rounded_predictions - y_test.to_numpy()) <= 0.5))
        bias = float(np.mean(rounded_predictions - y_test.to_numpy()))
        candidates.append(
            {
                "alpha": alpha,
                "model": candidate,
                "metrics": {
                    "mae": mae,
                    "within_half": within_half,
                    "bias": bias,
                },
            }
        )

    best = min(candidates, key=lambda item: (item["metrics"]["mae"], abs(item["metrics"]["bias"])))
    model = best["model"]
    mae = best["metrics"]["mae"]
    within_half = best["metrics"]["within_half"]
    bias = best["metrics"]["bias"]

    output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": model,
            "sample_size": int(len(frame)),
            "train_size": int(len(x_train)),
            "test_size": int(len(x_test)),
            "dataset_url": dataset_url,
            "target_min": float(y.min()),
            "target_max": float(y.max()),
            "metrics": {
                "mae": mae,
                "within_half": within_half,
                "bias": bias,
            },
            "selected_alpha": best["alpha"],
            "candidates": [
                {
                    "alpha": item["alpha"],
                    "metrics": item["metrics"],
                }
                for item in candidates
            ],
        },
        output,
    )

    metadata = {
        "output": str(output),
        "sample_size": int(len(frame)),
        "train_size": int(len(x_train)),
        "test_size": int(len(x_test)),
        "dataset_url": dataset_url,
        "target_min": float(y.min()),
        "target_max": float(y.max()),
        "metrics": {
            "mae": round(mae, 4),
            "within_half": round(within_half, 4),
            "bias": round(bias, 4),
        },
        "selected_alpha": best["alpha"],
        "candidates": [
            {
                "alpha": item["alpha"],
                "metrics": {
                    "mae": round(item["metrics"]["mae"], 4),
                    "within_half": round(item["metrics"]["within_half"], 4),
                    "bias": round(item["metrics"]["bias"], 4),
                },
            }
            for item in candidates
        ],
    }
    output.with_suffix(".json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


def main():
    parser = argparse.ArgumentParser(description="Train a small IELTS writing band calibrator.")
    parser.add_argument("--sample-size", type=int, default=200, help="Use 0 or a negative value for all rows.")
    parser.add_argument("--dataset-url", default=DEFAULT_DATASET_URL)
    parser.add_argument("--output", default="data/writing-calibration/ielts_calibrator.joblib")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    metadata = train(args.sample_size, args.dataset_url, Path(args.output), args.seed)
    print(json.dumps(metadata, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
