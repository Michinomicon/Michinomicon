import { CollectionBeforeOperationHook } from 'payload'

export const renameYouTubeThumbnail: CollectionBeforeOperationHook = async ({
  args,
  operation,
}) => {
  if (operation === 'create' || operation === 'update') {
    const { req } = args
    const data = 'data' in args ? args.data : undefined
    const youTubeId = (data as Record<string, unknown>)?.youtubeId

    if (req?.file?.name === 'maxresdefault.jpg') {
      if (typeof youTubeId === 'string') {
        req.file.name = `${youTubeId}-${req.file.name}`
      }
    }
  }

  return args
}
