import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { slugField } from 'payload'
import { hasAccess } from '@/utilities/accessFunctions'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: hasAccess('categories', 'create'),
    delete: hasAccess('categories', 'del'),
    read: anyone,
    update: hasAccess('categories', 'upd'),
  },
  admin: {
    useAsTitle: 'title',
    group: 'Globals',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
