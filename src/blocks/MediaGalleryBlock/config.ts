import type { Block } from 'payload'

export const MediaGalleryBlock: Block = {
  slug: 'mediaGalleryBlock',
  interfaceName: 'MediaGalleryBlock',
  fields: [
    {
      name: 'selectionMethod',
      type: 'radio',
      required: true,
      defaultValue: 'individual',
      options: [
        { label: 'Individual Selection', value: 'individual' },
        { label: 'Select by Category', value: 'category' },
      ],
    },
    {
      name: 'individualMedia',
      type: 'array',
      label: 'Selected Media',
      admin: {
        condition: (_, siblingData) => siblingData.selectionMethod === 'individual',
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'mediaCategory',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Media Category',
      admin: {
        condition: (_, siblingData) => siblingData.selectionMethod === 'category',
      },
    },
    {
      type: 'collapsible',
      label: 'Gallery Options',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          label: 'Display Options',
          type: 'group',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'display',
                  type: 'select',
                  required: true,
                  defaultValue: 'album',
                  label: 'Gallery Type',
                  admin: {
                    description:
                      'How the gallery should be presented visually. ( default: "album" )',
                  },
                  options: [
                    {
                      label: 'Album',
                      value: 'album',
                    },
                    {
                      label: 'Carousel',
                      value: 'carousel',
                    },
                    {
                      label: 'Inline',
                      value: 'inline',
                    },
                  ],
                },
                {
                  name: 'albumLayout',
                  type: 'select',
                  required: true,
                  defaultValue: 'masonry',
                  label: 'Album Layout',
                  admin: {
                    description:
                      'How the Album tiles should be presented visually. ( default: "masonry" )',
                    condition: (_, siblingData) => siblingData.display === 'album',
                  },
                  options: [
                    {
                      label: 'Masonry',
                      value: 'masonry',
                    },
                    {
                      label: 'Rows',
                      value: 'rows',
                    },
                    {
                      label: 'Columns',
                      value: 'columns',
                    },
                  ],
                },
                {
                  name: 'carouselImageFit',
                  type: 'select',
                  required: true,
                  defaultValue: 'cover',
                  label: 'Carousel ImageFit',
                  admin: {
                    description:
                      '`object-fit` property for images in the carousel. ( default: "cover" )',
                    condition: (_, siblingData) => siblingData.display === 'carousel',
                  },
                  options: [
                    {
                      label: 'Cover',
                      value: 'cover',
                    },
                    {
                      label: 'Contain',
                      value: 'contain',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Features',
          type: 'group',
          fields: [
            {
              label: 'Thumbnails',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'thumbnailsHidden',
                      type: 'checkbox',
                      label: 'Hide Thumbnails ( default: `false` )',
                      required: true,
                      defaultValue: false,
                      admin: {
                        description: 'Hides the Image Thumbnails in the gallery.',
                      },
                    },
                    {
                      name: 'thumbnailsShowToggle',
                      type: 'checkbox',
                      label: 'Display Thumbnails Show/Hide toggle',
                      defaultValue: false,
                      admin: {
                        description:
                          'Show the Thumbnails Show/Hide button in the toolbar. ( default: `false` )',
                        condition: (_, siblingData) => siblingData.thumbnailsHidden === false,
                      },
                    },

                    {
                      name: 'thumbnailsPosition',
                      type: 'select',
                      defaultValue: 'bottom',
                      label: 'Thumbnail Row Position',
                      admin: {
                        description:
                          'Select the position of the thumbnail images relative to the active image. ( default = `bottom` )',
                        condition: (_, siblingData) => siblingData.thumbnailsHidden === false,
                      },
                      options: [
                        {
                          label: 'Left (Vertical)',
                          value: 'start',
                        },
                        {
                          label: 'Right (Vertical)',
                          value: 'end',
                        },
                        {
                          label: 'Bottom (Horizontal)',
                          value: 'bottom',
                        },
                        {
                          label: 'Top (Horizontal)',
                          value: 'top',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'Toolbar Options',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'toolbarFullscreen',
                      type: 'checkbox',
                      label: 'Display Fullscreen Toggle',
                      required: true,
                      defaultValue: true,
                      admin: {
                        description:
                          'Display the "Fullscreen" button in the toolbar. ( default: `true` )',
                      },
                    },
                    {
                      name: 'toolbarCounter',
                      type: 'checkbox',
                      label: 'Display Progress Counter',
                      required: true,
                      defaultValue: true,
                      admin: {
                        description:
                          'Show the progress counter in toolbar (e.g. `3 / 10` ). ( default: `true` )',
                      },
                    },
                    {
                      name: 'toolbarZoom',
                      type: 'checkbox',
                      label: 'Display Zoom Controls',
                      required: true,
                      defaultValue: true,
                      admin: {
                        description: 'Show the zoom in/out controls in toolbar ( default: `true` )',
                      },
                    },
                  ],
                },
              ],
            },
            {
              label: 'Slideshow Options',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'slideshowEnable',
                      type: 'checkbox',
                      label: 'Enable Slideshow',
                      required: true,
                      defaultValue: false,
                      admin: {
                        description:
                          'Enable the Slideshow feature for this gallery. ( default: `false` )',
                      },
                    },
                    {
                      name: 'slideshowAutoplay',
                      type: 'checkbox',
                      label: 'Autoplay Slideshow',
                      required: true,
                      defaultValue: false,
                      admin: {
                        description:
                          'Should the slideshow start automatically. ( default: `false` )',
                      },
                    },
                    {
                      name: 'slideshowDelay',
                      type: 'number',
                      label: 'Transition Delay between changing images',
                      required: true,
                      defaultValue: 3000,
                      min: 500,
                      max: 5000,
                      admin: {
                        step: 100,
                        description:
                          'How long to display each image before in milliseconds. ( default: `3000` )',
                      },
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
