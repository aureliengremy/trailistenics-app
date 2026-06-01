import type { Bloc, Exercise, Week } from "@/types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`Requête ${path} échouée (${res.status})`)
  }
  return res.json() as Promise<T>
}

export const api = {
  blocs: () => get<Bloc[]>("/api/blocs"),
  weeks: () => get<Week[]>("/api/weeks"),
  week: (n: number) => get<Week>(`/api/weeks/${n}`),
  exercises: () => get<Exercise[]>("/api/exercises"),
}
