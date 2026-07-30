import { useEffect, useRef, useState } from "react"

import { AdminView } from "@/components/AdminView"
import { AccountMenu } from "@/components/common/AccountMenu"
import { BonusSection } from "@/components/common/BonusSection"
import { CheckMark } from "@/components/common/Check"
import { DaySelector } from "@/components/common/DaySelector"
import { ExerciseLinks } from "@/components/common/ExerciseMedia"
import { NavIcon, type TabId } from "@/components/common/Icons"
import { KmField } from "@/components/common/KmField"
import { LoadChart } from "@/components/common/LoadChartLazy"
import { RealizedBars } from "@/components/common/RealizedBars"
import { RestTimer } from "@/components/common/RestTimer"
import { Ring } from "@/components/common/Ring"
import { SaveButton } from "@/components/common/SaveButton"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { WeekDays } from "@/components/common/WeekDays"
import { DaySessionDetail } from "@/components/common/DaySessionDetail"
import { WeekObjectives } from "@/components/common/WeekObjectives"
import { WeekStrip } from "@/components/common/WeekStrip"
import { useAdminPending } from "@/hooks/useAdminPending"
import type { PlanData } from "@/hooks/usePlan"
import type { ProgressApi } from "@/hooks/useProgress"
import { exKey } from "@/hooks/useProgress"
import type { Theme } from "@/hooks/useTheme"
import type { User } from "@/types"
import {
  CHART_METRICS,
  currentWeek,
  DAY_NAMES,
  isRestKey,
  MONTHS_SHORT,
  type MetricKey,
  plannedKmFor,
  plannedMinFor,
  RENFO_DOW,
  sessionForDay,
  tint,
  weekKmBreakdown,
  weekPlannedDpos,
  weekPlannedKm,
  weekPlannedMin,
  weekRealizedSessions,
} from "@/lib/plan"
import {
  exPerWeek,
  realizedStats,
  type Scope,
  scopeLabel,
  SCOPES,
  scopeWeeks,
} from "@/lib/stats"

const TABS: { id: TabId; label: string; title: string }[] = [
  { id: "today", label: "Aujourd'hui", title: "Aujourd'hui" },
  { id: "plan", label: "Plan", title: "Le plan" },
  { id: "renfo", label: "Renfo", title: "Renfo" },
  { id: "progres", label: "Progrès", title: "Progrès" },
]
const ADMIN_TAB = { id: "admin" as const, label: "Admin", title: "Admin" }

export function MobileApp({
  plan,
  prog,
  theme,
  onToggleTheme,
  user,
  onLogout,
}: {
  plan: PlanData
  prog: ProgressApi
  theme: Theme
  onToggleTheme: () => void
  user: User | null
  onLogout: () => void
}) {
  const [tab, setTab] = useState<TabId>("today")
  // Semaine ciblée par l'onglet Renfo (null = semaine en cours).
  const [renfoWeek, setRenfoWeek] = useState<number | null>(null)
  const go = (t: TabId) => {
    if (t === "renfo") setRenfoWeek(null)
    setTab(t)
  }
  const openRenfo = (week: number) => {
    setRenfoWeek(week)
    setTab("renfo")
  }
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [tab])
  const tabs = user?.role === "admin" ? [...TABS, ADMIN_TAB] : TABS
  const title = tabs.find((t) => t.id === tab)!.title
  const pending = useAdminPending(user)

  return (
    <div className="m-app">
      <div className="m-topbar">
        <div className="m-topbar-l">
          <div className="m-brand">TRAILISTENICS</div>
          <div className="m-title">{title}</div>
        </div>
        <div className="m-topbar-r">
          <SaveButton status={prog.syncStatus} onSave={prog.syncNow} variant="m" />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="m" />
          <AccountMenu user={user} onLogout={onLogout} variant="m" />
        </div>
      </div>
      <div className="m-scroll" ref={scrollRef}>
        {tab === "today" && <Today plan={plan} prog={prog} go={go} openRenfo={openRenfo} />}
        {tab === "plan" && <Plan plan={plan} prog={prog} go={go} openRenfo={openRenfo} />}
        {tab === "renfo" && <Renfo plan={plan} prog={prog} week={renfoWeek ?? currentWeek()} focusMardi={renfoWeek != null} />}
        {tab === "progres" && <Progres plan={plan} prog={prog} />}
        {tab === "admin" && <AdminView />}
      </div>
      <div className="m-tabbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={"m-tab" + (tab === t.id ? " on" : "")}
            onClick={() => go(t.id)}
          >
            <NavIcon name={t.id} on={tab === t.id} />
            <span>{t.label}</span>
            {t.id === "admin" && pending > 0 && <span className="nav-badge">{pending}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- AUJOURD'HUI ---------- */
function Today({
  plan,
  prog,
  openRenfo,
}: {
  plan: PlanData
  prog: ProgressApi
  go: (t: TabId) => void
  openRenfo: (week: number) => void
}) {
  const today = new Date()
  const cur = currentWeek(today)
  const w = plan.weeks.find((x) => x.n === cur) ?? plan.weeks[0]
  const todayDow = today.getDay()
  const [selDow, setSelDow] = useState(todayDow)
  const sessDone = weekRealizedSessions(w, prog.s) ?? 0

  return (
    <div className="m-screen">
      <div className="m-greet">
        <div>
          <div className="m-kick">
            {DAY_NAMES[todayDow]} · {today.getDate()} {MONTHS_SHORT[today.getMonth()]} · S{cur}/{plan.weeks.length}
          </div>
          <h2 className="m-h2">Semaine {cur}</h2>
          <div className="m-bloc" style={{ color: w.color }}>
            {w.bloc} · {w.tag}
          </div>
        </div>
        <Ring pct={w.sea ? sessDone / w.sea : 0} size={64} variant="m">
          <div className="m-ring-n">
            {sessDone}
            <span>/{w.sea}</span>
          </div>
        </Ring>
      </div>

      <div className="m-label">Objectifs de la semaine</div>
      <WeekObjectives w={w} prog={prog} variant="m" />

      <div className="m-label">La semaine</div>
      <WeekStrip w={w} prog={prog} selected={selDow} today={todayDow} onSelect={setSelDow} variant="m" />

      <div className="m-label">{selDow === todayDow ? "Aujourd'hui" : "Ce jour-là"}</div>
      <div className="sess-list">
        <DaySessionDetail key={selDow} w={w} dow={selDow} exercises={plan.exercises} prog={prog} variant="m" defaultOpen onOpenRenfo={() => openRenfo(cur)} />
      </div>

      <BonusSection week={cur} prog={prog} />
    </div>
  )
}

/* ---------- PLAN ---------- */
function Plan({
  plan,
  prog,
  openRenfo,
}: {
  plan: PlanData
  prog: ProgressApi
  go: (t: TabId) => void
  openRenfo: (week: number) => void
}) {
  const cur = currentWeek()
  const [sel, setSel] = useState<number | null>(null)
  if (sel !== null) {
    return (
      <WeekDetailM
        plan={plan}
        prog={prog}
        n={sel}
        back={() => setSel(null)}
        setSel={setSel}
        openRenfo={openRenfo}
      />
    )
  }

  let lastBloc: string | null = null
  return (
    <div className="m-screen">
      <p className="m-intro">
        {plan.weeks.length} semaines, de la reprise à l'affûtage. Touche une semaine pour le détail.
      </p>
      <div className="m-weeks">
        {plan.weeks.map((w) => {
          const showHead = w.bloc !== lastBloc
          lastBloc = w.bloc
          const done = !!prog.s.weeks[w.n]
          return (
            <div key={w.n}>
              {showHead && (
                <div className="m-bloc-head" style={{ color: w.color }}>
                  {w.bloc}
                </div>
              )}
              <button className={"m-wk" + (w.n === cur ? " cur" : "")} onClick={() => setSel(w.n)}>
                <span className="m-wk-bar" style={{ background: w.color }} />
                <div className="m-wk-n" style={{ color: done ? "var(--moss)" : "var(--ink)" }}>
                  {done ? <CheckMark size={16} /> : w.n}
                </div>
                <div className="m-wk-mid">
                  <div className="m-wk-t">
                    {w.race ? "🏁 " : ""}S{w.n} · {w.date}
                    {w.n === cur ? " · en cours" : ""}
                  </div>
                  <div className="m-wk-d">{w.longue}</div>
                </div>
                <div className="m-wk-dpos">
                  {w.dpos}
                  <span>m D+</span>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekDetailM({
  plan,
  prog,
  n,
  back,
  setSel,
  openRenfo,
}: {
  plan: PlanData
  prog: ProgressApi
  n: number
  back: () => void
  setSel: (n: number) => void
  openRenfo: (week: number) => void
}) {
  const w = plan.weeks.find((x) => x.n === n) ?? plan.weeks[0]
  const cur = currentWeek()
  const dow = new Date().getDay()
  return (
    <div className="m-screen">
      <button className="m-back" onClick={back}>
        ‹ Le plan
      </button>
      <span className="m-tag" style={{ background: tint(w.color), color: w.color }}>
        Semaine {w.n} · {w.date} · {w.tag}
      </span>
      <h2 className="m-h2" style={{ marginTop: 8 }}>
        {w.bloc}
      </h2>
      <div className="m-dboxes">
        <div className="m-dbox half">
          <div className="m-dk">Distance totale</div>
          <div className="m-dv">{weekPlannedKm(w)} km</div>
        </div>
        <div className="m-dbox half">
          <div className="m-dk">Temps de course</div>
          <div className="m-dv">{weekPlannedMin(w)} min</div>
        </div>
        <div className="m-dbox half">
          <div className="m-dk">Dénivelé D+</div>
          <div className="m-dv">{weekPlannedDpos(w)} m</div>
        </div>
        <div className="m-dbox half">
          <div className="m-dk">Séances</div>
          <div className="m-dv">
            {w.sea} <span style={{ fontSize: 12, color: "var(--muted)" }}>dont renfo</span>
          </div>
        </div>
        <div className="m-dbox">
          <div className="m-dk">Sortie longue · dimanche</div>
          <div className="m-dv">{w.longue}</div>
        </div>
        <div className="m-dbox">
          <div className="m-dk">Qualité · jeudi</div>
          <div className="m-dv">{w.qual}</div>
        </div>
      </div>
      <div className="wk-breakdown">
        Par sortie :{" "}
        {weekKmBreakdown(w)
          .map((x) => `${DAY_NAMES[x.dow].slice(0, 3).toLowerCase()} ~${x.km} km`)
          .join(" · ")}
      </div>
      {w.n <= cur && (
        <>
          <div className="m-label">Avancement</div>
          <WeekObjectives w={w} prog={prog} variant="m" />
        </>
      )}
      <p className="m-note">{w.focus}</p>
      <div className="m-label">La semaine jour par jour</div>
      <WeekDays w={w} exercises={plan.exercises} prog={prog} openDow={w.n === cur ? dow : RENFO_DOW} variant="m" onOpenRenfo={() => openRenfo(w.n)} />
      <div className="m-pager">
        <button disabled={n <= 1} onClick={() => setSel(n - 1)}>
          ‹ S{n - 1 || ""}
        </button>
        <button disabled={n >= plan.weeks.length} onClick={() => setSel(n + 1)}>
          S{n + 1 > plan.weeks.length ? "" : n + 1} ›
        </button>
      </div>
    </div>
  )
}

/* ---------- RENFO ---------- */
function Renfo({
  plan,
  prog,
  week,
  focusMardi,
}: {
  plan: PlanData
  prog: ProgressApi
  week: number
  focusMardi: boolean
}) {
  const cur = week
  const w = plan.weeks.find((x) => x.n === cur) ?? plan.weeks[0]
  const todayDow = new Date().getDay()
  const [day, setDay] = useState(focusMardi ? RENFO_DOW : todayDow)
  const isRenfoDay = day === RENFO_DOW
  const sess = sessionForDay(day, w)
  const done = plan.exercises.filter((_, i) => prog.s.ex[exKey(cur, i)]).length
  const total = plan.exercises.length

  return (
    <div className="m-screen">
      <DaySelector value={day} onChange={setDay} today={todayDow} variant="m" />
      {isRenfoDay ? (
        <>
          <p className="m-intro">
            Le mardi · circuit avant footing court. 2–3 tours, 1–2 min de récup. Chaîne postérieure
            &amp; descente.
          </p>
          <div className="m-prog-bar">
            <div className="m-prog-fill" style={{ width: (total ? (done / total) * 100 : 0) + "%" }} />
            <span className="m-prog-lbl">
              {done} / {total} exercices · S{cur}
            </span>
          </div>
          <RestTimer variant="m" />
          <div className="m-list">
            {plan.exercises.map((e, i) => {
              const on = !!prog.s.ex[exKey(cur, i)]
              return (
                <div key={i} className="m-ex-row">
                  <button className={"m-ex" + (on ? " on" : "")} onClick={() => prog.toggleEx(cur, i, plan.exercises.length)}>
                    <span className="m-ex-idx">{on ? <CheckMark size={15} color="var(--bg)" /> : i + 1}</span>
                    <div className="m-ex-mid">
                      <div className="m-ex-t">
                        {e.name} <span className="m-chip">{e.chip}</span>
                      </div>
                      <div className="m-ex-d">{e.why}</div>
                    </div>
                    <div className="m-ex-vol">{e.vol}</div>
                  </button>
                  <ExerciseLinks order={i + 1} name={e.name} variant="m" />
                </div>
              )
            })}
          </div>
          <div className="m-warn">
            <b>Pistols / airborne squats</b> 1×/sem max — jamais le même jour que les step-downs.
          </div>
          {done > 0 && (
            <button className="m-link" onClick={() => prog.resetEx(cur)}>
              Réinitialiser le circuit
            </button>
          )}
        </>
      ) : (
        <>
          <p className="m-intro">
            Le circuit renfo se fait <b>le mardi</b>. {DAY_NAMES[day]}, voici la séance prévue.
          </p>
          <div className={"m-today" + (isRestKey(sess.key) ? " rest" : "")}>
            <div className="m-today-top">
              <span className="m-tag" style={{ background: tint(sess.col), color: sess.col }}>
                {sess.tag}
              </span>
            </div>
            <div className="m-today-type">{sess.type}</div>
            <div className="m-today-detail">{sess.detail}</div>
            {!isRestKey(sess.key) && (
              <div style={{ marginTop: 12 }}>
                <KmField
                  prog={prog}
                  dkey={`${cur}-${sess.key}`}
                  plannedKm={plannedKmFor(sess.key, w)}
                  plannedMin={plannedMinFor(sess.key, w)}
                />
              </div>
            )}
          </div>
          <button className="m-btn ghost" onClick={() => setDay(RENFO_DOW)}>
            Voir le circuit du mardi ›
          </button>
        </>
      )}
    </div>
  )
}

/* ---------- PROGRÈS ---------- */
function Progres({ plan, prog }: { plan: PlanData; prog: ProgressApi }) {
  const [scope, setScope] = useState<Scope>("global")
  const weeksDone = Object.values(prog.s.weeks).filter(Boolean).length
  const cur = currentWeek()
  const total = plan.weeks.length
  const weekNums = scopeWeeks(scope, plan.weeks)
  const st = realizedStats(plan.weeks, prog.s, weekNums)
  const bars = exPerWeek(plan.weeks, prog.s)
  const scopeSet = new Set(weekNums)
  const kmStr = st.km.toFixed(st.km % 1 ? 1 : 0)

  return (
    <div className="m-screen">
      <div className="m-hero-prog">
        <Ring pct={weeksDone / total} size={104} stroke={9} variant="m">
          <div className="m-ring-big">
            {weeksDone}
            <span>/{total}</span>
          </div>
        </Ring>
        <div>
          <div className="m-hp-k">Semaines validées</div>
          <div className="m-hp-v">{Math.round((weeksDone / total) * 100)}% du plan</div>
          <div className="m-hp-s">Tu es en semaine {cur} · {Math.max(0, total - cur)} restantes</div>
        </div>
      </div>

      <div className="m-label" style={{ marginTop: 4 }}>
        Réalisé · {scopeLabel(scope, plan.weeks)}
      </div>
      <div className="m-seg">
        {SCOPES.map((sc) => (
          <button key={sc.key} className={sc.key === scope ? "on" : ""} onClick={() => setScope(sc.key)}>
            {sc.label}
          </button>
        ))}
      </div>
      <div className="m-tiles">
        <Tile n={String(st.sessionsDone)} u={` /${st.sessionsTotal}`} l="séances faites" />
        <Tile n={String(st.exDone)} u={` /${st.exTotal}`} l="exos renfo cochés" />
        <Tile n={kmStr} u=" km" l="parcourus (saisis)" />
        <Tile n={String(st.dplusDone)} u=" m" l="D+ validé (longues)" />
      </div>
      <div className="m-reste">
        Reste : <b>{st.sessionsTotal - st.sessionsDone}</b> séances ·{" "}
        <b>{st.weeksTotal - st.weeksValidated}</b> sem. à valider.
      </div>

      <div className="m-label">Exercices renfo réalisés / semaine</div>
      <div className="m-card">
        <RealizedBars data={bars} scope={scopeSet} cur={cur} />
      </div>

      <div className="m-label">Charge planifiée</div>
      <MiniChart plan={plan} prog={prog} />
    </div>
  )
}

function Tile({ n, u, l }: { n: string; u: string; l: string }) {
  return (
    <div className="m-tile">
      <div className="m-tile-n">
        {n}
        <span>{u}</span>
      </div>
      <div className="m-tile-l">{l}</div>
    </div>
  )
}

function MiniChart({ plan, prog }: { plan: PlanData; prog: ProgressApi }) {
  const [metricKey, setMetricKey] = useState<MetricKey>("denivele")
  const metric = CHART_METRICS.find((m) => m.key === metricKey)!
  return (
    <div className="m-card">
      <div className="m-seg">
        {CHART_METRICS.map((m) => (
          <button key={m.key} className={m.key === metricKey ? "on" : ""} onClick={() => setMetricKey(m.key)}>
            {m.short}
          </button>
        ))}
      </div>
      <LoadChart weeks={plan.weeks} metric={metric} height={170} showY={false} sparseX prog={prog} />
      <div className="m-chart-lbl">
        {metric.label} ({metric.unit})
      </div>
    </div>
  )
}
