import { createAuthClient } from "@neondatabase/auth"
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters"

const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL as string | undefined
if (!NEON_AUTH_URL) {
  // eslint-disable-next-line no-console
  console.error("VITE_NEON_AUTH_URL manquant : l'authentification Neon Auth ne fonctionnera pas.")
}

/**
 * Client Neon Auth (Better Auth). Expose directement l'API Better Auth :
 * `signIn.email`, `signUp.email`, `useSession`, `signOut`.
 * L'UI reste la nôtre (AuthScreen) — on ne câble pas les composants UI prêts.
 */
export const authClient = createAuthClient(NEON_AUTH_URL ?? "", {
  adapter: BetterAuthReactAdapter(),
})
