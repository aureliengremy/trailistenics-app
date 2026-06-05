import type { User } from "@/types"

interface AccountMenuProps {
  user: User | null
  onLogout: () => void
  variant: "d" | "m"
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 17v1.5a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H13a2 2 0 0 1 2 2V7" />
      <path d="M10 12h10m0 0-3-3m3 3-3 3" />
    </svg>
  )
}

/** Affiche le compte connecté et permet de se déconnecter. */
export function AccountMenu({ user, onLogout, variant }: AccountMenuProps) {
  if (variant === "m") {
    return (
      <button
        type="button"
        className="theme-toggle m-theme-toggle"
        onClick={onLogout}
        aria-label="Se déconnecter"
        title={user ? `${user.email} · se déconnecter` : "Se déconnecter"}
      >
        <LogoutIcon />
      </button>
    )
  }

  return (
    <div className="d-account">
      <div className="d-account-info">
        <div className="d-account-k">Connecté</div>
        <div className="d-account-v" title={user?.email}>
          {user?.email}
        </div>
      </div>
      <button
        type="button"
        className="d-logout"
        onClick={onLogout}
        aria-label="Se déconnecter"
        title="Se déconnecter"
      >
        <LogoutIcon />
      </button>
    </div>
  )
}
