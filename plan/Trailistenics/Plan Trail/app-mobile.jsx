// ---------- APP MOBILE · SUIVI DE TRAINING ----------
const { useState: mState, useEffect: mEffect, useRef: mRef } = React;

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/* progression partagée avec la page éditoriale (même clé) */
function useSharedProgress() {
  const KEY = 'planTrail.progress.v1';
  const [s, setS] = mState(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY)) || {}; return { weeks: v.weeks || {}, ex: v.ex || {}, sessions: v.sessions || {} }; }
    catch (e) { return { weeks: {}, ex: {}, sessions: {} }; }
  });
  mEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }, [s]);
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

/* séance type selon le jour de la semaine */
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

/* ---------- petits éléments ---------- */
function Ring({ pct, size = 64, stroke = 7, color = 'var(--moss)', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="m-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div className="m-ring-c">{children}</div>
    </div>
  );
}

function Check({ on, col = 'var(--moss)' }) {
  return (
    <span className={'m-check' + (on ? ' on' : '')} style={on ? { background: col, borderColor: col } : null}>
      {on ? <svg width="13" height="13" viewBox="0 0 14 14"><path d="M3 7.4 5.8 10 11 4.2" fill="none" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
    </span>
  );
}

/* ---------- ICÔNES onglets ---------- */
const TabIcon = ({ name, on }) => {
  const c = on ? 'var(--accent)' : 'var(--muted)';
  const sw = 1.9;
  const ic = {
    today: <g fill="none" stroke={c} strokeWidth={sw}><circle cx="11" cy="11" r="4" /><circle cx="11" cy="11" r="8.5" opacity=".5" /></g>,
    plan: <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"><rect x="3" y="4.5" width="16" height="14.5" rx="2.5" /><path d="M3 8.5h16M7.5 2.5v4M14.5 2.5v4" /></g>,
    renfo: <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"><path d="M4 8v6M18 8v6M4 11h14M1.5 9.5v3M20.5 9.5v3" /></g>,
    progres: <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M3 14l4-4 3.5 3L18 6" /><path d="M14 6h4v4" /></g>,
  };
  return <svg width="22" height="22" viewBox="0 0 22 22">{ic[name]}</svg>;
};

/* ---------- ÉCRAN · AUJOURD'HUI ---------- */
function Today({ prog, go }) {
  const cur = curWeek();
  const w = WEEKS.find(x => x.n === cur);
  const dow = TODAY.getDay();
  const sess = sessionForDay(dow, w);
  const todayKey = cur + '-' + sess.key;
  const isRest = sess.key === 'repos';

  const planned = [
    { d: 'Mardi', label: 'Renfo + footing', detail: 'Circuit 6 exos', k: cur + '-renfo', col: 'var(--sky)' },
    { d: 'Jeudi', label: 'Qualité', detail: w.qual, k: cur + '-qual', col: 'var(--accent)' },
    { d: 'Dimanche', label: 'Sortie longue', detail: w.longue, k: cur + '-longue', col: 'var(--moss)' },
  ];
  const doneCount = planned.filter(p => prog.s.sessions[p.k]).length;

  return (
    <div className="m-screen">
      <div className="m-greet">
        <div>
          <div className="m-kick">{DAY_NAMES[dow]} · {TODAY.getDate()} {MONTHS[TODAY.getMonth()]}</div>
          <h2 className="m-h2">Semaine {cur}</h2>
          <div className="m-bloc" style={{ color: BLOC_COLORS[w.blocKey] }}>{w.bloc} · {BLOC_TAG[w.blocKey]}</div>
        </div>
        <Ring pct={doneCount / 3} size={64} color="var(--moss)">
          <div className="m-ring-n">{doneCount}<span>/3</span></div>
        </Ring>
      </div>

      <div className="m-label">À faire aujourd'hui</div>
      <div className={'m-today' + (isRest ? ' rest' : '')}>
        <div className="m-today-top">
          <span className="m-tag" style={{ background: sess.col + '22', color: sess.col }}>{sess.tag}</span>
          {!isRest && <span className="m-today-day">{DAY_NAMES[dow]}</span>}
        </div>
        <div className="m-today-type">{sess.type}</div>
        <div className="m-today-detail">{sess.detail}</div>
        {!isRest && (
          <button className={'m-btn' + (prog.s.sessions[todayKey] ? ' done' : '')} onClick={() => prog.toggleSession(todayKey)}>
            {prog.s.sessions[todayKey] ? '✓ Séance terminée' : 'Marquer comme terminée'}
          </button>
        )}
        {sess.key === 'renfo' && (
          <button className="m-btn ghost" onClick={() => go('renfo')}>Ouvrir le circuit renfo ›</button>
        )}
      </div>

      <div className="m-label">Les 3 séances clés de la semaine</div>
      <div className="m-list">
        {planned.map(p => {
          const on = !!prog.s.sessions[p.k];
          return (
            <button key={p.k} className="m-row" onClick={() => prog.toggleSession(p.k)}>
              <span className="m-row-dot" style={{ background: p.col }} />
              <div className="m-row-mid">
                <div className="m-row-t">{p.d} · {p.label}</div>
                <div className="m-row-d">{p.detail}</div>
              </div>
              <Check on={on} col={p.col} />
            </button>
          );
        })}
      </div>

      <p className="m-note">{w.focus}</p>
      <button className="m-link" onClick={() => go('plan')}>Voir tout le plan ›</button>
    </div>
  );
}

/* ---------- ÉCRAN · PLAN ---------- */
function Plan({ prog }) {
  const cur = curWeek();
  const [sel, setSel] = mState(null);
  if (sel) return <WeekDetailM n={sel} back={() => setSel(null)} prog={prog} setSel={setSel} />;

  let lastBloc = null;
  return (
    <div className="m-screen">
      <p className="m-intro">13 semaines, de la reprise à l'affûtage. Touche une semaine pour le détail.</p>
      <div className="m-weeks">
        {WEEKS.map(w => {
          const showHead = w.bloc !== lastBloc; lastBloc = w.bloc;
          const done = !!prog.s.weeks[w.n];
          const col = BLOC_COLORS[w.blocKey];
          return (
            <React.Fragment key={w.n}>
              {showHead && <div className="m-bloc-head" style={{ color: col }}>{w.bloc}</div>}
              <button className={'m-wk' + (w.n === cur ? ' cur' : '')} onClick={() => setSel(w.n)}>
                <span className="m-wk-bar" style={{ background: col }} />
                <div className="m-wk-n" style={{ color: done ? 'var(--moss)' : 'var(--ink)' }}>
                  {done ? <svg width="16" height="16" viewBox="0 0 14 14"><path d="M3 7.4 5.8 10 11 4.2" fill="none" stroke="var(--moss)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : w.n}
                </div>
                <div className="m-wk-mid">
                  <div className="m-wk-t">{w.race ? '🏁 ' : ''}S{w.n} · {w.date}{w.n === cur ? ' · en cours' : ''}</div>
                  <div className="m-wk-d">{w.longue}</div>
                </div>
                <div className="m-wk-dpos">{w.dpos}<span>m D+</span></div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function WeekDetailM({ n, back, prog, setSel }) {
  const w = WEEKS.find(x => x.n === n);
  const col = BLOC_COLORS[w.blocKey];
  const done = !!prog.s.weeks[w.n];
  return (
    <div className="m-screen">
      <button className="m-back" onClick={back}>‹ Le plan</button>
      <span className="m-tag" style={{ background: col + '22', color: col }}>Semaine {w.n} · {w.date} · {BLOC_TAG[w.blocKey]}</span>
      <h2 className="m-h2" style={{ marginTop: 8 }}>{w.bloc}</h2>
      <div className="m-dboxes">
        <div className="m-dbox"><div className="m-dk">Sortie longue · dimanche</div><div className="m-dv">{w.longue}</div></div>
        <div className="m-dbox"><div className="m-dk">Qualité · jeudi</div><div className="m-dv">{w.qual}</div></div>
        <div className="m-dbox half"><div className="m-dk">Séances / sem</div><div className="m-dv">{w.sea}</div></div>
        <div className="m-dbox half"><div className="m-dk">D+ sur la longue</div><div className="m-dv">{w.dpos} m</div></div>
      </div>
      <p className="m-note">{w.focus}</p>
      <button className={'m-btn' + (done ? ' done' : '')} onClick={() => prog.toggleWeek(w.n)}>
        {done ? '✓ Semaine validée' : 'Marquer la semaine comme faite'}
      </button>
      <div className="m-pager">
        <button disabled={n <= 1} onClick={() => setSel(n - 1)}>‹ S{n - 1 || ''}</button>
        <button disabled={n >= 13} onClick={() => setSel(n + 1)}>S{n + 1 > 13 ? '' : n + 1} ›</button>
      </div>
    </div>
  );
}

/* ---------- minuteur de récup ---------- */
function RestTimer() {
  const [left, setLeft] = mState(0);
  const ref = mRef(null);
  mEffect(() => () => clearInterval(ref.current), []);
  const start = (s) => {
    clearInterval(ref.current); setLeft(s);
    ref.current = setInterval(() => setLeft(p => { if (p <= 1) { clearInterval(ref.current); return 0; } return p - 1; }), 1000);
  };
  const mm = String(Math.floor(left / 60)).padStart(1, '0'), ss = String(left % 60).padStart(2, '0');
  return (
    <div className={'m-timer' + (left > 0 ? ' run' : '')}>
      <div className="m-timer-d">{mm}:{ss}</div>
      <div className="m-timer-btns">
        <button onClick={() => start(60)}>1:00</button>
        <button onClick={() => start(90)}>1:30</button>
        <button onClick={() => start(120)}>2:00</button>
        {left > 0 && <button className="stop" onClick={() => { clearInterval(ref.current); setLeft(0); }}>Stop</button>}
      </div>
    </div>
  );
}

/* ---------- ÉCRAN · RENFO ---------- */
function Renfo({ prog }) {
  const done = EXERCISES.filter((_, i) => prog.s.ex[i]).length;
  return (
    <div className="m-screen">
      <p className="m-intro">Le mardi · circuit avant footing court. 2–3 tours, 1–2 min de récup. Chaîne postérieure & descente.</p>
      <div className="m-prog-bar">
        <div className="m-prog-fill" style={{ width: (done / EXERCISES.length * 100) + '%' }} />
        <span className="m-prog-lbl">{done} / {EXERCISES.length} exercices</span>
      </div>
      <RestTimer />
      <div className="m-list">
        {EXERCISES.map((e, i) => {
          const on = !!prog.s.ex[i];
          return (
            <button key={i} className={'m-ex' + (on ? ' on' : '')} onClick={() => prog.toggleEx(i)}>
              <span className="m-ex-idx">{on ? <svg width="15" height="15" viewBox="0 0 14 14"><path d="M3 7.4 5.8 10 11 4.2" fill="none" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : i + 1}</span>
              <div className="m-ex-mid">
                <div className="m-ex-t">{e.name} <span className="m-chip">{e.chip}</span></div>
                <div className="m-ex-d">{e.why}</div>
              </div>
              <div className="m-ex-vol">{e.vol}</div>
            </button>
          );
        })}
      </div>
      <div className="m-warn"><b>Pistols / airborne squats</b> 1×/sem max — jamais le même jour que les step-downs.</div>
      {done > 0 && <button className="m-link" onClick={prog.resetEx}>Réinitialiser le circuit</button>}
    </div>
  );
}

/* ---------- mini graphique ---------- */
function MiniChart() {
  const keys = Object.keys(CHARTS);
  const [k, setK] = mState('denivele');
  const C = CHARTS[k];
  const vals = WEEKS.map(w => w[C.field]);
  const W = 340, H = 150, pl = 8, pr = 8, pt = 12, pb = 22;
  const n = vals.length, pw = W - pl - pr, ph = H - pt - pb;
  const xAt = i => pl + pw * i / (n - 1);
  const yAt = v => pt + ph - ph * Math.min(v, C.max) / C.max;
  const pts = vals.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[n - 1].x} ${pt + ph} L${pts[0].x} ${pt + ph} Z`;
  return (
    <div className="m-card">
      <div className="m-seg">
        {keys.map(key => <button key={key} className={k === key ? 'on' : ''} onClick={() => setK(key)}>{CHARTS[key].short}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="m-chart">
        <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.color} stopOpacity="0.32" /><stop offset="100%" stopColor={C.color} stopOpacity="0.02" />
        </linearGradient></defs>
        {WEEKS.map((w, i) => (w.blocKey === 'pic' || w.blocKey === 'simul')
          ? <rect key={i} x={xAt(i) - pw / (n - 1) / 2} y={pt} width={pw / (n - 1)} height={ph} fill="rgba(194,86,46,.09)" /> : null)}
        <path d={area} fill="url(#mg)" />
        <path d={line} fill="none" stroke={C.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={WEEKS[i].race ? 4 : 2.6} fill={WEEKS[i].race ? '#c2562e' : BLOC_COLORS[WEEKS[i].blocKey]} stroke="var(--panel)" strokeWidth="1.5" />)}
        {pts.map((p, i) => (i % 2 === 0 || i === n - 1) ? <text key={'t' + i} x={p.x} y={H - 6} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="Archivo">S{WEEKS[i].n}</text> : null)}
      </svg>
      <div className="m-chart-lbl">{C.label} ({C.unit})</div>
    </div>
  );
}

/* ---------- ÉCRAN · PROGRÈS ---------- */
function Progres({ prog }) {
  const weeksDone = Object.values(prog.s.weeks).filter(Boolean).length;
  const totalD = WEEKS.reduce((a, w) => a + w.dpos, 0);
  const totalT = WEEKS.reduce((a, w) => a + w.duree, 0);
  const cur = curWeek();
  return (
    <div className="m-screen">
      <div className="m-hero-prog">
        <Ring pct={weeksDone / 13} size={104} stroke={9} color="var(--moss)">
          <div className="m-ring-big">{weeksDone}<span>/13</span></div>
        </Ring>
        <div>
          <div className="m-hp-k">Semaines validées</div>
          <div className="m-hp-v">{Math.round(weeksDone / 13 * 100)}% du plan</div>
          <div className="m-hp-s">Tu es en semaine {cur}</div>
        </div>
      </div>
      <div className="m-tiles">
        <div className="m-tile"><div className="m-tile-n">{(totalD / 1000).toFixed(1)}<span> k</span></div><div className="m-tile-l">m D+ cumulés (longues)</div></div>
        <div className="m-tile"><div className="m-tile-n">{Math.round(totalT / 60)}<span> h</span></div><div className="m-tile-l">de sorties longues</div></div>
        <div className="m-tile"><div className="m-tile-n">740<span> m</span></div><div className="m-tile-l">D+ jour de course</div></div>
        <div className="m-tile"><div className="m-tile-n">{13 - cur}</div><div className="m-tile-l">sem. avant la course</div></div>
      </div>
      <div className="m-label">Courbe de charge</div>
      <MiniChart />
    </div>
  );
}

/* ---------- SHELL ---------- */
const TABS = [
  { id: 'today', label: "Aujourd'hui", title: "Aujourd'hui" },
  { id: 'plan', label: 'Plan', title: 'Le plan' },
  { id: 'renfo', label: 'Renfo', title: 'Renfo' },
  { id: 'progres', label: 'Progrès', title: 'Progrès' },
];

function MobileApp() {
  const prog = useSharedProgress();
  const [tab, setTab] = mState('today');
  const scrollRef = mRef(null);
  mEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [tab]);
  const title = TABS.find(t => t.id === tab).title;

  return (
    <div className="m-app">
      <div className="m-topbar">
        <div className="m-brand">TRAILISTENICS</div>
        <div className="m-title">{title}</div>
      </div>
      <div className="m-scroll" ref={scrollRef}>
        {tab === 'today' && <Today prog={prog} go={setTab} />}
        {tab === 'plan' && <Plan prog={prog} />}
        {tab === 'renfo' && <Renfo prog={prog} />}
        {tab === 'progres' && <Progres prog={prog} />}
      </div>
      <div className="m-tabbar">
        {TABS.map(t => (
          <button key={t.id} className={'m-tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>
            <TabIcon name={t.id} on={tab === t.id} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Root() {
  return (
    <div className="stage">
      <IOSDevice dark>
        <MobileApp />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
