import crypto from 'crypto'
import { Mppx, tempo } from 'mppx/nextjs'
import { privateKeyToAccount } from 'viem/accounts'

if (!process.env.TEMPO_CURRENCY) {
  console.warn('[mpp] TEMPO_CURRENCY not set — set to pathUSD contract address for your network')
}

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
  ],
  secretKey: process.env.MPP_SECRET_KEY ?? crypto.randomBytes(32).toString('base64'),
})

const AMOUNT = process.env.PAYMENT_AMOUNT ?? '0.01'

export const GET = mppx.tempo.charge({ amount: AMOUNT })(() => {
  const now = new Date().toISOString()
  const params = new URLSearchParams({ amount: AMOUNT, method: 'tempo', ts: now })
  return Response.json({
    message: 'Payment verified.',
    content:
      'Machines can now transact directly — no forms, no accounts, no friction. This is the future of agentic commerce.',
    timestamp: now,
    successUrl: `/success?${params.toString()}`,
  })
})
