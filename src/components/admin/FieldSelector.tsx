'use client'
import React, { useEffect, useState } from 'react'
import { useFormFields, useConfig, useField, Select } from '@payloadcms/ui'
import type { ClientCollectionConfig, ClientField, ClientTab, FieldClientComponent } from 'payload'

export function getFieldName<T extends ClientField>(field: T) {
  if ('name' in field) {
    return field.name
  }
  return
}

export function getFieldLabel<T extends ClientField>(field: T) {
  if ('label' in field && field.label) {
    if (typeof field.label === 'string') {
      return field.label
    }
  }
  return
}

export type Option = {
  label: string
  value: string
}

export const FieldSelector: FieldClientComponent = (props) => {
  const { config } = useConfig()
  const path = props.path as string
  const { value, setValue } = useField({ path })
  const [fieldOptions, setFieldOptions] = useState<Array<Option>>([])
  const [isLoading, setIsLoading] = useState(false)

  const slugDocId = useFormFields(([fields]) => {
    const pathParts = path.split('.')
    for (let i = pathParts.length - 2; i >= 0; i--) {
      const testPath = pathParts.slice(0, i + 1).join('.')
      const collectionSlugPath = `${testPath}.collectionSlug`
      const fieldValue = fields[collectionSlugPath]?.value
      if (fieldValue) return fieldValue
    }
    return undefined
  })

  useEffect(() => {
    if (!slugDocId || !config) {
      setFieldOptions([])
      return
    }

    setIsLoading(true)

    const fetchFields = async () => {
      try {
        const slugResponse = await fetch(`/api/slugs/${slugDocId}`)
        if (!slugResponse.ok) {
          setFieldOptions([])
          setIsLoading(false)
          return
        }

        const slugDoc = await slugResponse.json()
        const slugString = slugDoc.slug || slugDoc.display

        const collection = config.collections?.find((col) => col.slug === slugString)

        if (!collection) {
          setFieldOptions([])
          setIsLoading(false)
          return
        }

        const extractFields = (
          fields: ClientCollectionConfig['fields'],
          prefix = '',
        ): Array<Option> => {
          const options: Array<Option> = []

          fields.forEach((field: ClientField) => {
            if (!field) return

            const fieldName = getFieldName(field)
            const fieldPath = prefix ? `${prefix}.${fieldName}` : (fieldName ?? '')
            const fieldLabel = `${getFieldLabel(field) ?? fieldName}`

            options.push({
              label: prefix ? `${prefix} → ${fieldLabel}` : fieldLabel,
              value: fieldPath,
            })

            switch (field.type) {
              case 'group':
              case 'array':
              case 'collapsible':
              case 'array':
                options.push(...extractFields(field.fields, prefix))
                break
              case 'tabs':
                field.tabs.forEach((tab: ClientTab) => {
                  if (tab.fields) {
                    const tabPrefix = fieldName ? `${fieldPath}.${fieldName}` : fieldPath
                    options.push(...extractFields(tab.fields, tabPrefix))
                  }
                })
                break
              case 'blocks':
                field.blocks.forEach((block) => {
                  if (block.fields) {
                    options.push(...extractFields(block.fields, `${fieldPath}.${block.slug}`))
                  }
                })
                break
              default:
                break
            }
          })

          return options
        }

        const options = extractFields(collection.fields || [])
        setFieldOptions(options)
      } catch (error) {
        console.error('Error loading collection fields:', error)
        setFieldOptions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFields()
  }, [slugDocId, config])

  return (
    <Select
      isMulti
      isClearable
      disabled={!slugDocId || isLoading}
      onChange={(selectedOptions) => {
        if (Array.isArray(selectedOptions)) {
          setValue(selectedOptions.map((opt) => opt.value))
        } else {
          setValue([])
        }
      }}
      options={fieldOptions}
      value={Array.isArray(value) ? fieldOptions.filter((opt) => value.includes(opt.value)) : []}
    />
  )
}
