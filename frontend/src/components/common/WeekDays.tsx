import { SessionCard } from "@/components/common/SessionCard"
import { type PlanExercise, type PlanWeek, RENFO_DOW, tint, weekDays } from "@/lib/plan"

interface WeekDaysProps {
  w: PlanWeek
  exercises: PlanExercise[]
  /** Jour ouvert par défaut (0 = dimanche). */
  openDow?: number
}

/** Accordéon jour-par-jour d'une semaine (lundi → dimanche), pour l'onglet « Le plan ». */
export function WeekDays({ w, exercises, openDow }: WeekDaysProps) {
  return (
    <div className="sess-list">
      {weekDays(w).map(({ dow, name, sess }) => (
        <SessionCard
          key={dow}
          color={sess.col}
          day={name}
          label={sess.type}
          summary={sess.tag}
          defaultOpen={dow === openDow}
        >
          <div className="sess-body-note">{sess.detail}</div>
          {dow === RENFO_DOW && (
            <ul className="day-ex">
              {exercises.map((e, i) => (
                <li key={i}>
                  <span className="day-ex-dot" style={{ background: tint(sess.col), color: sess.col }}>
                    {i + 1}
                  </span>
                  <span className="day-ex-n">{e.name}</span>
                  <span className="day-ex-vol">{e.vol}</span>
                </li>
              ))}
            </ul>
          )}
        </SessionCard>
      ))}
    </div>
  )
}
