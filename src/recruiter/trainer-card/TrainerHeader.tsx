import { Laptop, Globe } from 'lucide-react'
import type { Profile } from '@/content/schema'

/**
 * Trainer Card header: avatar + name + Trainer ID on the left, class / region /
 * current quest on the right. Mirrors the Trainer Card mockup.
 */
export function TrainerHeader({ profile }: { profile: Profile }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
      {/* Identity */}
      <div className="flex flex-col items-center text-center">
        <span className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border-2 border-poke-red bg-surface-sunken">
          <img
            src={profile.avatar.src}
            alt={profile.avatar.alt}
            className="h-24 w-24 object-contain [image-rendering:pixelated]"
          />
        </span>
        <p className="mt-3 font-display text-2xl font-bold uppercase text-ink sm:text-3xl">{profile.name}</p>
        <p className="mt-1 rounded-md border border-poke-red px-3 py-1 font-mono text-xs text-poke-red">
          TRAINER ID: {profile.trainerId}
        </p>
      </div>

      {/* Attributes */}
      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Attribute icon={Laptop} label="Class" value={profile.role} />
          <Attribute icon={Globe} label="Region" value={profile.region} />
        </div>
        <div className="mt-4">
          <p className="font-mono text-xs uppercase tracking-wide text-poke-red">Current Quest</p>
          <blockquote className="mt-1 border-l-2 border-poke-red pl-3 font-mono text-sm italic text-ink">
            “{profile.currentQuest}”
          </blockquote>
        </div>
      </div>
    </div>
  )
}

function Attribute({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Laptop
  label: string
  value: string
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-poke-red">{label}</p>
      <p className="mt-1 flex items-center gap-2 break-words font-sans text-lg text-ink">
        <Icon aria-hidden className="h-4 w-4 shrink-0 text-ink-soft" />
        {value}
      </p>
    </div>
  )
}
