import type { SyncStatus } from "@/hooks/useProgress"

/** Disquette d'enregistrement (sauvegarde). */
function DiskIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-7H7v7" />
      <path d="M7 3v5h7" />
    </svg>
  )
}

const LABEL: Record<SyncStatus, string> = {
  idle: "Aucune donnée à enregistrer",
  saved: "Progression enregistrée en base",
  pending: "Modifications non enregistrées — cliquer pour enregistrer",
  saving: "Enregistrement en cours…",
  error: "Échec de l'enregistrement — cliquer pour réessayer",
}

/**
 * Indicateur d'enregistrement de la progression en base. Vert = synchronisé, orange = des
 * changements restent à enregistrer (cliquable), rouge = échec (cliquable pour réessayer).
 */
export function SaveButton({
  status,
  onSave,
  variant,
}: {
  status: SyncStatus
  onSave: () => void
  variant: "d" | "m"
}) {
  const interactive = status === "pending" || status === "error"
  return (
    <button
      type="button"
      className={`save-btn save-btn-${variant} save-${status}`}
      onClick={interactive ? onSave : undefined}
      disabled={status === "saving"}
      aria-label={LABEL[status]}
      title={LABEL[status]}
    >
      <DiskIcon />
    </button>
  )
}
