# 📐 SPÉCIFICATION AMENDÉE — Navigation 6 → 4 rubriques

**Statut : étapes 1, 2 et 3 (partie vérifiable) implémentées et vérifiées le 2026-11-05.**
Branche `arena/bcf8863b-kunz-el-ouloum` · accord explicite « OUI GO » puis « GO » pour modifier `src/App.tsx` (fichier protégé par `AGENTS.md`).

> Ce document remplace la spec initiale transmise pour avis. Il corrige les points qui décrivaient une application qui n'existait pas encore (routeur, sélecteur FR/AR, fond vert « Méthode », abonnement, « 12/20 »), ajoute la table de mapping exhaustive qui manquait, et consigne l'arbitrage visuel du 2026-11-05.

---

## 1. Arborescence livrée

```
NAVIGATION PRINCIPALE (menu latéral desktop + barre basse mobile)
│
├── 1. ACCUEIL — الرئيسية 🏠          → onglet réel `home`
├── 2. APPRENTISSAGE — التعلّم 📖      → porte virtuelle, 3 onglets
│      ├── 2.1 Cours — الدروس          → `lesson`
│      ├── 2.2 Entraînement — التمارين → `training`
│      └── 2.3 Révision — المراجعة     → `reviser`
├── 3. MÉTHODE — المنهجية 🔑           → `methodology` (mise en avant dédiée)
└── 4. MON ESPACE — حسابي 👤           → `moi`
```

**Décision d'architecture retenue :** les **24 identifiants d'écran d'`App.tsx` restent intacts**. « Apprentissage » est une *porte virtuelle* résolue à l'ouverture vers `lesson` / `training` / `reviser`. Conséquence : les hubs, les conseils d'entrée de rubrique (`conseilsRubrique.ts`), le capitaine (`useInvitationCapitaine`), le silence pendant l'épreuve (`examenEnCours`) et le mode focus continuent de fonctionner sans réécriture, et **aucun écran ne devient orphelin**.

Source unique du mapping : `src/data/apprentissageNav.ts` · verrou : `src/data/apprentissageNav.lock.test.ts`.

---

## 2. Comportement des 3 onglets

| Exigence | Livré | Preuve |
|---|---|---|
| Ordre pédagogique Cours → Entraînement → Révision | ✅ ordre du DOM conservé | `ONGLETS_APPRENTISSAGE` |
| **RTL sans double inversion** | ✅ `dir="rtl"` global (`index.html`) + bande `dir="rtl"` ; **aucune** inversion manuelle | verrou `not.toContain('flex-row-reverse')` |
| Onglet par défaut = Cours | ✅ | `lireDernierOnglet()` renvoie `cours` à vide |
| Mémorisation du dernier onglet | ✅ clé dédiée `kunz_apprentissage_onglet_v1`, y compris depuis un sous-écran de hub | effet sur `currentTab` + test |
| Priorité d'ouverture | **lien profond > dernier onglet mémorisé > Cours** | `resoudreRoute` + `useState` initial |
| Bilinguisme | ✅ double libellé AR فصحى + FR (`dir="ltr"`), comme la barre existante | `ApprentissageTabs.tsx` |
| Swipe horizontal | ✅ sur **la bande d'onglets seulement**, seuil 48 px, sens RTL, `touch-action: pan-y` | 3 tests de swipe |
| Accessibilité | ✅ `role="tablist"` / `role="tab"` / `aria-selected` / `tabIndex` / flèches + Home/End | 2 tests clavier |
| **Indicateur de progression** | ✅ **3 pastilles dérivées de compteurs réels**, chacune avec son unité | `src/data/apprentissageProgression.ts` + 7 tests |

### Pastilles : ce qui est réellement affiché

| Onglet | Compteur | Source | Unité affichée |
|---|---|---|---|
| Cours | `X/72` leçons faites | `kunz_parcours_v1` (`loadParcours`) × `PARCOURS_FLAT` (72 leçons, 11 جسر exclus) | درس |
| Entraînement | `N` tentatives | `kunz_exam_attempts_log_v1` (`getExamAttempts`) | محاولة |
| Révision | `N` évaluations | `svt_progress.flashcardStats` = `again + hard + good + easy` | تقييم |

**Aucun dénominateur commun, aucune moyenne, aucun zéro décoratif** : à l'installation neuve on affiche réellement `0/72`, `0`, `0`. Si la prop n'est pas fournie, aucun badge n'est rendu (`AGENTS.md` §5). Le dénominateur 72 est **dérivé** de la séquence officielle, pas recopié.

La bande n'est **pas rendue** pendant l'épreuve chronométrée ni en mode focus (même règle que le bouton du capitaine).

---

## 3. Table de mapping EXHAUSTIVE des 24 écrans

| Rubrique | Onglet | Écrans réels (`currentTab`) | Source du contenu |
|---|---|---|---|
| Accueil | — | `home`, `splash` | `DashboardView`, `SplashView` |
| **Apprentissage** | **Cours** | `lesson`, `mindmap`, `parcours` | `LessonsView`, carte `lecons-mindmap`, `ParcoursView` |
| **Apprentissage** | **Entraînement** | `training`, `bacideas`, `situations`, `bootcamp`, `workshop`, `animations`, `tadwin`, `examens` | `TRAINING_ENTRIES` (7) + hub |
| **Apprentissage** | **Révision** | `reviser`, `review`, `plan`, `schemas` | `REVISION_ENTRIES` (3) + hub |
| Méthode | — | `methodology` | `MethodologyCompilerView` (nom officiel depuis `miftahSpec`) |
| Mon espace | — | `moi`, `stats`, `badges`, `teacher` | `MoiView` + `MOI_RACCOURCIS` (3) |
| Transversal (aucune porte) | — | `chat` (المرشد), `focus` (minuteur) | bouton flottant / Déclic |

**Total : 3 + 8 + 4 + 9 = 24**, chacun rattaché une seule fois et toujours monté par `App.tsx` (verrou anti-zombie conservé).

---

## 4. Deep links et compatibilité

Routeur **hash maison, sans dépendance** (`src/utils/navigationHash.ts`) : `package.json` reste intact (protégé), aucune requête réseau n'est déclenchée → PWA/TWA hors ligne, `public/sw.js`, `public/manifest.json` (`scope: "/"`) et `server.ts` inchangés.

| Entrée acceptée | Canonique | Écran |
|---|---|---|
| `#/accueil` | `#/accueil` | `home` |
| `#/apprentissage/cours` · `/apprentissage/cours` | `#/apprentissage/cours` | `lesson` |
| `#/apprentissage/entrainement` · `/apprentissage/entrainement` | idem | `training` |
| `#/apprentissage/revision` · `/apprentissage/revision` | idem | `reviser` |
| `#/methode` · `/methode` | `#/methode` | `methodology` |
| `#/mon-espace` · `/mon-espace` | `#/mon-espace` | `moi` |

**Alias de compatibilité** : `#/apprendre`, `/apprendre` → Cours ; `#/reviser`, `/reviser` → Révision ; `#/entrainer`, `#/s-entrainer`, `#/exercices` → Entraînement ; `#/moi`, `/moi` → Mon espace ; `#/methodologie` → Méthode ; `#/` → Accueil. Un chemin propre est ramené au hash par `replaceState`, sans empiler d'entrée.

### Paramètres de liens profonds (étape 3)

`src/utils/deepLinkInterne.ts` lit et **valide** une query (`?lecon=`, `?qcm=`, `?examen=`, `?idee=`), dans le hash ou dans le chemin :

| Paramètre | Validation | Effet |
|---|---|---|
| `lecon` | clé cherchée dans `PARCOURS_FLAT` ; **inconnue = ignorée** | `parcoursLesson` (leçon + type + unité réels) |
| `qcm` | unité parmi les `UNITES_REELLES` dérivées du parcours | `parcoursQcm` |
| `examen` | `qcm` ou `bac` uniquement | `parcoursMode` |
| `idee` | validateur léger recoupé avec les **65 `BAC_IDEAS`** par test ; le trou `bac2021_s2_e1` est refusé | `bacIdeaFocus` + ouverture directe de `bacideas` |

Priorité `lecon > qcm > examen` (une seule cible d'écran). La banque BAC reste **hors du bundle d'entrée** : seul le test l'importe. Les paramètres sont conservés dans l'URL tant que la rubrique ne change pas ; un clic explicite les consomme.

**Aller-retour complet** : les 4 raccourcis internes (`ouvrirLeçonDepuisParcours`, `ouvrirQcmDepuisParcours`, `ouvrirExamen`, `onOpenRedaction`) écrivent désormais leur cible dans l'URL via `ecrireParametresPourTab` (`replaceState`, sans empiler d'historique). Un lien devient donc partageable/copiable, et un rechargement rouvre le même écran. Les fabriques (`queryPourLecon`…) et le lecteur sont verrouillés par un test d'aller-retour.

- **Bouton Retour Android** : `pushState` sur clic explicite + écoute `popstate` / `hashchange` (testé).
- **Sous-écrans** : `bacideas`, `examens`, `review`, `parcours`… gardent l'URL de leur **onglet parent** ; aucune sous-route inventée.
- `/` nu ne fabrique **aucune** route : le splash reste l'écran d'arrivée (3 suites d'intégration le prouvent).
- **Constat honnête** : aucune des anciennes URL n'existait dans le dépôt avant ce changement. Il s'agit d'une compatibilité **prévue**, pas d'une migration de liens en production.

---

## 5. Écarts avec la spec initiale — décisions et raisons

| # | Spec initiale | Décision | Raison (constat code) |
|---|---|---|---|
| 1 | « en version arabe, inverser l'ordre visuel » | **Pas d'inversion manuelle** | `index.html` est déjà `lang="ar" dir="rtl"` et il n'existe **aucun sélecteur de langue**. Inverser manuellement aurait produit une double inversion. Le double libellé AR+FR est conservé. |
| 2 | Routes en chemins propres | **Chemins acceptés en entrée, hash canonique en sortie** | Zéro routeur dans le dépôt ; `package.json` protégé ; PWA/TWA hors ligne. Le fallback `server.ts` (`app.get("*")`) et `sw.js` (`mode === 'navigate'`) existent déjà. |
| 3 | « conserver le fond vert de Méthode » | **ARBITRÉ le 2026-11-05** : fond vert **très pâle** `#f1faf4` + liseré `ring-[#006d37]/25` en permanence ; le vert **saturé** `#e5f6ed` reste exclusivement l'état actif | Dans le code, le vert saturé est l'état actif de n'importe quelle rubrique, pas une mise en avant propre à Méthode. Deux verts saturés auraient créé une ambiguïté. Décision **réversible** : 2 classes CSS + `data-testid="nav-methode"`, verrouillées par test. |
| 4 | « pastille Cours : 12/20 terminés » | **3 pastilles dérivées**, aucune constante | `AGENTS.md` §5 interdit tout chiffre inventé. Compteurs réels hétérogènes (72 leçons, tentatives, évaluations) sans dénominateur commun. Détail §2. |
| 5 | « Mon espace : … abonnement » | **Aucun abonnement** | `MoiView` n'en implémente pas ; le premium DZD reste « Non vérifiable ». Le renommage `أنا` → `حسابي` est appliqué, l'icône passe de `Sprout` à `User`. |
| 6 | Swipe sur la page | **Swipe sur la bande seulement** | `FigureZoomLayer`, schémas et tableaux captent déjà les gestes ; `touch-action: pan-y` évite le conflit. |
| 7 | « déplacer le contenu » | **Regrouper sans déplacer** | Les 3 destinations sont des hubs avec leurs propres `onOpen` / `onBackToHome`. Le conteneur est une couche de présentation ; `PortesUniques` (une porte par fonctionnalité) reste respecté. |
| 8 | Vrai sélecteur FR/AR | **Non implémenté** | Traduire l'interface exigerait d'écrire des centaines de chaînes FR qui n'existent pas → contenu inventé, interdit par `AGENTS.md` §5. Le double libellé AR+FR déjà en place est conservé. |

---

## 6. Validation (relancée après la dernière retouche)

| Commande | Résultat |
|---|---|
| `npm run lint` (`tsc --noEmit`) | **exit 0** |
| `npm run lint:eslint` | **exit 0** |
| `npm run check:miftah` | **exit 0** — garde-fou MARQUE §13 intact |
| `npm test` (vitest intégral + BOUSSOLE v2) | **309 fichiers / 3628 passés / 8 ignorés**, 393,51 s · BOUSSOLE **138 passed, 0 failed** |
| `npm run test:jest` | **301 suites / 3574 passés / 2 ignorés**, 131,53 s |
| `npm run test:build` | build **12,11 s / 3348 modules** + **4 fichiers / 20 tests** ; **entrée 515 Ko** (plafond 700 Ko) |
| Suite ciblée navigation + intégration | **13 fichiers / 113 tests**, exit 0 |

Verrous réécrits **consciemment** (changement d'architecture décidé, pas un affaiblissement) : `MoiView.test.tsx` (6 → 4 portes), `TrainingHubView.test.tsx` (tableau des 4 portes). Nouveaux verrous : `apprentissageNav.lock.test.ts`, `apprentissageProgression.lock.test.ts`, `deepLinkInterne.lock.test.ts`, `ApprentissageTabs.test.tsx`, `navigation4Rubiques.test.tsx` (8 tests comportementaux dans `<App />` réelle). `PortesUniques`, `integriteVues`, `poidsEntree.verrou`, `cablageCapitaine`, `conseilRubrique`, `LessonsMindmapMove`, `ReviewHubView`, les 3 suites rendant `<App />` et `check:miftah` passent **sans modification**.

**Piège rencontré et corrigé** : un `useMemo` placé après les retours anticipés (splash / quiz) provoquait « Rendered more hooks than during the previous render » dans les 3 suites d'intégration. Le calcul des pastilles est désormais un simple appel de fonction, sans hook.

**Fichiers protégés intacts** : `package.json`, `metadata.json`, `index.html`, `server.ts`, `public/manifest.json`, `public/sw.js`, `src/data/lessonIndex.ts`, `src/data/activeLessons.ts`, `src/components/HtmlLessonViewer.tsx`. `src/App.tsx` est le **seul** fichier protégé modifié, avec accord explicite.

---

## 7. Reste à faire (hors de ce GO)

1. **Vrai sélecteur FR/AR** : chantier i18n séparé, à arbitrer avec une source de traductions validée (voir §5.8).
2. **Validation visuelle** du vert « Méthode » sur appareil et en mode sombre (décision produit, réversible).
3. **Validation terrain** (Redmi / Samsung A ≤ 2 Go, 3G, 360 px, 3 crans de texte, geste Retour Android, swipe vs zoom).
4. Bouton « copier le lien » si l'on veut exposer les URL profondes à l'élève (les URL sont déjà écrites et partageables, mais aucun bouton ne les copie).

---

## 8. « Non vérifiable » — à ne pas transformer en certitude

- Rendu réel et confort tactile sur Redmi / Samsung A ≤ 2 Go, 3G/4G, 360 px, texte agrandi (3 crans).
- Comportement du swipe face au geste « Retour » du navigateur Android et aux gestes de zoom des figures.
- Maquette d'origine au « fond vert Méthode » (absente du dépôt) et charte `docs/MARQUE.md` pour le choix `حسابي` vs `أنا`.
- Empreinte `store/assetlinks.json` / Play Console, `start_url` en TWA réel, notifications envoyées depuis une URL profonde en production.
- Existence d'anciens liens `/apprendre` en production, d'un abonnement ou d'un prix DZD.
- Aucune source externe (web, ministère, Play Store) n'a été consultée pour ce changement.

---

## 9. Fichiers du changement

**Nouveaux (navigation)** : `src/data/apprentissageNav.ts`, `src/data/apprentissageProgression.ts`, `src/utils/navigationHash.ts`, `src/utils/deepLinkInterne.ts`, `src/components/ApprentissageTabs.tsx`, leurs 4 verrous, `src/components/__tests__/navigation4Rubiques.test.tsx`, ce document.
**Modifiés (navigation)** : `src/App.tsx` (imports, 4 portes, état actif dérivé, bande d'onglets, 4 effets de route/mémoire, deep-links validés, pastilles, mise en avant Méthode), `src/components/__tests__/{MoiView,TrainingHubView}.test.tsx`.
**Non touchés** : `package.json`, `index.html`, `public/*`, `server.ts`, `metadata.json`, `src/data/{lessonIndex,activeLessons}.ts`, `store/*`, `docs/*`.

Le volet BAC (« go correction all bac ») et le rapport d'audit 8 axes sont également présents dans le même arbre de travail, sans conflit avec ce chantier.
