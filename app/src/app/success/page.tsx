import crypto from 'crypto'
import { redirect } from 'next/navigation'
import Link from 'next/link'

type SearchParams = Promise<{ token?: string }>

function decodeToken(token: string): { amount: string; method: string; ts: string; joke: string } | null {
  try {
    const { amount, method, ts, joke, sig } = JSON.parse(Buffer.from(token, 'base64url').toString())
    if (!amount || !method || !ts || !joke) return null
    const signingKey = process.env.MPP_SECRET_KEY
    if (signingKey) {
      const expected = crypto
        .createHmac('sha256', signingKey)
        .update(JSON.stringify({ amount, method, ts, joke }))
        .digest('base64url')
      if (!sig || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    }
    return { amount, method, ts, joke }
  } catch (err) {
    console.error('[success] failed to decode token:', err)
    return null
  }
}

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams
  const data = token ? decodeToken(token) : null
  if (!data) redirect('/')

  const { amount, method, ts, joke } = data
  const timestamp = new Date(ts).toLocaleString()
  const currency = method === 'stripe' ? 'USD' : 'USDC'

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg space-y-12">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">MPP Demo</span>
          <a href="https://narula.xyz" target="_blank" rel="noopener noreferrer"
            className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors">
            narula.xyz →
          </a>
        </div>

        {/* Joke */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-sm text-zinc-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Payment verified
          </div>
          <p className="text-3xl font-semibold tracking-tight text-zinc-900 leading-snug">
            {joke}
          </p>
        </div>

        {/* Receipt */}
        <div className="space-y-2 text-sm text-zinc-500">
          <div className="flex justify-between py-2 border-b border-zinc-100">
            <span>Amount</span>
            <span className="text-zinc-900 font-medium">{amount} {currency}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-100">
            <span>Method</span>
            <span className="text-zinc-900 font-medium capitalize">{method}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-100">
            <span>Time</span>
            <span className="font-mono text-zinc-700">{timestamp}</span>
          </div>
        </div>

        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors">
          ← Back
        </Link>

      </div>
    </div>
  )
}
