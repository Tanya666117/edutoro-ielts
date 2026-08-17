import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const storePath = resolve(process.cwd(), 'data', 'writing-users.json')

function ensureStore() {
  const dir = dirname(storePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(storePath)) writeFileSync(storePath, JSON.stringify({ users: [], sessions: [] }, null, 2))
}

function readStore() {
  ensureStore()
  return JSON.parse(readFileSync(storePath, 'utf8'))
}

function writeStore(store) {
  const tempPath = `${storePath}.tmp`
  writeFileSync(tempPath, JSON.stringify(store, null, 2))
  renameSync(tempPath, storePath)
}

const [, , emailArg, creditsArg] = process.argv

if (!emailArg || !creditsArg) {
  console.error('Usage: node scripts/update-writing-credits.mjs <email> <credits>')
  process.exit(1)
}

const email = emailArg.trim().toLowerCase()
const credits = Number(creditsArg)

if (!Number.isFinite(credits) || credits < 0) {
  console.error('Credits must be a non-negative number.')
  process.exit(1)
}

const store = readStore()
const user = Array.isArray(store.users) ? store.users.find((item) => String(item.email || '').toLowerCase() === email) : null

if (!user) {
  console.error(`User not found: ${email}`)
  process.exit(1)
}

user.writingCredits = credits
writeStore(store)
console.log(`Updated ${email} writingCredits -> ${credits}`)
