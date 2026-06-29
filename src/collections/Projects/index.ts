import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaGalleryBlock } from '@/blocks/MediaGalleryBlock/config'
import { link } from '@/fields/link'
import { hasAccess } from '@/utilities/accessFunctions'
import {
  lexicalEditor,
  HeadingFeature,
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HorizontalRuleFeature,
} from '@payloadcms/richtext-lexical'
import { slugField, type CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    description: 'Community initiatives, games, mods, or collaborative efforts.',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
  },
  access: {
    create: hasAccess('projects', 'create'),
    delete: hasAccess('projects', 'del'),
    update: hasAccess('projects', 'upd'),
    read: () => true,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    status: true,
    startDate: true,
    endDate: true,
    homepage: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Detailed overview of the project and its goals.',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            BlocksFeature({ blocks: [Code, MediaBlock, MediaGalleryBlock] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ]
        },
      }),
      label: false,
      required: true,
    },
    slugField(),
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional profile picture or avatar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Categories this project falls under. (Useful for grouping projects together}',
      },
    },
    {
      type: 'row', // Groups the status and date fields horizontally in the admin UI
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'active',
          admin: {
            width: '33%',
          },
          options: [
            { label: 'Planned', value: 'planned' },
            { label: 'Active', value: 'active' },
            { label: 'Completed', value: 'completed' },
            { label: 'Archived', value: 'archived' },
          ],
        },
        {
          name: 'startDate',
          type: 'date',
          admin: {
            width: '33%',
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            width: '33%',
            description: 'Leave blank if the project is ongoing.',
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'd MMM yyyy',
            },
          },
        },
      ],
    },
    link({
      appearances: false,
      overrides: {
        required: false,
        name: 'homepage',
      },
    }),
  ],
}
