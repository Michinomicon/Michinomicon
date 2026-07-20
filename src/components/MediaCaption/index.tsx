import { cn } from '@/lib/utils'
import { AvatarLinkBadge } from '../AvatarLinkBadge'
import { MediaInfo } from '@/utilities/mediaInfo'

export function MediaCaption({
  info,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { info: MediaInfo }): React.ReactNode {
  const { title, credits, project } = info
  return (
    <div className={cn(className)} {...props}>
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

        {credits &&
          credits.map(({ href, title, image, roles }, index) => (
            <div key={index} className="flex flex-row flex-nowrap lg-open:text-xl">
              <div className={cn('flex flex-row flex-nowrap items-center gap-x-1')}>
                {roles.map((role, index) => {
                  const isLast = index === roles.length - 1
                  return (
                    <span key={index} className={cn('mr-1 text-right text-lg')}>
                      {role}
                      {roles.length > 1 && !isLast ? ',' : ''}
                    </span>
                  )
                })}
              </div>
              <AvatarLinkBadge {...{ href, title, image }} className={'lg-open:text-xl'} />
            </div>
          ))}
      </div>
    </div>
  )
}
