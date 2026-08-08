import http from 'node:http'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.RECORDINGS_PORT || 8788)
const ROOT = resolve(process.cwd())
const DATA_DIR = resolve(ROOT, 'data', 'speaking-recordings')
const INDEX_FILE = resolve(DATA_DIR, 'index.json')
const MAX_BODY_BYTES = 20_000_000

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(INDEX_FILE)) writeFileSync(INDEX_FILE, '[]', 'utf8')
}

function readIndex() {
  ensureDataDir()
  try {
    const data = JSON.parse(readFileSync(INDEX_FILE, 'utf8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function writeIndex(items) {
  ensureDataDir()
  const temp = `${INDEX_FILE}.tmp`
  writeFileSync(temp, JSON.stringify(items, null, 2), 'utf8')
  renameSync(temp, INDEX_FILE)
}

function safeUserId(value) {
  const result = String(value || 'edutoro').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return result.slice(0, 60) || 'edutoro'
}

function publicItem(item) {
  return { ...item, audioUrl: `/api/speaking-recordings/${item.id}` }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(status === 204 ? '' : JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > MAX_BODY_BYTES) {
        req.destroy()
        reject(new Error('录音请求过大。'))
      }
    })
    req.on('end', () => resolveBody(body))
    req.on('error', reject)
  })
}

function extensionForMime(mimeType) {
  return ({ 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/wav': 'wav' })[mimeType] || 'webm'
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const pathname = requestUrl.pathname
  if (req.method === 'OPTIONS') { sendJson(res, 204, {}); return }
  if (req.method === 'GET' && pathname === '/healthz') { sendJson(res, 200, { ok: true }); return }

  if (req.method === 'GET' && pathname === '/api/speaking-recordings') {
    const userId = safeUserId(requestUrl.searchParams.get('userId'))
    const recordings = readIndex().filter((item) => item.userId === userId).map(publicItem)
    sendJson(res, 200, { recordings })
    return
  }

  if (req.method === 'GET' && pathname.startsWith('/api/speaking-recordings/')) {
    const id = pathname.split('/').pop()
    const item = readIndex().find((entry) => entry.id === id)
    if (!item) { sendJson(res, 404, { error: '录音不存在。' }); return }
    const filePath = resolve(DATA_DIR, item.fileName)
    if (!existsSync(filePath)) { sendJson(res, 404, { error: '录音文件不存在。' }); return }
    const payload = readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': item.mimeType || 'audio/webm', 'Content-Length': payload.length, 'Access-Control-Allow-Origin': '*' })
    res.end(payload)
    return
  }

  if (req.method === 'POST' && pathname === '/api/speaking-recordings') {
    try {
      const input = JSON.parse(await readBody(req) || '{}')
      const base64 = String(input.audioBase64 || '')
      if (!base64 || base64.length > 16_000_000) { sendJson(res, 413, { error: '单条录音不能超过 12 MB。' }); return }
      const buffer = Buffer.from(base64, 'base64')
      if (!buffer.length || buffer.length > 12_000_000) { sendJson(res, 413, { error: '单条录音不能超过 12 MB。' }); return }
      const id = randomUUID().replaceAll('-', '')
      const mimeType = String(input.mimeType || 'audio/webm').split(';')[0]
      const item = { id, userId: safeUserId(input.userId), topicId: String(input.topicId || '').slice(0, 120), question: String(input.question || '').slice(0, 1000), mimeType, fileName: `${id}.${extensionForMime(mimeType)}`, createdAt: new Date().toISOString(), sizeBytes: buffer.length }
      ensureDataDir()
      writeFileSync(resolve(DATA_DIR, item.fileName), buffer)
      writeIndex([item, ...readIndex()])
      sendJson(res, 201, { recording: publicItem(item) })
    } catch (error) {
      sendJson(res, 400, { error: error instanceof Error ? error.message : '录音保存失败。' })
    }
    return
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/speaking-recordings/')) {
    const id = pathname.split('/').pop()
    const userId = safeUserId(requestUrl.searchParams.get('userId'))
    const items = readIndex()
    const target = items.find((item) => item.id === id && item.userId === userId)
    if (!target) { sendJson(res, 404, { error: '录音不存在。' }); return }
    const filePath = resolve(DATA_DIR, target.fileName)
    if (existsSync(filePath)) unlinkSync(filePath)
    writeIndex(items.filter((item) => item.id !== id))
    sendJson(res, 200, { ok: true })
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => console.log(`Speaking recordings API running at http://localhost:${PORT}`))
