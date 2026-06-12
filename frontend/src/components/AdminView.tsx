import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import type { AdminUser } from "@/types"

/** Vrai si le compte attend son programme (intake rempli, pas encore de programme). */
function isPending(u: AdminUser): boolean {
  return u.has_intake && !u.has_program
}

/**
 * Vue admin : comptes triés « à traiter » d'abord, intake JSON copiable (entrée du pipeline
 * de génération via Claude Code) et commande d'import prête à coller.
 */
export function AdminView() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    api
      .adminUsers()
      .then((list) =>
        setUsers([...list].sort((a, b) => Number(isPending(b)) - Number(isPending(a)))),
      )
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false))
  }, [])

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600)
    } catch {
      /* clipboard indisponible */
    }
  }

  if (loading) return <p className="d-intro">Chargement des comptes…</p>
  if (error)
    return <p className="d-intro" style={{ color: "var(--rust)" }}>Erreur : {error}</p>

  const pending = users.filter(isPending).length
  const withProgram = users.filter((u) => u.has_program).length

  return (
    <div>
      <p className="d-intro">
        <b>{users.length}</b> comptes · <b style={{ color: pending ? "var(--ocre)" : "inherit" }}>
          {pending} à traiter
        </b>{" "}
        · <b>{withProgram}</b> avec programme. Flow : copie l'intake JSON ci-dessous → génère via{" "}
        <code>docs/prompts/00-pipeline-orchestration.md</code> dans Claude Code → importe avec la
        commande ci-dessous.
      </p>
      <div className="admin-list">
        {users.map((u) => {
          const importCmd = `python -m app.import_program ../docs/generated/<slug>/programme-<slug>.json --owner-email ${u.email}`
          return (
            <div key={u.id} className={"admin-row" + (isPending(u) ? " pending" : "")}>
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
                  {isPending(u) && <span className="admin-badge todo on">à traiter</span>}
                  <span className={"admin-badge" + (u.has_intake ? " on" : "")}>intake</span>
                  <span className={"admin-badge prog" + (u.has_program ? " on" : "")}>programme</span>
                </span>
              </button>
              {openId === u.id &&
                (u.intake ? (
                  <div className="admin-detail">
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-copy"
                        onClick={() => void copy(`${u.id}-json`, JSON.stringify(u.intake, null, 2))}
                      >
                        {copied === `${u.id}-json` ? "✓ Copié" : "Copier l'intake JSON"}
                      </button>
                      <button
                        type="button"
                        className="admin-copy"
                        onClick={() => void copy(`${u.id}-cmd`, importCmd)}
                      >
                        {copied === `${u.id}-cmd` ? "✓ Copié" : "Copier la commande d'import"}
                      </button>
                    </div>
                    <pre className="admin-intake">{JSON.stringify(u.intake, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="admin-intake empty">Pas d'intake rempli.</div>
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
