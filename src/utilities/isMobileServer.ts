import { headers } from 'next/headers'

export async function isMobileServer(): Promise<boolean> {
  // In Next.js 15+, headers() is asynchronous.
  // If you are on Next.js 14 or older, you do not need to `await` it.
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''

  // A basic regex to detect common mobile devices
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i

  return mobileRegex.test(userAgent)
}
