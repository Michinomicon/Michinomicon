import type { Block } from 'payload'

export const MediaGalleryBlock: Block = {
  slug: 'mediaGalleryBlock',
  interfaceName: 'MediaGalleryBlock',
  fields: [
    {
      name: 'selectionMethod',
      type: 'radio',
      required: true,
      defaultValue: 'individual',
      options: [
        { label: 'Individual Selection', value: 'individual' },
        { label: 'Select by Category', value: 'category' },
      ],
    },
    {
      name: 'individualMedia',
      type: 'array',
      label: 'Selected Media',
      admin: {
        condition: (_, siblingData) => siblingData.selectionMethod === 'individual',
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'mediaCategory',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Media Category',
      admin: {
        condition: (_, siblingData) => siblingData.selectionMethod === 'category',
      },
    },
  ],
}