# Audit du "Coach Capitaine" (guide/tuteur) — Kunz El Ouloum

**Date :** 2026-11-06 (mesures prises dans l'état `reorganisation-med` 1bfea79 + 2026-11-06)
**Périmètre :** le module d'accompagnement cognitif — `src/lib/invitationCapitaine.ts`,
`src/lib/prescriptions.ts`, `src/lib/relais.ts`, `src/lib/coach/diagnostic.ts`,
`src/lib/etatEleve.ts`, `src/hooks/useInvitationCapitaine.ts`, `src/data/capitaine.ts`,
`src/data/conseilsRubrique.ts`, `src/components/BandeauConseilRubrique.tsx`,
`src/components/RelaisCapitaine.tsx` (+ tests de câblage).
**Lecture seule sur le corpus pédagogique.**

---

## 0. Méthode et limites (conformément au cadre de compétence)

- **Sources :** code source + commentaires d'audit internes (signés `Audit Capitaine 2026-10-17` / 2026-10-18),
  verrous de tests, `docs/agents/TESTS_ET_CI.md`.
- **Non vérifiable (hors périmètre code) :** expérience élève réelle, performance sur Redmi/Samsung A,
  disponibilité offline mesurée, volume final de l'APK, avis utilisateurs, coût.
- **Évaluation selon le protocole de référence (references/evaluation-skill.md) : non exécutée — protocole absent.**
  Seules les vérifications ad hoc listées ci-dessous ont été exécutées.
- **Terminologie interne respectée :** « Capitaine » = guide/narrateur ; « Morchid » = ancien tuteur (obsolète) ;
  «القبطان» (arabe) / « مِرشد » (rôle).

---

## 1. Constat de synthèse (le fond)

Le « Coach Capitaine » n'est pas un tuteur IA générique : c'est un **moteur de prescription local,
déterministe et tracable**, fondé sur Atomic Habits (4 lois) + la boucle diagnostiquer→prescrire→tracer→remédier→retester.
Il répond directement à la préoccupation centrale de l'audit : **transformer la richesse en apprentissage réel sans
submerger l'élève**.

### Architecture en 5 modules purs (lecture seule de cette section = compréhension possible)

| Module | Rôle | Ce qui le rend robuste |
|---|---|---|
| `invitationCapitaine.ts` | décide SI + QUOI + QUAND (les 4 lois) | pur, testable sans DOM ; règles extraites en constantes |
| `prescriptions.ts` | mémoire des issues (en attente / suivie / ignoree / expiree) | identité stable `motifDeInvitation` ≠ texte du message |
| `relais.ts` | 4ᵉ tentative : relais humain, zéro trace sortante | pur sauf persistance isolée ; aucune conséquence |
| `diagnostic.ts` | verdict par unité (non_commence/faible/moyen/fort) + action | dérivé uniquement des données élève, aucun stock ajouté |
| `etatEleve.ts` | état assemblé UNE fois (7 familles) | injection différée des familles lourdes ; pas de doublon de lecture |

### Le moteur : 9 situations de parole, 4 seuils de décision

**Priorité absolue :** « ne jamais rater deux jours » (`j === 2`) — priorité sur les erreurs et la série.
**Sprint ≤ 30 jours :** proposition de simulation chronométrée vers `examens` (la seule cible jamais utilisée auparavant).
**Série vivante (`j === 1`, ≥ 17 h) :** « protecter ce qui est construit ».
**Série morte (`j ≥ 3`) :** reprise par les erreurs (≥ 2 en mémoire → دفتر الأخطاء), sinon par dernière unité.
**Jamais rien fait (`j === null`) :** règle des 2 minutes.

**Portes du silence (uniquement, et c'est leur seule fonction) :** épreuve en cours ; message ignoré < 6 h ; nuit 7h–22h ;
compteur inexploitable ; travail déjà fait aujourd'hui. **Un élève qui travaille n'est jamais relancé.**

**L'escalade (§5.D) :** 3 échecs → réduction de forme (séance → « une question » → « une seule question, maintenant ») ;
3 échecs → **retrait du motif** (le capitaine se tait définitivement sur cette phrase). C'est ce qui rend la réponse
du relais humain vraie : il ne compte pas, ne félicite pas, n'échoue pas.

**Relais humain (4ᵉ tentative) :** l'élève nomme UNE personne, une fois, nom stocké UNIQUEMENT dans le localStorage local,
jamais exporté/transmis/connu de l'appli. Relance unique « هل تحدثت إلى X ؟ » le lendemain + 8 h. Deux divulgations écrites
sous la question (le nom reste dans le téléphone seul). Zéro score, zéro conséquence. **Aucune donnée sortante possible par
construction** (le module n'importe ni prescriptions ni taxonomie — le compilateur l'interdit).

**Conseils par rubrique (rotation) :** `conseilsRubrique.ts` — 2 conseils/fiche pour ~15 rubriques (methodology, training,
examens, lesson, review, reviser, tadwin, schemas, focus, plan, situations, bacideas, stats, animations…). Consignes de
méthode en **فصحى**, jamais de flatterie, toujours une consigne + geste exécutable en < 2 min. Rotation sur compteur de
visites, pas seulement à la première entrée.

**Diagnostiqueur de parcours :** verdict par unité fondé SUR LA SEULE note réellement produite (jalon جسر, ou اختبار الكتاب
en repli si ≥ 3 questions), avec drapeaux fragiles. `classerParUrgence` : faible > moyen > non_commence > fort, départagé par
le poids au Bac (`revisionPlan.unitPriority` — source unique). Phases implicites : Commencer / Revoir le cours / Maintenir.

**Boucle fermée :** affiché → `emettrePrescription` ; clic « agir » → `accepter` (intention, pas travail) ; travail mesuré
(`activiteQuotidienne` → `marquerSuivie` — le seul endroit attestant un travail réel) ; fermeture → `ignorer` ; 48 h sans
rien → `expiree` ; 3 échecs → `motifRetire`. Créditation honnête : une erreur prescrite qui disparaît réellement des
productions est retirée DU dossier (vérifié par `cloreErreursAbsentes` dans `profilErreurs`).

### Leçons pédagogiques qui ressortent du code (ce qui est remarquable, et rare)

1. **L'honnêteté informationnelle comme discipline de conception** : « on n'annonce pas un chiffre qu'on n'a pas mesuré »
   (cumul = 0 si `joursAccumules` inexploitable ; date provisoire → aucun décompte). L'absence de données = silence, pas une
   valeur inventée (`chargee: false` → la bulle se tait).
2. **Distinction intention / action / résultat** : `accepteMs` ≠ `suivie` — un motif souvent accepté mais jamais suivi est un
   problème de FORMAT, pas de message. C'est exactement la granularité que les tuteurs IA omettent.
3. **Le temps est l'unité réelle, pas l'heure** : compter en heures donnait un décalage d'un jour (à 18 h, dire « tu as manqué
   un jour » à un élève qui a travaillé hier soir serait FAUX). L'unité du jour correspond à l'unité du livre (« ne jamais
   rater DEUX FOIS »).
4. **Performance consciente pour téléphones modestes** : import dynamique des familles lourdes (parcoursMeta 286 Ko,
   `profilErreurs` +7 % du bundle) ; pas de boucle de relecture de stockage ; « une seule voix » pour éviter trois guides
   concurrents. Mesures de bundle citées dans les commentaires (+0 Ko corpus sur le rappel de 3 questions).
5. **Le silence est une réponse** : le silence après 3 échecs n'est pas un abandon mais un ajustement ; « un guide qui
   parle pour ne rien dire devient du bruit ».

---

## 2. Points forts

1. **Boucle d'apprentissage complète et tracée (Axe 3 & 7)** : c'est l'un des rares dispositifs où l'on trace non seulement
   le clic mais l'issue (suivie/ignoree/expiree), avec retrait après 3 échecs, escalade de forme, et créditation honnête.
   La promesse « apprendre → tester → identifier → réviser → retester » est réelle, pas cosmétique.
2. **Respect avéré des contraintes matérielles algériennes (Axe 8)** : zéro donnée sortante (relais local), imports
   différés, pas de boucle de relecture, architecture locale-first. Le « pas de serveur, pas de compte, pas de partage »
   du relais est une garantie de construction, pas une promesse marketing.
3. **Qualité méthodologique des consignes (Axe 3.E)** : les conseils Rubrique sont de vrais gestes d'apprentissage actif
   (fermer le dossier avant de répondre, dessiner de mémoire, extraire le sujet de la consigne), alignés sur les
   recherches en sciences cognitives (recherche active, espacement, intercalage, feedback immédiat).
4. **Diagnostiqueur ancré sur la mesure réelle (Axe 4 & 7)** : le verdict ne naît pas d'impressions mais du jalon noté, avec
   distinction explicite sourceLivre (اختبار الكتاب) vs sourceJalon (اختبار الحصيلة) — répondant à un constat d'audit
   antérieur (« distinguer absent de maîtrisé », pas de « — » ambigu).
5. **Discipline d'ingénierie au service de la pédagogie (Axe 8.A)** : un état assemblé UNE fois (au lieu de 4 lectures
   dispersées), modules purs testables sans DOM, verrous de tests qui lient le texte des invitations aux destinations
   réelles d'App.tsx, commentaires d'audit datés qui expliquent le POURQUOI (pas seulement le COMMENT).

---

## 3. Points faibles / zones d'incertitude

1. **Le diagnostic ne couvre pas le profil élève / objectif d'examen (Axe 3.A)** : il n'y a pas de test de positionnement,
   pas de filière SVT/EXP sélectionnable, pas d'objectif (14/20 vs 18/20). L'adaptativité est uniquement réactive
   (basée sur l'historique produit), pas proactive. Un élève très fort reçoit les mêmes prescriptions qu'un élève moyen
   ayant le même historique d'erreurs.
2. **Phase 4 "Consolidation" inatteignable par défaut (Axe 3.D)** : le code le déclare explicitement — la famille « compétence »
   était `chargee: false` à vie avant le 15/10/2026, et `verdictsConsolides` exigeait une famille chargée. Ce n'est plus le
   cas aujourd'hui (chargement dynamique), mais c'était un défaut avéré documenté — preuve que les chemins « avancés » sont
   fragiles : un échec de chargement laisse l'élève sans orientation.
3. **La « série » peut masquer le vide (Axe 3.C)** : la règle des 2 minutes existe (`j === null`), mais elle ne s'active que
   si `serie === 0`. Un élève qui produit des QCM sans comprendre peut entretenir une série en travaillant « le mauvais bout ».
   Rien ne distingue qualitativement un jour productif d'un jour « clic ». (Les `fragiles` et `capitalErreurs` atténuent
   partiellement, mais sans seuil de notification visible.)
4. **Rappel de 3 questions ≠ répétition espacée visible (Axe 3.D)** : le SRS existe (`sm2`, `spacedRecallPrompts`) mais le
   rappel du Capitaine est un tirage *complementaire* (due + unité faible + rotation stable), pas *le* SRS. L'élève n'a pas
   de courbe d'oubli lisible ; le « à la maison » renvoie vers `RevisionView` — accessible ? vérifiable.
5. **L'erreur unique est ignorée (Axe 7.A)** : « une erreur, c'est le hasard » — décision défendable pédagogiquement, mais
   un élève en grande difficulté dont chaque erreur est isolée ne voit rien déclencher. Le seuil `erreurs >= 2` est un
   compromis arbitraire non justifié pédagogiquement.
6. **Risque de saturation par les 7 portes du hub + bandeau + bulle (Axe 6.B)** : la documentation admet une « exception
   assumée » au principe « une seule voix » : le bandeau de rubrique apparaît EN GRAND là où la bulle est réduite. Trois
   moments d'intervention possibles (conseilRubrique à l'entrée, consigne d'entrée du hub, bulle du capitaine) créent un
   risque réel de bruit si mal calibrés — c'est pour ça que la documentation le justifie.
7. **La date du Bac est un paramètre d'entrée, pas une donnée certifiée (Axe 1)** : `bacDaysLeft`, `dateProvisoire`,
   `BAC_EXAM_DATE_IS_PROVISIONAL` — le système réagit à « ≤ 30 jours » mais la date elle-même est déclarée provisoire.
   **Non vérifié :** la date n'est pas sourcée d'une source officielle datée dans le code lu.
8. **Arabe فصحى dans les messages d'erreur et les libellés de verdict** : `LIBELLE_VERDICT`, `MESSAGE_CAPITAINE` sont en arabe —
   bon pour la langue de l'élève, mais **aucun libellé de verdict/action n'est en français** : un élève dont la langue
   d'enseignement est le français (cursus français de SVT) peut être perdu. **Non vérifié :** quel est le ratio réel
   arabe/français dans les écrans produits.
9. **Le corpus de calibrage des 40 copies n'est pas une validation indépendante (règle 2 des AGENTS.md)** — rappel transversal
   : les scores annoncés par le correcteur ne sont pas validés sur un corpus externe.

---

## 4. Recommandations (par priorité)

### 🔴 Haute priorité

| # | Recommandation | Axe | Effort estimé |
|---|---|---|---|
| 1 | **Ajouter un profil élève minimal au premier lancement** : filière (SVT/EXP), date Bac officielle ou « je ne sais pas », objectif de note. Utiliser `EtatEleve.horizon.dateProvisoire` comme point d'entrée. | 3.A | 1–2 jours (un écran + 3 champs de type) |
| 2 | **Rendre la série « qualitative »** : ne pas compter un jour où le jalon de l'unité est `faible` avec ≥ 5 items fragiles. Ajouter un drapeau `serieux: boolean` dans `FamilleAssiduite`. | 3.C | 1 jour |
| 3 | **Exposer une courbe d'oubli lisible dans `RevisionView`** : le rappel du Capitaine doit pointer vers un SRS visible (pourcentages par unité, cartes dues), sinon la « répétition espacée » reste un détail invisible. | 3.D | 1–2 jours |
| 4 | **Baisser le seuil d'alerte d'erreur à 1 si `capitalErreurs.total` est en hausse**, ou afficher « 1 erreur signalée » sans déclencher la bulle — la règle du « c'est le hasard » est trop binaire pour un élève en difficulté. | 7.A | < 1 jour |
| 5 | **Sourcer la date du Bac** : `BAC_EXAM_DATE_IS_PROVISIONAL` ne doit rester provisoire que le temps d'une source ONEC/ministère datée. Sinon : marquer explicitement « date approximative — à confirmer ». | 1 | < 1 jour |

### 🟡 Moyenne priorité

| # | Recommandation | Axe |
|---|---|---|
| 6 | **Traduire les 5 verdicts d'action (`commencer/reviser_cours/maintenir`) en français** dans l'UI, au moins pour la filière enseignée en français. | 1/6.C |
| 7 | **Limiter la fréquence d'intervention** : vérifier qu'un élève ne reçoit pas simultanément conseilRubrique + consigneHub + bulle le même jour (le `relais` isole déjà le capitaine ; les bandeaux restent à verrouiller). | 3.C |
| 8 | **Documenter la pondération `revisionPlan.unitPriority`** dans `docs/agents/SOURCES.md` : l'élève doit comprendre POURQUOI l'app lui propose telle unité avant telle autre. | 3.B |
| 9 | **Ajouter un feedback de type « combien de temps as-tu mis ? »** sur les jalons pour départager un `moyen` obtenu rapidement d'un `moyen` obtenu en 3 tentatives. | 4 |

### 🟢 Basse priorité

| # | Recommandation | Axe |
|---|---|---|
| 10 | **Proposer le « relais humain » dès la 3ᵉ échec, pas seulement à la 4ᵉ** : un bouton discret « expliquer à quelqu'un » sur la carte d'erreur — le temps d'attente de 48 h peut être décisif pour un élève bloqué. | 7.C |
| 11 | **Mode « urgence J-7 » vs « apprentissage long » visible** : le sprint ≤ 30 jours existe mais est activé en arrière-plan ; l'élève devrait le savoir et pouvoir le forcer. | 3.C |
| 12 | **Ajouter un index « pourquoi cette prescription ? »** : un `(?)` à côté de chaque geste du Capitaine renvoyant à la règle (Atomic Habits, loi n°X) — la documentation l'indique, l'élève ne le voit pas. | 3.E |

---

## 5. Verdict final

**L'application est-elle prête pour le marché ?** Partiellement — le *moteur d'accompagnement* est exceptionnellement bien
conçu par rapport à la moyenne des applis de révision (le suivi de prescription tracée + l'architecture « état unique »
sont rares). Ce qui reste à couvrir, c'est l'interface d'entrée (profil, objectif) et la lisibilité du SRS — pas le
cœur.

**À recommander aux élèves de Bac ?** OUI, avec une réserve : le Capitaine est un coach *réactif*, pas un tuteur *proactif*.
Il est excellent pour un élève qui produit mais qui ne sait pas où il échoue ; il est insuffisant pour un élève qui ne
sait pas *comment* commencer.

**Risque principal :** **l'assiduité de façade** — la série peut se remplir sans que l'apprentissage progresse. C'est le
seul défaut systémique identifié, car il affecte la mesure qui pilote TOUT le reste (série → invitation → escalade → retrait
de motif).

**Les 3 ajouts les plus urgents :** (1) profil élève (filière + objectif de note + date Bac certifiée) ; (2) exposition
visible du SRS ; (3) sériabilité qualitative de la série.

**Note de confiance globale :** ★★★★☆ (4/5). Le code est honnête, tracé, et résilient. La 5ᵉ étoile exige un profil élève
et une mesure qualitative du travail — vérifiables uniquement par test utilisateur.

**Verrouillage pédagogique :** les règles suivantes, si modifiées, devraient toutes passer par une révision humaine
(aligné avec la discipline du dépôt) : seuil `erreurs >= 2`, durée du silence post-ignorance (6 h), nombre d'échecs avant
retrait (3), fenêtre du sprint (≤ 30 jours), et le moment d'intervention du relais humain (4ᵉ tentative).

---

*Ce rapport a été produit en lecture seule du dépôt. Aucune donnée élève n'a été lue ni stockée. Les parties
« Non vérifiable » renvoient à des éléments non présents dans le code analysé.*
