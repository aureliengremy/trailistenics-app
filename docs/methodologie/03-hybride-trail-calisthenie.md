# Méthodologie — Hybride : Trail running × Calisthénie (bas du corps)

> **Rôle de ce document.** Base de connaissances *brute* pour la génération de programmes
> trail **hybrides** qui intègrent intelligemment la calisthénie bas du corps. C'est le
> document phare : il porte les **deux principes directeurs du projet** — *ne jamais empiler
> le travail quadriceps* et *entraîner la descente*. Voir
> [`docs/prompts/03-generation-hybride.md`](../prompts/03-generation-hybride.md).
> À lire avec [`01-trail-periodisation.md`](01-trail-periodisation.md) et
> [`02-calisthenie-bas-du-corps.md`](02-calisthenie-bas-du-corps.md). Sources inline + en fin.

---

## 1. Effet d'interférence (concurrent training)

### Mécanismes moléculaires : AMPK vs mTOR

L'entraînement concurrent (force + endurance dans le même cycle) peut réduire le potentiel adaptatif du muscle — phénomène appelé *concurrent training effect* ou *interference effect*.

- **Voie hypertrophie/force** : l'entraînement en force active la voie **mTOR** (mTORC1 → p70S6K1 → S6), qui pilote la synthèse protéique. [GSSI](https://www.gssiweb.org/sports-science-exchange/article/sse-136-using-nutrition-and-molecular-biology-to-maximize-concurrent-training)
- **Voie endurance/aérobie** : l'endurance élève l'AMP intracellulaire et active **AMPK**, CaMK et p38MAPK, qui activent **PGC-1α** → biogenèse mitochondriale. [Frontiers 2025](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1692399/full)
- **Conflit** : l'AMPK phosphorylée (p-AMPK), activée par l'endurance, **inhibe mTORC1 via TSC2**, freinant la synthèse protéique pour économiser l'ATP. C'est le déclencheur moléculaire de l'interférence. [Frontiers 2025](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1692399/full), [PMC3854410](https://pmc.ncbi.nlm.nih.gov/articles/PMC3854410/)

### Ampleur réelle de l'interférence

Point capital : **les réponses moléculaires aiguës (phosphorylation mTOR/AMPK) ne se traduisent PAS linéairement en adaptations chroniques**. La revue semi-systématique 2025 (42 études) ne trouve **pas d'interférence consistante** sur les gains finaux d'hypertrophie ou de force maximale chez l'humain. [Frontiers 2025](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1692399/full)

L'interférence est **modeste et conditionnelle**, surtout problématique pour :
- la **puissance/force explosive** (plus sensible que la force max), [Frontiers 2025](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1692399/full)
- des **fréquences/volumes élevés** d'endurance,
- de l'endurance à **haute intensité** plutôt que basse intensité. [Stronger by Science](https://www.strongerbyscience.com/research-spotlight-interference-effect/)

Pour un coureur trail (ex. 20 km / 740 m D+), l'objectif n'est pas l'hypertrophie maximale mais la **force et la puissance au service de l'économie de course** : le risque d'interférence est donc faible si le séquençage est correct.

### Comment minimiser l'interférence

| Levier | Recommandation chiffrée | Source |
|---|---|---|
| Séparation temporelle même-jour | ≥ 3 h minimum (retour AMPK à la ligne de base), idéalement **6–8 h** | [Frontiers 2025](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1692399/full), [Lift Run Rehab](https://liftrunrehab.com/the-interference-effect-why-you-can-get-stronger-and-faster-at-the-same-time/) |
| Intensité endurance | Garder l'endurance majoritairement **basse intensité** le jour de la force | [Stronger by Science](https://www.strongerbyscience.com/research-spotlight-interference-effect/) |
| Groupes musculaires | Si possible, dissocier (ex. force haut du corps + endurance) — peu applicable au coureur jambes | [Barbell Medicine](https://www.barbellmedicine.com/blog/concurrent-training-and-the-interference-effect/) |
| Nutrition | Apport protéique et glucidique suffisant pour soutenir mTOR post-force | [GSSI](https://www.gssiweb.org/sports-science-exchange/article/sse-136-using-nutrition-and-molecular-biology-to-maximize-concurrent-training) |

---

## 2. Séquençage (séance et semaine)

### Ordre dans une séance (même jour)

- **Priorité = première** : faire en premier la qualité la plus importante du jour. [Lift Run Rehab](https://liftrunrehab.com/the-interference-effect-why-you-can-get-stronger-and-faster-at-the-same-time/)
- **Force d'abord** optimise les adaptations neuromusculaires (force relative, puissance explosive) — sequence "strength-first" favorise CMJ et puissance explosive. [Frontiers 2025](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1692399/full)
- **Si endurance dure le même jour** : faire l'endurance d'abord puis ≥ 3 h avant la force, OU séparer 6 h. [Lift Run Rehab](https://liftrunrehab.com/the-interference-effect-why-you-can-get-stronger-and-faster-at-the-same-time/)
- **Endurance basse intensité + force le même jour** : combinaison la mieux tolérée. [Stronger by Science](https://www.strongerbyscience.com/research-spotlight-interference-effect/)

### Fenêtres de récupération minimales (placement dans la semaine)

| Combinaison | Espacement recommandé | Justification |
|---|---|---|
| Grosse séance jambes (force max/excentrique) → course intense (qualité, côtes) | **48 h minimum** | DOMS + déficit de force neuromusculaire post-excentrique |
| Grosse séance jambes → sortie longue vallonnée | **48–72 h** | sortie longue = charge excentrique additionnelle sur quadriceps |
| Course intense → force jambes | 24 h tolérable si force légère ; 48 h si force lourde | fatigue neuromusculaire résiduelle |
| Force légère/ME → footing facile | même jour OK (séparation 3–6 h) | charge faible |

**Jours à NE PAS coller** (règle d'or du projet « ne jamais empiler le quadriceps ») :
- Renfo bas du corps lourd **+** séance de côtes le lendemain.
- Renfo bas du corps lourd **la veille** de la sortie longue avec D+ important.
- Pliométrie/pistols **+** descente technique dans la même fenêtre de 48 h.

Règle générale : isoler les deux plus gros stress quadriceps de la semaine d'au moins 48 h, et placer la séance de force en début de semaine (ou ≥ 48 h avant la séance clé de course).

---

## 3. Bénéfices de la force pour le coureur (prouvés)

### Économie de course (running economy, RE)

Méta-analyse Sportscience 2024 (effets par méthode, ES = SMD, négatif = amélioration) : [PMC11052887](https://pmc.ncbi.nlm.nih.gov/articles/PMC11052887/)

| Méthode | Effet sur RE | Vitesses concernées |
|---|---|---|
| **Charge lourde (HL, ≥80 % 1RM)** | ES = **−0,266** (p=0,039), *small* | 8,6–17,9 km/h (efficace à toute vitesse, surtout rapide) |
| **Combinée (HL + pliométrie)** | ES = **−0,426** (p=0,018), *moderate* | 10,0–14,5 km/h |
| **Pliométrie** | global NS ; ES = **−0,307** | ≤ 12 km/h seulement |
| **Isométrie / sous-maximal** | non significatif (p>0,13) | — |

- Améliorations individuelles du coût en O₂ : **~3–7 %** (jusqu'à 2–8 % selon Blagrove 2018). [PMC11052887](https://pmc.ncbi.nlm.nih.gov/articles/PMC11052887/), [Blagrove 2018, Sports Med](https://pubmed.ncbi.nlm.nih.gov/29249083/)
- **Implication pour le trail** : la combinaison **force lourde + pliométrie** donne le meilleur ROI sur l'économie ; l'isométrie et le sous-maximal seuls sont inefficaces sur la RE.

### Autres bénéfices établis (Rønnestad & Mujika ; Beattie ; Blagrove)

- **Force maximale ↑** sans hypertrophie excessive (adaptation surtout **neurologique**). [Rønnestad 2014](https://onlinelibrary.wiley.com/doi/abs/10.1111/sms.12104)
- **Puissance / vitesse à VO₂max (vVO₂max) ↑** et temps d'épuisement à vVO₂max ↑. [Rønnestad 2014](https://onlinelibrary.wiley.com/doi/abs/10.1111/sms.12104)
- **Résistance à la fatigue / durabilité** : la force lourde **améliore la performance après travail sous-maximal prolongé** (RE en état fatigué) — crucial en fin de trail. [Vikmoen et al., PMC5350167](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5350167/), [Fisiología del Ejercicio PDF](https://www.fisiologiadelejercicio.com/wp-content/uploads/2025/03/Strength-Training-Improves-Running-Economy-Durability-and-Fatigued.pdf)
- **Prévention des blessures** : l'entraînement en force réduit le risque de blessures de surcharge (overuse) chez les coureurs ; l'excentrique cible spécifiquement ischios et tendons. [Track & Field News](https://trackandfieldnews.com/track-coach/the-effects-of-strength-training-on-distance-running-performance-and-running-injury-prevention/)
- **Délai de fatigue en descente** : meilleure capacité du quadriceps à absorber les charges excentriques (cf. §4).

Durée d'intervention efficace : **8–12 semaines** de force lourde suffisent pour des bénéfices d'endurance. [EJAP 2025 méta](https://link.springer.com/article/10.1007/s00421-025-05883-2)

---

## 4. Excentrique & descente

### Pourquoi c'est central en trail

La course en descente impose une **charge excentrique élevée**, surtout aux **quadriceps**, qui contrôlent la flexion du genou et absorbent l'impact. Les contractions excentriques (muscle qui s'allonge sous charge) sont la principale cause de **dommages musculaires, courbatures (DOMS) et perte de force**. [Running Explained](https://www.runningexplained.com/post/research-rundown-how-to-train-for-downhill-running-reduce-soreness-and-improve-race-day-results), [Nature Sci Rep 2017](https://www.nature.com/articles/s41598-017-06129-8)

### Repeated Bout Effect (RBE)

- **Une seule** séance de descente atténue fortement courbatures et dommages lors d'une répétition **jusqu'à 3 semaines plus tard**. [Higher Running](https://higherrunning.com/the-repeated-bout-effect-eccentric-loading/), [MDPI Sports 2024](https://www.mdpi.com/2075-4663/12/6/169)
- Protection durable **plusieurs semaines** → une séance de descente toutes les **~2 semaines** suffit à maintenir l'adaptation. [Higher Running](https://higherrunning.com/the-repeated-bout-effect-eccentric-loading/)
- Mécanismes : adaptations structurelles (fibres + tissu conjonctif renforcés), neurales (coordination), cellulaires (inflammation réduite, réparation plus rapide). [Run Ultra](https://run-ultra.com/training/repeated-bout-effect/)

### Protocole de progression descente / excentrique

**Séances de descente (course)** : [Higher Running](https://higherrunning.com/the-repeated-bout-effect-eccentric-loading/)
- Intégrer des descentes plus rapides **toutes les 2 à 2,5 semaines durant les 6 dernières semaines** avant la course.
- **Dernière** séance de descente dure : **~2 semaines avant** le jour J (laisser récupérer/adapter).
- Profil routier/peu de dénivelé : **5 à 8 × 1 min en descente contrôlée** en fin de sortie longue.
- Profil ultra/montagne : intégrer une descente roulante mais raide dans la sortie longue, viser **~600 m de D− cumulés** à intensité contrôlée.
- Débuter **conservateur** : effort 5–6/10, faible volume, augmenter progressivement la pente et la vitesse.

**Exercices de force excentrique** (descente lente, contrôlée 3–4 s) : [Higher Running](https://higherrunning.com/the-repeated-bout-effect-eccentric-loading/)
1. **Step-downs** : 8–10 reps/jambe, descente 3–4 s.
2. **Bulgarian split squats** : 8–10 reps/jambe, descente 3 s.
3. **Single-leg RDL** : 8–10 reps/jambe, phase excentrique contrôlée.
4. Wall sits / fentes marchées (complément).

Débuter à **1 set/exercice**, effort 5–6/10 ; progresser vers **4–6 reps** à charge plus lourde en gardant le contrôle. Ne jamais aller à l'échec.

**Timing avant course** : dernière séance excentrique dure **~2 semaines** avant le jour J pour bénéficier du RBE sans fatigue résiduelle. [Running Explained](https://www.runningexplained.com/post/research-rundown-how-to-train-for-downhill-running-reduce-soreness-and-improve-race-day-results)

---

## 5. Le piège de la surcharge quadriceps

### Pourquoi l'empilement surcharge

Côtes (concentrique quadriceps + propulsion), pliométrie/pistols (forte demande quadriceps + excentrique), et sortie longue vallonnée (descente = excentrique quadriceps répété) **sollicitent tous le même tissu**. Empilés dans une fenêtre courte, ils dépassent la capacité de récupération du quadriceps → DOMS chroniques, perte de force, risque de tendinopathie rotulienne / « runner's knee ». [Princeton Medicine](https://www.princetonmedicine.com/blog/quad-dominance-and-running-form-how-it-affects-performance-and-injury-risk), [Ivy Rehab](https://ivyrehab.com/health-resources/running/quad-dominant-runner/)

### Dominance quadriceps : le problème de fond

- Les **fessiers et ischios** doivent piloter l'extension de hanche (propulsion) ; le **quadriceps** travaille surtout en excentrique pour contrôler le genou en descente. [Run Outside](https://run.outsideonline.com/training/injuries-and-prevention/quad-dominant-runner-heres-how-to-fix-it/)
- Quand fessiers/ischios sont sous-actifs, le quadriceps **compense la propulsion** → surcharge, déséquilibre, contraintes accrues sur genou, Achille, lombaires. [The FIT Facility](https://thefitfacility.com/blog/2025/11/6/why-strong-legs-can-still-be-a-weak-link)
- Un **ratio ischios/quadriceps plus élevé** est lié à une meilleure économie de course. [Up & Adam PT](https://www.upnadamptphysio.com/post/unlocking-your-true-running-power-the-posterior-chain)

### Comment équilibrer

- **Privilégier la chaîne postérieure** : RDL/single-leg RDL, hip thrust, Nordic curls, pont fessier, hip hinge — plutôt que d'empiler squats profonds + pistols + pliométrie.
- **Quota quadriceps hebdomadaire** : compter côtes + pliométrie + D− de la sortie longue comme **un seul budget** de charge excentrique quadriceps ; ne pas additionner deux gros stress quad en < 48 h.
- En semaine à forte sortie vallonnée : **réduire** la pliométrie et le travail quadriceps en salle, **maintenir** le travail postérieur (moins de DOMS quadriceps).

---

## 6. Intégration méso/microcycle (placer 1–2 séances renfo dans une semaine de trail)

### Principes de placement (2 à 5 séances de course/sem)

- **1 à 2 séances de renfo bas du corps/semaine** suffisent (fréquence des protocoles validés : 1–4×/sem, le plus souvent 2–3). [PMC11052887](https://pmc.ncbi.nlm.nih.gov/articles/PMC11052887/)
- Placer la force **le jour d'une séance de course facile** ou **un jour à part**, jamais < 48 h avant la séance clé.
- Force **avant** la course facile (priorité neuromusculaire), ou séparée de ≥ 3–6 h. [Frontiers 2025](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1692399/full)

### Microcycle type (4 séances course + 2 renfo)

| Jour | Course | Renfo | Note |
|---|---|---|---|
| Lun | Repos / footing facile | **Force max bas du corps (lourd)** | début de semaine, ≥48 h avant séance clé |
| Mar | Qualité (seuil/VMA) | core léger | pas de quadriceps lourd la veille |
| Mer | Footing facile | — | récup quadriceps |
| Jeu | Footing + lignes droites | **Renfo postérieur + excentrique modéré** | pas de pliométrie lourde |
| Ven | Repos | — | |
| Sam | Sortie longue vallonnée (D+/D−) | — | gros stress quadriceps excentrique |
| Dim | Footing récup | — | |

> **Note de cohérence avec le plan existant** (`plan/plan_trail_descriptif.md`) : le plan 740 m place le renfo le **mardi** *avant* un footing court, les côtes/seuil le **jeudi**, la sortie longue le **dimanche** — une autre répartition valide du même principe (renfo lourd isolé, ≥ 48 h des grosses séances quad). Les deux schémas sont acceptables ; le générateur choisit selon les jours disponibles de l'athlète.

### Réductions selon les phases

- **Pic de charge (volume course max)** : réduire la force à **1 séance/sem**, intensité maintenue, volume coupé ; supprimer la pliométrie lourde pour préserver les jambes. [TrainingPeaks](https://www.trainingpeaks.com/blog/risks-of-concurrent-training/)
- **Affûtage** : voir §7 (maintien à dose minimale).

La force se **maintient avec peu de volume** dès lors que l'intensité reste élevée (cf. §7).

---

## 7. Maintien de la force en affûtage (taper)

- **Déclin minimal** de force pendant les **2–3 premières semaines** de volume réduit ; perte significative seulement après **≥ 4 semaines d'arrêt complet**. [Central Performance](https://centralperformance.com.au/blog/how-to-taper-your-strength-for-optimal-performance)
- **Garder l'intensité haute** : on peut réduire volume et fréquence de **> 30 %** sans perdre les acquis tant que l'intensité reste élevée. [Stronger by Science (tapering)](https://www.strongerbyscience.com/tapering/)
- **Dose minimale de maintien** : ~**1/3 du volume habituel** suffit à retenir la force sur de longues périodes. [Central Performance](https://centralperformance.com.au/blog/how-to-taper-your-strength-for-optimal-performance)
- **Maintien validé sur le terrain** : Rønnestad — après 13 sem à 2×/sem, gains de force et CSA **maintenus avec 1 séance/sem**. [Rønnestad 2014](https://onlinelibrary.wiley.com/doi/abs/10.1111/sms.12104)
- **Durée de taper** : 8–14 jours optimal en général ; pour un trail/marathon, **7–10 j** de force allégée. Dernière séance de force lourde / excentrique dure : **~2 semaines avant** la course. [RunnersConnect](https://runnersconnect.net/when-should-i-stop-strength-training-at-the-gym-before-the-marathon/), [Higher Running](https://higherrunning.com/the-repeated-bout-effect-eccentric-loading/)

**Protocole taper force** : 1 séance/sem, 2–3 exercices clés, charge élevée, **volume très réduit** (1–2 sets, faibles reps), arrêt du travail générant des DOMS ≥ 7–10 j avant le jour J.

---

## 8. Profil « calisthéniste qui se met au trail »

### Atouts à exploiter

- **Force relative élevée** (rapport force/poids), excellente sur pistols, squats, fentes → base neuromusculaire déjà construite, transfert rapide vers force max au service de l'économie de course.
- **Gainage / core fort** : posture, stabilité du tronc en descente technique. (Uphill Athlete : core 2×/sem est la base de tous. [Uphill Athlete KIS](https://uphillathlete.com/strength-training/kis-strength/))
- **Contrôle moteur / proprioception** : utile sur terrain technique, atterrissages, descente.
- Adaptation rapide à la **phase force max** (peu de volume nécessaire, gains surtout neurologiques).

### Lacunes typiques

| Lacune | Risque | Remède |
|---|---|---|
| **Volume aérobie faible** | VO₂max / endurance limitants | progression douce du volume de course (voir ci-dessous) |
| **Chaîne postérieure sous-développée** vs quadriceps (calisthénie souvent quad/push-dominante) | dominance quadriceps, surcharge genou en descente | prioriser ischios/fessiers : RDL, hip thrust, Nordics, ponts |
| **Tendons / articulations / os non habitués au volume de course** | tendinopathies, fractures de fatigue, périostite à la reprise | montée de charge prudente, surfaces variées |

### Construire le plan de reprise (prévention blessure)

- **Progression du volume de course** : la « règle des 10 %/sem » n'est pas une loi (Buist 2007 : pas de différence de blessures vs progression libre ; coureurs blessés ~+30 %/sem, non blessés ~+22 %). [Marathon Handbook](https://marathonhandbook.com/the-10-percent-rule/), [Runners Connect](https://runnersconnect.net/coach-corner/reassessing-the-10-percent-rule/)
- Pour un **novice de la course** : tolérance possible **~20–25 %/sem** sur de courtes périodes, mais **répartir le surplus sur la semaine** plutôt que sur une seule sortie, et **piloter par la réponse** (douleurs tendineuses, sommeil, fraîcheur). [Marathon Handbook](https://marathonhandbook.com/the-10-percent-rule/)
- **Tissus lents à s'adapter** : tendons et os s'adaptent plus lentement que muscles et système cardio. Le calisthéniste aura un cœur/muscles « en avance » sur ses tendons → **bride la progression de course sur les tendons, pas sur l'essoufflement**. Alterner course/marche au début, intégrer des semaines de décharge toutes les 3–4 sem.
- **Exploiter la force existante** : passer rapidement la phase « adaptation anatomique », convertir vers **force max** puis **endurance de force**, en injectant tôt l'**excentrique descente** (RBE) pour blinder des quadriceps non habitués au D−.

---

## 9. Périodisation conjointe (force × course à travers les phases)

### Cadre Uphill Athlete (House/Johnston) — progression force [Uphill Athlete KIS](https://uphillathlete.com/strength-training/kis-strength/)

| Phase force | Durée | Contenu | Charge/format |
|---|---|---|---|
| **Force générale / adaptation anatomique** | 4–8 sem | 10–12 mouvements multi-articulaires en circuit | léger–modéré, volume, tendons |
| **Force max** (neurologique) | 8–16 sem | couplets (ex. tractions lestées + box step-ups) | **6 sets : 4-4-3-3-2-2**, repos 30 s entre exos / 2 min entre couplets, jamais à l'échec (75–90 % effort) |
| **Endurance de force (ME)** | 4–8 sem | circuits spécifiques, charge corps/légère, reps élevées | spécifique au geste montagne |
| **Core** | continu | ~10 exercices de base | **2×/sem toute l'année** |

### Évolution force × course par phase d'un cycle trail

| Phase saison | Course | Composante force | Logique |
|---|---|---|---|
| **Base** | volume aérobie facile croissant | adaptation anatomique → **force max** ; pose des tendons | construire le socle neuromusculaire et tissulaire |
| **Spécifique** | côtes, seuil, sorties longues vallonnées D+/D− | bascule vers **endurance de force** + **excentrique/descente** ; réduire la force max à 1× | spécificité (descente, durabilité), éviter surcharge quadriceps |
| **Pic de charge** | volume/intensité course max | force **1×/sem, intensité maintenue, volume coupé**, pas de pliométrie lourde | préserver les jambes pour la course clé |
| **Affûtage / taper** | volume course ↓, intensité maintenue | force **dose minimale (~1/3 volume, 1×/sem)**, dernière séance lourde ~14 j avant J | maintien des acquis sans fatigue (§7) |

### Modèle de périodisation

- **Bloc séquentiel** (une qualité dominante à la fois) : plus efficace pour produire des gains de force par unité de volume. [Stronger by Science (periodization)](https://www.strongerbyscience.com/periodization-data/)
- **Undulating (DUP)** : alterne charges/qualités jour à jour, adapté pour **maintenir plusieurs qualités simultanément** sur une longue saison — pertinent en phase spécifique trail où force, puissance et endurance coexistent. [Track & Field News](https://trackandfieldnews.com/track-coach/running-periodization-part-3-block-and-undulating-periodization/)
- **Recommandation hybride** : bloc en phase de base (force max isolée), bascule undulating léger en phase spécifique/pic (maintien force pendant que la course monte).

---

## 10. Règles structurantes synthétiques (à coder dans le générateur hybride)

1. **8–12 sem de force lourde** suffisent pour les bénéfices d'endurance ; planifier en base. [EJAP 2025](https://link.springer.com/article/10.1007/s00421-025-05883-2)
2. **Force lourde + pliométrie** = meilleur ROI sur l'économie ; isométrie/sous-max seuls = inefficaces (RE). [PMC11052887](https://pmc.ncbi.nlm.nih.gov/articles/PMC11052887/)
3. **≥ 48 h** entre gros stress quadriceps ; **budget excentrique unique** (côtes + plyo + D− de la longue comptés ensemble).
4. **Chaîne postérieure prioritaire** ; éviter la dominance quadriceps (RDL, hip thrust, Nordics, ponts).
5. **Excentrique/descente** toutes les **~2 sem** ; dernière séance dure **~14 j** avant la course (RBE).
6. **Maintien force en taper** : 1×/sem, intensité haute, ~1/3 volume.
7. **Profil calisthénie** : brider la progression de course sur les **tendons**, pas sur le souffle ; combler la chaîne postérieure ; convertir la force relative existante vers force max → ME.
8. **Deux principes directeurs non négociables (projet)** : *ne jamais empiler le travail quadriceps* · *entraîner la descente*.

---

## Sources

**Effet d'interférence / mécanismes AMPK-mTOR**
- https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1692399/full (revue semi-systématique séquence, 42 études, 2025)
- https://www.gssiweb.org/sports-science-exchange/article/sse-136-using-nutrition-and-molecular-biology-to-maximize-concurrent-training
- https://pmc.ncbi.nlm.nih.gov/articles/PMC3854410/ (signalisation Akt/mTOR/p70S6K1 vs AMPK)
- https://www.strongerbyscience.com/research-spotlight-interference-effect/
- https://www.barbellmedicine.com/blog/concurrent-training-and-the-interference-effect/
- https://www.trainingpeaks.com/blog/risks-of-concurrent-training/

**Séquençage / fenêtres de récupération**
- https://liftrunrehab.com/the-interference-effect-why-you-can-get-stronger-and-faster-at-the-same-time/
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11359207/ (séquence force-endurance et performance)

**Force pour le coureur / économie de course (Beattie, Blagrove, Rønnestad)**
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11052887/ (méta-analyse RE par méthode et vitesse, 2024)
- https://pubmed.ncbi.nlm.nih.gov/29249083/ (Blagrove et al. 2018, Sports Med)
- https://onlinelibrary.wiley.com/doi/abs/10.1111/sms.12104 (Rønnestad & Mujika 2014, revue)
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5350167/ (Vikmoen et al. — durabilité, RE en état fatigué)
- https://link.springer.com/article/10.1007/s00421-025-05883-2 (méta force lourde / déterminants endurance, 2025)
- https://www.fisiologiadelejercicio.com/wp-content/uploads/2025/03/Strength-Training-Improves-Running-Economy-Durability-and-Fatigued.pdf
- https://trackandfieldnews.com/track-coach/the-effects-of-strength-training-on-distance-running-performance-and-running-injury-prevention/

**Excentrique / descente / Repeated Bout Effect**
- https://higherrunning.com/the-repeated-bout-effect-eccentric-loading/
- https://www.runningexplained.com/post/research-rundown-how-to-train-for-downhill-running-reduce-soreness-and-improve-race-day-results
- https://run-ultra.com/training/repeated-bout-effect/
- https://www.nature.com/articles/s41598-017-06129-8 (localisation des dommages, descente)
- https://www.mdpi.com/2075-4663/12/6/169 (RBE descente, coureuses entraînées)

**Surcharge quadriceps / chaîne postérieure**
- https://www.princetonmedicine.com/blog/quad-dominance-and-running-form-how-it-affects-performance-and-injury-risk
- https://run.outsideonline.com/training/injuries-and-prevention/quad-dominant-runner-heres-how-to-fix-it/
- https://ivyrehab.com/health-resources/running/quad-dominant-runner/
- https://www.upnadamptphysio.com/post/unlocking-your-true-running-power-the-posterior-chain
- https://thefitfacility.com/blog/2025/11/6/why-strong-legs-can-still-be-a-weak-link

**Nordic hamstring / prévention blessure**
- https://pubmed.ncbi.nlm.nih.gov/27752982/ (méta NHE, footballeurs, −51 %)
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11311354/ (umbrella review NHE)
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6942028/ (dose-réponse volume NHE)

**Maintien force / taper**
- https://centralperformance.com.au/blog/how-to-taper-your-strength-for-optimal-performance
- https://www.strongerbyscience.com/tapering/
- https://runnersconnect.net/when-should-i-stop-strength-training-at-the-gym-before-the-marathon/

**Périodisation / Uphill Athlete**
- https://uphillathlete.com/strength-training/kis-strength/
- https://www.strongerbyscience.com/periodization-data/
- https://trackandfieldnews.com/track-coach/running-periodization-part-3-block-and-undulating-periodization/
- https://pubmed.ncbi.nlm.nih.gov/22173008/ (bloc vs DUP, athlètes T&F)

**Progression volume de course / reprise**
- https://marathonhandbook.com/the-10-percent-rule/
- https://runnersconnect.net/coach-corner/reassessing-the-10-percent-rule/

---

*Note de fiabilité : les effets sur l'économie de course (méta-analyse) et le maintien de force en taper sont solidement étayés. Les fenêtres de récupération exactes (3 h / 48 h) sont des consensus pratiques fondés sur la cinétique AMPK et les DOMS, à ajuster individuellement. L'effet protecteur du Nordic hamstring est robuste mais avec quelques réserves méthodologiques (études à risque de biais).*
