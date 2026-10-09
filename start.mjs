// Preview launcher: membaca APP_PORT dari .env lalu menjalankan `nuxt preview`.
import { existsSync, readFileSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'

function parseEnv(content) {
  const env = {}
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/)
    if (match && !line.trim().startsWith('#')) {
      env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    }
  }
  return env
}

const fileEnv = existsSync('.env') ? parseEnv(readFileSync('.env', 'utf8')) : {}
const port = process.env.APP_PORT || fileEnv.APP_PORT || '3000'
const env = { ...fileEnv, ...process.env, APP_PORT: port }

if (!existsSync('.output')) {
  console.log('> .output belum ada, menjalankan build terlebih dahulu...')
  const build = spawnSync('bun', ['x', 'nuxt', 'build'], { stdio: 'inherit', env })
  if (build.status !== 0) process.exit(build.status ?? 1)
}

console.log(`> Menjalankan preview di http://localhost:${port}`)
const child = spawn('bun', ['x', 'nuxt', 'preview', '--port', port], { stdio: 'inherit', env })
child.on('exit', (code) => process.exit(code ?? 0))
