import { Creator, Media } from '@/payload-types'

export type MediaCredit = {
  creator: Creator
  roles: string[]
}

type PayloadMediaCredits = Media['credits']

export function groupCreditsByCreator(
  creditSource: Media | { credits: PayloadMediaCredits } | PayloadMediaCredits,
): MediaCredit[] {
  const validCredits: Map<string, MediaCredit> = new Map()

  if (creditSource) {
    const creditsToProcess = Array.isArray(creditSource)
      ? creditSource
      : typeof creditSource === 'object'
        ? creditSource.credits
        : []

    creditsToProcess?.reduce((validCredits, credit) => {
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
  }

  return [...validCredits.values()]
}
