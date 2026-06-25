const content = `# MPP Demo — Machine-Payable Joke API

> A demonstration of the Machine Payments Protocol (MPP).
> Pay a small fee to receive an AI-generated joke.

## Endpoints

- GET /paid/onchain — On-chain payment via Tempo network (USDC.e). Returns an AI-generated joke.
- GET /paid/stripe — Stripe-backed payment (crypto deposit on Tempo, or card/link via SPT). Returns a joke.

## How to pay

1. Send a GET request to a paid endpoint with no credentials.
2. You will receive HTTP 402 with an X-Payment-Required header (base64-encoded JSON).
3. Decode the header to see accepted payment methods, amounts, and recipient addresses.
4. Construct a payment credential and resend the request with an Authorization header.
5. On success you receive HTTP 200 with the joke payload.

## Payment details

- Amount: $0.99 USD equivalent
- On-chain: USDC.e on Tempo network
- Fiat: Card or Link via Stripe (when available)

## Discovery

- OpenAPI spec: /openapi.json
- Agent card: /.well-known/agent-card.json

## More info

Protocol docs: https://mpp.dev
`

export async function GET() {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
