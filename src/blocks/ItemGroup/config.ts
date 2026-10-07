import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const ItemGroup: Block = {
  slug: 'itemGroup',
  interfaceName: 'ItemGroup',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Intro Content',
      admin: {
        description: 'Text content to display above the the card group.',
      },
    },
    {
      name: 'populateBy',
      type: 'select',
      required: true,
      defaultValue: 'collection',
      admin: {
        description:
          'The source of the items that will be displayed as cards. "Collection" Displays all items from one of the Posts, Pages, Projects or Creators collections with options to filter by Category and set a maximum limit of items. "Manual Selection" Individually select the items to display from any of the Posts, Projects or Creators collections.',
      },
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Manual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: 'Collection',
      options: [
        {
          label: 'Pages',
          value: 'pages',
        },
        {
          label: 'Posts',
          value: 'posts',
        },
        {
          label: 'Projects',
          value: 'projects',
        },
        {
          label: 'Creators',
          value: 'creators',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: 'Only items belonging to these categories will be included.',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        description: 'The maximum number of items to display. [Default: 10]',
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: 'Max. Items',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
        description: 'Individually select one or more Post, Project or Creator items to include.',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['pages', 'posts', 'creators', 'projects'],
    },
    {
      type: 'collapsible',
      label: 'Display Options',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'layout',
              type: 'select',
              required: true,
              defaultValue: 'carousel',
              label: 'Collection Layout',
              admin: {
                description: 'How the collection group items should be presented visually',
              },
              options: [
                {
                  label: 'Carousel',
                  value: 'carousel',
                },
                {
                  label: 'Grid',
                  value: 'grid',
                },
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Card Display Options',
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'showDescription',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Show Description',
                  admin: {
                    description:
                      'If the card description should be displayed or not. When disabled the title (if enabled) will be vertically centered. [Default: true]',
                  },
                },
                {
                  name: 'showImages',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Show Images',
                  admin: {
                    description:
                      'If the card image panel should be displayed or not. When disabled the title and description will use the full width of the card. [Default: true]',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'cardWidth',
                  type: 'select',
                  required: true,
                  defaultValue: 'md',
                  label: 'Card Width',
                  admin: {
                    description: 'The horizontal size of the item card',
                  },
                  options: [
                    {
                      label: 'Small',
                      value: 'sm',
                    },
                    {
                      label: 'Medium',
                      value: 'md',
                    },
                    {
                      label: 'Large',
                      value: 'lg',
                    },
                  ],
                },
                {
                  name: 'cardHeight',
                  type: 'select',
                  required: true,
                  defaultValue: 'md',
                  label: 'Card Height',
                  admin: {
                    description: 'The vertical size of the item card',
                  },
                  options: [
                    {
                      label: 'Small',
                      value: 'sm',
                    },
                    {
                      label: 'Medium',
                      value: 'md',
                    },
                    {
                      label: 'Large',
                      value: 'lg',
                    },
                  ],
                },
                {
                  name: 'cardLayout',
                  type: 'select',
                  required: true,
                  defaultValue: 'horizontal',
                  label: 'Card Layout',
                  admin: {
                    description: 'The orientation of the card content',
                  },
                  options: [
                    {
                      label: 'Horizontal',
                      value: 'horizontal',
                    },
                    {
                      label: 'Vertical',
                      value: 'vertical',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  labels: {
    plural: 'Archives',
    singular: 'Archive',
  },
}
