# Bilan final de mission — Al Miftah / Kunz el Ouloum

**Périmètre** : analyse de l'audience YouTube SVT BAC Algérie → identification des leçons
critiques → audit de l'application → comblement des manques → mesure de l'apprentissage.
**Période** : sprints 1 → 68. **Branche** : `arena/01a0df17-kunz-el-ouloum`.
**Volume de code** : **215 commits**, **174 fichiers**, **+31 870 / −558 lignes**.
**État de la suite de tests** : **1 901 verts / 4 skipped / 0 échec** sur **151 fichiers**.

---

## 1. Socle de données : ce qui a été mesuré

### 1.1 Corpus YouTube analysé

| Chaîne | Rôle dans l'analyse | Vidéos relevées | Audience relevée |
|---|---|---|---|
| **@prof-ketfi.cherif-zina** | référence principale (~1 M abonnés) | **649** en 30 playlists | **19,1 M vues** |
| **@Profchaouch** | série A→Z : 1 vidéo/unité, format constant | 7 + 31 (U4) + 166 | 0,80 M (A→Z) · **4,06 M** (U4 2019) |
| **@Prof_benotmane** | granularité fine sur l'immunité | 15 (U4) | 0,80 M |
| **@MostafaBdd** | positionnement exercices + cartes mentales | 184 dont **121 d'exercices** | 1,50 M |
| **@ikramscience8424** | « أفكار التمارين » par session 2019→2025 | 17 (13 h 51) | 1,25 M |
| **Total** | 5 chaînes | **≈ 1 070 vidéos** | **≈ 27 M vues** |

Données brutes conservées : `data/youtube_ketfi_catalog.json`,
`data/youtube_multichaines_catalog.json`, `data/youtube_ikram_catalog.json`.
Méthode : relevé public des pages `/playlists` (pas de clé API), vues telles
qu'affichées par YouTube — donc arrondies, et non strictement additives entre
playlists.

### 1.2 Demande par unité, mesurée chez Ketfi (3AS uniquement)

| Unité | Vidéos | Vues | **Vues / vidéo** |
|---|---|---|---|
| **U1** تركيب البروتين | 48 | 5 554 350 | **115 716** |
| **U2** بنية ↔ وظيفة البروتين | 25 | 2 118 109 | **84 724** |
| **U4** المناعة | 61 | 4 429 930 | **72 622** |
| **U3** الإنزيمات | 32 | 2 192 465 | 68 515 |
| **U6** التركيب الضوئي | 39 | 2 019 360 | 51 778 |
| **U5** الاتصال العصبي | 44 | 2 174 772 | 49 427 |
| **U7** التنفس والتخمر | 8 | 291 531 | 36 441 |
| Géologie (U8–U11) | 1 | 16 192 | 16 192 |

**Lecture décisive** : U2 n'a que 25 vidéos mais **84 724 vues par vidéo** — deuxième
rang. Une unité peu couverte et très regardée est exactement la signature d'une
difficulté non traitée. C'est ce croisement, et non le volume brut, qui a fondé la
liste des 5 leçons prioritaires.

### 1.3 Corroboration par le temps d'exposition (Chaouch, format constant)

| Unité | Durée du cours A→Z | Vues |
|---|---|---|
| **U4** | **8 h 26** | 1,30 M |
| U5 | 3 h 39 | 580 K |
| U1 | 3 h 18 | 1,20 M |
| U6 | 3 h 09 | 319 K |
| U7 | 3 h 02 | 427 K |
| U2 | 2 h 18 | 513 K |
| U3 | 1 h 49 | 371 K |

Un professeur qui consacre **8 h 26** à l'immunité contre 1 h 49 aux enzymes publie
un jugement de difficulté. Sa playlist U4 2019 (31 vidéos, **4,06 M vues**) se
décompose en : خلطي 264 K · خلوي 815 K · coopération **616 K** · VIH 414 K ·
ذات/لاذات 328 K.

### 1.4 Difficulté ressentie (agrégat multi-chaînes, indice 0–100)

| Rang | Notion | Indice |
|---|---|---|
| 1 | المرحلة الكيموضوئية (U6) | **83** |
| 2 | سلوك الأحماض الأمينية / pHi (U2) | **73** |
| 3 | المناعة الخلطية (U4) | 69 |
| 4 | الذات واللاذات (U4) | 65 |
| 5 | المناعة الخلوية (U4) | 65 |

### 1.5 Pression réelle à l'examen — 10 sessions officielles 2017 → 2026

Dépouillement intégral de **59 exercices** sur **10 sessions consécutives**
(`src/data/bacSessionIndex.ts`, sujet **et** corrigé officiels liés) :

| Unité | Points | Part | Apparitions | Poids annoncé | Écart |
|---|---|---|---|---|---|
| **U4** | 82 | **20,8 %** | 13 | 13 | +7,8 |
| **U1** | 75 | 19,0 % | **17** | 10 | **+9,0** |
| **U5** | 74 | 18,7 % | 11 | 16 | +2,7 |
| **U3** | 58 | 14,7 % | 15 | 13 | +1,7 |
| **U6** | 51 | 12,9 % | 7 | 20 | **−7,1** |
| **U2** | 22 | 5,6 % | **13** | 9 | −3,4 |
| U7 | 13 | 3,3 % | 4 | 19 | **−15,7** |
| U8–U11 | 5 | 1,3 % | 1 à 5 | 5 | −3,7 |

**Trois conclusions contre-intuitives, chiffrées :**

1. **U1 compte 17 apparitions sur 10 sessions** (plusieurs exercices par session) pour
   un poids annoncé de 10 — c'est l'unité la plus sous-estimée du programme.
2. **U7 est surévaluée de 15,7 points** : 19 annoncés, 3,3 % observés. Y investir
   comme le programme le suggère est une erreur d'allocation.
3. **U2 est un piège de fréquence** : 13 apparitions mais seulement 5,6 % des points.
   Elle doit être *sue*, pas *travaillée longuement* — exactement l'inverse de ce que
   son taux de vues/vidéo laisse croire.

L'application n'arbitre pas entre ces deux sources : `revisionPlan.unitWeight()`
prend la **moyenne du poids annoncé et du poids observé**, et les deux valeurs
restent exportées séparément (`declaredWeight`, `observedWeight`). Les chiffres sont
verrouillés par un test de synchronisation (`prioritesMesurees.sync.test.ts`) : toute
dérive entre la doc et le code casse la CI.

### 1.6 Données structurelles de l'épreuve

Coefficient **6** · 2 sujets au choix · exercice 1 = **05 pts de restitution** ·
barème **5/7/8**, uniforme sur tout le corpus · invariant : 20 points.

---

## 2. Les 5 leçons prioritaires et leur couverture

| # | Leçon | Justification croisée | Livrables prescrits | État |
|---|---|---|---|---|
| 1 | **pHi / acides aminés** (U2) | difficulté 73 + 84 724 vues/vidéo | micro-fiches + simulateur pH→charge→migration | ✅ |
| 2 | **Coopération immunitaire** (U4) | 616 K vues + 20,8 % des points | schéma-bilan interactif + 3 exercices BAC | ✅ |
| 3 | **Inhibiteurs enzymatiques** (U3) | 15 apparitions / 10 sessions | comparatif + atelier 6 courbes | ✅ |
| 4 | **CMH / ABO-Rh + prérequis 2AS** (U4) | trou de prérequis identifié chez 3 chaînes | module de rattrapage 15 min | ✅ |
| 5 | **Phase photochimique** (U6) | difficulté **83** — rang 1 | synthèse d'unité + 5 micro-fiches | ✅ |

**Backlog d'audit : vide depuis le sprint 16.** Vérification automatisée :
`livrablesPrioritaires.test.ts`. Synthèse : `ETAT_LIVRABLES_5_LECONS.md`.

---

## 3. Ce qui a été construit

### 3.1 Contenu pédagogique

| Élément | Quantité |
|---|---|
| Capsules de cours (≤ 25 min par domaine) | **32** |
| Schémas interactifs | **18** |
| Situations-problèmes | **23** |
| Cartes mentales | **11** |
| QCM | **549** |
| Exercices BAC indexés | **65** (10 sessions) |
| Montages d'exercices typés | **13** (0 exercice non classé) |
| Familles de consignes | **12** (classement total) |

### 3.2 Moteurs

- **`bacSessionIndex.ts`** — banque « أفكار التمارين » : `ideasForYear`, `ideasForUnit`,
  `unitPressure`, `observedUnitSharePercent`, `verbFrequency`, `searchIdeas`,
  `bacEchoFor{Situation,Capsule,Drill}`. Chaque capsule de cours affiche donc
  *« cette notion est tombée en 2019, 2022, 2024 »* avec le lien du sujet et du corrigé.
- **`revisionPlan`** — 6 gestes (`capsule · schema · montage · redaction · situation ·
  carte`), 2 passages max par unité et par tour, mode consolidation ; moteur de file à
  curseur par (unité, geste).
- **`mockExam.ts` / `MockExamPanel`** — BAC blanc déterministe au barème 5/7/8, 3 unités
  et 3 sessions distinctes garanties.
- **`examTimer.ts` / `examSession.ts` / `useWallClock.ts`** — chronométrage lu sur
  l'horloge système (et non sur des ticks), persistant à la fermeture de l'onglet ;
  réserves 15 + 15 min.
- **`answerStructureCheck.ts` / `verbDemands.ts`** — contrôle de la **forme** des
  réponses rédigées : chiffres, unités, connecteur causal, structure attendue par
  famille de consigne.
- **`learningLog.ts` / `learningProgress.ts`** — journal d'apprentissage et verdicts de
  progression (seuils : 6 rédactions, 4 par famille, bruit ± 5 points).
- **`backup.ts` / `BackupPanel`** — export-import `kunz.backup.v1`, jetons exclus.

### 3.3 Performance et robustesse

| Indicateur | Avant | Après |
|---|---|---|
| Bundle d'entrée | 3 968 Ko | **599 Ko** (−85 %) |
| Chunk des leçons | 996 Ko | **448 Ko** |
| Vendors | monolithe | `vendor-react` 194 · `vendor-motion` 129 · `vendor-icons` 52 |
| Vues chargées à la demande | 0 | **21** (`React.lazy`) |

Plafonds appliqués en CI : 700 Ko à l'entrée, 800 Ko par chunk (`npm run test:build`,
14 tests). Mode hors ligne : `dist/assets-manifest.json` consommé par `public/sw.js`,
plus `ChunkErrorBoundary` pour la reprise après déploiement.

**Résilience serveur** : l'application démarre désormais sans `JWT_SECRET`
(secret éphémère en dev) et sans binaire natif `better-sqlite3` (mode dégradé
explicite, `server/store.degraded.ts`) — deux pannes réelles rencontrées au
lancement et corrigées.

**Accessibilité** : trois suites dédiées (`accessibilite.test.ts`, `clavier.test.ts`,
`focusVisible.test.ts`) ; conversion des `div onClick` en `button` par ancre
`data-testid`.

---

## 4. Mesure de l'apprentissage (sprints 61 → 63)

La dernière phase répond à la question *« comment sait-on que l'élève apprend ? »*.

| Signal | Preuve apportée |
|---|---|
| XP, séries, minutes | régularité seulement |
| Tâches cochées | programme suivi |
| Score QCM | reconnaissance |
| Schéma refait de mémoire (/16) | restitution active |
| Réponse rédigée | production |
| **Tendance de la forme dans le temps** | **apprentissage** |

Le verdict compare le taux d'exigences de forme satisfaites entre la **première** et
la **seconde moitié** des réponses rédigées, par famille de consigne. L'application
**refuse de conclure** sous 6 rédactions (« أي حكم يكون تخميناً ») et ignore les
variations inférieures à 5 points. Le bloc est repris sur la feuille imprimable
**تقرير للأستاذ**, qui porte la mention **« هذا التقرير لا يحمل أي علامة »**.

Guide complet : `COMMENT_SAVOIR_SI_L_ELEVE_PROGRESSE.md`.

---

## 5. Livrables documentaires (`docs/analyse/`, 11 documents)

| Fichier | Contenu |
|---|---|
| `ANALYSE_CHAINE_YT_KETFI_CHERIF_ZINA.md` | analyse de la chaîne de référence |
| `ANALYSE_CHAINES_YT_COMPLEMENTAIRES.md` | 4 chaînes de corroboration |
| `BILAN_LECONS_DIFFICILES.md` | leçons les plus vues / notions difficiles |
| `BILAN_DETAILLE_BAC_SVT.md` | bilan étendu de l'épreuve |
| `PLAN_LECONS_A_RENFORCER.md` | les 5 leçons et leurs livrables |
| `AUDIT_APP_5_LECONS_PRIORITAIRES.md` | journal d'audit, sprints 1 → 62 |
| `PRIORITES_REVISEES_10_SESSIONS.md` | chiffres des 10 sessions (verrouillés par test) |
| `ETAT_LIVRABLES_5_LECONS.md` | couverture livrable par livrable |
| `VISION_MARKETING.md` | positionnement produit |
| `ACCROCHE_ELEVE_LEVIERS.md` | leviers d'engagement |
| `COMMENT_SAVOIR_SI_L_ELEVE_PROGRESSE.md` | mesure de l'apprentissage |

---

## 6. État des tâches

### Terminé ✅

Analyse des 5 chaînes · bilan des leçons difficiles · bilan détaillé de l'épreuve ·
plan des leçons à renforcer · audit de l'application · **les 5 leçons prioritaires et
l'intégralité de leurs livrables** · dépouillement des 10 sessions officielles ·
13 montages et 12 familles de consignes (classement total) · BAC blanc · chronométrage
d'examen · sauvegarde-restauration · mode hors ligne · optimisation −85 % · audits
d'accessibilité · mode dégradé serveur · chaîne de mesure de l'apprentissage.
**Backlog d'audit vide. Suite verte. Tout est poussé.**

### Ajouté après le bilan (sprints 64 → 68) ✅

| Sprint | Apport |
|---|---|
| 64 | la leçon active **annonce son contrat** avant de commencer : « لا يتقدّم قبل أن تجيب » |
| 65 | **rappel espacé** de ce que l'élève a écrit (paliers 1/3/7/16, plafond 3/jour) |
| 66 | le **schéma refait de mémoire laisse une trace** : journal, écart avec la tentative précédente, bloc « الاسترجاع » distinct de la production |
| 67 | le rappel espacé **couvre aussi les schémas** (plafond 2/jour, repos de 7 jours quand c'est su) |
| 68 | verrou de non-régression : les **deux journaux entrent dans la sauvegarde** ; documentation remise à jour |

Ces cinq sprints répondent au même constat : l'application mesurait bien la
production écrite mais laissait s'évaporer le deuxième geste le plus coûteux
(le dessin de mémoire), et ne faisait jamais revenir ce qui avait été produit.

### En cours 🟡

Rien. Le sprint 68 est clos et poussé.

### Réserves techniques connues ⚠️

1. **`better-sqlite3`** n'a pas de binaire natif dans cet environnement : le serveur
   tourne en mode dégradé. Un `npm rebuild` sur une machine avec chaîne de compilation
   lève la limite — aucun changement de code requis.
2. Les **compteurs de vues YouTube sont arrondis** par la plateforme ; les ordres de
   grandeur sont fiables, les unités ne le sont pas.
3. Quelques vidéos masquées dans les playlists relevées (9 chez Chaouch U4, 5 chez
   Ikram) : les totaux sont des planchers.

---

## 7. Conclusion

La mission partait d'une question d'audience — *quelles vidéos sont les plus vues* —
et s'est terminée sur une question d'efficacité — *comment prouver qu'un élève
progresse*. Entre les deux, trois résultats structurent le produit :

1. **Le volume de vues ne désigne pas les priorités.** Le bon indicateur est le
   **croisement** vues/vidéo × temps d'exposition professeur × points réellement
   distribués au BAC. Il désigne U1 et U4, pas U7 malgré son poids annoncé de 19.
2. **L'application ne tranche pas entre le programme officiel et la réalité
   statistique** : elle moyenne les deux et expose les deux. C'est défendable devant
   un inspecteur comme devant un élève.
3. **La mesure de l'apprentissage est volontairement sévère.** Pas de félicitation
   sous 6 rédactions, pas de tendance sous 5 points d'écart, aucune note attribuée,
   aucun jugement sur le fond scientifique. Un tableau de bord qui félicite tout le
   monde ne sert personne — c'est cette retenue qui rend le verdict « تقدّم واضح »
   exploitable quand il apparaît.
