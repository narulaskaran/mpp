'use client'

import { useState } from 'react'

type Props = { baseUrl: string }

export default function PaywallClient({ baseUrl }: Props) {
  const endpointUrl = `${baseUrl}/api/content`
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

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

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-zinc-900">Paywalled content</h1>
            <p className="text-base text-zinc-500">
              This endpoint requires payment before returning a response.
            </p>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Price</p>
            <div className="flex gap-6 text-base text-zinc-900">
              <span>0.01 USDC via Tempo</span>
              <span className="text-zinc-300">|</span>
              <span>$0.50 via Stripe Link</span>
            </div>
          </div>

          {/* Endpoint */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Endpoint</p>
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
              <code className="text-sm text-zinc-800 font-mono flex-1 truncate">{endpointUrl}</code>
              <button
                className="text-sm text-zinc-400 hover:text-zinc-700 shrink-0 transition-colors"
                onClick={() => copy(endpointUrl, 'url')}
              >
                {copied === 'url' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* CLI */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Pay with mppx</p>
            <div
              className="bg-zinc-900 rounded-lg px-4 py-3 cursor-pointer"
              onClick={() => copy(`npx mppx ${endpointUrl}`, 'cli')}
            >
              <code className="text-sm text-zinc-100 font-mono">
                <span className="text-zinc-500">$ </span>npx mppx {endpointUrl}
              </code>
              {copied === 'cli' && (
                <span className="ml-4 text-xs text-zinc-400">Copied</span>
              )}
            </div>
          </div>

          {/* Flow */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">How it works</p>
            <ol className="space-y-3 text-sm text-zinc-600">
              <li><span className="font-mono text-zinc-400 mr-2">1.</span>GET /api/content → <span className="font-mono">402 Payment Required</span></li>
              <li><span className="font-mono text-zinc-400 mr-2">2.</span>Pay 0.01 USDC on Tempo or $0.50 via Link → <span className="font-mono">Authorization: Payment …</span></li>
              <li><span className="font-mono text-zinc-400 mr-2">3.</span>Retry with credential → <span className="font-mono">200 OK + Payment-Receipt</span></li>
            </ol>
          </div>

        </div>
      </main>

    </div>
  )
}
