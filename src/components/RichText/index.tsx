import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  SerializedUploadNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'
import { parseCMSLinkReferenceHref } from '@/components/Link'
import HoverCardLink from '@/components/HoverCardLink'
import Link from 'next/link'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }): string => {
  const href = parseCMSLinkReferenceHref(linkNode.fields.doc) || ''
  return href
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const fields = node.fields

    if (fields.linkType === 'internal' && fields.enableHoverCard && fields.doc) {
      const pageData = fields.doc
      const url = internalDocToHref({ linkNode: node })
      return (
        <HoverCardLink url={url} reference={pageData} key={node.format}>
          {children}
        </HoverCardLink>
      )
    }
    // Fallback: Standard Link Rendering
    let href = fields.url || '#'
    if (
      fields.linkType === 'internal' &&
      typeof fields.doc?.value === 'object' &&
      fields.doc?.value?.slug
    ) {
      href = internalDocToHref({ linkNode: node })
    }
    const newTabProps = fields.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    return (
      <Link
        href={href}
        key={node.format}
        {...newTabProps}
        className="non-hover text-primary underline"
      >
        {children}
      </Link>
    )
  },
  upload: ({ node }: { node: SerializedUploadNode }) => (
    <MediaBlock
      className={'rich-text-upload'}
      blockType="mediaBlock"
      mediaProps={{ containerClassNames: 'rich-text-upload', hideCaption: true }}
      enableGutter={false}
      disableInnerContainer={true}
      media={
        node.type === 'upload' && node.relationTo === 'media' && typeof node.value === 'object'
          ? node.value
          : ''
      }
      {...node.fields}
    />
  ),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }: { node: SerializedBlockNode<MediaBlockProps> }) => (
      <MediaBlock
        className="rich-text-block-media col-span-3 col-start-1"
        imgClassName="m-0"
        captionClassName="mx-auto max-w-3xl"
        enableGutter={false}
        disableInnerContainer={true}
        mediaProps={{ containerClassNames: 'rich-text-block-media', hideCaption: true }}
        {...node.fields}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext rounded-none',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
