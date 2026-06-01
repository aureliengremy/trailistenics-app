import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Technique() {
  return (
    <Accordion type="single" collapsible defaultValue="descente" className="w-full">
      <AccordionItem value="descente">
        <AccordionTrigger>La descente — ta priorité cachée</AccordionTrigger>
        <AccordionContent>
          <p className="mb-[10px] text-muted">
            Sur 740 D+, tu descends autant que tu montes. À partir de la semaine 5, sur
            chaque sortie longue :
          </p>
          <ul className="ml-[18px] list-disc space-y-[10px]">
            <li>
              <b className="text-moss">Choisis volontairement</b> des sentiers en pente
              pour courir la descente, pas juste y survivre.
            </li>
            <li>
              <b className="text-moss">Regarde 4–5 m devant</b> toi, pas tes pieds. Foulée
              courte, fréquence haute, bras un peu écartés.
            </li>
            <li>
              <b className="text-moss">Relâche</b> : crispé = freinage = cuisses détruites.
              On lâche les freins en confiance.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="montee">
        <AccordionTrigger>Montée — le power hiking</AccordionTrigger>
        <AccordionContent>
          <p className="mb-[10px] text-muted">
            Marcher dans le raide n'est pas un échec, c'est une technique. Mains sur les
            cuisses, on pousse. Souvent plus économe qu'un trottinement laborieux à 15 %.
          </p>
          <ul className="ml-[18px] list-disc space-y-[10px]">
            <li>
              <b className="text-moss">Teste les deux</b> sur tes longues pour trouver ton
              seuil de bascule marche/course.
            </li>
            <li>
              <b className="text-moss">Applique-le</b> en course : décidé à l'avance, pas
              découvert le jour J.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="jourj">
        <AccordionTrigger>Le jour J — gestion de course</AccordionTrigger>
        <AccordionContent>
          <ul className="ml-[18px] list-disc space-y-[10px]">
            <li>
              <b className="text-moss">Pars prudent</b> : le piège du 20 km est de cramer
              dans les premières montées. Découpe en tiers, garde du jus pour le dernier.
            </li>
            <li>
              <b className="text-moss">Nutrition</b> : une gorgée toutes les 10–15 min, un
              gel/barre toutes les 45 min. À tester dès le pic de charge.
            </li>
            <li>
              <b className="text-moss">Repère le parcours</b> : profil, ravitos, sections
              techniques.
            </li>
          </ul>
          <div className="mt-[14px] rounded-lg border-l-4 border-ocre bg-bg2 px-[18px] py-[14px] text-[14px] text-muted">
            <b className="text-ocre">Matériel — à valider en août, pas la veille :</b>{" "}
            chaussures de trail rodées (jamais neuves) et système d'hydratation testés sur
            les longues du pic de charge.
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
