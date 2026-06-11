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

/**
 * État de synchronisation DB de la progression :
 * - `idle`    : pas d'utilisateur / rien à enregistrer.
 * - `saved`   : la DB reflète l'état local (vert).
 * - `pending` : des changements locaux ne sont pas encore en base (orange, cliquable).
 * - `saving`  : un appel d'enregistrement est en cours.
 * - `error`   : le dernier enregistrement a échoué (rouge, cliquable pour réessayer).
 */
export type SyncStatus = "idle" | "saved" | "pending" | "saving" | "error"

export interface ProgressApi {
  s: ProgressState
  /** État de synchronisation avec la base (pour l'indicateur d'enregistrement). */
  syncStatus: SyncStatus
  /** Force un enregistrement immédiat en base (bouton « disquette »). */
  syncNow: () => void
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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")

  // Réinitialise sur le cache local au changement d'utilisateur (évite toute fuite inter-comptes).
  const [curKey, setCurKey] = useState(key)
  if (key !== curKey) {
    setCurKey(key)
    setS(loadLocal(key))
    setSyncStatus("idle")
  }

  // La DB n'est écrite qu'après le 1er chargement DB de CET utilisateur (sinon on écraserait).
  const loadedFor = useRef<string | null>(null)
  // Image sérialisée de ce que la DB contient (pour détecter les changements non enregistrés).
  const savedSnapshot = useRef<string>("")
  // Toujours la dernière valeur de `s` (lue par les enregistrements asynchrones).
  const sRef = useRef(s)
  sRef.current = s
  const savingRef = useRef(false)
  const timer = useRef<number | null>(null)

  // Enregistrement immédiat en base. Réévalue le statut à la fin (l'état a pu changer entre-temps).
  const save = async (): Promise<void> => {
    if (!userId || loadedFor.current !== userId || savingRef.current) return
    savingRef.current = true
    setSyncStatus("saving")
    const snapshot = JSON.stringify(sRef.current)
    try {
      await api.putProgress(sRef.current)
    } catch {
      savingRef.current = false
      setSyncStatus("error")
      return
    }
    savedSnapshot.current = snapshot
    savingRef.current = false
    if (JSON.stringify(sRef.current) === savedSnapshot.current) {
      setSyncStatus("saved")
    } else {
      // Des changements sont survenus pendant l'appel : replanifie un enregistrement.
      setSyncStatus("pending")
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => void saveRef.current(), 800)
    }
  }
  const saveRef = useRef(save)
  saveRef.current = save

  const syncNow = (): void => {
    if (timer.current) window.clearTimeout(timer.current)
    void saveRef.current()
  }

  // Chargement initial depuis la DB (source de vérité), avec bascule du cache local si la DB est vide.
  useEffect(() => {
    if (!userId) {
      loadedFor.current = null
      setSyncStatus("idle")
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
          savedSnapshot.current = JSON.stringify(norm)
          loadedFor.current = userId
          setSyncStatus("saved")
        } else {
          // DB vide : l'état distant connu est « vide » ; on pousse le cache local s'il existe.
          savedSnapshot.current = JSON.stringify(normalize(null))
          loadedFor.current = userId
          if (hasData(loadLocal(key))) {
            setSyncStatus("pending")
            void saveRef.current()
          } else {
            setSyncStatus("saved")
          }
        }
      })
      .catch(() => {
        // DB injoignable : on garde le localStorage ; statut d'erreur si des données restent à pousser.
        loadedFor.current = userId
        savedSnapshot.current = ""
        setSyncStatus(hasData(sRef.current) ? "error" : "idle")
      })
    return () => {
      cancelled = true
    }
  }, [userId, key])

  // À chaque changement : cache localStorage immédiat + détection « non enregistré » → DB (debounce 800 ms).
  useEffect(() => {
    saveLocal(key, s)
    if (!userId || loadedFor.current !== userId || savingRef.current) return
    if (JSON.stringify(s) === savedSnapshot.current) {
      setSyncStatus("saved")
      return
    }
    setSyncStatus("pending")
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void saveRef.current(), 800)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [key, s, userId])

  return {
    s,
    syncStatus,
    syncNow,
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
