# Audit — « apprendre le مفتاح dans l'app » (bilan, 2026-09-06)

> Audit demandé « sans code » de l'approche pédagogique (5 phases d'acquisition + moteur A–K).
> **Décisions actées : `docs/MARQUE.md` §11 (D1, D2, D3).** Ce document est la référence
> de l'ordre de développement — pas une spec de code.

## 1. Verdict

Le plus fort document de design du projet : gradual release, espacement, interleaving et
auto-calibration sont bien pensés et mieux exécutés que la moyenne des apps edtech. Mais le
document contient **quatre contradictions internes tranchées (D1/D2)** et **réinvente à ~30 %
un moteur de correction qui existe déjà, testé, dans le repo**. Risque n°1 global :
**l'opérationnel** (correcteurs, SLA, pool de contenu), pas le logiciel.

## 2. À garder tel quel

- Inversion « action d'abord, fiche en filet de référence » (jamais de cours de méthode).
- Phase 1 (portes) **avant** toute rédaction — le jugement de porte est le point de
  défaillance unique ; mal jugé, tout le reste est vicié.
- Fading 2a → 2b → 2c (résolu → complété → guidé) sur les mêmes questions.
- Phase 4 : **l'écart auto-note / note réelle** comme métrique reine (interiorisation du
  regard correcteur).
- Espacement + interleaving explicites, plafond 14 j avant le bac blanc.
- L'erreur comme contenu (fausses copies à corriger — « repérer chez autrui »).
- Formats spéciaux = sous-étape 2a' dans le même pipeline (pas de module éclaté).
- Gamification : **aucune récompense de vitesse en phase 3-4** ; classement sur assiduité
  seulement.
- Anti-triche proportionnée (flag silencieux, items pièges, feedback non-skippable en 2e passe).
- Boucle annuelle (K) : archivage des items > 95 % de réussite à 500 élèves.

## 3. Points critiques (et leur issue)

| # | Constat | Issue |
|---|---|---|
| 3.1 | **Triple contradiction 12/12×3** : fiche « متتالية » / approche « non consécutives » / code streak-reset | ✅ **D1** : 3 jours distincts ; un échec allonge l'intervalle sans reset. Textes fiche corrigés, code PENDING (`v3Progress.ts`). |
| 3.2 | **Déverrouillage مفتاح+ contradictoire** : fiche = après 12/12×3 ; approche = après noyau stable sur 3 types | ✅ **D1** : 12/12×3 → Phase 2 + badge حامل المفتاح ; verso → 3 types maîtrisés (= أمين الكنز). Fiche ك corrigée. |
| 3.3 | « 3 checks = validation automatique » en 2b valide la **forme**, pas le fond → « validé » sur un mécanisme faux pendant 24-48 h | Verdict auto titré « **forme validée** » en Phase 2 ; le verdict de contenu existe déjà et fait mieux : **réutiliser `methodologyScorer` + `ValidationEngine`** (8 tags, 138 invariants) — pas de second moteur. |
| 3.4 | La « seule métrique » (écart) n'existe qu'en phase 3-4, retardée de 24-48 h → tableau de bord vide 2-3 semaines ; déprécie **en silence** XP/ICM | Décision à prendre explicitement (recommandé : XP/ICM conservés comme couche d'engagement **sous** la calibration) ; afficher en phase 1-2 la série de drill + cellules de la matrice. |
| 3.5 | Correction humaine (G) : seule partie qui n'est pas du logiciel ; « pool Kunz » = coût + fiabilité inter-correcteurs, contradictoire avec « 100 % hors-ligne » | **Le correcteur = l'enseignant du produit** (compte + dashboard existants) ; le pool = phase d'échelle, pas MVP. |
| 3.6 | Diagnostic « silencieux » de 3 items : variance énorme, « < 3 s » bruité sur mobile, test caché risqué culturellement | 5-6 items, habillage assumé « افتح أول باب », **placement révisable** (la vraie mesure arrive en Phase 1). |
| 3.7 | Cliff Phase 2→3 (amorces → rien) + 1 tap « t'aide » = retour Phase 2 intégrale | Sous-étape **2d** (amorces masquées par défaut) + renvoi ciblé = **micro-séquence 2a** sur le sous-type, pas la re-Phase-2. |
| 3.8 | La matrice (B) promet des **%** inconstructibles sans NLP lourd ni humain | Cellules = **ratios glissants de binaire** du scoreur existant (ex. : % de productions « فيلم » sans tag causal sur les 10 dernières). |
| 3.9 | 12 consignes fixes → l'élève mémorise les items, pas la règle | **Pool ≥ 50 consignes tournantes** — budget éditorial à chiffrer (comme la banque de mots-clés/chapitre et les 30-50 fausses copies : **trois projets de contenu, pas des features**). |
| 3.10 | Mode examen : correction humaine seule à 24-48 h après 3 h ; dernier mois sans soupape de révision libre | Scoreur (tags) pour le retour immédiat + humain comme référence ; **mode révision libre** le dernier mois (l'interleaving tient l'élève, pas le parent). |

## 4. Ce que l'approche oublie

1. **Où ça vit dans l'IA** : pas d'« centre d'entraînement » ni de **compositeur de session**
   (l'algorithme qui assemble *les items du jour* à partir du plan C — le cœur manquant).
2. **Le rôle enseignant** au-delà du dashboard : matrice de ses élèves, assignment d'un type
   2b ciblé, file de correction.
3. **La rétention** : élève à 8/12 qui disparaît 5 jours — brancher `StudyReminderModal` sur
   le stade de phase.
4. **Le lien avec les 23 leçons** : l'approche est 100 % annales ; la méthode doit aussi
   s'entraîner sur le contenu des leçons (les `miftah-encadre` sont déjà posés dedans).
5. **La réconciliation formelle** avec MARQUE (fait via §11 D1-D3).

## 5. Cohérence avec le repo

**À réutiliser (existe, testé)** : `methodologyScorer` + `ValidationEngine` (8 tags,
138 invariants) = la note « officielle » + les checks 2b-2c-3 · `v3Progress` (12/12×3, à
adapter — D1) · `normalizeAr` + `synonyms` (similarité arabe) · `quizCorpus` (7 100 lignes),
`fillBlanks`, `documentAnalysisExercises` = l'ossature de la banque E · serveur comptes +
dashboard enseignant · ICM.

**À construire** : UI d'écriture arabe (RTL + unités LTR + compte de mots), glisser-déposer
2a, compositeur de session/planificateur, tracking par cellule, file de correction
enseignant. De l'UI + un scheduler — **moyen, pas héroïque**, le socle scoring/data/serveur
existe.

**⚠️ Fiche de référence** : la version HTML circulant en v3.1 pré-décision (noms latins
MIFTAH/MIFTAH+, « مفتاح الكنز », « السنّ 0 », 5 erreurs au verso) est **supplantée** par la
version du repo (renommage officiel + القفل + erreurs 1-3 au recto + A4). Toute copie hors
repo doit être jetée, pas resynchronisée.

## 6. Ordre de dépendances (avant tout code moteur)

| # | Action | Dépend de |
|---|---|---|
| 0 | ✅ D1 — textes fiche + spec + garde-fou + code `v3Progress.ts` (fait 2026-09-06) | — |
| 1 | ✅ D2 — `استنتج` : le moteur suit la fiche — implémenté (carte + meta + scoreur + verbMapping, spec MARQUE §11) | — |
| 2 | D3 — test 10 élèves (protocole MARQUE §11) | fiche corrigée (0) |
| 3a | ✅ **Phase 0** (6 démos auto-pace avec feedback) + **Phase 1** (drill : banque 60 consignes, tirage quotidien déterministe, 2 portes/consigne, résultats par porte) — fait 2026-09-06 | 1 |
| 3b | ✅ **Cellules B = ratios glissants** du scoreur (fenêtre 10, part sans l'erreur typique du verbe — `verbSlidingRatio`, panneau « الاستقرار على النواة ») — fait 2026-09-06 · ⏳ matrice multi-élèves (côté serveur/dashboard) reste à câbler sur les logs | 3a |
| 4 | ✅ **Verdict Phase 2 « forme validée »** : 4 pastilles (3 portes de classification + structure ICM ≥ 60 sans erreur typique) — refondu en 4 après l'update §12 (existence/source/mouvement/forme) — verdict auto = « forme », jamais « correct » ; le fond est renvoyé à la Phase 3 (`evaluatePhase2`, 11 tests) — fait 2026-09-06 | 3 |
| 5 | ✅ **Phase 3 : renvoi ciblé** (micro-2a sur les étapes en défaut, pas la re-Phase-2 — `remediationTargets`) + **file de correction** (production « forme validée » → onglet المصححة : approuver / à corriger + note ; l'enseignant du produit est le correcteur — `correctionQueue`, 9 tests) + **carte-référence** en rédaction libre — fait 2026-09-06 · ⏳ multi-élèves : la file suit les logs côté serveur | 4 |
| 6 | ✅ **Phase 4 — calibration** : auto-évaluation /20 requise à la soumission stage 4, note réelle posée par l'enseignant dans la file, **écart = métrique reine** (moyenne signée, |moyenne|, sur/sous-estimation, sparkline, nudge pédagogique — `calibration`, 12 tests). XP/ICM conservés en couche d'engagement **sous** la calibration (décision audit §3.4 actée) — fait 2026-09-06 | 5 |
| **7a** | ✅ **Base de l'update owner 2026-09-06 (MARQUE §12)** — 3 portes (existence 🚪 / source 📥 / mouvement ⚙️ à 3 issues) + 4 dents renommées (🔍 تَبَصَّر · 🔑 أدخل · 🔄 أدر · 🔓 افتح + mnémonique figée) + **🔨 الحدّاد** (verb_hypothesis_v1 = smith, l'angle mort BAC 2025 corrigé) + drill 3 portes (69 items dont 12 🔨, détection ومعلوماتك/ومكتسباتك) + verdict 4 portes + cascade vue (progressive disclosure) + fiche/carte/garde-fou — fait 2026-09-06, **ajusté 2026-09-07** (carte imprimée : 2 portes + ligne famille ; حدّad = 3e forme verso ; noyau 10→11 dégelé ; dent 1 = تَبَصَّر — MARQUE §12bis) | 1 |
| **7b** | ⏳ **Architecture d'apprentissage (doc owner « منهجية التعلّم داخل التطبيق »)** — (i) diagnostic silencieux 90 s (4/4 < 3 s ⇒ 2ج ; 0-1/4 ⇒ démo 20 s obligatoire) + démo explicative 20 s (zéro interaction, « جرّب أنت ») ; (ii) 2أ drag & drop (alerte 🔨 : « هل صنعتَ رابطا جديدا أم كررتَ ملاحظة؟ ») + 2ب soubassement par mouvement (📷 ⇒ افتح seul · 🎬 ⇒ أدر seul · 🔨 ⇒ أدر+افتح ensemble) + 2ج ; (iii) stage 3 : questions mélangées 📷🎬🔨 (interleaving) + temps réel (~5-7 min 🔨) + bouton caché « بحاجة إلى تذكير؟ » ⇒ retour 2ب ; (iv) stage 4 : grille d'auto-évaluation par dent (✅/❌) AVANT la note réelle — **l'écart par dent/par porte = le vrai indicateur** (complète la calibration ligne 6) ; (v) répétition espacée (portes ×2 si < 3 s · drawer J+2 ×1.8 · 📷/🎬 J+3 ×1.5 · 🔨 J+3 ×1.3 seul) ; (vi) badge 🔨 **الحدّاد الماهر** (rareté : maîtrise 🔨) ; (vii) mode examen : dernier mois seulement, 4 h 30, toutes soubassements désactivés, correction humaine uniquement, **analyse de la distribution du temps entre les 3 mouvements** ; (viii) banque 150 consignes étiquetées 3 champs (🔨 ≈ 25-30%) | 7a |
| 7 | ~~Mode examen + dernier mois~~ — **absorbé par 7b(vii)** (version 60 min one-shot de la ligne 6, cadence révisée par l'owner) | 6 |
| 8 | Pool correcteurs + auto-calibration auto/humain (G, K) | **phase échelle, pas MVP** |

## 7. Bilan

**Approuver l'approche comme document de design**, avec 4 ajustements structurels :

1. Contradictions de verrouillage résolues (**D1**) — fiche, spec et code doivent dire la
   même chose sur l'accomplissement central.
2. **Réutiliser le scoreur existant** au lieu d'un second moteur de checks — le plus gros
   gain de temps disponible.
3. **Correction humaine = l'enseignant du produit**, pas un pool nouveau.
4. **Définir les cellules de la matrice** comme ratios de binaire, et trancher le sort de
   l'XP/ICM plutôt que de les déprécier en silence.

**Prérequis dur de la Phase 1** : D2 (`استنتج`) — ✅ fait 2026-09-06. **Étape suivante de l'owner** : D3 (test
10 élèves). **Fiche de référence** : celle du repo, verrouillée par `check:miftah`.
