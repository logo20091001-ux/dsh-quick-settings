/**
 * Host half: diagnostics sink for the settings button.
 *
 * The button is a browser thing, and the browser has no file to write to. This
 * route gives it one line per click, so a button that renders but does nothing
 * can be told apart from one that never receives the click at all.
 *
 * Route: POST /dsh-quick-settings/log  (JSON body, loopback only)
 */
import { appendFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const name = 'dsh-quick-settings'

export const inject = []

const ROUTE = '/dsh-quick-settings'

/** `$DSH_HOME/logs` — the same place the other desktop plugins log to. */
function logFilePath() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, 'logs', 'dsh-quick-settings.log')
}

function json(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  })
  response.end(body)
}

/** Only the app's own page may write here. */
function fromLoopback(request) {
  const address = request.socket?.remoteAddress ?? ''
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

export function apply(ctx) {
  ctx.inject(['webServer'], (hostCtx) => {
    hostCtx.webServer.register({
      kind: 'exact',
      path: `${ROUTE}/log`,
      handler: (request, response) => {
        if (request.method !== 'POST') return json(response, 405, { ok: false })
        if (!fromLoopback(request)) return json(response, 403, { ok: false })

        let body = ''
        request.on('data', (chunk) => { body += chunk })
        request.on('end', () => {
          try {
            const file = logFilePath()
            mkdirSync(join(file, '..'), { recursive: true })
            appendFileSync(file, `${new Date().toISOString()} ${body.slice(0, 4000)}\n`, 'utf8')
            json(response, 200, { ok: true })
          } catch (error) {
            json(response, 500, { ok: false, error: String(error?.message ?? error) })
          }
        })
        request.on('error', () => json(response, 400, { ok: false }))
      },
    })
  })
}
