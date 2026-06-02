import { useEffect, useState } from "react"

/** État de progression persisté en localStorage (semaines, exos, séances cochés). */
export interface ProgressState {
  weeks: Record<number, boolean>
  ex: Record<number, boolean>
  sessions: Record<string, boolean>
}

export interface ProgressApi {
  s: ProgressState
  toggleWeek: (n: number) => void
  toggleEx: (i: number) => void
  toggleSession: (k: string) => void
  resetEx: () => void
  reset: () => void
}

const KEY = "planTrail.progress.v1"

function load(): ProgressState {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<ProgressState>
    return { weeks: v.weeks ?? {}, ex: v.ex ?? {}, sessions: v.sessions ?? {} }
  } catch {
    return { weeks: {}, ex: {}, sessions: {} }
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
    resetEx: () => setS((p) => ({ ...p, ex: {} })),
    reset: () => setS({ weeks: {}, ex: {}, sessions: {} }),
  }
}
