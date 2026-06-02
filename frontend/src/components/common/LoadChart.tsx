import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"

import { type ChartMetric, type PlanWeek, pointColor } from "@/lib/plan"

interface Point {
  label: string
  value: number
  w: PlanWeek
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
}

export function LoadChart({ weeks, metric, height, showY = true, sparseX = false }: LoadChartProps) {
  const points: Point[] = weeks.map((w) => ({
    label: `S${w.n}`,
    value: w[metric.field],
    w,
  }))
  const ranges = heavyRanges(points)

  return (
    <div className="chart-host" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 14, right: 10, left: showY ? -6 : 4, bottom: 4 }}>
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
          <Tooltip cursor={{ stroke: "var(--line)" }} content={<TipContent metric={metric} />} />

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
        </AreaChart>
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

function TipContent({ metric, active, payload }: TooltipProps<number, string> & { metric: ChartMetric }) {
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
        {w[metric.field]}{" "}
        <span style={{ fontSize: 12, fontFamily: "Archivo", fontWeight: 500, color: "var(--muted)" }}>
          {metric.unit}
        </span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: pointColor(w) }}>{w.bloc}</div>
    </div>
  )
}
