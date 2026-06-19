'use client'

import React, { createContext, useContext, useState } from 'react'

export type TOCItem = {
  depth: number
  id: string
  title: string
  url: string
}

type PageTOCContextType = {
  tocItems: TOCItem[]
  setTOCItems: React.Dispatch<React.SetStateAction<TOCItem[]>>
}

const PageTOCContext = createContext<PageTOCContextType>({
  tocItems: [],
  setTOCItems: () => {},
})

export const PageTOCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tocItems, setTOCItems] = useState<TOCItem[]>([])

  return (
    <PageTOCContext.Provider value={{ tocItems: tocItems, setTOCItems: setTOCItems }}>
      {children}
    </PageTOCContext.Provider>
  )
}

export const usePageTOC = () => useContext(PageTOCContext)
