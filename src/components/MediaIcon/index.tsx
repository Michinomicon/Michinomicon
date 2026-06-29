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
import FileQuestionMarkPNG from '@/public/file-question-mark.png'

import { type LucideProps } from 'lucide-react'
import { StaticImageData } from 'next/image'

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

// export function MediaFileTypeIconPNG(file: Media | { mimeType: string }): StaticImageData {
//   const { mimeType } = file
//   if (mimeType && mimeType.length > 0) {
//     switch (true) {
//       case mimeType.includes('audio'):
//         return FileHeadphoneSVG
//       case mimeType.includes('video'):
//         return FileVideoCameraSVG
//       case mimeType.includes('image'):
//         return FileImageSVG
//       case mimeType.includes('application'):
//         switch (true) {
//           case mimeType.includes('pdf'):
//             return FileTextSVG
//           case mimeType.includes('zip') || mimeType.includes('compressed'):
//             return FileQuestionMarkPNG
//         }
//     }
//     // There IS a MIMEType, but there is no icon here for it yet
//     // So just return a generic file icon
//     return FileSVG
//   }
//   // No MIMETye value means we don't know what it is
//   return FileQuestionMarkSVG
// }

// const LucideIconDataURLs = {
//   File: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjMGMwYzAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1maWxlLWljb24gbHVjaWRlLWZpbGUiPjxwYXRoIGQ9Ik02IDIyYTIgMiAwIDAgMS0yLTJWNGEyIDIgMCAwIDEgMi0yaDhhMi40IDIuNCAwIDAgMSAxLjcwNC43MDZsMy41ODggMy41ODhBMi40IDIuNCAwIDAgMSAyMCA4djEyYTIgMiAwIDAgMS0yIDJ6Ii8+PHBhdGggZD0iTTE0IDJ2NWExIDEgMCAwIDAgMSAxaDUiLz48L3N2Zz4=',
//   FileHeadphone:
//     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjMGMwYzAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1mb2xkZXItYXJjaGl2ZS1pY29uIGx1Y2lkZS1mb2xkZXItYXJjaGl2ZSI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxOSIgcj0iMiIvPjxwYXRoIGQ9Ik0yMC45IDE5LjhBMiAyIDAgMCAwIDIyIDE4VjhhMiAyIDAgMCAwLTItMmgtNy45YTIgMiAwIDAgMS0xLjY5LS45TDkuNiAzLjlBMiAyIDAgMCAwIDcuOTMgM0g0YTIgMiAwIDAgMC0yIDJ2MTNhMiAyIDAgMCAwIDIgMmg1LjEiLz48cGF0aCBkPSJNMTUgMTF2LTEiLz48cGF0aCBkPSJNMTUgMTd2LTIiLz48L3N2Zz4=',
//   FileQuestionMark:
//     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZpbGUtcXVlc3Rpb24tbWFyay1pY29uIGx1Y2lkZS1maWxlLXF1ZXN0aW9uLW1hcmsiPjxwYXRoIGQ9Ik02IDIyYTIgMiAwIDAgMS0yLTJWNGEyIDIgMCAwIDEgMi0yaDhhMi40IDIuNCAwIDAgMSAxLjcwNC43MDZsMy41ODggMy41ODhBMi40IDIuNCAwIDAgMSAyMCA4djEyYTIgMiAwIDAgMS0yIDJ6Ii8+PHBhdGggZD0iTTEyIDE3aC4wMSIvPjxwYXRoIGQ9Ik05LjEgOWEzIDMgMCAwIDEgNS44MiAxYzAgMi0zIDMtMyAzIi8+PC9zdmc+',
//   FileText:
//     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZpbGUtdGV4dC1pY29uIGx1Y2lkZS1maWxlLXRleHQiPjxwYXRoIGQ9Ik02IDIyYTIgMiAwIDAgMS0yLTJWNGEyIDIgMCAwIDEgMi0yaDhhMi40IDIuNCAwIDAgMSAxLjcwNC43MDZsMy41ODggMy41ODhBMi40IDIuNCAwIDAgMSAyMCA4djEyYTIgMiAwIDAgMS0yIDJ6Ii8+PHBhdGggZD0iTTE0IDJ2NWExIDEgMCAwIDAgMSAxaDUiLz48cGF0aCBkPSJNMTAgOUg4Ii8+PHBhdGggZD0iTTE2IDEzSDgiLz48cGF0aCBkPSJNMTYgMTdIOCIvPjwvc3ZnPg==',
//   FileVideoCamera:
//     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZpbGUtdmlkZW8tY2FtZXJhLWljb24gbHVjaWRlLWZpbGUtdmlkZW8tY2FtZXJhIj48cGF0aCBkPSJNNCAxMlY0YTIgMiAwIDAgMSAyLTJoOGEyLjQgMi40IDAgMCAxIDEuNzA2LjcwNmwzLjU4OCAzLjU4OEEyLjQgMi40IDAgMCAxIDIwIDh2MTJhMiAyIDAgMCAxLTIgMiIvPjxwYXRoIGQ9Ik0xNCAydjVhMSAxIDAgMCAwIDEgMWg1Ii8+PHBhdGggZD0ibTEwIDE3Ljg0MyAzLjAzMy0xLjc1NWEuNjQuNjQgMCAwIDEgLjk2Ny41NnY0LjcwNGEuNjUuNjUgMCAwIDEtLjk2Ny41NkwxMCAyMC4xNTciLz48cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI2IiB4PSIzIiB5PSIxNiIgcng9IjEiLz48L3N2Zz4=',
//   FileImage:
//     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZpbGUtaW1hZ2UtaWNvbiBsdWNpZGUtZmlsZS1pbWFnZSI+PHBhdGggZD0iTTYgMjJhMiAyIDAgMCAxLTItMlY0YTIgMiAwIDAgMSAyLTJoOGEyLjQgMi40IDAgMCAxIDEuNzA0LjcwNmwzLjU4OCAzLjU4OEEyLjQgMi40IDAgMCAxIDIwIDh2MTJhMiAyIDAgMCAxLTIgMnoiLz48cGF0aCBkPSJNMTQgMnY1YTEgMSAwIDAgMCAxIDFoNSIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTIiIHI9IjIiLz48cGF0aCBkPSJtMjAgMTctMS4yOTYtMS4yOTZhMi40MSAyLjQxIDAgMCAwLTMuNDA4IDBMOSAyMiIvPjwvc3ZnPg==',
//   FolderArchive:
//     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZvbGRlci1hcmNoaXZlLWljb24gbHVjaWRlLWZvbGRlci1hcmNoaXZlIj48Y2lyY2xlIGN4PSIxNSIgY3k9IjE5IiByPSIyIi8+PHBhdGggZD0iTTIwLjkgMTkuOEEyIDIgMCAwIDAgMjIgMThWOGEyIDIgMCAwIDAtMi0yaC03LjlhMiAyIDAgMCAxLTEuNjktLjlMOS42IDMuOUEyIDIgMCAwIDAgNy45MyAzSDRhMiAyIDAgMCAwLTIgMnYxM2EyIDIgMCAwIDAgMiAyaDUuMSIvPjxwYXRoIGQ9Ik0xNSAxMXYtMSIvPjxwYXRoIGQ9Ik0xNSAxN3YtMiIvPjwvc3ZnPg==',
// }
