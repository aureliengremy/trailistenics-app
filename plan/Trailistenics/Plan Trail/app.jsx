// ---------- APP ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d98a3d",
  "titleFont": "Fraunces",
  "density": "regular",
  "texture": 0.45,
  "dark": true
}/*EDITMODE-END*/;

const ACCENTS = {
  '#d98a3d': '#b4691f', // ocre
  '#7ba05b': '#5c7d3f', // mousse
  '#c2562e': '#9c4423', // rouille
  '#6fa8c4': '#4d8aa8', // ciel
};
const TITLE_FONTS = {
  'Fraunces': "'Fraunces', serif",
  'Spectral': "'Spectral', serif",
  'Bricolage Grotesque': "'Bricolage Grotesque', sans-serif",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const progress = useProgress();

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--accent-d', ACCENTS[t.accent] || '#b4691f');
    r.style.setProperty('--title-font', TITLE_FONTS[t.titleFont] || TITLE_FONTS.Fraunces);
    r.style.setProperty('--tex', String(t.texture));
    r.dataset.density = t.density;
    r.classList.toggle('theme-light', !t.dark);
  }, [t]);

  return React.createElement('div', { className: 'wrap' },
    React.createElement(Hero, { progress }),

    React.createElement('section', { id: 'charts' },
      React.createElement(SecHead, { num: '01', title: 'La courbe de charge' }),
      React.createElement('p', { className: 'sec-intro' }, "Le volume monte par paliers avec deux semaines allégées (4 et 8) pour assimiler — c'est là que le corps progresse. La sortie « choc » de la semaine 11 simule le D+ de la course, puis l'affûtage te laisse arriver frais."),
      React.createElement(LoadChart)
    ),

    React.createElement(Timeline, { progress }),
    React.createElement(Circuit, { progress }),
    React.createElement(Technique),

    React.createElement('footer', null,
      "Écoute les signaux : une douleur articulaire qui persiste prime sur le plan. Mieux vaut arriver un peu sous-entraîné et frais que cuit ou blessé."
    ),

    React.createElement(TweaksPanel, null,
      React.createElement(TweakSection, { label: 'Couleur d\u2019accent' }),
      React.createElement(TweakColor, {
        label: 'Accent', value: t.accent,
        options: ['#d98a3d', '#7ba05b', '#c2562e', '#6fa8c4'],
        onChange: v => setTweak('accent', v)
      }),
      React.createElement(TweakSection, { label: 'Typographie' }),
      React.createElement(TweakSelect, {
        label: 'Police des titres', value: t.titleFont,
        options: ['Fraunces', 'Spectral', 'Bricolage Grotesque'],
        onChange: v => setTweak('titleFont', v)
      }),
      React.createElement(TweakRadio, {
        label: 'Densité', value: t.density,
        options: ['compact', 'regular', 'comfy'],
        onChange: v => setTweak('density', v)
      }),
      React.createElement(TweakSection, { label: 'Ambiance' }),
      React.createElement(TweakSlider, {
        label: 'Texture topo', value: t.texture, min: 0, max: 1, step: 0.05,
        onChange: v => setTweak('texture', v)
      }),
      React.createElement(TweakToggle, {
        label: 'Thème sombre', value: t.dark, onChange: v => setTweak('dark', v)
      }),
      React.createElement(TweakSection, { label: 'Progression' }),
      React.createElement(TweakButton, {
        label: 'Réinitialiser la progression', onClick: () => progress.reset()
      })
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
