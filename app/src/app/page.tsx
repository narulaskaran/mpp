import { headers } from 'next/headers'
import PaywallClient from '@/components/paywall-client'

export default async function Home() {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  return <PaywallClient baseUrl={baseUrl} />
}
