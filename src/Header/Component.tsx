import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'
import { getAppName } from '@/utilities/getAppName'
import { getMainMenu, MenuTreeItem } from '@/utilities/buildNavTree'
import TwitchStatus from '@/components/TwitchStatus'

export async function Header(): Promise<React.JSX.Element> {
  const headerData = await getCachedGlobal('header', 1)()

  const appTitle: string = getAppName()
  const menuTree: MenuTreeItem[] = await getMainMenu()
  return (
    <HeaderClient
      appTitle={appTitle}
      data={headerData}
      menuTree={menuTree}
      twitchStatusSlot={<TwitchStatus />}
    />
  )
}
