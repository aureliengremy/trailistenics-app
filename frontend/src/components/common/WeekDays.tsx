import { ExerciseChecklist } from "@/components/common/ExerciseChecklist"
import { KmField } from "@/components/common/KmField"
import { SessionCard } from "@/components/common/SessionCard"
import { MoveControls } from "@/components/common/SessionMove"
import type { ProgressApi } from "@/hooks/useProgress"
import {
  DAY_NAMES,
  kmKeyFor,
  type PlanExercise,
  type PlanWeek,
  plannedKmFor,
  RENFO_DOW,
  weekDays,
} from "@/lib/plan"

interface WeekDaysProps {
  w: PlanWeek
  exercises: PlanExercise[]
  prog: ProgressApi
  /** Jour ouvert par défaut (0 = dimanche). */
  openDow?: number
}

const RENFO_FOOTING =
  "Puis 20–30 min de footing facile, sur jambes fatiguées — pas de côtes, allure conversation."

/**
 * Accordéon jour-par-jour d'une semaine (lundi → dimanche), pour l'onglet « Le plan ».
 * Toutes les séances courues (renfo / qualité / longue / footings) sont éditables — coche,
 * km réalisés, report au lendemain — avec les mêmes clés que l'écran « Aujourd'hui »
 * (donc comptées dans Progrès). Les jours de repos restent purement informatifs.
 */
export function WeekDays({ w, exercises, prog, openDow }: WeekDaysProps) {
  return (
    <div className="sess-list">
      {weekDays(w).map(({ dow, name, sess }) => {
        const trackable = sess.key !== "repos"
        const sk = `${w.n}-${sess.key}`
        const kk = kmKeyFor(w.n, sess.key)
        const movedTo = prog.s.moved[sk]
        return (
          <SessionCard
            key={dow}
            color={sess.col}
            day={name}
            label={sess.type}
            summary={
              movedTo != null ? `→ Reportée à ${DAY_NAMES[movedTo].toLowerCase()}` : sess.tag
            }
            defaultOpen={dow === openDow}
            done={trackable ? !!prog.s.sessions[sk] : undefined}
            onToggleDone={trackable ? () => prog.toggleSession(sk) : undefined}
          >
            {dow === RENFO_DOW ? (
              <>
                <ExerciseChecklist exercises={exercises} prog={prog} week={w.n} />
                <div className="sess-footing">
                  <div className="sess-footing-h">Puis · footing court</div>
                  <div className="sess-body-note">{RENFO_FOOTING}</div>
                  <KmField
                    planned={plannedKmFor("renfo", w)}
                    value={prog.s.km[kk]}
                    onChange={(v) => prog.setKm(kk, v)}
                  />
                </div>
              </>
            ) : trackable ? (
              <>
                <div className="sess-body-note">{sess.detail}</div>
                <KmField
                  planned={plannedKmFor(sess.key, w)}
                  value={prog.s.km[kk]}
                  onChange={(v) => prog.setKm(kk, v)}
                />
              </>
            ) : (
              <div className="sess-body-note">{sess.detail}</div>
            )}
            {trackable && <MoveControls sk={sk} fromDow={dow} prog={prog} />}
          </SessionCard>
        )
      })}
    </div>
  )
}
