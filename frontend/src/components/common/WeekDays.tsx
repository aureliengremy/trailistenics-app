import { DaySessionDetail } from "@/components/common/DaySessionDetail"
import type { ProgressApi } from "@/hooks/useProgress"
import { type PlanExercise, type PlanWeek, weekDays } from "@/lib/plan"

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

/**
 * Accordéon jour-par-jour d'une semaine (lundi → dimanche), pour l'onglet « Le plan ».
 * Toutes les séances courues sont éditables (coche, km, report au lendemain) ; une séance
 * reportée s'affiche sur son jour cible ; les jours de repos permettent de déclarer une
 * sortie quand même courue. Mêmes clés que l'écran « Aujourd'hui » (comptées dans Progrès).
 */
export function WeekDays({ w, exercises, prog, openDow, variant = "d", onOpenRenfo }: WeekDaysProps) {
  return (
    <div className="sess-list">
      {weekDays(w).map(({ dow }) => (
        <DaySessionDetail
          key={dow}
          w={w}
          dow={dow}
          exercises={exercises}
          prog={prog}
          variant={variant}
          defaultOpen={dow === openDow}
          onOpenRenfo={onOpenRenfo}
        />
      ))}
    </div>
  )
}
