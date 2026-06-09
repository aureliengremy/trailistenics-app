/** Types partagés — miroir des schémas Pydantic du backend. */

export interface Bloc {
  id: number
  key: string
  name: string
  category: string
  color: string
  color_key: string
  description: string
  order: number
}

export interface Week {
  id: number
  number: number
  date_label: string
  long_run_label: string
  long_run_duration_min: number
  long_run_dplus_m: number
  long_run_distance_km: number | null
  sessions_per_week: number
  sessions_label: string | null
  quality_session: string
  focus: string
  is_race: boolean
  bloc: Bloc
}

export interface Exercise {
  id: number
  order: number
  name: string
  volume: string
  target: string
  rationale: string
}

/** Programme d'entraînement de l'utilisateur (semaines + exercices + dates). */
export interface Program {
  id: number
  name: string
  start_date: string | null
  event_date: string | null
  weeks: Week[]
  exercises: Exercise[]
}

/** Utilisateur Neon Auth (Better Auth). `id` = uuid. */
export interface User {
  id: string
  email: string
  name?: string
  role?: string
}

/** Ligne de la vue admin (un compte + état intake/programme). */
export interface AdminUser {
  id: string
  email: string
  created_at: string
  has_intake: boolean
  intake: Record<string, unknown> | null
  has_program: boolean
}
