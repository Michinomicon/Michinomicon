import { hasAccess } from '@/utilities/accessFunctions'
import { slugField, type CollectionConfig } from 'payload'
import { revalidateCreator, revalidateCreatorDelete } from './hooks/revalidateCreator'

export const Creators: CollectionConfig = {
  slug: 'creators',
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
    description: 'Community members, artists, and contributors.',
  },
  access: {
    create: hasAccess('categories', 'create'),
    delete: hasAccess('categories', 'del'),
    update: hasAccess('categories', 'upd'),
    read: () => true,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  fields: [
    {
      name: 'title',
      label: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Artists name or username',
        placeholder: 'Example: Jane Doe or @PixelArtist99',
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
      name: 'description',
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
    slugField(),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
  hooks: {
    afterChange: [revalidateCreator],
    afterDelete: [revalidateCreatorDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      // schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
