import { Media } from '@/payload-types'
import {
  File,
  FileImage,
  FileVideoCamera,
  FileText,
  FileHeadphone,
  FolderArchive,
  FileQuestionMark,
} from 'lucide-react'
import React from 'react'

import { type LucideProps } from 'lucide-react'

type MediaFileTypeIconProps = LucideProps & { file: Media | { mimeType: string } }
export function MediaFileTypeIcon({ file, ...props }: MediaFileTypeIconProps): React.ReactNode {
  const { mimeType } = file
  if (mimeType && mimeType.length > 0) {
    switch (true) {
      case mimeType.includes('audio'):
        return <FileHeadphone {...props} />
      case mimeType.includes('video'):
        return <FileVideoCamera {...props} />
      case mimeType.includes('image'):
        return <FileImage {...props} />
      case mimeType.includes('application'):
        switch (true) {
          case mimeType.includes('pdf'):
            return <FileText {...props} />
          case mimeType.includes('zip') || mimeType.includes('compressed'):
            return <FolderArchive {...props} />
        }
    }
    // There IS a MIMEType, but there is no icon here for it yet
    // So just return a generic file icon
    return <File {...props} />
  }
  // No MIMETye value means we don't know what it is
  return <FileQuestionMark {...props} />
}
