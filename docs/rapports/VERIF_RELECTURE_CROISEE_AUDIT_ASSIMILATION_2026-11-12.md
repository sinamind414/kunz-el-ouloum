# Vérification locale de la relecture croisée de l'audit d'assimilation + du rapport « pedagogical-svt-app-claude 5.2 »

**[CONSTAT]** Document de vérification, daté 2026-11-12. Objet : contrôler **localement** les
affirmations du document tiers « Relecture croisée de l'audit d'assimilation — écarts entre
deux arbres » (§1–§6, pointe `1b37676` vs `reorganisation-med` `0dc9897`) et sa §7 (rapport
« pedagogical-svt-app-claude 5.2 », zip 194 929 o). Méthode : lecture de fichiers locaux,
`grep`, exécution ciblée d'un verrou vitest, extraction du zip dans un répertoire temporaire
(`C:\Users\zakaria\AppData\Local\Temp\opencode\psva52`). **Aucun `git fetch`, aucun checkout,
aucune modification de fichier produit, aucune opération sur une autre branche.**

---

## 1. Écart d'environnement découvert (nouveau, non couvert par le document relu)

**[CONSTAT]** Le checkout local n'est **pas** sur la pointe arène `1b37676` : la branche
courante est **`reorganisation-med`** (HEAD `e9dbf9f`, travail non commité en cours :
`AITutorView.tsx`, `smartTutorEngine.ts`, `bookTutorQA.ts`, …).

**[INTERPRÉTATION]** Les trois « écarts d'arbre » que le document a rectifiés (§4 : `web-push`
absent, 0 PDF, protocole M3 absent sur l'arène) ne sont **ni confirmables ni réfutables** ici :
on se trouve sur l'arbre cible de l'audit. En revanche, **toutes les affirmations portant sur
`reorganisation-med` deviennent vérifiables localement** — c'est ce qui est fait ci-dessous.

---

## 2. Affirmations sur `reorganisation-med` — confirmées localement

| Affirmation du document relu | Mesure locale (2026-11-12) | Statut |
|---|---|---|
| 29 PDF / 98 633 120 o | `public/bac-sujets/` : **28 PDF = 98 123 231 o** + `LIVRE_SULAYMAN/maquette/LIVRE_Sulayman_v1.pdf` → **somme = 98 633 120 o, exact à l'octet près** | ✅ |
| `difficulteQcm.lock.test.tsx` + `quizAdaptatif.ts` présents | `src/__tests__/difficulteQcm.lock.test.tsx`, `src/lib/quizAdaptatif.ts` | ✅ |
| 531 servis = 250 D1 + 127 D2 + 154 D3 | verrou figé (l. 59-65) ; **verrou exécuté : 5/5 verts** (`npx vitest run src/__tests__/difficulteQcm.lock.test.tsx`) | ✅ |
| `quizAdaptatif.ts` filtre par `difficulte` de palier | `quizAdaptatif.ts:75` (`q.difficulte === palier`) | ✅ |
| Lacune 2021 S2 dans `bacSessionIndex.ts` | `INCOMPLETE_SUJETS` l. 183 : « exercice 1 non lisible dans la source consultée », sujet 2 = 15 pts | ✅ |
| `web-push ^3.6.7` + `@types/web-push ^3.6.4` | `package.json:51` / `package.json:73` | ✅ |
| Version `1.0.0-rc.1`, `@capacitor/android 8.5.3` | `package.json:4` / `package.json:32` | ✅ |
| `sw.js` : `BUILD_ID = '__BUILD_ID__'` (l. 8), `fastEnough` 4G/3G + `saveData` (l. 232) | exact | ✅ |
| LICENSE AGPL-3.0 | `LICENSE:1` « GNU AFFERO GENERAL PUBLIC LICENSE » | ✅ |
| Protocole M3 présent, non exécuté | `docs/rapports/M3_PROTOCOLE_VALIDATION_30_COPIES_2026-10-21.md` présent | ✅ |
| Gouvernance **L1..L6** dans `docs/sources/README.md` | l. 1 et l. 10-15 (`.gitignore` bloque les livres L1–L4) | ✅ |
| Notifications : `Notification.requestPermission()` | `src/components/FocusTimer.tsx:97` + `src/components/PushOptIn.tsx:87` | ✅ |

**[INTERPRÉTATION]** La formulation exacte du grief « notifications » est bien « chaîne Web
Push non débloquée en production », pas « absence de notifications » : confirmée.

---

## 3. Vérification du zip « pedagogical-svt-app-claude 5.2 » (§7 du document relu)

**[CONSTAT]** Zip lu depuis `C:\Users\zakaria\Downloads\pedagogical-svt-app-claude 5.2.zip`,
extrait hors dépôt. **Tout ce que la §7 déclarait est confirmé à l'octet près :**

| Élément | Attendu (§7) | Mesuré |
|---|---|---|
| Taille / entrées du zip | 194 929 o, 13 entrées | **identique** |
| `src/App.tsx` / `src/data/audit.ts` | 59 380 / 42 954 o | **identique** |
| Datation | 10/11/2026 12:42 | identique (tous les fichiers) |
| Ancrage | commit `70b69ec` (4 nov. 2026) | `audit.ts:2`, `audit.ts:29`, limite « Lecture statique » |
| Notes A1–A8 | 8,0 / 7,0 / 7,5 / 7,5 / 7,5 / 7,0 / 7,5 / 7,5 | exactes |
| Poids | 15 / 12 / 18 / 12 / 10 / 10 / 13 / 10 (Σ = 100) | exactes |
| `RECTIFICATIF` section dédiée | `App.tsx:337-345` ; phrase « le score passe de 69,8 à … » à la l. 345 | ✅ |
| `LIMITES` en 6 points | lecture statique / tests non exécutés (323 fichiers) / 8 QCM sur 550 / aucun utilisateur / parts recalculées / stores | ✅ (6 entrées exactement) |
| `CONFIANCE = 4` | (non cité par §7) | ✅ cohérent |

**[CONSTAT]** Arithmétique du score **re-calculée indépendamment** :

```
TOTAL_X100 = 80×15 + 70×12 + 75×18 + 75×12 + 75×10 + 70×10 + 75×13 + 75×10 = 7465
GLOBAL_EXACT = 7465/100 = 74,65
GLOBAL_SCORE = Math.round(746,5)/10 = 747/10 = 74,7   (Math.round(746.5)=747 en JS)
```

**[INTERPRÉTATION]** Le calcul du rapport est **exact** ; le score affiché 74,7 est la conséquence
correcte des 8 notes et des poids, pas un chiffre « posé ». La §7 du document relu est donc
**fiabilisée à 100 %** sur ses mesures du rapport.

**[CONSTAT]** Point resté **non vérifiable** ici : le lien de l'ancrage vers le vrai commit
`70b69ec` du dépôt distant (aucun `fetch` selon la méthode). La §7 affirme l'avoir vérifié côté
GitHub ; rien, localement, ne permet de le contredire.

**[CONSTAT]** Annexe observée : à l'extraction, les accents du zip apparaissent mojibake dans la
lecture console (piège Windows connu — pas d'arabe inline en console). Les tailles d'octets
identiques confirment que les fichiers sont intacts ; c'est un artefact d'affichage, pas de contenu.

---

## 4. Ce que ce document ne fait pas

**[CONSTAT]** 0 ligne de code, 0 fichier protégé touché, 0 suppression de verrou, 0 changement
de branche, 0 push, 0 PR. Le seul fichier ajouté est le présent document. Le verrou
`difficulteQcm.lock.test.tsx` a été **exécuté** (5/5 verts), jamais modifié.

**[CONSTAT]** Le SHA du commit qui porte ce fichier ne peut y figurer par auto-référence ; il est
vérifiable par `git log -1 -- docs/rapports/VERIF_RELECTURE_CROISEE_AUDIT_ASSIMILATION_2026-11-12.md`
et consigné dans la réponse du tour.
