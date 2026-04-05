import type { TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
  type LinkFields,
  AlignFeature,
  BlockquoteFeature,
  ChecklistFeature,
  IndentFeature,
  OrderedListFeature,
  RelationshipFeature,
  SubscriptFeature,
  SuperscriptFeature,
  TextStateFeature,
  TreeViewFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

export const defaultLexical = lexicalEditor({
  features: [
    SuperscriptFeature(),
    SubscriptFeature(),
    ParagraphFeature(),
    AlignFeature(),
    IndentFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    ChecklistFeature(),
    RelationshipFeature(),
    LinkFeature(),
    BlockquoteFeature(),
    UploadFeature(),
    TreeViewFeature(),
    TextStateFeature(),
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({
      enabledCollections: ['pages', 'posts'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true // no validation needed, as no url should exist for internal links
              }
              return value ? true : 'URL is required'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),
  ],
})
