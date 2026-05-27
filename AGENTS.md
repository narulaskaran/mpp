<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "mpp".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

## Agent rules

- Do NOT use `stripe projects` or the `stripe-projects-cli` skill for any task in this repo. Use the Vercel CLI (`vercel`) and Stripe CLI (`stripe`) directly instead.

## App structure

Next.js app in `app/`. Two paid endpoints:
- `GET /paid/onchain` — direct on-chain tempo payment; joke fetched via OpenAI at `https://openai.mpp.tempo.xyz` paid with `TEMPO_RECIPIENT_KEY` wallet
- `GET /paid/stripe` — Stripe-backed: crypto via `createPayToAddress` (Stripe PaymentIntent with `payment_method_types: ['crypto']`) + SPT fiat via `stripe.charge`; joke is hardcoded fallback (server wallet receives no funds on this path)

`/paid` redirects to `/`.

## Key env vars

| Var | Purpose |
|-----|---------|
| `TEMPO_CURRENCY` | pathUSD contract address |
| `TEMPO_RECIPIENT` | static wallet for on-chain route |
| `TEMPO_RECIPIENT_KEY` | private key; funds OpenAI joke on on-chain route |
| `STRIPE_SECRET_KEY` | enables both Stripe routes |
| `STRIPE_PROFILE_ID` | enables SPT fiat on stripe route |
| `MPP_SECRET_KEY` | signs success tokens |

## Crypto via Stripe

`createPayToAddress` in `/paid/stripe/route.ts` creates a fresh Stripe PaymentIntent per request (`payment_method_types: ['crypto']`, `mode: 'deposit'`, `networks: ['tempo']`). Deposit address cached in-memory (5 min TTL). For production swap the Map for Redis.

## Gotchas

- `TEMPO_TESTNET` must match the Stripe key mode. Live key (`sk_live_`) → `TEMPO_TESTNET=false`. Mismatch causes "no matching transfer found" on credential verification.
- `tempoClient` on the client side (used in `generateJoke`) requires `maxDeposit` set or it throws "No action in context". `maxDeposit` must be ≤ wallet balance at call time.
- `link-cli mpp pay` requires a pre-created spend request (`link-cli spend-request create ...`). Not a true one-liner.
