'use client'

import { useState } from 'react'
import { Check, Copy as CopyIcon, Info } from 'lucide-react'

type Props = { baseUrl: string }

export default function PaywallClient({ baseUrl }: Props) {
  const onchainUrl = `${baseUrl}/paid/onchain`
  const onchainTestnetUrl = `${onchainUrl}?testnet=true`
  const stripeUrl = `${baseUrl}/paid/stripe`

  const onchain_mppx = `npx mppx ${onchainUrl}`
  const onchain_tempo = `tempo request ${onchainUrl}`
  const onchain_testnet_mppx = `npx mppx ${onchainTestnetUrl} --rpc-url https://rpc.moderato.tempo.xyz`
  const onchain_testnet_tempo = `tempo request ${onchainTestnetUrl}`
  const stripe_link = `link-cli mpp pay ${stripeUrl}`
  const stripe_mppx = `npx mppx ${stripeUrl}`
  const stripe_tempo = `tempo request ${stripeUrl}`

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

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-8 py-5">
        <a href="https://github.com/narulaskaran/mpp" target="_blank" rel="noopener noreferrer"
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
          View on GitHub
        </a>
      </footer>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-8 pb-16">
        <div className="w-full max-w-2xl space-y-10">

          {/* Hero */}
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight leading-tight font-sans">
              There&apos;s a joke<br />behind this <span style={{ color: '#00A63A' }}>$0.99</span> paywall.
            </h1>
            <p className="text-lg text-zinc-500">
              Works for humans and AI agents alike.{' '}
              <a href="https://mpp.dev" target="_blank" rel="noopener noreferrer"
                className="text-zinc-400 underline underline-offset-4 hover:text-zinc-600 transition-colors">
                What is MPP?
              </a>
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">

            {/* On-chain option */}
            <div className="bg-zinc-50 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm text-zinc-400">Pay via Tempo</span>
                <div className="relative group ml-1">
                  <Info size={13} className="text-zinc-400 cursor-default" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    USDC.e · You&apos;ll get a freshly minted joke from OpenAI, powered by MPP
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                  </div>
                </div>
              </div>
              <div className="w-full bg-zinc-700 rounded-2xl px-4 py-3 space-y-1">
                <button
                  className="w-full text-left hover:bg-zinc-600 active:bg-zinc-800 transition-colors rounded-xl px-3 py-2 flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => copy(onchain_mppx, 'onchain_mppx')}
                >
                  <code className="text-sm font-mono text-zinc-300 truncate">
                    <span className="text-zinc-500">$ </span>{onchain_mppx}
                  </code>
                  {copied === 'onchain_mppx' ? <Check size={13} className="text-zinc-400 shrink-0" /> : <CopyIcon size={13} className="text-zinc-400 shrink-0" />}
                </button>
                <button
                  className="w-full text-left hover:bg-zinc-600 active:bg-zinc-800 transition-colors rounded-xl px-3 py-2 flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => copy(onchain_tempo, 'onchain_tempo')}
                >
                  <code className="text-sm font-mono text-zinc-300 truncate">
                    <span className="text-zinc-500">$ </span>{onchain_tempo}
                  </code>
                  {copied === 'onchain_tempo' ? <Check size={13} className="text-zinc-400 shrink-0" /> : <CopyIcon size={13} className="text-zinc-400 shrink-0" />}
                </button>
                <button
                  className="w-full text-left hover:bg-zinc-600 active:bg-zinc-800 transition-colors rounded-xl px-3 py-2 flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => copy(onchain_testnet_mppx, 'onchain_testnet_mppx')}
                >
                  <code className="text-sm font-mono text-zinc-300 truncate">
                    <span className="text-zinc-500">$ </span>{onchain_testnet_mppx}
                  </code>
                  {copied === 'onchain_testnet_mppx' ? <Check size={13} className="text-zinc-400 shrink-0" /> : <CopyIcon size={13} className="text-zinc-400 shrink-0" />}
                </button>
                <button
                  className="w-full text-left hover:bg-zinc-600 active:bg-zinc-800 transition-colors rounded-xl px-3 py-2 flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => copy(onchain_testnet_tempo, 'onchain_testnet_tempo')}
                >
                  <code className="text-sm font-mono text-zinc-300 truncate">
                    <span className="text-zinc-500">$ </span>{onchain_testnet_tempo}
                  </code>
                  {copied === 'onchain_testnet_tempo' ? <Check size={13} className="text-zinc-400 shrink-0" /> : <CopyIcon size={13} className="text-zinc-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Stripe option */}
            <div className="bg-zinc-50 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm text-zinc-400">Pay via Stripe</span>
                <div className="relative group ml-1">
                  <Info size={13} className="text-zinc-400 cursor-default" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    USDC.e or USD · You&apos;ll get access to the joke that everyone is raving about
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                  </div>
                </div>
              </div>
              <div className="w-full rounded-2xl px-4 py-3 space-y-1" style={{ backgroundColor: '#00A63A' }}>
                {[
                  { cmd: stripe_link, key: 'stripe_link', tooltip: 'Requires a spend request first — run: link-cli spend-request create' },
                  { cmd: stripe_mppx, key: 'stripe_mppx' },
                  { cmd: stripe_tempo, key: 'stripe_tempo' },
                ].map(({ cmd, key, tooltip }) => (
                  <div key={key} className="relative group/cmd">
                    <button
                      className="w-full text-left rounded-xl px-3 py-2 flex items-center justify-between gap-4 cursor-pointer transition-colors hover:bg-black/10 active:bg-black/20"
                      onClick={() => copy(cmd, key)}
                    >
                      <code className="text-sm font-mono truncate text-white/90">
                        <span className="text-white/50">$ </span>{cmd}
                      </code>
                      {copied === key
                        ? <Check size={13} className="text-white/60 shrink-0" />
                        : <CopyIcon size={13} className="text-white/60 shrink-0" />}
                    </button>
                    {tooltip && (
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-zinc-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/cmd:opacity-100 transition-opacity pointer-events-none z-10">
                        {tooltip}
                        <div className="absolute top-full left-4 border-4 border-transparent border-t-zinc-800" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  )
}
