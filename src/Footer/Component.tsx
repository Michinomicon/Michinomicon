import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { getAppName } from '@/utilities/getAppName'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()
  const appTitle: string = getAppName()
  const navItems = footerData?.navItems || []

  return (
    <footer className="relative mt-auto border-t border-border bg-background z-1 rounded-none">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo text={appTitle} loading="eager" priority="high" />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
