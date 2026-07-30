import { createAuthClient } from "@neondatabase/auth"
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters"

const RAW_NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL as string | undefined
if (!RAW_NEON_AUTH_URL) {
  // eslint-disable-next-line no-console
  console.error("VITE_NEON_AUTH_URL manquant : l'authentification Neon Auth ne fonctionnera pas.")
}

/**
 * Base URL Neon Auth résolue. En prod comme en dev, la valeur est un chemin relatif
 * (`/neonauth`) proxifié par Vercel/Vite vers le endpoint Neon : l'auth passe par NOTRE
 * domaine, donc le cookie de session est first-party (persiste dans tous les navigateurs,
 * y compris Safari/ITP). Une URL absolue reste acceptée (ancien comportement).
 */
export const NEON_AUTH_BASE = RAW_NEON_AUTH_URL?.startsWith("/")
  ? window.location.origin + RAW_NEON_AUTH_URL
  : (RAW_NEON_AUTH_URL ?? "")

/**
 * Client Neon Auth (Better Auth). Expose directement l'API Better Auth :
 * `signIn.email`, `signUp.email`, `useSession`, `signOut`.
 * L'UI reste la nôtre (AuthScreen) — on ne câble pas les composants UI prêts.
 */
export const authClient = createAuthClient(NEON_AUTH_BASE, {
  adapter: BetterAuthReactAdapter(),
})
