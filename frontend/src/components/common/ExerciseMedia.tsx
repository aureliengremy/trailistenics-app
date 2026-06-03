import { EXERCISE_MEDIA, imagesSearchUrl, videoSearchUrl } from "@/lib/exerciseMedia"

type Variant = "d" | "m"

/**
 * Vignette de démo d'un exercice renfo (image embarquée free-exercise-db).
 * `order` = numéro de l'exercice (1–6). Se masque si l'image échoue à charger.
 */
export function ExerciseThumb({ order, variant }: { order: number; variant: Variant }) {
  const media = EXERCISE_MEDIA[order]
  if (!media?.imageUrl) return null
  return (
    <img
      className={`${variant}-ex-thumb`}
      src={media.imageUrl}
      alt=""
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none"
      }}
    />
  )
}

/** Liens « Images » / « Vidéo » de démo (recherches pré-remplies) pour un exercice renfo. */
export function ExerciseLinks({ order, variant }: { order: number; variant: Variant }) {
  const media = EXERCISE_MEDIA[order]
  if (!media) return null
  return (
    <div className={`${variant}-ex-links`}>
      <a
        className={`${variant}-ex-link`}
        href={imagesSearchUrl(media.query)}
        target="_blank"
        rel="noreferrer"
      >
        Images
      </a>
      <a
        className={`${variant}-ex-link`}
        href={videoSearchUrl(media.query)}
        target="_blank"
        rel="noreferrer"
      >
        Vidéo
      </a>
    </div>
  )
}
