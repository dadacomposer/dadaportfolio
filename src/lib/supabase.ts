/**
 * The portfolio is temporarily offline while its data layer is retired.
 * No database client or credentials are loaded by the application.
 */
export const supabase = new Proxy({}, {
  get() {
    throw new Error('The data layer is unavailable while DADA.COMPOSER is under construction.');
  },
}) as any;
