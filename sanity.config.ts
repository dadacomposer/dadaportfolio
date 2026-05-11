import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schema } from './src/sanity/schema';

export default defineConfig({
  name: 'default',
  title: 'DADA.COMPOSER Studio',

  projectId: '4o79sm04',
  dataset: 'production',

  basePath: '/studio',

  plugins: [deskTool()],

  schema: schema,
});
