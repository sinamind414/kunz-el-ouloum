# docs/ — catalogue

> Les chemins de ce dossier sont cités dans le code (32 fichiers) : **ne pas renommer
> ni déplacer** un document sans mettre à jour ses citations (`git grep "docs/NOM"`).
> L'ancien contenu de ce fichier (mode d'emploi du kit de patches Boussole) est dans
> `archive/spec-kit-boussole/README.md`.

## Pour les agents IA

`agents/` — documentation de travail, indexée depuis `AGENTS.md` (racine) :
`CARTE_DU_DEPOT.md`, `ARCHITECTURE.md`, `DONNEES_GENEREES.md`, `TESTS_ET_CI.md`,
`SOURCES.md`, `CONSTATS_OUVERTS.md`.

## Audit fonctionnel et préparation du MVP

[audit-mvp/README.md](audit-mvp/README.md) — cadrage du 30/10/2026, constats de
la découverte, plan global d'audit, inventaire de 50 unités de suivi et fiche
d'audit réutilisable. [Lot 01](audit-mvp/LOT01.md) : F01–F05 examinées dans Chromium
sur bureau et viewport mobile, avec tests ciblés et limites explicites.
Le périmètre MVP définitif reste à décider à partir des audits.
[Journal central](audit-mvp/JOURNAL.md) : dix fonctions examinées, quarante restantes ;
[lot 02](audit-mvp/LOT02.md) : F06–F10 et leurs preuves.

## Références vivantes (décisions et contrats en vigueur)

| Document | Sujet |
|---|---|
| `MARQUE.md` | marque كنز العلوم × مفتاح — source de décision des noms |
| `PROTOCOLE_PREUVE.md` | protocole de preuve du trainer المفتاح (lu par `npm run check:miftah`) |
| `SPEC_BOUSSOLE_NSOE.md` | spécification Boussole v2/v2.1 |
| `tadwin_decisions.md` | décisions figées du module Tadwin |
| `SERVEUR.md` | serveur de comptes et suivi — guide technique |
| `MESURE_ET_ANONYMAT.md` | mesure d'usage vs promesse de confidentialité |
| `manual_json_integration.md` | contrat d'ingestion du manuel en JSON |
| `sources/README.md` | sources L1-L6 du correcteur et règle de commit |
| `copies/README.md` | gouvernance du corpus de copies |
| `VISION_COACH_MORCHID_2026-10-15.md` | vision coach (étapes citées par `src/lib/etatEleve.ts`, `phaseEleve.ts`) |
| `VISION_EFFET_CUMULE_2026-10-15.md` | vision « effet cumulé » |
| `PROTECTION_APPLICATION_2026-10-14.md` | vision de protection de l'application |
| `LEGACY_MAP_2026-10-03.md` | feuille de route de simplification |
| `INTEGRATION_FOCUS_MOTIVATION.md` | brique motivation (Pomodoro + Déclic) |
| `SPECKIT_CORRECTION_2026-10-01.md` + `speckit_tickets_2026-10-01.csv` | speckit de correction |
| `Spec_Tadwin_Chamil_SVT.html` | spécification Tadwin (HTML) |

## Audits et bilans (historique daté — lire seulement si la tâche l'exige)

**Correcteur / méthode** : `AUDIT_CORRECTEUR_MEFTAH_2026-09-19.md`,
`BILAN_CORRECTEUR_MEFTAH_ETAT.md`, `SUPERVISION_COPIES_BAC2025_S1.md`,
`SUPERVISION_ACTUEL.md`, `DIAGNOSTIC_EX3.md` (généré par `scripts/diagnostiquer-ex3.ts`),
`AUDIT_APPROCHE_APP.md`, `CROISEMENT_OKACHA_MEFTAH_2026-09-20.md`.

**Tuteur Morchid** : `AUDIT_MORCHID_BUGS_2026-09-22.md`, `AUDIT_MORCHID_VERDICT_2026-09-25.md`,
`AUDIT_QUALITE_TUTEUR_MORCHID_2026-10-14.md`, `ANALYSE_CAPITAINE_LITE.md`.

**Contenu (leçons, QCM, résumés, manuel)** : `AUDIT_LECONS_PASSIVES_VS_LIVRE.md`,
`AUDIT_LECONS_RESUMES_2026-09-21.md`, `AUDIT_MOT_A_MOT_RESUMES_2026-09-21.md`,
`AUDIT_QCM_BILAN_2026-09-20.md`, `AUDIT_QCM_VS_LIVRE_2026-09-20.md`,
`AUDIT_RESUMES_HOSILA_2026-09-23.md` (+ `.json`), `AUDIT_ARABE_HOSILA_2026-09-24.md`,
`AUDIT_BANQUE_HAFIZ_2026-09-22.md`, `AUDIT_DESIGN_CARTES_INJECTEES_2026-09-22.md`,
`AUDIT_INGESTION_MANUEL_2026-09-20.md`, `AUDIT_ROLE_MANUEL_2026-09-19.md`,
`RESUMES_MAARIFI_LIVRE_2026-09-21.md` (étalon cité par `scripts/audit_resumes_hosila.py`),
`VERIF_HIKALA_BAC.md`, `ANALYSE_PROGRAMME_NATIONAL_2026-09-20.md`,
`ANALYSE_UPLOADS_LIVRES_2026-09-20.md`.

**Produit / architecture** : `AUDIT_ARCHITECTURE_2026-09-19.md`,
`AUDIT_EXTERNE_8_AXES_2026-10-14.md`, `ANALYSE_AUDITS_OPUS_GEMINI_2026-09-25.md`,
`AUDIT_FABLE5_CORRECTIFS_2026-09-25.md`, `BILAN_ACCES_ELEVE_2026-10-14.md`,
`BILAN_AUDIT_MODULES_VS_MASTER_2026-10-01.md`, `BILAN_VERITE_AUDITS_2026-10-01.md`,
`FUSION_MASTER_3e970d2_2026-10-01.md`.

## `rapports/` — rapports d'octobre 2026 (auparavant à la racine)

| Document | Sujet |
|---|---|
| `AUDIT_8_AXES_2026-10-20_RAPPORT_FINAL.md` | audit 8 axes (75/100) |
| `VERIF_AUDIT_RAPPORT_FINAL_2026-10-20.md` | vérification terrain de ce rapport |
| `ANALYSE_AUDIT_EXTERNE_2_2026-10-21.md` | analyse de l'audit externe n°2 (64/100) |
| `CHIFFRAGE_APK_2026-10-20.md` | chiffrage APK (cité par `capacitor.config.ts`, `src/main.tsx`) |
| `H1_APK_BILAN_2026-10-21.md` | bilan APK Capacitor |
| `H2_U11_BILAN_2026-10-21.md` | reconstruction de l'unité 11 |
| `M3_PROTOCOLE_VALIDATION_30_COPIES_2026-10-21.md` | protocole de validation indépendante du correcteur |
| `AUDIT_SVG_GENERATEUR_PRO_2026-10-20.md` | qualité du générateur SVG |
| `AUDIT_QUALITE_2026-09-22.md` | audit qualité général |
| `AUDIT_RENOMMAGE_MIFTAH_2026-09-22.md` | renommage §14 Miftah |
| `BILAN_PROPOSITION_MIFTAH_OS_VS_CONTRAT_REEL.md` | proposition « MIFTah OS » vs contrat réel |

## Autres sous-dossiers

- `analyse/` — analyses pédagogiques (chaînes YouTube, leçons prioritaires, marketing)
- `propositions/` — propositions Miftah v5 (HTML + vérification)
- `sources/` — sources officielles L5/L6 + extraits
