import { useEffect, useRef, useState } from "react"

import { api } from "@/lib/api"

/** Séance « bonus » : un entraînement réalisé hors programme (ex. course du samedi). */
export interface BonusSession {
  week: number
  day: number // 0 = dimanche … 6 = samedi
  type: string
  km: number | null
}

/** État de progression (semaines, exos par semaine, séances, km, séances bonus). */
export interface ProgressState {
  weeks: Record<number, boolean>
  /** Exercices renfo cochés, clé `${semaine}-${index}` (ex. "3-0"). */
  ex: Record<string, boolean>
  sessions: Record<string, boolean>
  /** Kilomètres réalisés, clé `${semaine}-${séance}` (ex. "1-longue"). */
  km: Record<string, number>
  /** Séances bonus, clé = id unique. */
  bonus: Record<string, BonusSession>
}

export interface ProgressApi {
  s: ProgressState
  toggleWeek: (n: number) => void
  toggleEx: (week: number, i: number) => void
  toggleSession: (k: string) => void
  setKm: (k: string, val: number | null) => void
  resetEx: (week: number) => void
  addBonus: (b: BonusSession) => void
  removeBonus: (id: string) => void
  reset: () => void
}

const BASE_KEY = "planTrail.progress.v1"

function storageKey(userId: string | null): string {
  return userId ? `${BASE_KEY}.${userId}` : BASE_KEY
}

function normalize(v: Partial<ProgressState> | null | undefined): ProgressState {
  return {
    weeks: v?.weeks ?? {},
    ex: v?.ex ?? {},
    sessions: v?.sessions ?? {},
    km: v?.km ?? {},
    bonus: v?.bonus ?? {},
  }
}

function loadLocal(key: string): ProgressState {
  try {
    return normalize(JSON.parse(localStorage.getItem(key) ?? "{}") as Partial<ProgressState>)
  } catch {
    return normalize(null)
  }
}

function saveLocal(key: string, s: ProgressState): void {
  try {
    localStorage.setItem(key, JSON.stringify(s))
  } catch {
    /* quota indisponible */
  }
}

function hasData(s: ProgressState): boolean {
  return [s.weeks, s.ex, s.sessions, s.km, s.bonus].some((m) => Object.keys(m).length > 0)
}

let bonusSeq = 0

/** Clé d'un exercice renfo dans l'état (par semaine). */
export function exKey(week: number, i: number): string {
  return `${week}-${i}`
}

/**
 * Suivi de progression **par utilisateur**, persisté en **DB** (source de vérité) avec
 * `localStorage` en cache. Au login : charge depuis la DB (ou pousse le cache local si la DB
 * est vide) ; à chaque changement : écrit le cache puis synchronise la DB (debounce).
 */
export function useProgress(userId: string | null): ProgressApi {
  const key = storageKey(userId)
  const [s, setS] = useState<ProgressState>(() => loadLocal(key))

  // Réinitialise sur le cache local au changement d'utilisateur (évite toute fuite inter-comptes).
  const [curKey, setCurKey] = useState(key)
  if (key !== curKey) {
    setCurKey(key)
    setS(loadLocal(key))
  }

  // La DB n'est écrite qu'après le 1er chargement DB de CET utilisateur (sinon on écraserait).
  const loadedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!userId) {
      loadedFor.current = null
      return
    }
    let cancelled = false
    api
      .getProgress()
      .then((remote) => {
        if (cancelled) return
        const norm = normalize(remote as Partial<ProgressState>)
        if (hasData(norm)) {
          setS(norm)
          saveLocal(key, norm)
        } else {
          const local = loadLocal(key)
          if (hasData(local)) void api.putProgress(local)
        }
        loadedFor.current = userId
      })
      .catch(() => {
        loadedFor.current = userId // hors-ligne : on garde le localStorage et on tentera d'écrire
      })
    return () => {
      cancelled = true
    }
  }, [userId, key])

  // Persistance à chaque changement : localStorage immédiat + DB (debounce 800 ms).
  const timer = useRef<number | null>(null)
  useEffect(() => {
    saveLocal(key, s)
    if (userId && loadedFor.current === userId) {
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => void api.putProgress(s), 800)
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [key, s, userId])

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
    addBonus: (b) =>
      setS((p) => {
        const id = `b${b.week}-${b.day}-${(bonusSeq += 1)}-${Math.floor(Math.random() * 1e4)}`
        return { ...p, bonus: { ...p.bonus, [id]: b } }
      }),
    removeBonus: (id) =>
      setS((p) => {
        const bonus = { ...p.bonus }
        delete bonus[id]
        return { ...p, bonus }
      }),
    reset: () => setS({ weeks: {}, ex: {}, sessions: {}, km: {}, bonus: {} }),
  }
}
