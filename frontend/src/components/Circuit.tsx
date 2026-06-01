import type { Exercise } from "@/types"

export function Circuit({ exercises }: { exercises: Exercise[] }) {
  return (
    <>
      <div className="grid gap-3">
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className="grid grid-cols-[42px_1fr_auto] items-center gap-4 rounded-xl border border-line bg-panel px-5 py-[18px] transition-colors hover:border-moss-dark hover:bg-panel2 max-[560px]:grid-cols-[36px_1fr] max-[560px]:gap-3"
          >
            <div className="font-display text-[26px] font-black text-moss-dark">
              {ex.order}
            </div>
            <div>
              <div className="text-[16px] font-bold">
                {ex.name}
                <span className="ml-2 inline-block rounded-[20px] bg-moss/15 px-[9px] py-[3px] text-[10px] font-extrabold uppercase tracking-[0.08em] text-moss">
                  {ex.target}
                </span>
              </div>
              <div className="mt-[3px] max-w-[560px] text-[13.5px] text-muted">
                {ex.rationale}
              </div>
            </div>
            <div className="whitespace-nowrap text-right font-display text-[15px] font-semibold text-ocre max-[560px]:col-start-2 max-[560px]:mt-[6px] max-[560px]:text-left">
              {ex.volume}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[14px] rounded-lg border-l-4 border-ocre bg-bg2 px-[18px] py-[14px] text-[14px] text-muted">
        <b className="text-ocre">Garde tes pistols / airborne squats</b> 1× par semaine si
        tu y tiens — mais pas le même jour que les step-downs, sinon double dose de
        quadriceps.
      </div>
    </>
  )
}
