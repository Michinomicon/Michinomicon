import { DataFromCollectionSlug, FieldHook, FieldHookArgs, TypeWithID } from 'payload'

export const populateReferenceLabel: FieldHook = async ({
  value,
  req,
  siblingData,
}: FieldHookArgs<TypeWithID, string | undefined, FieldHookArgs['siblingData']>) => {
  const type = siblingData.type as 'pages' | 'categories' | 'link' | undefined
  // check for valid relationship
  if (!value || (type !== 'pages' && type !== 'categories')) return value

  try {
    const relatedDoc: DataFromCollectionSlug<typeof type> = await req.payload.findByID({
      collection: type,
      id: value,
      depth: 0, // Set to 0 because we only need top-level data like the title
    })
    // Store the result hidden 'value' field.
    siblingData.referenceLabel = relatedDoc.title || 'Untitled Document'
  } catch (error) {
    req.payload.logger.error(`Error fetching referenced doc for label: ${error}`)
    siblingData.referenceLabel = 'Unknown Document'
  }
  // return the original value (ensures field saves correctly)
  return value
}
