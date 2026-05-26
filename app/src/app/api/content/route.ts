import crypto from 'crypto'
import { Credential } from 'mppx'
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
  const params = new URLSearchParams({ amount, method, ts: now })

  return result.withReceipt(
    Response.json({
      message: 'Payment verified.',
      content:
        'Machines can now transact directly — no forms, no accounts, no friction. This is the future of agentic commerce.',
      timestamp: now,
      successUrl: `${protocol}//${host}/success?${params.toString()}`,
    }),
  )
}
