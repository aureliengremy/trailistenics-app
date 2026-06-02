// ---------- APP DESKTOP · SUIVI DE TRAINING ----------
const { useState: dState, useEffect: dEffect, useRef: dRef } = React;

const D_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const D_MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function useSharedProgress() {
  const KEY = 'planTrail.progress.v1';
  const [s, setS] = dState(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY)) || {}; return { weeks: v.weeks || {}, ex: v.ex || {}, sessions: v.sessions || {} }; }
    catch (e) { return { weeks: {}, ex: {}, sessions: {} }; }
  });
  dEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }, [s]);
  return {
    s,
    toggleWeek: n => setS(p => ({ ...p, weeks: { ...p.weeks, [n]: !p.weeks[n] } })),
    toggleEx: i => setS(p => ({ ...p, ex: { ...p.ex, [i]: !p.ex[i] } })),
    toggleSession: k => setS(p => ({ ...p, sessions: { ...p.sessions, [k]: !p.sessions[k] } })),
    resetEx: () => setS(p => ({ ...p, ex: {} })),
  };
}
function curWeek() {
  const start = new Date(2026, 5, 2);
  const diff = Math.floor((TODAY - start) / (7 * 864e5));
  return Math.max(1, Math.min(13, diff + 1));
}
function sessionForDay(d, w) {
  switch (d) {
    case 0: return { type: 'Sortie longue', detail: w.longue, tag: 'Endurance', col: 'var(--moss)', key: 'longue' };
    case 1: return { type: 'Repos', detail: 'Mobilité, étirements légers. On laisse le corps assimiler.', tag: 'Récup', col: 'var(--muted)', key: 'repos' };
    case 2: return { type: 'Renfo + footing', detail: 'Circuit 6 exos · 2–3 tours, puis 20–30 min footing facile.', tag: 'Force', col: 'var(--sky)', key: 'renfo' };
    case 3: return { type: 'Footing court', detail: '30–40 min très facile, optionnel selon la forme.', tag: 'Souple', col: 'var(--muted)', key: 'easy' };
    case 4: return { type: 'Séance qualité', detail: w.qual, tag: 'Intensité', col: 'var(--accent)', key: 'qual' };
    case 5: return { type: 'Repos', detail: 'Récupération avant le week-end de volume.', tag: 'Récup', col: 'var(--muted)', key: 'repos' };
    default: return { type: 'Footing libre', detail: '40–50 min en nature, allure facile, plaisir.', tag: 'Souple', col: 'var(--moss)', key: 'easyW' };
  }
}

function Ring({ pct, size = 64, stroke = 7, color = 'var(--moss)', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="d-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div className="d-ring-c">{children}</div>
    </div>
  );
}
function Check({ on, col = 'var(--moss)', size = 26 }) {
  return (
    <span className={'d-check' + (on ? ' on' : '')} style={{ width: size, height: size, ...(on ? { background: col, borderColor: col } : {}) }}>
      {on ? <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 14 14"><path d="M3 7.4 5.8 10 11 4.2" fill="none" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
    </span>
  );
}

const NavIcon = ({ name, on }) => {
  const c = on ? 'var(--accent)' : 'var(--muted)';
  const ic = {
    today: <g fill="none" stroke={c} strokeWidth="1.9"><circle cx="11" cy="11" r="4" /><circle cx="11" cy="11" r="8.5" opacity=".5" /></g>,
    plan: <g fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round"><rect x="3" y="4.5" width="16" height="14.5" rx="2.5" /><path d="M3 8.5h16M7.5 2.5v4M14.5 2.5v4" /></g>,
    renfo: <g fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round"><path d="M4 8v6M18 8v6M4 11h14M1.5 9.5v3M20.5 9.5v3" /></g>,
    progres: <g fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14l4-4 3.5 3L18 6" /><path d="M14 6h4v4" /></g>,
  };
  return <svg width="22" height="22" viewBox="0 0 22 22">{ic[name]}</svg>;
};

/* ---------- AUJOURD'HUI ---------- */
function Today({ prog, go }) {
  const cur = curWeek();
  const w = WEEKS.find(x => x.n === cur);
  const dow = TODAY.getDay();
  const sess = sessionForDay(dow, w);
  const todayKey = cur + '-' + sess.key;
  const isRest = sess.key === 'repos';
  const planned = [
    { d: 'Mardi', label: 'Renfo + footing', detail: 'Circuit 6 exos, chaîne postérieure', k: cur + '-renfo', col: 'var(--sky)' },
    { d: 'Jeudi', label: 'Séance qualité', detail: w.qual, k: cur + '-qual', col: 'var(--accent)' },
    { d: 'Dimanche', label: 'Sortie longue', detail: w.longue, k: cur + '-longue', col: 'var(--moss)' },
  ];
  const doneCount = planned.filter(p => prog.s.sessions[p.k]).length;
  return (
    <div className="d-grid-2">
      <div>
        <div className="d-label">À faire aujourd'hui · {D_DAYS[dow]}</div>
        <div className={'d-today' + (isRest ? ' rest' : '')}>
          <div className="d-today-l">
            <span className="d-tag" style={{ background: sess.col + '22', color: sess.col }}>{sess.tag}</span>
            <div className="d-today-type">{sess.type}</div>
            <div className="d-today-detail">{sess.detail}</div>
            <div className="d-today-actions">
              {!isRest && (
                <button className={'d-btn' + (prog.s.sessions[todayKey] ? ' done' : '')} onClick={() => prog.toggleSession(todayKey)}>
                  {prog.s.sessions[todayKey] ? '✓ Séance terminée' : 'Marquer comme terminée'}
                </button>
              )}
              {sess.key === 'renfo' && <button className="d-btn ghost" onClick={() => go('renfo')}>Ouvrir le circuit ›</button>}
            </div>
          </div>
        </div>

        <div className="d-label">Les 3 séances clés de la semaine</div>
        <div className="d-list">
          {planned.map(p => {
            const on = !!prog.s.sessions[p.k];
            return (
              <button key={p.k} className="d-row" onClick={() => prog.toggleSession(p.k)}>
                <span className="d-row-dot" style={{ background: p.col }} />
                <div className="d-row-mid">
                  <div className="d-row-t">{p.d} · {p.label}</div>
                  <div className="d-row-d">{p.detail}</div>
                </div>
                <Check on={on} col={p.col} />
              </button>
            );
          })}
        </div>
      </div>

      <aside className="d-side-card">
        <div className="d-sc-head">
          <div>
            <div className="d-sc-k">Semaine en cours</div>
            <div className="d-sc-n">{cur} <span>/ 13</span></div>
            <div className="d-sc-bloc" style={{ color: BLOC_COLORS[w.blocKey] }}>{w.bloc} · {BLOC_TAG[w.blocKey]}</div>
          </div>
          <Ring pct={doneCount / 3} size={76} color="var(--moss)"><div className="d-ring-n">{doneCount}<span>/3</span></div></Ring>
        </div>
        <p className="d-sc-focus">{w.focus}</p>
        <div className="d-sc-stats">
          <div><div className="d-scs-k">Sortie longue</div><div className="d-scs-v">{w.longue}</div></div>
          <div><div className="d-scs-k">Qualité</div><div className="d-scs-v">{w.qual}</div></div>
          <div><div className="d-scs-k">Séances</div><div className="d-scs-v">{w.sea} / sem · {w.dpos} m D+</div></div>
        </div>
        <button className="d-link" onClick={() => go('plan')}>Voir tout le plan ›</button>
      </aside>
    </div>
  );
}

/* ---------- PLAN ---------- */
function Plan({ prog }) {
  const cur = curWeek();
  const [sel, setSel] = dState(cur);
  const w = WEEKS.find(x => x.n === sel);
  const col = BLOC_COLORS[w.blocKey];
  const done = !!prog.s.weeks[w.n];
  let lastBloc = null;
  return (
    <div className="d-grid-plan">
      <div className="d-weeks">
        {WEEKS.map(x => {
          const head = x.bloc !== lastBloc; lastBloc = x.bloc;
          const dn = !!prog.s.weeks[x.n];
          const c = BLOC_COLORS[x.blocKey];
          return (
            <React.Fragment key={x.n}>
              {head && <div className="d-bloc-head" style={{ color: c }}>{x.bloc}</div>}
              <button className={'d-wk' + (x.n === sel ? ' sel' : '') + (x.n === cur ? ' cur' : '')} onClick={() => setSel(x.n)}>
                <span className="d-wk-bar" style={{ background: c }} />
                <div className="d-wk-n" style={{ color: dn ? 'var(--moss)' : 'var(--ink)' }}>
                  {dn ? <svg width="16" height="16" viewBox="0 0 14 14"><path d="M3 7.4 5.8 10 11 4.2" fill="none" stroke="var(--moss)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : x.n}
                </div>
                <div className="d-wk-mid">
                  <div className="d-wk-t">{x.race ? '🏁 ' : ''}S{x.n} · {x.date}{x.n === cur ? ' · en cours' : ''}</div>
                  <div className="d-wk-d">{x.longue}</div>
                </div>
                <div className="d-wk-dpos">{x.dpos}<span>m D+</span></div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <aside className="d-detail">
        <span className="d-tag" style={{ background: col + '22', color: col }}>Semaine {w.n} · {w.date} · {BLOC_TAG[w.blocKey]}</span>
        <h3 className="d-detail-h">{w.bloc}</h3>
        <div className="d-dboxes">
          <div className="d-dbox"><div className="d-dk">Sortie longue · dimanche</div><div className="d-dv">{w.longue}</div></div>
          <div className="d-dbox"><div className="d-dk">Qualité · jeudi</div><div className="d-dv">{w.qual}</div></div>
          <div className="d-dbox half"><div className="d-dk">Séances / sem</div><div className="d-dv">{w.sea}</div></div>
          <div className="d-dbox half"><div className="d-dk">D+ sur la longue</div><div className="d-dv">{w.dpos} m</div></div>
        </div>
        <p className="d-detail-focus">{w.focus}</p>
        <div className="d-detail-foot">
          <button className={'d-btn' + (done ? ' done' : '')} onClick={() => prog.toggleWeek(w.n)}>
            {done ? '✓ Semaine validée' : 'Marquer la semaine comme faite'}
          </button>
          <div className="d-pager">
            <button disabled={sel <= 1} onClick={() => setSel(sel - 1)}>‹</button>
            <button disabled={sel >= 13} onClick={() => setSel(sel + 1)}>›</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ---------- minuteur ---------- */
function RestTimer() {
  const [left, setLeft] = dState(0);
  const ref = dRef(null);
  dEffect(() => () => clearInterval(ref.current), []);
  const start = s => { clearInterval(ref.current); setLeft(s); ref.current = setInterval(() => setLeft(p => { if (p <= 1) { clearInterval(ref.current); return 0; } return p - 1; }), 1000); };
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');
  return (
    <div className={'d-timer' + (left > 0 ? ' run' : '')}>
      <div className="d-timer-d">{mm}:{ss}</div>
      <div className="d-timer-btns">
        <button onClick={() => start(60)}>1:00</button>
        <button onClick={() => start(90)}>1:30</button>
        <button onClick={() => start(120)}>2:00</button>
        {left > 0 && <button className="stop" onClick={() => { clearInterval(ref.current); setLeft(0); }}>Stop</button>}
      </div>
    </div>
  );
}

/* ---------- RENFO ---------- */
function Renfo({ prog }) {
  const done = EXERCISES.filter((_, i) => prog.s.ex[i]).length;
  return (
    <div className="d-grid-2">
      <div>
        <p className="d-intro">Le mardi · circuit avant footing court. 2–3 tours, 1–2 min de récup. Axé chaîne postérieure & descente pour rééquilibrer un profil calisthénie déjà très quadriceps.</p>
        <div className="d-list">
          {EXERCISES.map((e, i) => {
            const on = !!prog.s.ex[i];
            return (
              <button key={i} className={'d-ex' + (on ? ' on' : '')} onClick={() => prog.toggleEx(i)}>
                <span className="d-ex-idx">{on ? <svg width="16" height="16" viewBox="0 0 14 14"><path d="M3 7.4 5.8 10 11 4.2" fill="none" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : i + 1}</span>
                <div className="d-ex-mid">
                  <div className="d-ex-t">{e.name} <span className="d-chip">{e.chip}</span></div>
                  <div className="d-ex-d">{e.why}</div>
                </div>
                <div className="d-ex-vol">{e.vol}</div>
              </button>
            );
          })}
        </div>
      </div>
      <aside className="d-side-card">
        <div className="d-sc-head">
          <div><div className="d-sc-k">Circuit du jour</div><div className="d-sc-n">{done} <span>/ {EXERCISES.length}</span></div><div className="d-sc-bloc" style={{ color: 'var(--moss)' }}>exercices validés</div></div>
          <Ring pct={done / EXERCISES.length} size={76} color="var(--moss)"><div className="d-ring-n">{Math.round(done / EXERCISES.length * 100)}<span>%</span></div></Ring>
        </div>
        <div className="d-sc-k" style={{ marginTop: 18 }}>Minuteur de récupération</div>
        <RestTimer />
        <div className="d-warn"><b>Pistols / airborne squats</b> 1×/sem max — jamais le même jour que les step-downs, sinon double dose de quadriceps.</div>
        {done > 0 && <button className="d-link" onClick={prog.resetEx}>Réinitialiser le circuit</button>}
      </aside>
    </div>
  );
}

/* ---------- chart desktop avec tooltip ---------- */
function BigChart() {
  const keys = Object.keys(CHARTS);
  const [k, setK] = dState('denivele');
  const [hover, setHover] = dState(null);
  const C = CHARTS[k];
  const vals = WEEKS.map(w => w[C.field]);
  const W = 1000, H = 360, pl = 50, pr = 20, pt = 24, pb = 44;
  const n = vals.length, pw = W - pl - pr, ph = H - pt - pb;
  const xAt = i => pl + pw * i / (n - 1);
  const yAt = v => pt + ph - ph * Math.min(v, C.max) / C.max;
  const pts = vals.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[n - 1].x} ${pt + ph} L${pts[0].x} ${pt + ph} Z`;
  const grid = [0, 1, 2, 3, 4];
  return (
    <div className="d-card">
      <div className="d-card-head">
        <div className="d-seg">
          {keys.map(key => <button key={key} className={k === key ? 'on' : ''} onClick={() => { setK(key); setHover(null); }}>{CHARTS[key].short}</button>)}
        </div>
        <div className="d-chart-legend">
          <span><i style={{ background: C.color }} />{C.label}</span>
          <span><i style={{ background: '#c2562e' }} />Pic / simulateur</span>
          <span><i style={{ background: '#6fa8c4' }} />Affûtage</span>
        </div>
      </div>
      <div className="d-chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="d-bigchart" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
          <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.color} stopOpacity="0.30" /><stop offset="100%" stopColor={C.color} stopOpacity="0.02" /></linearGradient></defs>
          {WEEKS.map((w, i) => (w.blocKey === 'pic' || w.blocKey === 'simul') ? <rect key={i} x={xAt(i) - pw / (n - 1) / 2} y={pt} width={pw / (n - 1)} height={ph} fill="rgba(194,86,46,.08)" /> : null)}
          {grid.map(g => { const y = pt + ph - ph * g / 4; return <g key={g}><line x1={pl} y1={y} x2={W - pr} y2={y} stroke="var(--line)" /><text x={pl - 12} y={y + 4} fill="var(--muted)" fontSize="13" textAnchor="end" fontFamily="Archivo">{Math.round(C.max * g / 4)}</text></g>; })}
          <path d={area} fill="url(#dg)" />
          <path d={line} fill="none" stroke={C.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => { const w = WEEKS[i]; const cc = w.race ? '#c2562e' : BLOC_COLORS[w.blocKey]; const on = hover === i; return <g key={i}>
            <circle cx={p.x} cy={p.y} r={w.race ? 6 : 4.5} fill={cc} stroke="var(--panel)" strokeWidth="2" />
            {on ? <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={cc} strokeWidth="1.5" opacity="0.7" /> : null}
            <text x={p.x} y={H - pb + 22} fill={on ? 'var(--ink)' : 'var(--muted)'} fontSize="13" textAnchor="middle" fontFamily="Archivo" fontWeight={on ? 700 : 400}>S{w.n}</text>
            <rect x={p.x - pw / (n - 1) / 2} y={pt} width={pw / (n - 1)} height={ph} fill="transparent" onMouseEnter={() => setHover(i)} />
          </g>; })}
        </svg>
        {hover != null ? (() => { const w = WEEKS[hover]; return (
          <div className="d-tip" style={{ left: (pts[hover].x / W * 100) + '%', top: (pts[hover].y / H * 100) + '%' }}>
            <div className="d-tip-w">Semaine {w.n} · {w.date}</div>
            <div className="d-tip-v">{w[C.field]} <span>{C.unit}</span></div>
            <div className="d-tip-b" style={{ color: BLOC_COLORS[w.blocKey] }}>{w.bloc}</div>
          </div>); })() : null}
      </div>
    </div>
  );
}

/* ---------- PROGRÈS ---------- */
function Progres({ prog }) {
  const weeksDone = Object.values(prog.s.weeks).filter(Boolean).length;
  const totalD = WEEKS.reduce((a, w) => a + w.dpos, 0);
  const totalT = WEEKS.reduce((a, w) => a + w.duree, 0);
  const cur = curWeek();
  const tiles = [
    { n: (totalD / 1000).toFixed(1), u: ' k', l: 'm D+ cumulés (longues)' },
    { n: Math.round(totalT / 60), u: ' h', l: 'de sorties longues' },
    { n: '740', u: ' m', l: 'D+ le jour de la course' },
    { n: 13 - cur, u: '', l: 'semaines avant la course' },
  ];
  return (
    <div>
      <div className="d-prog-hero">
        <div className="d-ph-ring">
          <Ring pct={weeksDone / 13} size={120} stroke={10} color="var(--moss)"><div className="d-ring-big">{weeksDone}<span>/13</span></div></Ring>
          <div>
            <div className="d-ph-k">Semaines validées</div>
            <div className="d-ph-v">{Math.round(weeksDone / 13 * 100)}% du plan accompli</div>
            <div className="d-ph-s">Tu es en semaine {cur} · {13 - cur} restantes</div>
          </div>
        </div>
        <div className="d-tiles">
          {tiles.map((t, i) => <div className="d-tile" key={i}><div className="d-tile-n">{t.n}<span>{t.u}</span></div><div className="d-tile-l">{t.l}</div></div>)}
        </div>
      </div>
      <div className="d-label">Courbe de charge — survole les points</div>
      <BigChart />
    </div>
  );
}

/* ---------- SHELL ---------- */
const NAV = [
  { id: 'today', label: "Aujourd'hui" },
  { id: 'plan', label: 'Le plan' },
  { id: 'renfo', label: 'Renfo' },
  { id: 'progres', label: 'Progrès' },
];
const TITLES = { today: "Aujourd'hui", plan: 'Le plan', renfo: 'Renfo · calisthénie × trail', progres: 'Progrès' };

function DesktopApp() {
  const prog = useSharedProgress();
  const [tab, setTab] = dState('today');
  const cur = curWeek();
  const w = WEEKS.find(x => x.n === cur);
  const weeksDone = Object.values(prog.s.weeks).filter(Boolean).length;
  const dow = TODAY.getDay();
  return (
    <div className="d-app">
      <aside className="d-sidebar">
        <div className="d-brand">
          <div className="d-brand-mark">▲</div>
          <div>
            <div className="d-brand-n">TRAILISTENICS</div>
            <div className="d-brand-s">Trail 20 km · 740 D+</div>
          </div>
        </div>
        <nav className="d-nav">
          {NAV.map(item => (
            <button key={item.id} className={'d-navitem' + (tab === item.id ? ' on' : '')} onClick={() => setTab(item.id)}>
              <NavIcon name={item.id} on={tab === item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="d-sidefoot">
          <Ring pct={weeksDone / 13} size={52} stroke={6} color="var(--moss)"><div className="d-ring-sm">{weeksDone}</div></Ring>
          <div>
            <div className="d-sf-k">Progression</div>
            <div className="d-sf-v">{weeksDone} / 13 semaines</div>
          </div>
        </div>
      </aside>

      <main className="d-main">
        <header className="d-header">
          <div>
            <h1 className="d-title">{TITLES[tab]}</h1>
            <div className="d-sub">{D_DAYS[dow]} {TODAY.getDate()} {D_MONTHS[TODAY.getMonth()]} 2026</div>
          </div>
          <div className="d-wpill" style={{ borderColor: BLOC_COLORS[w.blocKey] }}>
            <span className="d-wpill-n">S{cur}</span>
            <span className="d-wpill-b" style={{ color: BLOC_COLORS[w.blocKey] }}>{w.bloc}</span>
          </div>
        </header>
        <div className="d-content">
          {tab === 'today' && <Today prog={prog} go={setTab} />}
          {tab === 'plan' && <Plan prog={prog} />}
          {tab === 'renfo' && <Renfo prog={prog} />}
          {tab === 'progres' && <Progres prog={prog} />}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<DesktopApp />);
