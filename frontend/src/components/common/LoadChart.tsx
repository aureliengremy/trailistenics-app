import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"

import type { ProgressApi, ProgressState } from "@/hooks/useProgress"
import { type ChartMetric, type PlanWeek, pointColor } from "@/lib/plan"

interface Point {
  label: string
  value: number
  realized: number | null
  w: PlanWeek
}

/**
 * Valeur **réalisée** d'une semaine pour la métrique courante, à partir des chiffres saisis :
 * - durée → durée de la sortie longue saisie (min) ;
 * - dénivelé → D+ prévu si la sortie longue est validée (pas de saisie de D+) ;
 * - séances → nombre de séances cochées dans la semaine.
 * `null` quand rien n'est réalisé (la ligne s'interrompt proprement).
 */
function realizedFor(field: ChartMetric["field"], w: PlanWeek, s: ProgressState): number | null {
  if (field === "duree") {
    const v = s.dur[`${w.n}-longue`]
    return v != null ? v : null
  }
  if (field === "dist") {
    const v = s.km[`${w.n}-longue`]
    return v != null ? v : null
  }
  if (field === "dpos") {
    return s.sessions[`${w.n}-longue`] ? w.dpos : null
  }
  // seances : nombre de séances cochées cette semaine
  const n = Object.entries(s.sessions).filter(([k, v]) => v && k.startsWith(`${w.n}-`)).length
  return n > 0 ? n : null
}

/** Plages contiguës de semaines pic/simulateur (bande rouille de fond). */
function heavyRanges(points: Point[]): Array<{ x1: string; x2: string }> {
  const ranges: Array<{ x1: string; x2: string }> = []
  let start: Point | null = null
  points.forEach((p, i) => {
    const heavy = p.w.blocKey === "pic" || p.w.blocKey === "simul"
    if (heavy && start === null) start = p
    const next = points[i + 1]
    const nextHeavy = next && (next.w.blocKey === "pic" || next.w.blocKey === "simul")
    if (start !== null && (!next || !nextHeavy)) {
      ranges.push({ x1: start.label, x2: p.label })
      start = null
    }
  })
  return ranges
}

interface LoadChartProps {
  weeks: PlanWeek[]
  metric: ChartMetric
  height: number
  showY?: boolean
  /** Affiche une étiquette X sur deux (mobile compact). */
  sparseX?: boolean
  /** Si fourni, trace une seconde courbe « réalisé » (chiffres saisis) + légende. */
  prog?: ProgressApi
}

export function LoadChart({ weeks, metric, height, showY = true, sparseX = false, prog }: LoadChartProps) {
  const points: Point[] = weeks.map((w) => ({
    label: `S${w.n}`,
    value: w[metric.field] ?? 0,
    realized: prog ? realizedFor(metric.field, w, prog.s) : null,
    w,
  }))
  const ranges = heavyRanges(points)

  return (
    <div className="chart-host" style={{ height }}>
      {prog && (
        <div className="chart-legend">
          <span className="chart-leg">
            <span className="chart-leg-line" style={{ background: metric.color }} /> Prévu
          </span>
          <span className="chart-leg">
            <span className="chart-leg-line dashed" /> Réalisé
          </span>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 14, right: 10, left: showY ? -6 : 4, bottom: 4 }}>
          <defs>
            <linearGradient id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={metric.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {ranges.map((r) => (
            <ReferenceArea key={r.x1} x1={r.x1} x2={r.x2} fill="#c2562e" fillOpacity={0.08} strokeOpacity={0} />
          ))}

          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            interval={sparseX ? 1 : 0}
            minTickGap={4}
          />
          {showY && (
            <YAxis
              domain={[0, metric.max]}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={38}
            />
          )}
          <Tooltip cursor={{ stroke: "var(--line)" }} content={<TipContent metric={metric} showRealized={!!prog} />} />

          <Area
            type="monotone"
            dataKey="value"
            stroke={metric.color}
            strokeWidth={3}
            fill={`url(#grad-${metric.key})`}
            dot={<BlocDot />}
            activeDot={{ r: 6, stroke: "var(--panel)", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={600}
          />

          {prog && (
            <Line
              type="monotone"
              dataKey="realized"
              stroke="var(--ink)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: "var(--ink)", strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: "var(--panel)", strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive
              animationDuration={600}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function BlocDot(props: { cx?: number; cy?: number; payload?: Point }) {
  const { cx, cy, payload } = props
  if (cx === undefined || cy === undefined || !payload) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.w.race ? 6 : 4.5}
      fill={pointColor(payload.w)}
      stroke="var(--panel)"
      strokeWidth={2}
    />
  )
}

function TipContent({
  metric,
  showRealized,
  active,
  payload,
}: TooltipProps<number, string> & { metric: ChartMetric; showRealized: boolean }) {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0].payload as Point
  const w = p.w
  return (
    <div
      style={{
        background: "var(--panel2)",
        border: "1px solid var(--line)",
        borderRadius: 11,
        padding: "9px 13px",
        boxShadow: "0 10px 28px rgba(0,0,0,.45)",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>
        Semaine {w.n} · {w.date}
      </div>
      <div style={{ fontFamily: "Fraunces", fontWeight: 900, fontSize: 22, margin: "2px 0", color: "var(--ink)" }}>
        {w[metric.field] ?? 0}{" "}
        <span style={{ fontSize: 12, fontFamily: "Archivo", fontWeight: 500, color: "var(--muted)" }}>
          {metric.unit} prévu
        </span>
      </div>
      {showRealized && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
          {p.realized != null ? `${p.realized} ${metric.unit} réalisé` : "— non réalisé"}
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 700, color: pointColor(w), marginTop: 2 }}>{w.bloc}</div>
    </div>
  )
}
