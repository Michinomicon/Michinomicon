import type { CollectionBeforeChangeHook, ImageSize, PayloadRequest } from 'payload'
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import { IAudioMetadata } from 'music-metadata'
import { Media } from '@/payload-types'

// Must match Payload config here `/src/collections/Media.ts`
// Media.upload.imageSizes
const configuredUploadImageSizes: ImageSize[] = [
  {
    name: 'thumbnail',
    width: 300,
  },
  {
    name: 'square',
    width: 500,
    height: 500,
  },
  {
    name: 'small',
    width: 600,
  },
  {
    name: 'medium',
    width: 900,
  },
  {
    name: 'large',
    width: 1400,
  },
  {
    name: 'xlarge',
    width: 1920,
  },
  {
    name: 'og',
    width: 1200,
    height: 630,
    crop: 'center',
  },
]

const applicationPdfBeforeChangeTasks = async ({
  data,
  req,
}: {
  data: Partial<Media>
  req: PayloadRequest
}): Promise<Partial<Media>> => {
  if (req.file?.mimetype !== 'application/pdf') {
    console.error(
      `applicationPdfBeforeChangeTasks: invalid MIMEType '${req.file?.mimetype}'. expected "application/pdf"`,
      JSON.stringify(req),
    )
    return data
  }

  // TODO - Redo this with sharp for better performance
  try {
    const pdf2imgModule = await import('pdf-img-convert')
    const pdf2img = pdf2imgModule.default || pdf2imgModule

    // Initialize data.sizes if it doesn't exist
    data.sizes = data.sizes || {}

    const uploadConfig = req.payload.collections['media'].config.upload as {
      staticDir: string
    }
    const resolvedStaticDir = uploadConfig.staticDir
    const baseName = (data.filename || req.file.name).replace(/\.pdf$/i, '')

    for (const { name, width } of configuredUploadImageSizes) {
      if (width) {
        const pdfImageArray = await pdf2img.convert(req.file.data, {
          width: width,
          page_numbers: [1],
          base64: false,
        })

        if (pdfImageArray && pdfImageArray.length > 0) {
          const imageBuffer = Buffer.from(pdfImageArray[0])
          const sizeFilename = `${baseName}-${name}.png`
          const uploadPath = path.join(resolvedStaticDir, sizeFilename)

          await fs.writeFile(uploadPath, imageBuffer)

          data.sizes[name as keyof typeof data.sizes] = {
            filename: sizeFilename,
            filesize: imageBuffer.length,
            mimeType: 'image/png',
            width: width,
            height: null, // pdf-img-convert scales proportionally
          }
        }
      }
    }
    console.log('PDF thumbnails generated successfully for all sizes.')
  } catch (error) {
    console.error('Failed to generate PDF thumbnails:', error)
    return data
  }
  return data
}

const imageBeforeChangeTasks = async ({
  data,
  req,
}: {
  data: Partial<Media>
  req: PayloadRequest
}): Promise<Partial<Media>> => {
  if (!req.file?.mimetype.startsWith('image/')) {
    console.error(
      `applicationPdfBeforeChangeTasks: invalid MIMEType '${req.file?.mimetype}'. expected "application/pdf"`,
      JSON.stringify(req),
    )
    return data
  }

  try {
    const sharp = (await import('sharp')).default

    // Read the image buffer
    const metadata: sharp.Metadata = await sharp(req.file.data).metadata()

    data.width = metadata.width || data.width
    data.height = metadata.height || data.height
    data.format = metadata.format || data.format
    data.hasAlpha = metadata.hasAlpha || false
  } catch (error) {
    console.error('Failed to parse image metadata:', error)
  }

  return data
}

const audioBeforeChangeTasks = async ({
  data,
  req,
}: {
  data: Partial<Media>
  req: PayloadRequest
}): Promise<Partial<Media>> => {
  if (!req.file?.mimetype.startsWith('audio/')) {
    console.error(
      `applicationPdfBeforeChangeTasks: invalid MIMEType '${req.file?.mimetype}'. expected "application/pdf"`,
      JSON.stringify(req),
    )
    return data
  }

  try {
    const mm = await import('music-metadata')
    const metadata: IAudioMetadata = await mm.parseBuffer(req.file.data, req.file.mimetype)

    const { common } = metadata

    data.artist = common.artist || data.artist
    data.album = common.album || data.album
    data.duration = metadata.format.duration ? Math.round(metadata.format.duration) : data.duration
    data.title = common.title || data.title
    data.artwork = JSON.stringify(common.picture || data.images)
    // data.images = common.picture || data.images
    // data.genre = common.genre || data.genre
    data.live = false
  } catch (error) {
    console.error('Failed to parse audio metadata:', error)
  }

  return data
}

export const mediaCollectionBeforeChange: CollectionBeforeChangeHook<Media> = async ({
  //collection,     //:SanitizedCollectionConfig;   The Collection in which this Hook is running against.
  //context,        //:RequestContext;              Custom context passed between hooks. More details.
  data, //:Partial<T>;                  The incoming data passed through the operation.
  operation, //:CreateOrUpdateOperation;     The name of the operation that this hook is running within.
  // originalDoc,    //?: T;                         The full document before changes are applied. Present on updates; undefined on creates. Use this to read the document id and any unchanged fields.
  req, //:PayloadRequest;              The Web Request object. This is mocked for Local API operations.
}) => {
  // Need the id? Don't expect it in `data`.
  // const id = operation === 'update' ? originalDoc.id : undefined

  if ((operation === 'create' || operation === 'update') && req.file) {
    if (req.file.mimetype === 'application/pdf') {
      return applicationPdfBeforeChangeTasks({ data, req })
    }

    if (req.file.mimetype.startsWith('image/')) {
      return imageBeforeChangeTasks({ data, req })
    }

    if (req.file.mimetype.startsWith('audio/')) {
      return audioBeforeChangeTasks({ data, req })
    }
  }

  return data
}
