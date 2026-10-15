# Mesurer l'usage sans trahir la promesse faite aux élèves

**Question traitée :** « combien d'élèves s'inscrivent, quel est le taux d'abandon, combien utilisent le
mode invité » — réputé non mesurable faute de télémétrie.
**Réponse :** deux de ces trois questions se mesurent **dès maintenant, sans collecter une seule donnée
de plus**. La troisième exige de **réécrire une promesse** publiée. Ce document dit laquelle, à quel
prix, et propose l'ordre à suivre.

> **Décision prise dans ce document :** le niveau 1 (mesurer sans rien collecter de plus) est
> **implémenté**. Les niveaux 2 et 3 exigent une décision explicite de votre part : ils ne sont **pas**
> implémentés.

---

## Étape 0 — ce qui est mesuré depuis le 14/10/2026, sans toucher à rien

Les données existaient déjà : elles n'étaient pas **exploitées**. Le tableau de bord enseignant expose
désormais un bloc « مؤشرات المتابعة », calculé sur les lignes déjà en base (module pur
`src/server/mesurePilotage.ts`) :

| Indicateur | Ce qu'il répond | Calcul |
|---|---|---|
| Inscriptions, inscriptions des 7 derniers jours | « Combien s'inscrivent ? » et son évolution | `students.created_at` |
| **Élèves inscrits sans AUCUNE trace** (ni production, ni quiz) | Le taux d'abandon **après** inscription | compteurs `entries` et `activities` |
| …dont inscrits depuis plus de 7 jours | Ceux qu'il faut relancer au lieu d'attendre | idem + fenêtre de 7 jours |
| % d'inscrits qui n'ont pas commencé | Résumé lisible en un coup d'œil | ratio |
| **Délai médian inscription → première trace** | « En combien de temps un élève se met-il à travailler ? » | première production / événement horodaté |

**Aucune donnée nouvelle n'est collectée, aucun événement n'est envoyé par les appareils.** Ce sont vos
propres lignes, agrégées. C'est exactement ce que la politique publiée autorise déjà (§2 :
« لإحصاءات مجمعة عن استخدام التطبيق … لتحسين المحتوى »). Le mode invité, lui, **reste invisible** :
c'est écrit sous le tableau du professeur, pour que personne ne prenne « 0 abandon » pour une vérité
sur toute la classe.

**Limite honnête :** ces chiffres ne disent rien de la partie de l'abandon qui se produit **pendant le
formulaire d'inscription** (écran ouvert puis quitté, erreur rencontrée, code jamais noté). Pour ça, il
faut des événements côté client — c'est le niveau 2.

---

## Étape 1 — le niveau « sans nouvelle promesse » : mesurer le parcours, mais seulement pour les inscrits

**L'idée :** enregistrer les étapes du parcours **localement sur l'appareil** (ouverture de l'écran
d'authentification, soumission, erreur rencontrée, réussite), et **n'envoyer ces événements qu'au
moment où l'élève devient inscrit** — au même titre que ses autres activités, déjà couvertes par la
politique (§1 : « أحداث النشاط … مع تواريخها »).

| Ce que ça donne | Ce que ça ne donne pas |
|---|---|
| Le taux d'abandon **du formulaire** pour ceux qui finissent par s'inscrire | Le nombre d'invités qui ne s'inscriront **jamais** |
| **Quelle erreur** fait échouer une inscription (`weak_pin`, `too_many_attempts`, réseau…) et à quelle fréquence | Le temps passé sur les leçons sans compte |
| Le temps écoulé entre l'ouverture de l'écran et la réussite | — |

**Pourquoi ce n'est pas encore implémenté :** deux précautions, et une décision qui vous revient.

1. **Ne pas fausser les métriques existantes.** Un événement de parcours qui arrive dans la table
   `activities` compterait aujourd'hui comme « activité récente » : un élève inscrit qui n'a rien fait
   d'autre passerait pour **actif 7 jours**, c'est-à-dire exactement l'inverse de ce qu'on veut mesurer.
   Il faut donc exclure ce type d'événement de `calculeActivite()` — une fonction verrouillée par des
   tests, et la fraîcheur affichée au professeur.
2. **Formulaires à mettre à jour**, même sans rien envoyer depuis les invités : dans
   `store/data-safety.md`, les lignes « Données d'usage de l'application (analytique) : **Non** » et
   « Diagnostics : Non » deviennent **Oui**. (Play refuse un formulaire inexact — c'est écrit noir sur
   blanc en tête de ce fichier.)

---

## Étape 2 — compter les invités : le prix exact

Pour savoir combien de personnes utilisent l'application **sans compte**, il faut qu'un invité envoie
au moins un battement. Cela contredit trois textes aujourd'hui en vigueur :

| Texte | Ce qui est promis aujourd'hui | Ce qu'il faudrait écrire |
|---|---|---|
| `src/data/politiqueConfidentialite.ts` §3 | « **في وضع الزائر (دون حساب): لا يغادر أي شيء هاتفك إطلاقا** » | Quelque chose quitte le téléphone, même sans compte |
| idem §1 | La liste de ce qui est collecté commence par « عند إنشاء حساب » | Ajouter : identifiant d'appareil anonyme + étapes de parcours |
| idem §4 | « لا يوجد … أدوات تتبع خارجية » | Reste vrai **si** le compteur est auto-hébergé (aucun tiers) — à condition que ce soit écrit clairement |
| `store/data-safety.md` | « en mode invité (sans compte) : **Non, aucune** » et « Identifiants de l'appareil : **Non** » | **Oui** sur les deux lignes (identifiant d'appareil + données d'usage) |

**Conception minimale, si vous décidez d'y aller** (aucun SDK tiers, aucun Firebase, aucun GA — c'est
interdit par §4 et ce serait contraire à l'intérêt du produit) :

- un identifiant **aléatoire**, créé localement au premier lancement, stocké dans l'appareil, **jamais
  relié à un nom** ni à un compte ;
- **5 événements** au maximum : application ouverte · écran d'authentification ouvert · soumission du
  formulaire · réussite · échec (avec le **code d'erreur**, jamais le contenu saisi) ;
- envoi **différé et non bloquant** (même file que les activités, qui sait déjà fonctionner hors
  ligne) : une requête perdue ne doit rien casser ;
- côté serveur : comptage **agrégé par jour**, purge automatique à **90 jours**, aucune exposition
  nominative dans le tableau de bord ;
- information des élèves et des parents mise à jour, conformément à la loi **18-07** citée au §7 de la
  politique (un identifiant d'appareil est une donnée à caractère personnel, même pseudonyme).

**Ce que ça coûte vraiment :** la phrase « en mode invité, rien ne quitte votre téléphone » est un
argument de confiance dans un marché où les concurrents embarquent des SDK publicitaires. On l'échange
contre un chiffre. **Ce n'est pas un choix technique, c'est un choix de positionnement** — et il vous
appartient.

---

## Étape 3 — l'alternative à coût nul, à faire AVANT d'instrumenter

Le chiffre que vous cherchez (« combien utilisent le mode invité », « où abandonnent-ils ») est
accessible cette semaine, dans une salle de classe, **sans une ligne de code** :

1. 30 élèves de 3AS, 10 minutes, l'application installée sur leurs propres téléphones (mode invité,
   c'est le défaut).
2. Compter sur papier : combien ouvrent l'application · combien créent un compte · **combien
   échouent et pourquoi** (demandez-leur, la cause est dans l'écran d'erreur) · combien n'y arrivent
   pas du tout.
3. Comparer avec les chiffres du bloc « مؤشرات المتابعة » après la séance : ce que le serveur voit
   (inscrits, jamais actifs) contre ce que la salle montre.

C'est la méthode qui donne un **taux d'abandon avec sa cause**, là où la télémétrie donne un taux sans
explication. Pour un pilote, elle suffit ; pour une mise à l'échelle, le niveau 2 devient utile — mais
il sera alors un choix éclairé, pas une réaction.

---

## Récapitulatif

| Niveau | Répond à | Données collectées en plus | État |
|---|---|---|---|
| **0** — agrégats sur données existantes | Inscriptions, abandon après inscription, délai d'accrochage | **Aucune** | ✅ **Implémenté** (14/10/2026) |
| **1** — parcours des inscrits | Abandon **pendant** le formulaire, erreurs rencontrées | Aucune **des invités** ; événements rattachés au compte | ⏸ Décision + précaution `calculeActivite` |
| **2** — compteur d'invités | Nombre d'utilisateurs sans compte | Identifiant d'appareil + 5 événements | ⏸ Exige de réécrire la politique §3 |
| **3** — analytics tiers | Rien de plus, avec plus de risques | Données vers un tiers | ❌ Interdit par §4, et déconseillé |
| **Observation en classe** | Taux d'abandon **et sa cause** | Aucune | ✅ À faire cette semaine |
