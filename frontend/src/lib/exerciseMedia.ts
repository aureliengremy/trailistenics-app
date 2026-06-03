/**
 * Média par exercice (onglet Renfo) : vignette de démo + termes de recherche.
 *
 * - `query` : terme de recherche (anglais, meilleurs résultats) → liens Images + Vidéo.
 * - `imageUrl` : vignette embarquée, base open-source free-exercise-db (CDN jsDelivr).
 *   Best-effort : la base est orientée muscu/barre, donc certaines vignettes montrent une
 *   variante avec charge — le mouvement reste lisible et les liens pointent vers la version
 *   exacte (poids de corps / unijambe). Toutes les URLs ci-dessous ont été vérifiées (HTTP 200).
 *
 * Clé = `order` de l'exercice (1–6).
 */

export interface ExerciseMedia {
  query: string
  imageUrl?: string
}

const FEDB = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises"

export const EXERCISE_MEDIA: Record<number, ExerciseMedia> = {
  1: { query: "single leg romanian deadlift", imageUrl: `${FEDB}/Romanian_Deadlift/0.jpg` },
  2: { query: "slow eccentric step down exercise", imageUrl: `${FEDB}/Dumbbell_Step_Ups/0.jpg` },
  3: { query: "nordic hamstring curl", imageUrl: `${FEDB}/Natural_Glute_Ham_Raise/0.jpg` },
  4: { query: "single leg glute bridge", imageUrl: `${FEDB}/Barbell_Glute_Bridge/0.jpg` },
  5: { query: "standing calf raise tibialis raise", imageUrl: `${FEDB}/Standing_Calf_Raises/0.jpg` },
  6: { query: "side plank with leg raise", imageUrl: `${FEDB}/Side_Bridge/0.jpg` },
}

/** Recherche Google Images pré-remplie pour un exercice. */
export function imagesSearchUrl(query: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + " exercise")}`
}

/** Recherche YouTube (démo vidéo) pré-remplie pour un exercice. */
export function videoSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " demo")}`
}
