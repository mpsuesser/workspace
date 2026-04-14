/**
 * Sketch extension - open a local tldraw canvas in the browser
 * /sketch → draw in tldraw → send snapshot back to pi as an image attachment
 */

import type { ExtensionAPI } from '@mariozechner/pi-coding-agent'
import { truncateToWidth } from '@mariozechner/pi-tui'
import { exec, execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { createConnection } from 'node:net'
import { dirname, extname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = resolve(__dirname, '..', 'dist')
const DIST_INDEX_PATH = resolve(DIST_DIR, 'index.html')

const CADDY_ADMIN_URL = 'http://127.0.0.1:2019'
const CADDY_SERVER_ID = 'pi-sketch'
const SKETCH_DOMAIN = 'pi-sketch.localhost'
const CADDY_HTTPS_PORTS = [443, 8443] as const

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const BUILD_MISSING_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>pi sketch build missing</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0f172a;
        color: #e2e8f0;
        font: 16px/1.6 system-ui, sans-serif;
      }
      main {
        max-width: 680px;
        margin: 24px;
        padding: 24px;
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(148, 163, 184, 0.18);
      }
      pre {
        padding: 12px;
        border-radius: 12px;
        background: rgba(2, 6, 23, 0.9);
        overflow: auto;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>pi-sketch needs a frontend build</h1>
      <p>
        The tldraw app hasn't been built yet. In the extension directory, run:
      </p>
      <pre>npm install
npm run build</pre>
      <p>Then run <code>/reload</code> in pi and try <code>/sketch</code> again.</p>
    </main>
  </body>
</html>`

interface SketchSubmission {
  pngBase64: string
  snapshot?: unknown
}

interface SketchServer {
  directUrl: string
  port: number
  waitForResult: () => Promise<SketchSubmission | null>
  close: () => void
}

interface BrowserTarget {
  note?: string
  cleanup: () => Promise<void>
  url: string
}

interface CaddyRoute {
  match?: Array<{ host?: string[] } & Record<string, unknown>>
  handle?: Array<
    | {
        handler: 'reverse_proxy'
        upstreams?: Array<{ dial?: string } & Record<string, unknown>>
      }
    | Record<string, unknown>
  >
  terminal?: boolean
  [key: string]: unknown
}

interface CaddySession {
  startedBySketch: boolean
  stopWhenIdle: boolean
}

function openBrowser(url: string): void {
  const platform = process.platform
  let cmd: string

  if (platform === 'darwin') {
    cmd = `open "${url}"`
  } else if (platform === 'win32') {
    cmd = `start "" "${url}"`
  } else {
    cmd = `xdg-open "${url}" 2>/dev/null || sensible-browser "${url}" 2>/dev/null || x-www-browser "${url}" 2>/dev/null`
  }

  exec(cmd)
}

function sendHtml(res: ServerResponse, html: string, status = 200) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/html; charset=utf-8',
  })
  res.end(html)
}

function serveStaticAsset(pathname: string, res: ServerResponse) {
  const normalizedPath = pathname === '/' || pathname === '/sketch' ? '/index.html' : pathname
  const relativePath = normalizedPath.replace(/^\/+/, '')
  const filePath = resolve(DIST_DIR, relativePath)

  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  if (!existsSync(filePath)) {
    if (relativePath === 'index.html') {
      sendHtml(res, BUILD_MISSING_HTML)
      return
    }

    res.writeHead(404)
    res.end('Not found')
    return
  }

  const mimeType = MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
  const contents = readFileSync(filePath)

  res.writeHead(200, {
    'Cache-Control': relativePath === 'index.html' ? 'no-store' : 'public, max-age=31536000, immutable',
    'Content-Type': mimeType,
  })
  res.end(contents)
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  let body = ''

  for await (const chunk of req) {
    body += chunk
  }

  return body
}

async function launchSketchServer(): Promise<SketchServer> {
  let resolved = false
  let resolvePromise!: (value: SketchSubmission | null) => void

  const resultPromise = new Promise<SketchSubmission | null>((resolve) => {
    resolvePromise = resolve
  })

  let timeout: NodeJS.Timeout | undefined

  const finish = (result: SketchSubmission | null, server: Server) => {
    if (resolved) return
    resolved = true
    if (timeout) clearTimeout(timeout)
    server.close()
    resolvePromise(result)
  }

  const server: Server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1')
    const pathname = decodeURIComponent(requestUrl.pathname)

    if (req.method === 'GET') {
      serveStaticAsset(pathname, res)
      return
    }

    if (req.method === 'POST' && pathname === '/submit') {
      try {
        const body = await readRequestBody(req)
        const parsed = JSON.parse(body) as SketchSubmission

        if (!parsed || typeof parsed.pngBase64 !== 'string' || parsed.pngBase64.length === 0) {
          throw new Error('Missing pngBase64 payload')
        }

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('OK')
        finish(parsed, server)
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end(error instanceof Error ? error.message : 'Invalid request')
      }
      return
    }

    if (req.method === 'POST' && pathname === '/cancel') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('OK')
      finish(null, server)
      return
    }

    res.writeHead(404)
    res.end('Not found')
  })

  server.on('error', (error) => {
    console.error('Sketch server error:', error)
    finish(null, server)
  })

  await new Promise<void>((resolveListen, rejectListen) => {
    const onError = (error: Error) => {
      server.off('error', onError)
      rejectListen(error)
    }

    server.once('error', onError)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', onError)
      resolveListen()
    })
  })

  const addr = server.address()
  if (!addr || typeof addr !== 'object') {
    finish(null, server)
    throw new Error('Could not determine sketch server address')
  }

  timeout = setTimeout(() => finish(null, server), 10 * 60 * 1000)

  return {
    directUrl: `http://127.0.0.1:${addr.port}/sketch`,
    port: addr.port,
    waitForResult: () => resultPromise,
    close: () => finish(null, server),
  }
}

function execFileAsync(command: string, args: string[], timeoutMs?: number): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(command, args, timeoutMs ? { timeout: timeoutMs } : undefined, (error, stdout, stderr) => {
      if (error) {
        reject(Object.assign(error, { stderr, stdout }))
        return
      }

      resolve({ stderr, stdout })
    })
  })
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 5000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

function withAdminHeaders(init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('origin', new URL(CADDY_ADMIN_URL).origin)
  return { ...init, headers }
}

async function getJson<T = unknown>(url: string): Promise<T | undefined> {
  const response = await fetchWithTimeout(url, withAdminHeaders())
  if (!response.ok) return undefined
  const text = await response.text()
  return text ? (JSON.parse(text) as T) : undefined
}

async function requestJson(url: string, init: RequestInit = {}) {
  const response = await fetchWithTimeout(url, withAdminHeaders(init))
  const text = await response.text()

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}\n${text}`)
  }

  return text ? JSON.parse(text) : undefined
}

function putJson(url: string, body: unknown) {
  return requestJson(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function postJson(url: string, body: unknown) {
  return requestJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function patchJson(url: string, body: unknown) {
  return requestJson(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function deleteJson(url: string) {
  const response = await fetchWithTimeout(url, withAdminHeaders({ method: 'DELETE' }))
  if (response.ok) return
  const text = await response.text()
  throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}\n${text}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function hasNonEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (isRecord(value)) return Object.keys(value).length > 0
  return true
}

function isIdleHttpApp(value: unknown): boolean {
  if (!isRecord(value)) return false

  for (const [key, child] of Object.entries(value)) {
    if (key === 'servers') {
      if (!isRecord(child) || Object.keys(child).length > 0) return false
      continue
    }

    if (hasNonEmptyValue(child)) return false
  }

  return true
}

function isIdleTlsApp(value: unknown): boolean {
  if (!isRecord(value)) return false

  for (const [key, child] of Object.entries(value)) {
    if (key === 'automation') {
      if (!isRecord(child)) return false

      for (const [automationKey, automationValue] of Object.entries(child)) {
        if (automationKey === 'policies') {
          if (!Array.isArray(automationValue) || automationValue.length > 0) return false
          continue
        }

        if (hasNonEmptyValue(automationValue)) return false
      }

      continue
    }

    if (hasNonEmptyValue(child)) return false
  }

  return true
}

function isIdleCaddyApps(value: unknown): boolean {
  if (!isRecord(value)) return true

  for (const [key, child] of Object.entries(value)) {
    if (key === 'http') {
      if (!isIdleHttpApp(child)) return false
      continue
    }

    if (key === 'tls') {
      if (!isIdleTlsApp(child)) return false
      continue
    }

    if (hasNonEmptyValue(child)) return false
  }

  return true
}

function isSketchTlsPolicy(policy: unknown): boolean {
  if (!isRecord(policy)) return false

  const subjects = policy.subjects
  const issuers = policy.issuers

  return (
    Array.isArray(subjects) &&
    subjects.length === 1 &&
    subjects[0] === SKETCH_DOMAIN &&
    Array.isArray(issuers) &&
    issuers.some((issuer) => isRecord(issuer) && issuer.module === 'internal')
  )
}

async function waitForCaddyAdmin(timeoutMs = 2000) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(`${CADDY_ADMIN_URL}/config/`, withAdminHeaders(), 400)
      if (response.ok) return
    } catch {
      // Keep polling until timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error('Timed out waiting for Caddy admin API')
}

async function getCaddyApps() {
  return (await getJson<Record<string, unknown> | null>(`${CADDY_ADMIN_URL}/config/apps`)) ?? {}
}

async function ensureCaddyAdmin(): Promise<CaddySession> {
  try {
    await waitForCaddyAdmin(200)
    return { startedBySketch: false, stopWhenIdle: false }
  } catch {
    // Caddy is not running yet.
  }

  try {
    await execFileAsync('caddy', ['start'], 1500)
  } catch (error) {
    throw new Error(`Could not start Caddy: ${error instanceof Error ? error.message : String(error)}`)
  }

  await waitForCaddyAdmin()

  try {
    return {
      startedBySketch: true,
      stopWhenIdle: isIdleCaddyApps(await getCaddyApps()),
    }
  } catch {
    return { startedBySketch: true, stopWhenIdle: false }
  }
}

async function ensureConfigPath(path: string, payload: unknown) {
  const response = await fetchWithTimeout(path, withAdminHeaders())
  if (!response.ok) {
    await putJson(path, payload)
  }
}

async function ensureTlsPolicy(domain: string) {
  await ensureConfigPath(`${CADDY_ADMIN_URL}/config/apps`, {})

  const tlsPath = `${CADDY_ADMIN_URL}/config/apps/tls`
  const tlsResponse = await fetchWithTimeout(tlsPath, withAdminHeaders())
  if (!tlsResponse.ok) {
    await putJson(tlsPath, { automation: { policies: [] } })
  }

  await ensureConfigPath(`${CADDY_ADMIN_URL}/config/apps/tls/automation`, { policies: [] })
  await ensureConfigPath(`${CADDY_ADMIN_URL}/config/apps/tls/automation/policies`, [])

  const policies = (await getJson<any[]>(`${CADDY_ADMIN_URL}/config/apps/tls/automation/policies`)) ?? []
  const hasPolicy = policies.some(
    (policy) =>
      Array.isArray(policy?.subjects) &&
      policy.subjects.includes(domain) &&
      Array.isArray(policy?.issuers) &&
      policy.issuers.some((issuer: any) => issuer?.module === 'internal')
  )

  if (!hasPolicy) {
    await postJson(`${CADDY_ADMIN_URL}/config/apps/tls/automation/policies`, {
      subjects: [domain],
      issuers: [{ module: 'internal' }],
    })
  }
}

async function ensureCaddyServerExists(port: number) {
  const listen = [`:${port}`]
  const serverBase = `${CADDY_ADMIN_URL}/config/apps/http/servers/${encodeURIComponent(CADDY_SERVER_ID)}`
  const routesPath = `${serverBase}/routes`

  await ensureConfigPath(`${CADDY_ADMIN_URL}/config/apps`, {})
  await ensureConfigPath(`${CADDY_ADMIN_URL}/config/apps/http`, { servers: {} })
  await ensureConfigPath(`${CADDY_ADMIN_URL}/config/apps/http/servers`, {})

  const currentRoutes = await getJson<CaddyRoute[] | null>(routesPath)
  const normalizedRoutes = Array.isArray(currentRoutes) ? currentRoutes : []

  const serverResponse = await fetchWithTimeout(serverBase, withAdminHeaders())
  if (!serverResponse.ok) {
    await putJson(serverBase, {
      automatic_https: { disable_redirects: true },
      listen,
      routes: normalizedRoutes,
    })
  } else {
    await patchJson(serverBase, {
      automatic_https: { disable_redirects: true },
      listen,
      routes: normalizedRoutes,
    })
  }

  await ensureTlsPolicy(SKETCH_DOMAIN)
}

async function getRoutes() {
  return (await getJson<CaddyRoute[] | null>(`${CADDY_ADMIN_URL}/config/apps/http/servers/${encodeURIComponent(CADDY_SERVER_ID)}/routes`)) ?? []
}

function findRouteByHost(routes: CaddyRoute[] | undefined, host: string) {
  if (!routes) return { index: -1, route: undefined as CaddyRoute | undefined }

  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index]
    const matches = Array.isArray(route.match) ? route.match : []

    for (const match of matches) {
      if (Array.isArray(match.host) && match.host.includes(host)) {
        return { index, route }
      }
    }
  }

  return { index: -1, route: undefined as CaddyRoute | undefined }
}

function extractUpstreamPort(route: CaddyRoute) {
  const handlers = Array.isArray(route.handle) ? route.handle : []

  for (const handler of handlers) {
    if (handler.handler === 'reverse_proxy' && Array.isArray(handler.upstreams) && handler.upstreams.length > 0) {
      const dial = handler.upstreams[0]?.dial?.trim()
      const match = dial ? /:(\d+)$/.exec(dial) : null
      if (match) return Number(match[1])
    }
  }

  return undefined
}

async function addRoute(domain: string, port: number) {
  await postJson(`${CADDY_ADMIN_URL}/config/apps/http/servers/${encodeURIComponent(CADDY_SERVER_ID)}/routes`, {
    match: [{ host: [domain] }],
    handle: [{ handler: 'reverse_proxy', upstreams: [{ dial: `127.0.0.1:${port}` }] }],
    terminal: true,
  })
}

async function replaceRouteAt(index: number, domain: string, port: number) {
  await patchJson(`${CADDY_ADMIN_URL}/config/apps/http/servers/${encodeURIComponent(CADDY_SERVER_ID)}/routes/${index}`, {
    match: [{ host: [domain] }],
    handle: [{ handler: 'reverse_proxy', upstreams: [{ dial: `127.0.0.1:${port}` }] }],
    terminal: true,
  })
}

async function deleteRouteAt(index: number) {
  await deleteJson(`${CADDY_ADMIN_URL}/config/apps/http/servers/${encodeURIComponent(CADDY_SERVER_ID)}/routes/${index}`)
}

async function deleteCaddyServerIfUnused() {
  const routes = await getRoutes()
  if (routes.length > 0) return

  try {
    await deleteJson(`${CADDY_ADMIN_URL}/config/apps/http/servers/${encodeURIComponent(CADDY_SERVER_ID)}`)
  } catch {
    // Ignore cleanup failures. This only removes our temporary listener.
  }
}

async function deleteSketchTlsPolicyIfUnused() {
  const routes = await getRoutes()
  if (findRouteByHost(routes, SKETCH_DOMAIN).route) return

  const policiesPath = `${CADDY_ADMIN_URL}/config/apps/tls/automation/policies`
  const policies = (await getJson<unknown[] | null>(policiesPath)) ?? []
  const index = policies.findIndex((policy) => isSketchTlsPolicy(policy))

  if (index === -1) return

  try {
    await deleteJson(`${policiesPath}/${index}`)
  } catch {
    // Ignore cleanup failures. This only removes our temporary TLS policy.
  }
}

async function stopCaddyIfIdle(caddySession: CaddySession) {
  if (!caddySession.startedBySketch || !caddySession.stopWhenIdle) return

  const apps = await getCaddyApps()
  if (!isIdleCaddyApps(apps)) return

  try {
    await execFileAsync('caddy', ['stop'], 1500)
  } catch {
    // Ignore shutdown failures. Caddy staying alive is harmless.
  }
}

function isAddressInUseError(error: unknown) {
  return error instanceof Error && /address already in use|bind: address already in use/i.test(error.message)
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false
  }
  return true
}

function isPortActive(port: number, host = '127.0.0.1', timeoutMs = 350): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port })
    const finish = (value: boolean) => {
      socket.removeAllListeners()
      try {
        socket.end()
        socket.destroy()
      } catch {
        // Ignore cleanup errors.
      }
      resolve(value)
    }

    const timer = setTimeout(() => finish(false), timeoutMs)

    socket.once('connect', () => {
      clearTimeout(timer)
      finish(true)
    })

    socket.once('error', () => {
      clearTimeout(timer)
      finish(false)
    })
  })
}

async function cleanupSketchDomain(upstreamPort: number, caddySession: CaddySession) {
  try {
    const routes = await getRoutes()
    const { index, route } = findRouteByHost(routes, SKETCH_DOMAIN)

    if (route && index !== -1 && extractUpstreamPort(route) === upstreamPort) {
      await deleteRouteAt(index)
    }

    await deleteCaddyServerIfUnused()
    await deleteSketchTlsPolicyIfUnused()
    await stopCaddyIfIdle(caddySession)
  } catch {
    // Ignore cleanup failures. Falling back should stay silent.
  }
}

function toHttpsUrl(port: number) {
  return port === 443 ? `https://${SKETCH_DOMAIN}/sketch` : `https://${SKETCH_DOMAIN}:${port}/sketch`
}

async function resolveBrowserTarget(sketchServer: SketchServer): Promise<BrowserTarget> {
  const directTarget: BrowserTarget = {
    cleanup: async () => {},
    note: 'Using a direct local URL because a stable local HTTPS hostname is unavailable.',
    url: sketchServer.directUrl,
  }

  let caddySession: CaddySession

  try {
    caddySession = await ensureCaddyAdmin()
  } catch {
    return directTarget
  }

  for (const httpsPort of CADDY_HTTPS_PORTS) {
    try {
      await ensureCaddyServerExists(httpsPort)

      const routes = await getRoutes()
      const { index, route } = findRouteByHost(routes, SKETCH_DOMAIN)

      if (!route) {
        await addRoute(SKETCH_DOMAIN, sketchServer.port)
      } else {
        const existingPort = extractUpstreamPort(route)
        const existingRouteIsActive = existingPort ? await isPortActive(existingPort) : false

        if (existingRouteIsActive && existingPort !== sketchServer.port) {
          return {
            ...directTarget,
            note: 'Using a direct local URL because the stable local HTTPS hostname is already in use by another local service.',
          }
        }

        if (index === -1) {
          await addRoute(SKETCH_DOMAIN, sketchServer.port)
        } else if (existingPort !== sketchServer.port) {
          await replaceRouteAt(index, SKETCH_DOMAIN, sketchServer.port)
        }
      }

      return {
        cleanup: () => cleanupSketchDomain(sketchServer.port, caddySession),
        note:
          httpsPort === 443
            ? undefined
            : 'Using an alternate local HTTPS port because the default HTTPS port is unavailable on this machine.',
        url: toHttpsUrl(httpsPort),
      }
    } catch (error) {
      if (isAddressInUseError(error)) {
        continue
      }

      return directTarget
    }
  }

  return {
    ...directTarget,
    note: 'Using a direct local URL because local HTTPS ports are already in use on this machine.',
  }
}

function saveSketch(result: SketchSubmission) {
  const sketchDir = join(tmpdir(), 'pi-sketches')
  mkdirSync(sketchDir, { recursive: true })

  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const imagePath = join(sketchDir, `sketch-${id}.png`)
  const snapshotPath = join(sketchDir, `sketch-${id}.tldr.json`)

  writeFileSync(imagePath, Buffer.from(result.pngBase64, 'base64'))

  if (result.snapshot !== undefined) {
    writeFileSync(snapshotPath, JSON.stringify(result.snapshot, null, 2))
  }

  return {
    imagePath,
    snapshotPath: result.snapshot !== undefined ? snapshotPath : undefined,
  }
}

function appendImageToEditor(currentText: string | undefined, imagePath: string) {
  const trimmed = currentText?.trimEnd() ?? ''
  return trimmed ? `${trimmed}\n@${imagePath}` : `@${imagePath}`
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand('sketch', {
    description: 'Open a tldraw canvas in the browser and attach it to the current prompt',

    handler: async (_args, ctx) => {
      if (!ctx.hasUI) {
        ctx.ui.notify('Sketch requires interactive mode', 'error')
        return
      }

      if (!existsSync(DIST_INDEX_PATH)) {
        ctx.ui.notify(`pi-sketch frontend is not built yet. Run npm install && npm run build in ${resolve(__dirname, '..')}`, 'error')
        return
      }

      let browserTarget: BrowserTarget | undefined
      let sketchServer: SketchServer | undefined
      let setupError: string | undefined
      let result: SketchSubmission | null = null

      try {
        result = await ctx.ui.custom<SketchSubmission | null>((tui, theme, _kb, done) => {
          let closed = false
          let note = 'Starting local sketch server...'
          let status: 'preparing' | 'ready' | 'error' = 'preparing'
          let url = ''

          const finish = (value: SketchSubmission | null) => {
            if (closed) return
            closed = true
            done(value)
          }

          const refresh = () => tui.requestRender()

          void (async () => {
            try {
              sketchServer = await launchSketchServer()
              if (closed) return

              url = sketchServer.directUrl
              note = 'Preparing browser URL...'
              refresh()

              browserTarget = await resolveBrowserTarget(sketchServer)
              if (closed) return

              status = 'ready'
              url = browserTarget.url
              note = browserTarget.note ?? 'Open the URL manually if the browser does not appear.'
              refresh()

              try {
                openBrowser(browserTarget.url)
              } catch {
                note = 'Open the URL above manually if your browser did not open automatically.'
                refresh()
              }

              const submission = await sketchServer.waitForResult()
              finish(submission)
            } catch (error) {
              setupError = error instanceof Error ? error.message : String(error)
              status = 'error'
              note = 'Press Escape to dismiss.'
              refresh()
            }
          })()

          return {
            render(width: number) {
              const safeWidth = Math.max(width, 1)
              const lines =
                status === 'error'
                  ? [
                      theme.fg('error', 'Could not open sketch'),
                      setupError ? theme.fg('muted', setupError) : '',
                      '',
                      theme.fg('dim', 'Press Escape to dismiss.'),
                    ]
                  : status === 'ready'
                    ? [
                        theme.fg('success', 'tldraw opened in your browser'),
                        theme.fg('muted', url),
                        note ? theme.fg('dim', note) : '',
                        '',
                        theme.fg('dim', 'Use Send to pi or Cmd/Ctrl+Enter in the browser.'),
                        theme.fg('dim', 'Press Escape here to cancel.'),
                      ]
                    : [
                        theme.fg('accent', 'Preparing sketch...'),
                        url ? theme.fg('muted', url) : '',
                        theme.fg('dim', note),
                        '',
                        theme.fg('dim', 'Press Escape to cancel.'),
                      ]

              return lines.map((line) => (line ? truncateToWidth(line, safeWidth) : line))
            },
            invalidate() {},
            handleInput(data: string) {
              if (data === '\x1b' || data === '\x1b\x1b') {
                sketchServer?.close()
                finish(null)
              }
            },
          }
        })
      } finally {
        sketchServer?.close()
        await browserTarget?.cleanup()
      }

      try {
        if (setupError) {
          ctx.ui.notify(`Could not open sketch: ${setupError}`, 'error')
          return
        }

        if (!result) {
          ctx.ui.notify('Sketch cancelled', 'info')
          return
        }

        const { imagePath, snapshotPath } = saveSketch(result)
        const nextEditorText = appendImageToEditor(ctx.ui.getEditorText?.(), imagePath)
        ctx.ui.setEditorText(nextEditorText)

        if (snapshotPath) {
          ctx.ui.notify(`Attached sketch and saved editable snapshot to ${snapshotPath}`, 'info')
        } else {
          ctx.ui.notify(`Attached sketch ${imagePath}`, 'info')
        }
      } catch (error) {
        ctx.ui.notify(`Sketch error: ${error instanceof Error ? error.message : String(error)}`, 'error')
      }
    },
  })
}
