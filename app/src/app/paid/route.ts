import crypto from 'crypto'
import { Credential } from 'mppx'
import { Mppx as MppxClient, tempo as tempoClient } from 'mppx/client'
import { Mppx, stripe, tempo } from 'mppx/server'
import Stripe from 'stripe'
import { privateKeyToAccount } from 'viem/accounts'

if (!process.env.TEMPO_CURRENCY) {
  console.warn('[mpp] TEMPO_CURRENCY not set — set to pathUSD contract address for your network')
}

const stripeEnabled = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PROFILE_ID)

const mppx = Mppx.create({
  methods: [
    tempo.charge({
      currency: process.env.TEMPO_CURRENCY as `0x${string}`,
      recipient: (process.env.TEMPO_RECIPIENT ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
      testnet: process.env.TEMPO_TESTNET !== 'false',
      ...(process.env.FEE_PAYER_KEY && {
        feePayer: privateKeyToAccount(process.env.FEE_PAYER_KEY as `0x${string}`),
      }),
    }),
    ...(stripeEnabled
      ? [
          stripe.charge({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            client: new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-04.preview' as any }),
            networkId: process.env.STRIPE_PROFILE_ID!,
            paymentMethodTypes: ['card', 'link'],
          }),
        ]
      : []),
  ],
  secretKey: process.env.MPP_SECRET_KEY ?? crypto.randomBytes(32).toString('base64'),
})

const TEMPO_AMOUNT = process.env.PAYMENT_AMOUNT ?? '0.01'
const SPT_AMOUNT = process.env.STRIPE_PAYMENT_AMOUNT ?? '0.50'
const FALLBACK_JOKE = "Have you heard the joke about yoga? Nevermind, it's a bit of a stretch."

async function generateJoke(): Promise<string> {
  const walletKey = process.env.TEMPO_RECIPIENT_KEY
  if (!walletKey) return FALLBACK_JOKE

  try {
    const account = privateKeyToAccount(walletKey as `0x${string}`)
    const client = MppxClient.create({
      polyfill: false,
      methods: [tempoClient({ account })],
    })

    const res = await client.fetch('https://deepseek.mpp.paywithlocus.com/deepseek/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a joke writer. Reply with only the joke itself — no setup label, no preamble. Keep it work-appropriate and 1-2 sentences.',
          },
          {
            role: 'user',
            content: 'Tell me a short, work-appropriate joke in 1-2 sentences.',
          },
        ],
        max_tokens: 100,
        temperature: 1,
      }),
    })

    if (!res.ok) return FALLBACK_JOKE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any
    return data.choices?.[0]?.message?.content?.trim() ?? FALLBACK_JOKE
  } catch {
    return FALLBACK_JOKE
  }
}

export async function GET(request: Request): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const composeArgs: any[] = [
    ['tempo/charge', { amount: TEMPO_AMOUNT }],
    ...(stripeEnabled ? [['stripe/charge', { amount: SPT_AMOUNT, currency: 'usd', decimals: 2 }]] : []),
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
  const joke = await generateJoke()
  const payload = { amount, method, ts: now, joke }
  const signingKey = process.env.MPP_SECRET_KEY
  const sig = signingKey
    ? crypto.createHmac('sha256', signingKey).update(JSON.stringify(payload)).digest('base64url')
    : null
  const token = Buffer.from(JSON.stringify({ ...payload, sig })).toString('base64url')

  return result.withReceipt(
    Response.json({
      joke,
      timestamp: now,
      successUrl: `${protocol}//${host}/success?token=${token}`,
    }),
  )
}
