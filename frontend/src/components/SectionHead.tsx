interface SectionHeadProps {
  num: string
  title: string
  intro: string
}

export function SectionHead({ num, title, intro }: SectionHeadProps) {
  return (
    <>
      <div className="mb-2 flex items-baseline gap-4">
        <span className="font-display text-[20px] font-black text-moss-dark">{num}</span>
        <h2 className="text-[clamp(28px,4vw,42px)] font-black">{title}</h2>
      </div>
      <p className="mb-[30px] mt-[14px] max-w-[680px] text-[16px] text-muted">{intro}</p>
    </>
  )
}
