/** Adaptateur API → forme « plan » utilisée par les écrans Suivi, + constantes. */

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

/** Métriques commutables du graphique de charge (identiques au design). */
export interface ChartMetric {
  key: MetricKey
  label: string
  short: string
  unit: string
  field: "duree" | "dpos" | "sea"
  max: number
  color: string
}
export type MetricKey = "duree" | "denivele" | "seances"

export const CHART_METRICS: ChartMetric[] = [
  { key: "duree", label: "Durée de la sortie longue", short: "Durée longue", unit: "min", field: "duree", max: 160, color: "#7ba05b" },
  { key: "denivele", label: "Dénivelé positif sur la longue", short: "Dénivelé D+", unit: "m D+", field: "dpos", max: 780, color: "#d98a3d" },
  { key: "seances", label: "Nombre de séances", short: "Volume hebdo", unit: "séances", field: "sea", max: 5, color: "#6fa8c4" },
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

/** Numéro de la semaine en cours d'après la date du jour et l'ancrage du programme. */
export function currentWeek(today: Date = new Date()): number {
  const diff = Math.floor((today.getTime() - planStart.getTime()) / (7 * 864e5))
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

/** Séance type selon le jour de la semaine (0 = dimanche). */
export function sessionForDay(d: number, w: PlanWeek): DaySession {
  switch (d) {
    case 0:
      return { type: "Sortie longue", detail: w.longue, tag: "Endurance", col: "var(--moss)", key: "longue" }
    case 1:
      return { type: "Repos", detail: "Mobilité, étirements légers. On laisse le corps assimiler.", tag: "Récup", col: "var(--muted)", key: "repos1" }
    case 2:
      return { type: "Renfo + footing", detail: "Circuit 6 exos · 2–3 tours, puis 20–30 min footing facile.", tag: "Force", col: "var(--sky)", key: "renfo" }
    case 3:
      return { type: "Footing court", detail: "30–40 min très facile, optionnel selon la forme.", tag: "Souple", col: "var(--muted)", key: "easy" }
    case 4:
      return { type: "Séance qualité", detail: w.qual, tag: "Intensité", col: "var(--accent)", key: "qual" }
    case 5:
      return { type: "Repos", detail: "Récupération avant le week-end de volume.", tag: "Récup", col: "var(--muted)", key: "repos5" }
    default:
      return { type: "Footing libre", detail: "40–50 min en nature, allure facile, plaisir.", tag: "Souple", col: "var(--moss)", key: "easyW" }
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

/** Distance prévue (km) d'une séance, si connue. */
export function plannedKmFor(sessKey: string, w: PlanWeek): number | null {
  if (sessKey === "longue") return w.dist
  if (sessKey === "renfo") return 5
  return null
}

/** Durée prévue (minutes) d'une séance, si connue (seule la sortie longue est chiffrée dans le plan). */
export function plannedMinFor(sessKey: string, w: PlanWeek): number | null {
  if (sessKey === "longue") return w.duree
  return null
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

/** Les 3 séances clés de la semaine (cartes dépliables de l'écran Aujourd'hui). */
export interface KeySession {
  key: "renfo" | "qual" | "longue"
  day: string
  label: string
  summary: string
  col: string
  kind: "renfo" | "run"
  detail: string
  planned: number | null
  /** Pour le mardi : le footing facile qui suit le circuit. */
  footing?: string
}

export function keySessions(w: PlanWeek): KeySession[] {
  return [
    {
      key: "renfo",
      day: "Mardi",
      label: "Renfo + footing",
      summary: "Circuit calisthénie × trail, puis footing court",
      col: "var(--sky)",
      kind: "renfo",
      detail: "",
      planned: null,
      footing: "Puis 20–30 min de footing facile, sur jambes fatiguées — pas de côtes, allure conversation.",
    },
    {
      key: "qual",
      day: "Jeudi",
      label: "Séance qualité",
      summary: "La séance intense de la semaine",
      col: "var(--accent)",
      kind: "run",
      detail: w.qual,
      planned: null,
    },
    {
      key: "longue",
      day: "Dimanche",
      label: "Sortie longue",
      summary: "Le cœur de la prépa — volume & D+",
      col: "var(--moss)",
      kind: "run",
      detail: w.longue,
      planned: w.dist,
    },
  ]
}
