import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { AccessResult, CollectionSlug, Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Creator, Page, Post, Project } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { hasAccess } from '@/utilities/accessFunctions'
import { getAppName } from '@/utilities/getAppName'

const generateTitle: GenerateTitle<Post | Page | Creator | Project> = ({ doc }) => {
  const appName = getAppName()
  const title = doc?.meta?.title ? doc?.meta?.title + ' | ' + appName : ''
  return title
}

const generateURL: GenerateURL<Post | Page | Creator | Project> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts', 'projects', 'creators'],
    overrides: {
      admin: {
        group: 'Plugins',
      },
      access: {
        // TODO - Wont build if using hasAccess
        read: (): AccessResult => true, //hasAccess('redirects', 'read'),
        create: hasAccess('redirects', 'create'),
        update: hasAccess('redirects', 'upd'),
        delete: hasAccess('redirects', 'del'),
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Plugins',
      },
      access: {
        read: hasAccess('formSubmissions', 'read'),
        delete: hasAccess('formSubmissions', 'del'),
        create: hasAccess('formSubmissions', 'create'),
        update: hasAccess('formSubmissions', 'upd'),
      },
    },
    formOverrides: {
      admin: {
        group: 'Plugins',
      },
      access: {
        read: hasAccess('forms', 'read'),
        create: hasAccess('forms', 'create'),
        update: hasAccess('forms', 'upd'),
        delete: hasAccess('forms', 'del'),
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'pages', 'projects', 'creators'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: {
        group: 'Plugins',
      },
      access: {
        read: hasAccess('search', 'read'),
        create: hasAccess('search', 'create'),
        update: hasAccess('search', 'upd'),
        delete: hasAccess('search', 'del'),
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  importExportPlugin({
    debug: true,
    // Global limits (0 = unlimited, which is the default)
    exportLimit: 10000,
    importLimit: 5000,

    // Override default export collection (e.g., add access control)
    // This will be used by all collections unless they further override the config
    overrideExportCollection: ({ collection }) => {
      collection.access = {
        ...collection.access,
        read: hasAccess('pages', 'read'),
      }
      return collection
    },

    // Per-collection settings
    collections: ['pages', 'posts', 'projects', 'creators'].map((slug) => ({
      slug: slug as CollectionSlug,
      export: {
        format: 'json',
        // Generates e.g., "{slug}-export-2026-08-03" (without the .json extension)
        filename: `${slug}-export-${new Date().toISOString().split('T')[0]}`,
        limit: 1000,
      },
      import: {
        defaultVersionStatus: 'draft',
        limit: 500,
      },
    })),
  }),
]
