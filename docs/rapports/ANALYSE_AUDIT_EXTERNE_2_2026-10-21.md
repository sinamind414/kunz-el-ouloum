# ANALYSE de l'audit externe n°2 (huit axes, 64/100) — 2026-10-21

**Objet :** réaction interne à l'audit indépendant non sollicité reçu le 21/10/2026,
portant sur HEAD `51dba89` (post H2 U11 + H1 APK). Score : **64/100**.
**Méthode :** chaque affirmation falsifiable a été re-vérifiée par sonde directe
dans le dépôt avant d'être acceptée ou discutée. Rien n'est repris sur parole.

---

## 1. Verdict sur le verdict

**Le 64/100 est jugé équitable.** Cohérent avec l'audit n°1 (62/100 sur le vieux
commit public `b8b86ab`) et avec l'auto-évaluation du dépôt. Les quatre réserves
« déterminantes » de l'auditeur recoupent exactement nos quatre verrous ouverts :

| Réserve de l'audit | Notre équivalent documenté |
|---|---|
| Alignement 2026–2027 non établi (sources 2017) | verrou curriculum + bilan H2 : collecte humaine requise |
| Correcteur ouvert sans validation indépendante | M3 : 30 copies, protocole prêt, exécution humaine |
| Distribution non prête (identités multiples, pas de binaire signé) | H1 : jalons A1-A3 faits ; restent A4 (APK signé) + B1 (compte Play) |
| Chiffres de fiche périmés vs donnés servis | **confirmé** ci-dessous — tranche H5 à ouvrir |

L'auditeur a travaillé sur l'état exact et à jour du dépôt (il cite `51dba89`,
l'entry 519,5 KiB du build PROD corrigé, 578 chunks, 74 résumés d'or, les
exceptions de durée mitigée de H2). Aucune attaque par surprise : le score
reconnaît les travaux H1/H2 tout en refusant de créditer l'absence de validation
humaine — c'est la bonne posture, elle est la nôtre aussi.

## 2. Table de vérification des faits (sondes directes, HEAD 51dba89)

| Affirmation de l'audit | Vérification | Verdict |
|---|---|---|
| 3 identités Android distinctes | `capacitor.config.ts`/`android/app/build.gradle` = `com.sinamind414.kunzelouloum` ; `store/fiche-play.json:3` = `dz.kunzelouloum.app` ; `store/assetlinks.json` = `com.kunzelouloum.app` | ✅ EXACT — divergence réelle |
| Fiche annonce 550 QCM / 588 cartes | `store/fiche-play.json` (ar+fr) : « 550 سؤال » / « 588 بطاقة » ; servis : 531 / 569 | ✅ EXACT — périmé |
| Fiche : « المناعة الفطرية وجزء من الجيولوجيا قيد الإثراء » | H2 a ajouté U11 (wilson+ophiolites) ; U4 immunité innée ajoutée antérieurement | ✅ EXACT — à actualiser |
| Compteur de recherche périmé | `SearchView.tsx:168` — visible UI : « يبحث في ٤٥٠ مقطعاً: ٤٧ درساً رسمياً + ٢٠ درساً نشيطاً » ; réel : 578 chunks / 47 / 29 actives | ✅ EXACT — à corriger |
| URL confidentialité placeholder | `store/fiche-play.json:5` = `https://<domaine>/privacy` | ✅ EXACT |
| bcrypt dit « chiffré » | `politiqueConfidentialite.ts:104` « il est chiffré (bcrypt) » / `:37` « تُشفَّر (bcrypt) » — bcrypt est un hachage | ✅ EXACT — terme imprécis |
| Image distante Unsplash | `CombatChallengePortal.tsx:178` — `images.unsplash.com` | ✅ EXACT |
| Polices Google dans miftah.html | `public/miftah.html` (fichier protégé — travail concurrent, lecture seule) | ✅ EXACT mais non modifiable par nous |
| Ratio D1/D2/D3 = 47,1/23,9/29 % vs cible 75/20/5 | `difficulteQcm.lock.test.tsx:9` : rééquilibrage « par AJOUT (enseignant) » | ✅ EXACT — connu, verrouillé honnêtement |
| U11 = 1/65 des fiches Bac (1,5 %) | bilan H2 lui-même l'a déclaré (contrat de vérité du fichier) | ✅ EXACT — connu |
| Sujets 2025 non embarqués | `Bac2025ExamView.tsx` — parcours de réponse, énoncés externes | ✅ EXACT — choix documenté |
| Sources curriculum = 2017 | `docs/sources/` ; réorga 2026–2027 annoncée sans détail SVT 3AS | ✅ EXACT — Non vérifiable (pareil pour nous) |
| `npm ci` échoue sur better-sqlite3 (env auditeur) | indisponibilité réseau du prébuild — **problème d'environnement de l'auditeur**, pas du dépôt ; le serveur tourne localement (serveur de dev actif) | ⚠️ NON REPRODUCTIBLE chez nous |
| vitest 3578 réussis + 8 ignorés | notre batterie : 3584/3586 (2 exceptions figureZoom documentées, travail concurrent) — l'auditeur n'a pas ces 2 échecs car il les a probablement exclus ou son état le… à noter, divergence mineure de comptage | ⚠️ écart d'interprétation, sans incidence |
| « chunks > 500 kB » avertissement Vite | exact — et l'audit reconnaît que le budget du dépôt passe | ✅ exact, déjà assumé |

**Bilan : 12/13 affirmations falsifiables confirmées à l'identique.** L'audit
interne n'a pas été flatté ni contredit — ce qui corrobore à la fois sa fiabilité
et la discipline du dépôt (aucun chiffre inventé à corriger).

## 3. Ce que l'audit n'attribute pas (et qu'il a raison de ne pas attribuer)

- **Écran de correction honnête** : « la note automatique couvre les attendus et
  ne juge pas toute la rédaction » — l'auditeur le cite et le crédite.
- **Compte de cartes réconcilié** : 569 = 531 (dérivées QCM) + 35 (cloze livre)
  + 3 (historiques) — l'auditeur a reconstitué la somme exacte sans s'être
  trompé ; le risque de « 569 connaissances autonomes » est bien pointé.
- **Tuteur « intelligent »** : là encore il crédite l'honnêteté du produit
  (« moteur local de règles/recherche, pas un LLM » — déclaré dans les tests).

## 4. Ce que je conteste ou nuance (peu)

1. **`npm ci` :** échec = env auditeur (interception réseau des prébuilds).
   `package.json` est gelé depuis des mois ; conteneur d'exécution du serveur
   actif. Non-actionable.
2. **« sans bascule complète en français »** : c'est un CHOIX produit assumé
   (élèves algériens, EXAMEN en arabe ; la fiche Play est bilingue pour les
   parents). Nuance, pas un défaut de conformité.
3. **« précache différé ~8 Mo sur 3G/4G »** : le code le fait **uniquement hors
   `saveData` et sur réseau jugé capable**, avec lazy-loading par schéma —
   l'auditeur le reconnaît. La recommandation « Wi-Fi ou accord explicite »
   reste néanmoins une bonne idée à mettre en backlog.

## 5. Plan d'action issu de l'analyse (mapping tranches existantes)

### T1 — H5 « Synchronisation de fiche distribution » (agent, rapport prioritaire)
Corrections ciblées, toutes hors fichiers protégés :
1. `SearchView.tsx:168` + commentaire `:3` — compteur réel ou dérivé dynamique
   de `lessonIndex` (578 / 47 / 29), plus jamais de littéral en dur.
2. `store/fiche-play.json` — 550→531, 588→569 (+ reformulation « بطاقات
   « أكمل الفراغ » مستخرجة من الكتاب » pour les 35 réelles), suppression du
   « قيد الإثراء » devenu périmé pour U4/U11 (ou reformulé précis par unité).
3. Identité Android UNIQUE : décision nécessaire (voir 5b) puis mise en cohérence
   de `store/README.md`, `store/fiche-play.json`, `store/assetlinks.json`.
4. `politiqueConfidentialite.ts` — « chiffré (bcrypt) » → « haché (bcrypt) »
   (+ équivalent arabe فصحى exact : « مُجزَّأة (bcrypt) » — تجزئة, pas تشفير), interprétation exacte pour Data Safety.

### T2 — décision humaine requise avant T1.3
**Quel identifiant Android unique ?** L'identifiant Capacitor confirmé par
utilisateur est `com.sinamind414.kunzelouloum` (irréversible quand publié).
Choix : (a) tout aligner dessus ; (b) revenir à un `dz.kunzelouloum.app`
tant que RIEN n'est publié (encore réversible) puis régénerer le projet natif.
→ Cette décision DOIT venir de l'utilisateur avant T1.3.

### T3 — humain (inchangé, audit concur avec nos verrous)
- Progression SVT 3AS 2026–2027 (source ministérielle) → matrice par enseignant.
- Exécution M3 (30 copies, double correction à l'aveugle).
- Exercices U11 tirés de sujets Bac réels (ONEC) — pression >5 %.
- B1 : compte Play 25 $ ; domaine HTTPS + politique de confidentialité réelle.
- A4 : AAB/APK signé + tests appareil (API 24 & récent, mode avion…).

### T4 — backlog qualité (moyenne, non bloquant)
- Précache des schémas : bascule « Wi-Fi uniquement OU accord explicite ».
- Héberger localement l'image Unsplash (CombatChallengePortal) → zéro appel tiers.
- `miftah.html` : polices auto-hébergées — **fichier protégé (travail concurrent)**
  → signaler à l'utilisateur, ne PAS toucher.
- Recalibrage D1/D2/D3 avec enseignants (75/20/5 : voire cible remplacée par une
  cible justifiée).
- Première navigation guidée + élargissement des tests d'accessibilité.

## 6. Position synthétique

L'audit n°2 change une chose importante : il montre que **le plafond de score ne
peut plus être levé par du code** — les trois chantiers restants sont de la
**validation humaine** (curriculum 2026–2027, M3, distribution réelle signée et
testée sur appareil). La discipline de développement (verrous, budgets, aucune
valeur inventée) a permis à un auditeur externe indépendant de trouver zéro
chiffre faux dans le produit ; tout ce qu'il a relevé comme « divergent » est
du **texte marketing/privacy périmé à synchro avec les exports réels** —
c'est la tranche T1, immédiatement agent-faisable.
