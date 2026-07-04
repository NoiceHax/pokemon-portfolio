'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Secret admin dashboard (Control Room). Two states:
 *  1. Login - password + 6-digit TOTP → /api/admin/login (sets a signed session cookie).
 *  2. Editor - list posts + create/edit/delete, all via /api/admin/posts (session-gated,
 *     rate-limited server-side). Auth is detected by trying to GET posts (401 → login).
 *
 * The whole surface is unlisted; server enforcement is the real gate, this is just the UI.
 */

type PostForm = {
  slug: string
  entryNumber: number
  type: string
  title: string
  excerpt: string
  bodyMdx: string
  date: string
  readMinutes: number
  tags: string
  draft: boolean
}

const TYPES = ['field-note', 'build-log', 'research', 'learning', 'thought', 'article']

const emptyForm = (): PostForm => ({
  slug: '',
  entryNumber: 1,
  type: 'article',
  title: '',
  excerpt: '',
  bodyMdx: '',
  date: new Date().toISOString().slice(0, 10),
  readMinutes: 3,
  tags: '',
  draft: true,
})

const input =
  'w-full rounded-md border border-edge bg-surface-raised px-3 py-2 font-mono text-sm text-ink focus:border-poke-red focus:outline-none'

/** Normalise a slug to what the server accepts (`^[a-z0-9-]+$`): lowercase, spaces/underscores → dashes. */
function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Build the exact payload the API expects, coercing numbers and cleaning the slug/tags. */
function buildPayload(form: PostForm) {
  const entryNumber = Math.max(1, Math.trunc(Number(form.entryNumber) || 0) || 1)
  const readMinutes = Math.max(1, Math.trunc(Number(form.readMinutes) || 0) || 1)
  return {
    slug: normalizeSlug(form.slug),
    entryNumber,
    type: form.type,
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    bodyMdx: form.bodyMdx,
    date: form.date,
    readMinutes,
    tags: form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    draft: form.draft,
  }
}

/** Turn a failed response into a human message, surfacing per-field Zod issues when present. */
async function describeError(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) return 'Session expired - please log in again.'
  const d = (await res.json().catch(() => ({}))) as {
    error?: string
    issues?: Record<string, string[]>
  }
  if (d.issues) {
    const fields = Object.entries(d.issues)
      .map(([field, msgs]) => `${field}: ${(msgs ?? []).join(', ')}`)
      .join(' · ')
    if (fields) return `${d.error ?? fallback} (${fields})`
  }
  return d.error ?? fallback
}

export function ControlRoom() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [posts, setPosts] = useState<PostForm[]>([])
  const [form, setForm] = useState<PostForm>(emptyForm())
  const [msg, setMsg] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    const res = await fetch('/api/admin/posts', { cache: 'no-store' })
    if (res.status === 401) {
      setAuthed(false)
      return
    }
    setAuthed(true)
    const data = (await res.json()) as { posts: { frontmatter: Record<string, unknown>; bodyMdx: string }[] }
    setPosts(
      data.posts.map((p) => ({
        slug: String(p.frontmatter.slug),
        entryNumber: Number(p.frontmatter.entryNumber),
        type: String(p.frontmatter.type),
        title: String(p.frontmatter.title),
        excerpt: String(p.frontmatter.excerpt),
        bodyMdx: p.bodyMdx,
        date: String(p.frontmatter.date),
        readMinutes: Number(p.frontmatter.readMinutes),
        tags: ((p.frontmatter.tags as string[]) ?? []).join(', '),
        draft: Boolean(p.frontmatter.draft),
      })),
    )
  }, [])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  if (authed === null) {
    return <Centered>Loading…</Centered>
  }
  if (!authed) {
    return <Login onSuccess={() => loadPosts()} />
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form)),
    })
    if (res.ok) {
      setMsg('Saved ✓')
      setForm(emptyForm())
      void loadPosts()
    } else {
      setMsg(await describeError(res, 'Could not save.'))
    }
  }

  const remove = async (slug: string) => {
    await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' })
    void loadPosts()
  }

  // Publish / unpublish a post in place: re-save it with `draft` flipped. Only `draft`
  // changes; every other field is sent back as-is so the upsert (keyed by slug) preserves
  // the post. A published post (draft=false) is what the public Journal reads.
  const setDraft = async (post: PostForm, draft: boolean) => {
    setMsg(null)
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload({ ...post, draft })),
    })
    if (res.ok) {
      setMsg(draft ? 'Unpublished ✓' : 'Published ✓')
      void loadPosts()
    } else {
      setMsg(await describeError(res, 'Could not update.'))
    }
  }

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    setAuthed(false)
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl text-poke-red">CONTROL ROOM · Journal</h1>
        <button onClick={logout} className="font-mono text-xs text-ink-soft underline">
          Log out
        </button>
      </div>

      <form onSubmit={save} className="grid gap-3 rounded-card border border-edge p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            Title
            <input
              className={input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label className="text-xs">
            Slug (lowercase-dashes)
            <input
              className={input}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </label>
          <label className="text-xs">
            Type
            <select
              className={input}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Entry #
            <input
              type="number"
              className={input}
              value={form.entryNumber}
              onChange={(e) => setForm({ ...form, entryNumber: Number(e.target.value) })}
            />
          </label>
          <label className="text-xs">
            Date
            <input
              type="date"
              className={input}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label className="text-xs">
            Read minutes
            <input
              type="number"
              className={input}
              value={form.readMinutes}
              onChange={(e) => setForm({ ...form, readMinutes: Number(e.target.value) })}
            />
          </label>
        </div>
        <label className="text-xs">
          Excerpt
          <input
            className={input}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            required
          />
        </label>
        <label className="text-xs">
          Tags (comma separated)
          <input
            className={input}
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </label>
        <label className="text-xs">
          Body (MDX / Markdown)
          <textarea
            rows={12}
            className={`${input} resize-y font-mono`}
            value={form.bodyMdx}
            onChange={(e) => setForm({ ...form, bodyMdx: e.target.value })}
          />
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 font-mono text-xs">
            <input
              type="checkbox"
              checked={form.draft}
              onChange={(e) => setForm({ ...form, draft: e.target.checked })}
            />
            Draft (unpublished)
          </label>
          <button
            type="submit"
            className="rounded-md bg-poke-red px-4 py-2 font-mono text-sm font-semibold text-white"
          >
            {form.draft ? 'Save draft' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => setForm(emptyForm())}
            className="font-mono text-xs text-ink-soft underline"
          >
            New / clear
          </button>
          {msg ? <span className="font-mono text-xs text-poke-red">{msg}</span> : null}
        </div>
      </form>

      <h2 className="mb-2 mt-8 font-display text-sm text-ink">Posts ({posts.length})</h2>
      <ul className="flex flex-col gap-2">
        {posts.map((p) => (
          <li
            key={p.slug}
            className="flex items-center justify-between rounded-card border border-edge px-3 py-2"
          >
            <div className="min-w-0">
              <span className="font-mono text-sm text-ink">{p.title}</span>
              <span className="ml-2 font-mono text-xs text-ink-faint">
                /{p.slug} · {p.draft ? 'draft' : 'live'}
              </span>
            </div>
            <div className="flex gap-3">
              {p.draft ? (
                <button
                  onClick={() => setDraft(p, false)}
                  className="font-mono text-xs font-semibold text-green-600 underline"
                >
                  Publish
                </button>
              ) : (
                <button
                  onClick={() => setDraft(p, true)}
                  className="font-mono text-xs text-ink-soft underline"
                >
                  Unpublish
                </button>
              )}
              <button
                onClick={() => setForm(p)}
                className="font-mono text-xs text-poke-red underline"
              >
                Edit
              </button>
              <button
                onClick={() => remove(p.slug)}
                className="font-mono text-xs text-ink-soft underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, totp }),
    })
    setBusy(false)
    if (res.ok) {
      onSuccess()
    } else if (res.status === 429) {
      setError('Too many attempts. Wait a bit.')
    } else {
      setError('Invalid credentials.')
    }
  }

  return (
    <Centered>
      <form onSubmit={submit} className="w-72 rounded-card border border-edge p-5">
        <p className="mb-4 font-display text-sm text-poke-red">Restricted</p>
        <input
          type="password"
          placeholder="Password"
          autoComplete="off"
          className={`${input} mb-3`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          inputMode="numeric"
          placeholder="6-digit code"
          autoComplete="off"
          className={input}
          value={totp}
          onChange={(e) => setTotp(e.target.value)}
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-md bg-poke-red px-4 py-2 font-mono text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Verifying…' : 'Enter'}
        </button>
        {error ? <p className="mt-3 font-mono text-xs text-poke-red">{error}</p> : null}
      </form>
    </Centered>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-surface px-4 text-ink">
      {children}
    </main>
  )
}
