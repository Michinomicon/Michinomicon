import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    description: 'Community initiatives, games, mods, or collaborative efforts.',
  },
  access: {
    read: () => true,
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
  ],
}
