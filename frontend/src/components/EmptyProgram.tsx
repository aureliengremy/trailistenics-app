import { ThemeToggle } from "@/components/common/ThemeToggle"
import type { Theme } from "@/hooks/useTheme"
import type { User } from "@/types"

interface EmptyProgramProps {
  user: User | null
  onLogout: () => void
  theme: Theme
  onToggleTheme: () => void
}

/** Écran « pas encore de programme » — affiché pour un compte sans programme. */
export function EmptyProgram({ user, onLogout, theme, onToggleTheme }: EmptyProgramProps) {
  return (
    <div className="auth-wrap">
      <div className="auth-topbar">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="d" />
      </div>
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-mark">▲</div>
          <div>
            <div className="auth-brand-n">TRAILISTENICS</div>
            <div className="auth-brand-s">Trail · calisthénie</div>
          </div>
        </div>
        <h1 className="auth-title">Ton programme arrive</h1>
        <p className="auth-sub">
          Ton compte est bien créé{user?.email ? ` (${user.email})` : ""}. Ton programme
          d'entraînement personnalisé n'est pas encore prêt : il sera généré à partir de ton
          profil et apparaîtra ici.
        </p>
        <button type="button" className="auth-submit" onClick={onLogout}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
