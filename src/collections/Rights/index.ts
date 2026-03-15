import { hasAccess } from '@/utilities/accessFunctions'
import { CollectionConfig } from 'payload'

export const Rights: CollectionConfig = {
  slug: 'rights',
  access: {
    read: hasAccess('rights', 'read'),
    create: hasAccess('rights', 'create'),
    update: hasAccess('rights', 'upd'),
    delete: hasAccess('rights', 'del'),
  },
  admin: {
    defaultColumns: ['name'],
    useAsTitle: 'name',
    group: 'Admin',
  },
  defaultPopulate: {
    name: true,
  },
  fields: [
    {
      type: 'text',
      name: 'name',
      label: 'Name',
      unique: true,
    },
    {
      type: 'collapsible',
      label: 'Collection Access Rights',
      fields: [
        {
          type: 'array',
          label: 'Rights',
          name: 'rights-list',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  type: 'relationship',
                  name: 'collections',
                  label: 'Collections',
                  relationTo: 'slugs',
                  hasMany: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  type: 'checkbox',
                  name: 'create-collection-own',
                  label: 'Create Collection Own',
                  admin: {
                    width: '100%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  type: 'checkbox',
                  name: 'read-collection-own',
                  label: 'Read Collection Own',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  type: 'checkbox',
                  name: 'read-collection-others',
                  label: 'Read Collection Others',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  type: 'checkbox',
                  name: 'upd-collection-own',
                  label: 'Update Collection Own',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  type: 'checkbox',
                  name: 'upd-collection-others',
                  label: 'Update Collection Others',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  type: 'checkbox',
                  name: 'del-collection-own',
                  label: 'Delete Collection Own',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  type: 'checkbox',
                  name: 'del-collection-others',
                  label: 'Delete Collection Others',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Field Access Rights',
      fields: [
        {
          type: 'array',
          name: 'field-rights',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  type: 'relationship',
                  name: 'collectionSlug',
                  label: 'Collections',
                  relationTo: 'slugs',
                  hasMany: false,
                  required: true,
                },
              ],
            },
            {
              type: 'array',
              name: 'field',
              fields: [
                {
                  name: 'fields',
                  type: 'text', // Changed from 'text' to 'select'
                  hasMany: true,
                  admin: {
                    width: '50%',
                    components: {
                      Field: '@/components/admin/FieldSelector#FieldSelector',
                    },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      type: 'checkbox',
                      name: 'field-read',
                      label: 'Read',
                    },
                    {
                      type: 'checkbox',
                      name: 'field-edit',
                      label: 'Edit',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
