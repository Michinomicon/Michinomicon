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
      `imageBeforeChangeTasks: invalid MIMEType '${req.file?.mimetype}'. expected "image/"`,
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
      `audioBeforeChangeTasks: invalid MIMEType '${req.file?.mimetype}'. expected "audio/"`,
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

const videoBeforeChangeTasks = async ({
  data,
  req,
}: {
  data: Partial<Media>
  req: PayloadRequest
}): Promise<Partial<Media>> => {
  if (!req.file?.mimetype.startsWith('video/')) {
    console.error(
      `videoBeforeChangeTasks: invalid MIMEType '${req.file?.mimetype}'. expected "video/"`,
      JSON.stringify(req),
    )
    return data
  }

  const os = await import('os')
  const fs = await import('fs/promises')
  const path = await import('path')
  const util = await import('util')
  const { execFile } = await import('child_process')
  const execFileAsync = util.promisify(execFile)
  const ffmpegCommand = 'ffmpeg'
  const ffprobeCommand = 'ffprobe'

  const tempFilePath = path.join(os.tmpdir(), `temp-${Date.now()}-${req.file.name}`)

  try {
    await fs.writeFile(tempFilePath, req.file.data)

    // Extract Metadata
    const { stdout: probeOutput } = await execFileAsync(ffprobeCommand, [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height,codec_name:format=duration',
      '-of',
      'json',
      tempFilePath,
    ])

    const videoMetadata = JSON.parse(probeOutput)
    const stream = videoMetadata.streams?.[0]
    const format = videoMetadata.format

    if (stream) {
      data.width = stream.width || data.width
      data.height = stream.height || data.height
      data.codec = stream.codec_name || data.codec
    }

    let durationSec = 0
    if (format && format.duration) {
      durationSec = parseFloat(format.duration)
      data.duration = Math.round(durationSec)
    } else {
      data.duration = data.duration || 0
    }

    // Generate Thumbnails
    data.sizes = data.sizes || {}
    const uploadConfig = req.payload.collections['media'].config.upload as {
      staticDir: string
    }
    const resolvedStaticDir = uploadConfig.staticDir
    const baseName = (data.filename || req.file.name).replace(/\.[^/.]+$/, '')

    const sharp = (await import('sharp')).default
    const midpointSec = Math.max(0, durationSec / 2).toFixed(2)

    for (const { name, width, height } of configuredUploadImageSizes) {
      const sizeFilename = `${baseName}-${name}.png`
      const uploadPath = path.join(resolvedStaticDir, sizeFilename)

      const scaleWidth = width ? width : -1
      const scaleHeight = height ? height : -1
      const scaleFilter = `scale=${scaleWidth}:${scaleHeight}`

      await execFileAsync(ffmpegCommand, [
        '-y',
        '-ss',
        String(midpointSec),
        '-i',
        tempFilePath,
        '-vframes',
        '1',
        '-vf',
        scaleFilter,
        uploadPath,
      ])

      const generatedImageBuffer = await fs.readFile(uploadPath)
      const sharpMetadata = await sharp(generatedImageBuffer).metadata()

      data.sizes[name as keyof typeof data.sizes] = {
        filename: sizeFilename,
        filesize: generatedImageBuffer.length,
        mimeType: 'image/png',
        width: sharpMetadata.width || width,
        height: sharpMetadata.height || height,
      }
    }

    console.log('Video metadata and thumbnails generated successfully.')
  } catch (error) {
    console.error('Failed to parse video metadata or generate thumbnails:', error)
  } finally {
    try {
      await fs.unlink(tempFilePath)
    } catch (cleanupError) {
      console.error(`Failed to clean up temp file ${tempFilePath}:`, cleanupError)
    }
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

    if (req.file.mimetype.startsWith('video/')) {
      return videoBeforeChangeTasks({ data, req })
    }
  }

  return data
}
