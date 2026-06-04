import { useState } from "react"

import { CheckMark } from "@/components/common/Check"
import { DaySelector } from "@/components/common/DaySelector"
import { ExerciseChecklist } from "@/components/common/ExerciseChecklist"
import { ExerciseLinks } from "@/components/common/ExerciseMedia"
import { NavIcon, type TabId } from "@/components/common/Icons"
import { KmField } from "@/components/common/KmField"
import { LoadChart } from "@/components/common/LoadChart"
import { RealizedBars } from "@/components/common/RealizedBars"
import { RestTimer } from "@/components/common/RestTimer"
import { Ring } from "@/components/common/Ring"
import { SessionCard } from "@/components/common/SessionCard"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { WeekDays } from "@/components/common/WeekDays"
import type { ProgressApi } from "@/hooks/useProgress"
import { exKey } from "@/hooks/useProgress"
import type { PlanData } from "@/hooks/usePlan"
import type { Theme } from "@/hooks/useTheme"
import {
  CHART_METRICS,
  currentWeek,
  DAY_NAMES,
  keySessions,
  MONTHS_LONG,
  type MetricKey,
  RENFO_DOW,
  sessionForDay,
  tint,
} from "@/lib/plan"
import {
  exPerWeek,
  realizedStats,
  type Scope,
  scopeLabel,
  SCOPES,
  scopeWeeks,
} from "@/lib/stats"

interface ScreenProps {
  plan: PlanData
  prog: ProgressApi
  go: (t: TabId) => void
}

const NAV: { id: TabId; label: string }[] = [
  { id: "today", label: "Aujourd'hui" },
  { id: "plan", label: "Le plan" },
  { id: "renfo", label: "Renfo" },
  { id: "progres", label: "Progrès" },
]
const TITLES: Record<TabId, string> = {
  today: "Aujourd'hui",
  plan: "Le plan",
  renfo: "Renfo · calisthénie × trail",
  progres: "Progrès",
}

export function DesktopApp({
  plan,
  prog,
  theme,
  onToggleTheme,
}: {
  plan: PlanData
  prog: ProgressApi
  theme: Theme
  onToggleTheme: () => void
}) {
  const [tab, setTab] = useState<TabId>("today")
  const today = new Date()
  const cur = currentWeek(today)
  const w = plan.weeks.find((x) => x.n === cur) ?? plan.weeks[0]
  const weeksDone = Object.values(prog.s.weeks).filter(Boolean).length
  const dow = today.getDay()

  return (
    <div className="d-app">
      <aside className="d-sidebar">
        <div className="d-brand">
          <div className="d-brand-mark">▲</div>
          <div>
            <div className="d-brand-n">TRAILISTENICS</div>
            <div className="d-brand-s">Trail 20 km · 740 D+</div>
          </div>
        </div>
        <nav className="d-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={"d-navitem" + (tab === item.id ? " on" : "")}
              onClick={() => setTab(item.id)}
            >
              <NavIcon name={item.id} on={tab === item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="d-sidefoot">
          <Ring pct={weeksDone / 13} size={52} stroke={6}>
            <div className="d-ring-sm">{weeksDone}</div>
          </Ring>
          <div>
            <div className="d-sf-k">Progression</div>
            <div className="d-sf-v">{weeksDone} / 13 semaines</div>
          </div>
        </div>
      </aside>

      <main className="d-main">
        <header className="d-header">
          <div>
            <h1 className="d-title">{TITLES[tab]}</h1>
            <div className="d-sub">
              {DAY_NAMES[dow]} {today.getDate()} {MONTHS_LONG[today.getMonth()]} {today.getFullYear()}
            </div>
          </div>
          <div className="d-header-actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="d" />
            <div className="d-wpill" style={{ borderColor: w.color }}>
              <span className="d-wpill-n">S{cur}</span>
              <span className="d-wpill-b" style={{ color: w.color }}>
                {w.bloc}
              </span>
            </div>
          </div>
        </header>
        <div className="d-content">
          {tab === "today" && <Today plan={plan} prog={prog} go={setTab} />}
          {tab === "plan" && <Plan plan={plan} prog={prog} go={setTab} />}
          {tab === "renfo" && <Renfo plan={plan} prog={prog} go={setTab} />}
          {tab === "progres" && <Progres plan={plan} prog={prog} go={setTab} />}
        </div>
      </main>
    </div>
  )
}

/* ---------- AUJOURD'HUI ---------- */
function Today({ plan, prog, go }: ScreenProps) {
  const today = new Date()
  const cur = currentWeek(today)
  const w = plan.weeks.find((x) => x.n === cur) ?? plan.weeks[0]
  const dow = today.getDay()
  const sess = sessionForDay(dow, w)
  const todayKey = cur + "-" + sess.key
  const isRest = sess.key === "repos"
  const sessions = keySessions(w)
  const doneCount = sessions.filter((s) => prog.s.sessions[`${cur}-${s.key}`]).length

  return (
    <div className="d-grid-2">
      <div>
        <div className="d-label">À faire aujourd'hui · {DAY_NAMES[dow]}</div>
        <div className={"d-today" + (isRest ? " rest" : "")}>
          <span className="d-tag" style={{ background: tint(sess.col), color: sess.col }}>
            {sess.tag}
          </span>
          <div className="d-today-type">{sess.type}</div>
          <div className="d-today-detail">{sess.detail}</div>
          <div className="d-today-actions">
            {!isRest && (
              <button
                className={"d-btn" + (prog.s.sessions[todayKey] ? " done" : "")}
                onClick={() => prog.toggleSession(todayKey)}
              >
                {prog.s.sessions[todayKey] ? "✓ Séance terminée" : "Marquer comme terminée"}
              </button>
            )}
            {sess.key === "renfo" && (
              <button className="d-btn ghost" onClick={() => go("renfo")}>
                Ouvrir le circuit ›
              </button>
            )}
          </div>
        </div>

        <div className="d-label">Les 3 séances clés de la semaine</div>
        <div className="sess-list">
          {sessions.map((s) => {
            const sk = `${cur}-${s.key}`
            return (
              <SessionCard
                key={s.key}
                color={s.col}
                day={s.day}
                label={s.label}
                summary={s.summary}
                done={!!prog.s.sessions[sk]}
                onToggleDone={() => prog.toggleSession(sk)}
                defaultOpen={sess.key === s.key}
              >
                {s.kind === "renfo" ? (
                  <>
                    <ExerciseChecklist exercises={plan.exercises} prog={prog} week={cur} />
                    {s.footing && (
                      <div className="sess-footing">
                        <div className="sess-footing-h">Puis · footing court</div>
                        <div className="sess-body-note">{s.footing}</div>
                        <KmField
                          planned={5}
                          value={prog.s.km[`${cur}-renfoRun`]}
                          onChange={(v) => prog.setKm(`${cur}-renfoRun`, v)}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <KmField
                      planned={s.planned}
                      value={prog.s.km[sk]}
                      onChange={(v) => prog.setKm(sk, v)}
                    />
                    <div className="sess-body-note">{s.detail}</div>
                  </>
                )}
              </SessionCard>
            )
          })}
        </div>
      </div>

      <aside className="d-side-card">
        <div className="d-sc-head">
          <div>
            <div className="d-sc-k">Semaine en cours</div>
            <div className="d-sc-n">
              {cur} <span>/ 13</span>
            </div>
            <div className="d-sc-bloc" style={{ color: w.color }}>
              {w.bloc} · {w.tag}
            </div>
          </div>
          <Ring pct={doneCount / 3} size={76}>
            <div className="d-ring-n">
              {doneCount}
              <span>/3</span>
            </div>
          </Ring>
        </div>
        <p className="d-sc-focus">{w.focus}</p>
        <div className="d-sc-stats">
          <div>
            <div className="d-scs-k">Sortie longue</div>
            <div className="d-scs-v">{w.longue}</div>
          </div>
          <div>
            <div className="d-scs-k">Qualité</div>
            <div className="d-scs-v">{w.qual}</div>
          </div>
          <div>
            <div className="d-scs-k">Séances</div>
            <div className="d-scs-v">
              {w.sea} / sem · {w.dpos} m D+
            </div>
          </div>
        </div>
        <button className="d-link" onClick={() => go("plan")}>
          Voir tout le plan ›
        </button>
      </aside>
    </div>
  )
}

/* ---------- PLAN ---------- */
function Plan({ plan, prog }: ScreenProps) {
  const cur = currentWeek()
  const dow = new Date().getDay()
  const [sel, setSel] = useState(cur)
  const w = plan.weeks.find((x) => x.n === sel) ?? plan.weeks[0]
  const done = !!prog.s.weeks[w.n]
  let lastBloc: string | null = null

  return (
    <div className="d-grid-plan">
      <div className="d-weeks">
        {plan.weeks.map((x) => {
          const head = x.bloc !== lastBloc
          lastBloc = x.bloc
          const dn = !!prog.s.weeks[x.n]
          return (
            <div key={x.n}>
              {head && (
                <div className="d-bloc-head" style={{ color: x.color }}>
                  {x.bloc}
                </div>
              )}
              <button
                className={"d-wk" + (x.n === sel ? " sel" : "") + (x.n === cur ? " cur" : "")}
                onClick={() => setSel(x.n)}
              >
                <span className="d-wk-bar" style={{ background: x.color }} />
                <div className="d-wk-n" style={{ color: dn ? "var(--moss)" : "var(--ink)" }}>
                  {dn ? <CheckMark size={16} /> : x.n}
                </div>
                <div className="d-wk-mid">
                  <div className="d-wk-t">
                    {x.race ? "🏁 " : ""}S{x.n} · {x.date}
                    {x.n === cur ? " · en cours" : ""}
                  </div>
                  <div className="d-wk-d">{x.longue}</div>
                </div>
                <div className="d-wk-dpos">
                  {x.dpos}
                  <span>m D+</span>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      <aside className="d-detail">
        <span className="d-tag" style={{ background: tint(w.color), color: w.color }}>
          Semaine {w.n} · {w.date} · {w.tag}
        </span>
        <h3 className="d-detail-h">{w.bloc}</h3>
        <div className="d-dboxes">
          <div className="d-dbox">
            <div className="d-dk">Sortie longue · dimanche</div>
            <div className="d-dv">{w.longue}</div>
          </div>
          <div className="d-dbox">
            <div className="d-dk">Qualité · jeudi</div>
            <div className="d-dv">{w.qual}</div>
          </div>
          <div className="d-dbox half">
            <div className="d-dk">Séances / sem</div>
            <div className="d-dv">{w.sea}</div>
          </div>
          <div className="d-dbox half">
            <div className="d-dk">D+ sur la longue</div>
            <div className="d-dv">{w.dpos} m</div>
          </div>
        </div>
        <p className="d-detail-focus">{w.focus}</p>
        <div className="d-label" style={{ marginTop: 4 }}>
          La semaine jour par jour
        </div>
        <WeekDays w={w} exercises={plan.exercises} openDow={w.n === cur ? dow : RENFO_DOW} />
        <div className="d-detail-foot">
          <button className={"d-btn" + (done ? " done" : "")} onClick={() => prog.toggleWeek(w.n)}>
            {done ? "✓ Semaine validée" : "Marquer la semaine comme faite"}
          </button>
          <div className="d-pager">
            <button disabled={sel <= 1} onClick={() => setSel(sel - 1)} aria-label="Semaine précédente">
              ‹
            </button>
            <button disabled={sel >= 13} onClick={() => setSel(sel + 1)} aria-label="Semaine suivante">
              ›
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

/* ---------- RENFO ---------- */
function Renfo({ plan, prog }: ScreenProps) {
  const cur = currentWeek()
  const w = plan.weeks.find((x) => x.n === cur) ?? plan.weeks[0]
  const todayDow = new Date().getDay()
  const [day, setDay] = useState(todayDow)
  const isRenfoDay = day === RENFO_DOW
  const sess = sessionForDay(day, w)
  const done = plan.exercises.filter((_, i) => prog.s.ex[exKey(cur, i)]).length
  const total = plan.exercises.length

  return (
    <div className="d-grid-2">
      <div>
        <DaySelector value={day} onChange={setDay} today={todayDow} variant="d" />
        {isRenfoDay ? (
          <>
            <p className="d-intro">
              Le mardi · circuit avant footing court. 2–3 tours, 1–2 min de récup. Axé chaîne
              postérieure &amp; descente pour rééquilibrer un profil calisthénie déjà très quadriceps.
            </p>
            <div className="d-list">
              {plan.exercises.map((e, i) => {
                const on = !!prog.s.ex[exKey(cur, i)]
                return (
                  <div key={i} className="d-ex-row">
                    <button className={"d-ex" + (on ? " on" : "")} onClick={() => prog.toggleEx(cur, i)}>
                      <span className="d-ex-idx">{on ? <CheckMark size={16} color="var(--bg)" /> : i + 1}</span>
                      <div className="d-ex-mid">
                        <div className="d-ex-t">
                          {e.name} <span className="d-chip">{e.chip}</span>
                        </div>
                        <div className="d-ex-d">{e.why}</div>
                      </div>
                      <div className="d-ex-vol">{e.vol}</div>
                    </button>
                    <ExerciseLinks order={i + 1} name={e.name} variant="d" />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <p className="d-intro">
              Le circuit renfo se fait <b>le mardi</b>. {DAY_NAMES[day]}, voici la séance prévue.
            </p>
            <div className={"d-today" + (sess.key === "repos" ? " rest" : "")}>
              <span className="d-tag" style={{ background: tint(sess.col), color: sess.col }}>
                {sess.tag}
              </span>
              <div className="d-today-type">{sess.type}</div>
              <div className="d-today-detail">{sess.detail}</div>
              {sess.key !== "repos" && (
                <div style={{ marginTop: 14 }}>
                  <KmField
                    planned={sess.key === "longue" ? w.dist : null}
                    value={prog.s.km[`${cur}-${sess.key}`]}
                    onChange={(v) => prog.setKm(`${cur}-${sess.key}`, v)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <aside className="d-side-card">
        {isRenfoDay ? (
          <>
            <div className="d-sc-head">
              <div>
                <div className="d-sc-k">Circuit · semaine {cur}</div>
                <div className="d-sc-n">
                  {done} <span>/ {total}</span>
                </div>
                <div className="d-sc-bloc" style={{ color: "var(--moss)" }}>
                  exercices validés
                </div>
              </div>
              <Ring pct={total ? done / total : 0} size={76}>
                <div className="d-ring-n">
                  {total ? Math.round((done / total) * 100) : 0}
                  <span>%</span>
                </div>
              </Ring>
            </div>
            <div className="d-sc-k" style={{ marginTop: 18 }}>
              Minuteur de récupération
            </div>
            <RestTimer variant="d" />
            <div className="d-warn">
              <b>Pistols / airborne squats</b> 1×/sem max — jamais le même jour que les step-downs,
              sinon double dose de quadriceps.
            </div>
            {done > 0 && (
              <button className="d-link" onClick={() => prog.resetEx(cur)}>
                Réinitialiser le circuit
              </button>
            )}
          </>
        ) : (
          <>
            <div className="d-sc-k">Renfo de la semaine</div>
            <p className="d-sc-focus">
              Le circuit chaîne postérieure &amp; descente se place le mardi, jamais collé à la sortie
              longue ou aux côtes.
            </p>
            <button className="d-btn" onClick={() => setDay(RENFO_DOW)}>
              Voir le circuit du mardi ›
            </button>
            <div className="d-sc-k" style={{ marginTop: 18 }}>
              Minuteur de récupération
            </div>
            <RestTimer variant="d" />
          </>
        )}
      </aside>
    </div>
  )
}

/* ---------- PROGRÈS ---------- */
function Progres({ plan, prog }: ScreenProps) {
  const [metricKey, setMetricKey] = useState<MetricKey>("denivele")
  const [scope, setScope] = useState<Scope>("global")
  const metric = CHART_METRICS.find((m) => m.key === metricKey)!
  const cur = currentWeek()
  const weeksDone = Object.values(prog.s.weeks).filter(Boolean).length

  const weekNums = scopeWeeks(scope, plan.weeks)
  const st = realizedStats(plan.weeks, prog.s, weekNums)
  const bars = exPerWeek(plan.weeks, prog.s)
  const scopeSet = new Set(weekNums)
  const realized = [
    { n: String(st.sessionsDone), u: ` /${st.sessionsTotal}`, l: "séances clés faites" },
    { n: String(st.exDone), u: ` /${st.exTotal}`, l: "exercices renfo cochés" },
    { n: st.km.toFixed(st.km % 1 ? 1 : 0), u: " km", l: "parcourus (saisis)" },
    { n: String(st.dplusDone), u: " m", l: "D+ validé (longues)" },
  ]

  return (
    <div>
      <div className="d-prog-hero">
        <div className="d-ph-ring">
          <Ring pct={weeksDone / 13} size={120} stroke={10}>
            <div className="d-ring-big">
              {weeksDone}
              <span>/13</span>
            </div>
          </Ring>
          <div>
            <div className="d-ph-k">Semaines validées</div>
            <div className="d-ph-v">{Math.round((weeksDone / 13) * 100)}% du plan accompli</div>
            <div className="d-ph-s">
              Tu es en semaine {cur} · {13 - cur} restantes · jour J : 740 m D+
            </div>
          </div>
        </div>
      </div>

      <div className="d-prog-head">
        <div className="d-label" style={{ margin: 0 }}>
          Réalisé · {scopeLabel(scope, plan.weeks)}
        </div>
        <div className="d-seg">
          {SCOPES.map((sc) => (
            <button key={sc.key} className={sc.key === scope ? "on" : ""} onClick={() => setScope(sc.key)}>
              {sc.label}
            </button>
          ))}
        </div>
      </div>
      <div className="d-tiles">
        {realized.map((t, i) => (
          <div className="d-tile" key={i}>
            <div className="d-tile-n">
              {t.n}
              <span>{t.u}</span>
            </div>
            <div className="d-tile-l">{t.l}</div>
          </div>
        ))}
      </div>
      <div className="d-reste">
        Reste sur ce périmètre : <b>{st.sessionsTotal - st.sessionsDone}</b> séances ·{" "}
        <b>{st.weeksTotal - st.weeksValidated}</b> semaines à valider.
      </div>

      <div className="d-label">Exercices renfo réalisés par semaine</div>
      <div className="d-card">
        <RealizedBars data={bars} scope={scopeSet} cur={cur} />
      </div>

      <div className="d-label">Charge planifiée — survole les points</div>
      <div className="d-card">
        <div className="d-card-head">
          <div className="d-seg">
            {CHART_METRICS.map((m) => (
              <button key={m.key} className={m.key === metricKey ? "on" : ""} onClick={() => setMetricKey(m.key)}>
                {m.short}
              </button>
            ))}
          </div>
          <div className="d-chart-legend">
            <span>
              <i style={{ background: metric.color }} />
              {metric.label}
            </span>
            <span>
              <i style={{ background: "#c2562e" }} />
              Pic / simulateur
            </span>
            <span>
              <i style={{ background: "#6fa8c4" }} />
              Affûtage
            </span>
          </div>
        </div>
        <div className="d-chart-wrap">
          <LoadChart weeks={plan.weeks} metric={metric} height={360} />
        </div>
      </div>
    </div>
  )
}
