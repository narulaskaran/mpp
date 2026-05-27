import crypto from 'crypto'
import { waitUntil } from '@vercel/functions'
import { Credential } from 'mppx'
import { Mppx as MppxClient, tempo as tempoClient } from 'mppx/client'
import { Mppx, tempo } from 'mppx/server'
import { createClient, http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempo as tempoChain } from 'viem/chains'
import { Actions } from 'viem/tempo'

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

const TEMPO_AMOUNT = process.env.PAYMENT_AMOUNT ?? '0.99'
const FALLBACK_JOKE = "Have you heard the joke about yoga? Nevermind, it's a bit of a stretch."

async function sweepToPersonalWallet(account: ReturnType<typeof privateKeyToAccount>) {
  const sweepTo = process.env.SWEEP_TO as `0x${string}` | undefined
  const currency = process.env.TEMPO_CURRENCY as `0x${string}` | undefined
  if (!sweepTo || !currency) {
    console.log('[sweep] skipped: SWEEP_TO or TEMPO_CURRENCY not set')
    return
  }

  try {
    const rpcUrl = process.env.TEMPO_RPC_URL ?? 'https://rpc.tempo.xyz'
    const client = createClient({ chain: tempoChain, transport: http(rpcUrl), account })

    const balance = await Actions.token.getBalance(client, {
      account: account.address,
      token: currency,
    })

    const gasReserve = parseUnits('0.005', 6)
    if (balance <= gasReserve) {
      console.log('[sweep] skipped: balance at or below reserve', balance.toString())
      return
    }

    const amount = balance - gasReserve
    console.log('[sweep] transferring', amount.toString(), 'to', sweepTo)
    await Actions.token.transferSync(client, { amount, token: currency, to: sweepTo })
    console.log('[sweep] done')
  } catch (err) {
    console.error('[sweep] failed:', err)
  }
}

async function generateJoke(): Promise<{ joke: string; account: ReturnType<typeof privateKeyToAccount> | null }> {
  const walletKey = process.env.TEMPO_RECIPIENT_KEY
  if (!walletKey) return { joke: FALLBACK_JOKE, account: null }

  try {
    const account = privateKeyToAccount(walletKey as `0x${string}`)
    const client = MppxClient.create({
      polyfill: false,
      methods: [tempoClient({ account })],
    })

    const res = await client.fetch('https://openai.mpp.tempo.xyz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      }),
    })

    if (!res.ok) return { joke: FALLBACK_JOKE, account }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any
    return { joke: data.choices?.[0]?.message?.content?.trim() ?? FALLBACK_JOKE, account }
  } catch {
    return { joke: FALLBACK_JOKE, account: null }
  }
}

export async function GET(request: Request): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (mppx.compose as any)(['tempo/charge', { amount: TEMPO_AMOUNT }])(request) as Awaited<ReturnType<ReturnType<typeof mppx.compose>>>

  if (result.status === 402) return result.challenge

  const { protocol, host } = new URL(request.url)
  const now = new Date().toISOString()

  let method = 'tempo'
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader) method = Credential.deserialize(authHeader).challenge.method
  } catch {}

  const { joke, account } = await generateJoke()
  if (account) waitUntil(sweepToPersonalWallet(account).catch(console.error))

  const payload = { amount: TEMPO_AMOUNT, method, ts: now, joke }
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
