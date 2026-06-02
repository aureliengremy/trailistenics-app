// ---------- SOURCE DE VÉRITÉ DES DONNÉES ----------
// Reprises telles quelles du prototype plan_trail_interactif.html.

window.WEEKS = [
  {n:1,date:"2 juin",bloc:"Reprise",blocKey:"base",duree:70,dpos:250,sea:3,longue:"1h10 · ~11 km · 250 m D+",qual:"Côtes : 6×1 min",focus:"Réveil en douceur. Endurance facile, on marche dès que ça monte raide."},
  {n:2,date:"9 juin",bloc:"Reprise",blocKey:"base",duree:75,dpos:300,sea:3,longue:"1h15 · ~12 km · 300 m D+",qual:"Seuil : 2×12 min",focus:"On installe la routine. Footing du seuil sur faux-plat."},
  {n:3,date:"16 juin",bloc:"Base",blocKey:"base",duree:80,dpos:350,sea:3,longue:"1h20 · ~13 km · 350 m D+",qual:"Côtes : 8×1 min",focus:"Passage vers 4 séances selon la forme. Le renfo du mardi devient régulier."},
  {n:4,date:"23 juin",bloc:"Allégée",blocKey:"allege",duree:60,dpos:250,sea:3,longue:"1h00 · ~10 km · 250 m D+",qual:"Seuil : 2×10 min",focus:"Semaine de récup. Le corps assimile — ne la saute pas."},
  {n:5,date:"30 juin",bloc:"Base",blocKey:"base",duree:90,dpos:400,sea:4,longue:"1h30 · ~14 km · 400 m D+",qual:"Côtes 8×1 min + descente",focus:"On commence le travail de descente sur la longue. Sentiers en pente choisis exprès."},
  {n:6,date:"7 juil.",bloc:"Développement",blocKey:"base",duree:100,dpos:450,sea:4,longue:"1h40 · ~15 km · 450 m D+",qual:"Seuil : 3×10 min",focus:"Le volume grimpe. Teste ta nutrition sur la longue."},
  {n:7,date:"14 juil.",bloc:"Développement",blocKey:"base",duree:110,dpos:500,sea:4,longue:"1h50 · ~16 km · 500 m D+",qual:"Côtes : 10×1 min",focus:"Première vraie longue. Power hiking dans les passages raides."},
  {n:8,date:"21 juil.",bloc:"Allégée",blocKey:"allege",duree:75,dpos:300,sea:3,longue:"1h15 · ~12 km · 300 m D+",qual:"Seuil : 2×12 min",focus:"Deuxième coupure. Tu encaisses la charge avant le gros bloc."},
  {n:9,date:"28 juil.",bloc:"Pic de charge",blocKey:"pic",duree:120,dpos:550,sea:4,longue:"2h00 · ~17 km · 550 m D+",qual:"Côtes longues : 5×2 min",focus:"Le bloc clé. Matériel testé en conditions réelles."},
  {n:10,date:"4 août",bloc:"Pic de charge",blocKey:"pic",duree:135,dpos:600,sea:4,longue:"2h15 · ~18 km · 600 m D+",qual:"Seuil : 3×12 min",focus:"Volume maximal. Gère la fatigue, dors bien."},
  {n:11,date:"11 août",bloc:"Simulateur",blocKey:"simul",duree:150,dpos:700,sea:4,longue:"2h30 · ~15 km · ~700 m D+ (choc)",qual:"Côtes : 6×2 min (léger)",focus:"Sortie choc à J-3 sem : le D+ max que tu trouves. Évalue ton rythme en descente technique."},
  {n:12,date:"18 août",bloc:"Affûtage",blocKey:"affut",duree:75,dpos:350,sea:3,longue:"1h15 · ~12 km · 350 m D+",qual:"Côtes : 5×1 min vif",focus:"Réduction ~50 % du volume. On garde du tonus, pas de fatigue."},
  {n:13,date:"25 août",bloc:"Affûtage",blocKey:"affut",duree:45,dpos:120,sea:2,longue:"45 min relâché + lignes → COURSE",qual:"Repos / 20 min footing",focus:"Dernière ligne droite. Jambes fraîches, frais mental. La course t'attend.",race:true},
];

// blocKey → couleur (graphiques + timeline)
window.BLOC_COLORS = {base:"#7ba05b",allege:"#a99e88",pic:"#c2562e",simul:"#c2562e",affut:"#6fa8c4"};
// blocKey → libellé de catégorie
window.BLOC_TAG = {base:"Construction",allege:"Récupération",pic:"Pic de charge",simul:"Simulateur",affut:"Affûtage"};

// Métriques commutables du graphique de charge
window.CHARTS = {
  duree:    {label:"Durée de la sortie longue", short:"Durée longue",  unit:"min",     field:"duree", max:160, color:"#7ba05b"},
  denivele: {label:"Dénivelé positif sur la longue", short:"Dénivelé D+", unit:"m D+", field:"dpos",  max:780, color:"#d98a3d"},
  seances:  {label:"Nombre de séances", short:"Volume hebdo", unit:"séances", field:"sea", max:5, color:"#6fa8c4"},
};

// Circuit renfo · calisthénie × trail (6 exercices, ordonnés)
window.EXERCISES = [
  {name:"Single-Leg RDL",vol:"3 × 10 / jambe",chip:"Postérieur",why:"Soulevé roumain sur une jambe. Cible ischios + fessiers : ce qui te propulse en montée et rééquilibre ton profil quadriceps."},
  {name:"Step-downs lents",vol:"3 × 8 / jambe",chip:"Descente",why:"Descendre d'une marche en 4–5 s, contrôlé. LE geste de la descente : excentrique qui blinde les cuisses."},
  {name:"Nordic Hamstring Curls",vol:"3 × 6",chip:"Genou",why:"Assistés au besoin. Protègent le genou au freinage, sécurisent la descente."},
  {name:"Pont fessier 1 jambe",vol:"3 × 12 / jambe",chip:"Fessiers",why:"Renforce les fessiers sans recharger des quadriceps déjà bien sollicités ailleurs."},
  {name:"Tibial + Calf raises",vol:"3 × 15",chip:"Cheville",why:"Sur une marche. Cheville solide = pas d'entorse au km 12 sur terrain instable."},
  {name:"Planche latérale + levé jambe",vol:"3 × 40 s / côté",chip:"Gainage",why:"Stabilité du bassin dans la foulée. Ton point fort calisthénie, à entretenir."},
];

// Technique & stratégie (accordéons)
window.TECHNIQUE = [
  {
    title:"La descente — ta priorité cachée",
    lead:"Sur 740 D+, tu descends autant que tu montes. À partir de la semaine 5, sur chaque sortie longue :",
    items:[
      "<b>Choisis volontairement</b> des sentiers en pente pour courir la descente, pas juste y survivre.",
      "<b>Regarde 4–5 m devant</b> toi, pas tes pieds. Foulée courte, fréquence haute, bras un peu écartés.",
      "<b>Relâche</b> : crispé = freinage = cuisses détruites. On lâche les freins en confiance.",
    ],
  },
  {
    title:"Montée — le power hiking",
    lead:"Marcher dans le raide n'est pas un échec, c'est une technique. Mains sur les cuisses, on pousse. Souvent plus économe qu'un trottinement laborieux à 15 %.",
    items:[
      "<b>Teste les deux</b> sur tes longues pour trouver ton seuil de bascule marche/course.",
      "<b>Applique-le</b> en course : décidé à l'avance, pas découvert le jour J.",
    ],
  },
  {
    title:"Le jour J — gestion de course",
    lead:null,
    items:[
      "<b>Pars prudent</b> : le piège du 20 km est de cramer dans les premières montées. Découpe en tiers, garde du jus pour le dernier.",
      "<b>Nutrition</b> : une gorgée toutes les 10–15 min, un gel/barre toutes les 45 min. À tester dès le pic de charge.",
      "<b>Repère le parcours</b> : profil, ravitos, sections techniques.",
    ],
    warn:"<b>Matériel — à valider en août, pas la veille :</b> chaussures de trail rodées (jamais neuves) et système d'hydratation testés sur les longues du pic de charge.",
  },
];

// Date de référence de l'app (déterministe pour la maquette).
window.TODAY = new Date(2026, 5, 1); // 1 juin 2026 → début semaine 1
