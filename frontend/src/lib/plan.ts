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
    date: w.date_label,
    bloc: w.bloc.name,
    blocKey: w.bloc.color_key,
    duree: w.long_run_duration_min,
    dpos: w.long_run_dplus_m,
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

/** Début de la semaine 1 du plan : 2 juin 2026. */
const PLAN_START = new Date(2026, 5, 2)

/** Numéro de la semaine en cours (1–13) d'après la date du jour. */
export function currentWeek(today: Date = new Date()): number {
  const diff = Math.floor((today.getTime() - PLAN_START.getTime()) / (7 * 864e5))
  return Math.max(1, Math.min(13, diff + 1))
}

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
      return { type: "Repos", detail: "Mobilité, étirements légers. On laisse le corps assimiler.", tag: "Récup", col: "var(--muted)", key: "repos" }
    case 2:
      return { type: "Renfo + footing", detail: "Circuit 6 exos · 2–3 tours, puis 20–30 min footing facile.", tag: "Force", col: "var(--sky)", key: "renfo" }
    case 3:
      return { type: "Footing court", detail: "30–40 min très facile, optionnel selon la forme.", tag: "Souple", col: "var(--muted)", key: "easy" }
    case 4:
      return { type: "Séance qualité", detail: w.qual, tag: "Intensité", col: "var(--accent)", key: "qual" }
    case 5:
      return { type: "Repos", detail: "Récupération avant le week-end de volume.", tag: "Récup", col: "var(--muted)", key: "repos" }
    default:
      return { type: "Footing libre", detail: "40–50 min en nature, allure facile, plaisir.", tag: "Souple", col: "var(--moss)", key: "easyW" }
  }
}

/** Teinte translucide d'une couleur (hex ou var()), pour les fonds de tags. */
export function tint(col: string): string {
  return `color-mix(in oklab, ${col} 14%, transparent)`
}
