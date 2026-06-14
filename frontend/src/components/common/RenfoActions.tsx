import type { ProgressApi } from "@/hooks/useProgress"

/**
 * Actions d'une carte renfo : « Valider le renfo » coche **tous les exercices** d'un coup
 * (et inversement décoche tout) — état lié au drapeau séance, qui vaut « tous les exos cochés ».
 * + « Ouvrir la page Renfo » (si `onOpenRenfo` fourni).
 */
export function RenfoActions({
  week,
  prog,
  variant,
  exerciseCount,
  onOpenRenfo,
}: {
  week: number
  prog: ProgressApi
  variant: "d" | "m"
  exerciseCount: number
  onOpenRenfo?: () => void
}) {
  const done = !!prog.s.sessions[`${week}-renfo`]
  const btn = variant === "d" ? "d-btn" : "m-btn"
  return (
    <div className="renfo-cta">
      <button
        type="button"
        className={btn + (done ? " done" : "")}
        onClick={() => prog.setRenfoComplete(week, exerciseCount, !done)}
      >
        {done ? "✓ Renfo validé" : "Valider le renfo"}
      </button>
      {onOpenRenfo && (
        <button type="button" className={`${btn} open-renfo`} onClick={onOpenRenfo}>
          Ouvrir la page Renfo ›
        </button>
      )}
    </div>
  )
}
