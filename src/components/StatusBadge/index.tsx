import { cn } from '@/lib/utils'
import { Badge, BadgeProps, BadgeStatus } from '../ui/badge'

export type BadgeStatusType = string & BadgeProps['status']

export type StatusBadgeProps = Omit<BadgeProps, 'status'> & {
  className?: string
  labelClassName?: string
  children?: React.ReactNode
  status?: BadgeStatus
}

export function StatusBadge({
  className,
  labelClassName,
  status,
  children,
  ...props
}: StatusBadgeProps) {
  const stringStatus = status ? `${status}` : ''
  console.log(`StatusBadge: status:`, status)
  return (
    <Badge
      className={cn('', className)}
      {...props}
      variant={'status'}
      status={stringStatus as BadgeStatus}
    >
      <span className={cn('font-bold uppercase', labelClassName)}>{stringStatus}</span>
      {children}
    </Badge>
  )
}
