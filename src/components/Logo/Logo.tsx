import LogoImage from 'public/icons/favicon-512x512.png'

export interface LogoProps {
  text?: string | undefined
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  variant?: 'textonly' | 'icononly' | 'default'
}

export const Logo = (props: LogoProps) => {
  const {
    variant: variantFromProps,
    text,
    loading: loadingFromProps,
    priority: priorityFromProps,
    className,
  } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'
  const variant = variantFromProps || 'default'

  const showIcon = variant !== 'textonly'
  const showText = variant !== 'icononly'

  return (
    /* eslint-disable @next/next/no-img-element */
    <div className={`flex flex-nowrap justify-center items-center ${className}`}>
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
            className="ml-2 text-4xl no-underline"
            fill={'var(--muted-foreground)'}
          >
            {text}
          </text>
        </svg>
      )}
    </div>
  )
}
