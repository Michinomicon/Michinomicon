'use client'
import { Header } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'
import React from 'react'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<NonNullable<Header['menuItems']>[number]>()
  const rowNumberText = rowNumber !== undefined ? `${String(rowNumber + 1)}` : '--'
  const defaultTitle = `${rowNumberText} New Item`

  let displayTitle = defaultTitle

  if (data.type) {
    if (data.type === 'item' && data.link) {
      const { label, url } = data.link
      displayTitle = `${rowNumberText} ( Link ) ${label || url}`
    } else if (data.type === 'group') {
      if (data.label) {
        // - Try to use server-fetched human-readable label
        // - Fall back to the raw ID if it hasn't been saved yet
        // - Fall back to 'New Item' if the row was just created
        const titleText = data.label || defaultTitle
        displayTitle = `${rowNumberText} ( Group ) ${titleText}`
      }
    }
  }

  return <div style={{ fontWeight: 500 }}>{`${displayTitle}`}</div>
}
