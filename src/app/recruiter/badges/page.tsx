import { BadgeCaseView } from '@/recruiter/badge-case/BadgeCaseView'

export const metadata = {
  title: 'Badges',
  description: "How much of the portfolio has the visitor explored? The visitor's Badge Case.",
}

/**
 * Badge Case - "How much has the visitor explored?" Badges belong to the visitor;
 * live unlock state is read from BadgeProvider inside BadgeCaseView.
 */
export default function BadgesPage() {
  return <BadgeCaseView />
}
