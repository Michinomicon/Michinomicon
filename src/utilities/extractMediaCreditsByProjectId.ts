import { Creator, Media } from '@/payload-types'

export type ProjectMediaCreators = {
  credits: {
    creator: Creator
    roles: string[]
  }[]
  media: Media
}
export const extractMediaCreditsByProjectId = (
  media: Media[],
  projectId: string,
): ProjectMediaCreators[] => {
  const projectCredits: ProjectMediaCreators[] = media.reduce(
    (results: ProjectMediaCreators[], current: Media) => {
      const { credits, project } = current
      if (!project) return results

      const thisProjectsId: string = typeof project === 'string' ? project : project.id

      if (thisProjectsId !== projectId) return results

      const creditsByCreator = groupCreditsByCreator(credits)

      const mediaCredits: ProjectMediaCreators = {
        credits: creditsByCreator,
        media: current,
      }

      results.push(mediaCredits)
      return results
    },
    [],
  )

  return projectCredits
}

function groupCreditsByCreator(mediaCredits: Media['credits']) {
  const validCredits: Map<string, { creator: Creator; roles: string[] }> = new Map()

  mediaCredits?.reduce((res, credit) => {
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
