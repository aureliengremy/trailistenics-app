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
      <button type="button" className={`${variant}-ex-link`} onClick={() => setMode("images")}>
        <ImageIcon size={14} /> Image
      </button>
      <button type="button" className={`${variant}-ex-link`} onClick={() => setMode("video")}>
        <Play size={14} /> Vidéo
      </button>

      <Modal open={mode === "images"} onClose={() => setMode(null)} title={name}>
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
