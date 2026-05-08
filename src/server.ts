import { readFileSync } from 'node:fs'
import { createServer, type IncomingHttpHeaders, type ServerResponse } from 'node:http'
import { handleWebhookRequest, MAX_WEBHOOK_BODY_BYTES } from './webhook.js'

const port = Number(process.env.PORT || 3000)
const indexHtml = readFileSync('public/index.html', 'utf8')

const server = createServer(async (req, res) => {
  const path = new URL(req.url || '/', 'http://localhost').pathname

  if (path === '/' || path === '/index.html') {
    writeHtmlResponse(res, req.method)
    return
  }

  if (path !== '/webhook') {
    writeFetchResponse(res, Response.json({ error: 'not found' }, { status: 404 }), req.method)
    return
  }

  const body = await readBody(req)
  if (!body.ok) {
    writeFetchResponse(res, Response.json({ error: body.error }, { status: body.status }), req.method)
    return
  }

  const request = new Request(`http://localhost${req.url || '/webhook'}`, {
    method: req.method,
    headers: toHeaders(req.headers),
    body: shouldSendBody(req.method) ? body.value : undefined
  })

  writeFetchResponse(res, await handleWebhookRequest(request), req.method)
})

server.listen(port, () => {
  console.info(`One Horizon webhook endpoint ready at http://localhost:${port}/webhook`)
})

async function readBody(
  req: AsyncIterable<Buffer | string>
): Promise<{ ok: true; value: Uint8Array } | { ok: false; status: number; error: string }> {
  const chunks: Buffer[] = []
  let totalBytes = 0

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalBytes += buffer.length

    if (totalBytes > MAX_WEBHOOK_BODY_BYTES) {
      return { ok: false, status: 413, error: 'webhook payload is too large' }
    }

    chunks.push(buffer)
  }

  return { ok: true, value: Buffer.concat(chunks) }
}

function toHeaders(input: IncomingHttpHeaders): Headers {
  const headers = new Headers()

  for (const [name, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item))
    } else if (value) {
      headers.set(name, value)
    }
  }

  return headers
}

function shouldSendBody(method = 'GET'): boolean {
  return method !== 'GET' && method !== 'HEAD'
}

async function writeFetchResponse(res: ServerResponse, response: Response, method = 'GET') {
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()))
}

function writeHtmlResponse(res: ServerResponse, method = 'GET') {
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'public, max-age=0, must-revalidate',
    'x-content-type-options': 'nosniff'
  })
  res.end(method === 'HEAD' ? undefined : indexHtml)
}
