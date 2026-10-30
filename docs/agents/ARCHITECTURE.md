# Architecture et glossaire

> Lu depuis `AGENTS.md`. Le code mélange français, arabe translittéré et anglais :
> ce glossaire évite de deviner. État au 2026-10-26.

## Vue d'ensemble

- **Client** : SPA React (Vite) servie en PWA (`public/sw.js`, `manifest.json`) et en
  APK (Capacitor ; le service worker est neutralisé côté natif, cf. `src/main.tsx`).
  Entrée : `src/main.tsx` → `src/App.tsx` (**protégé**, routage par onglets, deck QCM
  au démarrage).
- **Hors ligne d'abord** : en mode invité, tout l'état élève vit en `localStorage`
  (`src/lib/prescriptions.ts`, `src/utils/profilErreurs.ts`, `src/lib/rappelAdaptatif.ts`,
  `src/lib/parcours/parcoursProgress.ts`). Promesse publique : rien ne quitte le téléphone.
- **Serveur optionnel** : `server.ts` (Express) + `server/store.ts` (SQLite, défaut) ou
  `server/store.pg.ts` (PostgreSQL si `DATABASE_URL`). Comptes élèves/profs, export
  professeur, facturation. Sur Vercel : `api/index.mjs` charge `dist/server.cjs`.
- **Supabase** (`src/lib/supabase.ts`) : chargé à la demande seulement si
  `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` sont définis ; sinon mode dégradé.
- **Accès freemium** : `src/server/facturation.ts` (source de vérité) et son miroir
  client `src/utils/acces.ts`. Invité/gratuit → المجال 1 (unités 1-5,
  `UNITES_GRATUITES`) ; essai 30 jours ; abonnement saison 1200 DA jusqu'au 30 juin ;
  codes d'activation liés à un appareil (`scripts/gen-licences*.ts`).
  ⚠️ L'en-tête de `facturation.ts` dit encore « unité 1 seule » : la décision du
  25/10/2026 a élargi à 1-5 dans `acces.ts`.

## Programme

11 unités officielles (`src/data/curriculumOfficial.ts`), regroupées en domaines
(`PASSIVE_DOMAINS` dans `src/data/lessonModes.ts`). Comptage vérifié le 30/10/2026 :
le parcours comporte 47 entrées HTML + 27 entrées actives, puis 11 bilans (85 tâches).
`ACTIVE_LESSONS` contient 29 définitions : deux variantes à clé HTML ne figurent
pas dans le menu actif ; ne pas additionner ces catégories sans tenir compte du
recouvrement. Le précédent chiffre « 20 actives » était périmé.
Les HTML et `src/data/activeLessons.ts` sont **protégés**.
Preuves et limites : `docs/audit-mvp/F01-catalogue.md`.
Index tuteur : `src/data/lessonIndex.ts` (généré).

## Glossaire des modules

| Nom dans le code | Arabe | Ce que c'est | Fichiers d'entrée |
|---|---|---|---|
| Correcteur V1 | — | correction des réponses ouvertes par mots-clés sourcés (L1-L6) + barème 5/7/8 | `src/correcteurV1.ts`, `src/lib/validation/`, `src/utils/calibration.ts` |
| Meftah / Miftah | مفتاح المنهجية | méthode de rédaction BAC (verbes, « لأنّ ») ; marque | `src/data/miftahSpec.ts`, `src/data/meftahLaw.ts`, `docs/MARQUE.md`, `docs/PROTOCOLE_PREUVE.md` |
| Boussole | بوصلة الإجابة | 4 étapes de rédaction (اقرأ · اجمع · اربط · اختم) | `docs/SPEC_BOUSSOLE_NSOE.md`, `tests/boussole.test.ts` |
| Morchid | المرشد | tuteur conversationnel local | `src/smartTutorEngine.ts`, `src/tutorKnowledge.ts`, `src/components/AITutorView.tsx` |
| Capitaine | القبطان | voix unique du guide + boucle coach (prescription → issue) | `src/data/capitaine.ts`, `src/lib/prescriptions.ts`, `src/lib/coach/` |
| NBA | — | « next best action » : quoi faire ensuite | `src/components/NbaCard.tsx` |
| Okacha | عكاشة / بنك الحفظ | récapitulatifs à mémoriser (livre عكاشة) | `src/data/okacha.ts`, `okachaEnriched.ts` (générés), `OkachaView.tsx` |
| Hosila | الحصيلة المعرفية | synthèse officielle du manuel par unité | `src/data/hosila.ts`, `cartesHosila.ts` (générés) |
| Tadwin | التدوين الشامل | rédaction de synthèse notée par clés (scorer C2) | `src/data/tadwinCles.ts`, `src/lib/validation/couvCle.ts`, `docs/tadwin_decisions.md` |
| Guide manhajia | الدليل العام للمنهجية | guide méthodologique fusionné | `src/data/guideManhajia.ts` (généré depuis le GUIDE_FUSION racine) |
| Parcours | — | chemin linéaire d'apprentissage | `src/lib/parcours/` |
| Rappel / SM-2 | — | répétition espacée | `src/lib/sm2.ts`, `rappelAdaptatif.ts`, `rappelConcepts.ts` |
| Banque BAC | أفكار التمارين | sujets indexés par session 2016-2026 | `src/data/bacSessionIndex.ts`, `src/data/sujetsBlancs/`, `public/bac-sujets/` |
| Marque | — | marque de traçabilité apposée aux exports | `src/utils/marque.ts`, `server.ts` |

## Où chercher selon la demande

| Demande | Commencer par |
|---|---|
| un écran / un bouton | `src/components/<Vue>View.tsx` (77 composants) |
| contenu pédagogique (QCM, textes à trous, drills) | `src/quizCorpus/`, `src/data/fillBlanks.ts`, `src/data/drillBank.ts` |
| note d'une copie | `src/correcteurV1.ts` puis `src/lib/validation/` — lire d'abord les règles du correcteur dans `AGENTS.md` |
| compte, paiement, export prof | `server.ts`, `server/`, `src/server/`, `docs/SERVEUR.md` |
| APK / store | `capacitor.config.ts`, `android/`, `store/README.md`, `docs/rapports/H1_APK_BILAN_2026-10-21.md` |
| vie privée | `src/data/politiqueConfidentialite.ts`, `docs/MESURE_ET_ANONYMAT.md` |
