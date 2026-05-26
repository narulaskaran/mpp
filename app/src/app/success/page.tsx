import Link from 'next/link'

type SearchParams = Promise<{ amount?: string; method?: string; ts?: string }>

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { amount, method, ts } = await searchParams
  const timestamp = ts ? new Date(ts).toLocaleString() : new Date().toLocaleString()
  const currency = method === 'stripe' ? 'USD' : 'USDC'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-zinc-200 px-8 py-5 flex items-center justify-between">
        <span className="font-semibold text-zinc-900">MPP Demo</span>
        <a
          href="https://mpp.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          mpp.dev →
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl space-y-10">

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-zinc-900">Payment verified</h1>
            <p className="text-base text-zinc-500">Access granted.</p>
          </div>

          <div className="space-y-4 text-sm text-zinc-600">
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <span className="text-zinc-500">Amount</span>
              <span className="font-medium text-zinc-900">{amount ?? '0.01'} {currency}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <span className="text-zinc-500">Method</span>
              <span className="font-medium text-zinc-900 capitalize">{method ?? 'tempo'}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <span className="text-zinc-500">Time</span>
              <span className="font-mono text-zinc-900">{timestamp}</span>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4 space-y-2">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Unlocked content</p>
            <p className="text-base text-zinc-800 leading-relaxed">
              Machines can now transact directly — no forms, no accounts, no friction. This is the future of agentic commerce.
            </p>
          </div>

          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-700 underline underline-offset-2 transition-colors">
            ← Back
          </Link>

        </div>
      </main>

    </div>
  )
}
