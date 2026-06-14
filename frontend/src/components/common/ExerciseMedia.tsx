import { useState } from "react"
import { ImageIcon, Play } from "lucide-react"

import { Modal } from "@/components/common/Modal"
import {
  EXERCISE_MEDIA,
  imagesSearchUrl,
  videoEmbedUrl,
  videoSearchUrl,
} from "@/lib/exerciseMedia"

type Variant = "d" | "m"
type Mode = "images" | "video"

interface ExerciseLinksProps {
  order: number
  name: string
  variant: Variant
}

/**
 * Deux déclencheurs « Image » / « Vidéo » par exercice renfo. Chacun ouvre une modal qui
 * embarque le média : galerie d'images open-source, ou lecteur YouTube curé.
 * `order` = numéro de l'exercice (1–6).
 */
export function ExerciseLinks({ order, name, variant }: ExerciseLinksProps) {
  const media = EXERCISE_MEDIA[order]
  const [mode, setMode] = useState<Mode | null>(null)
  if (!media) return null

  return (
    <div className={`${variant}-ex-links`}>
      <button
        type="button"
        className={`${variant}-ex-link`}
        onClick={() => setMode("images")}
        aria-label={`Voir des images de ${name}`}
        title="Voir des images"
      >
        <ImageIcon size={16} />
        <span className="ex-link-label">Image</span>
      </button>
      <button
        type="button"
        className={`${variant}-ex-link`}
        onClick={() => setMode("video")}
        aria-label={`Voir une vidéo de ${name}`}
        title="Voir une vidéo"
      >
        <Play size={16} />
        <span className="ex-link-label">Vidéo</span>
      </button>

      <Modal open={mode === "images"} onClose={() => setMode(null)} title={name}>
        {media.images.length > 0 ? (
          <div className="modal-gallery">
            {media.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${name} — vue ${i + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            ))}
          </div>
        ) : (
          <p className="modal-note">
            Pas d'aperçu intégré au poids du corps pour cet exercice — ouvre la recherche d'images
            ci-dessous (filtrée « sans matériel »).
          </p>
        )}
        <a className="modal-ext" href={imagesSearchUrl(media.query)} target="_blank" rel="noreferrer">
          Ouvrir dans Google Images ↗
        </a>
      </Modal>

      <Modal open={mode === "video"} onClose={() => setMode(null)} title={name}>
        <div className="modal-video">
          {mode === "video" && (
            <iframe
              src={videoEmbedUrl(media.videoId)}
              title={`${name} — démo vidéo`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <a className="modal-ext" href={videoSearchUrl(media.query)} target="_blank" rel="noreferrer">
          Voir d'autres résultats sur YouTube ↗
        </a>
      </Modal>
    </div>
  )
}
