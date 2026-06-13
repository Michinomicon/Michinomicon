import type { GlobalConfig } from 'payload'
import { revalidateHeader } from './hooks/revalidateHeader'
import { hasAccess } from '@/utilities/accessFunctions'
import { generateMenuFields } from './generateConfigMenuFields'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: hasAccess('header', 'upd'),
  },
  admin: {
    description: 'Drag and drop items to set their display order in the main website menu',
  },
  hooks: {
    afterChange: [revalidateHeader],
  },
  fields: [
    {
      name: 'menuItems',
      type: 'array',
      label: 'Menu Items',
      labels: {
        singular: 'Menu Item',
        plural: 'Menu Items',
      },
      admin: {
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
        initCollapsed: true,
      },
      fields: generateMenuFields(6),
    },
  ],
}
