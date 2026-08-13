'use client'
import React from 'react'
import { CollectionItemCardStyle } from '.'
import { cn } from '@/utilities/ui'
import { LayoutGrid, StretchHorizontal, LayoutList } from 'lucide-react'
import { ToggleGroupItem, ToggleGroup } from '../ui/toggle-group'

export type GridCardStyleName = (string & 'grid') | 'list' | 'compact-list'

const GridLayoutProps: CollectionItemCardStyle = {
  showTags: false,
  showDescription: true,
  showImages: true,
  width: 'sm',
  height: 'sm',
  layout: 'vertical',
}

const ListLayoutProps: CollectionItemCardStyle = {
  showTags: false,
  showDescription: true,
  showImages: true,
  width: 'lg',
  height: 'md',
  layout: 'horizontal',
}

const CompactListLayoutProps: CollectionItemCardStyle = {
  showTags: false,
  showDescription: false,
  showImages: true,
  width: 'lg',
  height: 'sm',
  layout: 'horizontal',
}

export const getGridCardStyle = (layout: GridCardStyleName): CollectionItemCardStyle => {
  switch (layout) {
    case 'grid':
      return GridLayoutProps
    case 'list':
      return ListLayoutProps
    case 'compact-list':
      return CompactListLayoutProps
  }
}

export function GridLayoutToolbar({
  value,
  onValueChange,
  ...props
}: {
  value: GridCardStyleName
  onValueChange: (value: CollectionItemCardStyle) => void
} & React.ComponentPropsWithoutRef<'div'>): React.ReactNode {
  const [gridCardStyle, setGridCardStyle] = React.useState<GridCardStyleName>(value)

  const [_cardStyle, setCardStyle] = React.useState<CollectionItemCardStyle>(
    getGridCardStyle(gridCardStyle),
  )

  const handleSetCollectionLayout = (value: GridCardStyleName) => {
    setGridCardStyle(value)
    const newCardStyle = getGridCardStyle(value)
    setCardStyle(newCardStyle)
    onValueChange(newCardStyle)
  }

  return (
    <div className={cn('absolute -top-12 right-1')} {...props}>
      <div className={'flex flex-row flex-nowrap items-center justify-start'}>
        <ToggleGroup
          className="rounded-l-lg rounded-r-lg"
          value={gridCardStyle}
          onValueChange={handleSetCollectionLayout}
          type="single"
          spacing={1}
          variant="outline"
          size="lg"
        >
          <ToggleGroupItem className="rounded-none rounded-l-lg" value="grid">
            <LayoutGrid />
          </ToggleGroupItem>
          <ToggleGroupItem className="rounded-none" value="list">
            <StretchHorizontal />
          </ToggleGroupItem>
          <ToggleGroupItem className="rounded-none rounded-r-lg" value="compact-list">
            <LayoutList />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
