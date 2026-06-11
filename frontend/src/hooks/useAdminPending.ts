import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import type { User } from "@/types"

/**
 * Nombre d'intakes **en attente de programme** (badge de l'onglet Admin).
 * Ne fetch que pour l'admin ; 0 sinon. Rafraîchi au montage.
 */
export function useAdminPending(user: User | null): number {
  const [count, setCount] = useState(0)
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (!isAdmin) {
      setCount(0)
      return
    }
    let cancelled = false
    api
      .adminUsers()
      .then((users) => {
        if (!cancelled) setCount(users.filter((u) => u.has_intake && !u.has_program).length)
      })
      .catch(() => {
        /* best-effort : pas de badge si l'appel échoue */
      })
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  return count
}
