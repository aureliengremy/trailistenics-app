import { lazy, Suspense } from "react"

import type { LoadChartProps } from "@/components/common/LoadChart"

/**
 * Chargement paresseux du graphe (Recharts ≈ moitié du bundle). Recharts n'est
 * téléchargé qu'à l'ouverture de l'écran Progrès, pas au démarrage de l'app.
 * Import de type uniquement ici → n'embarque pas Recharts dans le bundle initial.
 */
const LoadChartInner = lazy(() =>
  import("@/components/common/LoadChart").then((m) => ({ default: m.LoadChart })),
)

export function LoadChart(props: LoadChartProps) {
  return (
    <Suspense fallback={<div className="chart-host" style={{ height: props.height }} />}>
      <LoadChartInner {...props} />
    </Suspense>
  )
}
