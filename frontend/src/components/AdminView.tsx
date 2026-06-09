import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import type { AdminUser } from "@/types"

/** Vue admin : liste des comptes, état intake/programme, et l'intake JSON (pour générer le plan). */
export function AdminView() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    api
      .adminUsers()
      .then(setUsers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="d-intro">Chargement des comptes…</p>
  if (error)
    return <p className="d-intro" style={{ color: "var(--rust)" }}>Erreur : {error}</p>

  const withIntake = users.filter((u) => u.has_intake).length
  const withProgram = users.filter((u) => u.has_program).length

  return (
    <div>
      <p className="d-intro">
        <b>{users.length}</b> comptes · <b>{withIntake}</b> avec intake · <b>{withProgram}</b> avec
        programme. Clique un compte pour voir son intake (à copier dans Claude CLI pour générer le
        programme).
      </p>
      <div className="admin-list">
        {users.map((u) => (
          <div key={u.id} className="admin-row">
            <button
              type="button"
              className="admin-main"
              onClick={() => setOpenId(openId === u.id ? null : u.id)}
            >
              <span className="admin-email">{u.email}</span>
              <span className="admin-date">
                {new Date(u.created_at).toLocaleDateString("fr-FR")}
              </span>
              <span className="admin-badges">
                <span className={"admin-badge" + (u.has_intake ? " on" : "")}>intake</span>
                <span className={"admin-badge prog" + (u.has_program ? " on" : "")}>programme</span>
              </span>
            </button>
            {openId === u.id &&
              (u.intake ? (
                <pre className="admin-intake">{JSON.stringify(u.intake, null, 2)}</pre>
              ) : (
                <div className="admin-intake empty">Pas d'intake rempli.</div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
