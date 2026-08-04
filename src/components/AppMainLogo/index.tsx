'use client'

import Link from 'next/link'
import { Logo, LogoProps } from '@/components/Logo/Logo'

type AppMainLogoProps = LogoProps

export const AppMainLogo = (props: AppMainLogoProps) => {
  const appName = props.text || process.env.APP_NAME
  return (
    <Link href="/home">
      <Logo {...props} text={appName} />
    </Link>
  )
}
