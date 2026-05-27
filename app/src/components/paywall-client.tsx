'use client'

import { useState } from 'react'
import { Check, Copy as CopyIcon } from 'lucide-react'

type Props = { baseUrl: string }

export default function PaywallClient({ baseUrl }: Props) {
  const endpointUrl = `${baseUrl}/paid`
  const mppxCmd = `npx mppx ${endpointUrl}`
  const tempoCmd = `tempo request ${endpointUrl}`
  const linkCmd = `link-cli mpp pay ${endpointUrl}`
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-auto">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5">
        <span className="text-base font-medium text-zinc-500">MPP Demo</span>
        <a href="https://narula.xyz" target="_blank" rel="noopener noreferrer"
          className="text-base text-rose-800 hover:text-rose-900 underline underline-offset-4 transition-colors">
          narula.xyz →
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-2xl space-y-12">

          {/* Hero */}
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight leading-tight font-sans">
              There's a joke<br />behind this paywall.
            </h1>
            <p className="text-lg text-zinc-500">
              Pay once to unlock it — works for humans and AI agents alike.{' '}
              <a href="https://mpp.dev" target="_blank" rel="noopener noreferrer"
                className="text-zinc-400 underline underline-offset-4 hover:text-zinc-600 transition-colors">
                What is MPP?
              </a>
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">

            <button
              className="w-full text-left bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 transition-colors rounded-2xl px-6 py-5 space-y-3 cursor-pointer"
              onClick={() => copy(mppxCmd, 'mppx')}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-white">$0.05 <span className="text-base font-normal text-zinc-300 ml-1">USDC.e via Tempo</span></span>
                {copied === 'mppx' ? <Check size={15} className="text-zinc-400" /> : <CopyIcon size={15} className="text-zinc-400" />}
              </div>
              <code className="block text-base font-mono text-zinc-300 truncate">
                <span className="text-zinc-400">$ </span>{mppxCmd}
              </code>
            </button>

            <button
              className="w-full text-left bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800 transition-colors rounded-2xl px-6 py-5 space-y-3 cursor-pointer"
              onClick={() => copy(tempoCmd, 'tempo')}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-white">$0.05 <span className="text-base font-normal text-zinc-300 ml-1">USDC.e via Tempo CLI</span></span>
                {copied === 'tempo' ? <Check size={15} className="text-zinc-400" /> : <CopyIcon size={15} className="text-zinc-400" />}
              </div>
              <code className="block text-base font-mono text-zinc-300 truncate">
                <span className="text-zinc-400">$ </span>{tempoCmd}
              </code>
            </button>

            <button
              className="w-full text-left border border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 transition-colors rounded-2xl px-6 py-5 space-y-3 cursor-pointer"
              onClick={() => copy(linkCmd, 'link')}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-zinc-900">$1.00 <span className="text-base font-normal text-zinc-400 ml-1">USD via Link by Stripe</span></span>
                {copied === 'link' ? <Check size={15} className="text-zinc-400" /> : <CopyIcon size={15} className="text-zinc-400" />}
              </div>
              <code className="block text-base font-mono text-zinc-400 truncate">
                <span className="text-zinc-300">$ </span>{linkCmd}
              </code>
            </button>

          </div>

</div>
      </main>

    </div>
  )
}
