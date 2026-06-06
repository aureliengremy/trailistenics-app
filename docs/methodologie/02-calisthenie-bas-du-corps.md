# Méthodologie — Calisthénie du bas du corps

> **Rôle de ce document.** Base de connaissances *brute* destinée à alimenter la génération
> de programmes de renforcement bas du corps au poids du corps, avec une orientation **trail**
> (descente, prévention quadriceps, chaîne postérieure). Voir
> [`docs/prompts/02-generation-calisthenie-bas-corps.md`](../prompts/02-generation-calisthenie-bas-corps.md).
> Toutes les prescriptions sont sourcées. En cas de divergence entre sources grand public et
> sources de référence (Steven Low, r/bodyweightfitness, ACSM), privilégier ces dernières.

---

## 1. Principes de la surcharge progressive SANS charge externe

En calisthénie, on ne peut pas « ajouter des kilos ». On augmente la difficulté par d'autres leviers. Steven Low (*Overcoming Gravity 2*, ch. 10 « Methods of Progression ») identifie le **levier** et la **longueur musculaire (amplitude)** comme paramètres centraux de progression, sous le principe **SAID** (Specific Adaptation to Imposed Demands) ([stevenlow.org/overcoming-gravity](https://stevenlow.org/overcoming-gravity/) ; [calisthenics.com review](https://calisthenics.com/calisthenics-book-review-overcoming-gravity-by-steven-low/)).

| Levier de surcharge | Mécanisme | Application bas du corps |
|---|---|---|
| **Levier mécanique** | Allonger le bras de levier / réduire le nombre d'appuis | Bilatéral → unilatéral (squat → pistol), bras tendus devant |
| **Amplitude (ROM)** | Augmenter la course articulaire | Box squat haut → box bas → squat complet ; shrimp à box → shrimp jambe d'appui surélevée |
| **Unilatéral** | Doubler la charge relative sur un membre | Glute bridge → single-leg ; squat → split squat → pistol |
| **Tempo / excentrique** | Allonger le temps sous tension, surcharger la phase négative | Descente 3–5 s ; négatives contrôlées |
| **Instabilité / équilibre** | Recrutement stabilisateur, contrôle neuromusculaire | Réduire les points d'appui, bras libres, surface instable |
| **Volume** | Plus de séries/reps totales | Monter le nombre de reps avant de durcir la progression |
| **Densité** | Réduire la récup entre séries | Mêmes reps, moins de repos |
| **Isométrie** | Tenue sous tension à un angle donné | Squat hold, shrimp hold, wall sit |

**Comment progresser quand on ne peut pas ajouter de poids — la règle de Steven Low :**
On exécute le plus de répétitions possible **en s'arrêtant 1–2 reps avant l'échec**. Dès qu'on dépasse **5–6 reps** sur une progression, on passe à une **progression plus difficile** et on **redescend en reps** ([Fundamentals of Bodyweight Strength Training](https://stevenlow.org/the-fundamentals-of-bodyweight-strength-training/)).

**Seuils de passage selon le type de contraction (Overcoming Gravity 2) :**
- **Isométrique** : passer à plus dur quand on tient **6 s**.
- **Dynamique (concentrique)** : passer à plus dur quand on atteint **3 reps** propres.
- **Excentrique** : passer à plus dur quand on contrôle **toute l'amplitude > 3 s**.
([calisthenics.com](https://calisthenics.com/calisthenics-book-review-overcoming-gravity-by-steven-low/))

---

## 2. Échelles de progression — bas du corps (du plus facile au plus dur)

### 2.1 Squat → Pistol (échelle r/bodyweightfitness Recommended Routine)

L'échelle officielle de la RR comporte 7 niveaux. **Critère de passage uniforme : 3×8 reps propres** ([Recommended Routine gist](https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb) ; [fitloop guide](https://www.fitloop.app/guides/recommended-routine)).

| # | Niveau | Description | Critère de passage |
|---|---|---|---|
| 1 | **Assisted Squat** | Squat en se tenant à un support (chaise/poteau) | 3×8 |
| 2 | **Squat (air squat)** | Squat libre cuisses sous la parallèle | 3×8 |
| 3 | **Split Squat** | Fente statique, pied arrière au sol | 3×8 / jambe |
| 4 | **Bulgarian Split Squat** | Pied arrière surélevé (banc/marche) | 3×8 / jambe |
| 5 | **Beginner Shrimp Squat** | Genou arrière descendu vers le sol, mains pour contrepoids | 3×8 / jambe |
| 6 | **Intermediate Shrimp Squat** | Une main tient le pied arrière | 3×8 / jambe |
| 7 | **Advanced Shrimp Squat** | Deux mains tiennent le pied arrière, torse droit | objectif final |

Démarrage de chaque séance : tenter **3×8**. Si réussi → progression suivante. Si on ne tient pas **3×5** → régresser ([fitloop](https://www.fitloop.app/guides/recommended-routine)).

### 2.2 Échelle alternative orientée pistol (StartBodyweight / GMB / PowerliftingTechnique)

Cette échelle insère explicitement le **pistol** et ses régressions :

| Étape | Variante | Notes |
|---|---|---|
| 1 | Assisted squat (appui mains) | Cuisses parallèles |
| 2 | Air squat (libre) | Profondeur + contrôle |
| 3 | Split squat | Travail unilatéral, tracking du genou |
| 4 | Bulgarian split squat | Charge relative accrue |
| 5 | **Box pistol** | S'asseoir/se relever sur une boîte ; utiliser **la boîte la plus basse** où l'on garde le pied à plat sans balancier ([gmb.io/pistol](https://gmb.io/pistol/)) |
| 6 | **Pistol assisté** | TRX / poteau / chambranle ; 3–4 ×5–8/côté, assistance suffisante pour forme parfaite et zéro douleur articulaire ([odin.fitness](https://odin.fitness/blog/pistol-squat-progression-guide)) |
| 7 | **Pistol box (boîte basse)** | Pour qui manque de dorsiflexion/force |
| 8 | **Pistol complet** | Jambe libre tendue devant, talon d'appui au sol |
| 9 | **Shrimp squat** | Plus exigeant en mobilité/équilibre que le pistol ([evolveyou](https://www.evolveyou.app/blog/5-progressions-to-master-a-pistol-squat)) |

**Méthode « bottom-up » de GMB pour le pistol** (apprentissage par le bas du mouvement) : (1) lever les blocages → (2) deep squat → (3) roll back → (4) roll up en squat → (5) roll up sur une jambe → (6) « pop up » de plus en plus haut → (7) pistol complet debout. Prérequis mobilité : dorsiflexion (lunge modifié, 5 pulses + tenue 30 s) et deep squat fesses près des talons ([gmb.io/pistol](https://gmb.io/pistol/)).

**Box pistol — règle de hauteur** : utiliser la boîte la plus courte permettant une rep complète, pied à plat, sans élan avant/arrière. À diminuer progressivement.

**Niveaux de shrimp squat** (VAHVA / Fitness Drum) : débutant = mains libres / appui objet, descente du genou sur box (ROM réduite) ; intermédiaire = une main tient le pied, contrepoids réduit ; avancé = deux mains, torse droit, fémur arrière perpendiculaire au sol. Tenues isométriques repères : débutant 3–5 s, intermédiaire 10–15 s, avancé 30 s. Surcharge avancée : **shrimp jambe d'appui surélevée** (ROM accrue) ([vahvafitness.com](https://vahvafitness.com/shrimp-squat-progressions/) ; [fitnessdrum.com](https://fitnessdrum.com/shrimp-squats/)).

### 2.3 Convict Conditioning — « Squat Series » (10 steps, repères de maîtrise)

Système 10 niveaux avec **rep standards de maîtrise** avant de monter. Très haut volume (orienté endurance/conditioning) ([motusvirtute](https://www.motusvirtute.com/10-steps-pistol/) ; [hughbien notebook](https://github.com/hughbien/notebook/blob/master/convict_conditioning.md)).

| Step | Exercice | Standard de maîtrise |
|---|---|---|
| 1 | Shoulderstand squats | 3×50 |
| 2 | Jackknife squats | 3×40 |
| 3 | Supported squats | 3×30 |
| 4 | Half squats | 2×50 |
| 5 | Full squats | 2×30 |
| 6 | Close squats | 2×20 |
| 7 | Uneven squats (appui partiel) | 2×20 |
| 8 | ½ one-leg squats | 2×20 |
| 9 | Assisted one-leg squats | 2×20 |
| 10 | One-leg squats (pistol) | 2×50 / jambe |

> Note : ces standards sont extrêmes (endurance), à utiliser comme repères de progression, **pas** comme cible pour la force pure.

### 2.4 Fentes / lunges — variantes (du plus simple au plus complexe)

| Niveau | Variante | Stimulus |
|---|---|---|
| 1 | Fente statique (split squat) | Apprentissage du pattern, stabilité |
| 2 | Fente avant (reverse lunge plus douce sur genou) | Pattern dynamique |
| 3 | Fente arrière | Moins de stress fémoro-patellaire, plus de chaîne postérieure |
| 4 | Fentes marchées (walking lunges) | Endurance, équilibre dynamique |
| 5 | Fentes sautées (jump lunges) | Pliométrie / puissance (voir §2.7) |

### 2.5 Chaîne postérieure — hinge & ischios

**Échelle hinge de la RR : Romanian Deadlift (au PdC) → Single-Leg Deadlift → Banded Nordic Curl → Nordic Curl**, 3×5–8, critère 3×8 ([Recommended Routine gist](https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb)).

**Glute bridge → hip thrust → single-leg :**
| Étape | Exercice | Prescription | Passage |
|---|---|---|---|
| 1 | Glute bridge au sol | 3–4×12–20, tempo 3-1-3 | 3×15–20 forme parfaite + tenue 30 s sans tremblement |
| 2 | Single-leg glute bridge | jusqu'à 4×15/jambe tempo contrôlé | 4×15/jambe |
| 3 | Hip thrust (dos sur banc) | 3–4×8–12 | ROM et amplitude accrues |
| 4 | Single-leg hip thrust | unilatéral | — |

Attendre **2–3 semaines** par palier avant d'avancer ([xcelerategyms](https://xcelerategyms.com/glute-bridge-progression/) ; [bootybuilder](https://bootybuilder.com/exercises/hip-thrust/programming-sets-reps-tempo/) ; [myomyfitness](https://myomyfitness.com/the-glute-journey-glute-bridge-to-hip-thrust/)).

**Nordic hamstring curl — progressions assistées :**
- Régressions : **bande élastique assistée** (ancre derrière, allège la descente), **ROM réduite**, **appui mains** (push-up en bas pour remonter). ([caliverse](https://www.caliverse.app/exercises/band-nordic-curl-1076) ; [madscientistofmuscle](https://www.madscientistofmuscle.com/1-exercises/hamstring-exercises/band-assisted-resisted-nordic-curls.htm))
- Progression : **bande plus petite**, **ROM plus profonde**, **moins d'aide des mains**, ou ajout de **négatives lentes**.
- Schéma type : **3×5** maintenu sur **6 semaines**, ce qui change = la **difficulté de la descente** (la tempo excentrique est le bénéfice clé). ([barbend](https://barbend.com/nordic-curl/) ; [coach360](https://www.coach360news.com/nordic-hamstring-curls-eccentric-protocol/) ; [straydogstrength](https://straydogstrength.com/blogs/articles/assisted-nordic-hamstring-curls))
- **Single-leg RDL** : entre le RDL bilatéral et le Nordic, travaille hinge unilatéral + équilibre (étape 2 de l'échelle hinge RR).

### 2.6 Mollets & chevilles

| Exercice | Progression | Sets/reps |
|---|---|---|
| **Calf raise double** | → single-leg → single-leg surélevé (ROM accrue) → ajout poids 0,5–1 kg | 3–4×15–20 (débute), tempo lent |
| **Tibialis raise** (orteils vers tibia) | dos au mur → single-leg → pieds plus éloignés du mur (levier accru) → lesté | Déb. 3–4×15–20 ; Int. 3–4×12–15 ; Avancé 2–3×/sem, 3–6 sets, 10–20 reps |

Le tibialis raise développe **absorption de choc, contrôle du pied, stabilité de cheville** (complémentaire du mollet qui développe la poussée) — pertinent pour la descente et la prévention des périostites ([papayya](https://www.papayya.com/blog-posts/tibialis-raise-strengthen-your-shins-for-better-performance) ; [hingehealth](https://www.hingehealth.com/resources/articles/tibialis-raises/) ; [honehealth](https://honehealth.com/edge/tibialis-raises/)).

### 2.7 Pliométrie (progression et prudence)

**Règle d'or** : maîtriser les atterrissages contrôlés (lents) **avant** le réactif ; **bilatéral avant unilatéral** ; quand on augmente l'intensité, on **baisse le volume** (et inversement). Sauter le réactif avant les atterrissages contrôlés charge les tendons plus vite qu'ils n'adaptent ([scienceinsights](https://scienceinsights.org/how-to-program-plyometrics-phases-volume-frequency/) ; [truesportspt](https://www.truesportsphysicaltherapy.com/blogs/plyometric-training-that-builds-power-without-breaking-down-your-body)).

| Niveau | Critère | Exercices | Volume (contacts/séance) | Fréquence |
|---|---|---|---|---|
| **Débutant** | nouveau | atterrissages, squat jumps, box step-ups, broad jumps (atterrissage doux) | **50–80** | 2×/sem |
| **Intermédiaire** | 3+ mois | drop jumps bas (15–20 cm), pogo hops, bonds latéraux, box jumps, split squat jumps | **80–120** | 2–3×/sem |
| **Avancé** | 6+ mois | depth jumps (hauteur adaptée), single-leg bounds, hurdle hops, drop-to-box | **100–140** (intense), jusqu'à 200 (basse intensité) | 2–3×/sem |

**Prudence trail** : pour un coureur, **1–2 séances/sem suffisent**, récup essentielle (demande musculaire élevée). Progresser squats lents → fentes contrôlées → step-downs → drop jumps → descente technique ([trailrunningmovement](https://trailrunningmovement.com/training/eccentric-training/)).

### 2.8 Step-ups / step-downs (excentrique de descente — clé pour le trail)

- **Step-up** : montée concentrique, focus quadriceps/fessier — variante d'entrée.
- **Step-down (eccentric step-down)** : descente **lente et contrôlée** d'une marche/box, qui reproduit la contrainte de la descente en trail (quadriceps en excentrique). Hauteur progressive. Tempo descente **3–5 s**.
Progression : box bas → box haut → single-leg → ajout tempo plus lent / pause. C'est l'exercice « pont » entre la force lente et la pliométrie ([trailrunningmovement](https://trailrunningmovement.com/training/eccentric-training/) ; [precisionpt](https://www.precisionpt.org/post/training-for-the-downhills-how-to-avoid-the-quad-blowout-on-races-with-a-lot-of-downhill)).

---

## 3. Schémas séries/répétitions selon l'objectif

### 3.1 Repères généraux (ACSM)

- **Force** : charges lourdes (~**80 % 1RM**), **2–3 séries/exercice**.
- **Hypertrophie** : volume hebdo élevé (~**10 séries/groupe musculaire/semaine**) ; l'**excentrique en surcharge périodique** améliore la croissance.
- **Puissance** : charges modérées (**30–70 % 1RM**), vitesse concentrique maximale.
- **Fréquence** : ≥ **2×/sem** par groupe musculaire, surcharge progressive indispensable.
- **MàJ 2026 (ACSM/McMaster)** : pour l'adulte sain, l'entraînement a souvent été surcompliqué ; l'échec musculaire, le type de matériel (machines vs poids libres) et la périodisation complexe **n'influencent pas systématiquement** les résultats. L'essentiel = entraîner tous les grands groupes **2×/sem** avec surcharge progressive ([acsm.org 2026](https://acsm.org/resistance-training-guidelines-update-2026/) ; [PMC overview of reviews](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/) ; [theproactiveathlete](https://www.theproactiveathlete.ca/acsm-american-college-of-sports-medicine-just-updated-their-resistance-training-guidelines-heres-what-changed-and-why-it-matters-to-you/)).

### 3.2 Transposition calisthénie (Steven Low / RR)

| Objectif | Schéma calisthénie | Récup | Logique de progression |
|---|---|---|---|
| **Force** | **5×3–5** sur une progression difficile | 2–3 min | Dès >5–6 reps → progression plus dure, baisser les reps |
| **Hypertrophie** | **3×8–12** | 90–120 s | Volume ; ralentir tempo ; durcir variante quand plafond atteint |
| **Endurance musculaire** | **2–3×15–25+** | 30–60 s | Augmenter reps/densité sur variante plus facile |
| **RR (recommandé débutant/inter)** | **3×5–8** | **90 s** (en superset squat/hinge) | viser 3×8 → progression suivante ; si <3×5 → régresser |

([Fundamentals of BW Strength Training](https://stevenlow.org/the-fundamentals-of-bodyweight-strength-training/) ; [Recommended Routine](https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb))

### 3.3 Tempo (prescription)

Notation **excentrique-pause basse-concentrique-pause haute**.
- Contrôle / hypertrophie : **3-1-3** (3 s descente, 1 s pause, 3 s montée). ([bootybuilder](https://bootybuilder.com/exercises/hip-thrust/programming-sets-reps-tempo/))
- Surcharge excentrique trail : **descente 3–5 s** (squat lent, step-down, négatives de pistol/Nordic).
- Isométrie : tenues de 6 s (seuil de progression OG) à 30 s (endurance/contrôle).

---

## 4. Excentrique — pourquoi et comment (focus trail)

**Pourquoi.** En descente, quadriceps et mollets travaillent en **excentrique** (le muscle s'allonge sous charge en absorbant l'impact). Les contractions excentriques causent **beaucoup plus de micro-dommages** que les concentriques → DOMS, « quad blowout ». L'entraînement excentrique **renforce la capacité d'absorption**, rend tissus et tendons plus résilients, améliore le contrôle neuromusculaire et **réduit les dommages musculaires et les DOMS** ([trailrunningmovement](https://trailrunningmovement.com/training/eccentric-training/) ; [exerflysport](https://www.exerflysport.com/blogs/how-to-strengthen-your-descending-eccentric-training-for-trail-running-and-hiking) ; [trailrunnermag](https://www.trailrunnermag.com/training/trail-tips-training/last-longer-downhills-training-eccentric-muscle-contractions/)).

La course en descente augmente les marqueurs de dommage musculaire et **altère la force volontaire maximale** et le développement tardif de la force (RFD) — d'où l'intérêt de pré-conditionner par l'excentrique ([PMC11129977](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11129977/)). Un « repeated-bout effect » existe : une descente non-dommageable protège contre les dommages ultérieurs ([PMC5348007](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5348007/)).

**Comment (exercices excentriques bas du corps) :**
- **Step-downs lents** (3–5 s) — le plus spécifique à la descente.
- **Nordic hamstring curls** (chaîne postérieure ; protocole 3×5, 6 semaines).
- **Négatives** de pistol (descente contrôlée, remontée assistée).
- **Squats / split squats tempo** (descente 3–5 s).
- Progression vers **drop jumps** puis **descente technique**.
**Dosage** : 1–2 séances/sem, récup soignée (sollicitation élevée) ([trailrunningmovement](https://trailrunningmovement.com/training/eccentric-training/) ; [pliability — 14 eccentric quad exercises](https://pliability.com/stories/eccentric-quadriceps-exercises)).

Seuil de progression OG pour l'excentrique : passer à plus dur quand on **contrôle toute l'amplitude > 3 s**.

---

## 5. Structure de séance et de programme

**Échauffement (modèle RR)** : préparation articulaire + activation du pattern avec la **marche d'échauffement la plus facile** de chaque progression (but : réveiller le pattern, **pas** fatiguer). Ex. squat sky reaches 5–10, squat activation 10 reps d'une variante facile ([Recommended Routine](https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb)). Ajouter mobilité cheville/hanche (voir §7).

**Ordre des exercices** : exercices les plus exigeants techniquement et neuromusculairement en premier (pistol/shrimp, pliométrie) quand le système nerveux est frais ; bridges/calf/tibialis en fin. Pour les fessiers, certains préconisent tôt dans la séance pour la connexion neuromusculaire ([NASM](https://blog.nasm.org/how-to-do-a-glute-bridge)).

**Structure RR (référence)** : 3×/sem (ex. lun/mer/ven), **superset** squat-pattern + hinge-pattern, **3×5–8**, repos **90 s** entre séries en alternant les deux exercices ([Recommended Routine](https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb)).

**Fréquence / split** : ACSM → **2×/sem minimum par groupe musculaire**. Pour un débutant/coureur, **full-body 2–3×/sem** est optimal (moins de risque de sous-fréquence qu'un split). Le split n'apporte pas d'avantage clair pour l'adulte général (ACSM 2026).

**Périodisation en calisthénie (Steven Low)** : raisonner la périodisation « à travers le prisme de la progression » ; planifier des **cycles** focalisés sur force, puis hypertrophie, puis travail excentrique/réactif selon la saison, en tenant compte des **autres activités (sport, endurance)** — crucial pour un trailer qui cumule course + renfo. **Déload** périodique pour éviter les plateaux ([stevenlow.org/overcoming-gravity](https://stevenlow.org/overcoming-gravity/) ; [a-beginners-guide-to-overcoming-gravity](https://stevenlow.org/a-beginners-guide-to-overcoming-gravity/)). La MàJ ACSM 2026 relativise la **périodisation complexe** pour l'adulte sain : une progression simple suffit souvent.

> Principe spécifique trail (cohérent avec le plan du projet) : **ne pas empiler le travail quadriceps** (gérer la concurrence course en descente / renfo quad) et **entraîner la descente** (excentrique).

---

## 6. Équilibre musculaire (quadriceps / ischios / fessiers)

- **Ratio H:Q conventionnel** : ischios ≥ **60 % (0,6)** de la force quadriceps = seuil souvent cité pour réduire le risque (notamment LCA) ([mirafit](https://mirafit.co.uk/blog/quad-to-hamstring-ratio-explained/) ; [barcainnovationhub](https://barcainnovationhub.com/the-relationship-between-the-hq-ratio-and-hamstring-injuries/)).
- **Ratio fonctionnel** : mieux décrit par **ischios excentrique / quadriceps concentrique** (pertinent pour décélération/changement de rythme — typique du trail).
- **Caveat scientifique** : une revue systématique conclut que le ratio H:Q a une valeur prédictive **limitée** comme facteur de risque isolé d'atteinte ischio/LCA ; à monitorer **avec** d'autres facteurs modifiables, pas seul ([PMC10199143](https://pmc.ncbi.nlm.nih.gov/articles/PMC10199143/) ; [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2095254622000175)).
- **Risque d'un profil « trop quadriceps »** : surreprésentation quad (renforcée par la course) sans chaîne postérieure → déséquilibre H:Q, stress fémoro-patellaire, vulnérabilité ischio/genou. **Contre-mesures** : prioriser chaîne postérieure (Nordic, RDL/SL-RDL, hip thrust, single-leg glute bridge) et fessiers, et travailler l'**excentrique ischio**. L'entraînement combiné excentrique/concentrique améliore les ratios H:Q ([PMC6835643](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6835643/)).

---

## 7. Mobilité / prévention

**Cheville (dorsiflexion)** — facteur limitant n°1 du squat profond et du pistol.
- **Test knee-to-wall** : gros orteil à ~12,5 cm (5 in) du mur, pousser le genou vers le mur, talon au sol. ≥ **5 in (12,5 cm)** = bonne mobilité ; **< 3 in (7,5 cm)** ou asymétrie marquée = à travailler ([physio-pedia](https://www.physio-pedia.com/Knee_to_Wall_Test) ; [squatuniversity](https://squatuniversity.com/2015/11/05/the-squat-fix-ankle-mobility-pt-1/) ; [runlovers](https://runlovers.it/en/2025/test-knee-to-wall-mobility-ankle/)).
- **Drills** : knee-to-wall mobilisations, lunge modifié (5 pulses + tenue 30 s end-range), frogger (squat profond, talons vers le sol) ([gmb.io/pistol](https://gmb.io/pistol/) ; [precisionmovement](https://www.precisionmovement.coach/ankle-dorsiflexion-exercises/)).

**Hanche** : capacité à s'asseoir en deep squat, fesses près des talons, dos relativement droit = prérequis pistol ([gmb.io/pistol](https://gmb.io/pistol/)). Travailler flexion de hanche, ouverture (90/90), extension (fléchisseurs de hanche).

**Genou** : pas de mobilité « à gagner » mais **tracking** (genou aligné sur les orteils en squat/fente) et renforcement excentrique du quadriceps (step-downs) pour la santé fémoro-patellaire ([precisionpt](https://www.precisionpt.org/post/training-for-the-downhills-how-to-avoid-the-quad-blowout-on-races-with-a-lot-of-downhill)).

---

## 8. Matériel minimal

| Sans aucun matériel (PdC pur) | Avec une simple marche / box | Avec banc/barre/poteau ou bande |
|---|---|---|
| Air squat, split squat, fentes (toutes), shrimp squat, pistol complet, glute bridge sol, single-leg glute bridge, calf raise, tibialis raise (dos au mur), squat/jump squat, broad jump | Box squat, **box pistol** (régression clé), **step-up / step-down excentrique**, Bulgarian split squat (pied arrière sur marche), hip thrust (haut du dos sur banc), box jump, depth/drop jump, calf raise surélevé (ROM) | Pistol assisté (TRX/poteau/chambranle), **Nordic curl assisté à la bande**, ancrage Nordic (sous un meuble lourd), tibialis raise lesté |

Le bas du corps est l'une des zones **les plus accessibles** en calisthénie : la quasi-totalité de l'échelle squat→pistol→shrimp et chaîne postérieure se fait au **poids du corps pur** ; une simple **marche/box** débloque les régressions (box pistol) et l'excentrique de descente (step-downs), les deux plus utiles au trail.

---

## 9. Niveaux : débutant / intermédiaire / avancé (repères bas du corps)

| Critère | Débutant | Intermédiaire | Avancé |
|---|---|---|---|
| **Squat unilatéral** | Maîtrise air squat (3×8+), split squat | Bulgarian split squat 3×8/jambe ; box pistol ; pistol assisté | **Pistol complet** 3×5+/jambe ; shrimp squat |
| **Chaîne postérieure** | Glute bridge 3×15–20 ; RDL au PdC | Single-leg glute bridge ; SL-RDL ; **Nordic à la bande** | **Nordic curl complet** (descente contrôlée toute amplitude) ; hip thrust SL |
| **Mollet/cheville** | Calf raise double 3×15–20 | Single-leg calf raise | SL calf raise surélevé lesté |
| **Pliométrie** | Atterrissages, squat jumps (50–80 contacts) | Drop jumps bas, box jumps (80–120) | Depth jumps, single-leg bounds (100–140) |
| **Mobilité cheville** | knee-to-wall < 3 in (à travailler) | ~3–5 in | ≥ 5 in, deep squat aisé |
| **Tempo/excentrique** | Squat tempo 3 s | Step-down lent single-leg | Négatives pistol/Nordic contrôlées >3 s |

**Repères chiffrés synthétiques** :
- Débutant → intermédiaire : valider **3×8 air squat + Bulgarian split squat + single-leg glute bridge 3×15/jambe**.
- Intermédiaire → avancé : réussir **box pistol / pistol assisté** et **Nordic à la bande** sur l'amplitude.
- Avancé : **pistol complet** propre des deux côtés (repère « élite » Convict Conditioning : one-leg squat à maîtrise, jusqu'à 2×50/jambe en endurance), **Nordic complet**, depth jumps maîtrisés.

---

## Sources

- Steven Low — *Overcoming Gravity 2* (présentation, méthodes de progression) : https://stevenlow.org/overcoming-gravity/
- Steven Low — Fundamentals of Bodyweight Strength Training : https://stevenlow.org/the-fundamentals-of-bodyweight-strength-training/
- Steven Low — A Beginner's Guide to Overcoming Gravity : https://stevenlow.org/a-beginners-guide-to-overcoming-gravity/
- Overcoming Gravity — Book Review & Q&A (calisthenics.com) : https://calisthenics.com/calisthenics-book-review-overcoming-gravity-by-steven-low/
- r/bodyweightfitness Recommended Routine (gist) : https://gist.github.com/sgup/f10f1d57e54b7876495f4bafb6d697eb
- Recommended Routine — guide complet (Fitloop) : https://www.fitloop.app/guides/recommended-routine
- StartBodyweight — Squat progression : http://www.startbodyweight.com/p/squat-progression.html
- GMB — Pistol squat progression : https://gmb.io/pistol/
- PowerliftingTechnique — Pistol Squat Progression : https://powerliftingtechnique.com/pistol-squat-progression/
- EvolveYou — 5 progressions to master a pistol : https://www.evolveyou.app/blog/5-progressions-to-master-a-pistol-squat
- Odin Fitness — Pistol Squat Progression Guide : https://odin.fitness/blog/pistol-squat-progression-guide
- VAHVA Fitness — How to Shrimp Squat (progressions) : https://vahvafitness.com/shrimp-squat-progressions/
- Fitness Drum — Shrimp Squats : https://fitnessdrum.com/shrimp-squats/
- Convict Conditioning — Squat series 10 steps (Motus Virtute) : https://www.motusvirtute.com/10-steps-pistol/
- Convict Conditioning notes (GitHub hughbien) : https://github.com/hughbien/notebook/blob/master/convict_conditioning.md
- Nordic curl bandé (Caliverse) : https://www.caliverse.app/exercises/band-nordic-curl-1076
- Nordic assisté/résisté à la bande (Mad Scientist of Muscle) : https://www.madscientistofmuscle.com/1-exercises/hamstring-exercises/band-assisted-resisted-nordic-curls.htm
- BarBend — Nordic Curl : https://barbend.com/nordic-curl/
- Coach360 — Nordic Hamstring Curls eccentric protocol : https://www.coach360news.com/nordic-hamstring-curls-eccentric-protocol/
- Stray Dog Strength — Assisted Nordic Hamstring Curls : https://straydogstrength.com/blogs/articles/assisted-nordic-hamstring-curls
- Glute bridge progression (XcelerateGyms) : https://xcelerategyms.com/glute-bridge-progression/
- Hip thrust programming sets/reps/tempo (Booty Builder) : https://bootybuilder.com/exercises/hip-thrust/programming-sets-reps-tempo/
- Glute bridge → hip thrust (MyoMy Fitness) : https://myomyfitness.com/the-glute-journey-glute-bridge-to-hip-thrust/
- Glute bridge (NASM) : https://blog.nasm.org/how-to-do-a-glute-bridge
- Tibialis raise (Papayya) : https://www.papayya.com/blog-posts/tibialis-raise-strengthen-your-shins-for-better-performance
- Tib raises (Hinge Health) : https://www.hingehealth.com/resources/articles/tibialis-raises/
- Tibialis raises (Hone Health) : https://honehealth.com/edge/tibialis-raises/
- Plyometrics programming/volume/frequency (ScienceInsights) : https://scienceinsights.org/how-to-program-plyometrics-phases-volume-frequency/
- Plyometric injury prevention / volume (True Sports PT) : https://www.truesportsphysicaltherapy.com/blogs/plyometric-training-that-builds-power-without-breaking-down-your-body
- ACSM 2026 Resistance Training Guidelines : https://acsm.org/resistance-training-guidelines-update-2026/
- ACSM Position Stand — Overview of Reviews (PMC) : https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/
- The Proactive Athlete — ACSM update : https://www.theproactiveathlete.ca/acsm-american-college-of-sports-medicine-just-updated-their-resistance-training-guidelines-heres-what-changed-and-why-it-matters-to-you/
- Eccentric training for trail running (Trail Running Movement) : https://trailrunningmovement.com/training/eccentric-training/
- Eccentric training for descending (Exerfly) : https://www.exerflysport.com/blogs/how-to-strengthen-your-descending-eccentric-training-for-trail-running-and-hiking
- Avoiding the quad blowout (Precision PT) : https://www.precisionpt.org/post/training-for-the-downhills-how-to-avoid-the-quad-blowout-on-races-with-a-lot-of-downhill
- Strength train for downhill running (Trail Runner Mag) : https://www.trailrunnermag.com/training/trail-tips-training/last-longer-downhills-training-eccentric-muscle-contractions/
- 14 best eccentric quad exercises (Pliability) : https://pliability.com/stories/eccentric-quadriceps-exercises
- Downhill running muscle damage / RFD (PMC11129977) : https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11129977/
- Prevention of downhill-induced muscle damage (PMC5348007) : https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5348007/
- Knee-to-Wall test (Physiopedia) : https://www.physio-pedia.com/Knee_to_Wall_Test
- Squat University — ankle mobility : https://squatuniversity.com/2015/11/05/the-squat-fix-ankle-mobility-pt-1/
- Knee-to-wall test (Runlovers) : https://runlovers.it/en/2025/test-knee-to-wall-mobility-ankle/
- Precision Movement — ankle dorsiflexion exercises : https://www.precisionmovement.coach/ankle-dorsiflexion-exercises/
- H:Q ratio & injury (Barça Innovation Hub) : https://barcainnovationhub.com/the-relationship-between-the-hq-ratio-and-hamstring-injuries/
- Quad/hamstring ratio (Mirafit) : https://mirafit.co.uk/blog/quad-to-hamstring-ratio-explained/
- H:Q ratio predictive value — systematic review (PMC10199143) : https://pmc.ncbi.nlm.nih.gov/articles/PMC10199143/
- H:Q ratio review (ScienceDirect) : https://www.sciencedirect.com/science/article/pii/S2095254622000175
- Concentric/eccentric training & H:Q ratios (PMC6835643) : https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6835643/
