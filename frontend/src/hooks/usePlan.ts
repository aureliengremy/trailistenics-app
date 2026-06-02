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
  loading: boolean
  error: string | null
}

/** Charge semaines + blocs + exercices et les adapte à la forme « plan ». */
export function usePlan(): PlanData {
  const [data, setData] = useState<Omit<PlanData, "loading" | "error">>({
    weeks: [],
    exercises: [],
    colorByKey: {},
    tagByKey: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.weeks(), api.exercises(), api.blocs()])
      .then(([weeks, exercises, blocs]) => {
        if (cancelled) return
        const { colorByKey, tagByKey } = blocMaps(blocs)
        setData({
          weeks: weeks.map(adaptWeek),
          exercises: exercises.map(adaptExercise),
          colorByKey,
          tagByKey,
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
