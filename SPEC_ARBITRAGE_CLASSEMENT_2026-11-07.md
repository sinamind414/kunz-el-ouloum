# Spec d'arbitrage — Phase 3 / R9 : « classement entre amis »

**Consigne reçue :** « GO CONTINUE » (poursuite du plan une phase à la fois).
**Branche :** `arena/bcf8863b-kunz-el-ouloum` (active) · **Pointe publiée : `1345975`** · **0 PR**.
**Statut :** document d'arbitrage **sans code, sans donnée, sans décision prise**.
**Légende** : **[CONSTAT]** = vérifié par commande ce tour · **[INTERPRÉTATION]** = lecture déduite · **« Non vérifiable »** = jamais supposé.

---

## 1. Pourquoi un document et non une implémentation

**[CONSTAT]** L'audit du 7/11 (`AUDIT_ASSIMILATION_8_AXES_2026-11-07.md:109`) demande : « Quiz réellement adaptatif (difficulté ajustée en temps réel) et **classement entre amis**, **sans** notifications push imposées ». La première moitié est **livrée et publiée** (`7982eb4` → `74796ca`) : moteur pur à 3 paliers, porte opt-in, anti-triche aligné, sans notification. **[CONSTAT]** La seconde moitié reste ouverte.

**[INTERPRÉTATION]** Trois obstacles mesurés empêchent une implémentation honnête dans ce tour :

1. **[CONSTAT]** `server.ts` fait partie des **fichiers protégés** du projet ; le modifier exige un arbitrage explicite distinct.
2. **[CONSTAT]** Aucune **relation entre pairs** n'existe dans le dépôt : 17 routes, des comptes élèves et professeurs, mais **0** table / route / champ « ami », **0** endpoint de classement, **0** score comparatif entre élèves.
3. **[INTERPRÉTATION]** Fabriquer un classement obligerait à inventer des noms, des liens d'amitié, des scores et leur persistance : interdit par la règle **« zéro contenu inventé »**, qui vaut aussi pour les données d'élèves.

**[CONSTAT]** « GO CONTINUE » ne nomme pas « classement » et n'apporte ni sources, ni identités, ni consentement. **[INTERPRÉTATION]** Ce document est donc le livrable maximal et réversible : il **prépare** la décision sans la prendre.

---

## 2. Ce qui existe réellement (mesuré ce tour)

| Élément | Constat |
|---|---|
| Routes HTTP | **17** routes uniques dans `server.ts`, dont `/api/health`, `/privacy`, `/.well-known/assetlinks.json`, `/api/auth/{register-code,register,login,me}`, `/api/student/{sync,entries,activity,reset-password}`, `/api/teacher/{login,dashboard,entries,export/csv,reset-password}` |
| Identité | authentification élève et professeur par JWT (`makeStudentAuth` / `makeTeacherAuth`), activité et entrées d'élève persistées, export CSV professeur |
| Score R9 | `QuizAdaptatif.tsx` tient un **score de séance local** (`useState(0)`, sur 10 questions) affiché en fin de série — **non persisté, non comparable, non envoyé** |
| Affichage élève | le bilan dit en فصحى : « لا يُحفظ أي ترتيب بين المتعلمين ولا تُرسل أي إشعارات » |
| Classement | **0** occurrence de `leaderboard` / `classement` / `ranking` / `friends` / `ami` dans `server.ts` ; **0** route correspondante |
| Notifications | `tc2Brancher.lock.test.ts:77` interdit déjà `Notification.requestPermission` dans `src/App.tsx` ; R9 n'en ajoute aucune |

**[INTERPRÉTATION]** Rectification maintenue depuis le tour précédent : dire « il n'y a pas de backend » serait **faux**. Ce qui manque est la **dimension sociale**, pas l'infrastructure de comptes.

---

## 3. Ce qu'il faut trancher avant toute ligne de code

**[INTERPRÉTATION]** Questions ouvertes, volontairement **sans réponse** : aucune n'est déductible du dépôt.

1. **Qui est un « ami » ?** Pair invité par code, groupe de classe, compte professeur, ou simple pseudonyme local ? **[CONSTAT]** Aucun de ces modèles n'existe aujourd'hui.
2. **Consentement et âge.** Public visé = élèves de Bac, potentiellement mineurs. Qui consent, et comment le retrait est-il possible ? **« Non vérifiable »** : cadre légal applicable, âge réel des utilisateurs.
3. **Quel score comparer ?** Le score de séance R9 est déclaré **[INTERPRÉTATION]** *règle de présentation*, pas mesure psychométrique ; le comparer entre élèves créerait un classement sans base pédagogique validée.
4. **Visibilité.** Qui voit quoi : l'élève seul, ses pairs, le professeur, un export ? **[CONSTAT]** `/api/teacher/export/csv` existe déjà : toute donnée nouvelle tombant dans ce périmètre change la portée de l'export.
5. **Persistance et durée de vie.** Conservation, suppression, anonymisation, droit à l'effacement.
6. **Modération et abus.** Pseudonymes, harcèlement, triche sur les scores.
7. **Notifications.** R9 les **interdit** explicitement : un classement « vivant » devra fonctionner **sans** push imposé.
8. **Décision produit.** Le classement est-il souhaité par les élèves, ou seulement suggéré par l'audit ? **[CONSTAT]** Aucune donnée d'usage dans le dépôt.

---

## 4. Trois issues possibles — **aucune n'est choisie ici**

| Issue | Ce qu'elle exige | Ce qui reste « Non vérifiable » |
|---|---|---|
| **A. Ne pas faire, et le dire** | Consigner le refus dans le suivi, garder le verrou de non-fabrication, laisser R9 « partiel » assumé | Intérêt réel des élèves |
| **B. Classement purement local, opt-in, sans backend** | Arbitrage explicite pour créer des profils locaux ; **0** serveur, **0** donnée d'élèves fabriquée ; rester hors du bundle d'entrée | Pertinence pédagogique, sécurité du stockage local, rendu mobile |
| **C. Backend avec comptes et consentement** | Arbitrage explicite pour **modifier `server.ts`** (protégé), schéma de relations, consentement, modération, conformité RGPD, revue de l'export CSV | Cadre légal, charge serveur, acceptation des familles |

**[INTERPRÉTATION]** L'issue A est celle qui prévaut **par défaut** tant qu'aucun arbitrage nommé n'est donné ; ce n'est pas une décision de produit, c'est l'absence de décision, constatée. **[CONSTAT]** Ce document ne crée **aucun score, aucun nom, aucune relation, aucune route, aucune notification**.

---

## 5. Interdits sans arbitrage nommé

**[CONSTAT]** Sont exclus de ce tour et de tout tour sans consigne explicite : modifier `server.ts`, `src/App.tsx` pour ce motif, ajouter une route ou une table, écrire un score d'élèves, inventer des pseudonymes, ajouter `Notification.requestPermission` ou un push, présenter un classement comme « officiel », et confondre le score de séance R9 avec une mesure comparative.

**« Non vérifiable »** : existence et taille d'un réseau d'amis chez les élèves, consentement / âge / vie privée, conformité RGPD, modération, décision produit, intérêt pédagogique d'un classement, comportement sur appareil réel. **[CONSTAT]** Aucune source web ni aucun document officiel n'a été consulté pour cette spec : uniquement des lectures locales du dépôt.

---

## 6. Verrou livré

**[CONSTAT]** `src/data/phase3NonFabrication.lock.test.ts` gèle l'état mesuré : 0 route de classement dans `server.ts`, présence des comptes élèves (pour ne pas réintroduire le faux constat « aucun backend »), score R9 strictement local, aucune notification ni appel réseau ni persistance dans le panneau. **[INTERPRÉTATION]** Ce verrou ne bloque pas une future implémentation décidée : il empêche qu'elle apparaisse **en silence**, sans arbitrage.
