# PHASE 1 — GREFFE DE L'ARCHITECTURE OPUS 5.5 SUR L'APP EXISTANTE

**Date** : 2026-10-02 · **Statut** : implémentation de référence, **remplacée par le master owner** — le CONTRAT (§2) et la feuille de route (§4) restent d'actualité
**Décision owner** : « GO PHASE 1 » (greffe, pas réécriture)

> **NOTE DU SOIR 2026-10-02 — supersession.** Le master owner (`bfa19a8`, snapshot 21:20) embarque sa propre implémentation du parcours (`nbaEngine`, `parcoursPath`, `parcoursProgress`, `ParcoursView`, `NbaCard` — route dérivée des leçons réelles via `getUnitLessonSequence`, carte NBA sur الرئيسية câblée dans `App.tsx`). Elle RETIENT l'arbitrage « greffe sur l'app existante » et remplace le portage littéral décrit ici, qui dupliquait le contenu des leçons en briques autonomes. Ce document reste la référence pour :
> - le **contrat OPUS 5.5** (§2) — les verrous que le moteur du master peut adopter un à un : 4 phases par séance, valve 2 essais → validation fragile, diagnostic T1-T4, dents TEETH, calage classe التدرج السنوي, rappels J+1/J+7/J+21 ;
> - les **arbitrages ouverts** (§3) et la **feuille de route P2-P4** (§4).
>
> L'implémentation initiale (moteur complet + séance plein écran + 29 tests) reste consultable au commit `d7e7da3` de la branche `arena/01a0f7a7-kunz-el-ouloum`.

**Source** : `redesigning-guided-learning-architecture OPUS 5.5 MAX.zip` (origin/master) — prototype Next.js ~6 700 l.
**Principe directeur** : « UNE ROUTE, QUATRE LIEUX, UN GUIDE » — le temps comme architecture, une seule tâche à la fois, jamais de panique.

---

## 1. Ce qui est greffé (inventaire exact)

### 1.1 Nouveau module `src/lib/parcours/` (moteur pur, zéro dépendance React)

| Fichier | Rôle | Origine |
|---|---|---|
| `dates.ts` | Dates à l'heure d'Alger (AAAA-MM-JJ), `addDays`/`diffDays`/`formatDayAr`/`countAr` | portage verbatim |
| `seedBricks.ts` | **Les 19 briques** (U1×4, U4×6, 1/unité pour U2,3,5-11) : contenu disciplinaire réel BAC SVT — concept, 4 vocab, démo 4 dents, application + barème, piège, 3 checks | portage intégral |
| `curriculum.ts` | 11 unités (fenêtres التدرج السنوي 2017, heures, poids BAC, pièges), PATH linéaire (briques → جسر → unité suivante), PHASE_META (geste/verrou/Morchid/interdit par phase), TEETH, `classPositionOn`, `jalonChecklist`, `rubricOf`, `teethSentences` | portage, imports adaptés (sans db) |
| `morchid.ts` | Répliques scriptées des 6 moments (sonde, relance, clé, diagnostic, clôture, jalon) + T1-T4 | portage, types locaux |
| `engine.ts` | **Tous les verrous** : NBA, chemin linéaire, ordre des phases, valve 2 essais, fragile, seuil 6/10, diagnostic T1-T4, rappels espacés, quota quotidien, bonus, carnet, profil | portage des règles de `engine.ts`+`actions.ts` en fonctions pures |
| `storage.ts` | Persistance localStorage, clé versionnée `keo.parcours.v1` | nouveau (arbitrage : pas de Postgres) |

### 1.2 Composants (aucun fichier protégé touché)

- **`src/components/GuidedSessionView.tsx`** (nouveau) — la séance plein écran : brique 4 phases, جسر, rappel 6 min, repos. Le composant ne décide RIEN : il transmet au moteur et affiche. La séance achevée reste affichée au-dessus du panneau « يكفي اليوم ».
- **`src/components/DashboardView.tsx`** (seule modification existante) — carte NBA **en tête d'accueil** : une tâche, une raison (`pace.whyAr`), un bouton. CTA non ambigu (`ابدأ اللبنة`/`أكمل اللبنة`/`ابدأ الجسر`/`راجع الآن`/`نظرة`) pour ne pas parasiter les autres parcours testés. Overlay `z-[60]` → **`App.tsx` inchangé**.

### 1.3 Tests (29 nouveaux, tous verts)

- `src/lib/parcours/__tests__/parcoursEngine.test.ts` — 21 tests : NBA (reprise > rappel dû > nouveauté > repos), calage classe (2026-10-02 → الوحدة 2, élève vierge « متأخّر »), quota + bonus unique, verrous de phase (porte avant sonde, 2 essais → révélation fragile, barème ≥/< 60 %, T2 → J+1), chemin linéaire (saut u1-b2 refusé, itemMode play/attente/relecture/verrouillé), جسر (< 60 % = fragile + rappel de la brique faible), rappels (échec → J+1 fragile ; J+7 → J+21 → retraite au palier 3), valve أنا عالق ×2, carnet.
- `src/components/__tests__/GuidedSessionView.test.tsx` — 4 tests : brique u1-b1 réelle de bout en bout (sonde → porte → vocab → dents → copie ≥ 40 c. → barème caché avant dépôt → 7/8 → clôture → repos → bonus → u1-b2), valve عالق, diagnostic T2 → fragile, CALM (aucun compteur).

## 2. Les règles verrouillées (contrat OPUS 5.5, appliqué à la lettre)

1. **Une route** : `PATH` est l'unique chemin — aucune brique ne s'ouvre hors ordre (`itemMode` = play/attente/relecture/verrouillé).
2. **Une tâche du jour** (NBA) : reprise → rappel dû (6 min) → 1 nouvelle séance → repos « يكفي اليوم » ; quota 1 séance/jour + 1 bonus.
3. **Brique = 19 min en 4 phases** (اكتشاف 4′ → مصطلحات 3′ → منهجية 6′ → تطبيق 6′) ; une phase validée ne se rejoue pas.
4. **Valve 2 essais** puis révélation + validation **fragile** (or jamais rouge ✋).
5. **Barème révélé APRÈS le dépôt de la copie** (≥ 40 caractères) ; seuil **6/10** ; en dessous : diagnostic **T1 mot / T2 document / T3 inférence / T4 hors consigne** → rappel demain.
6. **Rappels espacés** : solide → J+3 puis J+7, J+21, retraite au palier 3 ; fragile → J+1.
7. **جسر (20 min)** : synthèse manuelle (≥ 60 c.) + check-list idées/pièges ; < 60 % cochés → fragile + rappel de la brique la plus faible ; les questions garées au jalon y remontent.
8. **CALM** : ni XP, ni classement, ni streak, ni compte à rebours, ni % global dans le parcours ; juste une phrase de rythme (calage classe التدرج السنوي via fenêtres MM-JJ).

## 3. Arbitrages et écarts assumés

- **Stack** : greffe React/Vite/localStorage (recommandation acceptée) — le prototype Next/Postgres n'est pas repris ; l'état est sérialisable, donc migrable plus tard sans réécriture.
- **KEO-002** : date BAC du parcours = **2027-06-08** (provisoire officielle), modifiable via l'action `profile`.
- **Compte à rebours R8 vs CALM** : arbitrage owner ENCORE OUVERT — la Phase 1 ne l'affiche nulle part (choix CALM par défaut).
- **Morchid** : Phase 1 = répliques scriptées dérivées du contenu (comme le prototype). Les 4 moments sont prêts à être branchés sur le moteur Morchid réel (KEO-103/104/105/106, S-04) en Phase 3.
- **Contenu** : 19 briques portées intégralement ; ~60-80 nécessaires à terme = chantier de contenu, pas de code.

## 4. Feuille de route (propositions, rien d'engagé)

- **P2** — pilier « مساري » : vue chemin (domaines → unités → briques) en relecture seule ; jalons lisibles ; badge fragile sur les briques.
- **P3** — Morchid réel sur les 4 moments (sonde 0:00, clé ~7:00, diagnostic < 6/10, clôture 19:00) ; valve « أنا عالق » → triade.
- **P4** — BAC J-56 : phase finale (résolutions annales), sans compte à rebours sur l'accueil.
- **LEGACY_MAP** (35 surfaces → 4 niveaux) : à dérouler progressivement après validation élève des 4 portes.

## 5. Preuves (2026-10-02, sandbox)

- `tsc --noEmit` ✓
- `vite build` ✓ (3 305 modules)
- `vitest run` : **171 fichiers, 2 151 tests verts** (+ 29 nouveaux parcours), 4 ignorés
- `jest` : **165 suites, 2 114 tests verts**
- Régression détectée puis corrigée pendant la greffe : CTA « ابدأ » de la carte NBA captait le clic du test d'intégration motivation (`getByText('ابدأ')`) → CTA désambiguïsé, motivationIntegration 4/4 ✓.
