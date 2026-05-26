'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Props = { baseUrl: string }

export default function PaywallClient({ baseUrl }: Props) {
  const endpointUrl = `${baseUrl}/api/content`
  const [copied, setCopied] = useState(false)

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          {/* Locked content card */}
          <Card className="border-zinc-200 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-zinc-400"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-sm font-medium text-zinc-900">Premium Access</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    This resource requires a micropayment. Pay once, access instantly — no account
                    required.
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-4">
                  <Badge className="bg-zinc-900 text-white text-xs font-normal hover:bg-zinc-900">
                    0.01 USDC
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal text-zinc-500 border-zinc-200">
                    Tempo
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <Separator className="bg-zinc-100" />

            <CardContent className="pt-4 space-y-4">
              {/* Endpoint */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Endpoint</p>
                <div className="flex items-center gap-2 bg-zinc-50 rounded-md px-3 py-2 border border-zinc-100">
                  <code className="text-xs text-zinc-700 font-mono flex-1 truncate">{endpointUrl}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-700 shrink-0"
                    onClick={() => copy(endpointUrl)}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* CLI command */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Test with mppx CLI
                </p>
                <div
                  className="bg-zinc-900 rounded-md px-3 py-2.5 cursor-pointer group"
                  onClick={() => copy(`npx mppx ${endpointUrl}`)}
                >
                  <code className="text-xs text-zinc-100 font-mono">
                    <span className="text-zinc-500">$</span> npx mppx {endpointUrl}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How it works */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide px-1">
              How it works
            </p>
            <div className="space-y-2">
              {[
                {
                  step: '1',
                  label: 'Request',
                  desc: 'GET /api/content',
                  sub: '→ 402 Payment Required',
                },
                {
                  step: '2',
                  label: 'Pay',
                  desc: '0.01 USDC via Tempo',
                  sub: '→ Authorization: Payment <credential>',
                },
                {
                  step: '3',
                  label: 'Access',
                  desc: 'GET /api/content (with credential)',
                  sub: '→ 200 OK + Payment-Receipt',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-3 items-start">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500">
                    {item.step}
                  </span>
                  <div>
                    <span className="text-xs font-medium text-zinc-700">{item.label} </span>
                    <code className="text-xs text-zinc-500 font-mono">{item.desc}</code>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
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
