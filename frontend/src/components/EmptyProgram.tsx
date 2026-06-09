import { useState } from "react"

import { IntakeForm } from "@/components/IntakeForm"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import type { Theme } from "@/hooks/useTheme"
import type { User } from "@/types"

interface EmptyProgramProps {
  user: User | null
  onLogout: () => void
  theme: Theme
  onToggleTheme: () => void
}

/**
 * Écran pour un compte **sans programme** : il remplit son profil (intake). Une fois enregistré,
 * un message confirme que le programme sera généré (par l'admin, via Claude CLI).
 */
export function EmptyProgram({ user, onLogout, theme, onToggleTheme }: EmptyProgramProps) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="empty-wrap">
      <div className="empty-topbar">
        <div className="empty-brand">
          <div className="auth-mark">▲</div>
          <div>
            <div className="auth-brand-n">TRAILISTENICS</div>
            <div className="auth-brand-s">Trail · calisthénie</div>
          </div>
        </div>
        <div className="empty-topbar-r">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="d" />
          <button type="button" className="empty-logout" onClick={onLogout}>
            Se déconnecter
          </button>
        </div>
      </div>

      <div className="empty-card">
        {saved ? (
          <div className="empty-thanks">
            <h1 className="auth-title">Merci, c'est noté !</h1>
            <p className="auth-sub">
              Ton profil est enregistré{user?.email ? ` (${user.email})` : ""}. Ton programme
              trail + renforcement personnalisé va être généré à partir de tes réponses et
              apparaîtra ici.
            </p>
            <button type="button" className="auth-submit" onClick={() => setSaved(false)}>
              Modifier mes réponses
            </button>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Crée ton profil</h1>
            <p className="auth-sub">
              Réponds à ce court questionnaire : il sert à générer ton programme trail +
              renforcement sur-mesure (objectif, forme actuelle, force au poids du corps).
            </p>
            <IntakeForm onSaved={() => setSaved(true)} />
          </>
        )}
      </div>
    </div>
  )
}
