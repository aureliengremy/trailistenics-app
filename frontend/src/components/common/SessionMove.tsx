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
  plannedMinFor,
  sessionByKey,
} from "@/lib/plan"

/**
 * Contrôles de report d'une séance : « pas pu ce jour-là ? » → la décale au lendemain
 * (elle apparaît alors sur le jour cible, dans « Le plan » et sur l'écran Aujourd'hui) ;
 * report annulable. `fromDow` = jour où la séance se trouve actuellement.
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

/** Clés des séances de la semaine `weekN` reportées **au jour `dow`**. */
export function arrivalsForDay(
  weekN: number,
  dow: number,
  moved: Record<string, number>,
): string[] {
  return Object.entries(moved)
    .filter(([k, d]) => d === dow && k.startsWith(`${weekN}-`))
    .map(([k]) => k.slice(`${weekN}-`.length))
    .filter((key) => PLANNED_DOW[key] !== undefined && PLANNED_DOW[key] !== dow)
}

/**
 * Carte d'une séance reportée, affichée sur son jour cible : cochable, km saisissables
 * (mêmes clés que la séance d'origine, donc comptées dans Progrès), re-reportable.
 */
export function ArrivalCard({
  sessKey,
  w,
  dow,
  dayLabel,
  prog,
  exercises,
  defaultOpen = false,
}: {
  sessKey: string
  w: PlanWeek
  dow: number
  dayLabel: string
  prog: ProgressApi
  exercises: PlanExercise[]
  defaultOpen?: boolean
}) {
  const sess = sessionByKey(sessKey, w)
  const sk = `${w.n}-${sessKey}`
  const kk = kmKeyFor(w.n, sessKey)
  return (
    <SessionCard
      color={sess.col}
      day={dayLabel}
      label={sess.type}
      summary={`Reportée de ${DAY_NAMES[PLANNED_DOW[sessKey]].toLowerCase()}`}
      done={!!prog.s.sessions[sk]}
      onToggleDone={() =>
        sessKey === "renfo"
          ? prog.setRenfoComplete(w.n, exercises.length, !prog.s.sessions[sk])
          : prog.toggleSession(sk)
      }
      defaultOpen={defaultOpen}
    >
      {sessKey === "renfo" ? (
        <ExerciseChecklist exercises={exercises} prog={prog} week={w.n} />
      ) : (
        <div className="sess-body-note">{sess.detail}</div>
      )}
      <KmField
        prog={prog}
        dkey={kk}
        plannedKm={plannedKmFor(sessKey, w)}
        plannedMin={plannedMinFor(sessKey, w)}
      />
      <MoveControls sk={sk} fromDow={dow} prog={prog} />
    </SessionCard>
  )
}

/** Séances reportées au jour `dow`, pour l'écran Aujourd'hui. */
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
  const arrivals = arrivalsForDay(w.n, dow, prog.s.moved)
  if (arrivals.length === 0) return null

  return (
    <>
      <div className={variant === "d" ? "d-label" : "m-label"}>Reporté à aujourd'hui</div>
      <div className="sess-list">
        {arrivals.map((key) => (
          <ArrivalCard
            key={key}
            sessKey={key}
            w={w}
            dow={dow}
            dayLabel="Aujourd'hui"
            prog={prog}
            exercises={exercises}
            defaultOpen
          />
        ))}
      </div>
    </>
  )
}
