# Audit qualité approfondi — **Kunz El Ouloum / كنز العلوم**

**Application auditée :** application web éducative SVT, Terminale / BAC Algérie  
**Date de l'audit :** 5 octobre 2026  
**Révision auditée :** `40ce78fac0b811748071c4e7373fce204b814625`  
**Branche :** `arena/01a10d36-kunz-el-ouloum`  
**Auditeur :** audit indépendant du code, des données, des tests automatisés et du serveur local  
**Verdict synthétique :** **AVEC RÉSERVES — 13,4/20**

---

## 0. Résumé exécutif

Kunz El Ouloum est nettement plus riche qu'un simple recueil de QCM : 11 unités, 549 QCM, 552 flashcards, 65 idées d'exercices réellement indexées par session, 19 exercices d'analyse documentaire, 18 drills de schémas, une recherche globale, des cartes mentales, un entraînement méthodologique, un tuteur local, une PWA hors ligne et un tableau enseignant.

Le produit dispose aussi d'un niveau de tests exceptionnel pour une application éducative indépendante : **2 307 tests Vitest réussis (4 ignorés), 2 269 tests Jest réussis, 138 tests Boussole réussis, TypeScript sans erreur et build de production réussi**.

Cette richesse ne doit toutefois pas masquer cinq risques majeurs :

1. **La grille fournie pour l'audit n'est pas le programme algérien 3AS effectivement embarqué.** La méiose, le crossing-over, trisomie/monosomie et une unité autonome « mécanismes de l'immunité » ne constituent pas les unités 1 à 5 du référentiel 3AS exploité ici. Le référentiel local officiel comporte 11 unités réparties entre protéines, énergie et tectonique (`src/data/curriculumOfficial.ts`). Les noter comme « absentes » serait une erreur d'audit.
2. **Deux formats BAC incompatibles coexistent.** Le bon format est simulé en 3 exercices, 5/7/8 points et **4 h 30** (`mockExam.ts`). Un ancien module annonce encore « 4 exercices × 5 points, 3 heures » (`BacExamView.tsx`) : ce n'est pas une simulation fidèle.
3. **Des incohérences scientifiques et curriculaires subsistent.** Exemple : respiration à 38 ATP dans le référentiel de correction, « environ 36 ATP » dans un drill ; maturation de l'ARNm et complément enseignés dans des surfaces principales alors que l'application les marque elle-même `HORS_PROGRAMME`; attribution causale abusive de la fatigue à l'acide lactique ; flashcard LT4 rangée dans l'unité 3 au lieu de l'unité 4.
4. **La promesse “offline 100 %” est trop absolue.** Le shell, les 25 HTML et les chunks sont prévus pour le cache, mais il n'existe ni téléchargement sélectif par chapitre, ni indicateur d'espace, ni protocole automatisé démontrant une session complète hors ligne sur appareil réel. Le build installé pèse **20,70 Mio** non compressés.
5. **Le produit n'est pas juridiquement prêt pour une diffusion à grande échelle auprès de mineurs.** Une politique de confidentialité existe, mais pas de route de suppression de compte, pas de registre de licences/crédits des 157 médias suivis, pas de mécanisme de consentement parental vérifiable et pas d'identité/contact juridique explicite.

---

# 1. Méthode, périmètre et niveau de preuve

## 1.1 Travaux réellement exécutés

| Contrôle | Résultat |
|---|---:|
| `npm run lint` | ✅ TypeScript sans erreur |
| `npm run test:vitest -- --reporter=dot` | ✅ 186 fichiers, 2 307 réussis, 4 ignorés |
| `npm run test:jest -- --runInBand` | ✅ 180 suites, 2 269 tests |
| `npm test` | ✅ 138 tests Boussole |
| `npm run build` | ✅ build Vite + serveur réussi |
| `npm audit --omit=dev` | ✅ 0 vulnérabilité connue signalée |
| Démarrage `npm run dev` | ✅ serveur accessible sur `0.0.0.0:3000` |
| Requêtes HTTP shell, manifest, SW, leçon, health | ✅ HTTP 200 |
| Contrôle des références statiques du SW | ✅ 31 références, 0 fichier absent du build |
| Création de compte dans cet environnement | ❌ HTTP 500 : `better-sqlite3` non compilé, serveur en mode dégradé |

Le premier `npm ci` a échoué lors de la compilation native de `better-sqlite3` après un échec réseau/TLS de récupération des en-têtes Node. L'installation `--ignore-scripts` a permis d'exécuter toute la suite front, mais le serveur a correctement signalé un **mode dégradé** : le contenu fonctionne, les comptes et le dashboard enseignant non. Ce résultat ne démontre pas un défaut de production universel ; il démontre en revanche que le parcours compte dépend d'une brique native et que le mode dégradé doit être testé et expliqué à l'utilisateur.

## 1.2 Mesures locales indicatives

Sur la machine d'audit, après démarrage à chaud :

- shell `/` : premier octet ≈ **17 ms**, 842 octets de HTML dev ;
- leçon HTML testée : ≈ **4 ms**, 83 761 octets ;
- endpoint santé : ≈ **2 ms** ;
- build : **20,70 Mio** non compressés ;
- chunk initial JS : **1 529,93 ko / 321,78 ko gzip** ;
- CSS : **226,90 ko / 29,27 ko gzip** ;
- plus gros médias : jusqu'à **1,14 Mio**.

Ces chiffres sont des mesures locales, **pas** une mesure 3G algérienne, un Core Web Vitals terrain, une mesure RAM ou batterie.

## 1.3 Limites explicites

Non vérifiés faute d'artefact ou de dispositif :

- APK/IPA, taille installée Android/iOS, Android 7, Samsung A/J, Huawei, Condor et Iris réels ;
- consommation batterie/RAM sur appareil ;
- interruption par appel téléphonique ;
- Store Play/App Store, note, commentaires, fréquence de mises à jour publiée ;
- prix et achats intégrés : aucun modèle commercial visible dans le dépôt ;
- tests utilisateurs humains 16–19 ans ;
- captures d'écran annotées : aucun navigateur graphique/capture n'était disponible dans l'environnement. Le présent rapport donne des ancres de code reproductibles à la place ;
- validation juridique formelle par un juriste ou autorisation ONPS ;
- validation scientifique mot à mot de chaque ligne des millions de caractères. L'audit a combiné échantillonnage ciblé, contrôles croisés et tests d'intégrité existants.

## 1.4 Correction indispensable du référentiel demandé

La checklist reçue présente comme « Unité 1 » le brassage génétique et comme format BAC « 8 + 12 points / 3 h 30 ». Ce n'est **pas** le référentiel que les deux sources ministérielles locales de 2017 et la banque des sessions 2016–2026 décrivent.

Le référentiel audité est :

- domaine 1 : cinq unités — synthèse des protéines, structure/fonction, enzymes, défense, communication nerveuse ;
- domaine 2 : trois unités — photosynthèse, conversion de l'énergie chimique en ATP, bilan cellulaire ;
- domaine 3 : trois unités — tectonique des plaques, structure terrestre, structures géologiques ;
- format récent représenté dans la banque : **3 exercices, 5 + 7 + 8 = 20, 4 h 30**.

**Conséquence :** l'absence de méiose/crossing-over n'est pas comptée comme lacune du programme 3AS officiel utilisé. En revanche, si le cahier des charges commercial exige réellement ces contenus, l'application ne répond pas à ce cahier des charges.

---

# 2. Tableau des scores

| Axe | Note /20 | Poids | Contribution |
|---|---:|---:|---:|
| 1. Conformité pédagogique | **14,0** | 25 % | 3,50 |
| 2. Qualité du contenu | **14,0** | 20 % | 2,80 |
| 3. UX/UI | **13,0** | 10 % | 1,30 |
| 4. Fonctionnalités techniques | **12,0** | 10 % | 1,20 |
| 5. Ingénierie pédagogique | **14,0** | 10 % | 1,40 |
| 6. Préparation BAC | **14,0** | 15 % | 2,10 |
| 7. Légal, éthique et sécurité | **9,0** | 3 % | 0,27 |
| 8. Social et communautaire | **3,0** | 2 % | 0,06 |
| 9. Contextualisation algérienne | **15,0** | 5 % | 0,75 |
| **TOTAL PONDÉRÉ** |  | **100 %** | **13,38 → 13,4/20** |

---

# AXE 1 — Conformité pédagogique au programme officiel

## Score : **14/20 — Bien, avec correctifs scientifiques et curriculaires nécessaires**

## ✅ Points forts

- Les **11 unités** du référentiel local sont déclarées dans `src/unitCatalog.ts` et documentées avec volumes, fenêtres, trimestres, compétences et ressources dans `src/data/curriculumOfficial.ts`.
- La structure correspond aux trois domaines réels : protéines, transformations énergétiques et tectonique générale.
- Les ressources officielles locales sont identifiées : progression annuelle et guide de l'enseignant 2017 dans `docs/sources/`.
- Le code distingue explicitement le programme du contenu enrichi : `NON_EXIGIBLES` et `CULTURE_GENERALE`.
- La nomenclature arabe est riche et généralement cohérente ; les tests verrouillent plusieurs erreurs antérieures (ondes S, zone d'ombre, terminologie géologique, Michaelis–Menten, méthionine).
- Les équations globales de photosynthèse et respiration figurent dans les cours, par exemple `phase15_chapitres_29_30.html`.
- Les contenus clés demandés mais réellement pertinents sont présents : anticorps, TCR, vaccination, VIH/SIDA, potentiel de repos/action, synapse, intégration, photosynthèse, glycolyse, Krebs, chaîne respiratoire et fermentation.

## ❌ Points faibles

- L'ancrage au texte officiel n'est pas entièrement « mot à mot » : le commentaire même de `curriculumOfficial.ts` reconnaît seulement **15/42 sous-chaînes exactes**, 22/42 à couverture lexicale totale et 13 citations sous 85 %.
- La terminologie est surtout arabe avec sigles français/anglais. Il n'existe pas de bascule bilingue complète ni de glossaire utilisateur français/arabe exhaustif visible.
- Des contenus marqués non exigibles restent enseignés dans les leçons et QCM :
  - maturation de l'ARNm dans `lecon_transcription.html`, `phase2_chapitres_3_4.html` et `quizCorpus.ts` ;
  - complément dans QCM, leçons actives et cartes mentales ;
  - pourtant `curriculumOfficial.ts` classe ces éléments `HORS_PROGRAMME`.
  L'enrichissement est possible, mais il doit être visuellement séparé du « à savoir pour le BAC » sur **toutes** les surfaces.
- La flashcard historique `fc_3` sur le rôle des LT4 est affectée à `unitId: 3` (enzymes) au lieu de l'unité 4 (immunité), `src/data/index.ts:54-56`.
- La nomenclature des cartes mentales semble conserver une dette de numérotation : des nœuds immunitaires portent des identifiants `node-u3-*` alors que l'immunité est l'unité 4. Ce n'est pas nécessairement visible, mais cela augmente le risque de mauvais routage.

## 🚨 Erreurs critiques ou à fort risque

1. **Rendement respiratoire contradictoire.**
   - Référentiel/correcteur : 38 ATP, et `respiration.json` qualifie 36 ATP d'« erreur grave ».
   - `schemaDrills.ts:435` demande pourtant « الحصيلة الإجمالية (حوالي 36 ATP) ».
   - `smartBotData.ts` accepte « 36–38 ATP ».
   Un élève peut donc être entraîné, puis sanctionné par une autre surface de la même application.

2. **Simplification abusive de la fatigue musculaire.**
   - `phase14_chapitres_27_28.html:646` affirme que l'acide lactique « cause la fatigue musculaire ».
   - C'est une causalité simplifiée et scientifiquement contestable. Dans un référentiel scolaire, parler de fermentation lactique et d'acidification transitoire est acceptable ; désigner le lactate comme cause unique de la fatigue ne l'est pas.

3. **Formulation thermodynamique incorrecte.**
   - `phase15_chapitres_29_30.html:479` dit en substance que « l'énergie est fabriquée par la lumière » (`الطاقة يصنعها الضوء`).
   - L'énergie n'est pas créée : l'énergie lumineuse est **convertie** en énergie chimique, puis dissipée notamment sous forme thermique.

4. **Enrichissement non exigible présenté comme question BAC.**
   - `quizCorpus.ts:525` présente la maturation de l'ARNm comme « question du BAC » tandis que la source curriculaire interne la classe hors programme. Il faut citer une session précise ou retirer l'étiquette.

## 💡 Recommandations prioritaires

1. Créer une matrice unique `concept → statut officiel → unité → source → surfaces` et faire échouer le build sur toute contradiction.
2. Fixer la flashcard LT4 sur l'unité 4 et ajouter un test de cohérence sémantique des cartes historiques.
3. Adopter une règle éditoriale ATP sans ambiguïté : **« 38 ATP selon le manuel/référentiel BAC algérien ; rendement moderne souvent estimé différemment, hors exigible »**. Ne jamais utiliser « environ 36 » dans un item noté BAC.
4. Remplacer les formulations incorrectes sur fatigue et création d'énergie.
5. Ajouter partout un badge visible « enrichissement — non exigible au BAC » et exclure ces items des scores de préparation.
6. Faire relire chaque unité par deux enseignants SVT algériens et conserver une fiche de validation signée/versionnée.

## Benchmark

- **Vs manuel ONPS :** meilleure interactivité, recherche et feedback ; traçabilité éditoriale et stabilité du périmètre encore inférieures.
- **Vs DzExams/Eddirasa :** meilleure structuration par compétences et meilleur entraînement ; moins fidèle pour reproduire les sujets complets originaux.
- **Vs Khan Academy :** bien mieux contextualisée au BAC algérien ; moins robuste sur le bilinguisme, les sources et la gouvernance éditoriale.

---

# AXE 2 — Qualité du contenu éducatif

## Score : **14/20 — Bien**

## ✅ Points forts

- Les 25 fichiers de leçons HTML contiennent, selon comptage statique : **52 occurrences d'objectifs**, **91 résumés/synthèses**, **72 breadcrumbs**, **47 blocs de quiz**, **48 SVG intégrés** et 5 images.
- Banque importante et équilibrée : **549 QCM**, répartis de 39 à 66 par unité, et **552 flashcards**.
- Les QCM ont des explications détaillées et des distracteurs généralement plausibles ; le corpus est distingué entre drill et préparation plus proche du BAC.
- 19 exercices d'analyse documentaire, 18 drills de schémas, situations contextualisées, cartes mentales, microcapsules et exercices à trous diversifient l'activité.
- Les leçons contiennent des objectifs, problèmes de départ, simulations simples, quiz, synthèses et termes BAC.
- Les illustrations sont majoritairement locales, avec SVG accessibles (`role="img"`, `aria-label`) et un zoom plein écran avec pincement/glisser.
- Un guide méthodologique très développé enseigne les verbes de consigne, l'analyse, l'interprétation, la comparaison et la rédaction.

## ❌ Points faibles

- Les « microphotographies » authentiques sont rares ; une grande partie du visuel est schématique ou redessinée.
- Le corpus est volumineux, mais le volume ne prouve pas à lui seul la validité scientifique de chaque distracteur. Les tests vérifient surtout des invariants et des cas critiques, pas une validation humaine item par item.
- Le niveau facile/moyen/difficile n'est pas uniformément exposé sur toutes les banques.
- Les prérequis existent dans certaines données/tests, mais ne sont pas systématiquement présentés en tête de chaque leçon.
- Les corrections de certaines productions ouvertes reposent sur des mots-clés et structures ; elles ne remplacent pas une correction enseignante.
- Le module de flashcards révèle immédiatement le verso au clic ; l'interface ne force pas une tentative formulée avant affichage.
- Des contenus OCR (`okacha*`) contiennent encore des formulations très bruitées. Ils sont parfois masqués ou encadrés, mais représentent une dette éditoriale.

## 🚨 Erreurs critiques

- **Auto-évaluation trompeuse possible :** dans le module BAC ancien, l'élève coche lui-même les questions « réussies » ; cela mesure une déclaration, pas une maîtrise.
- **HTML invalide dans les flashcards :** les tests réussissent mais React signale un `<button>` imbriqué dans un `<button>` dans `RevisionView.tsx`. Le bouton audio est dans le bouton de carte. Cela affecte clavier, lecteur d'écran et comportement d'activation.

## 💡 Recommandations

1. Constituer un registre éditorial des 549 QCM : auteur, source, relecteur, date, statut, difficulté, objectif cognitif.
2. Faire auditer un échantillon aléatoire stratifié de 20 % puis 100 % des items par enseignants.
3. Séparer strictement : rappel de connaissances, analyse de documents et transfert BAC.
4. Ajouter une tentative obligatoire ou un délai/hint gradué avant le corrigé complet.
5. Corriger la structure HTML des flashcards.
6. Ajouter davantage de documents authentiques sourcés et de microphotographies libres/licenciées.

## Benchmark

- **Vs Anki :** contenu beaucoup plus riche et contextualisé ; planification des cartes moins fiable/transparente.
- **Vs Quizlet :** meilleures explications scientifiques et méthodologie ; moins de fonctions collaboratives et de création personnelle.
- **Vs manuel numérique :** interactivité supérieure ; provenance et validation documentaire moins formelles.

---

# AXE 3 — Expérience utilisateur (UX/UI)

## Score : **13/20 — Bien**

## ✅ Points forts

- Interface moderne, visuellement cohérente, pensée mobile, avec cartes, progression et palette verte/ambre.
- RTL natif : `dir="rtl"` dans le manifest et dans les vues principales ; tests dédiés à plusieurs erreurs RTL.
- Mode sombre disponible et persistant.
- Recherche globale fonctionnelle, historique et favoris ; ouverture directe des leçons.
- Navigation retour présente dans les principales vues ; breadcrumbs dans les leçons HTML.
- Zoom des figures : molette, boutons, glisser, pincement et fermeture Échap.
- Styles `:focus-visible` globaux et plusieurs tests clavier/accessibilité.
- Synthèse vocale arabe disponible pour les flashcards quand le navigateur la supporte.
- Mode lecture et mode focus.

## ❌ Points faibles

- Densité fonctionnelle élevée : la quantité de modules et les appellations internes (Miftah, Boussole, Tadwin, Okacha, Morchid) augmentent la charge cognitive.
- La recherche se trouve dans le parcours « leçons », pas comme action universelle toujours accessible.
- Une navigation par état React, sans route URL explicite, limite l'historique navigateur, le partage de liens et la restauration profonde.
- Beaucoup de petits textes sont en `text-[9px]`, `text-[10px]` ou `text-[11px]`, trop petits sur téléphone d'entrée de gamme.
- Plusieurs boutons font 36 px (`w-9 h-9`) ou ont seulement `py-1`; le minimum tactile de 44×44 px n'est pas généralisé.
- Il n'existe pas de préférence globale de taille de texte.
- Le français est souvent un complément terminologique, pas une vraie interface bilingue sélectionnable.
- Les animations et sons sont nombreux ; aucune preuve d'une préférence globale « réduire les animations/sons » n'a été trouvée.

## 🚨 Erreurs critiques

- **Boutons imbriqués dans RevisionView** : avertissement React reproductible dans les tests. Un lecteur d'écran ou le clavier peut déclencher le mauvais contrôle.
- Les icônes seules ne portent pas toutes un `aria-label`; les tests d'accessibilité existants contrôlent une sélection de composants, pas l'application entière avec axe/pa11y.

## 💡 Recommandations

1. Ajouter un réglage texte 100/115/130 %, réduction d'animations et désactivation audio.
2. Imposer 44×44 CSS px à toutes les cibles tactiles.
3. Corriger immédiatement les contrôles imbriqués.
4. Ajouter un routage URL et des deep links par unité/leçon/exercice.
5. Faire un audit WCAG automatisé puis manuel : contraste, ordre de focus, noms accessibles, zoom 200 %, TalkBack.
6. Réduire la navigation principale à 4–5 intentions d'élève : apprendre, s'entraîner, réviser, BAC, progression.

## Benchmark

- **Vs Khan Academy :** bonne adaptation RTL et contexte local ; navigation moins calme et hiérarchie plus complexe.
- **Vs Anki :** plus motivante et visuelle ; moins efficace pour un usage clavier/lecteur d'écran strict.
- **Vs apps locales de sujets :** UX plus moderne et interactive ; densité plus importante.

---

# AXE 4 — Fonctionnalités techniques

## Score : **12/20 — Bien mais non certifié sur appareils réels**

## ✅ Points forts

- PWA avec manifest, orientation libre, icônes, service worker versionné et stratégie offline.
- Le SW précache le shell, les 25 leçons, les chunks construits et diffère les schémas lourds selon le réseau/`saveData`.
- Les navigations utilisent network-first avec repli cache ; les ressources utilisent stale-while-revalidate.
- Les 31 références statiques testées du SW existent dans le build.
- Sauvegarde locale, backup/restauration, file de synchronisation et sessions d'examen persistées.
- Le chronomètre repose sur l'horloge réelle, donc résiste au throttling d'onglet et au rechargement.
- Code splitting de nombreuses vues secondaires.
- Mode dégradé serveur explicite : les leçons restent disponibles lorsque la persistance native échoue.

## ❌ Points faibles

- Chunk initial encore lourd : **1,53 Mo minifié / 322 ko gzip**, plus 227 ko CSS et de nombreux chunks.
- Build complet : **20,70 Mio** ; plusieurs images dépassent 400 ko, une dépasse 1,1 Mio.
- Aucun téléchargement sélectif par chapitre, aucun bouton « rendre disponible hors ligne », aucun calcul d'espace avant téléchargement.
- La promesse « offline 100 % » ne vaut qu'après installation/cache ; un premier lancement sans réseau ne peut pas fonctionner.
- Google Fonts reste autorisé ; le fonctionnement doit rester lisible sans elles, mais la typographie exacte n'est pas garantie hors ligne.
- Pas de test terrain Android faible mémoire, 3G/2G, batterie, RAM ou orientation.
- Pas d'APK/IPA : compatibilité Android/iOS = compatibilité navigateur/PWA, pas application native certifiée.
- L'installation standard a échoué dans cet environnement sur `better-sqlite3`; le contenu a fonctionné, mais inscription/dashboard non.
- Les assets statiques observés sont servis avec `Cache-Control: no-cache` en développement ; les en-têtes de production n'ont pas été mesurés derrière nginx.

## 🚨 Erreurs critiques

- **Création de compte indisponible en mode dégradé** : test runtime HTTP 500. L'interface doit désactiver clairement les comptes lorsque `/api/health` indique une persistance indisponible ; actuellement le health renvoie seulement `offlineMode: true`, pas l'état dégradé.
- Le SW ignore volontairement `/api/`; c'est correct, mais la reprise/synchronisation après longue déconnexion doit être testée sur lots réels et conflits.

## 💡 Recommandations

1. Exposer `persistence: healthy|degraded` dans `/api/health` et adapter l'UI.
2. Ajouter téléchargements par unité, poids estimé, état de cache et suppression locale.
3. Convertir les PNG/JPG lourds en WebP/AVIF avec variantes responsives.
4. Réduire le chunk initial sous 200 ko gzip et différer les corpus restants.
5. Tester sur Android Go / 2 Go RAM, réseau Fast 3G/Slow 3G, mode économie de données.
6. Ajouter tests Playwright offline : première visite, seconde visite avion, navigation de toutes les vues, reprise de sync.

## Benchmark

- **Vs applications natives locales :** PWA plus facile à distribuer et mettre à jour, mais moins contrôlable pour les interruptions et le stockage.
- **Vs Khan Academy offline :** approche intelligente, mais gestion utilisateur du téléchargement nettement moins aboutie.
- **Vs Anki :** contenu embarqué plus riche ; synchronisation et transparence offline moins matures.

---

# AXE 5 — Ingénierie pédagogique et gamification

## Score : **14/20 — Bien**

## ✅ Points forts

- Modèle hybride identifiable : rappel actif, feedback immédiat, entraînement méthodologique, progression par unités, apprentissage par problèmes et répétition espacée.
- Feedback explicatif dans les QCM, pas seulement vrai/faux.
- Micro-remédiations, lacunes, recommandations, plan de révision et statistiques détaillées.
- XP, badges, objectifs quotidiens, minuteur de concentration, streak affiché, défis et célébrations.
- 552 flashcards et contrôles « encore/difficile/bien/facile ».
- Répétition espacée explicite pour certains gestes : J+1, J+3, J+7, J+14.
- Les données de progression initiales sont honnêtement à zéro, sans fausses statistiques de démonstration.
- Des garde-fous anti-farming et anti-bourrage lexical existent.

## ❌ Points faibles

- L'adaptation reste surtout fondée sur des heuristiques locales et le premier élément d'une liste de lacunes, pas sur un modèle de maîtrise validé.
- Le streak principal reste incohérent : plusieurs écritures assignent `streakDays: 1`; aucune preuve d'un calcul robuste de jours consécutifs dans le flux principal.
- Les libellés d'intervalles visibles des flashcards (`<1 minute`, `6 minutes`, `1 jour`, `4 jours`) ne démontrent pas que les cartes sont réellement triées par échéance. `RevisionView` avance séquentiellement et reboucle.
- Le commentaire « SM-2 » ne suffit pas : il faut auditer l'algorithme réellement appliqué dans `App.tsx`, sa persistance et la sélection des cartes dues.
- Le tuteur peut encore donner beaucoup de contenu rapidement ; l'escalier socratique n'est pas homogène sur tous les chemins.
- Le classement social n'existe pas — ce n'est pas nécessairement un défaut pour des mineurs et devrait rester optionnel.
- Pas d'export PDF complet des résultats ; un export CSV enseignant existe.

## 🚨 Erreurs critiques

- **Risque de gamification trompeuse :** streak et intervalles affichés peuvent donner une impression d'algorithme adaptatif plus robuste que le comportement démontré.
- **Auto-évaluation des flashcards non vérifiée :** l'élève peut attribuer « facile » sans production observable, ce qui gonfle XP et maîtrise.

## 💡 Recommandations

1. Documenter l'algorithme de répétition réellement utilisé, avec tests de sélection des cartes dues à J+1/J+3/J+7/J+14.
2. Calculer le streak depuis des jours d'activité uniques, avec fuseau local et anti-double crédit.
3. Séparer XP de présence, maîtrise prouvée et score BAC.
4. Imposer une courte réponse/rappel avant auto-évaluation sur les cartes à enjeu.
5. Ajouter recommandations fondées sur preuves : erreurs répétées, oubli, difficulté et importance BAC.

## Benchmark

- **Vs Anki :** meilleur guidage pédagogique et meilleure contextualisation ; ordonnance des cartes moins mature.
- **Vs Duolingo :** gamification riche mais moins systématique ; avantage éthique de l'absence de leaderboard forcé.
- **Vs Quizlet Learn :** explications plus adaptées au BAC ; modèle adaptatif moins transparent.

---

# AXE 6 — Préparation spécifique au BAC

## Score : **14/20 — Bien, mais module ancien trompeur à retirer**

## ✅ Points forts

- Banque de **65 idées d'exercices** indexées sur **2016–2026**, deux sujets par année quand la source est exploitable.
- Classement par année, exercice, thème/unité, supports, verbes de consigne, situations, capsules et schémas.
- Liens vers sujet et corrigé source dans `BAC_SESSION_SOURCES`.
- Générateur déterministe de sujets blancs : 3 exercices, unités/sessions distinctes, 5/7/8 points, 20 points, 4 h 30.
- Chronomètre persistant, budgets par exercice, phase lecture/rédaction/relecture, retard et impression.
- Guide méthodologique poussé, erreurs fréquentes, rédaction, verbes, analyse/interprétation.
- Fiches, résumés, schémas-bilans, définitions et équations.
- Le compte à rebours BAC existe avec une date 2027 clairement marquée provisoire dans le code.

## ❌ Points faibles

- La demande 2008–2024 n'est pas satisfaite : couverture réelle **2016–2026**. Les années 2008–2015 sont absentes.
- Sujet 2 de 2021 incomplet : exercice 1 non lisible, explicitement déclaré.
- La banque résume les sujets et renvoie vers des tiers ; elle ne garantit pas l'accès hors ligne aux PDF originaux et corrigés.
- Pas de filière Mathématiques explicitement séparée ; les sources et progression ciblent Sciences expérimentales.
- Le coefficient 6 n'est pas clairement intégré à la planification.
- Les vrais barèmes détaillés ne sont pas reproduits pour les 65 idées ; l'app entraîne surtout la structure et renvoie au corrigé.
- L'épreuve blanche composite mélange des exercices de sessions différentes : excellent pour l'entraînement, mais ce n'est pas une reproduction d'un sujet officiel complet.

## 🚨 Erreurs critiques

- `BacExamView.tsx` annonce encore **4 exercices × 5 points, 3 heures**, format explicitement qualifié maison dans les audits internes. Il coexiste avec le bon simulateur 5/7/8, 4 h 30. Cette contradiction doit disparaître.
- La grille initiale demandait « 3 h 30 » ; l'application et ses sources internes retiennent 4 h 30. Ne pas « corriger » l'app vers 3 h 30 sans source ministérielle.

## 💡 Recommandations

1. Retirer ou renommer `BacExamView` en « tests de synthèse par domaine — non simulation BAC ».
2. Faire du `MockExamPanel` l'unique mode examen blanc.
3. Ajouter 2008–2015 si les droits et sources sont établis.
4. Permettre le téléchargement local des sujets/corrigés autorisés.
5. Ajouter filière, session, sujet, durée, barème et statut de source visibles sur chaque exercice.
6. Faire confirmer annuellement durée, coefficient et date par document MEN/ONEC.

## Benchmark

- **Vs DzExams/Eddirasa :** meilleure exploitation pédagogique et méthodologique ; bibliothèque de PDF moins complète et dépendance aux liens tiers.
- **Vs applications de QCM :** préparation documentaire et gestion du temps très supérieures.
- **Vs conditions réelles :** le bon mock est proche structurellement, mais les documents résumés et l'auto-évaluation ne remplacent pas un sujet complet imprimé corrigé par barème.

---

# AXE 7 — Aspects légaux, éthiques et sécurité

## Score : **9/20 — Passable, lacunes juridiques significatives**

## ✅ Points forts

- Politique de confidentialité accessible depuis le splash, en arabe, datée, couvrant collecte, finalité, sécurité, droits, mineurs et loi algérienne 18-07.
- Mode invité annoncé local uniquement.
- Mots de passe hachés avec bcrypt, JWT expirant à 7 jours, séparation stricte étudiant/enseignant.
- Secret JWT obligatoire en production ; secret éphémère seulement en développement.
- Limitation de tentatives IP/compte, codes reset CSPRNG, normalisation email.
- En-têtes : CSP, `nosniff`, anti-framing, Referrer-Policy, HSTS sous HTTPS.
- Neutralisation de l'injection de formule CSV et assainissement du nom de fichier.
- `npm audit --omit=dev` : aucune vulnérabilité connue le jour du test.
- Aucun SDK publicitaire/analytics tiers détecté ; politique sans publicité cohérente.

## ❌ Points faibles

- La politique promet la suppression via l'enseignant, mais aucune route `DELETE account` ou procédure technique vérifiable n'existe dans `server.ts`.
- Pas de consentement parental, d'âge minimum ou de mécanisme de retrait adapté aux mineurs.
- Pas d'adresse/identité du responsable de traitement, délai de conservation, base légale détaillée, sous-traitants/hébergement ou procédure de violation.
- Pas de licence globale, fichier `LICENSE`, crédits médias ou registre de droits pour les **157 JPG/PNG/SVG suivis**.
- Les liens de sujets pointent vers Eddirasa/DzExams, pas directement ONEC ; le statut « officiel » du document et le droit de réutilisation doivent être distingués.
- CSP autorise `'unsafe-inline'` pour scripts et styles à cause des 25 leçons héritées. C'est une dette de sécurité importante.
- `X-XSS-Protection` est obsolète et ne compense pas `unsafe-inline`.
- Politique mot de passe minimale de 6 caractères, sans exigence supplémentaire.
- Pas de 2FA enseignant, pas de révocation/rotation explicite des JWT, pas de journal d'audit enseignant visible.
- L'absence de publicité/achat est constatée dans le code, mais aucun modèle économique ni conditions d'utilisation ne sont publiés.

## 🚨 Erreurs critiques

1. **Droit à l'effacement non implémenté de bout en bout.** Une promesse textuelle sans mécanisme opérationnel est insuffisante.
2. **Propriété intellectuelle non démontrée.** Le contenu peut citer ses sources pédagogiques sans prouver les licences des schémas, photos, textes ONPS et sujets.
3. **CSP affaiblie par les scripts inline.** Toute injection dans un HTML de leçon bénéficie d'un contexte d'exécution autorisé.

## 💡 Recommandations

1. Ajouter suppression autonome et enseignant, export utilisateur, confirmation et purge transactionnelle.
2. Créer `LEGAL.md`, registre des traitements, durée de conservation, contact, CGU et procédure mineurs.
3. Créer un manifeste de provenance/licence par contenu et média.
4. Migrer les scripts inline des leçons vers modules locaux puis supprimer `'unsafe-inline'`.
5. Renforcer mots de passe, révocation JWT, journal d'accès enseignant et tests OWASP.
6. Faire valider loi 18-07/RGPD par conseil juridique avant déploiement à grande échelle.

## Benchmark

- **Vs plateformes établies :** bonnes bases techniques, mais gouvernance juridique nettement en dessous.
- **Vs petite app locale hors ligne :** sécurité serveur au-dessus de la moyenne ; propriété intellectuelle et gestion des droits encore insuffisantes.

---

# AXE 8 — Aspects sociaux et communautaires

## Score : **3/20 — Très insuffisant au regard de la checklist**

## ✅ Points forts

- Tableau enseignant, export CSV, partage visuel d'un bilan hebdomadaire et suivi de productions.
- L'absence de forum/leaderboard réduit les risques de harcèlement, triche, exposition de mineurs et modération.
- Quelques catalogues YouTube existent dans les données de travail, mais ils ne constituent pas un support intégré vérifié.

## ❌ Points faibles

- Aucun forum, Q/R communautaire, groupe d'étude ou partage de fiches entre élèves.
- Aucun dispositif de modération, signalement, blocage ou politique de contenu utilisateur — logique puisqu'il n'y a pas de communauté.
- Pas de FAQ utilisateur complète, ticket support, chat humain, adresse de contact ou SLA.
- Onboarding surtout visuel ; pas de parcours d'aide structuré couvrant offline, compte, progression et BAC.
- Impossible d'auditer les avis Store : aucune fiche Store fournie.
- Pas de mesure du temps de réponse support ni de réactivité développeur.

## 🚨 Erreurs critiques

- Aucune pour le fonctionnement éducatif individuel. En revanche, **ne pas présenter l'app comme communautaire ou accompagnée par support** tant que ces fonctions n'existent pas.

## 💡 Recommandations

1. Prioriser une FAQ et un contact responsable avant toute fonction sociale.
2. Si une communauté est ajoutée : pseudonymat, modération humaine, signalement, filtrage, consentement parental et règles de sécurité mineurs dès la conception.
3. Préférer des groupes fermés enseignant-classe à un forum public.
4. Garder leaderboard et partage publics désactivés par défaut.

## Benchmark

- **Vs Discord/Facebook groups :** beaucoup plus sûr mais aucune entraide pair-à-pair.
- **Vs Quizlet classes :** retard net sur collaboration.
- **Vs Anki :** comparable comme outil individuel, avec meilleur suivi enseignant local.

---

# AXE 9 — Contextualisation algérienne

## Score : **15/20 — Très bien**

## ✅ Points forts

- Programme 3AS algérien, terminologie arabe scolaire, MEN/guide/progression locale et sujets BAC algériens.
- Calendrier par trimestres et fenêtres algériennes intégré au référentiel.
- Approche offline-first, `saveData`, différé des schémas lourds et contenu local : très pertinent pour connectivité variable.
- Arabe RTL prioritaire et français scientifique en appui.
- Banque BAC contextualisée et méthodologie de rédaction en arabe.
- Date BAC avec statut provisoire explicite plutôt qu'une fausse date prétendue officielle.
- Exemples locaux ponctuels, notamment ressources géologiques en Algérie — clairement classées enrichissement si hors exigible.
- Gratuité apparente, absence de publicité et de paiement dans le code audité.

## ❌ Points faibles

- La progression cible explicitement Sciences expérimentales ; pas de parcours distinct Mathématiques.
- Coefficient SVT non clairement utilisé pour pondérer le planning.
- La date 2027 est provisoire ; le compte à rebours ne doit pas être perçu comme officiel.
- Pas de vérification appareil réelle sur marques/modèles courants en Algérie.
- Pas de darija dans les explications : c'est un choix cohérent avec `AGENTS.md` (sorties en فصحى), mais la checklist demandait d'évaluer cette possibilité. La détection peut comprendre certains termes informels, l'enseignement reste en arabe standard.
- Aucun prix n'est affiché : impossible d'évaluer l'adéquation au pouvoir d'achat si une monétisation future est prévue.
- Des ressources dépendent de liens tiers potentiellement coûteux ou indisponibles hors ligne.

## 🚨 Erreurs critiques

- Ne pas afficher le compte à rebours provisoire sans libellé visible « date à confirmer officiellement ».
- Ne pas annoncer une conformité 2024/2025 ou 2026/2027 absolue sur la seule base des documents 2017 ; il faut vérifier les notes annuelles MEN.

## 💡 Recommandations

1. Ajouter année scolaire/version du référentiel et date de dernière vérification MEN.
2. Créer profils « Sciences expérimentales » et « Mathématiques » si les exigences diffèrent.
3. Tester officiellement sur 5 appareils représentatifs 2–4 Go RAM et réseau contraint.
4. Rendre les sujets essentiels téléchargeables localement avec taille affichée.
5. Garder la فصحى pour la précision ; éventuellement proposer des capsules orales informelles séparées, relues et non utilisées dans les réponses BAC.

## Benchmark

- **Vs plateformes internationales :** avantage décisif de contextualisation.
- **Vs sites algériens de sujets :** plus pédagogique, interactif et offline-first.
- **Vs application locale légère :** contenu beaucoup plus riche, mais poids et complexité supérieurs.

---

# 3. Scénarios élève simulés

| Scénario | Résultat | Commentaire |
|---|---|---|
| Trouver une leçon sur la phosphorylation oxydative | ✅ | Recherche globale, résultats regroupés, ouverture de leçon |
| Réviser une unité en flashcards | ⚠️ | 552 cartes et audio, mais ordre séquentiel et bouton imbriqué |
| S'entraîner sur un sujet chronométré réaliste | ✅/⚠️ | Bon `MockExamPanel` 4 h 30 ; ancien module 3 h contradictoire |
| Reprendre après rechargement | ✅ | progression locale et chrono persistés |
| Utiliser hors ligne après première visite | Probable, non certifié | SW bien conçu ; pas de test navigateur avion exécuté ici |
| Créer un compte | ❌ dans l'environnement | store dégradé faute de binding SQLite natif |
| Supprimer son compte | ❌ | politique présente, aucun endpoint |
| Comprendre une erreur QCM | ✅ | explications détaillées |
| Obtenir un diagnostic objectif BAC | ⚠️ | bon sur QCM/forme ; rédaction et auto-cochage ne valent pas correction humaine |
| Utiliser uniquement en français | ❌ | terminologie française ponctuelle, pas d'interface française complète |

---

# 4. Synthèse finale

## Score global pondéré : **13,4/20**

## Verdict : **RECOMMANDÉ AVEC RÉSERVES**

Recommandé comme **outil complémentaire de révision et d'entraînement**, particulièrement en arabe et en contexte de connectivité limitée. Non recommandé comme **source unique**, comme preuve de conformité juridique, ni comme simulateur BAC totalement fiable tant que le module 3 h/4 exercices et les contradictions scientifiques/curriculaires ne sont pas corrigés.

## Top 5 des forces

1. Couverture structurée des 11 unités réelles et contextualisation algérienne profonde.
2. Richesse pédagogique : 549 QCM, 552 cartes, documents, schémas, méthodologie et tuteur local.
3. Très forte suite automatisée : plus de 2 300 tests sur chacun des deux runners, build et TypeScript verts.
4. PWA offline-first intelligente, recherche globale et navigation RTL.
5. Excellente préparation méthodologique : verbes, analyse de documents, écriture et gestion du temps.

## Top 5 des faiblesses

1. Contradictions internes : ATP 36/38, contenu hors programme présenté BAC, fatigue/lactate, LT4 mal classée.
2. Deux formats d'examen incompatibles, dont un clairement non conforme.
3. Gouvernance juridique/IP insuffisante : effacement absent, licences/crédits non démontrés.
4. Offline non pilotable par l'élève et performances non validées sur appareils algériens d'entrée de gamme.
5. UX dense, petits textes/cibles tactiles et défaut HTML d'accessibilité dans les flashcards.

---

# 5. Plan d'amélioration prioritaire

## Court terme — 0 à 4 semaines

### P0 — Bloquants de confiance

- [ ] Unifier le rendement respiratoire et supprimer toute contradiction 36/38.
- [ ] Corriger fatigue/lactate et « énergie créée par la lumière ».
- [ ] Déplacer `fc_3` LT4 vers l'unité 4.
- [ ] Retirer/renommer le module « 4 × 5, 3 h » ; garder le mock 5/7/8, 4 h 30.
- [ ] Corriger le bouton audio imbriqué dans le bouton flashcard.
- [ ] Afficher systématiquement `NON_EXIGIBLE_BAC` sur maturation ARNm/complément, ou les retirer du parcours noté.
- [ ] Rendre l'état serveur dégradé visible et désactiver l'inscription avec un message explicite.

### P1 — Légal minimal

- [ ] Implémenter export et suppression de compte.
- [ ] Publier contact, responsable, conservation et procédure mineurs.
- [ ] Ajouter registre de provenance/licence des médias et contenus.

## Moyen terme — 1 à 3 mois

- [ ] Audit scientifique humain des 549 QCM et 552 cartes.
- [ ] Téléchargement par unité, taille, état hors ligne, suppression du cache.
- [ ] Audit WCAG 2.1 AA avec TalkBack et clavier ; cibles 44×44 et texte ajustable.
- [ ] Routage URL/deep links.
- [ ] Répétition espacée réellement pilotée par échéances et streak exact.
- [ ] Optimisation des médias et du chunk initial.
- [ ] Ajout des années BAC 2008–2015 si droits et sources fiables.

## Long terme — 3 à 12 mois

- [ ] Validation institutionnelle/enseignants avec version annuelle du programme.
- [ ] Parcours séparés Sciences expérimentales / Mathématiques.
- [ ] Tests terrain sur parc Android algérien et métriques anonymisées opt-in.
- [ ] Migration des scripts inline et CSP sans `'unsafe-inline'`.
- [ ] Support enseignant/classe fermé et modéré, uniquement si gouvernance mineurs prête.
- [ ] Étude contrôlée d'efficacité : prétest/post-test, rétention à 2–4 semaines, comparaison à un groupe contrôle.

---

# 6. Positionnement concurrentiel

| Dimension | Kunz El Ouloum | Sites de sujets DZ | Anki/Quizlet | Khan Academy |
|---|---|---|---|---|
| Alignement BAC Algérie | **Fort** | Fort | Faible sans decks | Faible |
| Méthodologie de rédaction | **Très forte** | Variable | Faible | Moyenne |
| Banque de sujets complets | Moyenne | **Très forte** | Faible | Faible |
| Répétition espacée | Moyenne | Faible | **Très forte** | Moyenne |
| Offline | Bonne après cache | Variable | **Très bonne** | Bonne selon produit |
| RTL/arabe algérien scolaire | **Très fort** | Fort | Variable | Variable |
| Communauté | Très faible | Faible/moyenne | Forte selon produit | Moyenne |
| Gouvernance légale/IP | Faible/moyenne | Variable | **Forte** | **Forte** |
| Validation scientifique publique | Moyenne | Variable | Dépend du deck | **Forte** |
| Interactivité | **Très forte** | Faible | Moyenne | Forte |

**Positionnement recommandé :** ne pas se vendre comme « encyclopédie parfaite » ni « sujet officiel complet », mais comme **compagnon personnel offline-first de compréhension, méthodologie et entraînement BAC SVT en arabe**, avec renvoi transparent aux documents officiels.

---

# 7. Registre condensé des preuves

| Preuve | Ancre |
|---|---|
| 11 unités officielles | `src/unitCatalog.ts`, `src/data/curriculumOfficial.ts` |
| Sources MEN locales | `docs/sources/التدرج-السنوي-للتعلمات-2017.txt`, `docs/sources/دليل-الأستاذ-2017.txt` |
| 549 QCM / 552 flashcards | import runtime `src/data/index.ts` |
| Répartition QCM | U1 39, U2 45, U3 50, U4 66, U5 55, U6 53, U7 47, U8 40, U9 43, U10 50, U11 61 |
| 65 idées BAC, 2016–2026 | `src/data/bacSessionIndex.ts` |
| Sujet 2021 S2 incomplet | `INCOMPLETE_SUJETS` dans le même fichier |
| Bon format mock | `src/data/mockExam.ts`: 5/7/8, 270 min |
| Mauvais format hérité | `src/components/BacExamView.tsx`: 4×5, 3 h |
| PWA | `public/manifest.json`, `public/sw.js` |
| 25 leçons HTML | `public/lessons/` |
| 157 médias suivis | comptage Git JPG/PNG/SVG |
| Build 20,70 Mio | mesure `dist/` |
| Initial 321,78 ko gzip | sortie `npm run build` |
| LT4 mal classée | `src/data/index.ts:54-56` |
| ATP contradictoire | `scienceRules/respiration.json`, `schemaDrills.ts:435`, `smartBotData.ts` |
| Fatigue/lactate | `public/lessons/phase14_chapitres_27_28.html:646` |
| Politique vie privée | `src/data/politiqueConfidentialite.ts` |
| Suppression absente | aucune route correspondante dans `server.ts` |
| Sécurité serveur | `server.ts`, `server/auth.ts`, `server/secret.ts`, `server/rateLimit.ts` |
| Défaut bouton imbriqué | `src/components/RevisionView.tsx`, avertissement des tests |

---

## Conclusion d'audit

Le socle est sérieux, ambitieux et techniquement mieux testé que beaucoup de produits éducatifs comparables. La priorité n'est plus d'ajouter des fonctionnalités : elle est de **réduire les contradictions, certifier le contenu, simplifier l'expérience et rendre les promesses légales/offline vérifiables**.

En l'état, un élève de Terminale algérien peut en tirer une réelle valeur pour apprendre et s'entraîner, à condition de conserver le manuel, les sujets officiels et l'enseignant comme références d'autorité. Après correction des P0, le produit pourrait raisonnablement viser **15–16/20**. Atteindre 18/20 exigerait une validation institutionnelle ou éditoriale externe, des tests terrain, une conformité juridique complète et une traçabilité de chaque contenu.
