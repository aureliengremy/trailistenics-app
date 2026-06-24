# Refonte « Aujourd'hui » → Tableau de bord semaine — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer l'écran « Aujourd'hui » (mobile + desktop) en tableau de bord hebdomadaire : en-tête semaine, objectifs hebdo prévu/réalisé, bande des 7 jours, et détail du jour déplié sur place.

**Architecture:** Recomposition front uniquement (aucun backend). On extrait le rendu « détail d'un jour » déjà présent dans `WeekDays` vers un composant partagé `DaySessionDetail`, on ajoute deux composants (`WeekObjectives`, `WeekStrip`), puis on reconstruit les fonctions `Today` de `MobileApp.tsx` et `DesktopApp.tsx`. Les helpers d'agrégation hebdo existants de `lib/plan.ts` sont exportés pour réutilisation.

**Tech Stack:** React 18 + Vite + TypeScript (strict), CSS porté (`.d-*` desktop / `.m-*` mobile) dans `src/index.css`, suivi via `hooks/useProgress.ts`. Pas de framework de test : **vérification = `npx tsc --noEmit` + `npm run build` + contrôle visuel dans le preview** (compte démo `demo.local@trailistenics.app` / `TrailDemo2026!`).

**Spec:** `docs/superpowers/specs/2026-06-24-aujourdhui-tableau-de-bord-design.md`

---

## Convention de vérification (vaut pour chaque tâche)

Ce projet n'a pas de tests unitaires. Le « test » d'une tâche = :
1. `cd frontend && npx tsc --noEmit` → **0 erreur**.
2. `npm run build` → **build OK**.
3. Quand c'est observable : preview (`mcp__Claude_Preview__preview_start` backend+frontend, login démo) + `preview_snapshot`/`preview_screenshot`.

Toutes les commandes s'exécutent depuis `frontend/`.

---

## File Structure

- **Créer** `frontend/src/components/common/DaySessionDetail.tsx` — rend le détail éditable **d'un seul jour** (carte séance + corps : renfo / sortie / repos, `KmField`, `MoveControls`, cartes reportées). Extrait de la boucle de `WeekDays`.
- **Créer** `frontend/src/components/common/WeekObjectives.tsx` — 3 mini-stats hebdo réalisé/prévu (distance, temps, séances).
- **Créer** `frontend/src/components/common/WeekStrip.tsx` — bande des 7 jours (état + sélection).
- **Modifier** `frontend/src/lib/plan.ts` — exporter les helpers hebdo (`weekPlannedKm/Min`, `weekRealizedKm/Min`, `weekRealizedSessions`) + ajouter `weekSessionsDone` si besoin.
- **Modifier** `frontend/src/components/common/WeekDays.tsx` — utiliser `DaySessionDetail` (comportement inchangé sur l'onglet « Le plan »).
- **Modifier** `frontend/src/components/mobile/MobileApp.tsx` — reconstruire `Today`.
- **Modifier** `frontend/src/components/desktop/DesktopApp.tsx` — reconstruire `Today`.
- **Modifier** `frontend/src/index.css` — styles `.wk-strip`, `.wk-obj`, et conteneurs dashboard.

---

## Task 1 : Exporter les helpers d'agrégation hebdo

**Files:**
- Modify: `frontend/src/lib/plan.ts`

Les fonctions `weekPlannedKm`, `weekPlannedMin`, `weekRealizedKm`, `weekRealizedMin`,
`weekRealizedSessions` existent déjà (privées, utilisées par `CHART_METRICS`). Les rendre
exportables pour `WeekObjectives`.

- [ ] **Step 1 : Ajouter `export` aux 5 fonctions**

Dans `frontend/src/lib/plan.ts`, préfixer par `export` chacune de ces déclarations (sans changer
leur corps) :

```ts
export function weekPlannedKm(w: PlanWeek): number {
export function weekPlannedMin(w: PlanWeek): number {
export function weekRealizedKm(w: PlanWeek, s: ProgressState): number | null {
export function weekRealizedMin(w: PlanWeek, s: ProgressState): number | null {
export function weekRealizedSessions(w: PlanWeek, s: ProgressState): number | null {
```

- [ ] **Step 2 : Vérifier le type-check**

Run: `npx tsc --noEmit`
Expected: 0 erreur (les fonctions étaient déjà utilisées en interne ; l'export n'ajoute rien de cassant).

- [ ] **Step 3 : Commit**

```bash
git add src/lib/plan.ts
git commit -m "refactor(plan): exporte les helpers d'agrégation hebdo (km/temps/séances)"
```

---

## Task 2 : Composant `DaySessionDetail` (détail d'un jour, extrait de WeekDays)

**Files:**
- Create: `frontend/src/components/common/DaySessionDetail.tsx`
- Modify: `frontend/src/components/common/WeekDays.tsx`

Objectif : isoler le rendu **d'un seul jour** (aujourd'hui réparti dans la boucle de `WeekDays`)
pour le réutiliser dans le nouvel écran Today. Comportement identique.

- [ ] **Step 1 : Lire WeekDays pour copier la logique d'un jour**

Run: `sed -n '1,135p' src/components/common/WeekDays.tsx`
Expected: voir la boucle `weekDays(w).map(({ dow, name, sess }) => …)` avec, par jour : `SessionCard`
(done/onToggleDone, renfo→`ExerciseChecklist`+`RenfoActions`+footing `KmField` ; repos→note +
« couru quand même » ; autre→note+`KmField`), `MoveControls`, puis les `ArrivalCard` du jour.

- [ ] **Step 2 : Créer `DaySessionDetail.tsx`**

```tsx
import { ExerciseChecklist } from "@/components/common/ExerciseChecklist"
import { KmField } from "@/components/common/KmField"
import { RenfoActions } from "@/components/common/RenfoActions"
import { SessionCard } from "@/components/common/SessionCard"
import { ArrivalCard, arrivalsForDay, MoveControls } from "@/components/common/SessionMove"
import type { ProgressApi } from "@/hooks/useProgress"
import {
  DAY_NAMES,
  isRestKey,
  kmKeyFor,
  type PlanExercise,
  type PlanWeek,
  plannedKmFor,
  plannedMinFor,
  RENFO_DOW,
  sessionForDay,
  weekDayDate,
} from "@/lib/plan"

const RENFO_FOOTING =
  "Footing facile sur jambes fatiguées — pas de côtes, allure conversation."

/** Détail éditable d'UN jour (lun..dim) : carte séance + corps + report + séances reportées arrivées. */
export function DaySessionDetail({
  w,
  dow,
  exercises,
  prog,
  variant,
  defaultOpen = false,
  onOpenRenfo,
}: {
  w: PlanWeek
  dow: number
  exercises: PlanExercise[]
  prog: ProgressApi
  variant: "d" | "m"
  defaultOpen?: boolean
  onOpenRenfo?: () => void
}) {
  const sess = sessionForDay(dow, w)
  const name = DAY_NAMES[dow]
  const isRest = isRestKey(sess.key)
  const sk = `${w.n}-${sess.key}`
  const kk = kmKeyFor(w.n, sess.key)
  const movedTo = prog.s.moved[sk]
  const done = !!prog.s.sessions[sk]
  const summary =
    movedTo != null
      ? `→ Reportée à ${DAY_NAMES[movedTo].toLowerCase()}`
      : isRest && done
        ? "Couru quand même"
        : sess.tag

  return (
    <div style={{ display: "contents" }}>
      <SessionCard
        color={sess.col}
        day={`${name} ${weekDayDate(w.n, dow).getDate()}`}
        label={sess.type}
        summary={summary}
        defaultOpen={defaultOpen}
        done={movedTo == null ? done : undefined}
        onToggleDone={
          movedTo != null
            ? undefined
            : dow === RENFO_DOW
              ? () => prog.setRenfoComplete(w.n, exercises.length, !done)
              : () => prog.toggleSession(sk)
        }
      >
        {movedTo != null ? (
          <div className="sess-body-note">Séance déplacée — retrouve-la sur le jour cible.</div>
        ) : dow === RENFO_DOW ? (
          <>
            <div className="renfo-h">Renforcement à faire</div>
            <ExerciseChecklist exercises={exercises} prog={prog} week={w.n} readOnly />
            <RenfoActions week={w.n} prog={prog} variant={variant} exerciseCount={exercises.length} onOpenRenfo={onOpenRenfo} />
            <div className="sess-footing">
              <div className="sess-footing-h">Puis · footing court</div>
              <div className="sess-body-note">{RENFO_FOOTING}</div>
              <KmField prog={prog} dkey={kk} plannedKm={plannedKmFor("renfo", w)} plannedMin={plannedMinFor("renfo", w)} />
            </div>
          </>
        ) : isRest ? (
          <>
            <div className="sess-body-note">{sess.detail}</div>
            {done ? (
              <KmField prog={prog} dkey={kk} />
            ) : (
              <div className="sess-moveline">
                <button type="button" className="sess-movebtn" onClick={() => prog.toggleSession(sk)}>
                  Pas été sage ? J'ai quand même couru →
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="sess-body-note">{sess.detail}</div>
            <KmField prog={prog} dkey={kk} plannedKm={plannedKmFor(sess.key, w)} plannedMin={plannedMinFor(sess.key, w)} />
          </>
        )}
        {!isRest && <MoveControls sk={sk} fromDow={dow} prog={prog} />}
      </SessionCard>
      {arrivalsForDay(w.n, dow, prog.s.moved).map((key) => (
        <ArrivalCard
          key={key}
          sessKey={key}
          w={w}
          dow={dow}
          dayLabel="↪ Reporté"
          prog={prog}
          exercises={exercises}
          defaultOpen={defaultOpen}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3 : Refactorer `WeekDays.tsx` pour utiliser `DaySessionDetail`**

Remplacer tout le corps du `weekDays(w).map(...)` (le `return ( <div key={dow} …> … </div> )`) par :

```tsx
export function WeekDays({ w, exercises, prog, openDow, variant = "d", onOpenRenfo }: WeekDaysProps) {
  return (
    <div className="sess-list">
      {weekDays(w).map(({ dow }) => (
        <DaySessionDetail
          key={dow}
          w={w}
          dow={dow}
          exercises={exercises}
          prog={prog}
          variant={variant}
          defaultOpen={dow === openDow}
          onOpenRenfo={onOpenRenfo}
        />
      ))}
    </div>
  )
}
```

Puis nettoyer les imports désormais inutilisés de `WeekDays.tsx` (garder `weekDays`, `PlanExercise`,
`PlanWeek`, `ProgressApi` ; retirer ceux qui ne servent plus : `ExerciseChecklist`, `KmField`,
`RenfoActions`, `SessionCard`, `ArrivalCard`/`arrivalsForDay`/`MoveControls`, `DAY_NAMES`,
`isRestKey`, `kmKeyFor`, `plannedKmFor`, `plannedMinFor`, `RENFO_DOW`, `weekDayDate`, et la const
`RENFO_FOOTING`). Ajouter `import { DaySessionDetail } from "@/components/common/DaySessionDetail"`.

- [ ] **Step 4 : Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur tsc, build OK. (tsc signalera tout import devenu inutilisé — les retirer jusqu'à 0 erreur.)

- [ ] **Step 5 : Vérif visuelle — l'onglet « Le plan » est inchangé**

Preview (login démo) → onglet « Le plan » → ouvrir une semaine → `preview_snapshot`.
Expected: la liste jour-par-jour s'affiche comme avant (Lundi … Dimanche, détails, report).

- [ ] **Step 6 : Commit**

```bash
git add src/components/common/DaySessionDetail.tsx src/components/common/WeekDays.tsx
git commit -m "refactor(plan): extrait DaySessionDetail (détail d'un jour) réutilisable"
```

---

## Task 3 : Composant `WeekObjectives` (objectifs hebdo prévu/réalisé)

**Files:**
- Create: `frontend/src/components/common/WeekObjectives.tsx`
- Modify: `frontend/src/index.css`

- [ ] **Step 1 : Créer `WeekObjectives.tsx`**

```tsx
import type { ProgressApi } from "@/hooks/useProgress"
import {
  type PlanWeek,
  weekPlannedKm,
  weekPlannedMin,
  weekRealizedKm,
  weekRealizedMin,
  weekRealizedSessions,
} from "@/lib/plan"

/** 3 mini-stats hebdo « réalisé / prévu » : distance, temps de course, séances. */
export function WeekObjectives({ w, prog, variant }: { w: PlanWeek; prog: ProgressApi; variant: "d" | "m" }) {
  const km = weekRealizedKm(w, prog.s) ?? 0
  const min = weekRealizedMin(w, prog.s) ?? 0
  const sess = weekRealizedSessions(w, prog.s) ?? 0
  const items = [
    { real: km, plan: weekPlannedKm(w), unit: "km", label: "distance" },
    { real: min, plan: weekPlannedMin(w), unit: "min", label: "temps" },
    { real: sess, plan: w.sea, unit: "", label: "séances" },
  ]
  return (
    <div className={`${variant}-wk-obj`}>
      {items.map((it) => (
        <div className={`${variant}-wk-ob`} key={it.label}>
          <div className={`${variant}-wk-ob-n`}>
            {it.real}
            <span>
              {" "}/{it.plan} {it.unit}
            </span>
          </div>
          <div className={`${variant}-wk-ob-l`}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2 : Ajouter le CSS (mobile + desktop) dans `src/index.css`**

Coller à la fin du fichier :

```css
/* ===== Tableau de bord Aujourd'hui : objectifs hebdo ===== */
.m-wk-obj, .d-wk-obj { display: flex; gap: 8px; }
.m-wk-ob, .d-wk-ob {
  flex: 1; background: var(--bg2); border: 1px solid var(--line);
  border-radius: 11px; padding: 9px 10px;
}
.m-wk-ob-n, .d-wk-ob-n { font-family: "Fraunces"; font-weight: 700; color: var(--ink); font-size: 17px; }
.m-wk-ob-n span, .d-wk-ob-n span { font-family: "Archivo"; font-weight: 600; font-size: 11px; color: var(--muted); }
.m-wk-ob-l, .d-wk-ob-l {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-top: 2px;
}
```

- [ ] **Step 3 : Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 4 : Commit**

```bash
git add src/components/common/WeekObjectives.tsx src/index.css
git commit -m "feat(suivi): composant WeekObjectives (distance/temps/séances prévu vs réalisé)"
```

---

## Task 4 : Composant `WeekStrip` (bande des 7 jours)

**Files:**
- Create: `frontend/src/components/common/WeekStrip.tsx`
- Modify: `frontend/src/index.css`

- [ ] **Step 1 : Créer `WeekStrip.tsx`**

État par jour : `done` (séance validée), `today`, `selected`, `moved` (séance déplacée),
`rest`, sinon `todo`. Icône selon le type (renfo/qualité/longue/footing/repos).

```tsx
import type { ProgressApi } from "@/hooks/useProgress"
import { DAY_NAMES, type PlanWeek, RENFO_DOW, sessionForDay, weekDayDate, weekDays } from "@/lib/plan"

const ICON: Record<string, string> = {
  renfo: "ti-barbell",
  qual: "ti-bolt",
  longue: "ti-mountain",
  easy: "ti-run",
  easyW: "ti-run",
  repos1: "ti-zzz",
  repos5: "ti-zzz",
}

/** Bande des 7 jours (lun→dim) de la semaine `w`. `selected`/`today` = dow (0=dim..6=sam). */
export function WeekStrip({
  w,
  prog,
  selected,
  today,
  onSelect,
  variant,
}: {
  w: PlanWeek
  prog: ProgressApi
  selected: number
  today: number
  onSelect: (dow: number) => void
  variant: "d" | "m"
}) {
  return (
    <div className={`${variant}-wk-strip`}>
      {weekDays(w).map(({ dow }) => {
        const sess = sessionForDay(dow, w)
        const sk = `${w.n}-${sess.key}`
        const done = !!prog.s.sessions[sk]
        const moved = prog.s.moved[sk] != null
        const isRest = sess.key.startsWith("repos")
        const cls = [
          `${variant}-wk-day`,
          dow === selected ? "sel" : "",
          dow === today ? "today" : "",
          done ? "done" : "",
          moved ? "moved" : "",
          isRest ? "rest" : "",
          dow === RENFO_DOW ? "renfo" : "",
        ]
          .filter(Boolean)
          .join(" ")
        return (
          <button
            type="button"
            key={dow}
            className={cls}
            style={!done && !isRest ? { ["--day-col" as string]: sess.col } : undefined}
            onClick={() => onSelect(dow)}
            aria-label={`${DAY_NAMES[dow]} ${weekDayDate(w.n, dow).getDate()} — ${sess.type}`}
          >
            <span className="wk-day-d">{DAY_NAMES[dow].slice(0, 3).toLowerCase()}</span>
            <span className="wk-day-ic">
              {done ? <i className="ti ti-check" /> : moved ? <i className="ti ti-arrow-right" /> : <i className={"ti " + (ICON[sess.key] ?? "ti-run")} />}
            </span>
            <span className="wk-day-n">{weekDayDate(w.n, dow).getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}
```

> Note : `sess.col` est une valeur CSS (`var(--moss)` / `var(--sky)` / `var(--muted)` / `var(--accent)`).
> On la passe en variable custom `--day-col` consommée par le CSS ci-dessous.

- [ ] **Step 2 : Ajouter le CSS dans `src/index.css`**

```css
/* ===== Tableau de bord Aujourd'hui : bande des 7 jours ===== */
.m-wk-strip, .d-wk-strip { display: flex; gap: 4px; }
.m-wk-day, .d-wk-day {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: transparent; border: 1px solid transparent; border-radius: 9px;
  padding: 6px 2px; cursor: pointer; color: var(--muted); transition: border-color .15s, background .15s;
}
.m-wk-day:hover, .d-wk-day:hover { background: var(--panel2); }
.m-wk-day.sel, .d-wk-day.sel { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
.wk-day-d { font-size: 10px; letter-spacing: .02em; }
.m-wk-day.today .wk-day-d, .d-wk-day.today .wk-day-d { color: var(--accent); font-weight: 700; }
.wk-day-n { font-size: 11px; color: var(--ink); font-family: "Fraunces"; font-weight: 600; }
.wk-day-ic {
  width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); font-size: 14px; color: var(--day-col, var(--muted));
  border-color: color-mix(in srgb, var(--day-col, var(--line)) 60%, var(--line));
}
.m-wk-day.rest .wk-day-ic, .d-wk-day.rest .wk-day-ic { color: var(--line); border-color: var(--line); }
.m-wk-day.done .wk-day-ic, .d-wk-day.done .wk-day-ic { background: var(--moss); border-color: var(--moss); color: var(--bg); }
.m-wk-day.moved .wk-day-ic, .d-wk-day.moved .wk-day-ic { color: var(--ocre); border-color: var(--ocre-d); }
```

> Tabler icons : déjà chargés ? Vérifier à l'étape 3. Si la webfont Tabler n'est PAS chargée dans
> `index.html`, remplacer les `<i class="ti …">` par les SVG du dossier `common/Icons.tsx` ou par
> une lettre (R/Q/L/F/·). **Étape 3 tranche ce point.**

- [ ] **Step 3 : Vérifier la disponibilité des icônes Tabler**

Run: `grep -rn "tabler\|ti ti-\|@tabler" src index.html package.json`
Expected: si aucune occurrence d'inclusion de la webfont Tabler → **les `<i class="ti">` ne
s'afficheront pas**. Dans ce cas, modifier `WeekStrip.tsx` pour utiliser des lettres :
`{done ? "✓" : moved ? "→" : LETTER[sess.key]}` avec
`const LETTER = { renfo:"R", qual:"Q", longue:"L", easy:"F", easyW:"F", repos1:"·", repos5:"·" }`.
(C'est l'option par défaut sûre — les icônes Tabler ne font pas partie de la stack du projet.)

- [ ] **Step 4 : Appliquer l'option lettres (sûre) dans `WeekStrip.tsx`**

Remplacer le bloc `<span className="wk-day-ic">…</span>` par :

```tsx
const LETTER: Record<string, string> = { renfo: "R", qual: "Q", longue: "L", easy: "F", easyW: "F", repos1: "·", repos5: "·" }
// …
<span className="wk-day-ic">{done ? "✓" : moved ? "→" : (LETTER[sess.key] ?? "·")}</span>
```

…et retirer la const `ICON`. Garder le CSS `.wk-day-ic` tel quel (il stylise un cercle/carré avec
la lettre centrée).

- [ ] **Step 5 : Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 6 : Commit**

```bash
git add src/components/common/WeekStrip.tsx src/index.css
git commit -m "feat(suivi): composant WeekStrip (bande des 7 jours, états + sélection)"
```

---

## Task 5 : Reconstruire `Today` (mobile)

**Files:**
- Modify: `frontend/src/components/mobile/MobileApp.tsx`
- Modify: `frontend/src/index.css`

Remplacer le corps de la fonction `Today` (mobile) par le tableau de bord. La signature
(`{ plan, prog, go, openRenfo }`) ne change pas.

- [ ] **Step 1 : Réécrire la fonction `Today` (mobile)**

```tsx
function Today({
  plan,
  prog,
  go,
  openRenfo,
}: {
  plan: PlanData
  prog: ProgressApi
  go: (t: TabId) => void
  openRenfo: (week: number) => void
}) {
  const today = new Date()
  const cur = currentWeek(today)
  const w = plan.weeks.find((x) => x.n === cur) ?? plan.weeks[0]
  const todayDow = today.getDay()
  const [selDow, setSelDow] = useState(todayDow)
  const sessDone = weekRealizedSessions(w, prog.s) ?? 0

  return (
    <div className="m-screen">
      <div className="m-greet">
        <div>
          <div className="m-kick">
            {DAY_NAMES[todayDow]} · {today.getDate()} {MONTHS_SHORT[today.getMonth()]} · S{cur}/{plan.weeks.length}
          </div>
          <h2 className="m-h2">Semaine {cur}</h2>
          <div className="m-bloc" style={{ color: w.color }}>
            {w.bloc} · {w.tag}
          </div>
        </div>
        <Ring pct={w.sea ? sessDone / w.sea : 0} size={64} variant="m">
          <div className="m-ring-n">
            {sessDone}
            <span>/{w.sea}</span>
          </div>
        </Ring>
      </div>

      <div className="m-label">Objectifs de la semaine</div>
      <WeekObjectives w={w} prog={prog} variant="m" />

      <div className="m-label">La semaine</div>
      <WeekStrip w={w} prog={prog} selected={selDow} today={todayDow} onSelect={setSelDow} variant="m" />

      <div className="m-label">{selDow === todayDow ? "Aujourd'hui" : "Ce jour-là"}</div>
      <div className="sess-list">
        <DaySessionDetail
          w={w}
          dow={selDow}
          exercises={plan.exercises}
          prog={prog}
          variant="m"
          defaultOpen
          onOpenRenfo={() => openRenfo(cur)}
        />
      </div>

      <BonusSection week={cur} prog={prog} />
    </div>
  )
}
```

- [ ] **Step 2 : Mettre à jour les imports de `MobileApp.tsx`**

Ajouter :
```tsx
import { DaySessionDetail } from "@/components/common/DaySessionDetail"
import { WeekObjectives } from "@/components/common/WeekObjectives"
import { WeekStrip } from "@/components/common/WeekStrip"
```
Dans l'import depuis `@/lib/plan`, ajouter `weekRealizedSessions`. Après suppression de l'ancien
corps, lancer tsc pour repérer les imports devenus inutilisés (`keySessions`, `sessionForDay`,
`isRestKey`, `kmKeyFor`, `tint`, `SessionCard`, `ExerciseChecklist`, `KmField`, `RenfoActions`,
`MoveControls`, `MovedSessions`, `plannedKmFor`, `plannedMinFor`, `PLANNED_DOW` s'ils ne servent
plus ailleurs dans le fichier) et les retirer.

- [ ] **Step 3 : Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 4 : Vérif visuelle (preview, viewport mobile)**

Preview (login démo), `preview_resize` preset `mobile`, onglet « Aujourd'hui » :
- en-tête semaine + anneau séances/`w.sea`,
- 3 objectifs hebdo,
- bande des 7 jours (aujourd'hui surligné),
- détail du jour sélectionné déplié,
- taper un autre jour → son détail s'ouvre.
`preview_snapshot` pour confirmer l'absence du bloc « 3 séances clés ».

- [ ] **Step 5 : Commit**

```bash
git add src/components/mobile/MobileApp.tsx src/index.css
git commit -m "feat(suivi): écran Aujourd'hui mobile en tableau de bord semaine"
```

---

## Task 6 : Reconstruire `Today` (desktop)

**Files:**
- Modify: `frontend/src/components/desktop/DesktopApp.tsx`
- Modify: `frontend/src/index.css`

Reconstruire la fonction `Today` (desktop, signature `ScreenProps` : `{ plan, prog, go, openRenfo }`).
Pleine largeur : en-tête + objectifs, bande des 7 jours, détail du jour dessous. Supprimer la
carte latérale `aside.d-side-card` et le bloc « 3 séances clés ».

- [ ] **Step 1 : Réécrire la fonction `Today` (desktop)**

```tsx
function Today({ plan, prog, go, openRenfo }: ScreenProps) {
  const today = new Date()
  const cur = currentWeek(today)
  const w = plan.weeks.find((x) => x.n === cur) ?? plan.weeks[0]
  const todayDow = today.getDay()
  const [selDow, setSelDow] = useState(todayDow)
  const sessDone = weekRealizedSessions(w, prog.s) ?? 0

  return (
    <div className="d-dash">
      <div className="d-dash-head">
        <Ring pct={w.sea ? sessDone / w.sea : 0} size={84}>
          <div className="d-ring-n">
            {sessDone}
            <span>/{w.sea}</span>
          </div>
        </Ring>
        <div className="d-dash-head-txt">
          <div className="d-sc-k">Semaine {cur} / {plan.weeks.length}</div>
          <div className="d-dash-h">
            {w.bloc} <span style={{ color: w.color }}>· {w.tag}</span>
          </div>
          <p className="d-sc-focus">{w.focus}</p>
        </div>
        <div className="d-dash-obj">
          <WeekObjectives w={w} prog={prog} variant="d" />
        </div>
      </div>

      <div className="d-label">La semaine</div>
      <WeekStrip w={w} prog={prog} selected={selDow} today={todayDow} onSelect={setSelDow} variant="d" />

      <div className="d-label">{selDow === todayDow ? "Aujourd'hui" : "Ce jour-là"}</div>
      <div className="sess-list">
        <DaySessionDetail
          w={w}
          dow={selDow}
          exercises={plan.exercises}
          prog={prog}
          variant="d"
          defaultOpen
          onOpenRenfo={() => openRenfo(cur)}
        />
      </div>

      <BonusSection week={cur} prog={prog} />
      <button className="d-link" onClick={() => go("plan")}>
        Voir tout le plan ›
      </button>
    </div>
  )
}
```

- [ ] **Step 2 : Imports `DesktopApp.tsx`**

Ajouter :
```tsx
import { DaySessionDetail } from "@/components/common/DaySessionDetail"
import { WeekObjectives } from "@/components/common/WeekObjectives"
import { WeekStrip } from "@/components/common/WeekStrip"
```
Ajouter `weekRealizedSessions` à l'import `@/lib/plan`. Puis lancer tsc et retirer les imports
devenus inutilisés dans `Today` (ex. `keySessions`, `SessionCard`, `MovedSessions`, `tint`,
`isRestKey`, `kmKeyFor`, `plannedKmFor`, `plannedMinFor`, `MoveControls`, `RenfoActions`,
`ExerciseChecklist`, `KmField`, `PLANNED_DOW`) **s'ils ne sont plus utilisés ailleurs** (ils le
sont peut-être encore dans `Renfo`/`Plan` — ne retirer que ceux que tsc signale).

- [ ] **Step 3 : Ajouter le CSS dashboard desktop dans `src/index.css`**

```css
/* ===== Tableau de bord Aujourd'hui (desktop) ===== */
.d-dash { max-width: 760px; }
.d-dash-head {
  display: grid; grid-template-columns: auto 1fr; gap: 18px 20px; align-items: center;
  background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 20px 22px; margin-bottom: 8px;
}
.d-dash-head-txt { min-width: 0; }
.d-dash-h { font-family: "Fraunces"; font-size: 22px; font-weight: 700; color: var(--ink); margin: 2px 0; }
.d-dash-obj { grid-column: 1 / -1; }
```

> Le `.d-wk-strip` et `.d-wk-day` (Task 4) + `.d-wk-obj` (Task 3) servent ici tels quels.

- [ ] **Step 4 : Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 erreur, build OK.

- [ ] **Step 5 : Vérif visuelle (preview, viewport desktop ≥ 1024px)**

Preview (login démo), `preview_resize` width 1280, onglet « Aujourd'hui » :
- en-tête (anneau + semaine + bloc + focus + 3 objectifs),
- bande des 7 jours pleine largeur,
- détail du jour dessous,
- plus de carte latérale ni de bloc « 3 séances clés ».
`preview_screenshot`.

- [ ] **Step 6 : Commit**

```bash
git add src/components/desktop/DesktopApp.tsx src/index.css
git commit -m "feat(suivi): écran Aujourd'hui desktop en tableau de bord semaine"
```

---

## Task 7 : Nettoyage final & vérification de bout en bout

**Files:**
- Modify: (selon ce que tsc/build signalent) `MobileApp.tsx`, `DesktopApp.tsx`

- [ ] **Step 1 : Chasse aux imports/variables inutilisés**

Run: `npx tsc --noEmit`
Expected: 0 erreur. tsc (strict) signale tout import/const inutilisé laissé par la refonte —
les retirer jusqu'à 0 erreur.

- [ ] **Step 2 : Build de production**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3 : Parcours complet dans le preview (login démo)**

Vérifier, mobile **et** desktop :
1. Aujourd'hui : sélection d'un jour → détail s'ouvre ; valider une séance → l'anneau + les
   objectifs hebdo se mettent à jour ; saisir km+durée → bordure verte + objectifs recalculés.
2. « Reporter à demain » sur un jour → marque ↪, la séance arrive le lendemain (carte « ↪ Reporté »).
3. Jour de repos → « Pas prévu ? J'ai couru » → saisie possible, compte dans les objectifs.
4. Renfo (mardi) → « Valider le renfo » coche les exos ; « Ouvrir la page Renfo » va sur la bonne semaine.
5. Onglet « Le plan » → jour-par-jour toujours fonctionnel (DaySessionDetail réutilisé).
6. Onglet « Progrès » → les chiffres hebdo correspondent aux objectifs de l'accueil.
`preview_console_logs` (niveau error) → aucune erreur.

- [ ] **Step 4 : Commit final si correctifs**

```bash
git add -A
git commit -m "chore(suivi): nettoyage imports après refonte Aujourd'hui"
```

---

## Notes hors périmètre (rappel spec §10)
- Nettoyage des autres `/13` codés en dur (sidebar globale, pager du Plan) = cleanup connexe,
  **séparé** de ce plan.
- Pas d'intégration Strava/Garmin, pas de drag-and-drop, pas de changement backend.
