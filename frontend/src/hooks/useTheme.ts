import { useCallback, useEffect, useRef, useState } from "react"

export type Theme = "light" | "dark"

/** Clé alignée avec le script anti-flash de index.html. */
const KEY = "planTrail.theme.v1"

function initialTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === "light" ? "light" : "dark"
  } catch {
    return "dark"
  }
}

/** Thème persisté ; bascule la classe `theme-light` sur <html> avec transition douce. */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const first = useRef(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const root = document.documentElement
    // Pas de transition au tout premier rendu (le thème est déjà posé par index.html).
    if (!first.current) {
      root.classList.add("theme-transition")
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => root.classList.remove("theme-transition"), 400)
    }
    first.current = false
    root.classList.toggle("theme-light", theme === "light")
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* quota indisponible — on ignore */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((p) => (p === "light" ? "dark" : "light")), [])
  return { theme, toggle }
}
