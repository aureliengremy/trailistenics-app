import { Circuit } from "@/components/Circuit"
import { Hero } from "@/components/Hero"
import { LoadChart } from "@/components/LoadChart"
import { SectionHead } from "@/components/SectionHead"
import { Technique } from "@/components/Technique"
import { Timeline } from "@/components/Timeline"
import { usePlanData } from "@/hooks/usePlanData"

export default function App() {
  const { weeks, exercises, loading, error } = usePlanData()

  return (
    <div className="relative z-[1] mx-auto max-w-[1100px] px-[22px]">
      <Hero />

      {loading && <Status>Chargement du plan…</Status>}
      {error && (
        <Status>
          <span className="text-rust">Impossible de charger le plan.</span> Vérifie que
          l'API tourne sur <code className="text-ocre">{import.meta.env.VITE_API_URL ?? "http://localhost:8000"}</code>.
          <br />
          <span className="text-[13px]">({error})</span>
        </Status>
      )}

      {!loading && !error && (
        <>
          <section className="py-[46px]">
            <SectionHead
              num="01"
              title="La courbe de charge"
              intro="Le volume monte par paliers avec deux semaines allégées (4 et 8) pour assimiler — c'est là que le corps progresse. La sortie « choc » de la semaine 11 simule le D+ de la course, puis l'affûtage te laisse arriver frais."
            />
            <LoadChart weeks={weeks} />
          </section>

          <section className="py-[46px]">
            <SectionHead
              num="02"
              title="Semaine par semaine"
              intro="Clique sur une semaine pour voir le détail. Tu démarres à 2 sorties/semaine : la montée vers 4 est progressive pour éviter la blessure de reprise."
            />
            <Timeline weeks={weeks} />
          </section>

          <section className="py-[46px]">
            <SectionHead
              num="03"
              title="La séance renfo · calisthénie × trail"
              intro="Le mardi, en circuit avant un footing court. 2–3 tours, 1–2 min de récup. Axé chaîne postérieure et descente pour rééquilibrer ton profil calisthénie (déjà très quadriceps). C'est la seule séance lourde de jambes de la semaine."
            />
            <Circuit exercises={exercises} />
          </section>

          <section className="py-[46px]">
            <SectionHead
              num="04"
              title="Technique & stratégie"
              intro="Ce que les plans classiques oublient — et qui fait la différence à l'arrivée."
            />
            <Technique />
          </section>
        </>
      )}

      <footer className="mt-[30px] border-t border-line py-[50px] text-[14px] italic text-muted">
        Écoute les signaux : une douleur articulaire qui persiste prime sur le plan. Mieux
        vaut arriver un peu sous-entraîné et frais que cuit ou blessé.
      </footer>
    </div>
  )
}

function Status({ children }: { children: React.ReactNode }) {
  return <div className="py-12 text-[16px] text-muted">{children}</div>
}
