import { link } from '@/fields/link'
import { hasAccess } from '@/utilities/accessFunctions'
import { slugField, type CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    description: 'Community initiatives, games, mods, or collaborative efforts.',
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
    },
    slugField(),
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
