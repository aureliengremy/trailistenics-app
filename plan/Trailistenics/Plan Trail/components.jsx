// ---------- COMPOSANTS PRINCIPAUX ----------
const { useState, useEffect, useRef, useMemo } = React;

/* ---- progression persistée ---- */
function useProgress() {
  const KEY = 'planTrail.progress.v1';
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || { weeks: {}, ex: {} }; }
    catch (e) { return { weeks: {}, ex: {} }; }
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }, [state]);
  return {
    state,
    toggleWeek: n => setState(s => ({ ...s, weeks: { ...s.weeks, [n]: !s.weeks[n] } })),
    setWeek: (n, v) => setState(s => ({ ...s, weeks: { ...s.weeks, [n]: v } })),
    toggleEx: i => setState(s => ({ ...s, ex: { ...s.ex, [i]: !s.ex[i] } })),
    reset: () => setState({ weeks: {}, ex: {} }),
  };
}

/* semaine courante d'après la date */
function currentWeek() {
  const start = new Date(2026, 5, 2); // 2 juin 2026 = début S1
  const diff = Math.floor((TODAY - start) / (7 * 24 * 3600 * 1000));
  return Math.max(1, Math.min(13, diff + 1));
}

/* ---- motif courbes de niveau (procédural) ---- */
function ContourMotif() {
  const rings = 9;
  const cx = 760, cy = 150, paths = [];
  for (let k = 0; k < rings; k++) {
    const rx = 90 + k * 78, ry = 60 + k * 52;
    const seg = 64; let d = '';
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const wob = 1 + 0.08 * Math.sin(a * 3 + k) + 0.05 * Math.sin(a * 5 - k);
      const x = cx + Math.cos(a) * rx * wob;
      const y = cy + Math.sin(a) * ry * wob;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    paths.push(React.createElement('path', {
      key: k, d, fill: 'none',
      stroke: k % 3 === 0 ? 'var(--accent)' : 'var(--line)',
      strokeWidth: k % 3 === 0 ? 1.4 : 1,
      opacity: k % 3 === 0 ? 0.30 : 0.5,
    }));
  }
  return React.createElement('svg', {
    className: 'contour', viewBox: '0 0 1100 360', preserveAspectRatio: 'xMaxYMid slice', 'aria-hidden': 'true'
  }, paths);
}

/* ---- anneau de progression ---- */
function ProgressRing({ pct, cur }) {
  const r = 34, c = 2 * Math.PI * r;
  return React.createElement('div', { className: 'pring' },
    React.createElement('svg', { viewBox: '0 0 88 88', width: 88, height: 88 },
      React.createElement('circle', { cx: 44, cy: 44, r, fill: 'none', stroke: 'var(--line)', strokeWidth: 7 }),
      React.createElement('circle', {
        cx: 44, cy: 44, r, fill: 'none', stroke: 'var(--moss)', strokeWidth: 7, strokeLinecap: 'round',
        strokeDasharray: c, strokeDashoffset: c * (1 - pct), transform: 'rotate(-90 44 44)',
        style: { transition: 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)' }
      })
    ),
    React.createElement('div', { className: 'pring-c' },
      React.createElement('div', { className: 'pring-n' }, Math.round(pct * 13)),
      React.createElement('div', { className: 'pring-d' }, '/ 13')
    )
  );
}

function Hero({ progress }) {
  const cur = currentWeek();
  const doneCount = Object.values(progress.state.weeks).filter(Boolean).length;
  const pct = doneCount / WEEKS.length;
  const stats = [
    { n: '13', l: 'semaines' }, { n: '740 m', l: 'D+ visé' },
    { n: '2→4', l: 'séances / sem' }, { n: '2h15', l: 'longue max' },
  ];
  return React.createElement('header', null,
    React.createElement(ContourMotif),
    React.createElement('div', { className: 'hero-top' },
      React.createElement('div', { className: 'hero-text' },
        React.createElement('div', { className: 'kicker' }, 'Préparation · 13 semaines · Juin → Septembre'),
        React.createElement('h1', null, 'Trail ', React.createElement('span', { className: 'em' }, '20 km'), React.createElement('br'), '740 m de D+'),
        React.createElement('p', { className: 'sub' }, "Plan fusionné course + calisthénie. Construit autour de deux idées : ne jamais empiler le travail quadriceps, et entraîner la descente — celle qui détruit les cuisses si on l'ignore.")
      ),
      React.createElement('div', { className: 'hero-prog' },
        React.createElement(ProgressRing, { pct, cur }),
        React.createElement('div', { className: 'hero-prog-txt' },
          React.createElement('div', { className: 'hp-k' }, 'Semaines validées'),
          React.createElement('div', { className: 'hp-cur' }, 'Tu es en ', React.createElement('b', null, 'semaine ' + cur))
        )
      )
    ),
    React.createElement('div', { className: 'stats' },
      stats.map((s, i) => React.createElement('div', { className: 'stat', key: i },
        React.createElement('div', { className: 'n' }, s.n),
        React.createElement('div', { className: 'l' }, s.l)
      ))
    )
  );
}

/* ---- timeline ---- */
function Timeline({ progress }) {
  const cur = currentWeek();
  const [sel, setSel] = useState(cur);
  const trackRef = useRef(null);
  useEffect(() => {
    const el = trackRef.current?.querySelector('.week.active');
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [sel]);

  return React.createElement('section', { id: 'timeline' },
    React.createElement(SecHead, { num: '02', title: 'Semaine par semaine' }),
    React.createElement('p', { className: 'sec-intro' }, "Clique sur une semaine pour voir le détail. Tu démarres à 2 sorties/semaine : la montée vers 4 est progressive pour éviter la blessure de reprise."),
    React.createElement('div', { className: 'tl-track', ref: trackRef },
      WEEKS.map(w => {
        const done = !!progress.state.weeks[w.n];
        return React.createElement('button', {
          key: w.n, className: 'week' + (w.n === sel ? ' active' : '') + (done ? ' done' : '') + (w.n === cur ? ' cur' : ''),
          'data-bloc': w.blocKey, onClick: () => setSel(w.n)
        },
          w.race ? React.createElement('span', { className: 'race' }, '🏁') : null,
          done ? React.createElement('span', { className: 'wcheck' }, '✓') : null,
          React.createElement('div', { className: 'wn' }, w.n),
          React.createElement('div', { className: 'wb' }, w.bloc),
          React.createElement('div', { className: 'bar', style: { width: (30 + w.duree / 2) + '%' } })
        );
      })
    ),
    React.createElement(WeekDetail, { n: sel, setSel, progress })
  );
}

function WeekDetail({ n, setSel, progress }) {
  const w = WEEKS.find(x => x.n === n);
  const c = BLOC_COLORS[w.blocKey];
  const done = !!progress.state.weeks[w.n];
  const box = (k, v) => React.createElement('div', { className: 'dbox' },
    React.createElement('div', { className: 'k' }, k), React.createElement('div', { className: 'v' }, v));
  return React.createElement('div', { className: 'detail', key: n, style: { borderLeftColor: c } },
    React.createElement('div', { className: 'detail-head' },
      React.createElement('div', null,
        React.createElement('span', { className: 'dtag', style: { background: c + '22', color: c } }, 'Semaine ' + w.n + ' · ' + w.date + ' · ' + BLOC_TAG[w.blocKey]),
        React.createElement('h3', null, w.bloc)
      ),
      React.createElement('div', { className: 'detail-nav' },
        React.createElement('button', { className: 'navbtn', disabled: n <= 1, onClick: () => setSel(n - 1), 'aria-label': 'Semaine précédente' }, '‹'),
        React.createElement('button', { className: 'navbtn', disabled: n >= 13, onClick: () => setSel(n + 1), 'aria-label': 'Semaine suivante' }, '›')
      )
    ),
    React.createElement('div', { className: 'dgrid' },
      box('Sortie longue · dimanche', w.longue),
      box('Qualité · jeudi', w.qual),
      box('Séances / semaine', w.sea)
    ),
    React.createElement('p', { className: 'dnote' }, w.focus),
    React.createElement('button', {
      className: 'donebtn' + (done ? ' on' : ''), onClick: () => progress.toggleWeek(w.n)
    }, done ? '✓ Semaine validée' : 'Marquer la semaine comme faite')
  );
}

/* ---- circuit renfo ---- */
function Circuit({ progress }) {
  const doneCount = EXERCISES.filter((_, i) => progress.state.ex[i]).length;
  return React.createElement('section', { id: 'circuit' },
    React.createElement(SecHead, { num: '03', title: 'La séance renfo · calisthénie × trail' }),
    React.createElement('p', { className: 'sec-intro' }, "Le mardi, en circuit avant un footing court. 2–3 tours, 1–2 min de récup. Axé chaîne postérieure et descente pour rééquilibrer ton profil calisthénie (déjà très quadriceps). C'est la seule séance lourde de jambes de la semaine."),
    React.createElement('div', { className: 'circuit-bar' },
      React.createElement('span', null, 'Circuit du jour'),
      React.createElement('span', { className: 'cb-count' }, doneCount + ' / ' + EXERCISES.length + ' fait')
    ),
    React.createElement('div', { className: 'circuit' },
      EXERCISES.map((e, i) => {
        const on = !!progress.state.ex[i];
        return React.createElement('button', { key: i, className: 'ex' + (on ? ' on' : ''), onClick: () => progress.toggleEx(i) },
          React.createElement('div', { className: 'idx' }, on ? '✓' : (i + 1)),
          React.createElement('div', { className: 'ex-mid' },
            React.createElement('div', { className: 'name' }, e.name, React.createElement('span', { className: 'chip' }, e.chip)),
            React.createElement('div', { className: 'why' }, e.why)
          ),
          React.createElement('div', { className: 'vol' }, e.vol)
        );
      })
    ),
    React.createElement('div', { className: 'warn' },
      React.createElement('b', null, 'Garde tes pistols / airborne squats'),
      ' 1× par semaine si tu y tiens — mais pas le même jour que les step-downs, sinon double dose de quadriceps.')
  );
}

/* ---- technique ---- */
function Technique() {
  return React.createElement('section', { id: 'technique' },
    React.createElement(SecHead, { num: '04', title: 'Technique & stratégie' }),
    React.createElement('p', { className: 'sec-intro' }, "Ce que les plans classiques oublient — et qui fait la différence à l'arrivée."),
    TECHNIQUE.map((t, i) =>
      React.createElement('details', { className: 'acc', key: i, open: i === 0 },
        React.createElement('summary', null, t.title, React.createElement('span', { className: 'plus' }, '+')),
        React.createElement('div', { className: 'body' },
          t.lead ? React.createElement('p', null, t.lead) : null,
          React.createElement('ul', null, t.items.map((it, j) =>
            React.createElement('li', { key: j, dangerouslySetInnerHTML: { __html: it } }))),
          t.warn ? React.createElement('div', { className: 'warn', dangerouslySetInnerHTML: { __html: t.warn } }) : null
        )
      )
    )
  );
}

/* ---- en-tête de section ---- */
function SecHead({ num, title }) {
  return React.createElement('div', { className: 'sec-head' },
    React.createElement('span', { className: 'sec-num' }, num),
    React.createElement('h2', null, title));
}

Object.assign(window, { useProgress, currentWeek, Hero, Timeline, Circuit, Technique, SecHead, LoadChart: window.LoadChart });
