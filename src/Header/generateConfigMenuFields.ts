import { Field } from 'payload'
import { link } from '@/fields/link'

/**
 * Recursive function to generate menu item fields
 **/
export const generateMenuFields = (maxDepth: number = 3, currentDepth: number = 1): Field[] => {
  const fields: Field[] = [
    {
      type: 'row',
      fields: [
        {
          label: 'Item Type',
          name: 'type',
          type: 'select',
          defaultValue: 'item',
          options: [
            { label: 'Item', value: 'item' },
            { label: 'Item Group', value: 'group' },
          ],
        },
        {
          label: 'Group Label',
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'group',
          },
        },
        {
          name: 'referenceLabel',
          type: 'text',
          admin: { hidden: true },
        },
      ],
    },
    link({
      appearances: false,
      overrides: {
        label: 'Item',
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'item',
        },
      },
    }),
  ]

  if (currentDepth < maxDepth) {
    fields.push({
      name: 'children',
      type: 'array',
      label: 'Sub-Menu Items',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'group',
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
        initCollapsed: true,
      },
      // Recursively call this function and increment the depth
      fields: generateMenuFields(maxDepth, currentDepth + 1),
    })
  }

  return fields
}
