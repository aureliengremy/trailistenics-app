import type { ProgressApi } from "@/hooks/useProgress"
import {
  type PlanWeek,
  weekPlannedDpos,
  weekPlannedKm,
  weekPlannedMin,
  weekRealizedDpos,
  weekRealizedKm,
  weekRealizedMin,
  weekRealizedSessions,
} from "@/lib/plan"

/** 4 mini-stats hebdo « réalisé / prévu » : distance, temps de course, D+, séances. */
export function WeekObjectives({ w, prog, variant }: { w: PlanWeek; prog: ProgressApi; variant: "d" | "m" }) {
  const km = weekRealizedKm(w, prog.s) ?? 0
  const min = weekRealizedMin(w, prog.s) ?? 0
  const dpos = weekRealizedDpos(w, prog.s) ?? 0
  const sess = weekRealizedSessions(w, prog.s) ?? 0
  const items = [
    { real: km, plan: weekPlannedKm(w), unit: "km", label: "distance" },
    { real: min, plan: weekPlannedMin(w), unit: "min", label: "temps" },
    { real: dpos, plan: weekPlannedDpos(w), unit: "m", label: "D+" },
    { real: sess, plan: w.sea, unit: "", label: "séances" },
  ]
  return (
    <div className={`${variant}-wk-obj`}>
      {items.map((it) => (
        <div className={`${variant}-wk-ob`} key={it.label}>
          <div className={`${variant}-wk-ob-n`}>
            {it.real}
            <span>
              {" "}/{it.plan} {it.unit}
            </span>
          </div>
          <div className={`${variant}-wk-ob-l`}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}
