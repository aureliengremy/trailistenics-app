import type { Bloc, Exercise, Week } from "@/types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

/** Erreur HTTP enrichie du code de statut (utile pour distinguer 401/409…). */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) }
  if (init?.body) headers["Content-Type"] = "application/json"

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    let detail = `Requête ${path} échouée (${res.status})`
    try {
      const body = (await res.json()) as { detail?: unknown }
      if (typeof body.detail === "string") detail = body.detail
    } catch {
      /* corps non-JSON — on garde le message par défaut */
    }
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

const get = <T>(path: string) => request<T>(path)

/** Données du plan (publiques). L'authentification est gérée par Neon Auth, pas par cette API. */
export const api = {
  blocs: () => get<Bloc[]>("/api/blocs"),
  weeks: () => get<Week[]>("/api/weeks"),
  week: (n: number) => get<Week>(`/api/weeks/${n}`),
  exercises: () => get<Exercise[]>("/api/exercises"),
}
