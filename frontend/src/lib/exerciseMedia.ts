/**
 * Média par exercice (onglet Renfo) : galerie d'images + vidéo de démo embarquée.
 *
 * - `query`  : terme de recherche (anglais, **orienté poids du corps**) → liens externes
 *   « voir plus » (Images / YouTube).
 * - `images` : images de démo embarquées, base open-source free-exercise-db (CDN jsDelivr).
 *   On privilégie les entrées **`body only`** (poids du corps) — pas de barre ni d'haltère.
 *   Pour les mouvements sans équivalent poids du corps dans la base (RDL unijambe, mollets),
 *   on n'embarque **aucune** image (plutôt qu'une variante chargée trompeuse) et on s'appuie
 *   sur la recherche d'images poids-du-corps + la vidéo. URLs vérifiées (HTTP 200).
 * - `videoId`: démo YouTube **courte** (format Shorts ≈ < 60 s, « montre simplement l'exercice »),
 *   poids du corps. IDs vérifiés via oEmbed + page embed (HTTP 200, embed non bloqué).
 *   On embarque une vidéo précise car les pages de *résultats* refusent l'iframe.
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
  // 1. Single-Leg RDL — pas d'image poids du corps dans la base → recherche + vidéo seules.
  1: { query: "single leg romanian deadlift bodyweight", images: [], videoId: "8fvoRbInHg4" },
  // 2. Step-downs — image poids du corps (step-up bodyweight), vidéo step-down excentrique.
  2: { query: "eccentric step down bodyweight", images: imgs("Step-up_with_Knee_Raise"), videoId: "FAZpljV-n9w" },
  // 3. Nordic curl — image poids du corps (natural glute-ham raise), vidéo assistée à la bande.
  3: { query: "nordic hamstring curl band assisted", images: imgs("Natural_Glute_Ham_Raise"), videoId: "aUsSuA6qNys" },
  // 4. Pont fessier 1 jambe — image poids du corps exacte.
  4: { query: "single leg glute bridge bodyweight", images: imgs("Single_Leg_Glute_Bridge"), videoId: "cSzpMpxRnjc" },
  // 5. Mollets + tibial — pas d'image poids du corps dans la base → recherche + vidéo seules.
  5: { query: "calf raise tibialis raise bodyweight", images: [], videoId: "DYqdQdV3HEI" },
  // 6. Planche latérale + levé de jambe — image poids du corps.
  6: { query: "side plank leg raise bodyweight", images: imgs("Side_Bridge"), videoId: "Qqw2RYu4CSM" },
}

/** Recherche Google Images pré-remplie (poids du corps) pour un exercice (lien externe). */
export function imagesSearchUrl(query: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + " no equipment demonstration")}`
}

/** Recherche YouTube (démo courte) pré-remplie pour un exercice (lien externe). */
export function videoSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " short demo form")}`
}

/** URL d'embed YouTube (sans cookies) pour le lecteur en modal. */
export function videoEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
}
