import type { Block } from 'payload'

export const PostContent: Block = {
  slug: 'postContent',
  interfaceName: 'PostContentBlock',
  labels: {
    singular: 'Post Content',
    plural: 'Post Contents',
  },
  fields: [
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'selection',
      options: [
        {
          label: 'Individual Selection',
          value: 'selection',
        },
        {
          label: 'Post(s) By Category',
          value: 'collection',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 99,
      label: 'Limit',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Select Posts',
      relationTo: ['posts'],
    },
    {
      type: 'collapsible',
      label: 'Post Display Options',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'showTitle',
              type: 'checkbox',
              defaultValue: true,
              label: 'Show Post Titles',
            },
            {
              name: 'showAuthor',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show Post Author',
            },
            {
              name: 'showDate',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show Post Published Date',
            },
            {
              name: 'showCategories',
              type: 'checkbox',
              defaultValue: false,
              label: 'Show Post Categories',
            },
          ],
        },
      ],
    },
  ],
}
