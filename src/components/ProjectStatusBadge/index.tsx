import { Project } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import { cn } from '@/lib/utils'

type StatusType = {
  [Status in Project['status']]: `${Capitalize<Status>}`
}
const StatusLabel: StatusType = {
  planned: 'Planned',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

type ProjectStatusBadgeProps = { project: Project } & React.ComponentPropsWithoutRef<typeof Badge>
export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
  project,
  ...baseBadgeProps
}) => {
  const { status } = project
  const badgeProps = baseBadgeProps

  switch (status) {
    case 'active':
      badgeProps.className = cn(
        'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
        baseBadgeProps.className || '',
      )
      break
    case 'completed':
      badgeProps.variant = 'secondary'
      break
    case 'archived':
      badgeProps.variant = 'outline'
      break
    case 'planned':
      badgeProps.className = cn(
        'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        baseBadgeProps.className || '',
      )
      break
  }

  console.log(`Project Status:`, status, project)

  return <Badge {...badgeProps}>{StatusLabel[status]}</Badge>
}
