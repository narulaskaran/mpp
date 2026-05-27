# mpp

Demo of both sides of [MPP](https://mpp.dev) — selling and buying machine payments in a single request cycle.

Pay to unlock a joke at [mpp-demo-eta.vercel.app](https://mpp-demo-eta.vercel.app).

## Endpoints

**`/paid/onchain`** — direct on-chain payment via Tempo (USDC.e). Payment received, then the server immediately spends it to call OpenAI via [mpp.dev/services](https://mpp.dev/services) to generate a fresh joke. Remaining balance sweeps to a personal wallet after each request.

**`/paid/stripe`** — Stripe-backed payments. Accepts USDC.e via Stripe crypto (deposit address per request) or USD via Link (SPT). USD can't yet be spent on MPP-gated APIs, so the joke comes from a static fallback.

