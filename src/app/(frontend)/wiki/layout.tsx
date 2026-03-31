import { WikiSidebar } from '@/components/WikiSidebar'
import { getWikiNavigation } from '@/lib/wiki-data'
import React from 'react'

export default async function WikiLayout({ children }: { children: React.ReactNode }) {
  const navTree = await getWikiNavigation()
  console.debug(`WikiSidebar => navTree: `, navTree)

  return (
    <React.Fragment>
      <WikiSidebar navTree={navTree} />
      <div className="wiki-main-content p-6 mx-auto md:p-12 max-w-7xl">{children}</div>
    </React.Fragment>
  )
}
