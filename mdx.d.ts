// Type declarations for importing .mdx files as React components.
// Journal entries also export a `frontmatter` const, validated at load time.
declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types'
  export const frontmatter: unknown
  export default function MDXContent(props: MDXProps): JSX.Element
}
