import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import {
  adaptExercise,
  adaptWeek,
  blocMaps,
  type PlanExercise,
  type PlanWeek,
  setPlanAnchor,
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

interface PlanState {
  weeks: PlanWeek[]
  exercises: PlanExercise[]
  colorByKey: Record<string, string>
  tagByKey: Record<string, string>
  hasProgram: boolean
  startDate: string | null
  eventDate: string | null
  /** uuid pour lequel ces données ont été chargées (null = pas encore). */
  forUser: string | null
}

const EMPTY: PlanState = {
  weeks: [],
  exercises: [],
  colorByKey: {},
  tagByKey: {},
  hasProgram: false,
  startDate: null,
  eventDate: null,
  forUser: null,
}

/**
 * Charge le programme de l'utilisateur **authentifié** (`/api/program`).
 * Se (re)déclenche au changement d'utilisateur ; ne fetch pas tant qu'anonyme
 * (sinon l'appel partirait sans JWT → 401).
 */
export function usePlan(userId: string | null): PlanData {
  const [data, setData] = useState<PlanState>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    if (!userId) {
      setData(EMPTY)
      return
    }
    let cancelled = false
    api
      .program()
      .then((prog) => {
        if (cancelled) return
        if (!prog) {
          setData({ ...EMPTY, forUser: userId })
          return
        }
        setPlanAnchor(prog.start_date, prog.weeks.length)
        const { colorByKey, tagByKey } = blocMaps(prog.weeks.map((w) => w.bloc))
        setData({
          weeks: prog.weeks.map(adaptWeek),
          exercises: prog.exercises.map(adaptExercise),
          colorByKey,
          tagByKey,
          hasProgram: true,
          startDate: prog.start_date,
          eventDate: prog.event_date,
          forUser: userId,
        })
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur réseau")
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const loading = userId != null && data.forUser !== userId && error == null
  return {
    weeks: data.weeks,
    exercises: data.exercises,
    colorByKey: data.colorByKey,
    tagByKey: data.tagByKey,
    hasProgram: data.hasProgram,
    startDate: data.startDate,
    eventDate: data.eventDate,
    loading,
    error,
  }
}
