import LogoImage from 'public/icons/favicon-512x512.png'

interface Props {
  text?: string | undefined
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { text, loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <div className={`flex flex-nowrap justify-center items-center ${className}`}>
      <img
        alt="Logo"
        width={34}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        src={LogoImage.src}
      />
      {text && (
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
