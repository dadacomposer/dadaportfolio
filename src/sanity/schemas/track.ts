export default {
  name: 'track',
  title: 'Audio Track',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category / Genre',
      type: 'string',
      description: 'e.g., Neo-classical / Synth',
    },
    {
      name: 'year',
      title: 'Year',
      type: 'string',
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g., 3:45',
    },
    {
      name: 'bpm',
      title: 'BPM',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'audioFile',
      title: 'Audio File',
      type: 'file',
      options: {
        accept: 'audio/*',
      },
    },
    {
      name: 'artwork',
      title: 'Album Artwork',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'previewStart',
      title: 'Preview Start (Seconds)',
      description: 'The exact second where the climax or most relevant part starts.',
      type: 'number',
    },
  ],
};
