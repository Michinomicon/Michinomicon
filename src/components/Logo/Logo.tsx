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
  className,
  textClassName,
  ...props
}: LogoProps & React.ComponentProps<'div'>) {
  const logoText = logoTextFromProps || ''
  const variant = variantFromProps || 'default'
  const showIcon = variant !== 'textonly'
  const showText = variant !== 'icononly'
  return (
    <div
      className={cn(
        'app-logo',
        '@container h-full min-h-8.5 w-auto max-w-60 min-w-10 rounded-none md:max-h-8.5 md:max-w-80',
        className,
      )}
      {...props}
    >
      {showText && (
        <svg
          viewBox="0 0 250 34"
          preserveAspectRatio="xMinYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {showIcon && <image width={28} height={28} y="0" href={LogoImage.src} />}
          <text
            x={showIcon ? '38' : '0'}
            y="26"
            className={cn('app-logo-text text-[30px] capitalize no-underline', textClassName)}
            fill="var(--color-foreground)"
          >
            {logoText}
          </text>
        </svg>
      )}
    </div>
  )
}
