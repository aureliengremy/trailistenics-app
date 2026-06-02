import { useEffect, useRef, useState } from "react"

/** Minuteur de récupération (1:00 / 1:30 / 2:00). variant pilote le préfixe de classe. */
export function RestTimer({ variant = "d" }: { variant?: "d" | "m" }) {
  const [left, setLeft] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => clearInterval(ref.current ?? undefined), [])

  const start = (s: number) => {
    if (ref.current) clearInterval(ref.current)
    setLeft(s)
    ref.current = setInterval(() => {
      setLeft((p) => {
        if (p <= 1) {
          if (ref.current) clearInterval(ref.current)
          return 0
        }
        return p - 1
      })
    }, 1000)
  }

  const stop = () => {
    if (ref.current) clearInterval(ref.current)
    setLeft(0)
  }

  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, "0")

  return (
    <div className={`${variant}-timer${left > 0 ? " run" : ""}`}>
      <div className={`${variant}-timer-d`}>
        {mm}:{ss}
      </div>
      <div className={`${variant}-timer-btns`}>
        <button onClick={() => start(60)}>1:00</button>
        <button onClick={() => start(90)}>1:30</button>
        <button onClick={() => start(120)}>2:00</button>
        {left > 0 && (
          <button className="stop" onClick={stop}>
            Stop
          </button>
        )}
      </div>
    </div>
  )
}
