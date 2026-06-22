import { Media, Project } from '@/payload-types'

export type ProjectMediaCredit = {
  project: Project
  media: Media
  roles: string[]
}
export const extractMediaCreditsByCreatorId = (
  media: Media[],
  creatorId: string,
): ProjectMediaCredit[] => {
  const projectCredits: ProjectMediaCredit[] = media.reduce(
    (results: ProjectMediaCredit[], current: Media) => {
      const { credits, project } = current
      if (!project || typeof project === 'string') return results

      const foundRoles: string[] | undefined = credits
        ?.filter(
          ({ creator: creditedCreator }) =>
            creatorId ===
            (typeof creditedCreator === 'object' ? creditedCreator.id : creditedCreator),
        )
        .map(({ role }) => role)
      if (!Array.isArray(foundRoles) || foundRoles.length <= 0) return results

      const projectCredit: ProjectMediaCredit = {
        project: project,
        media: current,
        roles: foundRoles,
      }

      results.push(projectCredit)
      return results
    },
    [],
  )

  return projectCredits
}
