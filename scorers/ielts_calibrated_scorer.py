import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

MODEL_PATH = Path(os.environ.get("WRITING_CALIBRATOR_PATH", "data/writing-calibration/ielts_calibrator.joblib"))


def round_half(value, lower=0, upper=9):
    return float(np.clip(np.round(float(value) * 2) / 2, lower, upper))


def main():
    payload = json.loads(sys.stdin.read() or "{}")
    prompt = str(payload.get("prompt", "")).strip()
    essay = str(payload.get("essay", "")).strip()
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Calibrator not found: {MODEL_PATH}")
    if len(essay) < 80:
        raise ValueError("Essay text is too short for calibration scoring.")

    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"]
    lower = float(bundle.get("target_min", 4.0))
    upper = float(bundle.get("target_max", 9.0))
    text = f"Prompt: {prompt}\nEssay: {essay}"
    raw = float(model.predict([text])[0])
    score = round_half(raw, lower, upper)
    metrics = bundle.get("metrics", {})
    result = {
        "overall": {
            "label": "Historical essay score reference",
            "band": score,
            "rawBand": round(raw, 3),
            "mae": metrics.get("mae"),
            "withinHalf": metrics.get("within_half"),
        }
    }
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
