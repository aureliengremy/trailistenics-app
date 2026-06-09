import { useState } from "react"

import type { ProgressApi } from "@/hooks/useProgress"
import { DAY_NAMES } from "@/lib/plan"

const ORDER = [1, 2, 3, 4, 5, 6, 0] // lundi → dimanche

/** Séances bonus de la semaine (entraînements hors programme) + ajout rapide. */
export function BonusSection({ week, prog }: { week: number; prog: ProgressApi }) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(new Date().getDay())
  const [type, setType] = useState("")
  const [km, setKm] = useState("")

  const bonuses = Object.entries(prog.s.bonus).filter(([, b]) => b.week === week)

  function add() {
    prog.addBonus({
      week,
      day,
      type: type.trim() || "Séance bonus",
      km: km.trim() === "" ? null : Number(km),
    })
    setType("")
    setKm("")
    setOpen(false)
  }

  return (
    <div className="bonus">
      <div className="d-label" style={{ margin: "0 0 10px" }}>
        Séances bonus de la semaine
      </div>
      {bonuses.length > 0 && (
        <div className="bonus-list">
          {bonuses.map(([id, b]) => (
            <div key={id} className="bonus-item">
              <span className="bonus-day">{DAY_NAMES[b.day]}</span>
              <span className="bonus-type">{b.type}</span>
              {b.km != null && <span className="bonus-km">{b.km} km</span>}
              <button
                type="button"
                className="bonus-x"
                onClick={() => prog.removeBonus(id)}
                aria-label="Supprimer la séance bonus"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {open ? (
        <div className="bonus-form">
          <div className="bonus-days">
            {ORDER.map((d) => (
              <button
                key={d}
                type="button"
                className={"bonus-daych" + (d === day ? " on" : "")}
                onClick={() => setDay(d)}
              >
                {DAY_NAMES[d].slice(0, 3)}
              </button>
            ))}
          </div>
          <input
            className="bonus-in"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Type (course, vélo, renfo…)"
            aria-label="Type de séance"
          />
          <label className="bonus-km-in">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="0"
              aria-label="Kilomètres"
            />
            <span>km</span>
          </label>
          <div className="bonus-actions">
            <button type="button" className="bonus-add" onClick={add}>
              Ajouter
            </button>
            <button type="button" className="bonus-cancel" onClick={() => setOpen(false)}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="bonus-open" onClick={() => setOpen(true)}>
          + Ajouter une séance bonus
        </button>
      )}
    </div>
  )
}
