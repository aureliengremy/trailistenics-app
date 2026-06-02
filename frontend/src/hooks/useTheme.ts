import { useCallback, useEffect, useRef, useState } from "react"

export type Theme = "light" | "dark"

/** Clé alignée avec le script anti-flash de index.html. */
const KEY = "planTrail.theme.v1"
const MQ_LIGHT = "(prefers-color-scheme: light)"

/** Choix explicite enregistré, ou null si l'utilisateur n'a jamais basculé. */
function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === "light" || v === "dark" ? v : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  try {
    return window.matchMedia(MQ_LIGHT).matches ? "light" : "dark"
  } catch {
    return "dark"
  }
}

/** Au premier chargement : choix enregistré s'il existe, sinon préférence système. */
function initialTheme(): Theme {
  return storedTheme() ?? systemTheme()
}

/**
 * Thème persisté ; bascule la classe `theme-light` sur <html> avec transition douce.
 * Tant qu'aucun choix explicite n'est enregistré, suit `prefers-color-scheme` (même en live).
 * Au premier clic du toggle, le choix est figé en localStorage et prime sur le système.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const first = useRef(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Applique la classe sur <html> à chaque changement (avec transition sauf au 1er rendu).
  useEffect(() => {
    const root = document.documentElement
    if (!first.current) {
      root.classList.add("theme-transition")
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => root.classList.remove("theme-transition"), 400)
    }
    first.current = false
    root.classList.toggle("theme-light", theme === "light")
  }, [theme])

  // Suit le système tant qu'aucun choix explicite n'a été enregistré.
  useEffect(() => {
    let mql: MediaQueryList
    try {
      mql = window.matchMedia(MQ_LIGHT)
    } catch {
      return
    }
    const onChange = () => {
      if (storedTheme() === null) setTheme(mql.matches ? "light" : "dark")
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Le clic enregistre un choix explicite, qui prime désormais sur le système.
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light"
      try {
        localStorage.setItem(KEY, next)
      } catch {
        /* quota indisponible — on ignore */
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
