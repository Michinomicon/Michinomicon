import { CollectionBeforeOperationHook } from 'payload'

// const renameYouTubeThumbnail = async ({req,data
// }: {req:PayloadRequest,data:Media}) => {
//   if(req?.file && data.youtubeId){
//    const youTubeId = data.youtubeId
//     if (req.file.name === 'maxresdefault.jpg') {
//       if (typeof youTubeId === 'string') {
//         req.file.name = `${youTubeId}-${req.file.name}`
//       }
//     }
//   }
// }

export const mediaCollectionBeforeOperation: CollectionBeforeOperationHook<'media'> = async ({
  operation,
  args,
}) => {
  if (operation === 'create' || operation === 'update') {
    const { req, data } = args

    if (req.file) {
      const originalName: string = req.file.name
      const extension: string | undefined = originalName.split('.').pop()
      const uuid = crypto.randomUUID()
      req.file.name = `${uuid}.${extension}`

      // prepend youtube video thumbnail image names with the youtube video ID
      if (data.youtubeId) {
        const youTubeId = data.youtubeId
        if (req.file.name === 'maxresdefault.jpg') {
          if (typeof youTubeId === 'string') {
            req.file.name = `${youTubeId}-${req.file.name}`
          }
        }
      }
    }
  }

  return args
}
