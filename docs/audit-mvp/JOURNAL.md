# Journal central — découverte, audit et préparation du MVP

Mis à jour le **2026-10-30**. Références : `67afd92` (lots 01/02),
`9bccc8b` (lots 03/04 ; aucun changement produit entre ces références).
Ce journal assure la reprise entre sessions ; les fiches et preuves restent la
source détaillée de chaque constat. Les lots 01/02 ont été commités sur demande
dans `9bccc8b`. Aucun correctif produit, retrait de fonctionnalité ou périmètre
MVP définitif n'a été décidé pendant ces audits.

## État d'avancement

**20 unités de suivi examinées sur 50 ; 30 restent à auditer.** « Examinée »
signifie qu'une fiche et ses limites sont consignées, pas qu'une fonction est
certifiée complète. Les vingt audits comportent des sondages, pas une validation
exhaustive de chaque contenu, profil et support.

| Date | Étape | Résultat et référence |
|---|---|---|
| 2026-10-29–30 | Découverte du projet | Produit SVT BAC algérien, profils, architecture, accès et documentation croisés avec le code |
| 2026-10-30 | Cadrage MVP | Inventaire de 50 unités de suivi, fiche réutilisable et audits par lots de cinq |
| 2026-10-30 | Lot 01 — F01–F05 | [Cinq fiches, 23 captures, 268 tests ciblés et typecheck verts](LOT01.md) ; cinq défauts, dont trois majeurs |
| 2026-10-30 | Lot 02 — F06–F10 | [Cinq fiches, 25 captures, 262 tests ciblés et typecheck verts](LOT02.md) ; cinq nouveaux défauts, dont un majeur pédagogique |
| 2026-10-30 | Lot 03 — F11–F15 | [Cinq fiches, 31 captures, 246 tests ciblés et typecheck verts](LOT03.md) ; six nouveaux défauts ; accès payant simulé distinct des essais invités ; prochain lot F16–F20 |
| 2026-10-30 | Lot 04 — F16–F20 | [Cinq fiches, 35 images, 44 observations, 487 tests ciblés et typecheck verts](LOT04.md) ; huit nouveaux défauts ; prochain lot F21–F25 |
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
- Lot 03 : 41 QCM livre sur 24 chapitres, pool diagnostique de 91 questions,
  121 textes à trous exportés, 18 schémas de mémoire et 22 situations.
- L'atelier interactif F15 est une leçon de transcription (`LessonTwoView`),
  distincte de l'atelier méthodologique examiné dans le lot 04.
- Les scores de schéma sont déclaratifs ; le bilan diagnostique ne persiste
  pas son résultat ; les validateurs lexicaux peuvent créditer des contradictions.
- Meftah est la porte actuelle de la méthode ; Boussole est une fiche legacy
  intégrée au sous-écran de carte. L'impression React est tronquée ; le HTML
  autonome a produit quatre pages dans les essais A4.
- Tadwin sauvegarde la première fiche et son rappel, mais ne permet pas un
  cycle normal de nouvelles fiches/réécriture dans l'interface testée.
- ICM de forme, couverture C2 et note sur attendus officiels sont distincts.
  La réserve humaine est visible ; l'approbation de fond en file peut cependant
  être donnée localement par l'élève invité, sans validation enseignante attestée.
- Les brouillons BAC sont sauvegardés par exercice et famille ; la reprise
  perd le choix de famille et l'impression du rapport dépend du défilement.

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
| [F11](F11-qcm-livre-bilans.md) | QCM livre/bilans | Partielle : chapitre et bilan terminés, droits incohérents | Conserver et unifier les accès |
| [F12](F12-textes-a-trous.md) | Textes à trous | Partielle : saisie fonctionnelle, contradictions acceptées | Fiabiliser avant crédit de réussite |
| [F13](F13-schemas-memoire.md) | Schémas de mémoire | Parcours représentatif validé comme auto-évaluation papier | Conserver une version simple |
| [F14](F14-situations-documents.md) | Situations | Partielle : recherche et corrigés fonctionnels, quatre supports manquants | Conserver les exercices complets |
| [F15](F15-atelier-interactif.md) | Atelier de transcription | Partielle : 100 % atteint, correction permissive et reprise absente | Fusionner ou différer |
| [F16](F16-meftah.md) | Meftah | Lecture et modèles masqués fonctionnels, renvoi au verbe non ciblé | Conserver l'entrée de méthode |
| [F17](F17-boussole.md) | Boussole et cartes | Partielle : carte principale distincte, impression tronquée | Unifier et fiabiliser l'A4 |
| [F18](F18-tadwin.md) | Tadwin | Partielle : première fiche/rappel présents, boucle de réécriture fermée | Simplifier et fiabiliser la production |
| [F19](F19-correction-ouverte.md) | Correction ouverte | Diagnostics et réserve humaine présents ; provenance de l'approbation non garantie | Garder l'aide avec limites claires |
| [F20](F20-bilans-redaction.md) | Bilans rédaction | Partielle : sauvegarde utile, reprise et impression incorrectes dans certains parcours | Conserver et fiabiliser |

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
| L03-01 | Majeure | Hub examens fermé en invité, mais bilan des trois domaines accessible par le jalon | F11 |
| L03-02 | Majeure pédagogique | Textes à trous : négation et associations de bases inversées validées | F12 |
| L03-03 | Majeure sur les exercices concernés | Quatre documents indisponibles dans trois fiches de situations | F14 |
| L03-04 | Majeure pédagogique | Atelier : une négation validée grâce au mot-clé « inhibition » | F15 |
| L03-05 | Modérée | Atelier : toutes les réponses et la progression perdues au retour | F15 |
| L03-06 | Mineure | Atelier mobile : badge fixe masquant les libellés de navigation | F15 |
| L04-01 | Mineure | Lien Meftah ouvrant l'index sans cibler le verbe attendu | F16 |
| L04-02 | Majeure pour l'impression | Carte intégrée imprimée en un fragment dépendant du défilement | F17 |
| L04-03 | Majeure | Tadwin ne propose plus de nouvelle fiche ni de changement d'unité après la première | F18 |
| L04-04 | Majeure pédagogique | Texte Tadwin à 0 % sauvegardé puis envoyé en consolidation sans réécriture | F18 |
| L04-05 | Modérée | Brouillon Tadwin et choix des clés perdus au rechargement | F18 |
| L04-06 | Majeure de workflow | Approbation du fond d'une production possible par l'invité dans la file locale | F19 |
| L04-07 | Majeure pour l'export | Rapport enseignant imprimé vide selon la position de défilement | F20 |
| L04-08 | Modérée | Reprise d'un brouillon BAC ouvrant la mauvaise famille de consigne | F20 |

Statut de ces vingt-quatre constats : **ouverts, non corrigés dans cette démarche**.
Les recommandations restent proposées. Les fichiers protégés et les générateurs
restent soumis aux règles du dépôt lors d'une éventuelle correction ultérieure.

## Ce qui reste — lots de cinq

| Lot | IDs | Fonctions à examiner | État |
|---|---|---|---|
| 03 | F11–F15 | QCM livre/bilans ; textes à trous ; schémas ; situations scientifiques ; atelier interactif | [Examiné avec limites](LOT03.md) |
| 04 | F16–F20 | Meftah ; Boussole ; Tadwin ; correction ouverte ; bilans de rédaction | [Examiné avec limites](LOT04.md) |
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

## Contrôle avant commit et push des lots 03/04 — 30 octobre 2026

Sur demande du propriétaire, les deux lots documentaires sont regroupés pour
commit et push de `reorganisation-med`. Aucun fichier produit n'est modifié.
Contrôle des preuves, des secrets et `git diff --cached --check` réussis ;
`.env.local` reste ignoré et hors index.

Vérifications fraîches : typecheck et build réussis ; Boussole 138/138 ; Jest
(configuration CI, séquentiel) 305 suites réussies, 3 611 tests réussis et 2
ignorés. Vitest : 313 fichiers réussis, 2 échoués ; 3 679 tests réussis, 2
échoués et 2 ignorés. Les deux échecs concernent les suites concurrentes de
zoom `figureZoomRuntime.test.ts` et `leconRuntimeZoomRendu.lock.test.ts`, déjà
documentées. Les trois échecs `serieIntegration` du contrôle précédent ne se
reproduisent pas dans cette exécution ; aucune correction correspondante
n'a été faite. La suite globale n'est donc pas déclarée entièrement verte.

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

**Auditer F21 à F25**, avec cinq fiches, preuves et bilan, puis actualiser ce
journal et [l'inventaire](INVENTAIRE.md). À la fin des lots, arbitrer le périmètre
MVP à partir de la boucle pédagogique réellement fiable. Ne pas déclarer le MVP
livrable sur la seule base du nombre de fiches terminées.
