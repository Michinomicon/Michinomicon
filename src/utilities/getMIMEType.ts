import { MIMEType } from 'node:util'

export const getMIMEType = (mimeType: unknown): MIMEType | null => {
  let mime: MIMEType | null = null
  const mimeTypeString = String(mimeType)
  console.log(`Parsing MIMEType "${mimeTypeString}"`)
  try {
    mime = new MIMEType(mimeTypeString)
  } catch (err) {
    console.error(`Error parsing value as MIMEType.`, { value: mimeType, error: String(err) })
  }

  return mime
}
