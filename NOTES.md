# MPP Demo — Integration Notes

**Goal:** Demo web app (React + shadcn + Tailwind + Vercel) accepting payments via Stripe Machine Payments Protocol (MPP), enabling AI agents to pay autonomously.

---

## Decisions

- **Stack:** Next.js (App Router) + shadcn/ui + Tailwind CSS — standard modern React stack, good shadcn support
- **Hosting:** Vercel — native Next.js support, easiest CI/CD, provisioned via Stripe Projects
- **Payments:** Stripe MPP — the whole point; allows AI agents to initiate and complete payments without human interaction

---

## Assumptions

- MPP is accessible via standard Stripe API with appropriate product/price setup
- Vercel project can be provisioned headlessly via `stripe projects add vercel/project`
- Agent-facing payment flow differs from human Checkout (no redirect, programmatic API calls)

---

## Setup Log

### Stripe CLI
- Not pre-installed on system
- Installing via Homebrew: `brew install stripe/stripe-cli/stripe`

---

## Friction / Rough Edges

- **Stripe CLI not pre-installed** — required `brew install` before any provisioning could start
- **TOS acceptance not bundled with `--yes`** — `vercel/hobby` add failed first; needed separate `--accept-tos` flag (expected `--yes` to cover it)
- **`--json` blocks browser auth** — `stripe projects init --json --yes` hard-errors; must run interactive first, then re-use `--json`
- **`vercel env add preview` requires explicit git branch** — `--yes` flag not sufficient for preview env; CLI returns `action_required` with `git_branch_required` reason. Production and development work fine. Undocumented in the sp-vercel skill.
- **`vercel inspect <url>` scope mismatch** — inspect command fails with "Not authorized: Trying to access resource under scope karan-narulas-projects". The deploy URL uses `narulaskaran-stripe` scope but inspect tries a different scope. `vercel ls` works as workaround.
- **User already has Vercel account** — Stripe Projects provisioned a *new* Vercel team/project rather than using user's existing team. No option during provisioning to specify existing team. `stripe projects link vercel --force` refreshes the token but resources are already created on the new team — no way to migrate. User ends up with a second Vercel team they didn't want.
- **Project transfer breaks Stripe Projects integration entirely** — user manually transferred the Vercel project to their existing team. After transfer, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from Stripe Projects are stale and all Vercel CLI commands fail with "Project not found". Stripe Projects has no awareness of the transfer. Token is scoped to the old team. No recovery path within Stripe Projects — must bypass and use user's own Vercel credentials.
- **Stripe Projects `vercel env add preview` broken** — setting env vars for preview environment requires explicit git branch arg. `--yes` flag insufficient. Undocumented breaking change in Vercel CLI v52. Production and development work fine.

---

## Feedback / Suggestions

- **`stripe projects llm-context` should include MPP docs/skill** — agent had to manually hunt for docs and make multiple failed WebFetch attempts. If `stripe projects add stripe/mpp` (or a Stripe payment integration) provided an `llm_context` field with MPP setup guidance, the agent would know exactly how to build the integration without searching. Currently `llm_context: null` for all Vercel services.
- **Unclear gating on Stripe MPP** — docs say "machine payments must be enabled for your account" but user believes it's publicly available. Docs also say "Preview" API version required (`2026-03-04.preview`). Need to verify actual availability. Note: Phase 1 (Tempo stablecoin) does NOT require Stripe at all — direct blockchain payment via `mppx` SDK.
- **MPP docs not on docs.stripe.com main nav** — multiple /docs.stripe.com URLs 404'd before finding the right one. MPP appears to be under `docs.stripe.com/payments/machine/mpp` but not linked from the main docs homepage.
- **"Stablecoins and Crypto" payment method not discoverable in Stripe Dashboard** — docs link to the Payment Methods settings page, but once there it's unclear how to actually *request* the method. No obvious CTA or button to enable it. User could not find where to submit the request.
- **Account rejected for Stablecoins and Crypto with no explanation** — user applied and was marked "ineligible" with zero feedback on why. No error code, no appeal path, no docs on eligibility criteria. This blocks the Stripe-side crypto path. Note: Phase 1 (direct Tempo via `mppx`) does NOT require this — it's pure blockchain, no Stripe crypto needed. Phase 2 SPT testing via `link-cli` also unaffected (SPTs use card/fiat rails, not crypto).

---

## Testing Plan

- Primary test: Hermes agent using `link-cli` against the deployed endpoint
- Phase 1: Tempo stablecoin (USDC) payment
- Phase 2: Stripe SPT (Shared Payment Token) — requires Stripe MPP beta access + `profile_` ID

---

## Open Questions

- What does the MPP payment flow look like from the agent side? (API shape, auth mechanism)
- Does MPP require special Stripe account permissions / beta access?
- How does the agent authenticate to the MPP endpoint?

