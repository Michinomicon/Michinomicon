import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { hasAccess } from '@/utilities/accessFunctions'
import { mediaCollectionBeforeChange } from '@/hooks/mediaCollectionBeforeChange'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  admin: {
    group: 'Globals',
    useAsTitle: 'title',
  },
  disableDuplicate: true,
  access: {
    read: () => true,
    create: hasAccess('media', 'create'),
    update: hasAccess('media', 'upd'),
    delete: hasAccess('media', 'del'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      hooks: {
        beforeValidate: [
          ({ value, req, data }) => {
            if (value) return value
            // new upload ? grab the filename from the request.
            if (req?.file?.name) {
              // Strip file extension
              return req.file.name.replace(/\.[^/.]+$/, '')
            }
            // use the existing filename if no title is present.
            if (data?.filename) {
              return data.filename.replace(/\.[^/.]+$/, '')
            }
            return value
          },
        ],
      },
    },
    { 
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
        description: 'Select Category.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        condition: (data) => data?.mimeType?.startsWith('image/'),
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            // If the alt field is empty, but a title exists, adopt the title
            if (!value && siblingData?.title) {
              return siblingData.title
            }
            // else, keep existing
            return value
          },
        ],
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      admin: {
        condition: (data) => data?.mimeType?.startsWith('image/'),
      },
    },
    // --- SHARED IMAGE/VIDEO METADATA FIELDS ---
    {
      type: 'row',
      fields: [
        {
          name: 'width',
          type: 'number',
          admin: {
            readOnly: true,
            condition: (data) =>
              data?.mimeType?.startsWith('image/') || data?.mimeType?.startsWith('video/'),
          },
        },
        {
          name: 'height',
          type: 'number',
          admin: {
            readOnly: true,
            condition: (data) =>
              data?.mimeType?.startsWith('image/') || data?.mimeType?.startsWith('video/'),
          },
        },
      ],
    },
    // --- SHARED AUDIO/VIDEO METADATA FIELDS ---
    {
      name: 'duration',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Duration in seconds',
        condition: (data) =>
          data?.mimeType?.startsWith('audio/') || data?.mimeType?.startsWith('video/'),
      },
    },

    // --- AUDIO ONLY METADATA FIELDS ---
    {
      type: 'row',
      fields: [
        {
          name: 'artist',
          type: 'text',
          admin: {
            condition: (data) => data?.mimeType?.startsWith('audio/'),
          },
        },
        {
          name: 'album',
          type: 'text',
          admin: {
            condition: (data) => data?.mimeType?.startsWith('audio/'),
          },
        },
        {
          name: 'artwork',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data) => data?.mimeType?.startsWith('audio/'),
          },
        },
        {
          name: 'images',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'text',
              defaultValue: '',
            },
          ],
          admin: {
            readOnly: true,
            condition: (data) => data?.mimeType?.startsWith('audio/'),
          },
        },
        {
          name: 'genre',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data) => data?.mimeType?.startsWith('audio/'),
          },
        },
        {
          name: 'live',
          type: 'checkbox',
          admin: {
            readOnly: true,
            condition: (data) => data?.mimeType?.startsWith('audio/'),
          },
        },
      ],
    },

    // --- IMAGE ONLY METADATA FIELDS ---
    {
      type: 'row',
      fields: [
        {
          name: 'format',
          type: 'text',
          admin: {
            readOnly: true,
            condition: (data) => data?.mimeType?.startsWith('image/'),
          },
        },
        {
          name: 'hasAlpha',
          type: 'checkbox',
          admin: {
            readOnly: true,
            condition: (data) => data?.mimeType?.startsWith('image/'),
          },
        },
      ],
    },

    // --- VIDEO ONLY METADATA FIELDS ---
    {
      name: 'codec',
      type: 'text',
      admin: {
        readOnly: true,
        condition: (data) => data?.mimeType?.startsWith('video/'),
      },
    },
  ],
  upload: {
    staticDir: process.env.PAYLOAD_MEDIA_DIR || path.resolve(dirname, `../../shared-media`),
    mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  hooks: {
    beforeChange: [mediaCollectionBeforeChange],
  },
}

/* -------------------------- IMAGE METADATA TYPES --------------------------
sharp.Metadata  = {
  orientation: 0,
  format: 'avif',
  size: 0,
  width: 0,
  height: 0,
  autoOrient: {
    width: 0,
    height: 0
  },
  space: 'b-w',
  channels: 2,
  depth: 'char',
  density: 0,
  chromaSubsampling: '',
  isProgressive: false,
  isPalette: false,
  bitsPerSample: 0,
  pages: 0,
  pageHeight: 0,
  loop: 0,
  delay: [],
  pagePrimary: 0,
  hasProfile: false,
  hasAlpha: false,
  exif: undefined,
  icc: undefined,
  iptc: undefined,
  xmp: undefined,
  xmpAsString: '',
  tifftagPhotoshop: undefined,
  compression: 'av1',
  background: {
    r: 0,
    g: 0,
    b: 0
  },
  levels: [],
  subifds: 0,
  resolutionUnit: 'inch',
  formatMagick: '',
  comments: []
}
*/

/* -------------------------- AUDIO METADATA TYPES --------------------------
IAudioMetadata = {
  common: {
    //ICommonTagsResult
    track: {
      no: null,
      of: null
    },
    disk: {
      no: null,
      of: null
    },
    year: 0,
    title: '',
    artist: '',
    artists: [],
    albumartist: '',
    albumartists: [],
    album: '',
    date: '',
    originaldate: '',
    originalyear: 0,
    releasedate: '',
    comment: [],
    genre: [],
    picture: [],
    composer: [],
    lyrics: [],
    albumsort: '',
    titlesort: '',
    work: '',
    artistsort: '',
    albumartistsort: '',
    composersort: '',
    lyricist: [],
    writer: [],
    conductor: [],
    remixer: [],
    arranger: [],
    engineer: [],
    publisher: [],
    producer: [],
    djmixer: [],
    mixer: [],
    technician: [],
    label: [],
    grouping: '',
    subtitle: [],
    description: [],
    longDescription: '',
    discsubtitle: [],
    totaltracks: '',
    totaldiscs: '',
    movementTotal: 0,
    compilation: false,
    rating: [],
    bpm: 0,
    mood: '',
    media: '',
    catalognumber: [],
    tvShow: '',
    tvShowSort: '',
    tvSeason: 0,
    tvEpisode: 0,
    tvEpisodeId: '',
    tvNetwork: '',
    podcast: false,
    podcasturl: '',
    releasestatus: '',
    releasetype: [],
    releasecountry: '',
    script: '',
    language: '',
    copyright: '',
    license: '',
    encodedby: '',
    encodersettings: '',
    gapless: false,
    barcode: '',
    isrc: [],
    asin: '',
    musicbrainz_recordingid: '',
    musicbrainz_trackid: '',
    musicbrainz_albumid: '',
    musicbrainz_artistid: [],
    musicbrainz_albumartistid: [],
    musicbrainz_releasegroupid: '',
    musicbrainz_workid: '',
    musicbrainz_trmid: '',
    musicbrainz_discid: '',
    acoustid_id: '',
    acoustid_fingerprint: '',
    musicip_puid: '',
    musicip_fingerprint: '',
    website: '',
    'performer:instrument': [],
    averageLevel: 0,
    peakLevel: 0,
    notes: [],
    originalalbum: '',
    originalartist: '',
    discogs_artist_id: [],
    discogs_release_id: 0,
    discogs_label_id: 0,
    discogs_master_release_id: 0,
    discogs_votes: 0,
    discogs_rating: 0,
    replaygain_track_gain_ratio: 0,
    replaygain_track_peak_ratio: 0,
    replaygain_track_gain: IRatio,
    replaygain_track_peak: IRatio,
    replaygain_album_gain: IRatio,
    replaygain_album_peak: IRatio,
    replaygain_undo: {
      leftChannel: 0,
      rightChannel: 0
    },
    replaygain_track_minmax: [],
    replaygain_album_minmax: [],
    key: '',
    category: [],
    hdVideo: 0,
    keywords: [],
    movement: '',
    movementIndex: {
      no: null,
      of: null
    },
    podcastId: '',
    showMovement: false,
    stik: 0,
    playCounter: 0
  },
  format: {
    // IFormat
    trackInfo: [],
    container: '',
    tagTypes: [],
    duration: 0,
    bitrate: 0,
    sampleRate: 0,
    bitsPerSample: 0,
    tool: '',
    codec: '',
    codecProfile: '',
    lossless: false,
    numberOfChannels: 0,
    numberOfSamples: 0,
    audioMD5: Uint8Array<ArrayBufferLike>,
    chapters: [],
    creationTime: Date,
    modificationTime: Date,
    trackGain: 0,
    trackPeakLevel: 0,
    albumGain: 0,
    hasAudio: false,
    hasVideo: false
  },
  native: {},
  quality: {
    // IQualityInformation
    warnings: []
  }
};
*/
