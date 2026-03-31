'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { WikiNavItem } from '@/lib/wiki-data'
import React from 'react'

export function WikiSidebar({ navTree }: { navTree: WikiNavItem[] }) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))] z-10">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }
  return (
    <Sidebar className="sidebar top-(--header-height) h-[calc(100svh-var(--header-height))] z-10">
      <SidebarContent className="sidebar-content">
        <SidebarGroup className="sidebar-group">
          <SidebarMenu className="sidebar-menu">
            {navTree.map((item, index) => (
              <TreeItem key={index} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

// A recursive component to handle infinite nesting of categories
function TreeItem({ item }: { item: WikiNavItem }) {
  // If it's a Page (has a URL but no items), render a standard link
  if (item.url && !item.items?.length) {
    console.debug(`creating wiki tree item for LEAF item: `, item)
    return (
      <SidebarMenuItem className="sidebar-menu-item">
        <SidebarMenuButton asChild>
          <Link href={item.url}>{item.title}</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  console.debug(`creating wiki tree item for BRANCH item: `, item)

  // If it's a Category (has items), render a Collapsible folder
  return (
    <SidebarMenuItem className="sidebar-menu-item">
      <Collapsible defaultOpen={false} className="group/collapsible w-full">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub className="sidebar-menu-sub">
            {item.items?.map((subItem, index) =>
              // If the sub-item is a page, render a sub-button
              subItem.url ? (
                <SidebarMenuSubItem key={index}>
                  <SidebarMenuSubButton asChild>
                    <Link href={subItem.url}>{subItem.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ) : (
                // If the sub-item is another category, recurse!
                <TreeItem key={index} item={subItem} />
              ),
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
