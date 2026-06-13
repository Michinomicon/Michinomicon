import { Field } from 'payload'
import { populateReferenceLabel } from './hooks/populateReferenceLabel'
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
          defaultValue: 'pages',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Category', value: 'categories' },
            { label: 'Page', value: 'pages' },
          ],
        },
        {
          label: 'Page',
          name: 'pageReference',
          type: 'relationship',
          relationTo: 'pages',
          hooks: {
            beforeChange: [populateReferenceLabel],
          },
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'pages',
            allowCreate: false,
          },
        },
        {
          label: 'Category',
          name: 'categoryReference',
          type: 'relationship',
          relationTo: 'categories',
          hooks: {
            beforeChange: [populateReferenceLabel],
          },
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'categories',
            allowCreate: false,
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
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'link',
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
        condition: (_, siblingData) => siblingData?.type === 'categories',
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
