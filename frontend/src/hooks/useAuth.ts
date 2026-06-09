import { useCallback } from "react"

import { authClient } from "@/lib/auth-client"
import { ApiError, clearAuthToken } from "@/lib/api"
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
 * État d'authentification via Neon Auth (Better Auth). La session est gérée par
 * `authClient.useSession()` ; connexion/inscription/déconnexion délèguent au client.
 * L'UI de saisie reste la nôtre (AuthScreen) — Neon Auth ne fait que l'auth.
 */
export function useAuth(): AuthApi {
  const session = authClient.useSession()
  const su = session.data?.user ?? null
  const user: User | null = su ? { id: su.id, email: su.email, name: su.name ?? undefined } : null
  const status: AuthStatus = session.isPending ? "loading" : su ? "authenticated" : "anonymous"

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password })
    if (error) throw new ApiError(error.status ?? 401, error.message ?? "Email ou mot de passe incorrect.")
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: email.split("@")[0],
    })
    if (error) throw new ApiError(error.status ?? 400, error.message ?? "Inscription impossible.")
  }, [])

  const logout = useCallback(() => {
    clearAuthToken()
    void authClient.signOut()
  }, [])

  return { status, user, login, register, logout }
}
