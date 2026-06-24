import type React from "react"
import type { ProgressApi } from "@/hooks/useProgress"
import { DAY_NAMES, type PlanWeek, RENFO_DOW, sessionForDay, weekDayDate, weekDays } from "@/lib/plan"

const LETTER: Record<string, string> = {
  renfo: "R",
  qual: "Q",
  longue: "L",
  easy: "F",
  easyW: "F",
  repos1: "·",
  repos5: "·",
}

/** Bande des 7 jours (lun→dim) de la semaine `w`. `selected`/`today` = dow (0=dim..6=sam). */
export function WeekStrip({
  w,
  prog,
  selected,
  today,
  onSelect,
  variant,
}: {
  w: PlanWeek
  prog: ProgressApi
  selected: number
  today: number
  onSelect: (dow: number) => void
  variant: "d" | "m"
}) {
  return (
    <div className={`${variant}-wk-strip`}>
      {weekDays(w).map(({ dow }) => {
        const sess = sessionForDay(dow, w)
        const sk = `${w.n}-${sess.key}`
        const done = !!prog.s.sessions[sk]
        const moved = prog.s.moved[sk] != null
        const isRest = sess.key.startsWith("repos")
        const cls = [
          `${variant}-wk-day`,
          dow === selected ? "sel" : "",
          dow === today ? "today" : "",
          done ? "done" : "",
          moved ? "moved" : "",
          isRest ? "rest" : "",
          dow === RENFO_DOW ? "renfo" : "",
        ]
          .filter(Boolean)
          .join(" ")
        return (
          <button
            type="button"
            key={dow}
            className={cls}
            style={!done && !isRest ? ({ ["--day-col"]: sess.col } as React.CSSProperties) : undefined}
            onClick={() => onSelect(dow)}
            aria-label={`${DAY_NAMES[dow]} ${weekDayDate(w.n, dow).getDate()} — ${sess.type}`}
          >
            <span className="wk-day-d">{DAY_NAMES[dow].slice(0, 3).toLowerCase()}</span>
            <span className="wk-day-ic">{done ? "✓" : moved ? "→" : (LETTER[sess.key] ?? "·")}</span>
            <span className="wk-day-n">{weekDayDate(w.n, dow).getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}
