import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import {
  adaptExercise,
  adaptWeek,
  blocMaps,
  type PlanExercise,
  type PlanWeek,
} from "@/lib/plan"

export interface PlanData {
  weeks: PlanWeek[]
  exercises: PlanExercise[]
  colorByKey: Record<string, string>
  tagByKey: Record<string, string>
  /** false = l'utilisateur n'a pas encore de programme (nouveau compte). */
  hasProgram: boolean
  startDate: string | null
  eventDate: string | null
  loading: boolean
  error: string | null
}

const EMPTY = {
  weeks: [] as PlanWeek[],
  exercises: [] as PlanExercise[],
  colorByKey: {} as Record<string, string>,
  tagByKey: {} as Record<string, string>,
  hasProgram: false,
  startDate: null as string | null,
  eventDate: null as string | null,
}

/** Charge le programme de l'utilisateur courant (`/api/program`) → forme « plan ». */
export function usePlan(): PlanData {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .program()
      .then((prog) => {
        if (cancelled) return
        if (!prog) {
          setData(EMPTY)
          return
        }
        const { colorByKey, tagByKey } = blocMaps(prog.weeks.map((w) => w.bloc))
        setData({
          weeks: prog.weeks.map(adaptWeek),
          exercises: prog.exercises.map(adaptExercise),
          colorByKey,
          tagByKey,
          hasProgram: true,
          startDate: prog.start_date,
          eventDate: prog.event_date,
        })
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur réseau")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { ...data, loading, error }
}
