/**
 * Renders a JSON-LD block. Server component - structured data is markup, never state,
 * so it must not ship to the client.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // JSON.stringify does not escape '<', so a value containing "</script>" would close
  // this tag early and inject markup. Escaping it as \u003c keeps the JSON valid and
  // the string inert.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
