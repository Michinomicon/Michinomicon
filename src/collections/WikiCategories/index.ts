import { CollectionConfig, Field, slugField } from 'payload'
export const WikiCategories: CollectionConfig = {
  slug: 'wiki-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'updatedAt'],
  },
  access: {
    read: () => true, //hasAccess('posts', 'read'),
    // create: hasAccess('posts', 'create'),
    // update: hasAccess('posts', 'upd'),
    // delete: hasAccess('posts', 'del'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',

      relationTo: 'wiki-categories',
      required: false,
      admin: {
        description: 'Leave blank for top-level categories. Select a parent to nest this category.',
      },
      filterOptions: ({ id }) => {
        // Prevent a category from being its own parent
        if (id) {
          return {
            id: {
              not_equals: id,
            },
          }
        }
        return true
      },
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        description: 'Used to force a specific sorting order in the sidebar (e.g., 1, 2, 3).',
      },
    },
    slugField({ fieldToUse: 'title' }) as Field,
  ],
}
