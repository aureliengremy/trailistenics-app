/** Adaptateur API → forme « plan » utilisée par les écrans Suivi, + constantes. */

import type { ProgressState } from "@/hooks/useProgress"
import type { Bloc, Exercise, Week } from "@/types"

/** Forme d'une semaine telle que consommée par les composants Suivi. */
export interface PlanWeek {
  n: number
  date: string
  bloc: string
  blocKey: string
  duree: number
  dpos: number
  /** Distance prévue de la sortie longue (km), si renseignée. */
  dist: number | null
  sea: number
  longue: string
  qual: string
  focus: string
  race: boolean
  color: string
  tag: string
}

export interface PlanExercise {
  name: string
  vol: string
  chip: string
  why: string
}

export function adaptWeek(w: Week): PlanWeek {
  return {
    n: w.number,
    // Premier jour (lundi) de la semaine, calculé depuis l'ancrage du programme
    // (et non `w.date_label`, qui suivait le mardi de départ).
    date: weekStartLabel(w.number),
    bloc: w.bloc.name,
    blocKey: w.bloc.color_key,
    duree: w.long_run_duration_min,
    dpos: w.long_run_dplus_m,
    dist: w.long_run_distance_km,
    sea: w.sessions_per_week,
    longue: w.long_run_label,
    qual: w.quality_session,
    focus: w.focus,
    race: w.is_race,
    color: w.bloc.color,
    tag: w.bloc.category,
  }
}

export function adaptExercise(e: Exercise): PlanExercise {
  return { name: e.name, vol: e.volume, chip: e.target, why: e.rationale }
}

/** Cartes couleur/catégorie par clé de bloc, construites depuis l'API. */
export function blocMaps(blocs: Bloc[]): {
  colorByKey: Record<string, string>
  tagByKey: Record<string, string>
} {
  const colorByKey: Record<string, string> = {}
  const tagByKey: Record<string, string> = {}
  for (const b of blocs) {
    colorByKey[b.color_key] = b.color
    tagByKey[b.color_key] = b.category
  }
  return { colorByKey, tagByKey }
}

/** Métrique commutable du graphe de charge : valeur prévue (programme) et réalisée (saisies). */
export interface ChartMetric {
  key: MetricKey
  label: string
  short: string
  unit: string
  max: number
  color: string
  /** Valeur prévue par le programme pour la semaine. */
  planned: (w: PlanWeek) => number
  /** Valeur réalisée d'après les chiffres saisis (null = rien de réalisé). */
  realized: (w: PlanWeek, s: ProgressState) => number | null
}
export type MetricKey = "duree" | "distance" | "denivele" | "seances"

/** Sorties courues d'une semaine, par ordre de priorité (la longue, puis la qualité, etc.). */
const RUN_PRIORITY = ["longue", "qual", "renfo", "easyW", "easy"]

/** Les `sessions_per_week` sorties prévues de la semaine (les N premières de la priorité). */
function weekRunKeys(w: PlanWeek): string[] {
  const n = Math.max(1, Math.min(RUN_PRIORITY.length, w.sea))
  return RUN_PRIORITY.slice(0, n)
}

/** Somme des saisies (km ou durée) de toutes les sorties d'une semaine. */
function sumWeek(map: Record<string, number>, n: number): number {
  let total = 0
  for (const [k, v] of Object.entries(map)) if (k.startsWith(`${n}-`)) total += v
  return total
}

/** Somme des km des séances bonus de la semaine `n`. */
function sumBonusKm(s: ProgressState, n: number): number {
  return Object.values(s.bonus).reduce((a, b) => a + (b.week === n && b.km != null ? b.km : 0), 0)
}

/** Somme du D+ des séances bonus de la semaine `n`. */
function sumBonusDpos(s: ProgressState, n: number): number {
  return Object.values(s.bonus).reduce((a, b) => a + (b.week === n && b.dpos != null ? b.dpos : 0), 0)
}

/** D+ hebdo prévu (m) — le D+ planifié vit sur la sortie longue. */
export function weekPlannedDpos(w: PlanWeek): number {
  return w.dpos
}

/** Distance hebdo prévue (km) = somme des objectifs des sorties prévues (selon séances/sem). */
export function weekPlannedKm(w: PlanWeek): number {
  return Math.round(weekRunKeys(w).reduce((a, k) => a + (sessionTarget(k, w).km ?? 0), 0))
}
/** Temps de course hebdo prévu (min) = somme des objectifs des sorties prévues (selon séances/sem). */
export function weekPlannedMin(w: PlanWeek): number {
  return weekRunKeys(w).reduce((a, k) => a + (sessionTarget(k, w).min ?? 0), 0)
}
/** Distance hebdo réalisée (km) = somme des distances saisies + km des bonus. */
export function weekRealizedKm(w: PlanWeek, s: ProgressState): number | null {
  const t = sumWeek(s.km, w.n) + sumBonusKm(s, w.n)
  return t > 0 ? Math.round(t * 10) / 10 : null
}
/** Temps de course hebdo réalisé (min) = somme des durées saisies. */
export function weekRealizedMin(w: PlanWeek, s: ProgressState): number | null {
  const t = sumWeek(s.dur, w.n)
  return t > 0 ? Math.round(t) : null
}
/** D+ hebdo réalisé (m) = somme des D+ saisis + D+ des bonus. */
export function weekRealizedDpos(w: PlanWeek, s: ProgressState): number | null {
  const t = sumWeek(s.dpos, w.n) + sumBonusDpos(s, w.n)
  return t > 0 ? Math.round(t) : null
}
/** Nombre de séances cochées dans la semaine. */
export function weekRealizedSessions(w: PlanWeek, s: ProgressState): number | null {
  const n = Object.entries(s.sessions).filter(([k, v]) => v && k.startsWith(`${w.n}-`)).length
  return n > 0 ? n : null
}

/**
 * Réalisé pour le graphe : semaine passée sans saisie → 0 (la courbe plonge,
 * honnête) ; semaine en cours sans saisie → null (pas de plongeon un lundi
 * matin) ; semaine future → null (pas de courbe).
 */
function realizedForChart(
  sum: (w: PlanWeek, s: ProgressState) => number | null,
): (w: PlanWeek, s: ProgressState) => number | null {
  return (w, s) => {
    const cur = currentWeek()
    if (w.n > cur) return null
    const v = sum(w, s)
    return w.n < cur ? (v ?? 0) : v
  }
}

export const CHART_METRICS: ChartMetric[] = [
  {
    key: "duree", label: "Temps de course hebdo", short: "Temps hebdo", unit: "min", max: 380, color: "#7ba05b",
    planned: weekPlannedMin, realized: realizedForChart(weekRealizedMin),
  },
  {
    key: "distance", label: "Distance hebdo", short: "Distance hebdo", unit: "km", max: 55, color: "#c2562e",
    planned: weekPlannedKm, realized: realizedForChart(weekRealizedKm),
  },
  {
    key: "denivele", label: "Dénivelé positif hebdo", short: "Dénivelé D+", unit: "m D+", max: 780, color: "#d98a3d",
    planned: weekPlannedDpos, realized: realizedForChart(weekRealizedDpos),
  },
  {
    key: "seances", label: "Nombre de séances", short: "Volume hebdo", unit: "séances", max: 5, color: "#6fa8c4",
    planned: (w) => w.sea, realized: realizedForChart(weekRealizedSessions),
  },
]

/** Couleur d'un point selon son bloc (course = rouille). */
export function pointColor(w: PlanWeek): string {
  return w.race ? "#c2562e" : w.color
}

/* -------------------------------------------------------------------------- */
/* Dates & séances                                                            */
/* -------------------------------------------------------------------------- */

export const DAY_NAMES = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
]
export const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.",
]
export const MONTHS_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
  "septembre", "octobre", "novembre", "décembre",
]

/** Ancrage par défaut (utilisé tant qu'aucun programme n'est chargé). */
const DEFAULT_PLAN_START = new Date(2026, 5, 2)
let planStart = DEFAULT_PLAN_START
let planWeekCount = 13

/**
 * Ancre le calcul des semaines/dates sur le programme courant : `start_date` (ISO `YYYY-MM-DD`)
 * et nombre de semaines. Appelé par usePlan au chargement du programme.
 */
export function setPlanAnchor(startISO: string | null, weekCount: number): void {
  planStart = startISO ? new Date(`${startISO}T00:00:00`) : DEFAULT_PLAN_START
  planWeekCount = weekCount > 0 ? weekCount : 13
}

/**
 * Numéro de la semaine en cours (ou à venir si la semaine est passée).
 * Calé sur le **lundi** de la semaine 1 — donc aligné sur les semaines affichées (lundi→dimanche).
 * La bascule se fait le lundi : dès que le dimanche d'une semaine est passé, on est sur la suivante.
 */
export function currentWeek(today: Date = new Date()): number {
  const monday1 = weekMonday(1).getTime()
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const diff = Math.floor((t - monday1) / (7 * 864e5))
  return Math.max(1, Math.min(planWeekCount, diff + 1))
}

/** Date de départ de la semaine n (S1 = start_date du programme). */
export function weekStartDate(n: number): Date {
  return new Date(planStart.getTime() + (n - 1) * 7 * 864e5)
}

/** Lundi (premier jour) de la semaine n, recalé sur le lundi même si l'ancrage tombe un autre jour. */
export function weekMonday(n: number): Date {
  const d = weekStartDate(n)
  const backToMonday = (d.getDay() + 6) % 7 // 0=dim … 6=sam → recul jusqu'au lundi
  return new Date(d.getTime() - backToMonday * 864e5)
}

/**
 * Libellé du **premier jour (lundi)** de la semaine n, ex. « 1 juin ».
 */
export function weekStartLabel(n: number): string {
  const monday = weekMonday(n)
  return `${monday.getDate()} ${MONTHS_SHORT[monday.getMonth()]}`
}

/** Date calendaire du jour `dow` (0=dim … 6=sam) dans la semaine n. */
export function weekDayDate(n: number, dow: number): Date {
  const offset = (dow + 6) % 7 // lundi=0 … dimanche=6
  return new Date(weekMonday(n).getTime() + offset * 864e5)
}

/** Mois (0–11) de la semaine n. */
export function weekMonth(n: number): number {
  return weekStartDate(n).getMonth()
}

/** Jour de la semaine du renfo (mardi). */
export const RENFO_DOW = 2

export interface DaySession {
  type: string
  detail: string
  tag: string
  col: string
  key: string
}

/** Objectif chiffré d'une sortie : temps de course (min) et/ou distance (km). */
export interface SessionTarget {
  min: number | null
  km: number | null
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/** Distance approx. d'un footing facile à partir de sa durée (~9 km/h sur sentier). */
function easyKm(min: number): number {
  return Math.round((min / 60) * 9)
}

/**
 * **Objectif chiffré par sortie**, dérivé de la semaine (la sortie longue est l'unique séance
 * chiffrée du programme ; les autres s'échelonnent sur sa durée). Donne du sens à chaque jour :
 * un temps de course (et une distance quand elle a du sens). `null` = pas d'objectif (repos).
 */
export function sessionTarget(sessKey: string, w: PlanWeek): SessionTarget {
  switch (sessKey) {
    case "longue":
      return { min: w.duree, km: w.dist }
    case "renfo": {
      // Footing court après le circuit.
      const min = clamp(Math.round(w.duree * 0.3), 20, 30)
      return { min, km: easyKm(min) }
    }
    case "qual": {
      // Séance d'intensité : objectif en temps total (échauffement + travail + retour au calme).
      const min = clamp(Math.round(w.duree * 0.55), 30, 60)
      return { min, km: easyKm(min) }
    }
    case "easy": {
      const min = clamp(Math.round(w.duree * 0.45), 20, 45)
      return { min, km: easyKm(min) }
    }
    case "easyW": {
      const min = clamp(Math.round(w.duree * 0.55), 25, 55)
      return { min, km: easyKm(min) }
    }
    default:
      return { min: null, km: null }
  }
}

/** Séance type selon le jour de la semaine (0 = dimanche), avec son objectif chiffré. */
export function sessionForDay(d: number, w: PlanWeek): DaySession {
  switch (d) {
    case 0:
      return { type: "Sortie longue", detail: w.longue, tag: "Endurance", col: "var(--moss)", key: "longue" }
    case 1:
      return { type: "Repos", detail: "Mobilité, étirements légers. On laisse le corps assimiler.", tag: "Récup", col: "var(--muted)", key: "repos1" }
    case 2: {
      const t = sessionTarget("renfo", w)
      return { type: "Renfo + footing", detail: `Circuit 6 exos · 2–3 tours, puis ~${t.min} min de footing facile (~${t.km} km), allure conversation.`, tag: "Force", col: "var(--sky)", key: "renfo" }
    }
    case 3: {
      const t = sessionTarget("easy", w)
      return { type: "Footing court", detail: `~${t.min} min très facile (~${t.km} km), allure conversation. Optionnel selon la forme.`, tag: "Souple", col: "var(--muted)", key: "easy" }
    }
    case 4: {
      const t = sessionTarget("qual", w)
      return { type: "Séance qualité", detail: `${w.qual} · ~${t.min} min en tout (échauffement + retour au calme inclus).`, tag: "Intensité", col: "var(--accent)", key: "qual" }
    }
    case 5:
      return { type: "Repos", detail: "Récupération avant le week-end de volume.", tag: "Récup", col: "var(--muted)", key: "repos5" }
    default: {
      const t = sessionTarget("easyW", w)
      return { type: "Footing libre", detail: `~${t.min} min en nature (~${t.km} km), allure facile, plaisir.`, tag: "Souple", col: "var(--moss)", key: "easyW" }
    }
  }
}

/** Ordre d'affichage des jours d'une semaine d'entraînement : lundi → dimanche. */
const WEEK_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

/** Lendemain dans la semaine d'entraînement (lundi → dimanche) ; null après dimanche. */
export function nextDow(d: number): number | null {
  const i = WEEK_DAY_ORDER.indexOf(d)
  return i >= 0 && i < WEEK_DAY_ORDER.length - 1 ? WEEK_DAY_ORDER[i + 1] : null
}

/** Jour planifié (0–6) de chaque séance d'entraînement (hors repos). */
export const PLANNED_DOW: Record<string, number> = {
  renfo: 2,
  easy: 3,
  qual: 4,
  easyW: 6,
  longue: 0,
}

/** Séance d'entraînement par clé (renfo/easy/qual/easyW/longue), depuis son jour planifié. */
export function sessionByKey(key: string, w: PlanWeek): DaySession {
  return sessionForDay(PLANNED_DOW[key] ?? 1, w)
}

/** Vrai si la clé désigne un jour de repos (repos1 = lundi, repos5 = vendredi). */
export function isRestKey(key: string): boolean {
  return key.startsWith("repos")
}

/** Clé de saisie km d'une séance (le renfo trace le footing qui suit le circuit). */
export function kmKeyFor(week: number, sessKey: string): string {
  return sessKey === "renfo" ? `${week}-renfoRun` : `${week}-${sessKey}`
}

/** Distance prévue (km) d'une séance, si pertinente (cf. `sessionTarget`). */
export function plannedKmFor(sessKey: string, w: PlanWeek): number | null {
  return sessionTarget(sessKey, w).km
}

/** Durée prévue (minutes) d'une séance, si pertinente (cf. `sessionTarget`). */
export function plannedMinFor(sessKey: string, w: PlanWeek): number | null {
  return sessionTarget(sessKey, w).min
}

/** D+ prévu (m) d'une séance : seul l'objectif de la longue existe. */
export function plannedDposFor(sessKey: string, w: PlanWeek): number | null {
  return sessKey === "longue" ? w.dpos : null
}

/** Km prévus par sortie de la semaine, ordonnés lundi → dimanche (détail du résumé hebdo). */
export function weekKmBreakdown(w: PlanWeek): Array<{ dow: number; km: number }> {
  return weekRunKeys(w)
    .map((k) => ({ dow: PLANNED_DOW[k], km: sessionTarget(k, w).km }))
    .filter((x): x is { dow: number; km: number } => x.km != null)
    .sort((a, b) => (a.dow === 0 ? 7 : a.dow) - (b.dow === 0 ? 7 : b.dow))
}

export interface WeekDay {
  dow: number
  name: string
  sess: DaySession
}

/** Les 7 jours d'une semaine, ordonnés lundi → dimanche, avec leur séance type. */
export function weekDays(w: PlanWeek): WeekDay[] {
  return WEEK_DAY_ORDER.map((d) => ({ dow: d, name: DAY_NAMES[d], sess: sessionForDay(d, w) }))
}

/** Teinte translucide d'une couleur (hex ou var()), pour les fonds de tags. */
export function tint(col: string): string {
  return `color-mix(in oklab, ${col} 14%, transparent)`
}

