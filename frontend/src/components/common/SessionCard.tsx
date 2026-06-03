import { type ReactNode, useState } from "react"

import { Check } from "@/components/common/Check"

interface SessionCardProps {
  color: string
  day: string
  label: string
  summary: string
  done: boolean
  onToggleDone: () => void
  defaultOpen?: boolean
  children: ReactNode
}

/** Carte de séance dépliable (écran Aujourd'hui), commune desktop & mobile. */
export function SessionCard({
  color,
  day,
  label,
  summary,
  done,
  onToggleDone,
  defaultOpen = false,
  children,
}: SessionCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={"sess-card" + (open ? " open" : "")}>
      <div className="sess-head">
        <button
          type="button"
          className="sess-main"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="sess-dot" style={{ background: color }} />
          <span className="sess-mid">
            <span className="sess-t">
              {day} · {label}
            </span>
            <span className="sess-d">{summary}</span>
          </span>
          <svg className="sess-chev" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className="sess-checkbtn"
          onClick={onToggleDone}
          aria-label={done ? "Marquer la séance comme non faite" : "Marquer la séance comme faite"}
          aria-pressed={done}
        >
          <Check on={done} col={color} size={24} variant="m" />
        </button>
      </div>
      {open && <div className="sess-body">{children}</div>}
    </div>
  )
}
