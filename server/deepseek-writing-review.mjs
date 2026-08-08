import http from 'node:http'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

loadDotEnv()

const PORT = Number(process.env.PORT || 8787)

const SCORE_CALIBRATION = `
校准参考来自项目本地《雅思写作官方题库范文大全》抽样：
- 8 分范文通常结构非常清晰，双方/利弊型题目能完整覆盖任务，论证展开充足，段落推进自然，词汇和句式较丰富，错误少且不影响表达。
- 7 分范文通常任务回应充分，主体段理由明确，有一定展开和概括能力，但表达可能更模板化，论证深度或语言灵活性略弱于 8 分。
- 评分必须保守：不要因为少量高级词给高分，也不要只因语法错误扣光分。按 IELTS Writing 四项标准综合判断，并给 0.5 分档。
`

const SYSTEM_PROMPT = `
你是资深 IELTS Academic Writing 批改老师，熟悉 Task 1 和 Task 2 官方评分标准。
你的目标是给中国雅思考生提供可执行的作文批改、润色和保守分数判断。

必须遵守：
1. 分数只输出 0-9 的 IELTS band，可用 .5，且所有分数旁必须提醒“仅供参考”。
2. 准确性优先。按 Task Response/Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy 四项分别评分，再给总分。总分按四项平均后接近的 0.5 档，但可以因严重跑题、字数不足、背模板、Task 1 数据缺失而保守下调。
3. 不要虚构题目要求；如果用户未提供题目，要在 warnings 里说明评分可靠性下降。
4. 批注必须针对原文中的具体短语或句子，original 必须尽量逐字来自学生原文，revision 给出更自然的改法，reason 用中文解释。
5. polishedEssay 写一篇可参考的 8 分版，不能离题，保持考场作文风格，不要过度学术化。
6. 只返回 JSON，不要 Markdown，不要解释 JSON 外的内容。

${SCORE_CALIBRATION}
`

function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(status === 204 ? undefined : JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 180_000) {
        req.destroy()
        reject(new Error('作文内容过长，请控制在约 12000 字以内。'))
      }
    })
    req.on('end', () => resolveBody(body))
    req.on('error', reject)
  })
}

function buildUserPrompt(input) {
  const localCalibration = input.localCalibration
    ? `\nLocal calibrator trained on IELTS dataset sample, for calibration only:\n${JSON.stringify(input.localCalibration, null, 2)}\n`
    : '\nLocal calibrator unavailable.\n'
  const chartText = input.taskType === 'Task 1' && input.chartContext
    ? `\nTask 1 chart key nodes (use only these facts for the overview and comparisons; do not invent data):\n${input.chartContext}\n`
    : ''

  return `
请批改这篇 IELTS ${input.taskType || 'Writing'} 作文。

题目（必须作为评分依据，必须判断是否跑题/回应充分）：
${input.prompt || '用户未提供题目'}

学生原文：
${input.essay}

${chartText}

${localCalibration}

请返回以下 JSON 结构：
{
  "summary": "一句话总体判断",
  "overallBand": 6.5,
  "taskPromptUsed": "复述你用于评分的题目；如果未提供题目，写未提供",
  "calibrationReference": null,
  "criteria": {
    "taskResponse": {"band": 6.5, "comment": "中文说明"},
    "coherenceCohesion": {"band": 6.5, "comment": "中文说明"},
    "lexicalResource": {"band": 6.5, "comment": "中文说明"},
    "grammar": {"band": 6.5, "comment": "中文说明"}
  },
  "annotations": [
    {
      "original": "原文短语或句子",
      "revision": "建议改法",
      "issueType": "Task Response | Coherence | Vocabulary | Grammar | Style",
      "severity": "high | medium | low",
      "reason": "中文解释"
    }
  ],
  "recommendations": ["3-6 条中文建议"],
  "warnings": ["影响评分可靠性的提醒，没有则空数组"],
  "polishedEssay": "8 分版参考作文"
}

注意：如果本地校准器与 IELTS 规则判断冲突，以 IELTS 四项标准和题目回应为准；但需要在 warnings 中说明可能存在分歧。
`
}

function cleanText(value, options = {}) {
  const maxLength = options.maxLength || 24_000
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function countEnglishWords(value) {
  return (value.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || []).length
}

function validateInput(input) {
  const errors = []
  const warnings = []
  const taskType = input.taskType === 'Task 1' ? 'Task 1' : 'Task 2'
  const prompt = cleanText(input.prompt, { maxLength: 4000 })
  const essay = cleanText(input.essay, { maxLength: 24_000 })
  const chartContext = cleanText(input.chartContext, { maxLength: 6000 })
  const wordCount = countEnglishWords(essay)

  if (prompt.length < 20) warnings.push('题目过短或未提供，跑题/任务回应评分可靠性会下降。')
  if (essay.length < 80) errors.push('请至少提交 80 个字符以上的作文原文。')
  if (wordCount < 120) warnings.push(`当前约 ${wordCount} words，明显短于 IELTS 建议字数，评分会保守。`)
  if (taskType === 'Task 2' && wordCount > 0 && wordCount < 250) {
    warnings.push('Task 2 少于 250 words，Task Response 可能被扣分。')
  }
  if (taskType === 'Task 1' && wordCount > 0 && wordCount < 150) {
    warnings.push('Task 1 少于 150 words，Task Achievement 可能被扣分。')
  }
  if (/[\u4e00-\u9fff]/.test(essay)) warnings.push('作文原文包含中文字符，请确认是否误粘贴中文说明。')
  if (!/[.!?]/.test(essay)) warnings.push('原文缺少明显英文句末标点，可能影响语法和连贯性判断。')

  return { errors, warnings, clean: { taskType, prompt, essay, wordCount, chartContext } }
}

function resolveDeepSeekModel() {
  const explicit = process.env.DEEPSEEK_MODEL
  if (explicit) return explicit
  return explicit || 'deepseek-chat'
}

function runLocalCalibrator(prompt, essay) {
  if (process.env.USE_LOCAL_CALIBRATOR !== 'true') return Promise.resolve(null)
  const script = resolve(process.cwd(), 'scorers/ielts_calibrated_scorer.py')
  if (!existsSync(script)) return Promise.resolve(null)

  return new Promise((resolveScore) => {
    const child = spawn('python', [script], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      resolveScore({ unavailable: true, reason: 'Local calibrator timed out.' })
    }, 15_000)

    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('close', (code) => {
      clearTimeout(timeout)
      if (code !== 0) {
        resolveScore({ unavailable: true, reason: stderr.trim() || `Local calibrator exited with code ${code}.` })
        return
      }
      try {
        resolveScore(JSON.parse(stdout))
      } catch {
        resolveScore({ unavailable: true, reason: 'Local calibrator returned invalid JSON.' })
      }
    })

    child.stdin.end(JSON.stringify({ prompt, essay }))
  })
}

function parseModelJson(content) {
  const clean = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('模型没有返回可解析的 JSON。')
    return JSON.parse(match[0])
  }
}

function normalizeBandValue(value) {
  if (typeof value === 'number') return value
  const match = String(value || '').match(/\d+(?:\.\d+)?/)
  if (!match) return value
  return Number(match[0])
}

function normalizeReviewResult(result) {
  const normalized = { ...result }
  normalized.overallBand = normalizeBandValue(normalized.overallBand)
  if (normalized.criteria) {
    for (const criterion of Object.values(normalized.criteria)) {
      if (criterion && typeof criterion === 'object' && 'band' in criterion) {
        criterion.band = normalizeBandValue(criterion.band)
      }
    }
  }
  return normalized
}

async function reviewWriting(input) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey || apiKey.includes('your_')) {
    const error = new Error('DEEPSEEK_API_KEY 尚未配置。请在 .env 中填写后再试。')
    error.status = 500
    throw error
  }

  const apiBase = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com'
  const model = resolveDeepSeekModel()
  const response = await fetch(`${apiBase.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(input) },
      ],
      stream: false,
      temperature: 0.2,
      max_tokens: 7000,
      response_format: { type: 'json_object' },
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.error?.message || `DeepSeek 请求失败：HTTP ${response.status}`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  const content = payload?.choices?.[0]?.message?.content
  if (!content) throw new Error('模型未返回批改内容。')
  const result = normalizeReviewResult(parseModelJson(content))
  return {
    ...result,
    taskPromptUsed: result.taskPromptUsed || input.prompt || '未提供',
    calibrationReference: input.localCalibration || null,
    inputWarnings: input.inputWarnings || [],
    cleanedWordCount: input.wordCount,
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (req.method !== 'POST' || req.url !== '/api/writing-review') {
    sendJson(res, 404, { error: 'Not found' })
    return
  }

  try {
    const body = await readBody(req)
    const rawInput = JSON.parse(body)
    const { errors, warnings, clean } = validateInput(rawInput)
    if (errors.length) {
      sendJson(res, 400, { error: errors.join('；') })
      return
    }
    const localCalibration = await runLocalCalibrator(clean.prompt, clean.essay)
    const result = await reviewWriting({
      ...clean,
      localCalibration,
      inputWarnings: warnings,
    })
    result.warnings = [...new Set([...(warnings || []), ...(result.warnings || [])])]
    sendJson(res, 200, result)
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || '批改失败，请稍后重试。' })
  }
})

server.listen(PORT, () => {
  console.log(`DeepSeek writing review API running at http://localhost:${PORT}`)
})
