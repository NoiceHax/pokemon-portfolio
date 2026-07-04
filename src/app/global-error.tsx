'use client'

/**
 * Global error boundary (catches errors in the root layout itself). Must render its own
 * <html>/<body>. Kept minimal and dependency-free so it works even if the app shell
 * failed to load.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100dvh',
          margin: 0,
          background: '#000',
          color: '#fff',
          fontFamily: 'monospace',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <div>
          <p style={{ color: '#E3350D', fontSize: '1.5rem' }}>The console froze.</p>
          <p style={{ opacity: 0.8, marginTop: '0.75rem' }}>
            An unexpected error occurred. Try powering on again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              background: '#E3350D',
              color: '#fff',
              border: 0,
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Restart
          </button>
        </div>
      </body>
    </html>
  )
}
