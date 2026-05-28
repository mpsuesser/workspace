/**
 * Sketch extension - open a local tldraw canvas in the browser
 * /sketch → draw in tldraw → send snapshot back to pi as an image attachment
 */

import type { ExtensionAPI } from '@mariozechner/pi-coding-agent'
import { truncateToWidth } from '@mariozechner/pi-tui'
import { exec } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { dirname, extname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = resolve(__dirname, '..', 'dist')
const DIST_INDEX_PATH = resolve(DIST_DIR, 'index.html')
const LOCALHOST = 'localhost'
const SKETCH_PATH = '/pi-sketch'

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
  url: string
  waitForResult: () => Promise<SketchSubmission | null>
  close: () => void
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

function toStaticPath(pathname: string) {
  if (pathname === '/' || pathname === SKETCH_PATH || pathname === `${SKETCH_PATH}/` || pathname === '/sketch' || pathname === '/sketch/') {
    return '/index.html'
  }

  return pathname
}

function serveStaticAsset(pathname: string, res: ServerResponse) {
  const relativePath = toStaticPath(pathname).replace(/^\/+/, '')
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

    const requestUrl = new URL(req.url ?? '/', `http://${LOCALHOST}`)
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
    server.listen(0, LOCALHOST, () => {
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
    url: `http://${LOCALHOST}:${addr.port}${SKETCH_PATH}`,
    waitForResult: () => resultPromise,
    close: () => finish(null, server),
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

      let sketchServer: SketchServer | undefined
      let setupError: string | undefined
      let result: SketchSubmission | null = null

      try {
        result = await ctx.ui.custom<SketchSubmission | null>((tui, theme, _kb, done) => {
          let closed = false
          let helper = ''
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

              url = sketchServer.url
              note = 'Opening browser...'
              refresh()

              try {
                openBrowser(sketchServer.url)
              } catch {
                helper = 'Open the URL above manually.'
              }

              status = 'ready'
              refresh()

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
                        helper ? theme.fg('dim', helper) : '',
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
