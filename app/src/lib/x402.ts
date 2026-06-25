/**
 * Converts an mppx 402 response (WWW-Authenticate) into one that also
 * carries the X-Payment-Required header expected by x402-compatible clients.
 */
export function withX402Header(response: Response): Response {
  const wwwAuth = response.headers.get('www-authenticate')
  if (!wwwAuth) return response

  const accepts = parseWwwAuthToAccepts(wwwAuth)
  if (!accepts.length) return response

  const payload = Buffer.from(JSON.stringify({ accepts })).toString('base64')
  const headers = new Headers(response.headers)
  headers.set('X-Payment-Required', payload)
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

function parseWwwAuthToAccepts(header: string): Array<Record<string, unknown>> {
  const accepts: Array<Record<string, unknown>> = []

  // Parse each WWW-Authenticate challenge (comma-separated at top level)
  // mppx format: Payment id="...", realm="...", method="...", intent="...", request="<base64>", expires="..."
  const challenges = header.split(/,\s*(?=Payment\s)/i)
  for (const challenge of challenges) {
    const method = extractParam(challenge, 'method')
    const requestB64 = extractParam(challenge, 'request')
    if (!requestB64) continue

    try {
      const req = JSON.parse(Buffer.from(requestB64, 'base64').toString())
      const entry: Record<string, unknown> = {
        network: method ?? 'unknown',
        amount: req.amount,
        payTo: req.recipient,
      }

      if (method === 'tempo') {
        entry.asset = 'USDC.e'
        entry.chainId = req.methodDetails?.chainId
      } else if (method === 'stripe') {
        entry.asset = 'USD'
      }

      accepts.push(entry)
    } catch {
      // skip malformed challenges
    }
  }

  return accepts
}

function extractParam(challenge: string, key: string): string | null {
  const regex = new RegExp(`${key}="([^"]*)"`)
  return challenge.match(regex)?.[1] ?? null
}
