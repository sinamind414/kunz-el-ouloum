# كنز العلوم (Kunz El Ouloum)

Application de révision SVT — sciences de la nature et de la vie — pour le Baccalauréat
algérien, filière **علوم تجريبية** (3AS). 100 % arabe, droite-à-gauche, utilisable
**hors ligne**, 100 % gratuite : pas de publicité, pas de traqueur tiers, aucun compte
obligatoire (mode invité local).

## Ce que l'application couvre

- **11 unités du programme officiel** encodées dans `src/data/curriculumOfficial.ts`
  (heures, fenêtres trimestrielles, compétences), sourcées : التدرج السنوي لسنة 2017،
  دليل الأستاذ. Le non-exigible (المتمم، الأسيلوسكوب، نضج ARNm…) est explicitement exclu.
- **Entraînement** : QCM avec explication et schéma, flashcards, textes à trous, drills de
  schéma, analyses de documents, situations d'évaluation. Correction des réponses ouvertes
  par attendus officiels (barème ministériel 5/7/8 points).
- **Banque BAC** : 11 sessions indexées 2016 → 2026, 3 épreuves blanches complètes par
  domaine, générateur de sujets, mode examen. Une limitation honnête : le corpus ne
  reproduit pas les énoncés intégraux ONEC (droit d'auteur) — un seul sujet complet
  (2025) sert de référence de format.
- **Tuteur القبطان** : chaque conseil est une prescription tracée avec une issue (suivie /
  ignorée / expirée) ; un motif qui échoue trois fois cesse d'être répété ; la remédiation
  ciblée (`MICRO_REMEDIATIONS`) s'affiche après une erreur détectée et programme un rappel
  espacé (SM-2) pour les notions déclarées « à revoir ».

## Comptages de référence (l'étalon)

Les volumes ci-dessous sont **servis** à l'application et verrouillés par
`src/data/volumeCorpus.lock.test.ts`. Convention du dépôt : on compte l'export servi,
jamais le brut. Toute publication d'un chiffre doit pouvoir être rapproquée de ce test.

| Corpus | Servi |
|---|---:|
| Textes à trous | 121 |
| Drills de schéma | 69 |
| Micro-remédiations (dont 11 `schedule_recall`) | 31 |
| Taxonomie des erreurs | 10 |
| Concepts à rappel espacé | 16 |
| QCM du livre (complétés par les quiz de leçons) | 41 |

Deux audits externes ont compté 121 et 161 « textes à trous » le même jour : 161/162 était
le comptage du fichier brut, 121 celui servi. D'où l'étalon.

## Fiabilité

- TypeScript strict : `npm run lint` (tsc --noEmit).
- ESLint 9 (M12, ajouté le 18/10/2026) : `npm run lint:eslint` - configuration
  flat dans `eslint.config.mjs`. **0 erreur ET 0 warning exigés** depuis le
  rattrapage M12-bis (18/10/2026) : 131 variables/imports morts supprimés,
  13 tableaux de dépendances revus au cas par cas (tickers d'invalidation
  volontaires documentés par directive in situ, fetch au montage préservé),
  compteur d'audit non lu désormais affiché (`audit-morchid.ts`). Deux
  exemptions résiduelles, toutes deux décisionnées et commentées dans la
  config : `src/App.tsx` (fichier protégé AGENTS.md - nettoyage différé) et
  `QUESTIONS_EX1_BAC2025` (barème officiel conservé tel quel). Périmètre
  exclu : `public/` (leçons verrouillées), fichiers générés (hosila, okacha,
  lessonIndex, cartesHosila - corriger le générateur), bibliothèques vendor
  (d3, flamegraph), travail concurrent (Python/, CREATION MONTRE XWATCH/).
  B9 exécuté le 18/10/2026 : les 10 débris racine `.js`/`.mjs` supprimés
  (0 référence vérifiée, 21 Ko) — la racine ne conserve plus que
  `eslint.config.mjs` lui-même. `scripts/gen-phase26-append.mjs`
  a été supprimé (générateur one-shot, contenu déjà fusionné et verrouillé).
- Suite complète : `npm test` (= `vitest run` + boussole) - 294 fichiers / 3 465 tests
  au 18/10/2026, aucun échec toléré. Second runner : `test:jest` - 286 suites /
  3 408 tests verts au 18/10/2026 (parité tuteur via prechargerBasesTuteur.jest,
  shim it.skipIf, maxWorkers 50 % contre les timeouts sous charge) ; 8 suites y
  restent volontairement exclues (vi.mock non hoisté, top-level await) et
  continuent d'être couvertes par vitest. 8 tests `skipIf`
  (SQLite, fixtures locales) ne s'exécutent qu'avec leurs prerequisites
  présents — dans une CI sans ces assets, ils sont ignorés, pas verts.
- Build : après `npm run build`, la suite post-build `npm run test:build`
  vérifie dist/ (budgets, JSON tuteur : 562 chunks, précache).
- Bundle (M16, deux volets) : volet 1 — le corpus SVT est un chunk dédié
  (fini la duplication dans les chunks des vues) ; volet 2 — les 550 QCM
  sont éclatés en segments par domaine dans `src/quizCorpus/` (déplacement
  littéral, ordre global = concaténation vérifiée par le script). Au build
  du 18/10/2026 : noyau `svt-corpus` 154,4 Ko + 6 segments `svt-qcm-N`
  (237,1 / 123,1 / 151,8 / 27,4 / 7,7 / 1,4 Ko) au lieu d'un monolithe de
  702,5 Ko — un re-déploiement touchant un domaine ne re-télécharge plus
  les octets des autres. Plafond assumé : le téléchargement PREMIER reste
  le corpus entier (le deck au démarrage vit dans `App.tsx`, fichier
  protégé) ; c'est le revenant de cache entre déploiements qui est éliminé.
- Budget de bundle : `src/build/bundleBudget.test.ts` + `node scripts/poids-entree.mjs`.
- Limites assumées et documentées : le corpus des 40 copies `eleve_*.txt` a servi à
  calibrer le correcteur — tout écart publié sur lui est un plancher, pas une validation
  indépendante.

## Lancer en local

Prérequis : **Node.js ≥ 22.14** (`engines`, dur) ; développé et vérifié sur Node 24.

```bash
npm install
npm run dev          # serveur + interface (tsx server.ts)
npm run build        # build production + serveur consolidé
npm start            # node dist/server.cjs
```

Backend : SQLite par défaut, PostgreSQL si `DATABASE_URL` est défini. Le serveur est
**optionnel** : sans lui, l'application fonctionne hors ligne en mode invité, tout reste
dans le téléphone.

## Vie privée

Profil d'erreurs, ordonnanceur de rappel, boucle du coach : tout vit en `localStorage`,
aucune requête, aucun identifiant. La promesse publiée (« en mode invité, rien ne quitte
ton téléphone ») est vérifiable dans le code (`src/lib/prescriptions.ts`,
`src/utils/profilErreurs.ts`, `src/lib/rappelAdaptatif.ts`). Quand un élève crée un
compte serveur (optionnel), les `errorTags` partent vers l'export du professeur — c'est
documenté dans `src/data/politiqueConfidentialite.ts`.

## Licence

Copyright (C) 2026 sinamind414 — publié sous **AGPL-3.0** (voir `LICENSE`) : toute
œuvre dérivée doit rester open source. Contribuer = lire `AGENTS.md` à la racine :
fichiers protégés, discipline de test, preuves exigées dans les commits.
