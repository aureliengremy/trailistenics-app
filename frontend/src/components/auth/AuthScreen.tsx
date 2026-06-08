import { type FormEvent, useState } from "react"

import { ThemeToggle } from "@/components/common/ThemeToggle"
import type { AuthApi } from "@/hooks/useAuth"
import type { Theme } from "@/hooks/useTheme"
import { ApiError } from "@/lib/api"

type Mode = "login" | "register"

interface AuthScreenProps {
  auth: AuthApi
  theme: Theme
  onToggleTheme: () => void
}

/** Écran d'accueil (porte d'entrée) : connexion ou création de compte. */
export function AuthScreen({ auth, theme, onToggleTheme }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isRegister = mode === "register"

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setConfirm("")
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    if (isRegister && password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.")
      return
    }
    if (isRegister && password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.")
      return
    }
    setBusy(true)
    try {
      if (isRegister) await auth.register(email.trim(), password)
      else await auth.login(email.trim(), password)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError("Connexion au serveur impossible. Réessaie.")
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-topbar">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="d" />
      </div>
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-brand">
          <div className="auth-mark">▲</div>
          <div>
            <div className="auth-brand-n">TRAILISTENICS</div>
            <div className="auth-brand-s">Trail 20 km · 740 D+</div>
          </div>
        </div>

        <h1 className="auth-title">{isRegister ? "Créer un compte" : "Bon retour"}</h1>
        <p className="auth-sub">
          {isRegister
            ? "Ton suivi d'entraînement, accessible partout."
            : "Connecte-toi pour retrouver ton plan."}
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            className={"auth-tab" + (!isRegister ? " on" : "")}
            onClick={() => switchMode("login")}
          >
            Se connecter
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            className={"auth-tab" + (isRegister ? " on" : "")}
            onClick={() => switchMode("register")}
          >
            S'inscrire
          </button>
        </div>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
          />
        </label>

        <label className="auth-field">
          <span>Mot de passe</span>
          <input
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={isRegister ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRegister ? "8 caractères minimum" : "••••••••"}
          />
        </label>

        {isRegister && (
          <label className="auth-field">
            <span>Confirme le mot de passe</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Retape ton mot de passe"
            />
          </label>
        )}

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? "…" : isRegister ? "Créer mon compte" : "Se connecter"}
        </button>

        <div className="auth-switch">
          {isRegister ? (
            <>
              Déjà un compte ?{" "}
              <button type="button" onClick={() => switchMode("login")}>
                Se connecter
              </button>
            </>
          ) : (
            <>
              Pas encore de compte ?{" "}
              <button type="button" onClick={() => switchMode("register")}>
                S'inscrire
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
