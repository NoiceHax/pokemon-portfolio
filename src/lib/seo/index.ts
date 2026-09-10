/**
 * SEO surface - canonical URLs, share images and JSON-LD.
 *
 * Pages import from here so the origin and the structured-data shapes are defined
 * exactly once (see src/lib/README.md: lib may depend on content, never on UI).
 */
export { SITE_URL, SITE_NAME, AUTHOR_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from './config'
export { projectOgImage, journalOgImage } from './ogImage'
export { JsonLd } from './JsonLd'
export { personSchema, webSiteSchema, blogPostingSchema, projectSchema } from './schema'
