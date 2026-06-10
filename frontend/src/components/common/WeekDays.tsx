import { ExerciseChecklist } from "@/components/common/ExerciseChecklist"
import { KmField } from "@/components/common/KmField"
import { SessionCard } from "@/components/common/SessionCard"
import type { ProgressApi } from "@/hooks/useProgress"
import { type PlanExercise, type PlanWeek, RENFO_DOW, weekDays } from "@/lib/plan"

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
 * Les 3 séances clés (renfo / qualité / longue) sont éditables — exos cochables et km saisissables
 * pour la semaine affichée — avec les mêmes clés que l'écran « Aujourd'hui » (donc comptées
 * dans Progrès). Les autres jours restent purement informatifs.
 */
export function WeekDays({ w, exercises, prog, openDow }: WeekDaysProps) {
  return (
    <div className="sess-list">
      {weekDays(w).map(({ dow, name, sess }) => {
        const isKey = sess.key === "renfo" || sess.key === "qual" || sess.key === "longue"
        const sk = `${w.n}-${sess.key}`
        return (
          <SessionCard
            key={dow}
            color={sess.col}
            day={name}
            label={sess.type}
            summary={sess.tag}
            defaultOpen={dow === openDow}
            done={isKey ? !!prog.s.sessions[sk] : undefined}
            onToggleDone={isKey ? () => prog.toggleSession(sk) : undefined}
          >
            {dow === RENFO_DOW ? (
              <>
                <ExerciseChecklist exercises={exercises} prog={prog} week={w.n} />
                <div className="sess-footing">
                  <div className="sess-footing-h">Puis · footing court</div>
                  <div className="sess-body-note">{RENFO_FOOTING}</div>
                  <KmField
                    planned={5}
                    value={prog.s.km[`${w.n}-renfoRun`]}
                    onChange={(v) => prog.setKm(`${w.n}-renfoRun`, v)}
                  />
                </div>
              </>
            ) : sess.key === "longue" || sess.key === "qual" ? (
              <>
                <div className="sess-body-note">{sess.detail}</div>
                <KmField
                  planned={sess.key === "longue" ? w.dist : null}
                  value={prog.s.km[sk]}
                  onChange={(v) => prog.setKm(sk, v)}
                />
              </>
            ) : (
              <div className="sess-body-note">{sess.detail}</div>
            )}
          </SessionCard>
        )
      })}
    </div>
  )
}
