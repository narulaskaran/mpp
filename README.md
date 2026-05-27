# mpp

Demo of both sides of [MPP](https://mpp.dev) — selling and buying machine payments in a single request cycle.

Pay to unlock a joke at [mpp-demo-eta.vercel.app](https://mpp-demo-eta.vercel.app).

**Tempo (USDC.e)** — payment received, then the server immediately spends it to call the DeepSeek service from [mpp.dev/services](https://mpp.dev/services) to generate a fresh joke. The server wallet sweeps any remaining balance to a personal wallet after each request.

**Link (USD)** — payment processed over Stripe rails. Works end-to-end, but USD can't yet be spent on MPP-gated APIs, so the joke comes from a static fallback.
