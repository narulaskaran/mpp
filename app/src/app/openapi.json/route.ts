import { PAYMENT_AMOUNT, STRIPE_PAYMENT_AMOUNT } from '@/lib/constants'

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'MPP Demo API',
    version: '1.0.0',
    description: 'Machine-payable joke API. Pay with crypto (Tempo) or fiat (Stripe) to receive an AI-generated joke.',
  },
  servers: [{ url: 'https://mpp-demo-eta.vercel.app' }],
  paths: {
    '/paid/onchain': {
      get: {
        operationId: 'getJokeOnchain',
        summary: 'Get an AI-generated joke via on-chain payment (Tempo network)',
        'x-payment-info': {
          required: true,
          protocol: 'MPP',
          accepts: [
            {
              network: 'tempo',
              asset: 'USDC.e',
              amount: PAYMENT_AMOUNT,
            },
          ],
        },
        responses: {
          '200': {
            description: 'Joke delivered after successful payment',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/JokeResponse' } } },
          },
          '402': { description: 'Payment required — see X-Payment-Required header' },
        },
      },
    },
    '/paid/stripe': {
      get: {
        operationId: 'getJokeStripe',
        summary: 'Get a joke via Stripe payment (crypto deposit or card/link)',
        'x-payment-info': {
          required: true,
          protocol: 'MPP',
          accepts: [
            {
              network: 'tempo',
              asset: 'USDC.e',
              amount: PAYMENT_AMOUNT,
            },
            {
              network: 'stripe',
              asset: 'USD',
              amount: STRIPE_PAYMENT_AMOUNT,
              methods: ['card', 'link'],
            },
          ],
        },
        responses: {
          '200': {
            description: 'Joke delivered after successful payment',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/JokeResponse' } } },
          },
          '402': { description: 'Payment required — see X-Payment-Required header' },
        },
      },
    },
  },
  components: {
    schemas: {
      JokeResponse: {
        type: 'object',
        properties: {
          joke: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          successUrl: { type: 'string', format: 'uri' },
        },
        required: ['joke', 'timestamp', 'successUrl'],
      },
    },
  },
}

export async function GET() {
  return Response.json(spec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
