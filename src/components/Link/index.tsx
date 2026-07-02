import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import { Collections } from '@/utilities/collectionTypes'
import {
  DEFAULT_TOOLTIP_DELAY,
  Tooltip,
  TooltipProps,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type ValidCollections = Pick<Collections, 'pages' | 'creators' | 'posts' | 'projects'>
export type CMSLinkReference<R extends keyof ValidCollections, V = ValidCollections[R]> = {
  relationTo: R
  value: Partial<V> | string
}

export type CMSLinkPropsReference =
  | {
      relationTo: string
      value:
        | {
            [key: string]: unknown
            slug?: string | undefined
            id: string
          }
        | string
    }
  | CMSLinkReference<'pages'>
  | CMSLinkReference<'posts'>
  | CMSLinkReference<'creators'>
  | CMSLinkReference<'projects'>

export type CMSLinkProps = {
  type?: 'reference' | 'custom' | null
  reference?: CMSLinkPropsReference | null
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

/**
 * @description Takes a 'relationTo' reference from Payload and return the approriate href value for a link
 *
 * @export
 * @param {(CMSLinkPropsReference | null | undefined)} [reference]
 * @return {*}  {string}
 */
export function parseCMSLinkReferenceHref(
  reference?: CMSLinkPropsReference | null | undefined,
): string | null {
  if (reference) {
    const { value, relationTo } = reference as CMSLinkPropsReference
    if (typeof value === 'object' && value.slug) {
      const href = `${relationTo !== 'pages' ? `/${relationTo}` : ''}/${value.slug}`
      return href
    }
  }
  return ''
}

export function getHref({ type = 'reference', reference, url }: CMSLinkProps) {
  const initialUrl: string = url && url.length > 0 ? url : ''
  let parsedUrl = initialUrl

  if (type === 'reference') {
    parsedUrl = parseCMSLinkReferenceHref(reference) || initialUrl
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
  const showLabel = size !== 'icon'

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
            {showLabel && label}
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
            {showLabel && label}
            {children}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipContent}</TooltipContent>
    </Tooltip>
  )
}
