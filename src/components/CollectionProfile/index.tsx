import { Media } from '@/payload-types'
import { ImageMedia } from '../Media/ImageMedia'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '../ui/item'
import { CMSLink } from '../Link'
import { ExternalLinkIcon } from 'lucide-react'
import { Separator } from '../ui/separator'

export type CollectionProfileSectionProps = { title: string; children?: React.ReactNode }
export const CollectionProfileSection = ({
  title,
  children,
}: CollectionProfileSectionProps): React.ReactNode => {
  return (
    <div className="mb-6 flex w-full flex-col gap-4">
      <Separator></Separator>
      <div className="prose w-full">
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  )
}

export type CollectionProfileLinkItemGroupProps = {
  links?:
    | {
        platform: string
        url: string
        id?: string | null | undefined
      }[]
    | null
    | undefined
}
export const CollectionProfileLinkItemGroup = ({
  links,
}: CollectionProfileLinkItemGroupProps): React.ReactNode => {
  return (
    <ItemGroup className="flex w-full flex-row flex-wrap gap-6">
      {links &&
        links.map(({ url, platform, id }) => (
          <Item
            key={id}
            variant={'muted'}
            className={'max-w-1/4 grow max-xl:max-w-1/3 max-md:min-w-full'}
          >
            <ItemContent>
              <ItemTitle>{platform}</ItemTitle>
              <ItemDescription>{url}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <CMSLink url={url} size="icon" appearance="ghost" className="rounded-full">
                <ExternalLinkIcon className="size-4" />
              </CMSLink>
            </ItemActions>
          </Item>
        ))}
    </ItemGroup>
  )
}

export type CollectionProfileHeaderProps = {
  title: string
  image: string | Media | null | undefined
}
export const CollectionProfileHeader = ({
  title,
  image,
}: CollectionProfileHeaderProps): React.ReactNode => {
  return (
    <div className="mb-6 grid grid-cols-6 items-center gap-4">
      <div className="col-span-2 col-start-1">
        {image && typeof image === 'object' && <ImageMedia src={image} />}
      </div>
      <div className="col-span-4 col-start-3">
        <span className="prose">
          <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
        </span>
      </div>
    </div>
  )
}
