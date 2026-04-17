'use client'

import Link from 'next/link'
import { Logo, LogoProps } from '@/components/Logo/Logo'

type AppMainLogoProps = LogoProps

export const AppMainLogo = (props: AppMainLogoProps) => {
  return (
    <Link href="/home">
      <Logo {...props} />
    </Link>
  )
}
