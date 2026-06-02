interface CheckProps {
  on: boolean
  col?: string
  size?: number
  variant?: "d" | "m"
}

/** Pastille « coché » (commun desktop/mobile). */
export function Check({ on, col = "var(--moss)", size = 24, variant = "m" }: CheckProps) {
  return (
    <span
      className={`${variant}-check${on ? " on" : ""}`}
      style={{ width: size, height: size, ...(on ? { background: col, borderColor: col } : {}) }}
    >
      {on && (
        <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 14 14">
          <path
            d="M3 7.4 5.8 10 11 4.2"
            fill="none"
            stroke="var(--bg)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}

/** Petit ✓ utilisé dans les numéros de semaine validée. */
export function CheckMark({ size = 16, color = "var(--moss)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <path
        d="M3 7.4 5.8 10 11 4.2"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
