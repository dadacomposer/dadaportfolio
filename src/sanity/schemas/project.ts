export default {
  name: 'project',
  title: 'Video Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Your Role',
      type: 'string',
      description: 'e.g., Original Score & Sound Design',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Commercial', value: 'commercial' },
          { title: 'Film & Score', value: 'film' },
          { title: 'Sound Design', value: 'sound-design' },
          { title: 'Brand Identity', value: 'brand' },
        ],
      },
    },
    {
      name: 'year',
      title: 'Year',
      type: 'string',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'videoFile',
      title: 'Video Preview File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    },
    {
      name: 'externalUrl',
      title: 'Full Video URL',
      type: 'url',
      description: 'Link to full version (Vimeo, YouTube, etc.)',
    },
  ],
};
