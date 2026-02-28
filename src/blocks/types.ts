import {
  ArchiveBlock as ArchivePageBlock,
  CallToActionBlock as CallToActionPageBlock,
  ContentBlock as ContentPageBlock,
  FormBlock as FormPageBlock,
  MediaBlock as MediaPageBlock,
  Page,
} from '@/payload-types'

export type PageBlock = Page['layout'][0]
export type PageBlockType = PageBlock['blockType']
export type PageBlockByBlockType<T extends PageBlockType> = T extends ArchivePageBlock['blockType']
  ? ArchivePageBlock
  : T extends ContentPageBlock['blockType']
    ? ContentPageBlock
    : T extends CallToActionPageBlock['blockType']
      ? CallToActionPageBlock
      : T extends FormPageBlock['blockType']
        ? FormPageBlock
        : T extends MediaPageBlock['blockType']
          ? MediaPageBlock
          : never
