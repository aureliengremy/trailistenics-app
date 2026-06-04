/**
 * Média par exercice (onglet Renfo) : galerie d'images + vidéo de démo embarquée.
 *
 * - `query`  : terme de recherche (anglais) → liens externes « voir plus » (Images / YouTube).
 * - `images` : images de démo embarquées, base open-source free-exercise-db (CDN jsDelivr),
 *   2 vues par exercice. Best-effort : la base est orientée muscu, donc certaines vues montrent
 *   une variante avec charge — le mouvement reste lisible. URLs vérifiées (HTTP 200).
 * - `videoId`: vidéo YouTube de démo **curée** par exercice (lecteur embarqué en modal).
 *   IDs vérifiés via oEmbed (HTTP 200). On embarque une vidéo précise car les pages de
 *   *résultats* Google Images / YouTube refusent l'iframe (`x-frame-options: SAMEORIGIN`).
 *
 * Clé = `order` de l'exercice (1–6).
 */

export interface ExerciseMedia {
  query: string
  images: string[]
  videoId: string
}

const FEDB = "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises"
const imgs = (dir: string): string[] => [`${FEDB}/${dir}/0.jpg`, `${FEDB}/${dir}/1.jpg`]

export const EXERCISE_MEDIA: Record<number, ExerciseMedia> = {
  1: { query: "single leg romanian deadlift", images: imgs("Romanian_Deadlift"), videoId: "Zfr6wizR8rs" },
  2: { query: "slow eccentric step down exercise", images: imgs("Dumbbell_Step_Ups"), videoId: "Or4C-UQ63Xc" },
  3: { query: "nordic hamstring curl", images: imgs("Natural_Glute_Ham_Raise"), videoId: "6NCN6kOagfY" },
  4: { query: "single leg glute bridge", images: imgs("Barbell_Glute_Bridge"), videoId: "3NXv0Nany-Q" },
  5: { query: "standing calf raise tibialis raise", images: imgs("Standing_Calf_Raises"), videoId: "k8ipHzKeAkQ" },
  6: { query: "side plank with leg raise", images: imgs("Side_Bridge"), videoId: "edTXNT-etYc" },
}

/** Recherche Google Images pré-remplie pour un exercice (lien externe). */
export function imagesSearchUrl(query: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + " exercise")}`
}

/** Recherche YouTube (démo vidéo) pré-remplie pour un exercice (lien externe). */
export function videoSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " demo")}`
}

/** URL d'embed YouTube (sans cookies) pour le lecteur en modal. */
export function videoEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
}
