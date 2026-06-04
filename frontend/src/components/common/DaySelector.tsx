import { DAY_NAMES } from "@/lib/plan"

const ORDER = [1, 2, 3, 4, 5, 6, 0] // lundi → dimanche

interface DaySelectorProps {
  value: number
  onChange: (dow: number) => void
  today: number
  variant: "d" | "m"
}

/** Sélecteur de jour (chips lundi → dimanche). Marque le jour réel. */
export function DaySelector({ value, onChange, today, variant }: DaySelectorProps) {
  return (
    <div className={`${variant}-daysel`} role="tablist" aria-label="Jour de la semaine">
      {ORDER.map((d) => (
        <button
          key={d}
          type="button"
          role="tab"
          aria-selected={d === value}
          className={`${variant}-daysel-b` + (d === value ? " on" : "") + (d === today ? " today" : "")}
          onClick={() => onChange(d)}
        >
          {DAY_NAMES[d].slice(0, 3)}
        </button>
      ))}
    </div>
  )
}
