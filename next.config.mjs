import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow MDX files to act as pages/content so the shared content layer can
  // author Journal entries and project write-ups in MDX (see DESIGN.md).
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  experimental: {
    // Windows: the parallel static-generation worker was crashing
    // (exit 0xC0000409) partway through prerender. Running generation on the main
    // thread with a single worker avoids the native crash. See docs/DECISIONS.md.
    workerThreads: false,
    cpus: 1,
  },
}

const withMDX = createMDX({
  // Remark/rehype plugins are added here as the content layer grows (Milestone 2).
  options: {},
})

export default withMDX(nextConfig)
