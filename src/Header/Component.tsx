import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'
import { getAppName } from '@/utilities/getAppName'

export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()
  const appTitle: string = getAppName()

  return <HeaderClient appTitle={appTitle} data={headerData} />
}
