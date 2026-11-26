import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  eyebrow: string
  title: string
  children: ReactNode
  tone?: 'light' | 'dark'
}

/** Shared section wrapper: consistent heading hierarchy and spacing. */
export function Section({ id, eyebrow, title, children, tone = 'light' }: SectionProps) {
  return (
    <section id={id} className={`section section--${tone}`} aria-labelledby={`${id}-title`}>
      <div className="section__inner">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className="section__title">
          {title}
        </h2>
        <div className="section__body">{children}</div>
      </div>
    </section>
  )
}

/** Placeholder for sections whose content the business has not supplied yet. */
export function PendingContent({ what }: { what: string }) {
  return (
    <div className="pending">
      <p>
        <strong>{what}</strong> will appear here once the business provides the details. Nothing has been invented.
      </p>
    </div>
  )
}
