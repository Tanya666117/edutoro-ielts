import { spawn } from 'node:child_process'

const processes = [
  spawn('npm', ['run', 'api:py'], { stdio: 'inherit', shell: true }),
  spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true }),
]

function shutdown(signal) {
  for (const child of processes) child.kill(signal)
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
