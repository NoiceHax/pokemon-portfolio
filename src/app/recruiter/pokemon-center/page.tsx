import { HeartPulse } from 'lucide-react'
import { getContact } from '@/lib/content'
import { PageHeader, Panel } from '@/recruiter/ui'
import { ContactForm, ContactLinks } from '@/recruiter/pokemon-center'

export const metadata = {
  title: 'Pokémon Center',
  description: 'How to reach Chandan - contact form, email, GitHub, LinkedIn and resume.',
}

/** Pokémon Center - "How can someone reach Chandan?" A welcoming contact page. */
export default function PokemonCenterPage() {
  const contact = getContact()

  return (
    <div>
      <PageHeader
        icon={HeartPulse}
        title="Pokémon Center"
        subtitle="Heal up and connect - send a transmission or reach out directly."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
        <Panel className="space-y-4 p-5">
          <p className="font-mono text-sm text-ink-soft">{contact.blurb}</p>
          <ContactLinks channels={contact.channels} />
        </Panel>

        <Panel brackets={false} className="p-5">
          <ContactForm />
        </Panel>
      </div>
    </div>
  )
}
