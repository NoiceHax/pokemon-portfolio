import { Database } from 'lucide-react'
import { Panel } from '@/recruiter/ui'

/**
 * "Professor Oak's Data Bank" intro panel above the Pokédex grid (mockup). Static
 * framing copy - it introduces the section, not portfolio facts.
 */
export function DataBankHeader() {
  return (
    <Panel className="mb-6 p-5">
      <div className="flex items-start gap-4">
        <Database aria-hidden className="mt-1 h-8 w-8 shrink-0 text-poke-red" strokeWidth={2} />
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-poke-red">
            Professor Oak&rsquo;s Data Bank
          </p>
          <p className="font-display text-xl font-bold text-ink">Data Bank</p>
          <p className="mt-2 font-mono text-sm italic text-ink-soft">
            “Welcome to the repository. Cataloguing knowledge is the first step towards mastery.”
          </p>
          <p className="mt-1 font-mono text-xs text-poke-red">- Prof. Oak, Chief Architect</p>
        </div>
      </div>
    </Panel>
  )
}
