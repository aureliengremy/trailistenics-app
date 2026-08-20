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
  plannedDposFor,
  plannedKmFor,
  plannedMinFor,
  RENFO_DOW,
  sessionForDay,
  weekDayDate,
} from "@/lib/plan"

const RENFO_FOOTING =
  "Footing facile sur jambes fatiguées — pas de côtes, allure conversation."

interface DaySessionDetailProps {
  w: PlanWeek
  dow: number
  exercises: PlanExercise[]
  prog: ProgressApi
  variant: "d" | "m"
  defaultOpen?: boolean
  onOpenRenfo?: () => void
}

/**
 * Détail éditable d'UN jour (lun..dim) : SessionCard + body conditionnel + MoveControls
 * + cartes d'arrivée (séances reportées sur ce jour). Extrait de WeekDays pour être
 * réutilisable sur l'écran « Aujourd'hui ».
 */
export function DaySessionDetail({
  w,
  dow,
  exercises,
  prog,
  variant,
  defaultOpen = false,
  onOpenRenfo,
}: DaySessionDetailProps) {
  const sess = sessionForDay(dow, w)
  const name = DAY_NAMES[dow]
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
    <div style={{ display: "contents" }}>
      <SessionCard
        color={sess.col}
        day={`${name} ${weekDayDate(w.n, dow).getDate()}`}
        label={sess.type}
        summary={summary}
        defaultOpen={defaultOpen}
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
              <KmField prog={prog} dkey={kk} plannedKm={plannedKmFor("renfo", w)} plannedMin={plannedMinFor("renfo", w)} />
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
            {sess.phases ? (
              <div className="qual-phases">
                {sess.phases.map((p) => (
                  <div key={p.label}>
                    <div className="qual-phase-l">{p.label}</div>
                    <div className="qual-phase-t">{p.text}</div>
                  </div>
                ))}
                <div className="qual-rpe">
                  RPE = effort perçu sur 10 · 7 = phrases courtes · 8 = 3–4 mots · 9 = quasi max
                </div>
              </div>
            ) : (
              <div className="sess-body-note">{sess.detail}</div>
            )}
            <KmField
              prog={prog}
              dkey={kk}
              plannedKm={plannedKmFor(sess.key, w)}
              plannedMin={plannedMinFor(sess.key, w)}
              plannedDpos={plannedDposFor(sess.key, w)}
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
          dayLabel="↪ Reporté"
          prog={prog}
          exercises={exercises}
          defaultOpen={defaultOpen}
        />
      ))}
    </div>
  )
}
