import type { z } from 'zod'

/**
 * Validate content against a schema, failing loudly with a readable message.
 *
 * Content is validated at load time so malformed data (a bad MDX frontmatter, a
 * missing alt text) is caught immediately rather than rendering broken UI. This is
 * the runtime half of the "correctly shaped, exactly once" guarantee.
 */
export function validateContent<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  context: string,
): z.output<S> {
  const result = schema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid content in "${context}":\n${issues}`)
  }
  return result.data
}
