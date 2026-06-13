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
    // {
    //   type: 'group',
    //   label: 'Navigation Menu Options',
    //   admin: {
    //     position: 'sidebar',
    //   },
    //   fields: [
    //     {
    //       name: 'isNav',
    //       type: 'checkbox',
    //       defaultValue: false,
    //       label: 'Include in Site Navigation',
    //     },
    //     // {
    //     //   name: 'sortPriority',
    //     //   type: 'number',
    //     //   min: 1,
    //     //   max: 100,
    //     //   admin: {
    //     //     description: 'Select Order Priority',
    //     //   },
    //     // },
    //   ],
    // },
    // {
    //   name: 'sortPriority',
    //   type: 'number',
    //   admin: {
    //     hidden: true, // Hides from the document view; controlled by the Global
    //   },
    //   defaultValue: 999, // Push unsorted items to the bottom
    // },
  ],
}
