import type { ProgressApi } from "@/hooks/useProgress"

interface KmFieldProps {
  prog: ProgressApi
  /** Clé commune (km + durée), ex. `${semaine}-longue`. */
  dkey: string
  /** Distance prévue (km) affichée en repère, si connue. */
  plannedKm?: number | null
  /** Durée prévue (min) affichée en repère, si connue. */
  plannedMin?: number | null
}

/**
 * Saisie du réalisé d'une sortie courue : **durée (min)** + **distance (km)**.
 * Bordure « validée » (vert) dès qu'une des deux valeurs est saisie ; chaque champ se teinte
 * individuellement. Lit/écrit `prog.s.km` et `prog.s.dur` sur la même clé.
 */
export function KmField({ prog, dkey, plannedKm = null, plannedMin = null }: KmFieldProps) {
  const km = prog.s.km[dkey]
  const dur = prog.s.dur[dkey]
  const kmOn = km != null && !Number.isNaN(km)
  const durOn = dur != null && !Number.isNaN(dur)
  // « Validé » (bordure verte) uniquement quand LES DEUX champs sont remplis (durée + distance).
  const filled = kmOn && durOn
  const hint = [
    plannedMin != null ? `~${plannedMin} min` : null,
    plannedKm != null ? `~${plannedKm} km` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className={"km-field" + (filled ? " filled" : "")}>
      <div>
        <div className="km-l">{filled ? "✓ Réalisé" : "Réalisé"}</div>
        {hint && <div className="km-hint">Prévu {hint}</div>}
      </div>
      <div className="km-inputs">
        <label className={"km-in" + (filled ? " on" : "")}>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={dur ?? ""}
            placeholder={plannedMin != null ? String(plannedMin) : "min"}
            onChange={(e) => {
              const raw = e.target.value
              prog.setDur(dkey, raw === "" ? null : Number(raw))
            }}
            aria-label="Durée réalisée (minutes)"
          />
          <span>min</span>
        </label>
        <label className={"km-in" + (filled ? " on" : "")}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={km ?? ""}
            placeholder={plannedKm != null ? String(plannedKm) : "0"}
            onChange={(e) => {
              const raw = e.target.value
              prog.setKm(dkey, raw === "" ? null : Number(raw))
            }}
            aria-label="Distance réalisée (km)"
          />
          <span>km</span>
        </label>
      </div>
    </div>
  )
}
