import { ExerciseChecklist } from "@/components/common/ExerciseChecklist"
import { KmField } from "@/components/common/KmField"
import { RenfoActions } from "@/components/common/RenfoActions"
import { SessionCard } from "@/components/common/SessionCard"
import { ArrivalCard, arrivalsForDay, MoveControls } from "@/components/common/SessionMove"
import type { ProgressApi } from "@/hooks/useProgress"
import {
  DAY_NAMES,
  isRestKey,
  kmKeyFor,
  type PlanExercise,
  type PlanWeek,
  plannedKmFor,
  plannedMinFor,
  RENFO_DOW,
  weekDayDate,
  weekDays,
} from "@/lib/plan"

interface WeekDaysProps {
  w: PlanWeek
  exercises: PlanExercise[]
  prog: ProgressApi
  /** Jour ouvert par défaut (0 = dimanche). */
  openDow?: number
  /** Variante de style des boutons (desktop/mobile). */
  variant?: "d" | "m"
  /** Si fourni, affiche un bouton « Ouvrir la page Renfo » dans la journée renfo. */
  onOpenRenfo?: () => void
}

const RENFO_FOOTING =
  "Puis 20–30 min de footing facile, sur jambes fatiguées — pas de côtes, allure conversation."

/**
 * Accordéon jour-par-jour d'une semaine (lundi → dimanche), pour l'onglet « Le plan ».
 * Toutes les séances courues sont éditables (coche, km, report au lendemain) ; une séance
 * reportée s'affiche sur son jour cible ; les jours de repos permettent de déclarer une
 * sortie quand même courue. Mêmes clés que l'écran « Aujourd'hui » (comptées dans Progrès).
 */
export function WeekDays({ w, exercises, prog, openDow, variant = "d", onOpenRenfo }: WeekDaysProps) {
  return (
    <div className="sess-list">
      {weekDays(w).map(({ dow, name, sess }) => {
        const isRest = isRestKey(sess.key)
        const sk = `${w.n}-${sess.key}`
        const kk = kmKeyFor(w.n, sess.key)
        const movedTo = prog.s.moved[sk]
        const done = !!prog.s.sessions[sk]
        const summary =
          movedTo != null
            ? `→ Reportée à ${DAY_NAMES[movedTo].toLowerCase()}`
            : isRest && done
              ? "Couru quand même"
              : sess.tag
        return (
          <div key={dow} style={{ display: "contents" }}>
            <SessionCard
              color={sess.col}
              day={`${name} ${weekDayDate(w.n, dow).getDate()}`}
              label={sess.type}
              summary={summary}
              defaultOpen={dow === openDow}
              done={movedTo == null ? done : undefined}
              onToggleDone={
                movedTo != null
                  ? undefined
                  : dow === RENFO_DOW
                    ? () => prog.setRenfoComplete(w.n, exercises.length, !done)
                    : () => prog.toggleSession(sk)
              }
            >
              {movedTo != null ? (
                <div className="sess-body-note">
                  Séance déplacée — retrouve-la sur le jour cible.
                </div>
              ) : dow === RENFO_DOW ? (
                <>
                  <div className="renfo-h">Renforcement à faire</div>
                  <ExerciseChecklist exercises={exercises} prog={prog} week={w.n} readOnly />
                  <RenfoActions week={w.n} prog={prog} variant={variant} exerciseCount={exercises.length} onOpenRenfo={onOpenRenfo} />
                  <div className="sess-footing">
                    <div className="sess-footing-h">Puis · footing court</div>
                    <div className="sess-body-note">{RENFO_FOOTING}</div>
                    <KmField prog={prog} dkey={kk} plannedKm={plannedKmFor("renfo", w)} />
                  </div>
                </>
              ) : isRest ? (
                <>
                  <div className="sess-body-note">{sess.detail}</div>
                  {done ? (
                    <KmField prog={prog} dkey={kk} />
                  ) : (
                    <div className="sess-moveline">
                      <button
                        type="button"
                        className="sess-movebtn"
                        onClick={() => prog.toggleSession(sk)}
                      >
                        Pas été sage ? J'ai quand même couru →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="sess-body-note">{sess.detail}</div>
                  <KmField
                    prog={prog}
                    dkey={kk}
                    plannedKm={plannedKmFor(sess.key, w)}
                    plannedMin={plannedMinFor(sess.key, w)}
                  />
                </>
              )}
              {!isRest && <MoveControls sk={sk} fromDow={dow} prog={prog} />}
            </SessionCard>
            {arrivalsForDay(w.n, dow, prog.s.moved).map((key) => (
              <ArrivalCard
                key={key}
                sessKey={key}
                w={w}
                dow={dow}
                dayLabel={`${name} ${weekDayDate(w.n, dow).getDate()}`}
                prog={prog}
                exercises={exercises}
                defaultOpen={dow === openDow}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
