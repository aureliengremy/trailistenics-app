// ---------- GRAPHIQUE DE CHARGE (SVG responsive) ----------
const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

const VB_W = 1040, VB_H = 430;
const PAD = { l: 56, r: 24, t: 28, b: 52 };

function LoadChart() {
  const keys = Object.keys(CHARTS);
  const [key, setKey] = useStateC('duree');
  const [hover, setHover] = useStateC(null);
  const [prog, setProg] = useStateC(0);
  const raf = useRefC(0);

  // animate the line on metric change
  useEffectC(() => {
    cancelAnimationFrame(raf.current);
    let s = 0;
    const tick = () => {
      s += 0.07;
      setProg(Math.min(s, 1));
      if (s < 1) raf.current = requestAnimationFrame(tick);
    };
    setProg(0);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [key]);

  const C = CHARTS[key];
  const vals = WEEKS.map(w => w[C.field]);
  const n = vals.length;
  const plotW = VB_W - PAD.l - PAD.r;
  const plotH = VB_H - PAD.t - PAD.b;
  const xAt = i => PAD.l + (plotW * i) / (n - 1);
  const yAt = v => PAD.t + plotH - (plotH * Math.min(v, C.max)) / C.max;

  const pts = vals.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  // animated y (grow up from baseline)
  const ay = p => PAD.t + plotH - (PAD.t + plotH - p.y) * prog;
  const apts = pts.map(p => ({ x: p.x, y: ay(p) }));

  const linePath = apts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${apts[n - 1].x} ${PAD.t + plotH} L${apts[0].x} ${PAD.t + plotH} Z`;

  const grid = [0, 1, 2, 3, 4];

  return (
    React.createElement('div', { className: 'card chart-card' },
      React.createElement('div', { className: 'chart-tabs' },
        keys.map(k =>
          React.createElement('button', {
            key: k,
            className: 'tab' + (k === key ? ' active' : ''),
            onClick: () => { setKey(k); setHover(null); }
          }, CHARTS[k].short)
        )
      ),
      React.createElement('div', { className: 'chart-wrap' },
        React.createElement('svg', {
          viewBox: `0 0 ${VB_W} ${VB_H}`, className: 'chart-svg',
          preserveAspectRatio: 'none',
          onMouseLeave: () => setHover(null)
        },
          React.createElement('defs', null,
            React.createElement('linearGradient', { id: 'areaGrad', x1: 0, y1: 0, x2: 0, y2: 1 },
              React.createElement('stop', { offset: '0%', stopColor: C.color || 'var(--moss)', stopOpacity: 0.30 }),
              React.createElement('stop', { offset: '100%', stopColor: C.color || 'var(--moss)', stopOpacity: 0.02 })
            )
          ),
          // bloc bands (pic / simulateur)
          WEEKS.map((w, i) =>
            (w.blocKey === 'pic' || w.blocKey === 'simul')
              ? React.createElement('rect', {
                  key: 'band' + i,
                  x: xAt(i) - plotW / (n - 1) / 2, y: PAD.t,
                  width: plotW / (n - 1), height: plotH,
                  fill: 'rgba(194,86,46,.08)'
                })
              : null
          ),
          // grid lines + y labels
          grid.map(g => {
            const y = PAD.t + plotH - (plotH * g) / 4;
            return React.createElement('g', { key: 'g' + g },
              React.createElement('line', { x1: PAD.l, y1: y, x2: VB_W - PAD.r, y2: y, stroke: 'var(--line)', strokeWidth: 1 }),
              React.createElement('text', { x: PAD.l - 12, y: y + 4, fill: 'var(--muted)', fontSize: 15, textAnchor: 'end', fontFamily: 'Archivo' }, Math.round((C.max * g) / 4))
            );
          }),
          // area + line
          React.createElement('path', { d: areaPath, fill: 'url(#areaGrad)' }),
          React.createElement('path', { d: linePath, fill: 'none', stroke: C.color, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }),
          // points + x labels + hit areas
          apts.map((p, i) => {
            const w = WEEKS[i];
            const col = w.race ? '#c2562e' : BLOC_COLORS[w.blocKey];
            const on = hover === i;
            return React.createElement('g', { key: 'p' + i },
              React.createElement('circle', { cx: p.x, cy: p.y, r: w.race ? 6 : 4.5, fill: col, stroke: 'var(--bg)', strokeWidth: 2 }),
              on ? React.createElement('circle', { cx: p.x, cy: p.y, r: 9, fill: 'none', stroke: col, strokeWidth: 1.5, opacity: 0.7 }) : null,
              React.createElement('text', { x: p.x, y: VB_H - PAD.b + 22, fill: on ? 'var(--ink)' : 'var(--muted)', fontSize: 14, textAnchor: 'middle', fontFamily: 'Archivo', fontWeight: on ? 700 : 400 }, 'S' + w.n),
              React.createElement('rect', {
                x: p.x - plotW / (n - 1) / 2, y: PAD.t, width: plotW / (n - 1), height: plotH,
                fill: 'transparent', onMouseEnter: () => setHover(i)
              })
            );
          })
        ),
        // tooltip (HTML overlay, positioned by %)
        hover != null ? (() => {
          const w = WEEKS[hover];
          const leftPct = (pts[hover].x / VB_W) * 100;
          const topPct = (pts[hover].y / VB_H) * 100;
          return React.createElement('div', {
            className: 'chart-tip',
            style: { left: leftPct + '%', top: topPct + '%' }
          },
            React.createElement('div', { className: 'tip-w' }, 'Semaine ' + w.n + ' · ' + w.date),
            React.createElement('div', { className: 'tip-v' }, w[C.field] + ' ', React.createElement('span', null, C.unit)),
            React.createElement('div', { className: 'tip-b', style: { color: BLOC_COLORS[w.blocKey] } }, w.bloc)
          );
        })() : null
      ),
      React.createElement('div', { className: 'chart-legend' },
        React.createElement('span', null, React.createElement('i', { className: 'dot', style: { background: C.color } }), C.label + ' (' + C.unit + ')'),
        React.createElement('span', null, React.createElement('i', { className: 'dot', style: { background: '#c2562e' } }), 'Pic / simulateur'),
        React.createElement('span', null, React.createElement('i', { className: 'dot', style: { background: '#6fa8c4' } }), 'Affûtage')
      )
    )
  );
}

window.LoadChart = LoadChart;
