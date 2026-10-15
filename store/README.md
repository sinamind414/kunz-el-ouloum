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
| Digital Asset Links (TWA) | ⚠️ gabarit **non renseigné** (volontaire) | `store/assetlinks.json` |
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

Suggéré : `dz.kunzelouloum.app`. **Un nom de paquet ne se change plus** après la première publication
(seule une nouvelle application peut en porter un autre) : le figer avant tout envoi, et l'inscrire
dans `store/assetlinks.json` **et** dans le projet Android.

## 2. Produire le binaire (deux voies ; la première est la plus légère)

### Voie A — TWA (Trusted Web Activity) : l'application affiche le site existant

```bash
# Hors de ce dépôt (Node 18+ requis) :
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<votre-domaine>/manifest.json
bubblewrap build            # produit app-release-signed.apk + .aab et le keystore
```

- À l'initialisation, Bubblewrap demande **le nom de paquet** (§1) et crée un keystore : **sauvegardez-le
  et sa phrase de passe hors du dépôt** — perdre la clé d'upload complique toutes les mises à jour.
- Le `dist/` produit par `npm run build` doit être déployé sur un domaine **HTTPS** avant de builder :
  une TWA pointe vers une URL, elle n'embarque pas le contenu.

### Voie B — Capacitor : embarquer les fichiers dans l'APK

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Kunz El Ouloum" dz.kunzelouloum.app --web-dir=dist
npm run build && npx cap add android && npx cap sync android
cd android && ./gradlew bundleRelease
```

Plus lourd (le contenu est dupliqué dans l'APK), mais l'application ne dépend plus du réseau au premier
lancement. **Recommandation :** voie A pour la première publication (l'application est déjà conçue
hors ligne avec service worker), voie B en second temps si les retours montrent que le premier
chargement est un obstacle réel.

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
| `store/assetlinks.json` renseigné | vous, après création du keystore |
| Décision : TWA ou Capacitor | vous (recommandation : TWA d'abord) |
