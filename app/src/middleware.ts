import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Payment, X-Payment-Required',
        'Access-Control-Expose-Headers': 'X-Payment-Required, X-Payment-Response',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Expose-Headers', 'X-Payment-Required, X-Payment-Response')
  return response
}

export const config = {
  matcher: ['/paid/:path*', '/openapi.json', '/llms.txt', '/.well-known/:path*'],
}
