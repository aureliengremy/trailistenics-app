# Totaux hebdo · D+ réalisé · courbe continue — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Détail de semaine « Le plan » avec totaux hebdo + avancement, saisie du D+ réalisé sur toutes les sorties (bonus inclus, désormais comptés), et courbe « Réalisé » du graphe Progrès continue (passé vide → 0).

**Architecture:** Tout est frontend. L'état `dpos` s'ajoute au blob JSON `user_progress` (aucun changement backend, rétro-compatible : champ absent = `{}`). Les helpers d'agrégation vivent dans `lib/plan.ts` ; les composants réutilisés (`KmField`, `WeekObjectives`, `BonusSection`) sont étendus ; les écrans desktop/mobile consomment.

**Tech Stack:** React 18 + Vite + TypeScript strict. Pas de framework de test front : vérification = `npx tsc --noEmit` + `npm run build` + preview.

## Global Constraints

- Spec : `docs/superpowers/specs/2026-07-11-totaux-hebdo-dpos-courbe-design.md`.
- **Aucun changement backend** (le blob JSON absorbe `dpos`).
- TypeScript strict (`tsc --noEmit` doit rester à 0 erreur après CHAQUE tâche).
- Textes UI en **français** ; classes CSS `.d-*` (desktop) / `.m-*` (mobile) ; CSS ajouté **en fin** de `src/index.css` (ne pas modifier les règles existantes, sauf mention explicite).
- Le « ✓ Réalisé » vert de `KmField` reste conditionné à **durée + km** (le D+ est optionnel).
- Répertoire de travail : `/Users/aureliengremy/Documents/CODE/trailistenics-app/frontend`.
- Commits atomiques par tâche, messages en français, suffixés :
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: État `dpos` + D+ des bonus (`useProgress`)

**Files:**
- Modify: `frontend/src/hooks/useProgress.ts`

**Interfaces:**
- Produces: `ProgressState.dpos: Record<string, number>` (clé `${semaine}-${séance}`, comme `km`) ; `ProgressApi.setDpos(k: string, val: number | null): void` ; `BonusSession.dpos?: number | null`.

- [ ] **Step 1: Ajouter `dpos` aux types**

Dans `BonusSession` (après `km: number | null`) :

```ts
  km: number | null
  /** Dénivelé positif réalisé (m), optionnel. */
  dpos?: number | null
```

Dans `ProgressState` (après le champ `dur`) :

```ts
  /** Durée réalisée (minutes), même clé que `km` (ex. "1-longue"). */
  dur: Record<string, number>
  /** Dénivelé positif réalisé (m), même clé que `km` (ex. "1-longue"). */
  dpos: Record<string, number>
```

Dans `ProgressApi` (après `setDur`) :

```ts
  /** Durée réalisée (minutes) d'une séance ; `null` efface. */
  setDur: (k: string, val: number | null) => void
  /** Dénivelé positif réalisé (m) d'une séance ; `null` efface. */
  setDpos: (k: string, val: number | null) => void
```

- [ ] **Step 2: Étendre `normalize`, `hasData`, `setDpos`, `reset`**

`normalize` — ajouter la ligne `dpos` :

```ts
function normalize(v: Partial<ProgressState> | null | undefined): ProgressState {
  return {
    weeks: v?.weeks ?? {},
    ex: v?.ex ?? {},
    sessions: v?.sessions ?? {},
    km: v?.km ?? {},
    dur: v?.dur ?? {},
    dpos: v?.dpos ?? {},
    bonus: v?.bonus ?? {},
    moved: v?.moved ?? {},
  }
}
```

`hasData` — ajouter `s.dpos` à la liste :

```ts
function hasData(s: ProgressState): boolean {
  return [s.weeks, s.ex, s.sessions, s.km, s.dur, s.dpos, s.bonus, s.moved].some(
    (m) => Object.keys(m).length > 0,
  )
}
```

Dans l'objet retourné par `useProgress`, après `setDur` (même patron que `setKm`) :

```ts
    setDpos: (k, val) =>
      setS((p) => {
        const dpos = { ...p.dpos }
        if (val == null || Number.isNaN(val)) delete dpos[k]
        else dpos[k] = val
        return { ...p, dpos }
      }),
```

`reset` — ajouter `dpos: {}` :

```ts
    reset: () => setS({ weeks: {}, ex: {}, sessions: {}, km: {}, dur: {}, dpos: {}, bonus: {}, moved: {} }),
```

- [ ] **Step 3: Vérifier**

Run: `cd /Users/aureliengremy/Documents/CODE/trailistenics-app/frontend && npx tsc --noEmit`
Expected: 0 erreur.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useProgress.ts
git commit -m "feat(suivi): état dpos (D+ réalisé) dans la progression + bonus"
```

---

### Task 2: Helpers d'agrégation + courbe continue (`lib/plan.ts`)

**Files:**
- Modify: `frontend/src/lib/plan.ts` (zone des helpers hebdo, lignes ~95–143)

**Interfaces:**
- Consumes: `ProgressState.dpos` et `BonusSession.dpos` (Task 1) ; `currentWeek(today?: Date): number` (existant, déclaré plus bas dans le fichier — le hoisting des `function` rend l'ordre sans importance).
- Produces: `weekPlannedDpos(w: PlanWeek): number` ; `weekRealizedDpos(w: PlanWeek, s: ProgressState): number | null` ; `plannedDposFor(sessKey: string, w: PlanWeek): number | null`. `weekRealizedKm` inclut désormais les km des bonus.

- [ ] **Step 1: Ajouter les sommes bonus et le D+ hebdo**

Après la fonction existante `sumWeek` (ligne ~100), insérer :

```ts
/** Somme des km des séances bonus de la semaine `n`. */
function sumBonusKm(s: ProgressState, n: number): number {
  return Object.values(s.bonus).reduce((a, b) => a + (b.week === n && b.km != null ? b.km : 0), 0)
}

/** Somme du D+ des séances bonus de la semaine `n`. */
function sumBonusDpos(s: ProgressState, n: number): number {
  return Object.values(s.bonus).reduce((a, b) => a + (b.week === n && b.dpos != null ? b.dpos : 0), 0)
}

/** D+ hebdo prévu (m) — le D+ planifié vit sur la sortie longue. */
export function weekPlannedDpos(w: PlanWeek): number {
  return w.dpos
}
```

- [ ] **Step 2: Inclure les bonus dans `weekRealizedKm` et créer `weekRealizedDpos`**

Remplacer `weekRealizedKm` par :

```ts
/** Distance hebdo réalisée (km) = somme des distances saisies + km des bonus. */
export function weekRealizedKm(w: PlanWeek, s: ProgressState): number | null {
  const t = sumWeek(s.km, w.n) + sumBonusKm(s, w.n)
  return t > 0 ? Math.round(t * 10) / 10 : null
}
```

Après `weekRealizedMin`, ajouter :

```ts
/** D+ hebdo réalisé (m) = somme des D+ saisis + D+ des bonus. */
export function weekRealizedDpos(w: PlanWeek, s: ProgressState): number | null {
  const t = sumWeek(s.dpos, w.n) + sumBonusDpos(s, w.n)
  return t > 0 ? Math.round(t) : null
}
```

- [ ] **Step 3: Helper `plannedDposFor` (repère de saisie par séance)**

À côté de `plannedKmFor` / `plannedMinFor` (lignes ~342–349), ajouter :

```ts
/** D+ prévu (m) d'une séance : seul l'objectif de la longue existe. */
export function plannedDposFor(sessKey: string, w: PlanWeek): number | null {
  return sessKey === "longue" ? w.dpos : null
}
```

- [ ] **Step 4: Helper `realizedForChart` + recâblage de `CHART_METRICS`**

Juste avant `CHART_METRICS`, ajouter :

```ts
/**
 * Réalisé pour le graphe : semaine passée sans saisie → 0 (la courbe plonge,
 * honnête) ; semaine en cours sans saisie → null (pas de plongeon un lundi
 * matin) ; semaine future → null (pas de courbe).
 */
function realizedForChart(
  sum: (w: PlanWeek, s: ProgressState) => number | null,
): (w: PlanWeek, s: ProgressState) => number | null {
  return (w, s) => {
    const cur = currentWeek()
    if (w.n > cur) return null
    const v = sum(w, s)
    return w.n < cur ? (v ?? 0) : v
  }
}
```

Remplacer `CHART_METRICS` par :

```ts
export const CHART_METRICS: ChartMetric[] = [
  {
    key: "duree", label: "Temps de course hebdo", short: "Temps hebdo", unit: "min", max: 380, color: "#7ba05b",
    planned: weekPlannedMin, realized: realizedForChart(weekRealizedMin),
  },
  {
    key: "distance", label: "Distance hebdo", short: "Distance hebdo", unit: "km", max: 55, color: "#c2562e",
    planned: weekPlannedKm, realized: realizedForChart(weekRealizedKm),
  },
  {
    key: "denivele", label: "Dénivelé positif hebdo", short: "Dénivelé D+", unit: "m D+", max: 780, color: "#d98a3d",
    planned: weekPlannedDpos, realized: realizedForChart(weekRealizedDpos),
  },
  {
    key: "seances", label: "Nombre de séances", short: "Volume hebdo", unit: "séances", max: 5, color: "#6fa8c4",
    planned: (w) => w.sea, realized: realizedForChart(weekRealizedSessions),
  },
]
```

(Note : l'ancienne simulation `realized: (w, s) => (s.sessions[\`${w.n}-longue\`] ? w.dpos : null)` disparaît.)

- [ ] **Step 5: Vérifier**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 6: Commit**

```bash
git add src/lib/plan.ts
git commit -m "feat(progres): D+ hebdo réalisé, bonus comptés, courbe Réalisé continue"
```

---

### Task 3: 3ᵉ champ « m D+ » dans `KmField` + câblage des repères

**Files:**
- Modify: `frontend/src/components/common/KmField.tsx`
- Modify: `frontend/src/components/common/DaySessionDetail.tsx` (KmField des sorties courues)
- Modify: `frontend/src/components/common/SessionMove.tsx` (KmField de `ArrivalCard`)
- Modify: `frontend/src/index.css` (append : retour à la ligne des 3 champs)

**Interfaces:**
- Consumes: `prog.setDpos(k, val)` et `prog.s.dpos` (Task 1) ; `plannedDposFor(sessKey, w)` (Task 2).
- Produces: prop `plannedDpos?: number | null` sur `KmField`.

- [ ] **Step 1: Étendre `KmField`**

Remplacer le contenu de `KmField.tsx` par :

```tsx
import type { ProgressApi } from "@/hooks/useProgress"

interface KmFieldProps {
  prog: ProgressApi
  /** Clé commune (km + durée + D+), ex. `${semaine}-longue`. */
  dkey: string
  /** Distance prévue (km) affichée en repère, si connue. */
  plannedKm?: number | null
  /** Durée prévue (min) affichée en repère, si connue. */
  plannedMin?: number | null
  /** D+ prévu (m) affiché en repère, si connu (la longue). */
  plannedDpos?: number | null
}

/**
 * Saisie du réalisé d'une sortie courue : **durée (min)** + **distance (km)** +
 * **D+ (m, optionnel)**. Bordure « validée » (vert) quand durée ET distance sont
 * saisies (le D+ ne conditionne pas la validation). Lit/écrit `prog.s.km`,
 * `prog.s.dur` et `prog.s.dpos` sur la même clé.
 */
export function KmField({ prog, dkey, plannedKm = null, plannedMin = null, plannedDpos = null }: KmFieldProps) {
  const km = prog.s.km[dkey]
  const dur = prog.s.dur[dkey]
  const dpos = prog.s.dpos[dkey]
  const kmOn = km != null && !Number.isNaN(km)
  const durOn = dur != null && !Number.isNaN(dur)
  // « Validé » (bordure verte) uniquement quand durée + distance sont remplies (D+ optionnel).
  const filled = kmOn && durOn
  const hint = [
    plannedMin != null ? `~${plannedMin} min` : null,
    plannedKm != null ? `~${plannedKm} km` : null,
    plannedDpos != null ? `~${plannedDpos} m D+` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className={"km-field" + (filled ? " filled" : "")}>
      <div>
        <div className="km-l">{filled ? "✓ Réalisé" : "Réalisé"}</div>
        {hint && <div className="km-hint">Prévu {hint}</div>}
      </div>
      <div className="km-inputs">
        <label className={"km-in" + (filled ? " on" : "")}>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={dur ?? ""}
            placeholder={plannedMin != null ? String(plannedMin) : "min"}
            onChange={(e) => {
              const raw = e.target.value
              prog.setDur(dkey, raw === "" ? null : Number(raw))
            }}
            aria-label="Durée réalisée (minutes)"
          />
          <span>min</span>
        </label>
        <label className={"km-in" + (filled ? " on" : "")}>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={km ?? ""}
            placeholder={plannedKm != null ? String(plannedKm) : "0"}
            onChange={(e) => {
              const raw = e.target.value
              prog.setKm(dkey, raw === "" ? null : Number(raw))
            }}
            aria-label="Distance réalisée (km)"
          />
          <span>km</span>
        </label>
        <label className={"km-in" + (filled ? " on" : "")}>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={dpos ?? ""}
            placeholder={plannedDpos != null ? String(plannedDpos) : "D+"}
            onChange={(e) => {
              const raw = e.target.value
              prog.setDpos(dkey, raw === "" ? null : Number(raw))
            }}
            aria-label="Dénivelé positif réalisé (mètres)"
          />
          <span>m D+</span>
        </label>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Câbler le repère D+ dans `DaySessionDetail`**

Dans `DaySessionDetail.tsx` : ajouter `plannedDposFor` à l'import depuis `@/lib/plan`, puis sur le `KmField` de la **branche sortie courue** (celle qui passe déjà `plannedKm={plannedKmFor(sess.key, w)}`), ajouter la prop :

```tsx
<KmField
  prog={prog}
  dkey={kk}
  plannedKm={plannedKmFor(sess.key, w)}
  plannedMin={plannedMinFor(sess.key, w)}
  plannedDpos={plannedDposFor(sess.key, w)}
/>
```

Les deux autres `KmField` du fichier (footing renfo, jour de repos « couru quand même ») restent sans `plannedDpos` (pas d'objectif D+) — ils affichent quand même le champ de saisie.

- [ ] **Step 3: Câbler le repère D+ dans `ArrivalCard` (`SessionMove.tsx`)**

Ajouter `plannedDposFor` à l'import depuis `@/lib/plan`, et sur le `KmField` d'`ArrivalCard` :

```tsx
<KmField
  prog={prog}
  dkey={kk}
  plannedKm={plannedKmFor(sessKey, w)}
  plannedMin={plannedMinFor(sessKey, w)}
  plannedDpos={plannedDposFor(sessKey, w)}
/>
```

- [ ] **Step 4: CSS — autoriser le retour à la ligne des 3 champs**

À la **fin** de `frontend/src/index.css`, ajouter :

```css
/* ===== KmField : 3 champs (min · km · D+) — retour à la ligne sur petit écran ===== */
.km-inputs { flex-wrap: wrap; justify-content: flex-end; }
```

- [ ] **Step 5: Vérifier**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 6: Commit**

```bash
git add src/components/common/KmField.tsx src/components/common/DaySessionDetail.tsx src/components/common/SessionMove.tsx src/index.css
git commit -m "feat(suivi): champ D+ réalisé sur toutes les sorties (KmField)"
```

---

### Task 4: Champ D+ des séances bonus (`BonusSection`)

**Files:**
- Modify: `frontend/src/components/common/BonusSection.tsx`

**Interfaces:**
- Consumes: `BonusSession.dpos?: number | null` (Task 1).

- [ ] **Step 1: Ajouter l'état et l'input D+**

Dans `BonusSection` : ajouter l'état après `km` :

```tsx
  const [km, setKm] = useState("")
  const [dpos, setDpos] = useState("")
```

Dans `add()`, inclure `dpos` et le réinitialiser :

```tsx
  function add() {
    prog.addBonus({
      week,
      day,
      type: type.trim() || "Séance bonus",
      km: km.trim() === "" ? null : Number(km),
      dpos: dpos.trim() === "" ? null : Number(dpos),
    })
    setType("")
    setKm("")
    setDpos("")
    setOpen(false)
  }
```

Dans la liste, après le span km :

```tsx
              {b.km != null && <span className="bonus-km">{b.km} km</span>}
              {b.dpos != null && <span className="bonus-km">{b.dpos} m D+</span>}
```

Dans le formulaire, après le label km (`bonus-km-in`) :

```tsx
          <label className={"bonus-km-in" + (dpos.trim() ? " filled" : "")}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={dpos}
              onChange={(e) => setDpos(e.target.value)}
              placeholder="0"
              aria-label="Dénivelé positif (mètres)"
            />
            <span>m D+</span>
          </label>
```

- [ ] **Step 2: Vérifier**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/BonusSection.tsx
git commit -m "feat(suivi): D+ sur les séances bonus (compté dans le réalisé hebdo)"
```

---

### Task 5: `WeekObjectives` passe à 4 mini-stats (+ D+)

**Files:**
- Modify: `frontend/src/components/common/WeekObjectives.tsx`
- Modify: `frontend/src/index.css` (append : 2×2 sur mobile)

**Interfaces:**
- Consumes: `weekPlannedDpos`, `weekRealizedDpos` (Task 2).

- [ ] **Step 1: Ajouter la stat D+**

Remplacer les imports et le tableau `items` :

```tsx
import type { ProgressApi } from "@/hooks/useProgress"
import {
  type PlanWeek,
  weekPlannedDpos,
  weekPlannedKm,
  weekPlannedMin,
  weekRealizedDpos,
  weekRealizedKm,
  weekRealizedMin,
  weekRealizedSessions,
} from "@/lib/plan"

/** 4 mini-stats hebdo « réalisé / prévu » : distance, temps de course, D+, séances. */
export function WeekObjectives({ w, prog, variant }: { w: PlanWeek; prog: ProgressApi; variant: "d" | "m" }) {
  const km = weekRealizedKm(w, prog.s) ?? 0
  const min = weekRealizedMin(w, prog.s) ?? 0
  const dpos = weekRealizedDpos(w, prog.s) ?? 0
  const sess = weekRealizedSessions(w, prog.s) ?? 0
  const items = [
    { real: km, plan: weekPlannedKm(w), unit: "km", label: "distance" },
    { real: min, plan: weekPlannedMin(w), unit: "min", label: "temps" },
    { real: dpos, plan: weekPlannedDpos(w), unit: "m", label: "D+" },
    { real: sess, plan: w.sea, unit: "", label: "séances" },
  ]
```

Le JSX de rendu (map sur `items`) est inchangé.

- [ ] **Step 2: CSS — 2×2 sur mobile**

À la **fin** de `frontend/src/index.css` :

```css
/* ===== WeekObjectives à 4 stats : grille 2×2 sur mobile ===== */
.m-wk-obj { flex-wrap: wrap; }
.m-wk-ob { flex: 1 1 calc(50% - 4px); }
```

- [ ] **Step 3: Vérifier**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 4: Commit**

```bash
git add src/components/common/WeekObjectives.tsx src/index.css
git commit -m "feat(suivi): objectif D+ dans les mini-stats hebdo (WeekObjectives)"
```

---

### Task 6: Totaux hebdo + avancement dans le détail de semaine (« Le plan »)

**Files:**
- Modify: `frontend/src/components/desktop/DesktopApp.tsx` (fonction `Plan`, zone `d-dboxes`, lignes ~274–292)
- Modify: `frontend/src/components/mobile/MobileApp.tsx` (fonction `WeekDetailM`, zone `m-dboxes`, lignes ~281–299)

**Interfaces:**
- Consumes: `weekPlannedKm`, `weekPlannedMin`, `weekPlannedDpos` (Task 2) ; `WeekObjectives` 4 stats (Task 5) ; `currentWeek` et la variable locale `cur` (déjà présentes dans les deux fonctions).

- [ ] **Step 1: Desktop — remplacer les demi-boxes et ajouter l'avancement**

Dans `DesktopApp.tsx`, ajouter `weekPlannedDpos`, `weekPlannedKm`, `weekPlannedMin` à l'import `@/lib/plan` (`WeekObjectives` est déjà importé pour l'écran Aujourd'hui).

Remplacer les deux `d-dbox half` (« Séances / sem », « D+ sur la longue ») — les cartes « Sortie longue » et « Qualité » sont conservées — par :

```tsx
          <div className="d-dbox half">
            <div className="d-dk">Distance totale</div>
            <div className="d-dv">{weekPlannedKm(w)} km</div>
          </div>
          <div className="d-dbox half">
            <div className="d-dk">Temps de course</div>
            <div className="d-dv">{weekPlannedMin(w)} min</div>
          </div>
          <div className="d-dbox half">
            <div className="d-dk">Dénivelé D+</div>
            <div className="d-dv">{weekPlannedDpos(w)} m</div>
          </div>
          <div className="d-dbox half">
            <div className="d-dk">Séances</div>
            <div className="d-dv">
              {w.sea} <span style={{ fontSize: 12, color: "var(--muted)" }}>dont renfo</span>
            </div>
          </div>
```

Juste après le `</div>` fermant `d-dboxes` (avant `<p className="d-detail-focus">`), insérer :

```tsx
        {w.n <= cur && (
          <>
            <div className="d-label" style={{ marginTop: 10 }}>
              Avancement
            </div>
            <WeekObjectives w={w} prog={prog} variant="d" />
          </>
        )}
```

- [ ] **Step 2: Mobile — même transformation dans `WeekDetailM`**

Dans `MobileApp.tsx`, ajouter `weekPlannedDpos`, `weekPlannedKm`, `weekPlannedMin` à l'import `@/lib/plan` (`WeekObjectives` déjà importé). Remplacer les deux `m-dbox half` par :

```tsx
        <div className="m-dbox half">
          <div className="m-dk">Distance totale</div>
          <div className="m-dv">{weekPlannedKm(w)} km</div>
        </div>
        <div className="m-dbox half">
          <div className="m-dk">Temps de course</div>
          <div className="m-dv">{weekPlannedMin(w)} min</div>
        </div>
        <div className="m-dbox half">
          <div className="m-dk">Dénivelé D+</div>
          <div className="m-dv">{weekPlannedDpos(w)} m</div>
        </div>
        <div className="m-dbox half">
          <div className="m-dk">Séances</div>
          <div className="m-dv">
            {w.sea} <span style={{ fontSize: 12, color: "var(--muted)" }}>dont renfo</span>
          </div>
        </div>
```

Juste après le `</div>` fermant `m-dboxes` (avant `<p className="m-note">{w.focus}</p>`), insérer :

```tsx
      {w.n <= cur && (
        <>
          <div className="m-label">Avancement</div>
          <WeekObjectives w={w} prog={prog} variant="m" />
        </>
      )}
```

- [ ] **Step 3: Vérifier**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 4: Commit**

```bash
git add src/components/desktop/DesktopApp.tsx src/components/mobile/MobileApp.tsx
git commit -m "feat(plan): totaux hebdo prévus + avancement dans le détail de semaine"
```

---

### Task 7: Vérification de bout en bout (preview)

**Files:** aucun (vérification), corrections mineures si besoin.

- [ ] **Step 1: Build final**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur ; 2 chunks (`index-*.js` + `LoadChart-*.js`).

- [ ] **Step 2: Parcours preview (frontend + backend démarrés via preview_start)**

Avec une session connectée (sinon demander à l'utilisateur de vérifier et lister les points) :
1. **Graphe** (onglet Progrès, métrique Distance) : la courbe Réalisé est continue de S1 à la semaine courante ; une semaine passée vide plonge à 0 ; aucun point isolé ; pas de courbe au-delà de la semaine courante.
2. **Métrique Dénivelé D+** : le réalisé reflète les D+ saisis (plus la simulation « longue cochée »).
3. **Saisie D+** : sur une sortie de la semaine courante (écran Aujourd'hui), saisir un D+ → la stat D+ de « Objectifs de la semaine » se met à jour ; le « ✓ Réalisé » vert reste conditionné à durée+km.
4. **Le plan** : détail d'une semaine passée/courante → 4 totaux prévus (Distance/Temps/D+/Séances dont renfo) + section « Avancement » ; une semaine future n'affiche pas d'avancement.
5. **Bonus** : ajouter une séance bonus avec km + D+ → compte dans l'avancement et le graphe.
6. **Rétro-compat** : la progression existante (sans `dpos`) se charge sans erreur console.
7. Mobile (375 px) : `WeekObjectives` en 2×2 ; les 3 champs de `KmField` restent lisibles (retour à la ligne).

- [ ] **Step 3: Console propre**

`preview_console_logs` (level error) : aucune erreur.

- [ ] **Step 4: Commit éventuel des retouches**

Si des retouches CSS/JSX ont été nécessaires :

```bash
git add -A && git commit -m "fix(suivi): retouches vérification (D+ / totaux hebdo / courbe)"
```
