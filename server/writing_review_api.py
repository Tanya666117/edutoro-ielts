#!/usr/bin/env python3
"""HTTP API for IELTS writing review.

This server intentionally uses only Python standard-library modules so it can
run on a fresh Aliyun ECS instance without installing a web framework. It keeps
the API key on the server and exposes only /api/writing-review to the frontend.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parents[1]
PORT = int(os.getenv("PORT", "8787"))
MAX_BODY_BYTES = 180_000

SCORE_CALIBRATION = """
校准参考来自项目本地《雅思写作官方题库范文大全》抽样：
- 8 分范文通常结构非常清晰，双方/利弊型题目能完整覆盖任务，论证展开充足，段落推进自然，词汇和句式较丰富，错误少且不影响表达。
- 7 分范文通常任务回应充分，主体段理由明确，有一定展开和概括能力，但表达可能更模板化，论证深度或语言灵活性略弱于 8 分。
- 评分必须保守：不要因为少量高级词给高分，也不要只因语法错误扣光分。按 IELTS Writing 四项标准综合判断，并给 0.5 分档。
"""

SYSTEM_PROMPT = f"""
你是资深 IELTS Academic Writing 批改老师，熟悉 Task 1 和 Task 2 官方评分标准。
你的目标是给中国雅思考生提供可执行的作文批改、润色和保守分数判断。

必须遵守：
1. 分数只输出 0-9 的 IELTS band，可用 .5，且所有分数旁必须提醒“仅供参考”。
2. 准确性优先。按 Task Response/Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy 四项分别评分，再给总分。总分按四项平均后接近的 0.5 档，但可以因严重跑题、字数不足、背模板、Task 1 数据缺失而保守下调。
3. 不要虚构题目要求；如果用户未提供题目，要在 warnings 里说明评分可靠性下降。
4. 批注必须针对原文中的具体短语或句子，original 必须尽量逐字来自学生原文，revision 给出更自然的改法，reason 用中文解释。
5. polishedEssay 写一篇可参考的 8 分版，不能离题，保持考场作文风格，不要过度学术化。
6. 只返回 JSON，不要 Markdown，不要解释 JSON 外的内容。

{SCORE_CALIBRATION}
"""


class ApiError(Exception):
    def __init__(self, message: str, status: int = 500):
        super().__init__(message)
        self.status = status


def load_dotenv() -> None:
    env_path = ROOT_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"'")
        os.environ.setdefault(key, value)


def clean_text(value: Any, max_length: int = 24_000) -> str:
    text = str(value or "")
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()[:max_length]


def count_english_words(value: str) -> int:
    return len(re.findall(r"[A-Za-z]+(?:[-'][A-Za-z]+)*", value))


def validate_input(raw: dict[str, Any]) -> tuple[list[str], list[str], dict[str, Any]]:
    errors: list[str] = []
    warnings: list[str] = []
    task_type = "Task 1" if raw.get("taskType") == "Task 1" else "Task 2"
    prompt = clean_text(raw.get("prompt"), 4_000)
    essay = clean_text(raw.get("essay"), 24_000)
    word_count = count_english_words(essay)

    if len(prompt) < 20:
        warnings.append("题目过短或未提供，跑题/任务回应评分可靠性会下降。")
    if len(essay) < 80:
        errors.append("请至少提交 80 个字符以上的作文原文。")
    if word_count < 120:
        warnings.append(f"当前约 {word_count} words，明显短于 IELTS 建议字数，评分会保守。")
    if task_type == "Task 2" and 0 < word_count < 250:
        warnings.append("Task 2 少于 250 words，Task Response 可能被扣分。")
    if task_type == "Task 1" and 0 < word_count < 150:
        warnings.append("Task 1 少于 150 words，Task Achievement 可能被扣分。")
    if re.search(r"[\u4e00-\u9fff]", essay):
        warnings.append("作文原文包含中文字符，请确认是否误粘贴中文说明。")
    if not re.search(r"[.!?]", essay):
        warnings.append("原文缺少明显英文句末标点，可能影响语法和连贯性判断。")

    clean = {"taskType": task_type, "prompt": prompt, "essay": essay, "wordCount": word_count}
    return errors, warnings, clean


def build_user_prompt(input_data: dict[str, Any]) -> str:
    local_calibration = input_data.get("localCalibration")
    calibration_text = (
        "\nLocal calibrator trained on IELTS dataset sample, for calibration only:\n"
        + json.dumps(local_calibration, ensure_ascii=False, indent=2)
        + "\n"
        if local_calibration
        else "\nLocal calibrator unavailable.\n"
    )

    return f"""
请批改这篇 IELTS {input_data.get("taskType") or "Writing"} 作文。

题目（必须作为评分依据，必须判断是否跑题/回应充分）：
{input_data.get("prompt") or "用户未提供题目"}

学生原文：
{input_data.get("essay") or ""}

{calibration_text}

请返回以下 JSON 结构：
{{
  "summary": "一句话总体判断",
  "overallBand": 6.5,
  "taskPromptUsed": "复述你用于评分的题目；如果未提供题目，写未提供",
  "calibrationReference": null,
  "criteria": {{
    "taskResponse": {{"band": 6.5, "comment": "中文说明"}},
    "coherenceCohesion": {{"band": 6.5, "comment": "中文说明"}},
    "lexicalResource": {{"band": 6.5, "comment": "中文说明"}},
    "grammar": {{"band": 6.5, "comment": "中文说明"}}
  }},
  "annotations": [
    {{
      "original": "原文短语或句子",
      "revision": "建议改法",
      "issueType": "Task Response | Coherence | Vocabulary | Grammar | Style",
      "severity": "high | medium | low",
      "reason": "中文解释"
    }}
  ],
  "recommendations": ["3-6 条中文建议"],
  "warnings": ["影响评分可靠性的提醒，没有则空数组"],
  "polishedEssay": "8 分版参考作文"
}}

注意：如果本地校准器与 IELTS 规则判断冲突，以 IELTS 四项标准和题目回应为准；但需要在 warnings 中说明可能存在分歧。
"""


def run_local_calibrator(prompt: str, essay: str) -> dict[str, Any] | None:
    if os.getenv("USE_LOCAL_CALIBRATOR") != "true":
        return None

    script = ROOT_DIR / "scorers" / "ielts_calibrated_scorer.py"
    if not script.exists():
        return None

    try:
        completed = subprocess.run(
            [sys.executable, str(script)],
            cwd=ROOT_DIR,
            input=json.dumps({"prompt": prompt, "essay": essay}, ensure_ascii=False),
            text=True,
            capture_output=True,
            timeout=15,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return {"unavailable": True, "reason": "Local calibrator timed out."}

    if completed.returncode != 0:
        return {"unavailable": True, "reason": completed.stderr.strip() or f"Local calibrator exited with code {completed.returncode}."}

    try:
        return json.loads(completed.stdout)
    except json.JSONDecodeError:
        return {"unavailable": True, "reason": "Local calibrator returned invalid JSON."}


def parse_model_json(content: str) -> dict[str, Any]:
    clean = re.sub(r"^```(?:json)?\s*", "", content.strip(), flags=re.I)
    clean = re.sub(r"\s*```$", "", clean, flags=re.I)
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", clean)
        if not match:
            raise ApiError("模型没有返回可解析的 JSON。", 502)
        return json.loads(match.group(0))


def normalize_band_value(value: Any) -> Any:
    if isinstance(value, (int, float)):
        return value
    match = re.search(r"\d+(?:\.\d+)?", str(value or ""))
    return float(match.group(0)) if match else value


def normalize_review_result(result: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(result)
    normalized["overallBand"] = normalize_band_value(normalized.get("overallBand"))
    criteria = normalized.get("criteria")
    if isinstance(criteria, dict):
        for item in criteria.values():
            if isinstance(item, dict) and "band" in item:
                item["band"] = normalize_band_value(item.get("band"))
    return normalized


def resolve_model() -> str:
    return os.getenv("DEEPSEEK_MODEL") or os.getenv("MODEL_NAME") or "deepseek-chat"


def review_writing(input_data: dict[str, Any]) -> dict[str, Any]:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or "your_" in api_key:
        raise ApiError("DEEPSEEK_API_KEY 尚未配置。请在服务器环境变量或 .env 中填写后再试。", 500)

    api_base = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com").rstrip("/")
    payload = {
        "model": resolve_model(),
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(input_data)},
        ],
        "stream": False,
        "temperature": 0.2,
        "max_tokens": 7000,
        "response_format": {"type": "json_object"},
    }
    request = urllib.request.Request(
        f"{api_base}/chat/completions",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        message = f"DeepSeek 请求失败：HTTP {error.code}"
        try:
            error_payload = json.loads(error.read().decode("utf-8"))
            message = error_payload.get("error", {}).get("message") or message
        except Exception:
            pass
        raise ApiError(message, error.code)
    except urllib.error.URLError as error:
        raise ApiError(f"无法连接大模型服务：{error.reason}", 502)
    except TimeoutError:
        raise ApiError("大模型请求超时，请稍后重试。", 504)

    content = response_payload.get("choices", [{}])[0].get("message", {}).get("content")
    if not content:
        raise ApiError("模型未返回批改内容。", 502)

    result = normalize_review_result(parse_model_json(content))
    result["taskPromptUsed"] = result.get("taskPromptUsed") or input_data.get("prompt") or "未提供"
    result["calibrationReference"] = input_data.get("localCalibration") or None
    result["inputWarnings"] = input_data.get("inputWarnings") or []
    result["cleanedWordCount"] = input_data.get("wordCount")
    return result


def allowed_origin(origin: str | None) -> str:
    configured = [item.strip() for item in os.getenv("ALLOWED_ORIGINS", "").split(",") if item.strip()]
    if not configured:
        return origin or "*"
    if origin in configured:
        return origin
    return configured[0]


class WritingReviewHandler(BaseHTTPRequestHandler):
    server_version = "EdutoroWritingReview/1.0"

    def end_headers(self) -> None:
        origin = self.headers.get("Origin")
        self.send_header("Access-Control-Allow-Origin", allowed_origin(origin))
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stderr.write("%s - - [%s] %s\n" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def send_json(self, status: int, payload: dict[str, Any] | None = None) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        if status != HTTPStatus.NO_CONTENT:
            self.wfile.write(json.dumps(payload or {}, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self) -> None:
        self.send_json(HTTPStatus.NO_CONTENT)

    def do_GET(self) -> None:
        if self.path == "/healthz":
            self.send_json(HTTPStatus.OK, {"ok": True})
            return
        self.send_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})

    def do_POST(self) -> None:
        if self.path != "/api/writing-review":
            self.send_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length") or "0")
            if length > MAX_BODY_BYTES:
                raise ApiError("作文内容过长，请控制在约 12000 字以内。", 413)

            raw_body = self.rfile.read(length).decode("utf-8")
            raw_input = json.loads(raw_body or "{}")
            errors, warnings, clean = validate_input(raw_input)
            if errors:
                raise ApiError("；".join(errors), 400)

            local_calibration = run_local_calibrator(clean["prompt"], clean["essay"])
            result = review_writing({**clean, "localCalibration": local_calibration, "inputWarnings": warnings})
            result["warnings"] = list(dict.fromkeys([*(warnings or []), *(result.get("warnings") or [])]))
            self.send_json(HTTPStatus.OK, result)
        except json.JSONDecodeError:
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "请求体不是合法 JSON。"})
        except ApiError as error:
            self.send_json(error.status, {"error": str(error)})
        except Exception as error:
            self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(error) or "批改失败，请稍后重试。"})


def main() -> None:
    load_dotenv()
    host = os.getenv("HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, PORT), WritingReviewHandler)
    print(f"Writing review API running at http://{host}:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
