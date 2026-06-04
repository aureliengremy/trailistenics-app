import { EX_PER_CIRCUIT } from "@/lib/stats"

interface RealizedBarsProps {
  /** Exercices réalisés par semaine (0–6). */
  data: { n: number; count: number }[]
  /** Semaines dans le périmètre sélectionné (mises en avant). */
  scope: Set<number>
  /** Semaine en cours (repère). */
  cur: number
}

/**
 * Graphe à barres « exercices renfo réalisés par semaine » (0–6).
 * Les semaines hors périmètre sont atténuées ; la semaine en cours est repérée.
 */
export function RealizedBars({ data, scope, cur }: RealizedBarsProps) {
  return (
    <div className="rb">
      {data.map(({ n, count }) => {
        const inScope = scope.has(n)
        const pct = (count / EX_PER_CIRCUIT) * 100
        return (
          <div
            key={n}
            className={"rb-col" + (inScope ? " in" : "") + (n === cur ? " cur" : "")}
            title={`Semaine ${n} · ${count}/${EX_PER_CIRCUIT} exercices`}
          >
            <div className="rb-track">
              <div className="rb-fill" style={{ height: pct + "%" }}>
                {count > 0 && <span className="rb-val">{count}</span>}
              </div>
            </div>
            <div className="rb-x">{n}</div>
          </div>
        )
      })}
    </div>
  )
}
