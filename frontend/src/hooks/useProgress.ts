import { useEffect, useState } from "react"

/** État de progression persisté en localStorage (semaines, exos, séances, km). */
export interface ProgressState {
  weeks: Record<number, boolean>
  ex: Record<number, boolean>
  sessions: Record<string, boolean>
  /** Kilomètres réalisés, clé `${semaine}-${séance}` (ex. "1-longue"). */
  km: Record<string, number>
}

export interface ProgressApi {
  s: ProgressState
  toggleWeek: (n: number) => void
  toggleEx: (i: number) => void
  toggleSession: (k: string) => void
  setKm: (k: string, val: number | null) => void
  resetEx: () => void
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
    toggleEx: (i) => setS((p) => ({ ...p, ex: { ...p.ex, [i]: !p.ex[i] } })),
    toggleSession: (k) => setS((p) => ({ ...p, sessions: { ...p.sessions, [k]: !p.sessions[k] } })),
    setKm: (k, val) =>
      setS((p) => {
        const km = { ...p.km }
        if (val == null || Number.isNaN(val)) delete km[k]
        else km[k] = val
        return { ...p, km }
      }),
    resetEx: () => setS((p) => ({ ...p, ex: {} })),
    reset: () => setS({ weeks: {}, ex: {}, sessions: {}, km: {} }),
  }
}
