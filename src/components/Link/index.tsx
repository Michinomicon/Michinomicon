import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import { CollectionSlug } from 'payload'
import { Collections } from '@/utilities/collectionTypes'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipProps,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type CMSLinkReference<R extends CollectionSlug, V = Collections[R]> = {
  relationTo: string & R
  value: Partial<V> | string
}
export type CMSLinkPageReference = CMSLinkReference<'pages'>
export type CMSLinkPostReference = CMSLinkReference<'posts'>

export type CMSLinkProps = {
  type?: 'reference' | 'custom' | null
  reference?: CMSLinkReference<'pages'> | CMSLinkReference<'posts'> | null
  url?: string | null
  label?: string | undefined
  appearance?: ButtonProps['variant'] | null
  size?: ButtonProps['size'] | null
  className?: string
  children?: React.ReactNode
  newTab?: boolean | null
  tooltipContent?: string | undefined
  tooltipProps?: TooltipProps
}

function getHref({ type = 'reference', reference, url }: CMSLinkProps) {
  const initialUrl: string = url && url.length > 0 ? url : ''
  let parsedUrl = initialUrl

  if (type === 'reference') {
    parsedUrl =
      typeof reference?.value === 'object' && reference.value.slug
        ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
            reference.value.slug
          }`
        : initialUrl
  } else if (type === 'custom') {
    if (
      !initialUrl.startsWith('http') &&
      !initialUrl.startsWith('//') &&
      !initialUrl.startsWith('/') &&
      !initialUrl.startsWith('#') &&
      !initialUrl.startsWith('mailto:') &&
      !initialUrl.startsWith('tel:')
    ) {
      parsedUrl = `https://${initialUrl}`
    }
  }

  return parsedUrl
}

export const CMSLink: React.FC<CMSLinkProps> = (props) => {
  const {
    appearance = 'link',
    children,
    className,
    label,
    newTab,
    size: sizeFromProps,
    tooltipContent,
    tooltipProps,
  } = props

  const size = appearance === 'link' ? 'default' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}
  const linkHref = getHref(props)

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'link') {
    return (
      <Tooltip
        delayDuration={DEFAULT_TOOLTIP_DELAY}
        disableHoverableContent={true}
        {...tooltipProps}
      >
        <TooltipTrigger asChild>
          <Link className={cn(className)} href={linkHref} {...newTabProps}>
            {label}
            {children}
          </Link>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip delayDuration={DEFAULT_TOOLTIP_DELAY} disableHoverableContent={true} {...tooltipProps}>
      <TooltipTrigger asChild>
        <Button asChild className={className} size={size} variant={appearance}>
          <Link className={cn(className)} href={linkHref} {...newTabProps}>
            {label}
            {children}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  )
}
