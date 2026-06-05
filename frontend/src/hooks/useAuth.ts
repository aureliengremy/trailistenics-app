import { useCallback, useEffect, useState } from "react"

import { api, getToken, setToken } from "@/lib/api"
import type { User } from "@/types"

export type AuthStatus = "loading" | "authenticated" | "anonymous"

export interface AuthApi {
  status: AuthStatus
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

/**
 * État d'authentification persisté via le jeton JWT en localStorage.
 * Au démarrage, si un jeton existe, il est validé via `GET /api/auth/me`
 * (un jeton expiré/invalide est purgé → retour à l'état anonyme).
 */
export function useAuth(): AuthApi {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? "loading" : "anonymous",
  )

  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api
      .me()
      .then((u) => {
        if (!cancelled) {
          setUser(u)
          setStatus("authenticated")
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null)
          setUser(null)
          setStatus("anonymous")
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const t = await api.login(email, password)
    setToken(t.access_token)
    setUser(t.user)
    setStatus("authenticated")
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const t = await api.register(email, password)
    setToken(t.access_token)
    setUser(t.user)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setStatus("anonymous")
  }, [])

  return { status, user, login, register, logout }
}
