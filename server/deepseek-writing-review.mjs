import http from 'node:http'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { URL } from 'node:url'

loadDotEnv()

const PORT = Number(process.env.PORT || 8787)
const QWEN_OCR_BASE = process.env.QWEN_OCR_BASE_URL || process.env.QWEN_BASE_URL || ''
const QWEN_OCR_KEY = process.env.QWEN_OCR_API_KEY || process.env.QWEN_API_KEY || ''
const QWEN_OCR_MODEL = process.env.QWEN_OCR_MODEL || 'qwen-vl-ocr-latest'
const USER_STORE_PATH = resolve(process.cwd(), 'data', 'writing-users.json')
const FREE_WRITING_CREDITS = 2

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
4. 分数要能自洽：如果四项平均和总分差距超过 0.5，必须在 warnings 里解释原因。
5. 评分要保守稳定，优先检查字数不足、模板化、论证空泛或 Task 1 信息缺失等问题。
6. 批注必须针对原文中的具体短语或句子，original 必须尽量逐字来自学生原文，revision 给出更自然的改法，reason 用中文解释。
7. annotations 给 5-10 条，优先覆盖高影响问题；不要把整篇文章都塞进 original。
8. recommendations 给 3-6 条，必须是下一次写作可执行的训练动作。
9. polishedEssay 写一篇可参考的 8 分版，不能离题，保持考场作文风格，不要过度学术化。
10. 只返回 JSON，不要 Markdown，不要解释 JSON 外的内容。

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

function ensureUserStore() {
  const storeDir = dirname(USER_STORE_PATH)
  if (!existsSync(storeDir)) mkdirSync(storeDir, { recursive: true })
  if (!existsSync(USER_STORE_PATH)) {
    writeFileSync(USER_STORE_PATH, JSON.stringify({ users: [], sessions: [] }, null, 2))
  }
}

function readUserStore() {
  ensureUserStore()
  try {
    const parsed = JSON.parse(readFileSync(USER_STORE_PATH, 'utf8'))
    return {
      users: Array.isArray(parsed?.users) ? parsed.users : [],
      sessions: Array.isArray(parsed?.sessions) ? parsed.sessions : [],
    }
  } catch {
    return { users: [], sessions: [] }
  }
}

function writeUserStore(store) {
  ensureUserStore()
  const tempPath = `${USER_STORE_PATH}.tmp`
  writeFileSync(tempPath, JSON.stringify(store, null, 2))
  renameSync(tempPath, USER_STORE_PATH)
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function sanitizeDisplayName(value) {
  return cleanText(value, { maxLength: 60 }) || 'Edutoro 学员'
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: scryptSync(String(password), salt, 64).toString('hex'),
  }
}

function verifyPassword(password, passwordHash, passwordSalt) {
  if (!passwordHash || !passwordSalt) return false
  const actual = Buffer.from(passwordHash, 'hex')
  const expected = Buffer.from(scryptSync(String(password), passwordSalt, 64).toString('hex'), 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function createSession(userId, store) {
  const token = randomBytes(24).toString('hex')
  store.sessions = store.sessions.filter((session) => session.userId !== userId)
  store.sessions.push({ token, userId, createdAt: new Date().toISOString() })
  return token
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    writingCredits: Number(user.writingCredits || 0),
    createdAt: user.createdAt,
  }
}

function findUserByToken(token) {
  if (!token) return null
  const store = readUserStore()
  const session = store.sessions.find((item) => item.token === token)
  if (!session) return null
  const user = store.users.find((item) => item.id === session.userId)
  return user ? { store, user, session } : null
}

function extractTokenFromRequest(req, rawInput = {}) {
  const authHeader = req.headers.authorization || ''
  if (authHeader.toLowerCase().startsWith('bearer ')) return authHeader.slice(7).trim()
  return cleanText(rawInput.authToken, { maxLength: 200 })
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(status === 204 ? undefined : JSON.stringify(payload))
}

function readBody(req, options = {}) {
  const maxBytes = options.maxBytes || 180_000
  const tooLargeMessage = options.tooLargeMessage || '作文内容过长，请控制在约 12000 字以内。'
  return new Promise((resolveBody, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > maxBytes) {
        req.destroy()
        reject(new Error(tooLargeMessage))
      }
    })
    req.on('end', () => resolveBody(body))
    req.on('error', reject)
  })
}

function buildUserPrompt(input) {
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

注意：如果题目、图表信息或作文原文不完整，需要在 warnings 中提醒评分可靠性下降。
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
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      resolveScore(value)
    }

    let child
    try {
      child = spawn('python', [script], {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      })
    } catch (error) {
      finish({ unavailable: true, reason: error?.message || 'Local calibrator failed to start.' })
      return
    }

    let stdout = ''
    let stderr = ''
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      finish({ unavailable: true, reason: 'Local calibrator timed out.' })
    }, 15_000)

    child.on('error', (error) => {
      clearTimeout(timeout)
      finish({ unavailable: true, reason: error?.message || 'Local calibrator failed to start.' })
    })
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('close', (code) => {
      clearTimeout(timeout)
      if (code !== 0) {
        finish({ unavailable: true, reason: stderr.trim() || `Local calibrator exited with code ${code}.` })
        return
      }
      try {
        finish(JSON.parse(stdout))
      } catch {
        finish({ unavailable: true, reason: 'Local calibrator returned invalid JSON.' })
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

function validateImageDataUrl(value) {
  const match = String(value || '').match(/^data:(image\/[A-Za-z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n]+)$/)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
}

function sanitizeChartFacts(raw) {
  const input = raw && typeof raw === 'object' ? raw : {}
  const allowedChartTypes = new Set(['折线图', '柱状图', '饼图', '表格', '混合图', '流程图', '地图'])
  const normalizedType = cleanText(input.chartType, { maxLength: 120 })
  return {
    chartType: allowedChartTypes.has(normalizedType) ? normalizedType : '柱状图',
    title: cleanText(input.title, { maxLength: 300 }),
    unit: cleanText(input.unit, { maxLength: 300 }),
    overview: cleanText(input.overview, { maxLength: 800 }),
    highest: cleanText(input.highest, { maxLength: 800 }),
    lowest: cleanText(input.lowest, { maxLength: 800 }),
    trends: cleanText(input.trends, { maxLength: 1200 }),
    comparisons: cleanText(input.comparisons, { maxLength: 1200 }),
  }
}

function buildChartExtractionPrompt(prompt) {
  const taskPrompt = cleanText(prompt, { maxLength: 2000 })
  return `
You are helping with IELTS Academic Writing Task 1 chart extraction.

Return JSON only. Do not include markdown.

Extract only facts that are visible in the image. If something is unclear, mention that uncertainty briefly instead of inventing values.

Use this JSON schema:
{
  "chartFacts": {
    "chartType": "折线图 | 柱状图 | 饼图 | 表格 | 混合图 | 流程图 | 地图",
    "title": "chart title or short topic",
    "unit": "unit and/or time range",
    "overview": "one-sentence overall trend or overall process/map summary",
    "highest": "highest point / biggest item with value or stage if visible",
    "lowest": "lowest point / smallest item with value or stage if visible",
    "trends": "major trend or ordered process/map changes",
    "comparisons": "key comparisons between groups, years, stages, or areas"
  },
  "confidence": 0.0,
  "warnings": ["short notes about unclear labels, unreadable numbers, or assumptions"]
}

Requirements:
- confidence must be between 0 and 1.
- For pure pie charts without time points, leave "trends" empty and focus on overall distribution plus largest/smallest shares.
- For mixed charts, identify both chart forms and summarize the relationship between them.
- For process diagrams, use "trends" for ordered steps and "comparisons" for notable branch differences if any.
- For map tasks, summarize major changes over time in "trends" and location-based contrasts in "comparisons".
- Keep each field concise and useful for IELTS Task 1 writing.
${taskPrompt ? `- The user also provided this task prompt. Use it only to disambiguate labels, never to invent missing facts:\n${taskPrompt}` : ''}
`
}

async function extractTask1Chart(imageDataUrl, prompt) {
  if (!QWEN_OCR_BASE || !QWEN_OCR_KEY) {
    const error = new Error('Qwen OCR 尚未配置。请在 .env 中填写 QWEN_OCR_API_KEY 和 QWEN_OCR_BASE_URL。')
    error.status = 500
    throw error
  }

  const response = await fetch(`${QWEN_OCR_BASE.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${QWEN_OCR_KEY}`,
    },
    body: JSON.stringify({
      model: QWEN_OCR_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: buildChartExtractionPrompt(prompt) },
            { type: 'image_url', image_url: { url: imageDataUrl }, min_pixels: 3136, max_pixels: 1048576 },
          ],
        },
      ],
      stream: false,
      temperature: 0.1,
      max_tokens: 1200,
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.error?.message || `Qwen OCR 请求失败：HTTP ${response.status}`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  const content = payload?.choices?.[0]?.message?.content
  if (!content) {
    const error = new Error('Qwen OCR 未返回识别结果。')
    error.status = 502
    throw error
  }

  const result = parseModelJson(content)
  const confidence = Math.max(0, Math.min(1, Number(result?.confidence ?? 0)))
  return {
    chartFacts: sanitizeChartFacts(result?.chartFacts),
    confidence,
    warnings: Array.isArray(result?.warnings) ? result.warnings.map((item) => cleanText(item, { maxLength: 240 })).filter(Boolean) : [],
    model: QWEN_OCR_MODEL,
  }
}

function normalizeBandValue(value) {
  if (typeof value === 'number') return value
  const match = String(value || '').match(/\d+(?:\.\d+)?/)
  if (!match) return value
  return Number(match[0])
}

function roundHalf(value, lower = 0, upper = 9) {
  return Math.min(upper, Math.max(lower, Math.round(Number(value || 0) * 2) / 2))
}

function calibrationBand(reference) {
  const band = reference?.overall?.band
  return typeof band === 'number' ? band : null
}

function normalizeReviewResult(result) {
  const normalized = { ...result }
  normalized.overallBand = roundHalf(normalizeBandValue(normalized.overallBand))
  if (normalized.criteria) {
    for (const criterion of Object.values(normalized.criteria)) {
      if (criterion && typeof criterion === 'object' && 'band' in criterion) {
        criterion.band = roundHalf(normalizeBandValue(criterion.band))
      }
    }
  }
  return normalized
}

function fallbackCriterion(band, comment) {
  return { band: roundHalf(band, 4, 8), comment }
}

function buildFallbackReview(input, sourceError) {
  const referenceBand = calibrationBand(input.localCalibration)
  const lengthPenalty = input.taskType === 'Task 2' && input.wordCount < 250 ? 0.5 : 0
  const shortPenalty = input.wordCount < 180 ? 0.5 : 0
  const baseBand = referenceBand ?? (input.wordCount >= 250 ? 6 : input.wordCount >= 180 ? 5.5 : 5)
  const overallBand = roundHalf(baseBand - lengthPenalty - shortPenalty, 4, 7)
  const taskKey = input.taskType === 'Task 1' ? 'taskAchievement' : 'taskResponse'
  const serviceWarning = sourceError?.message === 'fetch failed'
    ? '当前网络暂时无法连接批改模型，已生成快速批改结果。'
    : `当前已切换为快速批改结果：${sourceError?.message || '未知错误'}`

  return {
    summary: `快速批改结果约 ${overallBand} 分。当前报告主要依据字数、段落、表达和任务完成度的基础特征生成，可用于先定位问题，再决定下一版重点修改方向。`,
    overallBand,
    taskPromptUsed: input.prompt || '未提供',
    calibrationReference: input.localCalibration || null,
    criteria: {
      [taskKey]: fallbackCriterion(overallBand - (input.prompt ? 0 : 0.5), input.prompt ? '已提供题目，可做基础任务回应判断；完整跑题判断需要大模型恢复后进一步确认。' : '题目缺失，任务回应判断可靠性明显下降。'),
      coherenceCohesion: fallbackCriterion(overallBand, '根据段落、句长和连接关系做基础判断；建议重点检查主体段是否各自服务于一个明确中心句。'),
      lexicalResource: fallbackCriterion(overallBand, '根据词汇量和重复度做基础判断；建议减少泛泛表达，增加更准确的动词、名词搭配。'),
      grammar: fallbackCriterion(overallBand - 0.5, '根据句末标点、句长和文本结构做基础判断；建议优先检查长句边界、主谓一致和从句结构。'),
    },
    annotations: [],
    recommendations: [
      '先补足 IELTS 建议字数，再提交一次完整精批。',
      '每个主体段保留一个中心句，并用解释和例子各展开 2-3 句。',
      '下一版重点检查重复词和笼统表达，把 important、good、bad、thing 等词替换成更具体的表达。',
      '大模型服务恢复后，再用完整精批查看逐句批注和 8 分参考改写。',
    ],
    warnings: [...new Set([...(input.inputWarnings || []), serviceWarning])],
    polishedEssay: input.essay,
    fallback: true,
    cleanedWordCount: input.wordCount,
  }
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

async function handleRegister(req, res) {
  const body = await readBody(req, { maxBytes: 20_000, tooLargeMessage: '注册信息过长，请检查后重试。' })
  const rawInput = JSON.parse(body)
  const email = normalizeEmail(rawInput.email)
  const password = String(rawInput.password || '')
  const displayName = sanitizeDisplayName(rawInput.displayName || email.split('@')[0])

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    sendJson(res, 400, { error: '请输入有效邮箱。' })
    return
  }
  if (password.length < 6) {
    sendJson(res, 400, { error: '密码至少需要 6 位。' })
    return
  }

  const store = readUserStore()
  if (store.users.some((user) => user.email === email)) {
    sendJson(res, 409, { error: '这个邮箱已经注册过了，请直接登录。' })
    return
  }

  const hashed = hashPassword(password)
  const user = {
    id: randomUUID(),
    email,
    displayName,
    passwordHash: hashed.hash,
    passwordSalt: hashed.salt,
    writingCredits: FREE_WRITING_CREDITS,
    createdAt: new Date().toISOString(),
  }
  store.users.push(user)
  const token = createSession(user.id, store)
  writeUserStore(store)
  sendJson(res, 201, {
    token,
    user: publicUser(user),
    promotion: `新用户已领取 ${FREE_WRITING_CREDITS} 次免费作文批改。`,
  })
}

async function handleLogin(req, res) {
  const body = await readBody(req, { maxBytes: 20_000, tooLargeMessage: '登录信息过长，请检查后重试。' })
  const rawInput = JSON.parse(body)
  const email = normalizeEmail(rawInput.email)
  const password = String(rawInput.password || '')
  const store = readUserStore()
  const user = store.users.find((item) => item.email === email)
  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    sendJson(res, 401, { error: '邮箱或密码不正确。' })
    return
  }
  const token = createSession(user.id, store)
  user.lastLoginAt = new Date().toISOString()
  writeUserStore(store)
  sendJson(res, 200, { token, user: publicUser(user) })
}

function handleSession(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const token = cleanText(requestUrl.searchParams.get('token'), { maxLength: 200 })
  const match = findUserByToken(token)
  if (!match) {
    sendJson(res, 401, { error: '登录状态已失效，请重新登录。' })
    return
  }
  sendJson(res, 200, { user: publicUser(match.user) })
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (req.method === 'POST' && req.url === '/api/auth/register') {
    try {
      await handleRegister(req, res)
    } catch (error) {
      sendJson(res, error.status || 500, { error: error.message || '注册失败，请稍后重试。' })
    }
    return
  }

  if (req.method === 'POST' && req.url === '/api/auth/login') {
    try {
      await handleLogin(req, res)
    } catch (error) {
      sendJson(res, error.status || 500, { error: error.message || '登录失败，请稍后重试。' })
    }
    return
  }

  if (req.method === 'GET' && req.url?.startsWith('/api/auth/session')) {
    try {
      handleSession(req, res)
    } catch (error) {
      sendJson(res, error.status || 500, { error: error.message || '读取登录状态失败。' })
    }
    return
  }

  if (req.method === 'POST' && req.url === '/api/task1/extract-chart') {
    try {
      const body = await readBody(req, {
        maxBytes: 16_000_000,
        tooLargeMessage: '图表图片过大，请压缩后重试。',
      })
      const rawInput = JSON.parse(body)
      const imageDataUrl = cleanText(rawInput.imageDataUrl, { maxLength: 18_000_000 })
      const prompt = cleanText(rawInput.prompt, { maxLength: 4000 })
      const parsedImage = validateImageDataUrl(imageDataUrl)
      if (!parsedImage) {
        sendJson(res, 400, { error: '请上传 JPG、PNG 或 WebP 图表图片。' })
        return
      }
      const result = await extractTask1Chart(imageDataUrl, prompt)
      sendJson(res, 200, result)
    } catch (error) {
      sendJson(res, error.status || 500, { error: error.message || '图表识别失败，请稍后重试。' })
    }
    return
  }

  if (req.method !== 'POST' || req.url !== '/api/writing-review') {
    sendJson(res, 404, { error: 'Not found' })
    return
  }

  try {
    const body = await readBody(req)
    const rawInput = JSON.parse(body)
    const authToken = extractTokenFromRequest(req, rawInput)
    const matchedUser = findUserByToken(authToken)
    if (!matchedUser) {
      sendJson(res, 401, { error: '请先登录，再提交作文批改。', code: 'AUTH_REQUIRED' })
      return
    }
    if (Number(matchedUser.user.writingCredits || 0) <= 0) {
      sendJson(res, 402, { error: '你的免费批改次数已用完，请添加小星微信领取或购买更多次数。', code: 'NO_CREDITS', user: publicUser(matchedUser.user) })
      return
    }
    const { errors, warnings, clean } = validateInput(rawInput)
    if (errors.length) {
      sendJson(res, 400, { error: errors.join('；') })
      return
    }
    const localCalibration = await runLocalCalibrator(clean.prompt, clean.essay)
    const reviewInput = {
      ...clean,
      localCalibration,
      inputWarnings: warnings,
    }
    const result = await reviewWriting(reviewInput).catch((error) => buildFallbackReview(reviewInput, error))
    result.warnings = [...new Set([...(warnings || []), ...(result.warnings || [])])]
    const store = matchedUser.store
    const targetUser = store.users.find((item) => item.id === matchedUser.user.id)
    if (targetUser) {
      targetUser.writingCredits = Math.max(0, Number(targetUser.writingCredits || 0) - 1)
      writeUserStore(store)
      result.user = publicUser(targetUser)
      result.remainingCredits = targetUser.writingCredits
    }
    sendJson(res, 200, result)
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || '批改失败，请稍后重试。' })
  }
})

server.listen(PORT, () => {
  console.log(`DeepSeek writing review API running at http://localhost:${PORT}`)
})
