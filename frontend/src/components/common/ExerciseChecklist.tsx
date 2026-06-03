import { Check } from "@/components/common/Check"
import type { ProgressApi } from "@/hooks/useProgress"
import type { PlanExercise } from "@/lib/plan"

interface ExerciseChecklistProps {
  exercises: PlanExercise[]
  prog: ProgressApi
}

/** Checklist des exercices renfo (état global partagé avec l'onglet Renfo). */
export function ExerciseChecklist({ exercises, prog }: ExerciseChecklistProps) {
  const done = exercises.filter((_, i) => prog.s.ex[i]).length
  return (
    <>
      <div className="exck-bar">
        {done} / {exercises.length} renforcements faits
      </div>
      <div className="exck">
        {exercises.map((e, i) => {
          const on = !!prog.s.ex[i]
          return (
            <button
              key={i}
              type="button"
              className={"exck-row" + (on ? " on" : "")}
              onClick={() => prog.toggleEx(i)}
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
