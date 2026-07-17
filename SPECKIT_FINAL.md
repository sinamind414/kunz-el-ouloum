# SpecKit Final — Kunz El Ouloum (SVT BAC Algérie)

> **Objectif** : spécification de référence cohérente avec le **vrai dépôt actuel**.
> Deux états sont explicitement séparés : ce qui est **implanté et vérifié** (A) vs ce qui est **à concevoir/implémenter** (B).
> **Dépôt** : `https://github.com/sinamind414/kunz-el-ouloum.git` — branche `master`.
> **Cible** : Terminale / BAC SVT Algérie, mobile-first, offline-first.
> **Langue** : arabe clair pour la pédagogie ; terminologie scientifique BAC française lorsque pertinente.
> **Node** : 22 LTS (CI et production).

---

## A. Déjà implémenté et vérifié dans le dépôt

Preuves : `npm test` (typecheck + smartbot 12/12), `npx vitest run` 29/29, `npm run build` OK, `npm audit --omit=dev` 0 vulnérabilité.

- Application **React / TypeScript / Vite / Express** (`server.ts` sert sur port 3000).
- Mode **offline-first partiel** : leçons, quiz, cartes, entraînement et analyse de documents fonctionnent sans backend.
- Moteur `ValidationEngine` (+ tests T1–T12) ; tests SmartBot et Vitest.
- Tunnel actif **« Mot par Mot »** (`InteractiveLessonView` + `activeLessons.ts`) : leçon pilote Enzymes et catalyse (`d1-u3-l1-enzyme`), Transcription, Traduction.
- Mini-checklists des verbes complémentaires (`SUPPORTING_SKILLS` dans `reflexes.ts`).
- Corrections masquées avant tentative dans les écrans modifiés.
- Carnet d'erreurs initial basé sur `learningInsights`.
- **P0.0 livré (2026-07-17)** :
  - `src/data/reflexes.ts` — **source unique canonique** des six réflexes + 7 compétences complémentaires.
  - `src/data/store.ts` — contrats de stockage offline versionné (v1) + `migrateStore` défensif (survit JSON invalide / localStorage indisponible, borne 100/100/90j) ; étendu le 2026-07-17 avec `MasteryEvidence`, `ConceptRoute`, `ReviewMetadata`, champs `reviewStartedAt`/`reviewStage`, cadence `REVIEW_INTERVALS_DAYS` et helpers `applyEvidenceToError`/`completeMissionWithEvidence`.
  - `src/data/store.test.ts` + `src/data/reflexes.test.ts` — tests Vitest de migration et de réflexes.
- **P1.1-B livré (2026-07-17)** — boucle de mission fermée :
  - `src/services/missionEngine.ts` — `selectMission` (priorité méthode répétée → contenu récent → rappel échu → méthode isolée → onboarding), mission 3 étapes / 8-9 min, action primaire unique.
  - `closeMissionLoop` : une mission n'est `completedAt` **que via `MasteryEvidence` valide** ; sinon reste ouverte (jamais par clic). L'erreur liée est mise à jour via `applyEvidenceToError` (réussite ≥70 avance `reviewStage`, échec redémarre J+1, J+14 consolide).
  - `src/services/missionEngine.test.ts` — 12 tests (priorité, complétion refusée sans preuve, preuve réelle, reprise, cadence J+1/3/7/14 avec `vi.setSystemTime`).
- Build, audit de production et tests actuellement réussis.
- Bundle vendor encore lourd (~291 kB gzip) — cible connue à traiter après P0/P1 sans casser le lazy loading.

---

## B. À concevoir ou implémenter (jamais écrit comme « terminé » tant qu'absent et testé)

> P0.0 et **P1.1-B** sont livrés (voir §A). Reste :

- Store versionné complet `v0 → v1 → v2 → v3` **non destructif** (mon P0.0 couvre v0→v1).
- Référentiel canonique **réellement utilisé par toutes les vues** (aujourd'hui partiellement câblé dans `missionEngine`/`activeLessons`).
- `MasteryEvidence` **déjà typée** (§A) mais pas encore injectée par `ValidationEngine`/quiz/leçon (P2.2 à brancher).
- `ConceptRoute` **déjà typée** mais pas encore peuplée depuis le vrai catalogue de leçons (P1.1 routage UI à faire).
- Suppression complète des données fictives de `StatsView.tsx` (P0.1).
- Mission Engine **persisté côté UI** (le moteur existe et est testé ; il faut le câbler dans `MyPathView`/`ErrorNotebook` pour persistance réelle, P1.1).
- Cartes de survie validées + rappel actif réel (P1.2).
- Sortie BAC dans `InteractiveLessonView` (P1.3).
- Documents vivants contextualisés (P1.4).
- Rappels 1/3/7/14 ancrés à la date d'origine : **logique livrée** (§A) mais non encore déclenchée par le carnet UI (P2.3 à câbler).
- Défi BAC en couches réel (P2).
- Contenu validé par enseignant avec `ReviewMetadata` (P3).
- Playwright / E2E (P3).
- CI GitHub Actions Node 22 (P3) — le dépôt utilise `master`.

---

## P0.0 — Contrats, stockage offline et référentiel méthodologique

> **Déjà livré partiellement** (§A). Contrats stricts ci-dessous ; les champs marqués ⚠️ sont à compléter dans les phases suivantes sans casser P0.0.

### Dépendance obligatoire

```text
P0.0
→ P0.1
→ P1.1
→ P1.2 / P1.3 / P1.4
→ P2.2 / P2.3
→ P3
```

### Fichiers cible (SpecKit final)

```text
src/data/reflexes.ts        ✅ livré
src/types/progress.ts       ⚠️ à créer (consolider les types Mastery/Error)
src/services/storage.ts     ⚠️ à créer (extraire la logie store de src/data/store.ts)
src/services/storage.test.ts ✅ présent (src/data/store.test.ts)
```

### Source unique des six réflexes (interdite de duplication)

```text
حلّل
فسّر
قارن
اقترح فرضية
اشرح / بيّن
صادق
```

Compétences complémentaires (jamais nommées « les six réflexes ») :

```text
حدد، صف، استنتج، علل/برر، اكتب نصا علميا، أنجز مخططا، أنجز رسما
```

### Règle précise sur « ربما »

```text
Le mot « ربما » est interdit UNIQUEMENT dans la production de l'élève
lorsqu'il formule une hypothèse (réflexe hypothesize).

Il n'est PAS interdit dans les consignes, citations, exemples,
explications ou contenus pédagogiques.
```

Implémenté : `CORE_REFLEXES.hypothesize.forbiddenTerms = ['ربما']` ; message bienveillant `HYPOTHESIS_RBMA_MESSAGE`.

---

## Contrats de données (imposés avant toute logique métier)

### Réflexe

```ts
export type CoreReflexId =
  | 'analyse' | 'interpret' | 'compare' | 'hypothesize' | 'explain' | 'validate';

export interface CoreReflex {
  id: CoreReflexId;
  labelAr: string;
  labelFr: string;
  mantraAr: string;
  purposeAr: string;
  connectorsAr: string[];
  checklist: string[];
  forbiddenTerms?: string[];
}
```

### Preuve réelle de maîtrise (P2.2 — ⚠️ à ajouter)

```ts
export interface MasteryEvidence {
  id: string;
  conceptId: string;
  dimension: 'knowledge' | 'document' | 'methodology';
  reflexId?: CoreReflexId;
  source: 'quiz' | 'document_analysis' | 'lesson_transfer' | 'word_by_word';
  score: number;
  createdAt: number;
}
```

### Erreur d'apprentissage

```ts
export interface LearningError {
  id: string;
  kind: 'knowledge' | 'document' | 'methodology';
  conceptId?: string;
  unitId?: number;
  reflexId?: CoreReflexId;
  ruleIds: string[];
  labelAr: string;
  count: number;
  createdAt: number;
  lastSeenAt: number;
  reviewStartedAt: number;   // ⚠️ P2.3 — absent dans P0.0 actuel
  reviewStage: number;        // ⚠️ P2.3 — absent dans P0.0 actuel
  nextReviewAt: number;
  resolvedAt?: number;
}
```

> Note honnête : `src/data/store.ts` (P0.0) définit `LearningError` **sans** `reviewStartedAt`/`reviewStage`.
> Ces champs seront ajoutés en P2.3 sans casser la migration v1.

### Mission

```ts
export interface Mission {
  id: string;
  source: 'error' | 'weak_unit' | 'spaced_review' | 'onboarding';
  titleAr: string;
  reasonAr: string;
  expectedMinutes: number;
  primaryActionLabelAr: string;
  steps: MissionStep[];
  createdAt: number;
  completedAt?: number;
  relatedErrorIds: string[];
}
```

### Registre de destination pédagogique (P1.1 — ⚠️ à ajouter, requis pour routabilité)

```ts
export interface ConceptRoute {
  conceptId: string;
  unitId?: number;
  lessonId?: string;
  documentExerciseId?: string;
  survivalCardId?: string;
}
```

Sans ce registre, une mission connaît une erreur mais ne sait pas quelle leçon/quiz/document ouvrir.

---

## Stockage offline-first (corrigé)

### Choix V1

- `localStorage` pour les petits stores synchrones ;
- Supabase optionnel, jamais nécessaire à une séance de révision ;
- IndexedDB seulement si le volume réel dépasse la capacité utile de `localStorage`.

### Obligations

- version de store ;
- migration **non destructive** `v0 → v1 → v2 → v3` ;
- JSON corrompu géré sans crash ;
- purge avant échec de quota ;
- données actives prioritaires sur l'historique ;
- limite de taille explicite (1 Mo/clé) ;
- maximum 100 erreurs actives, 100 résolues, 90 jours de missions ;
- tests Vitest (pas Jest).

### Interdiction

```text
version inconnue → store vide
```

sans tenter de récupérer les champs compatibles. `migrateStore` (P0.0) préserve `learningErrors`/`missions`/`mastery` lors d'une migration valide.

---

## P0.1 — Données réelles uniquement

Fichier réel : `src/components/StatsView.tsx` (ne pas créer `src/pages/StatsView.tsx`).

Supprimer progressivement : `mockCardData`, `mockQuizHistory`, `mockQuizTimeline`.

État vide obligatoire :

```text
لم تسجل بيانات كافية بعد.
أكمل أول اختبار أو قيّم بطاقاتك لرؤية تقدمك الحقيقي.
```

Tests anti-fiction (utilisateur vierge) : aucun score > 0, aucun historique simulé, aucun badge, aucune unité maîtrisée, aucune faiblesse déclarée par le Coach, aucun graphique de faux résultats.

Préserver les fonctionnalités existantes (export, quiz, graphiques réels, badges, responsive). Corriger le composant existant, ne pas le remplacer.

---

## P1.1 — Mission Engine (après P0.0)

Ordre de priorité exact :

```text
1. erreur méthodologique répétée (count >= 2)
2. erreur de contenu récente
3. rappel espacé échu
4. erreur méthodologique isolée
5. onboarding sans donnée
```

Mission valide : 3–5 étapes ; 5–15 min ; une seule action primaire visible au premier viewport ; mission de méthode = document + mot par mot avec le même réflexe ; mission de contenu = rappel actif avant quiz ; onboarding jamais présenté comme faiblesse ; **mission persistée** (pas régénérée arbitrairement).

Cycle : `créée → stockée → ouverte → terminée → liée à des preuves → liée à une erreur`.

---

## P1.2 — Cartes de survie

```ts
export interface SurvivalCard {
  id: string;
  conceptId: string;
  coreIdeaAr: string;
  causalChainAr: string[];
  scoringTerms: string[];
  evidenceType: 'curve' | 'table' | 'experiment' | 'schema' | 'comparison';
  trapAr: string;
  review: ReviewMetadata; // §P3
}
```

Validateur : idée centrale = 1 phrase ≤ 22 mots ; chaîne 3–6 nœuds ; mots-clés 3–6 ; texte total ≤ 60 mots hors mots-clés ; métadonnées complètes.

Ne pas utiliser `new RegExp(term, 'g')` sans échappement + normalisation arabe. Utiliser tokenisation/normalisation explicite.

Rappel actif réel (bouton « استرجع من الذاكرة ») : masquer idée+chaîne+mots-clés → demander production → révéler → comparer → créer `MasteryEvidence`. Changer seulement le libellé n'est pas du rappel actif.

---

## P1.3 — Leçon → réflexe BAC

Intégrer la sortie de transfert dans `InteractiveLessonView.tsx` + `activeLessons.ts` (ne pas créer de second système de leçons).

Règle : chaque leçon possède au plus une sortie « Réflexe BAC du chapitre », optionnelle (l'élève peut quitter sans perdre la progression du cours).

L'élève ne clique jamais sur « succès »/« échec » : la réussite est calculée par `ValidationEngine` + checklist + score réel + réponse textuelle + éléments scientifiques attendus. Une réussite de transfert ajoute une `MasteryEvidence` structurée (pas un simple compteur).

---

## P1.4 — Documents vivants

```ts
export interface DocumentPracticeContext {
  exerciseId: string;
  conceptId: string;
  unitId?: number;
  documentType: 'curve' | 'table' | 'experiment' | 'schema' | 'mixed';
  reflexId?: CoreReflexId;
  vocabulary: string[];
  goalAr: string;
  assetSrc?: string;
  contentAr?: string;
  altAr: string;
  expectedEvidence: string[];
}
```

Flux : `document → objectif → verbe → checklist → réponse → validation → correction`.
Correction absente du DOM avant soumission ; 2 indices progressifs max ; vocabulaire réel transmis au module mot par mot ; retour à l'exercice après entraînement.

---

## P2 — Défi BAC en couches

Sept couches distinctes :

```text
1. contexte et objectif
2. tâche simple ou complexe
3. verbes attendus
4. exploitation de chaque document
5. synthèse des conclusions partielles
6. production finale
7. relecture méthodologique
```

Interdictions : pas de textarea long direct ; verbe normalisé et comparé aux verbes autorisés ; pas de trace d'un seul caractère ; révision finale avec choix explicite ; correction jamais avant production.

---

## P2.2 — Maîtrise multidimensionnelle

| Situation | Niveau |
|---|---|
| aucune preuve | `unknown` |
| erreur active ou score < 50 | `needs_work` |
| 1–2 preuves fiables, sans erreur active | `developing` |
| ≥ 3 preuves dont une production/document ≥ 80 %, sans erreur active | `mastered` |

Interdictions : trois QCM ne suffisent pas ; le dernier score seul ne suffit pas ; une couleur de maîtrise sans preuve est interdite.

---

## P2.3 — Rappels espacés

Offsets depuis la détection/résolution initiale : `J+1, J+3, J+7, J+14`.
Ne jamais recalculer chaque rappel depuis `Date.now()` (sinon dérive `J+1 → J+4 → J+11 → J+25`).

Champs requis : `reviewStartedAt`, `reviewStage`, `nextReviewAt`.
Règles : nouvelle erreur → J+1 ; réussite avant échéance → conserver la date ; réussite à revue due → avancer d'un offset ; J+14 → consolidation. Tests avec horloge simulée Vitest (`vi.setSystemTime`).

---

## P3 — Validation scientifique

```ts
export interface ReviewMetadata {
  reviewed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  sourceProgram?: string;
}
```

Production : tout contenu public doit avoir `reviewed === true`, `reviewedAt` non vide, `reviewedBy` non vide, `sourceProgram` non vide.

Approche correcte : registre typé de contenus publics ; validation sur les objets réellement importés ; build échoue si une ressource publique n'est pas validée. Ne pas chercher seulement la chaîne `reviewed: false`.

---

## P3 — E2E et Playwright

Avant tests : configurer Playwright ; choisir `jsdom`/`happy-dom` pour UI Vitest ; fixtures (vierge, avec erreur, documenté) ; utilisateur les vrais onglets/sélecteurs.

Ne pas inventer ces routes sans les implémenter : `/quiz/test-quiz`, `/errors`, `/missions`, `/document-practice/test-doc`.

E2E final (390×844 et 1280×720) : vierge → aucun faux score ; activité faible → erreur réelle ; carnet visible ; action corrective ; réussite réelle → erreur résolue ; correction document absente avant / présente après soumission ; navigation profonde sur vraies routes.

---

## P3 — CI, Node et build

```text
.nvmrc : 22
package.json engines.node : >=22
CI GitHub Actions : Node 22
```

Branche : dépôt sur `master` → CI vise `master`.

Build : ne pas remplacer le build existant ; préfixer le pipeline réel :

```text
validate:content
→ typecheck
→ vite build
→ esbuild server.ts
```

Diff check en CI (PR) : `git diff --check origin/master...HEAD`.

---

## Standards de tests

Vitest uniquement (`import { beforeEach, describe, expect, it, vi } from 'vitest'`). Pas de Jest sans installation.
Pas de fragments Markdown invalides dans le code (`[Date.now]`, `[e.id]`, `[fireEvent.click]` → expressions TS normales `Date.now()`, `e.id`, `fireEvent.click(...)`).

---

## Ordre final de livraison

```text
P0.0  Contrats + store + migration + réflexes canoniques            ✅ partiel (v1)
P0.1  États vides + suppression des mocks
P1.1  Mission Engine persisté et routable
P1.2  Cartes de survie validées + rappel actif réel
P1.3  Sortie BAC dans InteractiveLessonView
P1.4  Documents vivants contextualisés
P2.2  Preuves et maîtrise multidimensionnelle
P2.3  Rappels espacés ancrés à la date d'origine
P2    Défi BAC en sept couches relié aux données
P3    Validation scientifique + E2E + accessibilité + performance + CI
```

---

## Commandes de validation obligatoires

```bash
npm ci
npm test
npm run build
npm audit --omit=dev
git diff --check
```

Tests de dates : horloge simulée Vitest. Tests UI : configuration DOM explicite + fixtures déterministes.
