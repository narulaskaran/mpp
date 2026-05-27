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
          <div className="space-y-4">

            {/* Tempo card — merged, two commands */}
            <div className="w-full bg-zinc-700 rounded-2xl px-6 py-5 space-y-4">
              <span className="text-2xl font-semibold text-white">$0.05 <span className="text-base font-normal text-zinc-300 ml-1">USDC.e via Tempo</span></span>

              <div className="space-y-2">
                <button
                  className="w-full text-left hover:bg-zinc-600 active:bg-zinc-800 transition-colors rounded-xl px-3 py-2 flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => copy(mppxCmd, 'mppx')}
                >
                  <code className="text-sm font-mono text-zinc-300 truncate">
                    <span className="text-zinc-500">$ </span>{mppxCmd}
                  </code>
                  {copied === 'mppx' ? <Check size={13} className="text-zinc-400 shrink-0" /> : <CopyIcon size={13} className="text-zinc-400 shrink-0" />}
                </button>

                <button
                  className="w-full text-left hover:bg-zinc-600 active:bg-zinc-800 transition-colors rounded-xl px-3 py-2 flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => copy(tempoCmd, 'tempo')}
                >
                  <code className="text-sm font-mono text-zinc-300 truncate">
                    <span className="text-zinc-500">$ </span>{tempoCmd}
                  </code>
                  {copied === 'tempo' ? <Check size={13} className="text-zinc-400 shrink-0" /> : <CopyIcon size={13} className="text-zinc-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Link card */}
            <div className="w-full rounded-2xl px-6 py-5 space-y-4" style={{ backgroundColor: '#00A63A' }}>
              <span className="text-2xl font-semibold text-white">$1.00 <span className="text-base font-normal ml-1" style={{ color: 'rgba(255,255,255,0.75)' }}>USD via Link</span></span>

              <button
                className="w-full text-left rounded-xl px-3 py-2 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                onMouseDown={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)')}
                onMouseUp={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.12)')}
                onClick={() => copy(linkCmd, 'link')}
              >
                <code className="text-sm font-mono truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>$ </span>{linkCmd}
                </code>
                {copied === 'link'
                  ? <Check size={13} style={{ color: 'rgba(255,255,255,0.6)' }} className="shrink-0" />
                  : <CopyIcon size={13} style={{ color: 'rgba(255,255,255,0.6)' }} className="shrink-0" />}
              </button>
            </div>

          </div>

        </div>
      </main>

    </div>
  )
}
