import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: '4o79sm04',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false, // Set to true for production if needed
});
