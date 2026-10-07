import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaGalleryBlock } from '@/blocks/MediaGalleryBlock/config'
import { hasAccess } from '@/utilities/accessFunctions'
import {
  OverviewField,
  MetaTitleField,
  MetaImageField,
  MetaDescriptionField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
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
    enableRichTextRelationship: true,
    enableRichTextLink: true,
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
    profileImage: true,
    startDate: true,
    endDate: true,
    content: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
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
      type: 'tabs',
      tabs: [
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
        {
          name: 'content',
          label: 'Content',
          fields: [
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
          ],
        },
      ],
    },
    slugField(),
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Categories this project falls under. (Useful for grouping projects together}',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      admin: {
        position: 'sidebar',
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
        position: 'sidebar',
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
        position: 'sidebar',
        description: 'Leave blank if the project is ongoing.',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
      },
    },
  ],
}
