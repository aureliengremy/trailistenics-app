import type { ReactNode } from "react"

interface RingProps {
  pct: number
  size?: number
  stroke?: number
  color?: string
  /** Préfixe de classe : "d" (desktop) ou "m" (mobile). */
  variant?: "d" | "m"
  children?: ReactNode
}

/** Anneau de progression SVG (commun desktop/mobile). */
export function Ring({
  pct,
  size = 64,
  stroke = 7,
  color = "var(--moss)",
  variant = "d",
  children,
}: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className={`${variant}-ring`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className={`${variant}-ring-c`}>{children}</div>
    </div>
  )
}
