import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const referer = request.headers.get('referer')
  const secFetchSite = request.headers.get('sec-fetch-site')

  // current env domain
  const currentHost = request.headers.get('host')

  const isSameOrigin = secFetchSite === 'same-origin' || secFetchSite === 'same-site'

  // Check if the referer string includes currentHost
  const hasValidReferer = referer && currentHost && referer.includes(currentHost)

  // If a request lacks both valid origin markers, block it
  if (!isSameOrigin && !hasValidReferer) {
    return new NextResponse('Direct media access blocked', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/media/:path*', '/_next/image/:path*'],
}
