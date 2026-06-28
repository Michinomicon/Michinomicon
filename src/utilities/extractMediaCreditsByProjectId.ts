import { Creator, Media, Project } from '@/payload-types'
import { groupCreditsByCreator } from './groupCreditsByCreator'

export type ProjectMediaCreators = {
  credits: {
    creator: Creator
    roles: string[]
  }[]
  media: Media
}
export const extractMediaCreditsByProjectId = (
  media: Media[],
  projectOrProjectId: string | Project,
): ProjectMediaCreators[] => {
  const projectId: string = projectOrProjectId
    ? typeof projectOrProjectId === 'object'
      ? projectOrProjectId.id
      : projectOrProjectId
    : ''
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
