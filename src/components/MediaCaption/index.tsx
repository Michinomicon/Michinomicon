import { cn } from '@/lib/utils'
import { MediaInfo } from '@/utilities/mediaInfo'
import { CreatorAvatarGroup } from '../CreatorAvatarGroup'

export function MediaCaption({
  info,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { info: MediaInfo }): React.ReactNode {
  const { title, credits, project } = info

  return (
    <div className={cn(className)} {...props}>
      <div className="relative z-0 mx-auto flex w-auto flex-col items-center justify-center">
        {project && (
          <div className="mx-auto flex w-auto flex-col items-center justify-center">
            <div className="text-center text-xl whitespace-nowrap lg-open:text-2xl">
              <span className="">
                {title}
                {project && (
                  <span>
                    {' - '}
                    <a href={project.href} className="hover:text-primary">
                      <b>{project.title}</b>
                    </a>
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        <CreatorAvatarGroup credits={credits} hoverCardProps={{ align: 'center', sideOffset: 0 }} />
      </div>
    </div>
  )
}
