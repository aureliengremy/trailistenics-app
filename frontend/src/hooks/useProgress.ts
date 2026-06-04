import { useEffect, useState } from "react"

/** État de progression persisté en localStorage (semaines, exos, séances, km). */
export interface ProgressState {
  weeks: Record<number, boolean>
  /** Exercices renfo cochés, clé `${semaine}-${index}` (ex. "3-0"). */
  ex: Record<string, boolean>
  sessions: Record<string, boolean>
  /** Kilomètres réalisés, clé `${semaine}-${séance}` (ex. "1-longue"). */
  km: Record<string, number>
}

export interface ProgressApi {
  s: ProgressState
  toggleWeek: (n: number) => void
  toggleEx: (week: number, i: number) => void
  toggleSession: (k: string) => void
  setKm: (k: string, val: number | null) => void
  resetEx: (week: number) => void
  reset: () => void
}

const KEY = "planTrail.progress.v1"

function load(): ProgressState {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<ProgressState>
    return { weeks: v.weeks ?? {}, ex: v.ex ?? {}, sessions: v.sessions ?? {}, km: v.km ?? {} }
  } catch {
    return { weeks: {}, ex: {}, sessions: {}, km: {} }
  }
}

/** Clé d'un exercice renfo dans l'état (par semaine). */
export function exKey(week: number, i: number): string {
  return `${week}-${i}`
}

export function useProgress(): ProgressApi {
  const [s, setS] = useState<ProgressState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* quota indisponible — on ignore */
    }
  }, [s])

  return {
    s,
    toggleWeek: (n) => setS((p) => ({ ...p, weeks: { ...p.weeks, [n]: !p.weeks[n] } })),
    toggleEx: (week, i) =>
      setS((p) => {
        const k = exKey(week, i)
        return { ...p, ex: { ...p.ex, [k]: !p.ex[k] } }
      }),
    toggleSession: (k) => setS((p) => ({ ...p, sessions: { ...p.sessions, [k]: !p.sessions[k] } })),
    setKm: (k, val) =>
      setS((p) => {
        const km = { ...p.km }
        if (val == null || Number.isNaN(val)) delete km[k]
        else km[k] = val
        return { ...p, km }
      }),
    resetEx: (week) =>
      setS((p) => {
        const ex = { ...p.ex }
        for (let i = 0; i < 6; i++) delete ex[exKey(week, i)]
        return { ...p, ex }
      }),
    reset: () => setS({ weeks: {}, ex: {}, sessions: {}, km: {} }),
  }
}
