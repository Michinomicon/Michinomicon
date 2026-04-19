import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'

import { getServerSideURL } from '@/utilities/getURL'
import InteractiveBackground from '@/components/InteractiveBackground'
import { PageTableOfContents } from '@/components/PageTableOfContents'
import { getNavTree } from '@/utilities/buildNavTree'
import { SidebarInset } from '@/components/ui/sidebar'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const navTree = await getNavTree()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/favicon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/favicon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/favicon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/favicon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/favicon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/favicon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/favicon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/favicon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/favicon-180x180.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/favicon-192x192.png" />
        <link rel="shortcut icon" type="image/x-icon" href="/icons/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
        <meta name="msapplication-TileColor" content="#5a168c" />
        <meta name="msapplication-TileImage" content="/icons/favicon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5a168c" />
      </head>
      <body>
        <div className="flex min-h-screen w-screen flex-col">
          <Providers>
            <InteractiveBackground enableSpotlight={true} enableReactiveTile={true} />
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
                className: '"bg-card text-foreground"',
                classNames: {
                  controls: 'bg-card text-foreground',
                  create: '',
                  edit: '',
                  logo: '',
                  logout: '',
                  preview: '',
                  user: '',
                },
                style: {
                  color: 'inherit',
                },
              }}
            />

            <Header />

            <PageTableOfContents navTree={navTree}></PageTableOfContents>
            <SidebarInset
              className={cn(
                'pointer-events-none max-w-screen min-w-0 rounded-none bg-none',
                'peer-data-[state=expanded]:top-[calc(calc(var(--header-height))+0)]',
                'xl:peer-data-[state=expanded]:pl-[calc(calc(var(--sidebar-width)))]',
                'peer-data-[state=collapsed]:w-[calc(100vw)] peer-data-[state=collapsed]:max-w-[calc(100vw)] peer-data-[state=expanded]:max-w-[calc(calc(100vw-var(--sidebar-width)))]',
              )}
            >
              <div
                id="mainContent"
                className={cn(
                  'mt-[calc(var(--header-height)+0px)]',
                  'mb-[calc(var(--footer-height)+0px)]',
                  'pointer-events-none relative mr-auto ml-auto min-h-screen max-w-7xl p-6 *:pointer-events-auto md:p-12',
                )}
              >
                {children}
              </div>
            </SidebarInset>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
