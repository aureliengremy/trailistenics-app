import { useState } from "react"

import { cn } from "@/lib/utils"
import type { Week } from "@/types"

export function Timeline({ weeks }: { weeks: Week[] }) {
  const [activeNumber, setActiveNumber] = useState(weeks[0]?.number ?? 1)
  const active = weeks.find((w) => w.number === activeNumber) ?? weeks[0]

  return (
    <>
      <div className="tl-track flex snap-x snap-mandatory gap-[6px] overflow-x-auto px-[2px] pb-[18px] pt-2">
        {weeks.map((w) => {
          const isActive = w.number === activeNumber
          return (
            <button
              key={w.number}
              onClick={() => setActiveNumber(w.number)}
              className={cn(
                "relative w-[86px] flex-none snap-start rounded-[13px] border bg-panel px-2 py-3 text-center transition-all duration-150",
                "hover:-translate-y-1 hover:border-moss",
                isActive
                  ? "border-ocre bg-panel2 shadow-[0_8px_26px_rgba(0,0,0,.4)]"
                  : "border-line",
              )}
            >
              {w.is_race && (
                <span className="absolute -right-[6px] -top-[9px] text-[15px]">🏁</span>
              )}
              <div className="font-display text-[22px] font-black">{w.number}</div>
              <div className="mt-[3px] min-h-[22px] text-[9.5px] uppercase leading-tight tracking-[0.06em] text-muted">
                {w.bloc.name}
              </div>
              <div
                className="mt-2 h-[5px] rounded"
                style={{
                  background: w.bloc.color,
                  width: `${30 + w.long_run_duration_min / 2}%`,
                }}
              />
            </button>
          )
        })}
      </div>

      {active && <WeekDetail week={active} />}
    </>
  )
}

function WeekDetail({ week }: { week: Week }) {
  const color = week.bloc.color
  return (
    <div
      key={week.number}
      className="mt-[22px] animate-fade rounded-xl border border-line bg-panel2 px-[26px] py-6"
      style={{ borderLeft: `5px solid ${color}` }}
    >
      <span
        className="mb-[10px] inline-block rounded-[20px] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em]"
        style={{ background: `${color}22`, color }}
      >
        Semaine {week.number} · {week.date_label} · {week.bloc.category}
      </span>
      <h3 className="text-[26px] font-black">{week.bloc.name}</h3>

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <DetailBox k="Sortie longue · dimanche" v={week.long_run_label} />
        <DetailBox k="Qualité · jeudi" v={week.quality_session} />
        <DetailBox
          k="Séances / semaine"
          v={week.sessions_label ?? String(week.sessions_per_week)}
        />
      </div>

      <p className="mt-[18px] text-[15px] italic text-muted">{week.focus}</p>
    </div>
  )
}

function DetailBox({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[11px] border border-line bg-bg2 px-4 py-[14px]">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-moss">{k}</div>
      <div className="mt-[5px] text-[15px]">{v}</div>
    </div>
  )
}
