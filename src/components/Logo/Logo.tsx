import { cn } from '@/lib/utils'
import LogoImage from '@/public/icons/favicon-512x512.png'

export type LogoProps = {
  text?: string | undefined
  textClassName?: string | undefined
  className?: string | undefined

  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  variant?: 'textonly' | 'icononly' | 'default'
}

export function Logo({
  variant: variantFromProps,
  text: logoTextFromProps,
  loading: loadingFromProps,
  priority: priorityFromProps,
  className,
  textClassName,
  ...props
}: LogoProps & React.ComponentProps<'div'>) {
  const logoText = logoTextFromProps || ''
  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'
  const variant = variantFromProps || 'default'

  const showIcon = variant !== 'textonly'
  const showText = variant !== 'icononly'
  return (
    /* eslint-disable @next/next/no-img-element */
    <div className={cn('flex flex-row flex-nowrap', className)} {...props}>
      {showIcon && (
        <img
          alt="Logo"
          width={34}
          height={34}
          loading={loading}
          fetchPriority={priority}
          decoding="async"
          src={LogoImage.src}
        />
      )}
      {showText && (
        <svg width="280" height="34" xmlns="http://www.w3.org/2000/svg">
          <text
            x="10"
            y="32"
            className={cn('ml-2 text-4xl no-underline', textClassName)}
            fill={'var(--color-foreground)'}
          >
            {logoText}
          </text>
        </svg>
      )}
    </div>
  )
}
