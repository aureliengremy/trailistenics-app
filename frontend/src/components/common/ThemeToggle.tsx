import type { Theme } from "@/hooks/useTheme"

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
  variant: "d" | "m"
}

/** Bouton de bascule clair/sombre. Affiche l'icône de la cible (soleil = passer au clair). */
export function ThemeToggle({ theme, onToggle, variant }: ThemeToggleProps) {
  const goingLight = theme === "dark"
  return (
    <button
      type="button"
      className={`theme-toggle ${variant}-theme-toggle`}
      onClick={onToggle}
      aria-label={goingLight ? "Passer au thème clair" : "Passer au thème sombre"}
      title={goingLight ? "Thème clair" : "Thème sombre"}
    >
      {goingLight ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.6A8 8 0 0 1 9.4 4 6.5 6.5 0 1 0 20 14.6z" />
    </svg>
  )
}
