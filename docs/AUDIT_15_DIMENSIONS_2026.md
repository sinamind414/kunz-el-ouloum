```
╔═══════════════════════════════════════════════════════╗
║               RAPPORT D'AUDIT COMPLET                 ║
║   APPLICATION SVT BAC ALGÉRIE — Kunz El Ouloum        ║
║              (كنز العلوم)                              ║
║   Date : 12 août 2026 — Version : commit aea890c      ║
╚═══════════════════════════════════════════════════════╝
```

**Objet audité :** dépôt `sinamind414/kunz-el-ouloum` — React 19 / Vite 6 / TypeScript + Capacitor 8, offline-first, arabe RTL
**Cadre :** 15 dimensions, grille a)→i), format Parties I–VIII
**Commanditaire :** non renseigné (Section C du brief laissée vide) — audit conduit en posture *investisseur / due diligence*, la plus exigeante

> **Préambule sur les Sections A/B/C du brief.** Elles n'ont pas été remplies. Plutôt que de bloquer, j'ai audité **le dépôt réel**, qui est une source supérieure à un questionnaire déclaratif : le code ne ment pas. Les champs non renseignables (note store, installations, avis) sont traités en **[AUDIT LIMITÉ]** et n'entrent pas dans la moyenne pondérée.

---

# ━━━ PARTIE I — RÉSUMÉ EXÉCUTIF ━━━

## 1.1 NOTE GLOBALE : **49 / 100**

| Bloc | Score | Commentaire |
|---|---|---|
| Pédagogie & contenu | **12 / 30** | Le contenu est le point faible, pas la technique. 98,4 % du corpus est généré, les explications sont tautologiques |
| Expérience utilisateur | **13 / 25** | Structure correcte, mais onboarding cassé et accessibilité négligée |
| Qualité technique | **13 / 20** | Build sain, offline sérieux ; fonctionnalités de base absentes |
| Stratégie & business | **7 / 15** | Différenciation réelle, mais aucun modèle économique et promesses non tenues |
| Conformité & sécurité | **4 / 10** | CGU contredites par le code, sur un public mineur |

## 1.2 VERDICT GLOBAL

- ☐ A — Excellence
- ☐ B — Bonne qualité
- ☑ **C — Correcte : utilisable mais nécessite des améliorations significatives**
- ☐ D — Insuffisante
- ☐ E — Critique

**Nuance indispensable :** le C est une moyenne qui masque une bimodalité. L'infrastructure mérite un B ; le contenu évaluatif mérite un **D**. Un produit éducatif se juge sur ce qu'il enseigne, pas sur son temps de build — d'où le maintien en C plutôt qu'en B.

## 1.3 CAPACITÉ RÉELLE À AIDER UN ÉLÈVE À RÉUSSIR LE BAC SVT

### Score de confiance : **4 / 10**

L'application apporte une valeur réelle sur trois points : 23 leçons rédigées disponibles hors ligne, un module de méthodologie qui encode de vraies règles de rédaction d'examen, et des exercices d'analyse documentaire sérieux sur le domaine 1. Mais son volume principal — 508 QCM — est **devinable à 49,4 % sans aucune connaissance SVT** (mesuré), et **98,4 % des explications se contentent de recopier la bonne réponse**. L'élève accumule donc des scores flatteurs sans construire de compréhension. Le risque dominant n'est pas l'inefficacité, c'est **la fausse confiance avant un examen national** : un élève à 70 % dans l'app est plausiblement à ~40 % de maîtrise réelle.

## 1.4 TOP 5 DES FORCES

| # | Force | Preuve |
|---|---|---|
| **F1** | **Offline-first authentique**, pas un argument marketing | Service worker à caches versionnés, précache des 23 leçons ; tuteur **sans aucun appel LLM/API** — vérifié par grep exhaustif |
| **F2** | **Sobriété exemplaire en données et permissions** | **2 permissions Android** (`INTERNET`, `ACCESS_NETWORK_STATE`) ; 0 SDK publicitaire ; 0 dark pattern ; 0 vulnérabilité npm ; CSP stricte |
| **F3** | **Le `ValidationEngine` est un vrai actif pédagogique** | Encode les lois de rédaction SVT algériennes : « كلما…كلما » sur quantitatif, « بينما » sur qualitatif, PPM ≠ PPSE, ACh = canaux ligand-dépendants. Ce sont des finesses d'enseignant |
| **F4** | **Les 8 QCM rédigés à la main (ids 501–508) sont excellents** | Explications mécanistiques réelles, distracteurs plausibles. **L'équipe sait faire — elle ne l'a fait que 8 fois sur 508** |
| **F5** | **Base technique saine et mesurée** | `tsc --noEmit` exit 0 ; build 6,25 s ; **173 kB de JS gzip** — soit bien mieux que les « 291 kB » annoncés dans la doc interne |

## 1.5 TOP 5 DES FAIBLESSES

| # | Faiblesse | Preuve mesurée |
|---|---|---|
| **W1** | **Le correcteur de réponses ouvertes note du charabia 20/20** | Test d'intrusion sur les **12 verbes** : soupe de mots-clés = 19–20/20 PASS partout ; le seul mot « نعم » = **11–17/20**. Cause : `computeScore` part de 20 et ne fait que soustraire |
| **W2** | **500/508 explications sont tautologiques** | Format « ‹terme› يرتبط هنا بـ : ‹bonne réponse› ». Vérification littérale : **500/500** contiennent le texte exact de la bonne option. Moyenne 64 caractères |
| **W3** | **~49 % des QCM devinables sans savoir** | Heuristique « option la moins recyclée » : **251/508 = 49,4 %** (hasard 25 %). 38 distracteurs réutilisés ≥5×, jusqu'à **41×** |
| **W4** | **Le « Défi BAC » ne respecte pas la structure officielle** | Officiel : **20 points** = Partie 1 (15 pts, 2 exercices) + Partie 2 (5 pts, situation d'intégration), sur **deux domaines différents**. L'app génère **28 / 20 / 34 points** sur **un seul** domaine, sans structure en parties |
| **W5** | **CGU mensongères sur un public mineur** | `TermsModal` promet « aucune donnée sur serveur externe » ; `telemetryService` envoie **8 événements** à Supabase avec `user_id`. **Aucun consentement, aucun opt-out** |

## 1.6 NIVEAU DE RISQUE GLOBAL

☐ Faible ☐ Modéré ☑ **ÉLEVÉ** ☐ Critique

| Type | Niveau | Motif |
|---|---|---|
| Pédagogique | **ÉLEVÉ** | Scores surévalués ×2 avant un examen d'orientation |
| Juridique / éthique | **ÉLEVÉ** | Télémétrie non consentie sur mineurs, contredisant les CGU |
| Réputationnel | **ÉLEVÉ** | « J'ai écrit *oui* et j'ai eu 17/20 » suffit à tuer le produit |
| Technique | **FAIBLE** | Build sain, offline solide, sécurité sobre |
| Business | **MOYEN** | Aucun modèle économique, mais aucune dette toxique |

---

# ━━━ PARTIE II — TABLEAU DE SCORING ━━━

| Dimension | Score /10 | Priorité correction | Risque |
|---|---|---|---|
| 1. Conformité programme BAC | **6** | P1 | Élevé |
| 2. Exactitude scientifique | **6** | P1 | Modéré |
| 3. Qualité exercices/évaluations | **3** | **P0** | **Critique** |
| 4. Supports visuels/multimédia | **6** | P2 | Modéré |
| 5. UX/UI | **6** | P2 | Modéré |
| 6. Engagement apprenant | **5** | P1 | Élevé |
| 7. Accessibilité | **4** | P2 | Modéré |
| 8. Performance technique | **7** | P2 | Faible |
| 9. Fonctionnalités clés | **4** | P1 | Élevé |
| 10. Localisation Algérie | **7** | P2 | Modéré |
| 11. Monétisation & éthique | **5** | **P0** | **Critique** |
| 12. Sécurité & confidentialité | **6** | **P0** | **Critique** |
| 13. Positionnement concurrentiel | **5** | P3 | Modéré |
| 14. Réputation & avis | **[AUDIT LIMITÉ]** | — | — |
| 15. Potentiel de croissance | **6** | P3 | Faible |
| **MOYENNE (14 dimensions notées)** | **5,4 / 10** | — | **Élevé** |

*Pondération appliquée pour la note /100 : dimensions 1–3 (pédagogie) comptent double. Un produit éducatif qui n'enseigne pas ne se rattrape pas sur son temps de build.*

---

# ━━━ PARTIE III — AUDIT DÉTAILLÉ PAR DIMENSION ━━━

## DIMENSION 1 — Conformité au programme officiel SVT BAC Algérie

**a) Score : 6/10.** Couverture notionnelle correcte, mais la **structure d'examen est fausse**, ce qui pèse lourd sur une app de préparation.

**b) Constats positifs.** Les 11 unités correspondent fidèlement aux **3 domaines officiels** de la 3AS Sciences Expérimentales : التخصص الوظيفي للبروتينات / تحويل الطاقة على مستوى ما فوق البنية الخلوية / التكتونية العامة. Répartition équilibrée des QCM (37 à 61 items par unité, aucune unité orpheline). Convention bilingue des manuels algériens respectée (terme arabe + français entre parenthèses).

> ### ⚠️ Correction importante de la checklist du brief
> La grille fournie en Dimension 1 liste un **« DOMAINE 2 — BRASSAGE GÉNÉTIQUE »** (méiose, dihybridisme, arbres généalogiques) et un domaine immunologie autonome. **Cette structure ne correspond pas au programme algérien 3AS Sciences Expérimentales.** Vérification faite : la méiose et les lois de transmission des caractères (آليات انتقال الصفات الوراثية) relèvent du programme de **2AS**, pas de la terminale. L'immunologie n'est pas un domaine autonome : c'est **l'unité 4 du domaine 1** (دور البروتينات في الدفاع عن الذات). La grille proposée décrit plutôt le programme français ou marocain.
> **Conséquence pour l'audit :** l'absence de génétique mendélienne dans l'app **n'est pas un défaut** et ne doit pas être pénalisée. J'aurais produit un faux positif majeur en appliquant la checklist telle quelle. La matrice de couverture en Partie VII est donc bâtie sur le **programme algérien réel**.

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Critique** | **Structure d'examen non conforme.** Officiel : épreuve sur **20 points**, Partie 1 = 15 pts (2 exercices indépendants, max 2 documents chacun), Partie 2 = 5 pts (situation d'intégration, max 3 documents, max 2 questions), **les deux parties portant sur des domaines différents**. L'app génère un « examen » **mono-domaine** totalisant **28 / 20 / 34 points** selon le domaine, sans aucune structure en parties |
| **Majeur** | **Verrouillage séquentiel** des unités 2→11 (`isLocked: true`, déverrouillage via `completedUnits.includes(unit.id - 1)`). Un élève de mars voulant réviser la tectonique doit d'abord terminer 9 unités |
| **Modéré** | **Trous de couverture** : **0 question** sur vaccination/sérothérapie, **0** sur collision continentale et chaînes de montagnes, **0** sur métamorphisme, **1** sur les mutations, **2** sur la phosphorylation oxydative, **3** sur la dorsale |
| **Mineur** | Corpus **migré** d'un ancien projet Flutter, jamais construit depuis le programme officiel |

**d) Preuves.** `npx tsx` sur `generateBacExam(d)` → `domaine 1 : 6 items / 28 pts / 50 min` ; `domaine 2 : 4 items / 20 pts / 80 min` ; `domaine 3 : 7 items / 34 pts / 110 min`. Parsing par mot-clé des 508 énoncés pour les trous de couverture.

**e) Impact apprenant.** Choc de format le jour J : l'élève découvre une épreuve en deux parties sur deux domaines alors qu'il s'est entraîné sur un bloc mono-domaine. Il n'a jamais rencontré la « situation d'intégration » (5 pts) — l'exercice le plus discriminant. Impasse involontaire sur métamorphisme et collision, classiques de la partie géologie.

**f) Impact business.** Un enseignant qui ouvre le module « Défi BAC » identifie la non-conformité en trente secondes. Aucune prescription possible en établissement, donc aucun canal B2B.

**g) Recommandations.** (1) **P1 —** Refondre le générateur sur le modèle officiel : 20 pts, 15+5, deux domaines distincts, situation d'intégration explicite. (2) **P1 —** Intégrer les annales officielles (ency-education recense les sujets depuis 2008 avec corrigés). (3) **P2 —** Combler les 6 trous (~40 items). (4) **P2 —** Remplacer le verrouillage par une recommandation non contraignante.

**h) Effort :** Moyen (structure) à Élevé (annales). **i) Priorité : P1.**

---

## DIMENSION 2 — Exactitude scientifique et rigueur du contenu

**a) Score : 6/10.** Les échantillons lus sont justes ; c'est la **méthode de production** qui n'offre aucune garantie.

**b) Constats positifs.** Points délicats correctement traités : sens de lecture du brin transcrit (3'→5') et synthèse de l'ARNm (5'→3') ; rôle du polysome ; les 4 éléments de l'activation d'un acide aminé. Le `ValidationEngine` encode des distinctions que beaucoup d'apps ratent : ACh → canaux **ligand-dépendants (nicotiniques)** et non voltage-dépendants ; **PPM** et non PPSE à la plaque motrice (sévérité *critical*) ; fibrillation ≠ tétanie (question de dose). Terminologie arabe conforme aux manuels.

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Majeur** | **Aucune trace de relecture scientifique** : pas de champ `reviewedBy`, pas de changelog de correction, pas de nom d'enseignant. 500 items générés sont **non relus par construction** |
| **Majeur** | **Distracteurs scientifiquement absurdes** plutôt que didactiquement faux. « يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس » (40×) et « يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا » (35×) apparaissent sur des questions sans rapport |
| **Modéré** | **Simplification abusive** : les explications de 64 caractères en moyenne réduisent des mécanismes complexes à une phrase nominale |

**d) Preuves.** Comptage des occurrences de distracteurs sur le corpus JSON extrait. Absence de tout artefact de validation dans l'arborescence.

**e) Impact apprenant.** Un distracteur hors-sujet est éliminable au premier coup d'œil : il n'entraîne à aucune discrimination fine, alors que l'examen, lui, l'exigera. C'est la cause mécanique du taux de devinabilité de 49 %.

**f) Impact business.** Une seule erreur scientifique virale sur un groupe Facebook de bacheliers suffit à détruire la crédibilité.

**g) Recommandations.** (1) **P1 —** Relecture obligatoire des 500 items par un enseignant SVT 3AS en exercice, avec traçabilité dans le schéma de données. (2) **P1 —** Reconstruire les distracteurs depuis une **banque de misconceptions** documentées, chaque distracteur étiqueté avec la confusion qu'il cible. (3) **P2 —** Lint interdisant qu'un distracteur apparaisse hors de son domaine.

**h) Effort :** Élevé. **i) Priorité : P1.**

> **[AUDIT LIMITÉ]** Je n'ai pas pu faire valider les 508 items et les 23 leçons ligne à ligne par un professeur certifié. J'ai audité la méthode (défaillante) et des échantillons (bons). **Statistiquement, un corpus généré et non relu contient presque certainement des erreurs que je n'ai pas détectées.** Ce point ne doit pas être arrondi favorablement.

---

## DIMENSION 3 — Qualité des exercices, QCM et évaluations

**a) Score : 3/10.** La dimension la plus faible, et celle qui porte le plus de valeur théorique. **P0.**

**b) Constats positifs.** Qualité **formelle** irréprochable : 0 doublon d'énoncé, 0 `correctAnswerIndex` hors bornes, 4 options partout, position de la bonne réponse parfaitement équilibrée (126/127/129/126), et la « réponse la plus longue » ne fonctionne que **13 %** du temps — les auteurs ont neutralisé ce biais classique. Les exercices d'analyse documentaire (`nmj_ppm_courbe`, `ach_jnm_schema`, `curare_table`, `sarin_gb_double`, `michaelis_courbe`, `enzyme_ph_temp`) sont de **vrais** exercices avec sous-questions q1/q2/q3.

**c) Problèmes détectés.**

**🔴 Critique n°1 — Le correcteur ouvert valide n'importe quoi.**

```
verbe        | charabia bourré de mots-clés | « نعم »      | vide
identify     | 20/20 PASS                   | 17/20 PASS   | 0/20 FAIL
describe     | 20/20 PASS                   | 14/20 PASS   | 0/20 FAIL
analyse      | 20/20 PASS                   | 11/20 PASS   | 0/20 FAIL
interpret    | 19/20 PASS                   | 16/20 PASS   | 0/20 FAIL
explain      | 20/20 PASS                   | 17/20 PASS   | 0/20 FAIL
compare      | 20/20 PASS                   | 14/20 PASS   | 0/20 FAIL
hypothesize  | 20/20 PASS                   | 14/20 PASS   | 0/20 FAIL
validate     | 20/20 PASS                   | 16/20 PASS   | 0/20 FAIL
synthesize   | 20/20 PASS                   | 16/20 PASS   | 0/20 FAIL
schematize   | 20/20 PASS                   | 17/20 PASS   | 0/20 FAIL
justify      | 19/20 PASS                   | 16/20 PASS   | 0/20 FAIL
critique     | 20/20 PASS                   | 17/20 PASS   | 0/20 FAIL
```

Chaîne injectée : `بلابلا بلابلا كلما نفترض أن إنزيم 5 مول بينما وثيقة 1 وثيقة 2 يربط المقدمة الخاتمة نستنتج جزيئي خلوي وظيفي` — zéro sens, tous les marqueurs.

Cause racine, `src/lib/validation/scoring.ts` :

```ts
export function computeScore(errors, maxScore) {
  const penalty = errors.reduce((s, e) => s + SEVERITY_PENALTY[e.severity], 0);
  return Math.max(0, Math.min(maxScore, maxScore - penalty));   // ← part de 20
}
```

Le score **part du maximum** et ne descend que si une faute est *détectée*. Rien ne vérifie qu'une réponse **contient du contenu attendu**. Le seul garde-fou, `TOO_SHORT`, est de sévérité `minor` = −1 point : « نعم » perd un point pour brièveté.

**Pourquoi la suite de tests ne l'a pas vu.** Les 12 tests T1–T12 passent (12/12) mais sont **exclusivement construits en faux négatifs** : chacun vérifie qu'une faute connue est détectée. **Aucun ne vérifie qu'une non-réponse est rejetée.** Angle mort total.

**🔴 Critique n°2 — ~49 % de devinabilité.**

```
« option la moins recyclée »  : 251/508 = 49,4 %   (hasard = 25 %)
« option la plus longue »     :  66/508 = 13,0 %
distracteurs réutilisés ≥ 5×  : 38
  41× « يحدث في كل البروتينات بالطريقة نفسها دون نوعية. »
  40× « يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس. »
  38× « هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً. »
```

**🔴 Critique n°3 — 500/508 explications tautologiques.**

> **Q :** في محور 1.1 — ADN، الجين والشفرة الوراثية، أي وصف دقيق لـ«الجين»؟
> **Bonne option :** قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين
> **Explication :** الجين يرتبط هنا بـ: قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين.

Vérification littérale : **500/500** des explications générées contiennent le texte exact de la bonne option.

**🟠 Majeur — Typologie d'exercices très incomplète.** Absents : Vrai/Faux justifié, schémas à légender, tableaux comparatifs à remplir, exercices de génétique (hors programme ici — non pénalisé), **annales réelles**, sujets type BAC conformes.

**d) Preuves.** Scripts reproductibles en Annexe B. **e) Impact apprenant.** Scores surévalués ×2 ; méthodologie apprise à l'envers (l'élève apprend que placer des mots-clés suffit) ; confiance détruite dès la découverte de la faille. **f) Impact business.** Faille virale par nature.

**g) Recommandations.** (1) **P0 —** Barème **positif** : points gagnés par élément attendu présent (valeur+unité, relation causale, niveaux d'organisation, cible moléculaire) ; pénalités par-dessus ; plancher : < 25 mots utiles ⇒ ≤ 8/20. (2) **P0 —** Suite de **tests de faux positifs** (charabia, mot unique, copie d'énoncé) en CI bloquante. (3) **P1 —** Réécrire les explications : mécanisme + réfutation du distracteur choisi + piège BAC. (4) **P1 —** Régénérer les distracteurs, lint « max 3 réutilisations ».

**h) Effort :** Moyen (barème) / Élevé (corpus). **i) Priorité : P0.**

---

## DIMENSION 4 — Qualité des supports visuels et multimédia

**a) Score : 6/10.** Excellent sur le domaine 1, indigent ailleurs.

**b) Constats positifs.** **91 SVG** — format vectoriel, donc net à tout zoom et léger : c'est le bon choix technique. Versions arabisées (`_ar`) présentes. Le domaine 1 est très richement illustré.

**c) Problèmes détectés.**

| Gravité | Problème | Preuve |
|---|---|---|
| **Majeur** | **Déséquilibre extrême entre domaines** | `domaine1_proteines` : **79 SVG** / 22 raster. `domaine2_energie` : **4 SVG** / 4 raster. `domaine3_tectonique` : **6 SVG** / 5 raster |
| **Majeur** | **Aucune interactivité** — tous les schémas sont statiques | Aucun composant de légendage/annotation. Or « annoter un schéma » est un exercice classique du BAC |
| **Majeur** | **Rasters très lourds** | `schema_16_subduction.png` **1,1 Mo**, `schema_17_collision.png` 964 Ko, `schema_09_photosynthese.png` 672 Ko, `mascot.png` **1,9 Mo en 1024×1024** |
| **Modéré** | **Aucune vidéo, aucune animation** | Or le potentiel d'action et la méiose se comprennent mal en image fixe |
| **Modéré** | **Accessibilité des visuels non traitée** | Pas de description alternative systématique ; daltonisme non pris en compte |

**e) Impact apprenant.** Les domaines 2 et 3 — qui pèsent lourd à l'examen — sont sous-illustrés alors qu'ils sont les plus visuels (profils sismiques, coupes de subduction, chaînes respiratoires). Un élève malvoyant ou révisant à l'oral n'a aucune alternative textuelle.

**g) Recommandations.** (1) **P2 —** Rééquilibrer : viser 30+ SVG sur D2 et D3. (2) **P2 —** Rendre les SVG interactifs (légendes masquables, mode « place les étiquettes ») — le format le permet nativement, sans nouvelle dépendance. (3) **P1 —** Convertir les rasters en WebP/AVIF (60–80 % de gain). (4) **P2 —** Alternative textuelle obligatoire par schéma.

**h) Effort :** Moyen. **i) Priorité : P2.**

---

## DIMENSION 5 — UX/UI et design d'interface

**a) Score : 6/10.** **[AUDIT LIMITÉ]** — aucune inspection visuelle possible (Chromium non installable). Analyse déduite du code.

**b) Constats positifs.** RTL correct dès la racine (`<html lang="ar" dir="rtl">`). Identité cohérente (vert `#006d37`, `theme-color` aligné entre `index.html` et `manifest.json`). PWA installable en `standalone`. **Mode sombre réellement implémenté** : 815 occurrences de variantes `dark:`, classe appliquée sur `documentElement` avec persistance `localStorage` (`App.tsx:188-195`) — bon point, souvent absent. Quiz avec mode focus, chronomètre visible, et **réponse verrouillée après validation** (`QuizView.tsx:92`) : choix pédagogique judicieux qui empêche le tâtonnement.

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Majeur** | **Onboarding cassé** — 3 tests en échec le visent : `TrainingView.beginnerMode` (`training-beginner-launchpad` introuvable), `MyPathView.beginnerPath`, `LessonsView.visualCards` (4 échecs). **La porte d'entrée de l'élève faible ne fonctionne pas** |
| **Majeur** | **Aucune fonction de recherche** — grep sur `searchQuery`/`onSearch` : **0 composant**. Sur 23 leçons + 508 QCM, c'est bloquant |
| **Modéré** | **Parcours concurrents** : 36 composants non-test pour 4 onglets (`DashboardView`, `MyPathView`, `LessonsView`, `LessonAdventurePortal`, `UnitIntroPortal`, `InteractiveLessonView`) — plusieurs entrées vers le même contenu |
| **Modéré** | **Composants monolithiques** : `InteractiveLessonView.tsx` **2055 lignes**, `MethodologyView.tsx` **1533 lignes** |
| **Mineur** | Racine polluée par ~25 scripts `patch*.py` / `fix_*.py` versionnés |

**Heuristiques de Nielsen — évaluation déduite :**

| Heuristique | Éval. | Note |
|---|---|---|
| 1. Visibilité de l'état du système | ⚠️ | Progression affichée mais **partiellement fictive** (`StatsView`) |
| 2. Correspondance système/monde réel | ✅ | Terminologie scolaire algérienne respectée |
| 3. Contrôle et liberté | ❌ | Verrouillage séquentiel des unités |
| 4. Cohérence et standards | ⚠️ | Cohérence visuelle bonne ; **structure d'examen non conforme au standard officiel** |
| 5. Prévention des erreurs | ✅ | Verrouillage de la réponse après validation |
| 6. Reconnaissance plutôt que rappel | ❌ | **Pas de recherche, pas de favoris** |
| 7. Flexibilité et efficacité | ❌ | Aucun raccourci, aucun parcours expert |
| 8. Esthétique et minimalisme | ⚠️ | `[AUDIT LIMITÉ]` — 125 occurrences de `text-[9-10px]` suggèrent une densité excessive |
| 9. Aide à la récupération d'erreur | ⚠️ | Excellente en méthodologie, **inexistante en QCM** (explications vides) |
| 10. Aide et documentation | ❌ | **Aucune FAQ, aucune aide, aucun support** |

**g) Recommandations.** (1) **P1 —** Réparer les 7 tests avant toute nouvelle feature. (2) **P1 —** Ajouter une recherche globale. (3) **P2 —** Point d'entrée unique : « Reprendre / Diagnostic / Réviser un chapitre ». (4) **P3 —** Découper les composants > 1500 lignes.

**h) Effort :** Moyen. **i) Priorité : P2** (P1 pour les tests et la recherche).

---

## DIMENSION 6 — Expérience apprenant et engagement

**a) Score : 5/10.** Conception motivationnelle intelligente, exécution non branchée.

**b) Constats positifs.** `countdownEngine` propose **5 paliers émotionnels calibrés** (détendue ≥90 j → plan ≥45 j → action ≥15 j → crise ≥7 j → code rouge), chacun avec message **et recommandation d'action concrète** — c'est de la bonne conception. `crisisEngine` sur-pondère les topics ratés (×2 dans le pool). `spacedRecallService` implémente une logique de maîtrise rigoureuse : `score ≥ 70` **ET** `validationResult.passed` **ET** `matched.length ≥ prompt.minEvidence` → génère une `MasteryEvidence`. C'est plus exigeant que la plupart des apps du marché. XP, badges, streaks présents.

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Critique** | **Statistiques fictives affichées comme réelles.** `StatsView.tsx` : `mockCardData` (l.42), `mockQuizHistory` (l.57), `mockQuizTimeline` (l.72) en **fallback silencieux** (l.203, 241, 271, 279, 292). Un élève neuf voit « تركيب البروتين 75 % / 3 sur 4 » |
| **Majeur** | **Répétition espacée jamais déclenchée** par l'UI (confirmé par `SPECKIT_FINAL.md`). Le meilleur mécanisme de rétention **ne tourne jamais** |
| **Majeur** | **Les rappels ne rappellent rien.** `App.tsx:132-136` écrit un timestamp dans `localStorage` et appelle `Notification.requestPermission()`. **Aucune notification planifiée**, aucun usage de `LocalNotifications` Capacitor. App fermée = élève jamais recontacté |
| **Majeur** | **Gamification découplée de la maîtrise.** `computeXp` : ≥16 → 15 XP. Combiné au barème cassé, **on distribue 15 XP pour du charabia** |
| **Modéré** | **Détection de lacunes non fiable** par construction : avec 49 % de devinabilité, le signal d'entrée est bruité |

**Mécanismes d'apprentissage — état réel :**

| Mécanisme | État |
|---|---|
| Répétition espacée | ⚠️ Moteur écrit, **non branché** |
| Testing effect | ✅ Présent (QCM fréquents) |
| Interleaving | ❌ Absent (parcours strictement séquentiel) |
| Elaborative interrogation | ❌ Absent (explications tautologiques) |
| Retrieval practice | ⚠️ Présent mais faussé par la devinabilité |

**e) Impact apprenant.** Fausse progression → soit fausse sécurité, soit perte de confiance dans **tous** les chiffres de l'app quand la supercherie est découverte. Sans notification réelle, la rétention à J+7 est structurellement faible.

**g) Recommandations.** (1) **P0 —** Supprimer les mocks ; états vides honnêtes et engageants. (2) **P1 —** Brancher `spacedRecallService` (80 % du travail est fait). (3) **P1 —** Notifications locales Capacitor planifiées. (4) **P2 —** Recalculer l'XP après correction du barème.

**h) Effort :** Faible (mocks) à Moyen. **i) Priorité : P1.**

---

## DIMENSION 7 — Accessibilité et inclusion

**a) Score : 4/10.** Dimension négligée. **[AUDIT LIMITÉ]** sur les mesures runtime.

**b) Constats positifs.** RTL natif correct. **Mode sombre réel** (815 variantes `dark:`) — bénéfique pour la révision nocturne, usage dominant en période de BAC. Pas de dépendance à l'audio (aucune vidéo, donc pas de problème de sous-titres).

**c) Problèmes détectés.**

| Gravité | Problème | Mesure |
|---|---|---|
| **Majeur** | **ARIA très insuffisant** | **24 occurrences** de `aria-label`/`role` pour 36 composants interactifs |
| **Majeur** | **Typographie sous le seuil de confort** | **125 occurrences** de `text-[9px]`/`text-[10px]`. En arabe, les points diacritiques (ب/ت/ث, ج/ح/خ) deviennent indistinguables sur écran d'entrée de gamme |
| **Majeur** | **`prefers-reduced-motion` totalement absent** | **0 occurrence** dans tout `src/` et `public/`, alors que `motion` (Framer) est une dépendance active |
| **Modéré** | **Aucun réglage de taille de police** in-app |
| **Modéré** | **Rien pour la dyslexie** (pas d'interlignage augmenté, pas de police adaptée) |

**[AUDIT LIMITÉ] — non vérifiable ici :** ratios de contraste réels, ordre de tabulation, restitution par lecteur d'écran (TalkBack/VoiceOver), zones tactiles ≥ 44 px, conformité WCAG 2.1 AA formelle. Un audit axe-core + Lighthouse est indispensable et n'a pas pu être exécuté.

**e) Impact apprenant.** Exclusion effective des élèves malvoyants, dyslexiques ou sensibles au mouvement. Sur un public de plusieurs dizaines de milliers de candidats, cela représente un nombre significatif d'élèves.

**g) Recommandations.** (1) **P2 —** Plancher typographique 14 px pour tout texte de contenu ; réserver 10–11 px aux badges non essentiels. (2) **P2 —** Réglage de taille de police (3 crans) — faible coût, fort impact. (3) **P2 —** Respecter `prefers-reduced-motion` globalement. (4) **P2 —** `eslint-plugin-jsx-a11y` en CI ; viser ≥ 90 Lighthouse a11y.

**h) Effort :** Moyen. **i) Priorité : P2.**

---

## DIMENSION 8 — Performance technique

**a) Score : 7/10.** Le point fort, avec deux réserves sérieuses.

**b) Constats positifs (mesurés).** Build **6,25 s**. `tsc --noEmit` **exit 0**. Bundles gzip : `index` **111 K**, `vendor-react` **59 K**, `vendor-icons` **3,4 K** → **≈ 173 K de JS gzip** ; CSS 21,3 K. **La doc interne (`SPECKIT_FINAL.md`) annonce « ~291 kB gzip » : la réalité est meilleure de 40 %.** Offline sérieux : caches versionnés `kunz-offline-web-shell-{v}` / `-runtime-{v}`, `CORE_URLS` couvrant les 23 leçons, collecte dynamique via `manifest.json`. **0 vulnérabilité npm.**

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Majeur** | **`mascot.png` = 1,9 Mo en 1024×1024**, servi comme favicon **et** comme icône PWA 192px **et** 512px. Le navigateur télécharge 1,9 Mo pour afficher 192 px. **Correction en 10 minutes** |
| **Majeur** | **`public/` = 10,6 Mo**, `dist/` = 13 Mo → **~11 Mo imposés au premier lancement**, sans choix ni information préalable |
| **Majeur** | **Obfuscation hostile au produit** : `debugProtection: true` + `debugProtectionInterval: 2000` → boucle anti-debug **toutes les 2 s en continu** ; plus `selfDefending`, `controlFlowFlattening: 0.5`, `deadCodeInjection: 0.2`, `stringArrayEncoding: base64`. Coût CPU/batterie permanent sur mobiles d'entrée de gamme — **exactement le parc visé** |
| **Majeur** | **`sourcemap: false`** → **aucun crash n'est diagnosticable** en production |
| **Modéré** | **Ratio protection/valeur défavorable** : on protège lourdement un contenu majoritairement généré, donc trivialement régénérable |

**[AUDIT LIMITÉ]** — non mesurables sans appareil réel : temps de lancement, RAM, batterie, comportement sur 3G/Edge, gestion des interruptions, stabilité (crashes/ANR), compatibilité Android 9-11 / 2-3 Go RAM. Ces points restent en **hypothèse raisonnée**.

**e) Impact apprenant.** ~11 Mo est une friction réelle sur un forfait algérien. L'obfuscation à intervalle dégrade l'autonomie sur les appareils modestes.

**g) Recommandations.** (1) **P1 —** Icônes dédiées 192/512 ; retirer le 1024 du chemin critique. (2) **P1 —** WebP/AVIF (~7 Mo économisés). (3) **P1 —** Désactiver `debugProtection` et `selfDefending`. (4) **P1 —** Sourcemaps privées + crash reporter respectueux. (5) **P2 —** Téléchargement **par domaine** avec poids affiché avant confirmation.

**h) Effort :** Faible. **i) Priorité : P1** (excellent rapport impact/effort).

---

## DIMENSION 9 — Fonctionnalités clés

**a) Score : 4/10.** Fonctionnalités avancées présentes, **fonctionnalités de base absentes** — inversion classique de priorités.

**c) Inventaire vérifié par grep :**

| Fonctionnalité | État | Preuve |
|---|---|---|
| Inscription / connexion email | ✅ | Supabase |
| Connexion Google / Facebook / téléphone | ❌ | Commentaire « Google OAuth » **sans code correspondant** |
| Profil (nom, filière, wilaya, objectif) | ⚠️ | Champ `wilaya` existe dans `AuthContext` mais **jamais collecté** dans `LoginScreen` — donc mort |
| Catalogue structuré par chapitre | ✅ | 11 unités |
| Leçons textuelles | ✅ | 23 HTML (mais hors moteur React) |
| Leçons vidéo | ❌ | Aucune |
| Fiches de révision | ⚠️ | Flashcards = **mêmes QCM reconditionnés** |
| QCM par chapitre | ✅ | 508 items |
| Exercices type BAC | ⚠️ | Générés, **non conformes** (cf. D1) |
| Annales BAC corrigées | ❌ | **Aucune** |
| Mode examen blanc chronométré | ⚠️ | Chrono fixe 900 s quel que soit le nombre de questions |
| Tableau de bord de progression | ⚠️ | **Partiellement fictif** |
| Statistiques par chapitre | ⚠️ | Idem |
| Favoris / marque-pages | ❌ | **0 occurrence** |
| Prise de notes | ❌ | **0 occurrence** |
| Mode hors ligne | ✅ | Excellent |
| Notifications / rappels | ❌ | Permission demandée, **rien de planifié** |
| Partage de contenu | ❌ | **0 occurrence** de `share` |
| Recherche | ❌ | **0 composant** |
| Aide / FAQ / support | ❌ | **0 occurrence** de FAQ |
| Paramètres | ⚠️ | Seul le thème est réglable |
| Suppression du compte | ❌ | **Absente** — problème de conformité (droit à l'effacement) |
| Mot de passe oublié | ❌ | **Absent** — perte définitive de compte |

**Taux de couverture : 6 fonctionnalités pleinement présentes sur 23 (26 %).**

**e) Impact apprenant.** L'absence de recherche, de favoris et de prise de notes rend la révision inefficace : impossible de retrouver une notion ou de constituer un carnet d'erreurs. L'absence de reset de mot de passe fait perdre toute la progression sur simple oubli — cause classique d'abandon définitif.

**f) Impact business.** L'absence de suppression de compte est un **manquement réglementaire** (droit à l'effacement), aggravé sur un public mineur.

**g) Recommandations.** (1) **P1 —** Reset de mot de passe (natif Supabase, coût quasi nul). (2) **P1 —** Suppression de compte. (3) **P1 —** Recherche globale. (4) **P2 —** Favoris + carnet de notes. (5) **P2 —** Écran Paramètres complet + FAQ.

**h) Effort :** Moyen. **i) Priorité : P1.**

---

## DIMENSION 10 — Localisation et contexte algérien

**a) Score : 7/10.** Bonne localisation de surface, angles morts sur le contexte d'usage.

**b) Constats positifs.** Arabe fus'ha scolaire correct, terminologie conforme aux manuels algériens, français technique entre parenthèses selon la convention locale — détail qui compte beaucoup pour la crédibilité auprès des enseignants. RTL natif. Fuseau **`+01:00` correct**. Repli de reconnaissance vocale `ar-DZ` → `ar-SA` (`SpeechToTextInput.tsx:28`), pragmatique faute de modèle darija. **Test réel réussi :** « شرحلي كيفاش تدير الاستنساخ » (darija) → correctement routé vers « تركيب البروتين ». Non trivial.

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Majeur** | **Date du BAC codée en dur** : `BAC_DATE_TARGET = new Date('2027-06-07T08:00:00+01:00')`. Aucun mécanisme de mise à jour. Le compte à rebours — élément émotionnel central — **deviendra faux** |
| **Majeur** | **Le tuteur échoue sur les intentions méta en darija.** Test : « عندي غدوة البكالوريا وماقريتش والو » (« j'ai le bac demain et je n'ai rien révisé ») → réponse **« بنية الكرة الأرضية »**. Idem pour « كيف أراجع في أسبوع قبل البكالوريا؟ ». Or `crisisEngine` et `countdownEngine` **contiennent exactement les bonnes réponses** — elles ne sont pas branchées |
| **Modéré** | **Aucun moyen de paiement local** prévu (CCP, BaridiMob, Eddahabia) — bloquant si monétisation future |
| **Modéré** | **Aucun ancrage au calendrier scolaire algérien** (trimestres, vacances, période pré-BAC avril-juin) |
| **Mineur** | `wilaya` déclarée mais jamais collectée — aucune personnalisation régionale possible |

**e) Impact apprenant.** L'élève en détresse reçoit une réponse hors-sujet **au pire moment**. Le compte à rebours faux décrédibilisera l'ensemble.

**g) Recommandations.** (1) **P2 —** Date du BAC en configuration JSON versionnée, mise à jour à chaud si en ligne. (2) **P2 —** **Couche d'intentions** avant le matching de contenu : « stratégie de révision », « panique », « organisation » → router vers `countdownEngine`/`crisisEngine`. Gain immédiat, coût faible. (3) **P3 —** Lexique darija étendu (≥ 200 formulations réelles d'élèves).

**h) Effort :** Faible. **i) Priorité : P2.**

---

## DIMENSION 11 — Monétisation et éthique

**a) Score : 5/10.** Note scindée : **9/10 sur l'absence de prédation**, **2/10 sur la sincérité**.

**b) Constats positifs — substantiels.** Aucun paiement, aucun abonnement, **aucune publicité, aucun SDK publicitaire** (grep exhaustif), aucun dark pattern, aucun timer culpabilisant, aucune loot box, aucune exploitation de l'anxiété pré-examen à des fins commerciales. Sur un public de lycéens stressés, cette sobriété est rare et mérite d'être saluée sans réserve.

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Critique** | **CGU contredites par le code** (détail en D12) |
| **Majeur** | **Teaser « Pro » qui vend du vide** : `PRO_TEASER_CLICKED` tracké (`CoachView.tsx:242`) alors que le discours affiche « مجاني 100% » (`MethodologyTrainer.tsx:230`, `MethodologyView.tsx:1518`) et qu'aucune offre Pro n'existe |
| **Majeur** | **Promesses marketing non tenues** : le README annonce « 500 QCM » **+** « 500 flashcards » ; or `SVT_FLASHCARDS = SVT_QUIZ_QUESTIONS.map(...)` — **mêmes 508 items reconditionnés**. Le compte honnête est : **508 items, dont 8 de qualité rédactionnelle** |
| **Modéré** | **Modèle économique inexistant** — pas de dette éthique, mais aucune trajectoire de viabilité |

**Éthique éducative — jugement direct.** L'application **favorise la mémorisation mécanique plutôt que la compréhension**, non par choix mais par conséquence : des explications tautologiques et des QCM devinables ne peuvent produire que de la reconnaissance de forme. Ce n'est pas une intention prédatrice, c'est un effet de l'industrialisation du contenu — mais l'effet sur l'élève est le même.

**g) Recommandations.** (1) **P0 —** Mettre CGU et code en accord **cette semaine**. (2) **P1 —** Aligner le README sur la réalité avant toute diffusion. (3) **P3 —** Modèle envisageable : cœur gratuit + pack annales corrigées / suivi enseignant payant, sans jamais dégrader le cœur ; prévoir CCP/BaridiMob.

**h) Effort :** Faible. **i) Priorité : P0.**

---

## DIMENSION 12 — Sécurité et confidentialité

**a) Score : 6/10.** Périmètre d'attaque remarquablement réduit, mais documentation légale fausse et authentification laxiste.

**b) Constats positifs.** **2 permissions Android seulement** — remarquable (la plupart des apps éducatives en demandent 8 à 15). `allowMixedContent: false`. CSP stricte côté Express (`connect-src 'self' https://*.supabase.co`), en-têtes de sécurité, catch-all SPA hors `/api/*`. **0 vulnérabilité npm.** Supabase entièrement optionnel : l'app fonctionne sans aucune clé. Télémétrie techniquement soignée (file bornée 100/80, debounce 5 min, gestion `QuotaExceeded`, non bloquante).

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Critique** | **CGU mensongères.** `TermsModal.tsx` affirme en arabe : « toutes tes données sont conservées **localement sur ton appareil uniquement** » et « nous ne collectons/stockons/vendons **aucune** donnée personnelle sur un serveur externe ». Or `telemetryService.ts` envoie à Supabase (`telemetry_events`) **8 types d'événements** — `APP_OPENED`, `QUIZ_COMPLETED`, `METHOD_FAIL`, `METHOD_SUCCESS`, `PRO_TEASER_CLICKED`, `GUEST_LOGIN_OFFLINE`, `BOSS_COMPLETED`, `DOMAIN_SELECTED` — avec `user_id`, payload et `is_online`. **Aucun consentement, aucun opt-out, public mineur** |
| **Majeur** | **Aucun consentement parental** alors que le public est majoritairement mineur |
| **Majeur** | **Pas de suppression de compte** → droit à l'effacement non honoré |
| **Majeur** | **Authentification laxiste** : mot de passe **≥ 6 caractères**, pas de confirmation d'e-mail, **pas de reset**, pas de double saisie, **pas de lien CGU à l'inscription** (l'élève accepte donc des conditions qu'il n'a pas vues, et qui sont fausses) |
| **Modéré** | **Données locales en clair** : `localStorage['kunz_user']` contient le profil avec **e-mail en clair** |
| **Modéré** | **`allowBackup=true`** → remontée des données dans la sauvegarde Google, contredisant « uniquement sur ton appareil » |

**f) Impact business.** Exposition juridique réelle sur données de mineurs. Rédhibitoire pour tout partenariat institutionnel ou toute levée de fonds sérieuse (la due diligence le détecte immédiatement).

**g) Recommandations.** (1) **P0 —** Désactiver la télémétrie **ou** CGU exactes + opt-in désactivé par défaut. *Option A recommandée : plus rapide, plus sûre, cohérente avec le positionnement « 100 % offline ».* (2) **P1 —** Reset de mot de passe + politique ≥ 10 caractères + lien CGU à l'inscription. (3) **P1 —** Suppression de compte. (4) **P2 —** `allowBackup=false` ; ne pas stocker l'e-mail en clair.

**h) Effort :** Faible. **i) Priorité : P0.**

---

## DIMENSION 13 — Analyse concurrentielle

**a) Score : 5/10.** Différenciation réelle et défendable, mais annulée par l'exécution du contenu.

**b) Positionnement vs le marché.**

| Comparaison | Position |
|---|---|
| **vs apps BAC Algérie** (ency-education, BacDZ, Dirassa) | **Au-dessus** sur l'expérience applicative (offline vrai, tuteur interactif, méthodologie outillée). **En dessous** sur le contenu : les concurrents proposent les **annales depuis 2008 avec corrigés**, ce que l'app n'a pas du tout |
| **vs apps SVT internationales** (Anki, Quizlet, Kartable) | **En dessous** sur la qualité des items et la répétition espacée effective. **Au-dessus** sur la spécificité programme DZ |
| **vs standards EdTech** (Duolingo, Khan Academy) | **Très en dessous** sur la boucle d'apprentissage (feedback correctif, adaptativité réelle, notifications). **Comparable** sur l'ambition de gamification, mais celle-ci est découplée de la maîtrise |

**Fonctionnalité différenciante réelle :** **tuteur SVT fonctionnant entièrement hors ligne, sans LLM, sans clé API**. Pertinent en Algérie (connectivité inégale, forfaits coûteux, appareils modestes) : élimine coût data, coût d'inférence, latence et risque d'hallucination. C'est un vrai actif stratégique.

**Fonctionnalités manquantes critiques :** annales corrigées, recherche, notifications, correction fiable des réponses ouvertes, caution académique.

**e/f) Impact.** Sur ce marché, la confiance des enseignants et des parents précède l'adoption par les élèves. **Aucun enseignant nommé, aucun établissement partenaire, aucune validation officielle** : c'est bloquant pour la prescription.

**g) Recommandations.** (1) **P1 —** Annales corrigées : le différenciateur le plus difficile à copier, car il demande du travail enseignant, pas du code. (2) **P2 —** Caution académique nominative affichée dans l'app. (3) **P3 —** Capitaliser explicitement sur l'argument « fonctionne sans connexion, zéro data ».

**h) Effort :** Élevé. **i) Priorité : P3** (P1 pour les annales, portées par D1).

---

## DIMENSION 14 — Avis utilisateurs et réputation

**a) Score : [AUDIT LIMITÉ] — non évaluable.**

L'application **n'est pas publiée** : aucun lien store fourni (Section A vide), aucune trace de publication, un **unique commit** dans le dépôt (`aea890c`, « Initial import »). Il n'existe donc ni note store, ni avis, ni tendance, ni signaux de faux avis à analyser.

**Ce que je peux néanmoins signaler.** L'absence de publication est en réalité une **opportunité** : les problèmes critiques (W1 charabia 20/20, W5 CGU mensongères) peuvent être corrigés **avant** exposition publique. Publier en l'état créerait une dette réputationnelle durable — les premiers avis 1 étoile pèsent des années sur le classement store.

**g) Recommandation. P0 —** Ne pas publier avant correction des points C1–C5 du registre. **Mettre en place dès maintenant** un canal de feedback in-app et un processus de réponse aux avis.

**i) Priorité : P0** (au sens : ne pas publier prématurément).

---

## DIMENSION 15 — Potentiel de croissance et scalabilité

**a) Score : 6/10.** Architecture extensible, contenu difficilement maintenable.

**b) Constats positifs.** Stack moderne et durable (React 19, Vite 6, TS, Capacitor 8). Séparation nette données/moteurs/UI. Le `ValidationEngine` est **générique par conception** (verbes d'action, types de documents, domaines) : il pourrait servir en physique ou en SVT d'autres niveaux. Capacitor permet Android + iOS + Web depuis une base unique. Modèle offline reproductible pour toute matière.

**c) Problèmes détectés.**

| Gravité | Problème |
|---|---|
| **Majeur** | **Contenu non maintenable** : corpus en `.ts` monolithique (`quizCorpus.ts` = 7129 lignes), édité par **scripts Python ad hoc** (~25 fichiers `patch*.py` / `fix_*.py` à la racine). Aucun CMS, aucun schéma validé, aucun workflow de relecture. Ajouter une matière signifierait **répéter la même industrialisation défaillante** |
| **Majeur** | **Aucune brique communautaire** (forum, entraide, classement) — or c'est le moteur de croissance organique le moins coûteux |
| **Modéré** | **Aucune brique B2B** : pas de compte enseignant, pas de suivi de classe, pas d'export de résultats |
| **Modéré** | **Intégration IA compromise à court terme** : un quiz adaptatif ou une correction automatique s'appuieraient sur un signal faux (49 % de devinabilité, barème cassé). **L'IA amplifierait le bruit** |

**Réponses aux questions 15.1–15.7 :**

- **15.1 Autres matières ?** Oui techniquement, non en l'état — il faudrait d'abord un pipeline de contenu digne de ce nom.
- **15.2 Autres niveaux (1AS, 2AS, BEM) ?** Oui, l'architecture le permet sans refonte.
- **15.3 Contenu maintenable ?** **Non.** C'est le principal frein au scaling.
- **15.4 Architecture scalable ?** Oui — offline-first, pas de dépendance serveur critique, coût marginal par utilisateur quasi nul. C'est un vrai atout économique.
- **15.5 Potentiel communautaire ?** Fort mais **entièrement inexploité**.
- **15.6 Potentiel B2B ?** Réel (écoles privées, cours de soutien), mais conditionné à la conformité programme et à la caution académique.
- **15.7 Potentiel IA ?** Oui, **après** correction du signal. Priorité : correction automatique assistée et génération de distracteurs plausibles à partir de misconceptions.

**g) Recommandations.** (1) **P2 —** Migrer le contenu vers un format structuré (JSON validé par schéma Zod) avec workflow de relecture. (2) **P3 —** Compte enseignant + suivi de classe (ouvre le B2B). (3) **P3 —** IA seulement après assainissement du corpus.

**h) Effort :** Élevé. **i) Priorité : P3.**

---

# ━━━ PARTIE IV — REGISTRE DES PROBLÈMES ━━━

| ID | Problème | Gravité | Dim. | Impact apprenant | Solution recommandée | Effort | Prior. |
|---|---|---|---|---|---|---|---|
| **01** | Correcteur ouvert : charabia = 20/20, « نعم » = 11–17/20 sur les 12 verbes | **Critique** | 3 | Méthodologie apprise à l'envers ; confiance détruite | Score **positif** + plancher (<25 mots ⇒ ≤8/20) + tests de faux positifs en CI | Moyen | **P0** |
| **02** | CGU affirment « aucune donnée externe » ; 8 événements envoyés à Supabase sans consentement | **Critique** | 12, 11 | Données de mineurs collectées à leur insu | Désactiver la télémétrie **ou** CGU exactes + opt-in off par défaut | Faible | **P0** |
| **03** | 500/508 explications tautologiques (recopient la bonne réponse) | **Critique** | 3, 2 | Aucune remédiation possible ; mémorisation mécanique | Réécrire : mécanisme + réfutation du distracteur + piège BAC | Élevé | **P0** |
| **04** | ~49 % des QCM devinables sans connaissance (38 distracteurs recyclés ≥5×) | **Critique** | 3 | **Scores surévalués ×2** → fausse confiance | Régénérer depuis une banque de misconceptions ; lint max 3 réutilisations | Élevé | **P0** |
| **05** | `StatsView` affiche des stats fictives en fallback silencieux | **Critique** | 6 | Fausse progression, puis perte de confiance globale | Supprimer les mocks ; états vides honnêtes | Faible | **P0** |
| **06** | Défi BAC non conforme : 28/20/34 pts mono-domaine vs 20 pts (15+5) bi-domaines | **Critique** | 1 | Choc de format le jour J ; situation d'intégration jamais rencontrée | Refondre le générateur sur la structure officielle | Moyen | **P1** |
| **07** | 7 tests en échec /346, tous sur l'onboarding débutant | **Majeur** | 5 | L'élève faible ne trouve pas son point de départ | Réparer avant toute feature ; CI bloquante | Moyen | **P1** |
| **08** | Aucune annale BAC corrigée | **Majeur** | 1, 13 | Ne prépare pas au format réel | Intégrer les sujets depuis 2008 + corrigés + barèmes | Élevé | **P1** |
| **09** | Répétition espacée écrite mais jamais déclenchée par l'UI | **Majeur** | 6 | Oubli, pas de consolidation | Brancher `spacedRecallService` (80 % fait) | Moyen | **P1** |
| **10** | Notifications jamais planifiées (permission demandée, rien derrière) | **Majeur** | 6, 9 | App fermée = élève jamais recontacté | `LocalNotifications` Capacitor planifiées | Moyen | **P1** |
| **11** | Pas de reset de mot de passe ni de suppression de compte | **Majeur** | 9, 12 | Perte définitive de progression ; droit à l'effacement non honoré | Natif Supabase | Faible | **P1** |
| **12** | Aucune recherche dans l'app (0 composant) | **Majeur** | 5, 9 | Impossible de retrouver une notion | Recherche globale leçons + QCM | Moyen | **P1** |
| **13** | `mascot.png` 1,9 Mo en icône ; ~11 Mo imposés au 1er lancement | **Majeur** | 8 | Renoncement sur forfait limité | Icônes dédiées + WebP/AVIF + téléchargement par domaine | Faible | **P1** |
| **14** | Obfuscation `debugProtection` (2 s) + `selfDefending` ; `sourcemap: false` | **Majeur** | 8 | Batterie/CPU dégradés ; crashes non diagnosticables | Désactiver ; sourcemaps privées + crash reporter | Faible | **P1** |
| **15** | 23 leçons HTML hors moteur React ; `ACTIVE_LESSONS` = 9 entrées avec ids dupliqués | **Majeur** | 1, 9 | Rupture leçon → exercice → maîtrise | Intégrer et dédupliquer | Moyen | **P1** |
| **16** | Verrouillage séquentiel des unités 2→11 | **Majeur** | 1, 5 | Révision ciblée impossible en fin d'année | Déverrouillage libre + recommandation | Faible | **P1** |
| **17** | Schémas : 79 SVG sur D1 vs 4 (D2) et 6 (D3) ; aucun interactif | **Majeur** | 4 | Domaines 2 et 3 sous-illustrés | Rééquilibrer + SVG interactifs | Moyen | **P2** |
| **18** | Trous programme : 0 question vaccin/sérum, collision, métamorphisme ; 1 mutations | **Modéré** | 1 | Impasse sur chapitres tombables | ~40 items rédigés à la main | Moyen | **P2** |
| **19** | Accessibilité : 24 ARIA, 125 `text-[9-10px]`, 0 `prefers-reduced-motion` | **Modéré** | 7 | Exclusion des élèves à besoins particuliers | Plancher 14 px, réglage police, `jsx-a11y` en CI | Moyen | **P2** |
| **20** | Tuteur : intentions méta mal routées (panique → « structure de la Terre ») | **Modéré** | 10 | Réponse hors-sujet au pire moment | Couche d'intentions avant matching | Faible | **P2** |
| **21** | Date BAC codée en dur (`2027-06-07`) | **Modéré** | 10 | Compte à rebours faux dès l'an prochain | Config JSON versionnée | Faible | **P2** |
| **22** | README surpromet (« 500 QCM + 500 flashcards » = mêmes items) | **Modéré** | 11, 13 | Perte de crédibilité | Aligner la doc | Faible | **P2** |
| **23** | Auth laxiste (mdp ≥6, pas de confirmation e-mail, pas de lien CGU) | **Modéré** | 12 | Compte compromis facilement | Politique ≥10 + lien CGU | Faible | **P2** |
| **24** | `allowBackup=true` ; e-mail en clair dans `localStorage` | **Modéré** | 12 | Contredit « uniquement sur ton appareil » | `allowBackup=false` ; identifiant opaque | Faible | **P2** |
| **25** | Contenu non maintenable (7129 lignes .ts, ~25 scripts patch) | **Modéré** | 15 | Frein au scaling | Migrer vers JSON + schéma Zod | Élevé | **P3** |
| **26** | Composants monolithiques (2055 et 1533 lignes) | **Mineur** | 5 | Risque de régression | Découper | Moyen | **P3** |
| **27** | Doc annonce 291 kB gzip vs 173 kB réels | **Mineur** | 8 | — | Corriger la doc | Faible | **P4** |
| **28** | Commentaire « Google OAuth » sans code ; `wilaya` déclarée jamais collectée | **Mineur** | 9, 12 | — | Nettoyer | Faible | **P4** |

**Synthèse : 5 critiques · 11 majeurs · 9 modérés · 3 mineurs.**

---

# ━━━ PARTIE V — PLAN D'ACTION PRIORISÉ ━━━

## PHASE 1 — SEMAINES 1-2 : QUICK WINS & CORRECTIFS CRITIQUES

*Objectif : que plus rien de ce que l'app affiche à l'élève ne soit faux.*

1. **Désactiver la télémétrie** (ou opt-in off par défaut) — clôt le problème 02 en une heure.
2. **Supprimer les mocks de `StatsView`** → états vides honnêtes (05).
3. **Corriger le barème du `ValidationEngine`** : score positif + plancher + **tests de faux positifs** en CI (01). *Meilleur rapport impact/effort de tout le plan.*
4. **Icônes PWA dédiées 192/512** ; retirer `mascot.png` 1,9 Mo du chemin critique (13).
5. **Désactiver `debugProtection` + `selfDefending`** ; réactiver les sourcemaps privées (14).
6. **Déverrouiller les unités** ; garder une recommandation d'ordre (16).
7. **Reset de mot de passe + suppression de compte** (11) — natif Supabase.
8. **Réparer les 7 tests en échec** ; CI bloquante (07).
9. **Corriger README et doc interne** (22, 27).

## PHASE 2 — SEMAINES 3-4 : CORRECTIONS PÉDAGOGIQUES MAJEURES

1. **Réécrire les explications des 100 QCM les plus servis** (03) — format mécanisme + réfutation + piège BAC.
2. **Refondre le générateur d'examen** sur la structure officielle : 20 pts, Partie 1 (15 pts, 2 exercices) + Partie 2 (5 pts, situation d'intégration), deux domaines distincts (06).
3. **Régénérer les distracteurs** depuis une banque de misconceptions ; lint max 3 réutilisations ; **re-mesurer la devinabilité** (cible < 30 %) (04).
4. **Lancer la relecture enseignante** des 500 items avec traçabilité (Dim. 2).
5. **Combler les trous programme** : vaccination/sérothérapie, collision, métamorphisme, mutations (18).

## PHASE 3 — MOIS 2 : AMÉLIORATIONS UX/UI ET FONCTIONNELLES

1. **Recherche globale** leçons + QCM (12).
2. **Intégrer les 23 leçons HTML** au moteur React ; dédupliquer `ACTIVE_LESSONS` (15).
3. **Brancher `spacedRecallService`** sur l'UI (09).
4. **Notifications locales Capacitor** planifiées (10).
5. **Accessibilité** : plancher 14 px, réglage de police, `prefers-reduced-motion`, `jsx-a11y` en CI (19).
6. **Favoris + carnet de notes** ; écran Paramètres + FAQ (Dim. 9).
7. **Couche d'intentions** du tuteur (panique, stratégie) (20).

## PHASE 4 — MOIS 3 : OPTIMISATIONS STRATÉGIQUES

1. **Annales BAC DZ** (sujets depuis 2008, corrigés, barèmes officiels), avec liens vers les items d'entraînement correspondants (08).
2. **Rééquilibrer les schémas** D2/D3 + rendre les SVG interactifs (17).
3. **Parcours « Objectif 14/20 » et « Objectif 16/20 »** (Partie VI).
4. **Détection de lacunes** sur données réelles (possible seulement après 04).
5. **Optimisation assets** WebP/AVIF + téléchargement par domaine (13).
6. **Caution académique** : enseignant SVT 3AS nommé et affiché.
7. **E2E Playwright + audit Lighthouse/axe réel** — le chaînon manquant de cet audit.

## PHASE 5 — MOIS 4-6 : ÉVOLUTIONS MAJEURES ET SCALING

1. **Migrer le contenu** vers JSON validé par schéma Zod + workflow de relecture (25).
2. **Compte enseignant + suivi de classe** → ouverture B2B.
3. **Briques communautaires** : entraide, quiz battle, classement par wilaya.
4. **Extension 1AS / 2AS** (l'architecture le permet).
5. **IA assistée** — génération de distracteurs plausibles, correction assistée. **Uniquement après assainissement du signal.**
6. **Modèle économique** : cœur gratuit + pack annales/suivi, paiement CCP/BaridiMob.

---

# ━━━ PARTIE VI — RECOMMANDATIONS SPÉCIFIQUES SVT BAC ALGÉRIE ━━━

## 6.1 Contenu à ajouter en priorité

1. **Annales officielles 2008–2025 avec corrigés et barèmes** — le manque le plus coûteux. L'élève algérien révise **par les sujets**. Chaque annale doit lier ses questions aux items d'entraînement de l'app : c'est ce qui transforme une banque de sujets en outil d'apprentissage.
2. **Situations d'intégration (Partie 2, 5 pts)** — format le plus discriminant et **totalement absent**. Max 3 documents, max 2 questions, sur un domaine différent de la Partie 1.
3. **Immunologie appliquée** : vaccination, sérothérapie, greffes, allergies, SIDA — **0 question actuellement** sur un chapitre parmi les plus tombables.
4. **Géologie** : collision continentale, chaînes de montagnes, métamorphisme — **0 question**. Ajouter lecture de profils sismiques, anomalies magnétiques symétriques, calcul de vitesse de plaque.
5. **Explications réécrites** pour les 500 items générés.
6. **Exercices documentaires D2 et D3** : viser 8 et 10 respectivement (contre ~0 aujourd'hui).

## 6.2 Fonctionnalités pédagogiques innovantes

| Fonctionnalité | Faisabilité | Commentaire |
|---|---|---|
| **Mode « Objectif 14/20 » / « 16/20 » / « 18/20 »** | ✅ Élevée | **14** : sécuriser la restitution (couverture complète, QCM, 6 verbes, 3 annales guidées). **16** : gagner sur l'exploitation documentaire et la rédaction — c'est précisément ce que `ValidationEngine` sait évaluer, **une fois son barème corrigé**. **18** : situations d'intégration en temps réel sans aide. **Prérequis absolu : problèmes 01 et 04 corrigés**, sinon on certifie des acquis inexistants |
| **Parcours par lacune détectée** | ⚠️ Après 04 | Hérite du bruit du corpus tant que la devinabilité est à 49 % |
| **Simulateur BAC chronométré au barème réel** | ✅ Élevée | Structure 15+5, deux domaines, durée officielle |
| **Schémas interactifs à compléter** | ✅ Élevée | 91 SVG déjà présents ; le format permet nativement le légendage. **Fort rendement** |
| **Mode « Annales » depuis 2008** | ✅ Moyenne | Sujets publiquement disponibles ; le travail est éditorial |
| **Planning J-90 / J-60 / J-30 / J-7** | ✅ Élevée | `countdownEngine` a déjà les 5 paliers **et** les recommandations — il ne pilote rien. **Il suffit de le brancher sur `crisisEngine`** |
| **Fiches méthode par verbe** | ✅ Élevée | Base excellente (6 verbes, lois de rédaction). Ajouter un exemple rédigé issu d'une annale réelle + un contre-exemple annoté (« voici une copie à 6/20 et pourquoi ») + checklist. **Format imprimable** — beaucoup d'élèves révisent sur papier |
| **Chatbot « prof virtuel »** | ⚠️ Partiel | Existe déjà en offline. Corriger d'abord le routage des intentions méta |
| **Analyse des erreurs récurrentes** | ⚠️ Après 04 | Même dépendance |
| **Quiz battle multijoueur / classement par wilaya** | ⚠️ Faible | Contredit le positionnement offline ; `wilaya` n'est même pas collectée. **À reporter en Phase 5** |

## 6.3 Idées de différenciation

1. **« Zéro data, zéro compte »** — assumer pleinement l'offline comme argument central : utilisable en internat, en zone rurale, sans forfait. C'est le seul avantage que les concurrents ne peuvent pas copier sans refonte.
2. **Le correcteur méthodologique comme produit phare** — une fois fiabilisé, « l'app qui corrige ta rédaction SVT comme un correcteur du BAC » est un positionnement unique sur ce marché. Aucun concurrent algérien ne le propose.
3. **Mode « copie annotée »** — montrer à l'élève de vraies copies notées 6, 12 et 18/20 sur le même sujet, avec annotations. Extrêmement formateur, coût de production faible.
4. **Pack enseignant** — export de résultats de classe, génération de sujets conformes. Ouvre le B2B et apporte la caution académique par l'usage.

---

# ━━━ PARTIE VII — MATRICE DE COUVERTURE PROGRAMME ━━━

> **Matrice reconstruite sur le programme algérien 3AS Sciences Expérimentales réel** (3 domaines), et non sur la grille du brief (qui décrit un autre système éducatif — voir Dimension 1).

| Chapitre / Notion | Cours | Schémas | Exercices | QCM | Annales |
|---|---|---|---|---|---|
| **DOMAINE 1 — التخصص الوظيفي للبروتينات** | | | | | |
| → Synthèse des protéines (transcription/traduction) | ☑ | ☑ | ☑ | ☑ | ☐ |
| → Code génétique / الشفرة الوراثية | ☑ | ☑ | ⚠️ | ☑ (8) | ☐ |
| → Relation structure/fonction | ☑ | ☑ | ⚠️ | ☑ | ☐ |
| → Structure spatiale des protéines | ☑ | ☑ | ⚠️ | ☑ | ☐ |
| → Catalyse enzymatique | ☑ | ☑ | ☑ | ☑ | ☐ |
| → Soi / non-soi, CMH-HLA | ☑ | ☑ | ⚠️ | ☑ (10) | ☐ |
| → Réponse humorale (RIMH) | ☑ | ☑ | ⚠️ | ☑ | ☐ |
| → Réponse cellulaire (RIMC) | ☑ | ☑ | ⚠️ | ☑ | ☐ |
| → SIDA / VIH | ☑ | ⚠️ | ☐ | ☑ (9) | ☐ |
| → **Vaccination / sérothérapie** | ⚠️ | ☐ | ☐ | **☐ (0)** | ☐ |
| → Communication nerveuse (PA, PR) | ☑ | ☑ | ☑ | ☑ | ☐ |
| → Transmission synaptique | ☑ | ☑ | ☑ | ☑ | ☐ |
| → Intégration nerveuse | ☑ | ☑ | ☑ | ☑ (11) | ☐ |
| → Substances exogènes / drogues | ☑ | ⚠️ | ⚠️ | ☑ (11) | ☐ |
| **DOMAINE 2 — تحويل الطاقة** | | | | | |
| → Photosynthèse / phase photochimique | ☑ | ⚠️ | ☐ | ☑ | ☐ |
| → Cycle de Calvin | ☑ | ⚠️ | ☐ | ☑ (11) | ☐ |
| → Respiration cellulaire / glycolyse | ☑ | ⚠️ | ☐ | ☑ | ☐ |
| → Cycle de Krebs | ☑ | ⚠️ | ☐ | ☑ (10) | ☐ |
| → **Phosphorylation oxydative** | ☑ | ☐ | ☐ | ⚠️ (2) | ☐ |
| → Fermentation | ☑ | ⚠️ | ☐ | ☑ (10) | ☐ |
| → Bilan énergétique | ☑ | ⚠️ | ☐ | ☑ | ☐ |
| **DOMAINE 3 — التكتونية العامة** | | | | | |
| → Structure de la Terre / Moho, Gutenberg | ☑ | ⚠️ | ☐ | ☑ (12) | ☐ |
| → Ondes sismiques P/S | ☑ | ⚠️ | ☐ | ☑ | ☐ |
| → **Dorsale / expansion océanique** | ☑ | ⚠️ | ☐ | ⚠️ (3) | ☐ |
| → Subduction / الغوص | ☑ | ☑ | ☐ | ☑ (14) | ☐ |
| → **Collision / chaînes de montagnes** | ⚠️ | ☐ | ☐ | **☐ (0)** | ☐ |
| → Ophiolites | ☑ | ⚠️ | ☐ | ☑ (13) | ☐ |
| → **Métamorphisme** | ⚠️ | ☐ | ☐ | **☐ (0)** | ☐ |
| → Cycle de Wilson | ☑ | ⚠️ | ☐ | ☑ (12) | ☐ |
| → Courants de convection | ☑ | ⚠️ | ☐ | ⚠️ | ☐ |
| → **Géologie de l'Algérie** | ☐ | ☐ | ☐ | **☐ (0)** | ☐ |

**Légende :** ☑ présent et suffisant · ⚠️ présent mais insuffisant · ☐ absent

**Qualité globale de la couverture : ≈ 58 %**
*(Cours ~90 % · Schémas ~55 % · Exercices ~20 % · QCM ~80 % · Annales 0 %)*

### Trous critiques identifiés

1. **Annales : 0 % sur l'intégralité du programme** — le trou le plus grave, transversal.
2. **Exercices d'analyse documentaire : ~20 %**, quasi exclusivement domaine 1. Les domaines 2 et 3 n'ont **aucun** exercice documentaire alors qu'ils s'y prêtent parfaitement.
3. **Vaccination / sérothérapie : 0 question** — chapitre très tombable.
4. **Collision continentale et métamorphisme : 0 question** — classiques de la partie géologie.
5. **Géologie de l'Algérie : totalement absente** — pourtant explicitement au programme et attendue.
6. **Schémas domaines 2 et 3 : 4 et 6 SVG** contre 79 pour le domaine 1.

---

# ━━━ PARTIE VIII — CONCLUSION STRATÉGIQUE ━━━

### Q1. L'application aide-t-elle réellement un élève algérien à réussir le BAC SVT ?

**Partiellement, et nettement moins que ses chiffres ne le suggèrent.** Ce qui aide réellement : les 23 leçons hors ligne, le module de méthodologie (les lois de rédaction sont un savoir-faire d'examen rarement outillé ailleurs), et les exercices documentaires du domaine 1. Ce qui n'aide pas — et peut nuire : le QCM, qui constitue pourtant le volume principal. Avec des explications qui recopient la réponse et 49 % de devinabilité, l'élève accumule des scores flatteurs sans construire de compréhension. **L'application crée aujourd'hui plus de confiance qu'elle ne crée de compétence.** Avant un examen d'orientation, c'est le pire écart possible.

### Q2. Un élève qui n'utilise QUE cette application peut-il être prêt pour le BAC ?

**Non, catégoriquement.** Trois raisons dirimantes : (1) **aucune annale**, alors que l'entraînement sur sujets réels est la méthode de préparation dominante ; (2) **la Partie 2 de l'épreuve — la situation d'intégration, 5 points sur 20 — n'existe nulle part dans l'app** ; (3) les exercices d'analyse documentaire, qui constituent l'essentiel de la Partie 1, ne couvrent que le domaine 1. Un élève exclusivement formé sur cette app découvrirait le format réel de l'épreuve le jour de l'examen.

### Q3. Quels chapitres/notions sont les mieux couverts ?

Le **domaine 1**, très largement, et en son sein la **communication nerveuse** (synapse, PPM/PPSE, curare, sarin, sommation) et la **catalyse enzymatique** (Michaelis, pH/température) : ce sont les seuls chapitres disposant simultanément de cours, de schémas SVG nombreux (79), d'exercices documentaires structurés avec sous-questions, de QCM et d'une validation méthodologique fine. La **synthèse protéique** est également bien traitée — c'est là que se trouvent les 8 QCM rédigés à la main.

### Q4. Quels chapitres/notions sont insuffisamment couverts ou absents ?

Par ordre de gravité : (1) **vaccination/sérothérapie, collision continentale, métamorphisme, géologie de l'Algérie** — 0 question chacun ; (2) **tout le domaine 2 et tout le domaine 3 en exercices documentaires** — aucun exercice, alors qu'ils représentent une part majeure de l'épreuve ; (3) **mutations (1 question), phosphorylation oxydative (2), dorsale (3)** ; (4) les **schémas** des domaines 2 et 3 (4 et 6 SVG contre 79).

### Q5. L'application est-elle supérieure, égale ou inférieure à un bon manuel scolaire + annales papier ?

**Inférieure en l'état, sur le critère qui compte — la préparation à l'épreuve.** Le couple manuel + annales offre des sujets réels, des corrigés au barème officiel et la structure exacte de l'examen : l'app n'a rien de tout cela. Elle est **supérieure sur trois axes** : disponibilité permanente hors ligne, feedback méthodologique immédiat (une fois fiabilisé), et interactivité. Le bon usage n'est donc pas la substitution mais **le complément** : manuel et annales pour le fond et le format, app pour l'entraînement méthodologique et la révision mobile. Après correction des points 01–08, le rapport s'inverserait sur plusieurs axes.

### Q6. Qu'est-ce qui manque pour devenir LA référence du BAC SVT Algérie ?

Quatre choses, dans cet ordre strict :

1. **Des explications qui expliquent** — c'est le fossé entre une banque de questions et un outil d'apprentissage.
2. **Les annales officielles corrigées au barème réel**, avec la structure 15+5 sur deux domaines. C'est ce que l'élève cherche en premier, et c'est le différenciateur le plus difficile à copier, parce qu'il exige du travail enseignant, pas du code.
3. **Une évaluation qui ne ment pas** — barème positif, distracteurs plausibles, scores calibrés. Sans cela, aucune fonctionnalité d'analytics, de parcours adaptatif ou d'IA n'a de sens : toutes s'appuieraient sur un signal faux.
4. **Une caution académique visible** — un enseignant SVT 3AS nommé. Sur ce marché, la confiance des enseignants et des parents précède l'adoption par les élèves.

Ce qui **ne** manque **pas** : la compétence technique. Build sain, offline sérieux, sécurité sobre, et un `ValidationEngine` qui prouve une vraie intelligence pédagogique. **Le problème n'est pas la capacité à faire — c'est que le contenu a été industrialisé au lieu d'être enseigné.**

### Q7. Quelles 3 actions auraient le plus grand impact immédiat ?

1. **Corriger le barème du `ValidationEngine` et ajouter des tests de faux positifs.** Effort moyen, impact maximal : c'est la faille la plus embarrassante, la plus facile à découvrir par un élève, et l'une des plus rapides à réparer.
2. **Supprimer les données fictives de `StatsView` et mettre les CGU en accord avec le code.** Quelques heures. Met fin, dans la même journée, aux deux mensonges structurels de l'app — un sur la progression, un sur les données personnelles.
3. **Réécrire les explications des 100 QCM les plus servis.** Deux semaines à deux enseignants. Premier pas concret vers un produit qui enseigne, immédiatement perceptible par l'élève.

### Q8. Recommanderais-tu cette application en l'état ? À un élève ? À un parent ? À un enseignant ?

| Destinataire | Réponse | Motif |
|---|---|---|
| **Élève** | **Oui, sous conditions strictes** | Uniquement pour les leçons hors ligne, la méthodologie et les exercices documentaires du domaine 1 — **avec la consigne explicite de ne pas se fier aux scores affichés** |
| **Parent** | **Non** | Je ne peux pas recommander à un parent une app qui surévalue la maîtrise ×2 avant un examen d'orientation, et qui collecte des données de son enfant mineur en affirmant l'inverse |
| **Enseignant** | **Non, pas en prescription** | La non-conformité de la structure d'examen (28/20/34 pts mono-domaine vs 20 pts en 15+5 bi-domaines) sera repérée en trente secondes et discréditera l'outil. **Oui en revanche comme piste de collaboration** : le socle mérite qu'un enseignant y investisse son expertise |

### Q9. Quel est le potentiel commercial réel de cette application en Algérie ?

**Réel mais non réalisé — et aujourd'hui nul en l'état.** Le marché existe (plusieurs centaines de milliers de candidats au BAC chaque année, forte demande de soutien, faible qualité de l'offre numérique existante). Le positionnement offline est un avantage structurel dans ce contexte, et le coût marginal par utilisateur est quasi nul — l'économie unitaire serait excellente.

Mais : **aucun modèle économique implémenté**, aucun moyen de paiement local prévu, aucune caution académique, et un produit qui ne tient pas ses promesses. Le potentiel est conditionné à l'exécution des Phases 1–4. Une monétisation crédible passerait par un cœur gratuit + pack annales corrigées / suivi enseignant, avec paiement CCP/BaridiMob. **Le canal B2B (écoles privées, cours de soutien) est probablement plus prometteur que le B2C**, mais il exige une conformité programme irréprochable — donc le problème 06 en priorité.

### Q10. Si tu devais refaire cette application de zéro, quelles seraient les 5 décisions fondamentales ?

1. **Partir de l'épreuve, pas du programme.** Concevoir d'abord le simulateur conforme (20 pts, 15+5, deux domaines, situation d'intégration), puis remonter vers les contenus qui y préparent. L'app actuelle a fait l'inverse et s'est retrouvée avec un « Défi BAC » qui n'en est pas un.
2. **Aucun item sans explication rédigée par un humain.** Règle absolue, appliquée en CI. Mieux vaut **100 questions excellentes que 508 générées** — un corpus de 100 items bien expliqués aurait plus de valeur pédagogique que celui-ci.
3. **Le contenu est un produit, pas un fichier source.** CMS ou JSON validé par schéma, workflow de relecture avec traçabilité, statut de validation par item. Jamais de corpus de 7000 lignes édité par scripts Python ad hoc.
4. **Concevoir l'évaluation en score positif dès le premier jour**, avec une suite de tests adverses (charabia, réponse vide, copie d'énoncé, mots-clés sans syntaxe) écrite **avant** le moteur. C'est ce qui aurait évité le problème n°1.
5. **Un enseignant SVT 3AS co-auteur dès le jour 1**, pas relecteur en fin de course. La qualité du `ValidationEngine` montre ce qui arrive quand l'expertise pédagogique pilote ; la qualité du corpus montre ce qui arrive quand elle est absente.

---

**VERDICT FINAL : C — Correcte, améliorations significatives nécessaires — 49/100 — Risque ÉLEVÉ, réductible à faible en 3 mois de travail focalisé.**

Ce diagnostic est plus encourageant qu'il n'y paraît : les problèmes sont concentrés dans **le contenu et un barème**, pas dans l'architecture. L'équipe a démontré qu'elle sait produire de la qualité — le `ValidationEngine`, les 8 QCM manuels, les 23 leçons et l'infrastructure offline en témoignent. Il s'agit maintenant d'appliquer ce même niveau d'exigence aux 500 items restants.

---

# ━━━ ANNEXES ━━━

## ANNEXE A — Glossaire

| Terme | Définition |
|---|---|
| **Devinabilité** | Taux de réussite atteignable par une stratégie n'utilisant aucune connaissance disciplinaire (référence : 25 % pour un QCM à 4 options) |
| **Distracteur** | Option incorrecte d'un QCM. Un bon distracteur incarne une **confusion réelle** d'élève |
| **Explication tautologique** | Explication qui se contente de reformuler la bonne réponse sans expliciter de mécanisme |
| **Faux positif (test)** | Cas où le système valide une entrée qui aurait dû être rejetée. Angle mort de la suite T1–T12 |
| **Misconception** | Erreur conceptuelle typique et récurrente chez les élèves ; base de construction d'un bon distracteur |
| **Situation d'intégration** | Partie 2 de l'épreuve DZ (5 pts) : problème complexe, max 3 documents, max 2 questions |
| **P0 → P4** | Priorité : P0 bloquant, P1 urgent, P2 important, P3 souhaitable, P4 cosmétique |
| **[AUDIT LIMITÉ]** | Dimension non évaluable faute d'accès ; explicitement signalée, jamais arrondie favorablement |

## ANNEXE B — Méthodologie d'audit et reproduction des mesures

| Méthode | Détail |
|---|---|
| Lecture de code | ~462 fichiers hors `node_modules` |
| Parsing analytique | Extraction JSON des 508 QCM depuis `src/quizCorpus.ts` ; statistiques gabarits/distracteurs/explications |
| **Tests d'intrusion pédagogique** | Injection de réponses absurdes dans `ValidationEngine` via `tsx`, sur les 12 verbes |
| Tests fonctionnels du tuteur | 10 questions d'élève réalistes, dont darija |
| Exécution | `npm run test:unit`, `test:smartbot`, `npx tsc --noEmit`, `npm run build` |
| Recoupement externe | Programme officiel 3AS et **structure de l'épreuve** (sources web) |

```bash
# Corpus  → 508 items ; 500 tautologiques (ids 1–500) ; 8 rédigés (501–508)
#           « option la moins recyclée » = 251/508 = 49,4 %
#           38 distracteurs réutilisés ≥5×, max 41×
# Barème  → validateAnswer(charabia, …) sur 12 verbes = 19–20/20 PASS
#           « نعم » = 11–17/20 PASS
# Examen  → generateBacExam(d) : 28 / 20 / 34 pts, mono-domaine
npm run test:unit      # 7 échecs / 346, 4 fichiers / 40
npx tsc --noEmit       # exit 0
npm run build          # 6,25 s ; gzip 111K + 59K + 3,4K ≈ 173K
du -sh public/assets   # 10,6 Mo ; mascot.png = 1,9 Mo en 1024×1024
```

## ANNEXE C — Limites de l'audit et éléments non vérifiables

1. **Aucune inspection visuelle.** Chromium/Playwright non installables (`ECONNRESET` sur `cdn.playwright.dev`, puis `fonts-freefont-ttf` introuvable). **Aucune capture, aucun Lighthouse, aucun axe-core, aucun E2E, aucune mesure de contraste.** Dimensions 5 et 7 déduites du code.
2. **Aucun test sur Android réel ni APK.** Temps de lancement, RAM, batterie, 3G/Edge, interruptions, stabilité : **non mesurés**.
3. **Aucune validation scientifique par un enseignant certifié.** J'ai audité la méthode et des échantillons. Un corpus généré non relu contient très probablement des erreurs non détectées.
4. **Dimension 14 non évaluable** : application non publiée, un seul commit, aucun avis.
5. **Sections A/B/C du brief non renseignées** : version, éditeur, store, analytics, roadmap inconnus.
6. **Modification faite par l'auditeur, puis annulée** : `server.allowedHosts` avait été ajouté à `vite.config.ts` pour lancer le serveur en sandbox ; **le fichier a été restauré** (`git checkout`), le dépôt ne contient que les documents d'audit.
7. **Correction d'une erreur d'analyse antérieure** : un premier parseur retournait 0 question (mauvais nom de champ), ce qui aurait produit un faux « aucune couverture » sur 18 thèmes. Mesures refaites avec le champ `questionText`.

## ANNEXE D — Références et standards utilisés

- **Programme officiel** SVT 3AS Sciences Expérimentales (MEN Algérie) — 3 domaines : التخصص الوظيفي للبروتينات / تحويل الطاقة على مستوى ما فوق البنية الخلوية / التكتونية العامة.
- **Structure officielle de l'épreuve** : Partie 1 = 15 pts (2 exercices indépendants, max 2 documents chacun) ; Partie 2 = 5 pts (situation d'intégration, max 3 documents, max 2 questions) ; **les deux parties portent sur des domaines différents**.
- **Placement 2AS vérifié** pour la méiose et les lois de transmission (آليات انتقال الصفات الوراثية) — d'où la correction de la checklist du brief.
- **WCAG 2.1 niveau AA** (évaluation partielle, adaptée au contexte).
- **10 heuristiques d'utilisabilité de Nielsen.**
- **Sciences de l'apprentissage** : testing effect, répétition espacée, interleaving, elaborative interrogation, retrieval practice.

## ANNEXE E — Captures d'écran annotées

**[AUDIT LIMITÉ] — Aucune capture disponible.** Voir Annexe C, point 1. À produire lors d'un second passage avec navigateur disponible ; c'est le principal complément à apporter à cet audit.
