import type { MDXComponents } from 'mdx/types'

/**
 * Required by @next/mdx in the App Router. Maps MDX elements to React components.
 *
 * Kept empty (identity) for now - Journal entries render with default HTML elements.
 * When the Journal UI is built (Milestone 6), styled components are supplied here so
 * every entry gets consistent, accessible typography in one place.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components }
}
