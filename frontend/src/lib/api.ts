import type { AdminUser, Program } from "@/types"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL as string | undefined

/** Erreur HTTP enrichie du code de statut (utile pour distinguer 401/409…). */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/* ----- Jeton d'auth (JWT Neon Auth) pour appeler notre backend ----- */
let cachedToken: { jwt: string; exp: number } | null = null

function jwtExp(jwt: string): number {
  try {
    const p = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    return (JSON.parse(atob(p)) as { exp?: number }).exp ?? 0
  } catch {
    return 0
  }
}

/** Récupère un JWT Neon Auth (via la session), mis en cache jusqu'à ~30 s avant expiration. */
async function getAuthToken(): Promise<string | null> {
  const now = Date.now() / 1000
  if (cachedToken && cachedToken.exp - 30 > now) return cachedToken.jwt
  if (!AUTH_URL) return null
  try {
    const res = await fetch(`${AUTH_URL}/token`, { credentials: "include" })
    if (!res.ok) return null
    const { token } = (await res.json()) as { token?: string }
    if (!token) return null
    cachedToken = { jwt: token, exp: jwtExp(token) || now + 600 }
    return token
  } catch {
    return null
  }
}

/** À appeler à la déconnexion : purge le jeton en cache. */
export function clearAuthToken(): void {
  cachedToken = null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) }
  if (init?.body) headers["Content-Type"] = "application/json"
  const token = await getAuthToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    let detail = `Requête ${path} échouée (${res.status})`
    try {
      const body = (await res.json()) as { detail?: unknown }
      if (typeof body.detail === "string") detail = body.detail
    } catch {
      /* corps non-JSON */
    }
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

export const api = {
  /** Programme de l'utilisateur courant — `null` si aucun (nouveau compte). */
  program: () => request<Program | null>("/api/program"),
  /** Progression persistée de l'utilisateur courant (objet vide si aucune). */
  getProgress: () => request<Record<string, unknown>>("/api/progress"),
  putProgress: (data: unknown) =>
    request<{ ok: boolean }>("/api/progress", { method: "PUT", body: JSON.stringify(data) }),
  /** Intake (questionnaire de profil) de l'utilisateur courant. */
  getIntake: () => request<Record<string, unknown>>("/api/intake"),
  putIntake: (data: unknown) =>
    request<{ ok: boolean }>("/api/intake", { method: "PUT", body: JSON.stringify(data) }),
  /** Notifie l'admin d'une nouvelle inscription (best-effort). */
  notifySignup: () => request<{ sent: boolean }>("/api/notify-signup", { method: "POST", body: "{}" }),
  /** Admin : liste des comptes + état intake/programme. */
  adminUsers: () => request<AdminUser[]>("/api/admin/users"),
}
