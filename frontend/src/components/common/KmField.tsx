interface KmFieldProps {
  /** Distance prévue (km) affichée en repère, si connue. */
  planned: number | null
  value: number | null | undefined
  onChange: (val: number | null) => void
}

/** Saisie des kilomètres réalisés pour une séance courue. */
export function KmField({ planned, value, onChange }: KmFieldProps) {
  return (
    <div className="km-field">
      <div>
        <div className="km-l">Distance réalisée</div>
        {planned != null && <div className="km-hint">Prévu ~{planned} km</div>}
      </div>
      <label className="km-in">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          value={value ?? ""}
          placeholder={planned != null ? String(planned) : "0"}
          onChange={(e) => {
            const raw = e.target.value
            onChange(raw === "" ? null : Number(raw))
          }}
          aria-label="Kilomètres réalisés"
        />
        <span>km</span>
      </label>
    </div>
  )
}
