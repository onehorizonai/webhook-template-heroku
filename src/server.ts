import { createServer, type ServerResponse } from 'node:http'
import { handleWebhook, jsonResponse, MAX_WEBHOOK_BODY_BYTES, type WebhookResponse } from './webhook.js'

const port = Number(process.env.PORT || 3000)

const server = createServer(async (req, res) => {
  if (req.url?.split('?')[0] !== '/webhook') {
    writeResponse(res, jsonResponse(404, { error: 'not found' }), req.method)
    return
  }

  const chunks: Buffer[] = []
  let totalBytes = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalBytes += buffer.length

    if (totalBytes > MAX_WEBHOOK_BODY_BYTES) {
      writeResponse(res, jsonResponse(413, { error: 'webhook payload is too large' }), req.method)
      return
    }

    chunks.push(buffer)
  }

  const response = await handleWebhook({
    method: req.method || 'GET',
    headers: req.headers,
    rawBody: Buffer.concat(chunks)
  })

  writeResponse(res, response, req.method)
})

server.listen(port, () => {
  console.info(`One Horizon webhook endpoint ready at http://localhost:${port}/webhook`)
})

function writeResponse(res: ServerResponse, response: WebhookResponse, method = 'GET') {
  res.writeHead(response.status, response.headers)
  if (method !== 'HEAD' && response.body !== undefined) {
    res.end(JSON.stringify(response.body))
    return
  }
  res.end()
}
