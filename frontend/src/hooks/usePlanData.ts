import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import type { Exercise, Week } from "@/types"

interface PlanData {
  weeks: Week[]
  exercises: Exercise[]
  loading: boolean
  error: string | null
}

/** Charge le plan complet (semaines + circuit) au montage. */
export function usePlanData(): PlanData {
  const [weeks, setWeeks] = useState<Week[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.weeks(), api.exercises()])
      .then(([w, e]) => {
        if (cancelled) return
        setWeeks(w)
        setExercises(e)
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

  return { weeks, exercises, loading, error }
}
