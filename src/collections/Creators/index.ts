import { hasAccess } from '@/utilities/accessFunctions'
import { slugField, type CollectionConfig } from 'payload'
import { revalidateCreator, revalidateCreatorDelete } from './hooks/revalidateCreator'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { MediaGalleryBlock } from '@/blocks/MediaGalleryBlock/config'
import {
  lexicalEditor,
  HeadingFeature,
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HorizontalRuleFeature,
} from '@payloadcms/richtext-lexical'
import { Code } from '@/blocks/Code/config'
import {
  OverviewField,
  MetaTitleField,
  MetaImageField,
  MetaDescriptionField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Creators: CollectionConfig = {
  slug: 'creators',
  admin: {
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    useAsTitle: 'title',
    description: 'Community members, artists, and contributors.',
    enableRichTextRelationship: true,
    enableRichTextLink: true,
  },
  access: {
    create: hasAccess('creators', 'create'),
    delete: hasAccess('creators', 'del'),
    update: hasAccess('creators', 'upd'),
    read: () => true,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    status: true,
    profileImage: true,
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
            {
              name: 'description',
              type: 'richText',
              admin: {
                description: 'Short biography or introduction',
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      admin: {
        position: 'sidebar',
      },
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
