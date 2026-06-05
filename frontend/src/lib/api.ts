import type { Bloc, Exercise, Token, User, Week } from "@/types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

/** Clé de stockage du jeton JWT. */
const TOKEN_KEY = "planTrail.auth.v1"

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* stockage indisponible — on ignore */
  }
}

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
  const token = getToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

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
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) })

export const api = {
  blocs: () => get<Bloc[]>("/api/blocs"),
  weeks: () => get<Week[]>("/api/weeks"),
  week: (n: number) => get<Week>(`/api/weeks/${n}`),
  exercises: () => get<Exercise[]>("/api/exercises"),
  register: (email: string, password: string) =>
    post<Token>("/api/auth/register", { email, password }),
  login: (email: string, password: string) => post<Token>("/api/auth/login", { email, password }),
  me: () => get<User>("/api/auth/me"),
}
