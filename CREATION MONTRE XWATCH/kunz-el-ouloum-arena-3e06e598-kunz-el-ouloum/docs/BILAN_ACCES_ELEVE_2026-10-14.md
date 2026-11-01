# Bilan des accès élève — Kunz El Ouloum

**Date :** 14/10/2026 · **Périmètre :** toutes les façons dont un élève entre dans l'application, ce que
chacune ouvre, et ce qui peut la lui fermer.
**Règle de ce document :** un chiffre sans source n'y figure pas. Ce qui n'a pas pu être mesuré est écrit
**Non vérifiable**.

---

## 1. Les quatre portes d'accès

| # | Porte | Ce que l'élève doit fournir | Où c'est déclenché | État |
|---|---|---|---|---|
| 1 | **Invité** (chemin par défaut) | **Rien** | Il ouvre l'application | ✅ Complet, hors ligne, rien ne quitte l'appareil |
| 2 | **Code de connexion** (nouveau 14/10/2026) | Nom + code secret **6 chiffres** → le serveur attribue un code **8 caractères** | Carte sur l'accueil, puis fenêtre « بالرمز » | ✅ Implémenté et testé |
| 3 | **E-mail + mot de passe** (voie historique) | Adresse + mot de passe ≥ 6 caractères | Onglet « بالبريد » de la même fenêtre | ✅ Conservée, aucune régression |
| 4 | **Récupération** | Code **8 caractères** remis par le professeur (valable 30 min, usage unique) | Menu du compte → « نسيت كلمة المرور » | ✅ Implémenté et testé |

**Ce qu'un compte ouvre — et rien d'autre :** quatre routes serveur, `/api/auth/me`,
`/api/student/sync`, `/api/student/entries`, `/api/student/activity`. Elles servent à envoyer les
productions et les activités de l'élève vers le tableau de bord du professeur. **Aucune donnée
personnelle n'est demandée :** ni téléphone, ni adresse réelle, ni date de naissance, ni photo. Le nom
est **déclaré**, jamais vérifié.

---

## 2. Le parcours réel, et où il casse encore

```
Ouvre l'app  →  utilise tout sans compte (mode invité)
                    │
                    │  veut être suivi par son professeur ?
                    ▼
        Carte « أنشئ حسابك بدون بريد إلكتروني »  ─── 2 champs, ~30 s
                    │
                    ▼
        Écran « رمزك جاهز » : le code s'affiche en grand, UNE fois
                    │
                    ▼
        élève connecté → travail synchronisé → visible par le professeur
```

**Frictions qui subsistent, mesurées dans le code :**

| Friction | Effet | Sévérité |
|---|---|---|
| Le code s'affiche **une seule fois** et il n'existe aucun e-mail de secours | Perdu = il faut repasser par le professeur (porte 4) | Moyenne — inhérent au choix « sans e-mail » |
| Le mode invité est **invisible** dans le tableau de bord (il ne compte que les inscrits) | L'élève qui révise beaucoup mais ne crée pas de compte n'apparaît pas dans le suivi | **Élevée** — c'est le principal frein à l'adoption par le professeur |
| L'identité est déclarative (le nom est saisi, non vérifié) | Un élève peut se faire passer pour un autre **au moment de l'inscription** | Moyenne — se règle en distribuant les codes en classe |
| La file locale n'est **pas bornée** (aucun plafond, `writeQueue` avale les erreurs de quota) | Au-delà du quota du navigateur (~5 Mo), des activités seraient perdues **en silence** | Faible en pratique — ordre de 20 000 activités, **non mesuré** — mais **non borné** |

---

## 3. Défenses en place (chiffres exacts, vérifiés dans le code)

| Défense | Valeur réelle | Où |
|---|---|---|
| Espace des codes de connexion | **31⁸ ≈ 8,55 × 10¹¹** (alphabet sans `I L O 0 1`) | `src/server/codeEleve.ts` |
| Espace des codes secrets | **10⁶** (6 chiffres ; 14 suites devinables refusées) | idem |
| Limiteur par identifiant | **5 échecs / 15 min**, remis à zéro au succès | `server.ts` (`ACCOUNT_LIMIT = 5`) |
| Limiteur par IP | **60 requêtes / 15 min** | `server.ts` (`IP_LIMIT = 60`) |
| Clé du limiteur | Le **code normalisé** (casse, tirets, points, chiffres arabo-indiens ne comptent pas comme des essais distincts) | `cleQuotaConnexion()` |
| Code de récupération | **8 caractères CSPRNG**, alphabet de 32 sans `O/0/I/1`, **30 min**, usage unique | `generateResetCode()` |
| Limiteur de récupération | **10 essais / 15 min par IP** | `resetCodeLimiter` |
| Durée du jeton | **7 jours** | `jwt.sign(… expiresIn: '7d')` |

**Ce que ces défenses NE protègent pas, dit sans détour :**

1. **Le partage d'identifiants.** Rien ne lie un compte à un appareil (choix assumé : le téléphone est
   souvent partagé en Algérie). Un camarade à qui l'élève donne son code + son secret entre
   normalement, sur n'importe quel téléphone.
2. **Les jetons ne sont pas révocables.** `server/auth.ts` vérifie la signature et l'expiration,
   **jamais la base** : un jeton partagé ou volé reste valide **7 jours**, même après un changement de
   code secret.
3. **Les limiteurs vivent en mémoire.** Un redémarrage remet les compteurs à zéro, et deux instances
   serveur tiennent deux comptes séparés. Contre une attaque distribuée (plusieurs IP), 5 essais /
   15 min deviennent beaucoup plus de 5 essais / 15 min.
4. **Le code est semi-public par nature** : il est affiché, dicté, écrit sur un carnet, présent dans le
   tableau de bord du professeur. C'est le **code secret seul** qui protège réellement — et il est à
   10⁶. Un élève ciblé dont le code est connu peut donc être attaqué sur son secret ; un attaquant
   qui ignore le code, lui, ne peut rien énumérer (8,55 × 10¹¹).

---

## 4. Défaut fermé pendant la rédaction de ce bilan : verrouillage définitif

En listant les portes d'accès, une incohérence est apparue entre la **récupération** et l'**écran de
connexion** :

| Étape | Ce que le code faisait | Ce que ça produisait |
|---|---|---|
| Récupération (`/api/student/reset-password`) | Acceptait **tout mot de passe ≥ 6 caractères**, y compris alphabétique | Un élève sans e-mail pouvait définir le secret « motdepasse » |
| Écran « بالرمز » | Le champ secret e **effaçait tout caractère non numérique** | Ce secret était **impossible à saisir** |
| Voie alternative | L'onglet e-mail… exige une adresse | **L'élève était enfermé dehors, définitivement** |

**Corrigé, avec verrous :**

- le serveur exige désormais, pour un compte **sans adresse e-mail**, un nouveau secret conforme à la
  règle d'inscription (6 chiffres, non devinable) — réponse `400 weak_pin` ;
- le refus intervient **avant** l'écriture du mot de passe **et avant** de brûler le code du professeur :
  un code faible n'oblige pas à en redemander un ;
- l'écran de connexion **n'efface plus** les lettres du secret (l'inscription, elle, reste limitée à
  6 chiffres) : un compte réinitialisé autrement peut toujours rentrer ;
- messages clarifiés côté élève : `weak_pin` dit explicitement « حسابك بدون بريد إلكتروني: اختر رمزًا
  سريًا من 6 أرقام ».

---

## 5. Couverture de tests des accès

| Fichier | Tests | Ce qui est verrouillé |
|---|---|---|
| `src/server/codeEleve.test.ts` | 22 | Alphabet sans caractères ambigus, normalisation (arabe/persan), allers-retours d'identifiant, PIN interdits |
| `src/server/inscriptionSansEmail.test.ts` | 18 | Inscription, collisions, 503 après 5 essais, connexion par code/e-mail, **cohérence du secret de réinitialisation** |
| `src/components/StudentAuthView.test.tsx` | 8 | Onglet par défaut « بالرمز », `eleve@ecole.dz` banni, code affiché avant connexion, **secret non numérique accepté en connexion** |
| `src/components/__tests__/CompteSansEmail.test.tsx` | 7 | Carte d'accès sur l'accueil, bandeau « هل هذه الأنشطة لك ؟ » |
| `src/__tests__/compteSansEmail.cablage.test.ts` | 14 | Routes derrière les limiteurs, quota unifié, ordre des routes, **règle de réinitialisation**, zéro fuite de `@eleve.local` |
| `src/utils/__tests__/attributionActivites.test.ts` | 9 | **Le travail d'un invité n'est jamais attribué à un autre compte** |
| `src/__tests__/serverAuth.test.ts` | 14 | Confusion de rôles élève/enseignant impossible |
| `src/utils/__tests__/wireSync.test.ts` | 10 | Contrat de synchronisation, lots, 413, hors ligne |
| **Total** | **102** | |

**Exécutions :** suite complète **218 fichiers / 2 607 tests passés / 6 ignorés / 0 échec** ;
`npx tsc --noEmit` **0 erreur** ; `npm run test:build` **14/14** ; entrée **162 Ko** (cible 170,
plafond 176).

---

## 6. Ce que ce bilan ne peut PAS dire

| Question | Réponse |
|---|---|
| Combien d'élèves ont réussi à s'inscrire ? | **Non vérifiable** — aucune télémétrie, aucune instance déployée, aucune donnée d'usage collectée. |
| Taux d'abandon à l'écran d'inscription ? | **Non vérifiable** — même raison. Le parcours a été corrigé par lecture du code, pas par mesure d'usage. |
| Combien d'élèves utilisent le mode invité ? | **Non vérifiable** — et par construction ils sont invisibles du serveur (rien n'est envoyé). |
| L'inscription aboutit-elle réellement en base ? | **Testée hors de cet environnement uniquement au niveau logique.** Le binaire natif SQLite ne se compile pas ici ; à rejouer sur votre machine : `npm run build && JWT_SECRET=… node dist/server.cjs`, puis créer un compte depuis le navigateur. |
| Le secret à 6 chiffres résiste-t-il à une attaque réelle ? | **Non mesuré.** Le raisonnement (5 essais/15 min par identifiant, 10⁶ combinaisons) tient contre un attaquant isolé ; il ne tient pas contre une attaque distribuée, et les limiteurs sont perdus à chaque redémarrage. |

---

## 7. Décisions qui vous appartiennent

| Décision | Options | Conséquence |
|---|---|---|
| **Rendre les invités visibles du professeur** | (a) ne rien faire (b) rendre le compte obligatoire pour le tableau de bord (c) permettre à l'élève de s'inscrire **en classe** en 30 s | C'est le point qui décide si l'outil sert au suivi pédagogique ou seulement à la révision |
| **Jetons révocables** | Table de sessions → migration SQLite + PostgreSQL | Indispensable **seulement** si l'application sert un jour à noter |
| **Bornage de la file locale** | Plafond (par ex. 2 000 activités, au-delà on écrase les plus anciennes) + message affiché | Empêche une perte silencieuse au quota, mais ajoute une règle à expliquer |
| **Qui distribue les codes** | (a) l'élève s'inscrit seul (aujourd'hui) (b) le professeur crée les comptes et remet les codes en main propre (`npm run teacher`) | (b) règle d'un coup l'usurpation de nom et le partage, sans une ligne de code de plus |
