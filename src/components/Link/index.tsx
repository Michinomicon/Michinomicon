import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import { CollectionSlug } from 'payload'
import { Collections } from '@/utilities/collectionTypes'

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
}

export const CMSLink: React.FC<CMSLinkProps> = ({
  type,
  appearance = 'link',
  children,
  className,
  label,
  newTab,
  reference,
  size: sizeFromProps,
  url,
}) => {
  let href: string | null | undefined = null

  if (type === 'reference') {
    href =
      type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
        ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
            reference.value.slug
          }`
        : url
  }

  if (!href) return null

  if (type === 'custom') {
    if (
      !href.startsWith('http') &&
      !href.startsWith('//') &&
      !href.startsWith('/') &&
      !href.startsWith('#') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:')
    ) {
      href = `https://${href}`
    }
  }

  const size = appearance === 'link' ? 'default' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'link') {
    return (
      <Link className={cn(className)} href={href} {...newTabProps}>
        {label}
        {children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href} {...newTabProps}>
        {label}
        {children}
      </Link>
    </Button>
  )
}
