const STATS = [
  { n: "13", l: "semaines" },
  { n: "740 m", l: "D+ visé" },
  { n: "2→4", l: "séances / sem" },
  { n: "2h15", l: "longue max" },
]

export function Hero() {
  return (
    <header className="relative pb-10 pt-[70px]">
      <div className="mb-[18px] text-[12px] font-extrabold uppercase tracking-[0.22em] text-ocre">
        Préparation · 13 semaines · Juin → Septembre
      </div>
      <h1 className="text-[clamp(44px,8vw,92px)] font-black text-ink">
        Trail <span className="italic text-moss">20 km</span>
        <br />
        740 m de D+
      </h1>
      <p className="mt-[18px] max-w-[620px] text-[18px] text-muted">
        Plan fusionné course + calisthénie. Construit autour de deux idées : ne jamais
        empiler le travail quadriceps, et entraîner la descente — celle qui détruit les
        cuisses si on l'ignore.
      </p>
      <div className="mt-[34px] flex flex-wrap gap-[14px]">
        {STATS.map((s) => (
          <div
            key={s.l}
            className="min-w-[120px] rounded-xl border border-line bg-panel px-[22px] py-4"
          >
            <div className="font-display text-[30px] font-black leading-none text-ocre">
              {s.n}
            </div>
            <div className="mt-[6px] text-[12px] uppercase tracking-[0.1em] text-muted">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </header>
  )
}
