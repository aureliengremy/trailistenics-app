/** Statistiques de progression réalisée, agrégées par périmètre (semaine / mois / global). */

import type { ProgressState } from "@/hooks/useProgress"
import { exKey } from "@/hooks/useProgress"
import { currentWeek, type PlanWeek, weekMonth } from "@/lib/plan"

export type Scope = "week" | "month" | "global"

export const SCOPES: { key: Scope; label: string }[] = [
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "global", label: "Plan global" },
]

/** Les 3 séances clés comptabilisées par semaine. */
export const KEY_SESSION_KEYS = ["renfo", "qual", "longue"] as const
export const EX_PER_CIRCUIT = 6

/** Numéros de semaines couvertes par le périmètre, d'après la date du jour. */
export function scopeWeeks(scope: Scope, weeks: PlanWeek[], today: Date = new Date()): number[] {
  const cur = currentWeek(today)
  if (scope === "global") return weeks.map((w) => w.n)
  if (scope === "week") return [cur]
  const m = weekMonth(cur)
  return weeks.filter((w) => weekMonth(w.n) === m).map((w) => w.n)
}

/** Libellé lisible du périmètre courant (pour l'en-tête des stats). */
export function scopeLabel(scope: Scope, weeks: PlanWeek[], today: Date = new Date()): string {
  const nums = scopeWeeks(scope, weeks, today)
  if (scope === "global") return "Sur tout le plan"
  if (scope === "week") return `Semaine ${nums[0]}`
  if (!nums.length) return "Ce mois"
  return `Semaines ${nums[0]}–${nums[nums.length - 1]}`
}

export interface RealizedStats {
  sessionsDone: number
  sessionsTotal: number
  exDone: number
  exTotal: number
  km: number
  dplusDone: number
  dplusTotal: number
  weeksValidated: number
  weeksTotal: number
}

/** Agrège tout ce qui a été réalisé sur l'ensemble de semaines donné. */
export function realizedStats(weeks: PlanWeek[], s: ProgressState, weekNums: number[]): RealizedStats {
  const set = new Set(weekNums)
  const inScope = weeks.filter((w) => set.has(w.n))

  let sessionsDone = 0
  let exDone = 0
  let dplusDone = 0
  for (const n of weekNums) {
    for (const k of KEY_SESSION_KEYS) if (s.sessions[`${n}-${k}`]) sessionsDone++
    for (let i = 0; i < EX_PER_CIRCUIT; i++) if (s.ex[exKey(n, i)]) exDone++
  }
  for (const w of inScope) if (s.sessions[`${w.n}-longue`]) dplusDone += w.dpos

  let km = 0
  for (const [key, val] of Object.entries(s.km)) {
    if (set.has(Number(key.split("-")[0]))) km += val
  }
  for (const b of Object.values(s.bonus)) {
    if (b.km != null && set.has(b.week)) km += b.km
  }

  return {
    sessionsDone,
    sessionsTotal: weekNums.length * KEY_SESSION_KEYS.length,
    exDone,
    exTotal: weekNums.length * EX_PER_CIRCUIT,
    km: Math.round(km * 10) / 10,
    dplusDone,
    dplusTotal: inScope.reduce((a, w) => a + w.dpos, 0),
    weeksValidated: inScope.filter((w) => s.weeks[w.n]).length,
    weeksTotal: weekNums.length,
  }
}

/** Nombre d'exercices renfo réalisés par semaine (0–6), pour le graphe à barres. */
export function exPerWeek(weeks: PlanWeek[], s: ProgressState): { n: number; count: number }[] {
  return weeks.map((w) => {
    let count = 0
    for (let i = 0; i < EX_PER_CIRCUIT; i++) if (s.ex[exKey(w.n, i)]) count++
    return { n: w.n, count }
  })
}
