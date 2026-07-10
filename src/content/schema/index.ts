/**
 * Content schema barrel - the type contract for the entire product.
 *
 * Both experiences import content TYPES from here. If a field isn't in a schema, it
 * isn't content, and it must not be rendered. This is what physically enforces
 * "content exists once, correctly shaped."
 */
export * from './common'
export * from './profile'
export * from './project'
export * from './blog'
export * from './contact'
export * from './experience'
