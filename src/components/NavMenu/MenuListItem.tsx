import Link, { LinkProps } from 'next/link'
import { Button } from '../ui/button'
import { cn } from '@/utilities/ui'

export function MenuListItem({
  label,
  href,
  onNavigate,
  icon,
  className,
  ...buttonProps
}: {
  label: string
  href: LinkProps['href']
  onNavigate?: LinkProps['onNavigate']
  icon?: React.ReactNode | undefined
  className?: string
} & Omit<React.ComponentPropsWithoutRef<typeof Button>, 'className'>) {
  return (
    <Button
      variant={'ghost'}
      size={'lg'}
      className={cn('w-full rounded-none border-b border-border/10 px-4 py-5 text-xl', className)}
      {...buttonProps}
      asChild
    >
      <Link
        href={href}
        passHref
        onNavigate={onNavigate}
        className="justify-start px-0 no-underline decoration-0"
      >
        {icon && icon}
        <span className="no-underline">{label}</span>
      </Link>
    </Button>
  )
}
