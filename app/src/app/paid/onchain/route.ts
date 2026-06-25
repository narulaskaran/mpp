import crypto from 'crypto'
import { waitUntil } from '@vercel/functions'
import { Credential } from 'mppx'
import { Mppx as MppxClient, tempo as tempoClient } from 'mppx/client'
import { Mppx, tempo } from 'mppx/server'
import { type Chain, createClient, http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempo as tempoChain, tempoTestnet } from 'viem/chains'
import { Actions } from 'viem/tempo'
import { FALLBACK_JOKE, PAYMENT_AMOUNT } from '@/lib/constants'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const
const TEMPO_MAINNET_CURRENCY = '0x20C000000000000000000000b9537d11c60E8b50' as const
const TEMPO_TESTNET_CURRENCY = '0x20c0000000000000000000000000000000000000' as const
const TEMPO_MAINNET_RPC_URL = 'https://rpc.tempo.xyz'
const TEMPO_TESTNET_RPC_URL = 'https://rpc.moderato.tempo.xyz'
const MPP_SECRET_KEY = process.env.MPP_SECRET_KEY ?? (() => { throw new Error('MPP_SECRET_KEY is required') })()

type TempoNetworkConfig = {
  chain: Chain
  currency: `0x${string}`
  rpcUrl: string
  testnet: boolean
}

function parseTestnetParam(value: string | null): boolean | undefined {
  if (value === null) return undefined

  const normalized = value.trim().toLowerCase()
  if (normalized === '' || normalized === '1' || normalized === 'true' || normalized === 'yes') return true
  if (normalized === '0' || normalized === 'false' || normalized === 'no') return false

  return undefined
}

function getTempoNetworkConfig(requestUrl: string): TempoNetworkConfig {
  const explicitTestnet = parseTestnetParam(new URL(requestUrl).searchParams.get('testnet'))
  const testnet = explicitTestnet ?? process.env.TEMPO_TESTNET !== 'false'
  const chain = testnet ? tempoTestnet : tempoChain

  const currency = (() => {
    if (explicitTestnet === true) return process.env.TEMPO_TESTNET_CURRENCY ?? TEMPO_TESTNET_CURRENCY
    if (explicitTestnet === false) return process.env.TEMPO_MAINNET_CURRENCY ?? TEMPO_MAINNET_CURRENCY
    return process.env.TEMPO_CURRENCY
      ?? (testnet ? process.env.TEMPO_TESTNET_CURRENCY : process.env.TEMPO_MAINNET_CURRENCY)
      ?? (testnet ? TEMPO_TESTNET_CURRENCY : TEMPO_MAINNET_CURRENCY)
  })() as `0x${string}`

  const rpcUrl = (() => {
    if (explicitTestnet === true) return process.env.TEMPO_TESTNET_RPC_URL ?? TEMPO_TESTNET_RPC_URL
    if (explicitTestnet === false) return process.env.TEMPO_MAINNET_RPC_URL ?? TEMPO_MAINNET_RPC_URL
    return process.env.TEMPO_RPC_URL
      ?? (testnet ? process.env.TEMPO_TESTNET_RPC_URL : process.env.TEMPO_MAINNET_RPC_URL)
      ?? (testnet ? TEMPO_TESTNET_RPC_URL : TEMPO_MAINNET_RPC_URL)
  })()

  return { chain, currency, rpcUrl, testnet }
}

function createMppx(config: TempoNetworkConfig) {
  return Mppx.create({
    methods: [
      tempo.charge({
        currency: config.currency,
        recipient: (process.env.TEMPO_RECIPIENT ?? ZERO_ADDRESS) as `0x${string}`,
        testnet: config.testnet,
        ...(process.env.FEE_PAYER_KEY && {
          feePayer: privateKeyToAccount(process.env.FEE_PAYER_KEY as `0x${string}`),
        }),
      }),
    ],
    secretKey: MPP_SECRET_KEY,
  })
}


async function sweepToPersonalWallet(account: ReturnType<typeof privateKeyToAccount>, config: TempoNetworkConfig) {
  const sweepTo = process.env.SWEEP_TO as `0x${string}` | undefined
  if (!sweepTo) {
    console.log('[sweep] skipped: SWEEP_TO not set')
    return
  }

  try {
    const client = createClient({ chain: config.chain, transport: http(config.rpcUrl), account })

    const balance = await Actions.token.getBalance(client, {
      account: account.address,
      token: config.currency,
    })

    const gasReserve = parseUnits('0.005', 6)
    if (balance <= gasReserve) {
      console.log('[sweep] skipped: balance at or below reserve', balance.toString())
      return
    }

    const amount = balance - gasReserve
    console.log('[sweep] transferring', amount.toString(), 'to', sweepTo)
    await Actions.token.transferSync(client, { amount, token: config.currency, to: sweepTo })
    console.log('[sweep] done')
  } catch (err) {
    console.error('[sweep] failed:', err)
  }
}

async function generateJoke(config: TempoNetworkConfig): Promise<{ joke: string; account: ReturnType<typeof privateKeyToAccount> | null }> {
  const walletKey = process.env.TEMPO_RECIPIENT_KEY
  if (!walletKey) return { joke: FALLBACK_JOKE, account: null }

  const account = privateKeyToAccount(walletKey as `0x${string}`)
  if (config.testnet) return { joke: FALLBACK_JOKE, account }

  try {
    const client = MppxClient.create({
      polyfill: false,
      methods: [tempoClient({
        account,
        maxDeposit: '0.05',
      })],
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

    if (!res.ok) {
      console.error('[joke] OpenAI non-ok:', res.status, await res.text().catch(() => ''))
      return { joke: FALLBACK_JOKE, account }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any
    return { joke: data.choices?.[0]?.message?.content?.trim() ?? FALLBACK_JOKE, account }
  } catch (err) {
    console.error('[joke] OpenAI error:', err)
    return { joke: FALLBACK_JOKE, account }
  }
}

export async function GET(request: Request): Promise<Response> {
  const tempoConfig = getTempoNetworkConfig(request.url)
  const mppx = createMppx(tempoConfig)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (mppx.compose as any)(['tempo/charge', { amount: PAYMENT_AMOUNT }])(request) as Awaited<ReturnType<ReturnType<typeof mppx.compose>>>

  if (result.status === 402) return result.challenge

  const { protocol, host } = new URL(request.url)
  const now = new Date().toISOString()

  let method = 'tempo'
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader) method = Credential.deserialize(authHeader).challenge.method
  } catch (err) {
    console.error('[onchain] failed to deserialize credential:', err)
  }

  const { joke, account } = await generateJoke(tempoConfig)
  if (account) waitUntil(sweepToPersonalWallet(account, tempoConfig).catch(console.error))

  const payload = { amount: PAYMENT_AMOUNT, method, network: tempoConfig.testnet ? 'testnet' : 'mainnet', ts: now, joke }
  const sig = crypto.createHmac('sha256', MPP_SECRET_KEY).update(JSON.stringify(payload)).digest('base64url')
  const token = Buffer.from(JSON.stringify({ ...payload, sig })).toString('base64url')

  return result.withReceipt(
    Response.json({
      joke,
      timestamp: now,
      successUrl: `${protocol}//${host}/success?token=${token}`,
    }),
  )
}
