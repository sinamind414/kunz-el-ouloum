# Lot 01 — F01 à F05

Audit du 2026-10-30, code `67afd92`, avec documents d'audit locaux non commités.
Travail solo, sans modification du code produit, des données pédagogiques ou des
fichiers protégés. Les recommandations ci-dessous ne sont pas des corrections.

## Résultat

| ID | Fonction | Verdict sur le périmètre examiné | Recommandation proposée |
|---|---|---|---|
| [F01](F01-catalogue.md) | Catalogue des cours | Structure validée ; conformité pédagogique exhaustive non vérifiée | Conserver ; clarifier les variantes et les volumes documentés |
| [F02](F02-lecons-html.md) | Leçons HTML | Lecture représentative validée ; parcours d'accès partiel | Conserver ; rétablir une sortie locale depuis le paywall HTML |
| [F03](F03-lecons-actives.md) | Leçons interactives | Partielle, avec deux défauts majeurs reproduits | Simplifier et fiabiliser avant inclusion MVP |
| [F04](F04-recherche.md) | Recherche | Partielle : résultats utiles, accès incohérent sur une variante U6 | Conserver après cohérence du catalogue et des droits |
| [F05](F05-parcours.md) | Parcours guidé | Partielle : progression déclarative fonctionnelle, reset sans protection | Conserver en distinguant déclaration et maîtrise mesurée |

**Aucune fonction n'est validée sans réserve pour une livraison publique.**
Les trois défauts majeurs ne prouvent pas que tout le produit est inutilisable ;
ils empêchent de déclarer fiable la boucle interactive et l'ensemble de ses accès.

## Défauts établis

| Référence | Gravité | Reproduction et conséquence |
|---|---|---|
| L01-01 | Majeure | F03 : valider un bloc, revenir à la liste, rouvrir → l'avancement disparaît. |
| L01-02 | Majeure | F03 : finir la leçon à six blocs puis ouvrir la suivante à quatre blocs → compteur **6/4**, succès de la nouvelle leçon affiché sans la faire. |
| L01-03 | Majeure | F04/F01 : recherche « التركيب الضوئي », variante active `phase11_chapitres_21_22` rattachée à U6 → ouverture en invité sans paywall ; une leçon U6 normalement listée est verrouillée. |
| L01-04 | Modérée | F02/F04 : ouvrir un résultat HTML U6 → paywall sans bouton de retour local. La navigation principale reste utilisable. |
| L01-05 | Modérée | F05 : « réinitialiser le parcours » efface immédiatement les validations et rappels, sans confirmation ni annulation proposée. |

Les explications causales et les reproductions détaillées sont dans les fiches.
Les priorités de correction sont proposées ; aucun retrait ou arbitrage définitif
du périmètre MVP n'est effectué.

## Vérifications réalisées

- Chromium **156.0.8078.4**, Playwright Python, navigateur réel sans interface
  graphique, serveur de développement `http://localhost:3000`.
- Contextes invités jetables : bureau 1280×900 et viewport mobile tactile 390×844.
  Aucun compte élève réel utilisé, aucune écriture volontaire de facturation.
- **34 observations enregistrées** dans le parcours principal, plus deux contrôles
  complémentaires. Ce sont des observations avec résultats, pas 36 tests tous verts.
- Visite des trois domaines et des onze unités ; lecture et quiz d'une leçon HTML ;
  navigation suivante/retour ; échec de téléchargement simulé avec message et sortie.
- Traversée d'une leçon interactive à six blocs avec fixtures techniques tirées
  des attendus, puis contrôle de sa reprise et de la transition vers la suivante.
- Recherche arabe, absence de résultat, favoris/récents, ouverture d'un résultat,
  recherche hors ligne avec bases déjà chargées et comparaison de droits d'accès.
- Parcours : 85 tâches affichées, première disponible, suivantes verrouillées,
  ouverture, validation déclarative, annulation, rechargement et réinitialisation.
- Contrôle visuel des captures et mesures de largeur sur les vues mobiles sondées.
  Aucun débordement horizontal global observé sur ces vues ; pas d'audit WCAG complet.
- **21 fichiers Vitest / 268 tests réussis**, puis **`npm run lint` réussi**.
  Aucun échec JavaScript de page enregistré dans le parcours principal ; les deux
  requêtes en échec enregistrées correspondent à la panne HTML volontairement simulée.

Voir les [preuves et commandes](preuves/lot01/README.md).

## Ce qui reste inconnu

- APK Android réel, autres navigateurs, performances sur téléphone modeste.
- PWA de production : précache, démarrage réellement hors ligne, mise à jour du SW.
  La recherche à chaud hors ligne ne valide pas cette promesse globale.
- Exactitude pédagogique de toutes les leçons et questions ; efficacité du correcteur.
  Les fixtures de parcours ne constituent pas une validation pédagogique.
- Profils connecté/essai/abonné et backend de suivi, traités dans leurs lots dédiés.
- Suite complète, Jest, build et CI GitHub non relancés dans ce lot documentaire.
  Les 268 tests ciblés et le typecheck ne prouvent pas l'état global de la CI.

## Suite de l'audit

Lot suivant : **F06–F10** (reprise/progression, synthèses, cartes mentales,
animations et QCM). Réutiliser les défauts transversaux déjà décrits plutôt que
les compter à nouveau. Auditer les dépendances nécessaires sans élargir le lot
à une réécriture du produit.
