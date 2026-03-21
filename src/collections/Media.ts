import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { hasAccess } from '@/utilities/accessFunctions'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  admin: {
    group: 'Globals',
  },
  disableDuplicate: true,
  access: {
    read: () => true,
    create: hasAccess('media', 'create'),
    update: hasAccess('media', 'upd'),
    delete: hasAccess('media', 'del'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    staticDir: process.env.PAYLOAD_MEDIA_DIR || path.resolve(dirname, `../../shared-media`),
    mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
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
    ],
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if ((operation === 'create' || operation === 'update') && req.file) {
          if (req.file.mimetype === 'application/pdf') {
            try {
              const pdf2imgModule = await import('pdf-img-convert')
              const pdf2img = pdf2imgModule.default || pdf2imgModule
              const pdfImageArray = await pdf2img.convert(req.file.data, {
                width: 400, // thumbnail width
                page_numbers: [1], // first page
                base64: false, // FALSE => Uint8Array buffer
              })

              if (pdfImageArray && pdfImageArray.length > 0) {
                const imageBuffer = Buffer.from(pdfImageArray[0])
                const baseName = (data.filename || req.file.name).replace(/\.pdf$/i, '')
                const thumbnailFilename = `${baseName}-thumbnail.png`
                const uploadConfig = req.payload.collections['media'].config.upload as {
                  staticDir: string
                }
                const resolvedStaticDir = uploadConfig.staticDir
                const uploadPath = path.join(resolvedStaticDir, thumbnailFilename)
                await fs.writeFile(uploadPath, imageBuffer)

                data.sizes = data.sizes || {}
                data.sizes.thumbnail = {
                  filename: thumbnailFilename,
                  filesize: imageBuffer.length,
                  mimeType: 'image/png',
                  width: 400,
                  height: null,
                }
                console.log('PDF thumbnail generated successfully.', data)
              }
            } catch (error) {
              console.error('Failed to generate PDF thumbnail:', error)
            }
          }
        }
        return data
      },
    ],
  },
}
