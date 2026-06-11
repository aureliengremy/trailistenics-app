import { ExerciseChecklist } from "@/components/common/ExerciseChecklist"
import { KmField } from "@/components/common/KmField"
import { SessionCard } from "@/components/common/SessionCard"
import type { ProgressApi } from "@/hooks/useProgress"
import {
  DAY_NAMES,
  kmKeyFor,
  nextDow,
  PLANNED_DOW,
  type PlanExercise,
  type PlanWeek,
  plannedKmFor,
  sessionByKey,
} from "@/lib/plan"

/**
 * Contrôles de report d'une séance : « pas pu ce jour-là ? » → la décale au lendemain
 * (elle apparaît alors sur l'écran Aujourd'hui du jour cible) ; report annulable.
 * `fromDow` = jour où la séance se trouve actuellement (planifié, ou cible d'un 1er report).
 */
export function MoveControls({
  sk,
  fromDow,
  prog,
}: {
  sk: string
  fromDow: number
  prog: ProgressApi
}) {
  const movedTo = prog.s.moved[sk]
  const next = nextDow(fromDow)
  if (movedTo != null) {
    return (
      <div className="sess-moveline">
        <span className="sess-moved-tag">→ Reportée à {DAY_NAMES[movedTo].toLowerCase()}</span>
        <button type="button" className="sess-movebtn" onClick={() => prog.setMoved(sk, null)}>
          Annuler le report
        </button>
      </div>
    )
  }
  if (next == null || prog.s.sessions[sk]) return null
  return (
    <div className="sess-moveline">
      <button type="button" className="sess-movebtn" onClick={() => prog.setMoved(sk, next)}>
        Pas pu ? Reporter à {DAY_NAMES[next].toLowerCase()} →
      </button>
    </div>
  )
}

/**
 * Séances reportées **au jour `dow`** de la semaine courante : affichées sur l'écran
 * Aujourd'hui du jour cible, cochables et saisissables (mêmes clés que la séance d'origine,
 * donc comptées dans Progrès). Re-reportables au lendemain tant que la semaine n'est pas finie.
 */
export function MovedSessions({
  w,
  dow,
  prog,
  exercises,
  variant,
}: {
  w: PlanWeek
  dow: number
  prog: ProgressApi
  exercises: PlanExercise[]
  variant: "d" | "m"
}) {
  const arrivals = Object.entries(prog.s.moved)
    .filter(([k, d]) => d === dow && k.startsWith(`${w.n}-`))
    .map(([k]) => k.slice(`${w.n}-`.length))
    .filter((key) => PLANNED_DOW[key] !== undefined && PLANNED_DOW[key] !== dow)
  if (arrivals.length === 0) return null

  return (
    <>
      <div className={variant === "d" ? "d-label" : "m-label"}>Reporté à aujourd'hui</div>
      <div className="sess-list">
        {arrivals.map((key) => {
          const sess = sessionByKey(key, w)
          const sk = `${w.n}-${key}`
          const kk = kmKeyFor(w.n, key)
          return (
            <SessionCard
              key={key}
              color={sess.col}
              day={`Prévu ${DAY_NAMES[PLANNED_DOW[key]].toLowerCase()}`}
              label={sess.type}
              summary={sess.tag}
              done={!!prog.s.sessions[sk]}
              onToggleDone={() => prog.toggleSession(sk)}
              defaultOpen
            >
              {key === "renfo" ? (
                <ExerciseChecklist exercises={exercises} prog={prog} week={w.n} />
              ) : (
                <div className="sess-body-note">{sess.detail}</div>
              )}
              <KmField
                planned={plannedKmFor(key, w)}
                value={prog.s.km[kk]}
                onChange={(v) => prog.setKm(kk, v)}
              />
              <MoveControls sk={sk} fromDow={dow} prog={prog} />
            </SessionCard>
          )
        })}
      </div>
    </>
  )
}
