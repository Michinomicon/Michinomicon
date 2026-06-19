'use client'

import React, { createContext, useContext, useState } from 'react'

export type PageAnchor = {
  id: string
  title: string
}

type PageAnchorsContextType = {
  anchors: PageAnchor[]
  setAnchors: React.Dispatch<React.SetStateAction<PageAnchor[]>>
}

const PageAnchorsContext = createContext<PageAnchorsContextType>({
  anchors: [],
  setAnchors: () => {},
})

export const PageAnchorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anchors, setAnchors] = useState<PageAnchor[]>([])

  return (
    <PageAnchorsContext.Provider value={{ anchors, setAnchors }}>
      {children}
    </PageAnchorsContext.Provider>
  )
}

export const usePageAnchors = () => useContext(PageAnchorsContext)
