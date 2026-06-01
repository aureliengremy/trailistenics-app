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
