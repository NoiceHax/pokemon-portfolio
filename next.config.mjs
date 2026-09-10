import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow MDX files to act as pages/content so the shared content layer can
  // author Journal entries and project write-ups in MDX (see DESIGN.md).
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  images: {
    // Project covers are multi-hundred-KB PNG/JPG screenshots; AVIF/WebP cuts them
    // dramatically. Next picks the first format the requesting browser accepts.
    // AVIF encoding is expensive, which is why `sharp` is a dependency: without it Next
    // falls back to a WASM encoder that takes ~5x as long per variant.
    formats: ['image/avif', 'image/webp'],
    // How long an optimized variant is cached. Set here rather than inherited from the
    // source file's own Cache-Control, so the covers in public/projects can carry a short
    // header - their filenames are not content-hashed, so replacing a screenshot in place
    // has to be able to take effect - without collapsing the optimized cache to the 60s
    // default along with it.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  experimental: {
    // Windows: the parallel static-generation worker was crashing
    // (exit 0xC0000409) partway through prerender. Running generation on the main
    // thread with a single worker avoids the native crash. See docs/DECISIONS.md.
    workerThreads: false,
    cpus: 1,
    // lucide-react is a barrel export; without this every icon import pulls the whole
    // icon set into the client bundle.
    optimizePackageImports: ['lucide-react'],
  },
  /**
   * Baseline security headers. Defined here rather than in vercel.json so they also apply
   * to local runs and any non-Vercel host - and so they can be verified with `next start`.
   *
   * Deliberately omitted: Permissions-Policy (nothing here uses those APIs) and HSTS
   * preload (irreversible). A CSP would need Report-Only first, since JsonLd renders an
   * inline <script>.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
  // Old /recruiter URLs → /home (bookmark + external link compatibility).
  async redirects() {
    return [
      { source: '/recruiter', destination: '/home', permanent: true },
      { source: '/recruiter/:path*', destination: '/home/:path*', permanent: true },
    ]
  },
}

const withMDX = createMDX({
  // Remark/rehype plugins are added here as the content layer grows (Milestone 2).
  options: {},
})

export default withMDX(nextConfig)
