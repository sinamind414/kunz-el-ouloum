# Analyse du dossier `kunz-el-ouloum-arena-019ff4f0-kunz-el-ouloum (1)`

**Date :** 2026-08-19 · **Analyste :** agent d'audit (mesures exécutées, rien supposé)
**Source analysée :** `kunz-el-ouloum-arena-019ff4f0-kunz-el-ouloum (1).zip` (11 MB, 461 fichiers hors `.git`), extrait et comparé au checkout actuel (commit `1153f28`, branche `arena/01a01a54-kunz-el-ouloum`).

---

## 1. Qu'est-ce que ce dossier ?

C'est le **téléchargement ZIP de la branche de la session Arena précédente** (`arena/019ff4f0-kunz-el-ouloum`), c'est-à-dire **l'état complet du projet au 14 août 2026** (dates des fichiers : 14 août 14:54). La branche elle-même n'existe plus sur GitHub (seules `master` et `sinamind414-patch-1` subsistent) — ce ZIP en est donc **la seule trace conservée**. Il a été retrouvé car il a été poussé tel quel sur `master` (commit `a080b45`, « Add files via upload », 2026-08-19 14:18).

**Comparaison avec le checkout actuel (15 août) :**

| Écart | Détail |
|---|---|
| Fichiers identiques | 452 / 461 (98 %) — dont **tous** les documents `docs/` |
| Fichiers ajoutés depuis (dans l'actuel) | `RESUME_LIVRE_SVT_GEMINI.*`, `gemini manhadijia.txt`, `docs/v3-boussole-architecture.md`, moteurs coaching (`focusEngine`, `gatingEngine`, `masteryEngine`), reconnaissance vocale (`MicrophoneButton`, `useSpeechRecognition`), `CoachEventModal`, etc. |
| Fichiers modifiés depuis (9) | `MyPathView`, `LessonsView`, `InteractiveLessonView`, `DocumentAnalysisView`, `ZoomableImage`, … (modifications légères, surtout intégration des nouveaux moteurs) |
| Noms de fichiers arabes | Dans le ZIP : échappés (`#U0627#U0644…`) — simple artefact de compression, mêmes fichiers |

**Conclusion : le ZIP contient les documents d'audit produits pendant la session précédente — documents toujours présents, identiques, dans le checkout actuel — mais pas de document exclusif perdu.**

---

## 2. Inventaire des documents importants

| Document | Taille | Nature | Verdict / contenu |
|---|---|---|---|
| `docs/AUDIT_15_DIMENSIONS_2026.md` | 881 l. | Audit produit complet (12/08, commit `aea890c`) | **49/100, verdict C, risque ÉLEVÉ** — le document central |
| `docs/AUDIT_CONFORMITE_LIVRE_2026.md` | 1 470 l. | Audit livre officiel ↔ application (12/08, commit `e0b7d17`) | **Volet A (livre) 6,4/10 ; Volet B (app) 7,1/10** ; journal des sprints de correction |
| `docs/AUDIT_ARCHITECTURE_2026.md` | 196 l. | Bilan d'architecture (branche `arena/019ff4f0`) | **5,5/10** — **identifie déjà le défaut critique de l'obfuscateur** |
| `docs/coach-et-correction-erreurs-audit.md` | 238 l. | Cartographie Coach + pipeline de correction d'erreurs | Support d'audit (extraits, flux, points d'attention) |
| `docs/final-visual-audit.md` | 152 l. | Audit visuel (30/07) | La page Leçons n'affichait aucune illustration moderne |
| `docs/modern-visual-inventory.md` | 276 l. | Inventaire exact des assets visuels (31/07) | 67 assets modernes câblés, 42 non câblés, sur 85 envoyés par le professeur |
| `docs/unit1-modern-assets-manifest.md` | 88 l. | Manifeste asset→leçon→bloc (unité 1) | Convention de nommage + statut de câblage |
| `SPECKIT_FINAL.md` | 450 l. | Spécification exécutable (SpecKit) | Contrats de stockage, 6 réflexes BAC, moteur de missions, rappels espacés |
| `kunz-ai-tutor-complete.md` | 1 365 l. | Documentation du moteur Smart Tutor | Arborescence, données, normalisation arabe, session, flux du moteur |
| `kunz-ai-tutor-extraits.md` | 90 l. | Extraits (aperçu) | Résumé du précédent |
| `_coach.patch` / `_speech.patch` | 52 K / 36 K | Patches de travail archivés | Construction du Coach + du mode vocal |
| `audit_report.md` | 37 l. | Rapport court (01/08) | « Excellent état, prêt pour la production » — **contredit depuis par les mesures** |
| `ARCHITECTURE.html` | 186 l. | Vue d'architecture (HTML) | Carte des composants + constats honnêtes (« pas d'API métier réelle ») |
| `الكتاب_المصحح_v1.0.md` | 281 K | **Livre SVT « corrigé »** — désigné comme référence du programme officiel | Fiabilité scientifique bonne mais condensé 26 501 mots vs 330 pages de manuel |
| `SPECKIT_FINAL`, `metadata.json`, README, `PROGRAMME NATIONAL…` | — | Spécs et corpus documentaire | Sources de contenu pédagogique |

---

## 3. Ce que disent les trois audits majeurs

### 3.1 `AUDIT_15_DIMENSIONS_2026.md` — l'audit produit (49/100, risque ÉLEVÉ)

**Verdict :** « C — Correcte, utilisable mais améliorations significatives nécessaires ». Bimodalité assumée : **l'infrastructure mérite un B, le contenu évaluatif un D**. Score de confiance « capacité réelle à préparer un élève au BAC » : **4/10**.

**Top 5 forces (mesurées) :**
1. Offline-first authentique (tuteur sans LLM ni API, vérifié par grep exhaustif).
2. Sobriété exemplaire : 2 permissions Android, 0 SDK publicitaire, 0 vulnérabilité npm.
3. `ValidationEngine` = vrai actif pédagogique (lois de rédaction SVT algériennes : كلما…كلما, بينما, PPM ≠ PPSE…).
4. Les 8 QCM rédigés à la main (ids 501–508) sont excellents — « l'équipe sait faire, elle ne l'a fait que 8 fois sur 508 ».
5. Base technique saine : build 6,25 s, ≈ 173 kB JS gzip, 0 erreur tsc.

**Top 5 faiblesses (mesurées, avec preuves d'intrusion) :**
1. **Correcteur de réponses ouvertes : du charabia bourré de mots-clés = 20/20 ; le seul mot « نعم » = 11–17/20** (cause : `computeScore` part du maximum et ne fait que soustraire).
2. **500/508 explications tautologiques** (« X يرتبط هنا بـ : [bonne réponse] », 64 caractères en moyenne).
3. **≈ 49 % des QCM devinables sans savoir** (251/508 par l'heuristique « option la moins recyclée » ; 38 distracteurs recyclés ≥ 5×, jusqu'à 41×).
4. **Défi BAC non conforme** : l'app génère 28/20/34 points mono-domaine au lieu de l'épreuve officielle 20 pts = Partie 1 (15 pts, 2 exercices) + Partie 2 (5 pts, situation d'intégration), sur **deux domaines différents**.
5. **CGU contredites par le code** : « aucune donnée sur serveur externe » alors que la télémétrie envoie 8 types d'événements à Supabase, sans consentement — sur un public mineur.

Autres constats clés : stats fictives dans `StatsView` (mocks en fallback silencieux), répétition espacée écrite mais **jamais déclenchée par l'UI**, notifications jamais planifiées, pas de recherche, pas d'annales, trous programme (0 question vaccination/sérothérapie, collision, métamorphisme), 79 SVG domaine 1 vs 4–6 pour les domaines 2–3, accessibilité négligée, « Défi BAC » structurellement faux. Registre final : **5 critiques · 11 majeurs · 9 modérés · 3 mineurs**.

**Note importante :** l'audit a aussi **corrigé la checklist du commanditaire** — la grille proposée (« domaine 2 = brassage génétique ») décrivait le programme français/marocain ; la méiose est au programme de 2AS en Algérie, pas de la terminale.

### 3.2 `AUDIT_CONFORMITE_LIVRE_2026.md` — livre ↔ application (A : 6,4/10 · B : 7,1/10)

- **Le livre (`الكتاب_المصحح_v1.0.md`) est scientifiquement fiable** (10/10 sondages conformes : 5'→3', codons, potentiels membranaires, Moho, bilan ATP) **mais matériellement incomplet** (26 501 mots pour 330 pages de manuel ; densité 48 mots/page sur l'immunologie). Sa carte de version l'autoproclame « مُصحَّحة ومُظبوطة » alors que c'est une **correction d'une transcription DeepSeek**, avec une faute dans l'autoproclamation elle-même et des charabias (« التسحيب الأكسدي » au lieu de « الفسفرة التأكسدية »).
- **Point positif inattendu : les 44 leçons HTML de l'app couvrent mieux que le livre** (mapping intégral cohérent, 0 trou, 0 doublon ; notions ABO/Rhésus absentes du livre mais présentes dans l'app).
- **Le chantier principal de la session a été exécuté pendant l'audit :** les **508 explications ont été réécrites en 5 lots** au canevas « mécanisme + réfutation du distracteur + mot-clé BAC », avec un test de non-régression bloquant (interdiction stricte de toute explication circulaire ou < 25 mots). Score B2 passé de 1,5 à 8,0/10.
- Corrections prouvées par commits : remapping des 57 schémas hors-domaine de l'unité 11 (`e130475`), fautes du livre, rappels espacés débloqués (`a918653`), 7 tests rouges réparés.
- Le plafond assumé reste **B3 : le format QCM reste désaligné du BAC réel** (mono-domaine, un document par exercice, notation isolée sur 20).

### 3.3 `AUDIT_ARCHITECTURE_2026.md` — bilan d'architecture (5,5/10)

- **Le défaut éliminatoire découvert : l'obfuscateur JavaScript détruit le code-splitting** — 3 chunks produits au lieu de 59, imports dynamiques transformés en concaténations calculées à l'exécution, vues lazy inaccessibles en production, le tout masqué par 609 tests verts qui ne regardent jamais `dist/`. Recommandation P0 : **retirer l'obfuscateur** + test de fumée sur le `Content-Type` d'une route lazy.
- Dette structurelle documentée : **deux systèmes de persistance concurrents** (`svt_*` dans `App.tsx` vs `kunz_*` dans `store.ts`) avec preuve par sonde exécutée (élève affiché à 0 XP pendant que la maîtrise survit) ; `App.tsx` pivot (17 `useState`, 35 props) ; composants de 2 060 et 1 533 lignes ; 26 scripts de rustine à la racine.
- Leçon transversale de la session : **« le produit n'est pas ce que le code dit, c'est ce que l'utilisateur reçoit — cela se mesure sur l'artefact livré, pas sur les sources »**.

---

## 4. Vérification croisée : qu'est-ce qui a été corrigé, qu'est-ce qui reste ?

Mesures exécutées sur le checkout actuel (15/08, `1153f28`) :

| Constat des audits de la session 019ff4f0 | État dans le code actuel | Preuve mesurée |
|---|---|---|
| 500/508 explications tautologiques / < 25 mots | ✅ **Corrigé** | 508/508 explications ≥ 25 mots, 0 gabarit « يرتبط هنا بـ » |
| Répétition espacée jamais déclenchée | ✅ **Corrigé** | `spacedRecallService` branché dans `CoachView`, `ProgressView`, `SpacedRecallCard` |
| 57 schémas hors-domaine (unité 11) | ✅ **Corrigé** | Garde-fou `quizCorpus.integrity.test.ts` (22 assertions) présent |
| 7 tests rouges (onboarding) | ⚠️ **Partiel** | 643 tests, mais **7 échecs réapparus** (`MyPathView.focusCompass.test.tsx:131`) — la CI `master` est rouge depuis 4 jours |
| Barème du correcteur ouvert (charabia = 20/20) | ❌ **Toujours présent** | `scoring.ts:20` : `Math.max(0, Math.min(maxScore, maxScore - penalty))` — le score part toujours du maximum |
| Stats fictives (`StatsView` mocks) | ❌ **Toujours présent** | 8 occurrences `mockCardData`/`mockQuizHistory`, fallback silencieux |
| CGU contredites par la télémétrie | ❌ **Toujours présent** | `TermsModal.tsx:52` affirme encore « aucune donnée sur un serveur externe » pendant que `telemetryService` envoie vers Supabase |
| Verrouillage séquentiel des unités 2→11 | ❌ **Toujours présent** | 10 occurrences `"isLocked": true` dans `unitCatalog.ts` |
| Double persistance `svt_*` / `kunz_*` | ❌ **Toujours présent** | `App.tsx` manipule toujours `svt_progress`/`svt_units` en brut |
| **Obfuscateur casse le build de production** | ❌ **Toujours présent** | Re-mesuré : 3 chunks vs 59 sans le plugin ; chunks manquants servis en `text/html` — confirmé aussi par mon audit du 19/08 (`ARCH-001`) |
| `mascot.png` 1,9 MB en icône PWA | ❌ **Toujours présent** | 1 914 771 octets, 1024×1024 |
| Générateur BAC 28/20/34 pts mono-domaine | ❌ (requalifié) | Code mort (`bacGenerator.ts` non référencé hors test) — l'audit l'avait reporté en P3 |

**Bilan :** la session 019ff4f0 a surtout **travaillé le contenu** (explications, schémas, rappels espacés — les corrections les plus chères pédagogiquement) et a **documenté sans corriger** les défauts d'infrastructure (obfuscateur, persistance, barème, CGU, mocks). Ces derniers sont restés intacts dans le transfert du 15 août.

---

## 5. Ce que ce dossier change pour la suite du projet

1. **La connaissance existe déjà** : l'obfuscateur (mon constat ARCH-001 du 19/08) avait été identifié, mesuré et déclaré P0 dès le 14/08 dans `docs/AUDIT_ARCHITECTURE_2026.md`. La correction recommandée est identique : **retirer le plugin + test de fumée sur `dist/`**. Il ne reste qu'à l'exécuter.
2. **La feuille de route pédagogique est complète et mesurable** : le registre 28 constats + les sprints 0/1 de l'audit de conformité fournissent un plan d'action déjà priorisé (P0 : barème positif + tests de faux positifs ; suppression des mocks ; CGU ↔ code ; P1 : structure d'examen officielle 15+5 bi-domaines, annales 2008+, relecture enseignante).
3. **Deux chantiers « à faire » sont documentés avec précision** : la **relecture des 508 explications par un enseignant en exercice** (seule dette restante du chantier explications) et la **validation académique nominative**.
4. **Hygiène du dépôt** : le ZIP de 11 MB poussé sur `master` (commit `a080b45`) devrait être retiré après analyse — il duplique l'historique et alourdit le clone pour rien. Les patches `_coach.patch`/`_speech.patch` et les ~26 scripts `patch*.py` peuvent être archivés hors dépôt.

## 6. Recommandation immédiate

Appliquer dans l'ordre, sur la branche courante :
1. **ARCH-001** — retirer l'obfuscateur (validé deux fois par deux audits indépendants).
2. **ARCH-002** — réparer les 7 tests rouges (CI débloquée → build + E2E ré-exécutés).
3. **P0 hérité de 019ff4f0** — barème positif du correcteur ouvert + tests de faux positifs ; suppression des mocks de `StatsView` ; mise en cohérence des CGU avec la télémétrie.
4. Nettoyer `master` (retirer le ZIP) et archiver les rustines.

---

*Analyse réalisée sur extraction du ZIP retrouvé via le commit `a080b45` de `master`. Toutes les affirmations sur l'état du code actuel proviennent de mesures exécutées le 19/08/2026.*
