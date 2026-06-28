import { Creator, Media } from '@/payload-types'

export function groupCreditsByCreator(mediaCredits: Media['credits']) {
  const validCredits: Map<string, { creator: Creator; roles: string[] }> = new Map()

  mediaCredits?.reduce((validCredits, credit) => {
    const { creator, role } = credit
    const creatorId = typeof creator === 'object' ? creator.id : creator
    const stored = validCredits.get(creatorId)
    if (stored) {
      stored.roles.push(role)
    } else if (typeof creator === 'object') {
      validCredits.set(creatorId, { creator: creator, roles: [role] })
    }
    return validCredits
  }, validCredits)

  return [...validCredits.values()]
}
