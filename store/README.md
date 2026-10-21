# Publier Kunz El Ouloum (H2) — ce qui est prêt, ce qui exige vos accès

**Contexte :** l'audit du 14/10/2026 a identifié l'absence de distribution en magasin comme le
**deuxième blocage réel** du produit (axe 8) : la concurrence installée affiche 500 000+ téléchargements,
et une PWA qu'il faut « ajouter à l'écran d'accueil » après une visite n'est pas une application
téléchargeable pour un élève de terminale. Ce dossier prépare **tout ce qui est préparables sans vos
identifiants** ; les étapes qui exigent une signature ou un compte sont listées explicitement, dans
l'ordre, avec la commande exacte.

> ⚠️ **Ce que je n'ai pas pu faire, et pourquoi.** Le jeton GitHub de l'agent n'a pas la permission
> `workflows`, et il n'a **aucun accès** à la Play Console, à un compte Google ni à une clé de
> signature. Tout ce qui suit a donc été préparé, testé et vérifié **localement** — rien n'a été
> soumis. Aucune étape ci-dessous n'est « faite » : elles sont prêtes à être exécutées.

---

## 0. Ce qui est déjà prêt dans le dépôt

| Élément exigé par Play | État | Fichier |
|---|---|---|
| Icône 512×512 (obligatoire) | ✅ présente | `public/icons/icon-512.png` |
| Icône adaptative (masque) | ✅ présente | `public/icons/icon-512-maskable.png` |
| Manifeste PWA complet (`id`, `scope`, `start_url`, `display`) | ✅ | `public/manifest.json` |
| Politique de confidentialité **publique, sans JavaScript, ar + fr** | ✅ route servie | `GET /privacy` (`src/server/politiqueHtml.ts`) |
| Digital Asset Links (TWA) | ⚠️ paquet **aligné** `com.sinamind414.kunzelouloum`, empreinte **gabarit assumé** (remplacer au moment de la signature, voir §3) | `store/assetlinks.json` |
| Textes de fiche (titre, descriptions, nouveautés) ar + fr | ✅ | `store/fiche-play.json` |
| Brouillon « Sécurité des données » | ✅ | `store/data-safety.md` |
| Captures d'écran | ❌ **à produire sur un appareil** | voir §4 |
| Bandeau promotionnel 1024×500 | ❌ à produire | voir §4 |

**Vérifications automatiques** (lancées par `npm run test:vitest`) :
`src/store/fichePlay.test.ts` refuse une fiche trop longue (limites Play), un texte qui promet une
fonctionnalité inexistante, et un `assetlinks.json` servi en gabarit.
`src/server/assetLinks.test.ts` couvre les quatre états du fichier (absent, gabarit, invalide, valide).

---

## 1. Choisir le nom de paquet et le figer maintenant

**DÉCISION FIGÉE (2026-10-21, décision utilisateur) : `com.sinamind414.kunzelouloum`.**
Déjà câblé dans `capacitor.config.ts` et `android/app/build.gradle` (tranche H1), et aligné
dans `store/fiche-play.json` + `store/assetlinks.json`. **Un nom de paquet ne se change plus**
après la première publication : toute évolution du projet natif DOIT conserver cet identifiant.

## 2. Produire le binaire (voie B — Capacitor — RETENUE et déjà exécutée à 80 %)

### Voie A — TWA (Trusted Web Activity) : ABANDONNÉE (2026-10-21)
La voie Capacitor (B) est retenue : le contenu est **embarqué** dans l'APK (offline garanti
dès l'installation, sans dépendre d'un domaine de première visite). Les éléments TWA restants
(`assetlinks.json`) ne servent que d'éventuels App Links futurs ; le serveur refusera de les
servir tant que l'empreinte n'est pas remplacée (état « gabarit » assumé).

### Voie B — Capacitor : embarquer les fichiers dans l'APK ✅ CHOISIE

```bash
# DÉJÀ FAIT (tranche H1, commit 51dba89) :
#   deps exactes @capacitor/core+android 8.5.3 (+ cli en dev)
#   npx cap init "كنز العلوم" com.sinamind414.kunzelouloum --web-dir dist
#   capacitor.config.ts (scheme https, debugging off) + npx cap add android
#   android/variables.gradle : minSdk 24 / targetSdk 36 / compileSdk 36 (déjà conforme)
#   garde SW native (src/main.tsx : pas de service worker dans la WebView)

# RESTE à faire (jalons A2 fin + A4) :
npm run build && npx cap sync android     # à RELANCER à chaque build (assets embarqués)
cd android && ./gradlew bundleRelease     # nécessite un keystore de publication (A4)
```

Le contenu est dupliqué dans l'APK (~5 Mo dist réel / ~16-20 Mo APK attendu), mais
l'application ne dépend plus du réseau au premier lancement — condition clé pour les
réseaux faibles visés.

## 3. Digital Asset Links — l'étape que tout le monde oublie

Sans elle, l'application publiée s'ouvre **avec la barre d'adresse du navigateur** en haut : elle est
perçue comme « un site dans une coquille ». Le site doit déclarer l'application :

```bash
# 1. Empreinte SHA-256 du certificat de signature (celle du keystore, ou celle
#    affichée par la Play Console si vous utilisez Play App Signing → « Certificat
#    de signature de l'application » ; il faut les DEUX, upload et signature).
keytool -list -v -keystore android.keystore -alias androiddebugkey | grep SHA256

# 2. Renseigner store/assetlinks.json (remplacer les deux gabarits), puis
#    redémarrer le serveur et vérifier :
curl -s https://<votre-domaine>/.well-known/assetlinks.json | head
```

Le serveur **refuse de servir un gabarit** et l'écrit dans ses journaux (`[assetlinks] non servi …`) :
c'est volontaire — un fichier présent mais faux fait échouer la vérification Android en silence, et on
cherche alors le problème pendant des heures. Vérifiez aussi avec l'outil officiel :
`https://developers.google.com/digital-asset-links/tools/generator`.

## 4. Éléments graphiques (à produire — je ne peux pas les fabriquer honnêtement)

| Élément | Format | Où |
|---|---|---|
| Icône | 512×512 PNG, ≤ 1 Mo | ✅ `public/icons/icon-512.png` |
| Bandeau promotionnel | 1024×500 PNG/JPEG | à produire (fond vert marque `#006d37` + logo) |
| Captures téléphone | ≥ 2, 16:9 ou 9:16, min 320 px | **captures réelles de l'application**, interface arabe |
| Captures tablette | ≥ 2 (si tablette prise en charge) | à produire sur tablette |

⚠️ **Les captures doivent montrer l'application réelle** : Play refuse les captures trompeuses ou
maquettées. À prendre sur un téléphone après installation, sur les écrans : accueil, QCM, correction
d'une réponse ouverte, carte mentale. Le mode sombre en second jeu est un plus.

## 5. Fiche, confidentialité et sécurité des données

1. `store/fiche-play.json` → copier titre / description courte / description complète / nouveautés
   dans la Play Console (arabe d'abord, français ensuite).
2. **URL de confidentialité :** `https://<votre-domaine>/privacy` — testez-la dans un navigateur
   **JavaScript désactivé** : c'est ce que fait un relecteur.
3. `store/data-safety.md` → remplir le questionnaire « Sécurité des données » d'après ce brouillon,
   et **vérifier le point HTTPS** avant de cocher « données chiffrées en transit ».

## 6. Envoi

```bash
# Piste de test interne d'abord (rapide, sans revue) :
#   Play Console → Test → Test interne → créer la release → téléverser l'.aab
# Puis production, après quelques retours réels.
```

Puis, dans l'ordre : « Test interne » → 5-10 testeurs réels (élèves + un professeur) → corrections →
production. Prévoir **une revue de plusieurs jours**, et une première revue plus longue pour une
application qui demande la création d'un compte.

---

## 6 bis. Ce que je recommande d'ajouter avant d'ouvrir grand

Ces points ne bloquent pas une publication, mais ils changent ce que l'élève va vivre :

1. **Un écran « premiers pas »** après l'installation : l'application s'ouvre sur un tableau de bord
   dense ; un élève qui ne sait pas par où commencer referme. (À challenger : la carte « خطوتك التالية »
   existe déjà — c'est peut-être suffisant.)
2. **Sujets 2026 intégraux** (audit M4) : une application de révision du Bac sans le dernier sujet
   complet se fait remarquer dans les commentaires.
3. **Réponse par exercice du correcteur** (audit H4) : la note automatique affichée sans validation
   indépendante reste le risque pédagogique principal ; l'application dit déjà qu'elle est une aide,
   il faut que ce soit dit aussi **dans la fiche**.

---

## 7. Ce qui reste ouvert après cette préparation

| Blocage | Qui peut le lever |
|---|---|
| Compte développeur Play (25 $ une fois) + fiche | **vous seul** |
| Keystore, nom de paquet, publication | **vous seul** |
| Captures d'écran sur appareil réel | **vous seul** (ou votre entourage avec un téléphone) |
| `store/assetlinks.json` renseigné | vous, après création du keystore (empreinte `keytool -list -v` à la place du gabarit, voir §3) |
| Décision : TWA ou Capacitor | **TRANCHÉE (2026-10-21) : Capacitor** — voir §2 |
