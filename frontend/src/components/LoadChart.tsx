import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"
import type { Week } from "@/types"

type MetricKey = "duree" | "denivele" | "seances"

interface Metric {
  key: MetricKey
  tab: string
  field: keyof Pick<
    ChartPoint,
    "duree" | "dplus" | "sea"
  >
  label: string
  unit: string
  color: string
  max: number
}

const METRICS: Metric[] = [
  { key: "duree", tab: "Durée longue", field: "duree", label: "Durée de la sortie longue", unit: "min", color: "#7ba05b", max: 160 },
  { key: "denivele", tab: "Dénivelé D+", field: "dplus", label: "Dénivelé positif sur la longue", unit: "m D+", color: "#d98a3d", max: 780 },
  { key: "seances", tab: "Volume hebdo", field: "sea", label: "Nombre de séances", unit: "séances", color: "#6fa8c4", max: 5 },
]

interface ChartPoint {
  label: string
  number: number
  duree: number
  dplus: number
  sea: number
  color: string
  isHeavy: boolean
  race: boolean
}

/** Plage contiguë de semaines de pic / simulateur, pour la bande rouille de fond. */
function heavyRanges(points: ChartPoint[]): Array<{ x1: string; x2: string }> {
  const ranges: Array<{ x1: string; x2: string }> = []
  let start: ChartPoint | null = null
  points.forEach((p, i) => {
    if (p.isHeavy && start === null) start = p
    const next = points[i + 1]
    if (start !== null && (!next || !next.isHeavy)) {
      ranges.push({ x1: start.label, x2: p.label })
      start = null
    }
  })
  return ranges
}

export function LoadChart({ weeks }: { weeks: Week[] }) {
  const [active, setActive] = useState<MetricKey>("duree")
  const metric = METRICS.find((m) => m.key === active)!

  const points: ChartPoint[] = useMemo(
    () =>
      weeks.map((w) => ({
        label: `S${w.number}`,
        number: w.number,
        duree: w.long_run_duration_min,
        dplus: w.long_run_dplus_m,
        sea: w.sessions_per_week,
        color: w.bloc.color,
        isHeavy: w.bloc.color_key === "pic" || w.bloc.color_key === "simul",
        race: w.is_race,
      })),
    [weeks],
  )

  const ranges = useMemo(() => heavyRanges(points), [points])

  return (
    <div className="rounded-2xl border border-line bg-panel px-[26px] pb-[18px] pt-[26px]">
      <div className="mb-[18px] flex flex-wrap gap-2">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActive(m.key)}
            className={cn(
              "rounded-full border px-4 py-[9px] text-[13px] font-semibold transition-colors",
              active === m.key
                ? "border-moss bg-moss text-bg"
                : "border-line bg-bg2 text-muted hover:border-moss-dark hover:text-ink",
            )}
          >
            {m.tab}
          </button>
        ))}
      </div>

      <div className="h-[360px] w-full sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 16, right: 12, left: -8, bottom: 8 }}>
            <defs>
              <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.27} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {ranges.map((r) => (
              <ReferenceArea
                key={r.x1}
                x1={r.x1}
                x2={r.x2}
                fill="#c2562e"
                fillOpacity={0.08}
                strokeOpacity={0}
              />
            ))}

            <CartesianGrid stroke="#3a342a" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#a99e88", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#3a342a" }}
            />
            <YAxis
              domain={[0, metric.max]}
              tick={{ fill: "#a99e88", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "#3a342a" }}
              contentStyle={{
                background: "#1f1c14",
                border: "1px solid #3a342a",
                borderRadius: 11,
                color: "#f2ede0",
                fontSize: 13,
              }}
              labelStyle={{ color: "#a99e88" }}
              formatter={(value: number) => [`${value} ${metric.unit}`, metric.label]}
            />
            <Area
              type="monotone"
              dataKey={metric.field}
              stroke={metric.color}
              strokeWidth={3}
              fill="url(#loadFill)"
              dot={<HeavyDot />}
              activeDot={{ r: 6, stroke: "#16140f", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-[14px] flex flex-wrap gap-5 text-[13px] text-muted">
        <Legend color={metric.color} text={`${metric.label} (${metric.unit})`} />
        <Legend color="#c2562e" text="Pic / simulateur" />
        <Legend color="#6fa8c4" text="Affûtage" />
      </div>
    </div>
  )
}

/** Point coloré par bloc, agrandi et rouille pour la semaine de course. */
function HeavyDot(props: {
  cx?: number
  cy?: number
  payload?: ChartPoint
}) {
  const { cx, cy, payload } = props
  if (cx === undefined || cy === undefined || !payload) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.race ? 6 : 4.5}
      fill={payload.race ? "#c2562e" : payload.color}
      stroke="#16140f"
      strokeWidth={2}
    />
  )
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-[7px]">
      <i className="inline-block size-3 rounded-[3px]" style={{ background: color }} />
      {text}
    </span>
  )
}
