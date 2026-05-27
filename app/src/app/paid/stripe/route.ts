import crypto from 'crypto'
import { Credential } from 'mppx'
import { Mppx, stripe, tempo } from 'mppx/server'
import Stripe from 'stripe'
import { privateKeyToAccount } from 'viem/accounts'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[mpp] STRIPE_SECRET_KEY not set — Stripe payments disabled')
}
if (!process.env.STRIPE_PROFILE_ID) {
  console.warn('[mpp] STRIPE_PROFILE_ID not set — SPT payments disabled')
}
if (!process.env.TEMPO_CURRENCY) {
  console.warn('[mpp] TEMPO_CURRENCY not set — set to pathUSD contract address for your network')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-04.preview' as never })
  : null

const sptEnabled = !!(stripeClient && process.env.STRIPE_PROFILE_ID)

const TEMPO_AMOUNT = process.env.PAYMENT_AMOUNT ?? '0.99'
const SPT_AMOUNT = process.env.STRIPE_PAYMENT_AMOUNT ?? '0.99'
const FALLBACK_JOKE = "Have you heard the joke about yoga? Nevermind, it's a bit of a stretch."
const MPP_SECRET_KEY = process.env.MPP_SECRET_KEY ?? crypto.randomBytes(32).toString('base64')

// Deposit address -> expiry timestamp. For production use a distributed cache (e.g. Redis).
const depositCache = new Map<string, number>()
const CACHE_TTL = 5 * 60 * 1000

async function createPayToAddress(request: Request): Promise<`0x${string}`> {
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    try {
      const credential = Credential.deserialize(authHeader)
      if (credential.challenge.method === 'stripe') {
        // SPT credential — stripe.charge handles this, no deposit address needed
        return '0x0000000000000000000000000000000000000000' as `0x${string}`
      }
      // Tempo credential returning after payment — validate cached deposit address
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toAddress = (credential.challenge as any).request?.recipient as `0x${string}` | undefined
      if (!toAddress) throw new Error('No recipient in tempo credential')
      const expiry = depositCache.get(toAddress)
      if (!expiry || Date.now() > expiry) throw new Error('Deposit address expired')
      return toAddress
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg === 'Deposit address expired' || msg === 'No recipient in tempo credential') throw e
      // Credential parse error — fall through to create new PaymentIntent
    }
  }

  if (!stripeClient) throw new Error('STRIPE_SECRET_KEY not configured')

  const amountInCents = Math.round(parseFloat(TEMPO_AMOUNT) * 100)
  const pi = await stripeClient.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    payment_method_types: ['crypto'],
    payment_method_data: { type: 'crypto' },
    payment_method_options: {
      crypto: {
        mode: 'deposit',
        deposit_options: { networks: ['tempo'] },
      } as Stripe.PaymentIntentCreateParams.PaymentMethodOptions.Crypto,
    },
    confirm: true,
  })

  const details = (pi.next_action as unknown as { crypto_display_details?: { deposit_addresses?: Record<string, { address?: string }> } })?.crypto_display_details
  const address = details?.deposit_addresses?.tempo?.address
  if (!address) throw new Error('PaymentIntent returned no crypto deposit address')

  console.log(`[stripe-crypto] PI ${pi.id} -> ${address}`)
  depositCache.set(address, Date.now() + CACHE_TTL)
  return address as `0x${string}`
}

export async function GET(request: Request): Promise<Response> {
  const recipientAddress = await createPayToAddress(request)

  const mppx = Mppx.create({
    methods: [
      tempo.charge({
        currency: process.env.TEMPO_CURRENCY as `0x${string}`,
        recipient: recipientAddress,
        testnet: process.env.TEMPO_TESTNET !== 'false',
        ...(process.env.FEE_PAYER_KEY && {
          feePayer: privateKeyToAccount(process.env.FEE_PAYER_KEY as `0x${string}`),
        }),
      }),
      ...(sptEnabled
        ? [
            stripe.charge({
              client: stripeClient!,
              networkId: process.env.STRIPE_PROFILE_ID!,
              paymentMethodTypes: ['card', 'link'],
            }),
          ]
        : []),
    ],
    secretKey: MPP_SECRET_KEY,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const composeArgs: any[] = [
    ['tempo/charge', { amount: TEMPO_AMOUNT }],
    ...(sptEnabled ? [['stripe/charge', { amount: SPT_AMOUNT, currency: 'usd', decimals: 2 }]] : []),
  ]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (mppx.compose as any)(...composeArgs)(request) as Awaited<ReturnType<ReturnType<typeof mppx.compose>>>

  if (result.status === 402) return result.challenge

  const { protocol, host } = new URL(request.url)
  const now = new Date().toISOString()

  let method = 'mpp'
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader) method = Credential.deserialize(authHeader).challenge.method
  } catch {}

  const amount = method === 'stripe' ? SPT_AMOUNT : TEMPO_AMOUNT
  const payload = { amount, method, ts: now, joke: FALLBACK_JOKE }
  const signingKey = process.env.MPP_SECRET_KEY
  const sig = signingKey
    ? crypto.createHmac('sha256', signingKey).update(JSON.stringify(payload)).digest('base64url')
    : null
  const token = Buffer.from(JSON.stringify({ ...payload, sig })).toString('base64url')

  return result.withReceipt(
    Response.json({
      joke: FALLBACK_JOKE,
      timestamp: now,
      successUrl: `${protocol}//${host}/success?token=${token}`,
    }),
  )
}
