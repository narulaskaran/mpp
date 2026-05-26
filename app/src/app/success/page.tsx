import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type SearchParams = Promise<{ amount?: string; method?: string; ts?: string }>

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { amount, method, ts } = await searchParams
  const timestamp = ts ? new Date(ts).toLocaleString() : new Date().toLocaleString()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-tight text-zinc-900">MPP Demo</span>
          <Badge variant="outline" className="text-xs font-normal text-zinc-500 border-zinc-200">
            Testnet
          </Badge>
        </div>
        <a
          href="https://mpp.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          mpp.dev →
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg space-y-6">
          {/* Success indicator */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-zinc-900">Payment Verified</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Access granted</p>
            </div>
          </div>

          {/* Receipt */}
          <Card className="border-zinc-200 shadow-none">
            <CardHeader className="pb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Receipt</p>
            </CardHeader>
            <Separator className="bg-zinc-100" />
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Amount</span>
                <span className="text-xs font-medium text-zinc-900">
                  {amount ?? '0.01'} {method === 'stripe' ? 'USD' : 'USDC'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Method</span>
                <Badge variant="outline" className="text-xs font-normal capitalize border-zinc-200">
                  {method ?? 'tempo'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Time</span>
                <span className="text-xs text-zinc-900 font-mono">{timestamp}</span>
              </div>
            </CardContent>
          </Card>

          {/* Unlocked content */}
          <Card className="border-zinc-200 shadow-none bg-zinc-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-400"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Unlocked
                </p>
              </div>
            </CardHeader>
            <Separator className="bg-zinc-200" />
            <CardContent className="pt-4">
              <p className="text-sm text-zinc-700 leading-relaxed">
                Machines can now transact directly — no forms, no accounts, no friction. This is the
                future of agentic commerce.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-2">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors underline underline-offset-2"
            >
              ← Back to demo
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-100 px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          Built with{' '}
          <a href="https://mpp.dev" className="underline underline-offset-2 hover:text-zinc-600">
            Machine Payments Protocol
          </a>
        </p>
        <p className="text-xs text-zinc-400">Powered by Stripe + Tempo</p>
      </footer>
    </div>
  )
}
