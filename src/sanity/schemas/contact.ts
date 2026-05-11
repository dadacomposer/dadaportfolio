export default {
  name: 'contact',
  title: 'Contact Inquiries',
  type: 'document',
  fields: [
    {
      name: 'identity',
      title: 'Identity',
      type: 'string',
    },
    {
      name: 'projectName',
      title: 'Project Name',
      type: 'string',
    },
    {
      name: 'needs',
      title: 'Needs',
      type: 'array',
      of: [{type: 'string'}],
    },
    {
      name: 'budget',
      title: 'Budget Range',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Phone',
      type: 'string',
    },
    {
      name: 'message',
      title: 'Additional Message',
      type: 'text',
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }
  ],
  preview: {
    select: {
      title: 'projectName',
      subtitle: 'email'
    }
  }
}
