import { Creator } from '@/payload-types'
import { AvatarGroup } from '../ui/avatar'
import { MediaAvatar } from '../MediaAvatar'

export function CreatorAvatarGroup({
  creators,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarGroup> & {
  creators?: Creator[] | null | undefined
}): React.ReactNode {
  return (
    <AvatarGroup {...props}>
      {creators?.map((creator, index) => (
        <MediaAvatar key={index} media={creator.profileImage} size={'lg'} title={creator.title} />
      ))}
    </AvatarGroup>
  )
}
