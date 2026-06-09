export type TabId = "today" | "plan" | "renfo" | "progres" | "admin"

/** Icônes des onglets / nav (communes desktop & mobile). */
export function NavIcon({ name, on }: { name: TabId; on: boolean }) {
  const c = on ? "var(--accent)" : "var(--muted)"
  const sw = 1.9
  const glyph: Record<TabId, JSX.Element> = {
    today: (
      <g fill="none" stroke={c} strokeWidth={sw}>
        <circle cx="11" cy="11" r="4" />
        <circle cx="11" cy="11" r="8.5" opacity=".5" />
      </g>
    ),
    plan: (
      <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
        <rect x="3" y="4.5" width="16" height="14.5" rx="2.5" />
        <path d="M3 8.5h16M7.5 2.5v4M14.5 2.5v4" />
      </g>
    ),
    renfo: (
      <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
        <path d="M4 8v6M18 8v6M4 11h14M1.5 9.5v3M20.5 9.5v3" />
      </g>
    ),
    progres: (
      <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14l4-4 3.5 3L18 6" />
        <path d="M14 6h4v4" />
      </g>
    ),
    admin: (
      <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2.5l7 3v5c0 4.2-3 7.4-7 8.5-4-1.1-7-4.3-7-8.5v-5z" />
        <path d="M8 10.5l2 2 4-4" />
      </g>
    ),
  }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22">
      {glyph[name]}
    </svg>
  )
}
