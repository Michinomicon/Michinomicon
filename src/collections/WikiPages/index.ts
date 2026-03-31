import { CollectionConfig, Field, slugField } from 'payload'
import { defaultLexical } from '@/fields/defaultLexical'

// : CollectionConfig
export const WikiPages: CollectionConfig = {
  slug: 'wiki-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  // CRITICAL FOR WIKIS: This enables edit history and draft states!
  versions: {
    drafts: true,
    maxPerDoc: 50, // Keep the last 50 edits
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
      name: 'category',
      type: 'relationship',

      relationTo: 'wiki-categories',
      required: true,
      hasMany: false, // A wiki page usually belongs to exactly one specific place in the tree
    },
    {
      name: 'content',
      type: 'richText',
      editor: defaultLexical, // Reusing your existing rich text editor config
      required: true,
    },
    {
      name: 'relatedPages',
      type: 'relationship',

      relationTo: 'wiki-pages',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    slugField({ fieldToUse: 'title' }) as Field,
  ],
}
