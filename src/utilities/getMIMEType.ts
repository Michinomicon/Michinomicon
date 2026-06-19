import { MIMEType } from "node:util"

export const getMIMEType = (mimeType: unknown): MIMEType | null => {
  let mime: MIMEType | null = null

  try {
    mime = new MIMEType(mimeType as string | { toString: () => string })
  } catch (err) {
    console.error(`Error parsing value as MIMEType.`, { value: mimeType, error: String(err) })
  }

  return mime
}
