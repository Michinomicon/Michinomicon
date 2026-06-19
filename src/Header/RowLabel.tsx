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
    if (data.type === 'link' && data.link) {
      const { label, url } = data.link
      displayTitle = `${rowNumberText} ( Link ) ${label || url}`
    } else if (data.type === 'categories') {
      if (data.categoryReference && data.referenceLabel) {
        // - Try to use server-fetched human-readable label
        // - Fall back to the raw ID if it hasn't been saved yet
        // - Fall back to 'New Item' if the row was just created
        const titleText = data.referenceLabel || defaultTitle
        displayTitle = `${rowNumberText} ( Category ) ${titleText}`
      }
    } else if (data.type === 'pages') {
      if (data.pageReference && data.referenceLabel) {
        const titleText = data.referenceLabel || defaultTitle
        displayTitle = `${rowNumberText} ( Page ) ${titleText}`
      }
    }
  }

  return <div style={{ fontWeight: 500 }}>{`${displayTitle}`}</div>
}
