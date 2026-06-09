import { type FormEvent, type ReactNode, useEffect, useState } from "react"

import { api } from "@/lib/api"

const JOURS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"]
const ACCES = ["côtes", "escaliers", "montagne", "plat"]
const MATERIEL: [string, string][] = [
  ["marche_box", "Marche / box"],
  ["bande_elastique", "Bande élastique"],
  ["barre_traction", "Barre de traction"],
]

const num = (s: string): number | null => (s.trim() === "" ? null : Number(s))
const str = (v: unknown): string => (v == null ? "" : String(v))
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : [])

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="intake-field">
      <span className="intake-lbl">
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
    </label>
  )
}

function Chips({
  value,
  onToggle,
  options,
}: {
  value: string[]
  onToggle: (v: string) => void
  options: [string, string][]
}) {
  return (
    <div className="intake-chips">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          className={"intake-chip" + (value.includes(v) ? " on" : "")}
          onClick={() => onToggle(v)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/** Questionnaire de profil (intake) → enregistré en JSON, base de la génération du programme. */
export function IntakeForm({ onSaved }: { onSaved: () => void }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [already, setAlready] = useState(false)

  const [prenom, setPrenom] = useState("")
  const [jours, setJours] = useState<string[]>(["mar", "jeu", "sam", "dim"])
  const [seancesMax, setSeancesMax] = useState("4")
  const [anteced, setAnteced] = useState("")
  // objectif
  const [distance, setDistance] = useState("")
  const [dplus, setDplus] = useState("")
  const [terrain, setTerrain] = useState("vallonné")
  const [dateCourse, setDateCourse] = useState("")
  const [techDesc, setTechDesc] = useState("roulante")
  // course
  const [volHebdo, setVolHebdo] = useState("")
  const [longueMax, setLongueMax] = useState("")
  const [freq, setFreq] = useState("")
  const [exp, setExp] = useState("débutant")
  const [acces, setAcces] = useState<string[]>(["côtes"])
  // calisthénie
  const [squat, setSquat] = useState("")
  const [pistol, setPistol] = useState("")
  const [pistolVar, setPistolVar] = useState("aucun")
  const [fente, setFente] = useState("")
  const [materiel, setMateriel] = useState<string[]>([])
  const [cheville, setCheville] = useState("3-5in")

  useEffect(() => {
    let cancelled = false
    api
      .getIntake()
      .then((d) => {
        if (cancelled || !d || Object.keys(d).length === 0) return
        setAlready(true)
        const o = (d.objectif ?? {}) as Record<string, unknown>
        const c = (d.course ?? {}) as Record<string, unknown>
        const k = (d.calisthenie ?? {}) as Record<string, unknown>
        setPrenom(str(d.prenom))
        if (arr(d.jours_dispo).length) setJours(arr(d.jours_dispo))
        setSeancesMax(str(d.seances_max_par_sem) || "4")
        setAnteced(arr(d.antecedents_blessure).join(", "))
        setDistance(str(o.distance_km))
        setDplus(str(o.dplus_m))
        if (o.terrain) setTerrain(String(o.terrain))
        setDateCourse(str(o.date_course))
        if (o.technicite_descente) setTechDesc(String(o.technicite_descente))
        setVolHebdo(str(c.volume_hebdo_km))
        setLongueMax(str(c.sortie_longue_max_km))
        setFreq(str(c.frequence_actuelle))
        if (c.experience_trail) setExp(String(c.experience_trail))
        if (arr(c.acces_terrain).length) setAcces(arr(c.acces_terrain))
        setSquat(str(k.squat_max))
        setPistol(str(k.pistol_max_par_jambe))
        if (k.pistol_variante) setPistolVar(String(k.pistol_variante))
        setFente(str(k.fente_max_par_jambe))
        if (arr(k.materiel).length) setMateriel(arr(k.materiel))
        if (k.mobilite_cheville) setCheville(String(k.mobilite_cheville))
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!distance || !dplus || !dateCourse || !volHebdo) {
      setError("Renseigne au moins la distance, le D+, la date de course et ton volume hebdo.")
      return
    }
    setSaving(true)
    setError(null)
    const data = {
      prenom: prenom.trim() || null,
      jours_dispo: jours,
      seances_max_par_sem: num(seancesMax),
      antecedents_blessure: anteced.split(",").map((x) => x.trim()).filter(Boolean),
      objectif: {
        distance_km: num(distance),
        dplus_m: num(dplus),
        terrain,
        date_course: dateCourse || null,
        technicite_descente: techDesc,
      },
      course: {
        volume_hebdo_km: num(volHebdo),
        sortie_longue_max_km: num(longueMax),
        frequence_actuelle: num(freq),
        experience_trail: exp,
        acces_terrain: acces,
      },
      calisthenie: {
        squat_max: num(squat),
        pistol_max_par_jambe: num(pistol),
        pistol_variante: pistolVar,
        fente_max_par_jambe: num(fente),
        materiel,
        mobilite_cheville: cheville,
      },
    }
    try {
      await api.putIntake(data)
      onSaved()
    } catch {
      setError("Enregistrement impossible. Réessaie.")
      setSaving(false)
    }
  }

  if (loading) return <div className="intake-loading">Chargement du profil…</div>

  return (
    <form className="intake" onSubmit={submit}>
      {already && (
        <div className="intake-note">Profil déjà enregistré — tu peux le modifier ci-dessous.</div>
      )}

      <div className="intake-sec">Ta course visée</div>
      <Field label="Distance" hint="km">
        <input className="intake-in" type="number" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="20" />
      </Field>
      <Field label="Dénivelé positif" hint="m D+">
        <input className="intake-in" type="number" inputMode="numeric" value={dplus} onChange={(e) => setDplus(e.target.value)} placeholder="740" />
      </Field>
      <Field label="Date de la course">
        <input className="intake-in" type="date" value={dateCourse} onChange={(e) => setDateCourse(e.target.value)} />
      </Field>
      <Field label="Terrain">
        <select className="intake-in" value={terrain} onChange={(e) => setTerrain(e.target.value)}>
          <option value="roulant">Roulant</option>
          <option value="vallonné">Vallonné</option>
          <option value="montagneux">Montagneux</option>
        </select>
      </Field>
      <Field label="Technicité de la descente">
        <select className="intake-in" value={techDesc} onChange={(e) => setTechDesc(e.target.value)}>
          <option value="roulante">Roulante</option>
          <option value="technique">Technique</option>
        </select>
      </Field>

      <div className="intake-sec">Ta forme actuelle</div>
      <Field label="Volume hebdo" hint="km/sem">
        <input className="intake-in" type="number" inputMode="decimal" value={volHebdo} onChange={(e) => setVolHebdo(e.target.value)} placeholder="20" />
      </Field>
      <Field label="Sortie longue max récente" hint="km">
        <input className="intake-in" type="number" inputMode="decimal" value={longueMax} onChange={(e) => setLongueMax(e.target.value)} placeholder="11" />
      </Field>
      <Field label="Séances course / semaine">
        <input className="intake-in" type="number" inputMode="numeric" value={freq} onChange={(e) => setFreq(e.target.value)} placeholder="2" />
      </Field>
      <Field label="Expérience trail">
        <select className="intake-in" value={exp} onChange={(e) => setExp(e.target.value)}>
          <option value="débutant">Débutant</option>
          <option value="intermédiaire">Intermédiaire</option>
          <option value="confirmé">Confirmé</option>
        </select>
      </Field>
      <Field label="Accès terrain">
        <Chips value={acces} onToggle={(v) => toggle(acces, setAcces, v)} options={ACCES.map((a) => [a, a])} />
      </Field>

      <div className="intake-sec">Pratique</div>
      <Field label="Jours dispo">
        <Chips value={jours} onToggle={(v) => toggle(jours, setJours, v)} options={JOURS.map((j) => [j, j])} />
      </Field>
      <Field label="Séances max / semaine">
        <input className="intake-in" type="number" inputMode="numeric" value={seancesMax} onChange={(e) => setSeancesMax(e.target.value)} placeholder="4" />
      </Field>
      <Field label="Antécédents de blessure" hint="séparés par des virgules">
        <input className="intake-in" value={anteced} onChange={(e) => setAnteced(e.target.value)} placeholder="genou droit, …" />
      </Field>
      <Field label="Prénom" hint="optionnel">
        <input className="intake-in" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Aurélien" />
      </Field>

      <div className="intake-sec">Force au poids du corps (max reps en 1 série)</div>
      <Field label="Air squats max">
        <input className="intake-in" type="number" inputMode="numeric" value={squat} onChange={(e) => setSquat(e.target.value)} placeholder="30" />
      </Field>
      <Field label="Pistol squats / jambe" hint="0 si aucun">
        <input className="intake-in" type="number" inputMode="numeric" value={pistol} onChange={(e) => setPistol(e.target.value)} placeholder="2" />
      </Field>
      <Field label="Variante pistol">
        <select className="intake-in" value={pistolVar} onChange={(e) => setPistolVar(e.target.value)}>
          <option value="aucun">Aucun</option>
          <option value="assisté">Assisté</option>
          <option value="box">Box pistol</option>
          <option value="complet">Complet</option>
        </select>
      </Field>
      <Field label="Fentes / Bulgarian par jambe">
        <input className="intake-in" type="number" inputMode="numeric" value={fente} onChange={(e) => setFente(e.target.value)} placeholder="12" />
      </Field>
      <Field label="Matériel dispo">
        <Chips value={materiel} onToggle={(v) => toggle(materiel, setMateriel, v)} options={MATERIEL} />
      </Field>
      <Field label="Mobilité cheville" hint="knee-to-wall, optionnel">
        <select className="intake-in" value={cheville} onChange={(e) => setCheville(e.target.value)}>
          <option value="<3in">&lt; 3 in</option>
          <option value="3-5in">3–5 in</option>
          <option value=">5in">&gt; 5 in</option>
        </select>
      </Field>

      {error && <div className="auth-error" role="alert">{error}</div>}
      <button type="submit" className="auth-submit" disabled={saving}>
        {saving ? "…" : already ? "Mettre à jour mon profil" : "Enregistrer mon profil"}
      </button>
    </form>
  )
}
