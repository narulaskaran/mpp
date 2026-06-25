const card = {
  name: 'MPP Demo',
  url: 'https://mpp-demo-eta.vercel.app',
  description: 'Machine-payable joke API. Accepts crypto (USDC.e on Tempo) and fiat (Stripe card/link) payments via the Machine Payments Protocol.',
  provider: { name: 'Karan Narula' },
  protocols: ['mpp'],
  endpoints: [
    {
      path: '/paid/onchain',
      method: 'GET',
      description: 'AI-generated joke via on-chain Tempo payment',
      payment_required: true,
    },
    {
      path: '/paid/stripe',
      method: 'GET',
      description: 'Joke via Stripe payment (crypto or card/link)',
      payment_required: true,
    },
  ],
  discovery: {
    openapi: '/openapi.json',
    llms_txt: '/llms.txt',
  },
}

export async function GET() {
  return Response.json(card, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
