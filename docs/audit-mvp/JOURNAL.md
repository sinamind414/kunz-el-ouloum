# Journal central — découverte, audit et préparation du MVP

Mis à jour le **2026-10-30**. Référence du code examiné : `67afd92`.
Ce journal assure la reprise entre sessions ; les fiches et preuves restent la
source détaillée de chaque constat. Aucun commit, correctif produit, retrait de
fonctionnalité ou périmètre MVP définitif n'a été décidé pendant ces audits.

## État d'avancement

**10 unités de suivi examinées sur 50 ; 40 restent à auditer.** « Examinée »
signifie qu'une fiche et ses limites sont consignées, pas qu'une fonction est
certifiée complète. Les dix audits comportent des sondages, pas une validation
exhaustive de chaque contenu, profil et support.

| Date | Étape | Résultat et référence |
|---|---|---|
| 2026-10-29–30 | Découverte du projet | Produit SVT BAC algérien, profils, architecture, accès et documentation croisés avec le code |
| 2026-10-30 | Cadrage MVP | Inventaire de 50 unités de suivi, fiche réutilisable et audits par lots de cinq |
| 2026-10-30 | Lot 01 — F01–F05 | [Cinq fiches, 23 captures, 268 tests ciblés et typecheck verts](LOT01.md) ; cinq défauts, dont trois majeurs |
| 2026-10-30 | Lot 02 — F06–F10 | [Cinq fiches, 25 captures, 262 tests ciblés et typecheck verts](LOT02.md) ; cinq nouveaux défauts, dont un majeur pédagogique |
| 2026-10-30 | Transmission | Journal central créé ; vidéo explicative demandée pour le propriétaire et l'équipe, environ huit minutes, mode fast |
| 2026-10-30 | Préparation vidéo — installation bloquée | `explainer-videos` exige `app-tutorial-videos/engine/tts-local.ts`, absent de l'installation ; les copies retrouvées sont vides et le `tts.ts` disponible n'exporte pas `prepareVoice`/`releaseVoice` attendus. Aucun MP4 produit. Réparation du moteur non effectuée, car la compétence interdit de modifier son moteur. |

Les nombres de tests des lots **ne s'additionnent pas en tests uniques** : plusieurs
fichiers sont communs. Ce ne sont pas des résultats de suite complète ou de CI.

## Ce que nous avons appris

- Application de révision SVT destinée au BAC algérien 3AS, en arabe RTL.
- Interface React/TypeScript/Vite ; Android via Capacitor et WebView, pas React Native.
- Progression locale ; Express facultatif pour comptes, suivi et facturation ;
  SQLite par défaut, PostgreSQL si configuré ; Supabase facultatif.
- Identités élève et enseignant ; invité, essai, gratuit et abonné sont des statuts
  d'accès. Aucun espace parent distinct identifié.
- Gratuité observée sur les unités 1–5 ; essai de 30 jours et saison à 1 200 DA
  jusqu'au 30 juin ; paiement hors app et activation par code.
- Configuration Vercel présente, alternatives Docker/PM2/nginx. Adresse active et
  publication Google Play non établies. Un serveur local a été démarré.
- Documentation technique importante mais fragmentée ; pas de manuel utilisateur
  complet identifié. Code présent, tests verts et parcours fiable sont trois preuves
  différentes ; les audits ont montré des défauts malgré les suites ciblées vertes.
- Parcours observé : 47 entrées HTML et 27 actives, plus 11 bilans ; 29 définitions
  actives existent avec deux variantes recouvrant des clés HTML.

## Fonctions examinées

| ID | Fonction | Verdict borné | Suite proposée |
|---|---|---|---|
| [F01](F01-catalogue.md) | Catalogue | Structure validée, pédagogie exhaustive non vérifiée | Conserver, clarifier les variantes |
| [F02](F02-lecons-html.md) | Leçons HTML | Lecture sondée fonctionnelle ; retour paywall absent | Conserver et fiabiliser les sorties |
| [F03](F03-lecons-actives.md) | Leçons actives | Partielle : perte de reprise et fausse fin de leçon suivante | Simplifier/fiabiliser ou différer |
| [F04](F04-recherche.md) | Recherche | Fonctionnelle sur l'échantillon, variante U6 accessible à tort | Harmoniser destinations et droits |
| [F05](F05-parcours.md) | Parcours | Mécanique déclarative persistante ; reset sans protection | Clarifier déclaration et maîtrise |
| [F06](F06-reprise-progression.md) | Reprise/progression | Partielle : validations restaurées, brouillon perdu | Fiabiliser le contrat de reprise |
| [F07](F07-syntheses-capsules.md) | Synthèses/capsules | Parcours représentatifs validés ; pas de rappel SM-2 Hosila prouvé | Conserver et documenter précisément |
| [F08](F08-cartes-mentales.md) | Cartes mentales | Partielle : zoom parasite et nœuds sans sélection clavier | Simplifier ou différer |
| [F09](F09-animations-simulateur.md) | Animations/simulateur | Partielle : feedback d'égalité inexacte | Fiabiliser avant conservation |
| [F10](F10-qcm.md) | QCM | Séance 57 questions et reprise validées ; limites chrono/mesure explicites | Conserver comme cœur d'entraînement |

## Défauts ouverts

| Référence | Gravité | Constat | Porteur |
|---|---|---|---|
| L01-01 | Majeure | Sortir d'une leçon active efface le snapshot | F03/F06 |
| L01-02 | Majeure | La suivante hérite du succès précédent, compteur 6/4 | F03 |
| L01-03 | Majeure | Variante active U6 ouverte en invité via la recherche | F04/F01 |
| L01-04 | Modérée | Paywall sans retour local sur HTML, également observé sur les cartes mentales | F02/F04/F08 |
| L01-05 | Modérée | Réinitialisation immédiate du parcours sans protection | F05 |
| L02-01 | Modérée | Brouillon actif non restauré au reload | F06 |
| L02-02 | Modérée | Clic de nœud ouvre le zoom global | F08 |
| L02-03 | Modérée | Nœuds sans focalisation ni activation clavier identifiées | F08 |
| L02-04 | Majeure pédagogique | Simulateur : 3,0 présenté égal à 3,2 | F09 |
| L02-05 | Mineure | Potentiel d'action rattaché à l'unité 2 au lieu de 5 | F09 |

Statut de ces dix constats : **ouverts, non corrigés dans cette démarche**.
Les recommandations restent proposées. Les fichiers protégés et les générateurs
restent soumis aux règles du dépôt lors d'une éventuelle correction ultérieure.

## Ce qui reste — lots de cinq

| Lot | IDs | Fonctions à examiner | État |
|---|---|---|---|
| 03 | F11–F15 | QCM livre/bilans ; textes à trous ; schémas ; situations scientifiques ; atelier interactif | À auditer |
| 04 | F16–F20 | Meftah ; Boussole ; Tadwin ; correction ouverte ; bilans de rédaction | À auditer |
| 05 | F21–F25 | Flashcards SM-2 ; rappels ; plan final ; prochaine activité ; banque d'idées BAC | À auditer |
| 06 | F26–F30 | PDF officiels ; examens blancs ; BAC 2025/défis ; diagnostic ; micro-remédiations | À auditer |
| 07 | F31–F35 | Tuteur ; coach ; statistiques ; objectifs ; XP/badges/séries | À auditer |
| 08 | F36–F40 | Rapport partagé ; favoris/minuteur/dictée ; compte ; réinitialisation ; accès | À auditer |
| 09 | F41–F45 | Activation ; invité/confidentialité ; PWA ; Android ; sauvegarde | À auditer |
| 10 | F46–F50 | Synchronisation ; navigation ; RTL/accessibilité ; suivi enseignant ; exports | À auditer |

Les dépendances sondées dans un lot antérieur **ne valent pas audit complet**
de ces fonctions. Exemples : un texte à trou rencontré dans F10 ne clôt pas F12 ;
une écriture locale de quiz ne valide pas F46 ; une vue mobile ne valide pas F44.

## Vérifications transversales encore nécessaires

APK et appareil Android réels ; PWA de production à froid hors ligne ; autres
navigateurs ; profils connecté/essai/abonné ; synchronisation authentifiée ;
exactitude pédagogique exhaustive ; droits des contenus ; performance sur
matériel modeste ; accessibilité complète ; suite globale et CI actuelle.

## Vérifications avant commit — 30 octobre 2026

Le commit demandé ne contient que des documents et preuves d'audit : aucun
fichier applicatif modifié. `npm run lint` et `npm run build` réussissent.
Le harnais Boussole réussit ses 138 assertions. `npm test` s'arrête après Vitest :
312 fichiers passent, 3 échouent ; 3 676 tests passent, 5 échouent et 2 sont ignorés.
Les échecs concernent `figureZoomRuntime.test.ts` (1),
`leconRuntimeZoomRendu.lock.test.ts` (1) et `serieIntegration.test.tsx` (3).
Les deux suites de zoom relèvent de l'exception concurrente documentée ; les
échecs de série empêchent également de déclarer la suite globale verte.
Ils ne sont pas corrigés par ce commit documentaire.
Le second runner, `npx jest --config tests/jest.ci.config.cjs --runInBand`,
réussit : 305 suites, 3 611 tests réussis et 2 ignorés. Cette configuration exclut
les deux suites de zoom ; ce résultat ne remplace pas les échecs Vitest.

## Prochaine action

### Livraison vidéo — 30 octobre 2026

Après autorisation de réparer la chaîne vidéo et d'utiliser Gemini, la vidéo
explicative a été produite : **7 min 41 s**, 16 scènes, narration française Gemini
(voix Kore), **sans sous-titres dans la livraison**. Elle présente le projet,
l'architecture, les profils, les résultats F01–F10 et les 40 fonctions restantes.

Fichier : [vidéo MP4](C:/Users/Lenovo/videos/kunz-el-ouloum-audit-mvp-video/video/livraison/kunz-el-ouloum-audit-mvp.mp4).

Vérifications réalisées : décodage intégral audio/vidéo sans erreur, inspection
visuelle des 16 scènes finales, H.264 1280 × 720 et audio AAC ; aucune piste de
sous-titres ni fichier de sous-titres voisin dans le dossier de livraison.
La clé de `.env.local` reste ignorée par Git et n'a pas été intégrée aux livrables.
Le visionnage et l'écoute par l'équipe restent nécessaires pour la validation
finale de la voix et du rythme. Cette livraison ne clôt aucun audit supplémentaire.

**Auditer F11 à F15**, avec cinq fiches, preuves et bilan, puis actualiser ce
journal et [l'inventaire](INVENTAIRE.md). À la fin des lots, arbitrer le périmètre
MVP à partir de la boucle pédagogique réellement fiable. Ne pas déclarer le MVP
livrable sur la seule base du nombre de fiches terminées.
