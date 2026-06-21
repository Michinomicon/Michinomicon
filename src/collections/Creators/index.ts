import { hasAccess } from '@/utilities/accessFunctions'
import type { CollectionConfig } from 'payload'

export const Creators: CollectionConfig = {
  slug: 'creators',
  admin: {
    useAsTitle: 'name',
    description: 'Community members, artists, and contributors.',
  },
  access: {
    create: hasAccess('categories', 'create'),
    delete: hasAccess('categories', 'del'),
    update: hasAccess('categories', 'upd'),
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'e.g., Jane Doe or @PixelArtist99',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional profile picture or avatar',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      admin: {
        description: 'Short biography or introduction',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      labels: {
        singular: 'Social Link',
        plural: 'Social Links',
      },
      admin: {
        description: 'Links to portfolios, social media, or personal websites.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'text',
              required: true,
              admin: {
                width: '30%',
                placeholder: 'e.g., ArtStation, Twitter',
              },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                width: '70%',
                placeholder: 'https://...',
              },
            },
          ],
        },
      ],
    },
  ],
}
