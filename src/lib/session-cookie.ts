/**
 * Edge-safe module. Holds shared constants that the Netlify Edge / Next.js
 * Edge runtimes need to import without pulling in Node-only dependencies like
 * mongoose. Keep this file free of any imports.
 */
export const AUTH_COOKIE = "tuf_session";
