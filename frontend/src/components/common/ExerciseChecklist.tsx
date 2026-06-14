import { Check } from "@/components/common/Check"
import type { ProgressApi } from "@/hooks/useProgress"
import { exKey } from "@/hooks/useProgress"
import type { PlanExercise } from "@/lib/plan"

interface ExerciseChecklistProps {
  exercises: PlanExercise[]
  prog: ProgressApi
  /** Semaine à laquelle rattacher l'état des exercices. */
  week: number
  /** Liste non-cliquable (aperçu) : pas de coche par exercice, validation via le bouton dédié. */
  readOnly?: boolean
}

/** Checklist des exercices renfo (état rattaché à la semaine, partagé avec l'onglet Renfo). */
export function ExerciseChecklist({ exercises, prog, week, readOnly = false }: ExerciseChecklistProps) {
  if (readOnly) {
    return (
      <div className="exck">
        {exercises.map((e, i) => {
          const on = !!prog.s.ex[exKey(week, i)]
          return (
            <div key={i} className={"exck-row readonly" + (on ? " on" : "")}>
              <span className="exck-num">{on ? "✓" : i + 1}</span>
              <div className="exck-mid">
                <div className="exck-t">
                  {e.name} <span className="exck-chip">{e.chip}</span>
                </div>
              </div>
              <div className="exck-vol">{e.vol}</div>
            </div>
          )
        })}
      </div>
    )
  }

  const done = exercises.filter((_, i) => prog.s.ex[exKey(week, i)]).length
  return (
    <>
      <div className="exck-bar">
        {done} / {exercises.length} renforcements faits
      </div>
      <div className="exck">
        {exercises.map((e, i) => {
          const on = !!prog.s.ex[exKey(week, i)]
          return (
            <button
              key={i}
              type="button"
              className={"exck-row" + (on ? " on" : "")}
              onClick={() => prog.toggleEx(week, i, exercises.length)}
              aria-pressed={on}
            >
              <Check on={on} size={22} variant="m" />
              <div className="exck-mid">
                <div className="exck-t">
                  {e.name} <span className="exck-chip">{e.chip}</span>
                </div>
              </div>
              <div className="exck-vol">{e.vol}</div>
            </button>
          )
        })}
      </div>
    </>
  )
}
