# Déploiement et rollback — artefact P3

## Contrat de livraison

La cible de production est **uniquement** `dist/site/`. Elle est reconstruite à partir de la liste publique explicite du dépôt et contient :

- le shell (`index.html`, CSS, modules statiques, manifeste et icônes) ;
- les 19 payloads d’années chargés à la demande ;
- les deux PDF 2025, téléchargés uniquement après une action de l’élève ;
- `release.json`, manifeste déterministe avec l’identifiant de build, la taille et le SHA-256 de chaque fichier.

Elle ne contient ni `.git`, ni tests, ni documentation, ni scripts de build, ni `package.json`. Le monofichier `dist/boussole-4d-standalone.html` est un livrable séparé pour `file://` ; ce n’est pas la racine du site PWA.

Aucune date de build, heure locale ou chemin absolu n’entre dans les fichiers produits. À sources identiques, deux builds ont les mêmes octets et le même `contentSha256`.

## Construire et vérifier

Depuis une révision Git propre et identifiée :

```bash
npm ci
npm run lint
npm run typecheck
npm run format:check
npm run calibration:check
npm run coverage:official
npm run docs:check
npm test
npm run build
npm run release:verify
npm run p3:check
npx playwright install --with-deps chromium
npm run test:e2e
```

Lire ensuite l’identité immuable :

```bash
node -e 'console.log(require("./dist/site/release.json").buildId)'
sha256sum dist/site/release.json
```

Ne jamais publier si `release:verify` échoue. Conserver ensemble le SHA Git, le `buildId`, le `contentSha256` et le journal de CI ayant exécuté les tests E2E.

## Prévisualisation de l’artefact exact

Le serveur du dépôt peut servir la release plutôt que les sources :

```bash
PUBLIC_ROOT=dist/site HOST=0.0.0.0 PORT=8080 npm start
```

Vérifier au minimum : accueil, chargement d’une année Sciences, chargement d’une année Maths, téléchargement explicite d’un PDF, rechargement hors ligne après ouverture d’une année, et affichage de l’identifiant de build.

### Intégration dans un cadre (`frame-ancestors`)

Par défaut, la CSP n’autorise que l’origine propre : `frame-ancestors 'self'`. Aucun hôte
tiers — en particulier aucun hôte de prévisualisation — n’est codé en dur dans l’en-tête de
production.

Un déploiement qui doit être intégré dans un cadre le déclare explicitement :

```bash
CSP_FRAME_ANCESTORS="'self' https://hote.exemple" npm start
```

La valeur est validée au démarrage. Seuls `'self'` et les origines `https://` explicites
(wildcard de sous-domaine `https://*.hote.exemple` admis) sont acceptés ; `*`, `https://*`,
`http://…` et toute autre source sont refusés et **le serveur ne démarre pas**. Il n’existe
donc pas de repli permissif silencieux : une valeur mal formée échoue bruyamment plutôt que
d’élargir la surface d’intégration.

## Publication atomique

La plateforme d’hébergement doit conserver les releases par identifiant au lieu d’écraser une arborescence en place.

1. Copier `dist/site/` vers un emplacement temporaire `releases/<buildId>.tmp`.
2. Exécuter `node scripts/verify-release.mjs releases/<buildId>.tmp` avant exposition.
3. Renommer atomiquement le dossier en `releases/<buildId>`.
4. Faire pointer la cible publique `current` vers cette release en une seule opération (symlink atomique, promotion d’artefact ou changement de release selon l’hébergeur).
5. Effectuer un smoke test HTTP : `/`, `/js/app-version.js`, un payload `data/years/...`, puis vérifier que les routes privées répondent 404.
6. Garder au moins la release précédente et son `release.json`.

Pour GitHub Pages ou un hébergeur sans symlink, publier **le contenu** de `dist/site/` depuis un artefact CI vérifié, jamais l’intégralité du checkout. La promotion de l’artefact doit rester l’étape atomique de la plateforme.

## Rollback

1. Identifier le dernier `buildId` sain et revérifier son `release.json`.
2. Refaire pointer `current` vers `releases/<buildId-précédent>` sans reconstruire cette ancienne release.
3. Purger seulement le cache HTTP/CDN de l’entrée stable si nécessaire ; ne pas modifier les fichiers de la release.
4. Charger `/js/app-version.js` et vérifier l’ancien identifiant dans l’en-tête `X-Miftah-Build` et dans l’indicateur de l’application.
5. Tester une navigation en ligne puis hors ligne. Le service worker revenu à l’ancienne version supprime uniquement les caches préfixés `miftah-kanz-` qui n’appartiennent pas à ce build ; il ne touche pas aux caches d’autres applications.
6. Documenter la cause, le SHA Git et les deux identifiants de build avant une nouvelle tentative.

## Exploitation et confidentialité

L’observabilité navigateur reste locale et agrégée : identifiant de build, état online/offline, compteurs par portée technique et événements de cache autorisés. Aucun message d’erreur, stack, URL, réponse, nom, adresse IP ou contexte arbitraire n’est persisté ou envoyé. Il n’existe volontairement aucun endpoint de télémétrie.

Le cache runtime est limité à 12 entrées et n’accepte que les payloads d’années et PDF locaux ayant répondu HTTP 200. Les erreurs, redirections opaques, réponses partielles et ressources externes ne sont jamais mises en cache. Une année non encore ouverte reste indisponible hors ligne ; l’interface l’annonce sans prétendre que tout le catalogue a été téléchargé.
