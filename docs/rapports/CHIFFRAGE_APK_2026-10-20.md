# CHIFFRAGE APK — Kunz El Ouloum (2026-10-20)

Objectif : publier sur Play Store — jalon S2-1/S2-2/S2-3 du plan 30J (auditeur
Mentor-IA) + recommandation des deux audits (62/100 sur le vieux commit public
b8b86ab, 84,75/100 sur l'état récent). Les deux audits convergent : c'est LE
verrou technique restant avant la bêta lycéens (H9/S4).

## Mesures réelles du dépôt (faites le 20/10)

| Item | Valeur mesurée |
|---|---|
| `dist/` complet | **14,1 Mo** (noyau + 6 segments QCM + leçons 2,1 Mo + polices 0,3 Mo + icônes) |
| APK estimé (dist + surcoût shell Capacitor) | **~16-20 Mo** signé — Play Asset Delivery INUTILE |
| PWA | manifest.json complet (RTL, ar, 3 icônes 192/512/maskable), sw.js maison (10 ko, cache shell + lessons + assets, lazy précache schémas, nettoyage anciens caches) |
| Backend | optionnel (100 % invité local, offline-first) — aucun Serveur requis dans l'APK |
| Exigence Play Store 2026 | nouveaux ATP : **target API 36** obligatoire depuis 31/08/2026 (extension possible au 01/11) ; `minSdk` indépendant d'API 36 — ne PAS monter au-delà de 24 (garde les Android 7-8) |

## Décision technique : Capacitor 8.5.3, PAS une TWA

**Capacitor** (stable 8.5.3 du 07/10/2026, API 9 alpha dispo — rester sur 8.x) :
tout le contenu EMBARQUÉ dans l'APK (`dist/` copié dans
`android/app/src/main/assets/public/`), offline garanti dès l'installation,
aucun hébergement HTTPS requis, patron identique aux cas communautaires Vite +
React (un seul `dist/` pour web + Android).
**TWA rejeté** : exige le site hébergé en HTTPS + Digital Asset Links, et
déporter l'offline sur le service worker au premier lancement en ligne —
contradictoire avec la promesse « fonctionne au premier tap sans réseau »
pour les élèves ruraux.

## Chantier détaillé (jalons pédagogiques, à la façon du plan 30J)

| # | Étape | Effort | Risque principal |
|---|---|---|---|
| A1 | `npm i @capacitor/core @capacitor/android` + `npx cap init` (webDir=dist, appId dédié ex. `com.sinamind414.kunzelouloum`) | XS | choisir l'appId DÉFINITIVEMENT (irréversible) |
| A2 | `capacitor.config.ts` : `targetSdk=36`, `minSdk=24` (variables.gradle), WebView `domStorageEnabled`, dark status bar #006d37 | S | compatibilité plugin — zéro plugin natif prévu au début |
| A3 | Zone grise à VERIFIER en implémentation : le service worker sur schéma `capacitor://` — soit neutralisé côté natif (assets déjà locaux), soit conservé pour les mises à jour ; le paire SW + assets locaux = double cache à arbitrer | S | boucle de cache sale si mal configuré |
| A4 | `npx cap add android` → `npm run build` → `npx cap sync` → Build APK (AS) ; icônes adaptatives générées depuis /icons | M | GPU fournisseur Condor |
| A5 | Tests 3 appareils comme l'auditeur : Condor Allure A55 (2 Go), Samsung A14, un Pixel/ému ; test « kill app → relance hors ligne → progression intacte » (persistance localStorage du webview + registre backup existant) | M | localStorage évictable — prévoir l'export .json existant comme bouton de secours |
| A6 | Signature : keystore dédié + Play App Signing → AAB ; versionCode/versionName par mise à jour | S | keystore PERDU = app perdue — sauvegarder hors PC |
| B1 | Compte Google Play (25 $ one-shot) + fiche store (ar + fr), Data Safety « aucune donnée collectée » (sans compte, sans traceur — vrai), privacy policy (une page simple) | S | revue Google 3-7 jours — anticiper |
| B2 | Beta fermée (100 testeurs max) dès validation — canal H9 | XS | — |
| C1 | S2-3 : Lighthouse mobile slow 4G + test réel Condor (l'auditeur exige Perfo > 80, FCP < 2,5 s — notre noyau 154 Ko + segmentation le rendent atteignable) | XS | besoin du Condor (~10 000 DZD) |

## Chiffrage honnête

- **Interne APK signé + beta fermée Play Store : 5 à 8 jours ouvrés** (A1-A6
  ≈ 3-4 j, B1-B2 ≈ 1-2 j + la revue 3-7 j en parallèle).
- **Alpha interne testable : dès J+2** (avant même le compte Play, via APK par
  lien direct/Telegram) — permet de lancer la bêta H9 technique sans attendre
  la revue Google.
- **Lancement public réaliste : mi-décembre 2026** si la bêta H9 démarre
  maintenant (revue + 2 semaines de bêta + validation مفتش). La date
  « novembre 2026 » droitlement promise n'est tenable que si le compte Play est
  créé CETTE SEMAINE et la bêta démarre dès l'alpha interne.
- Coût direct : 25 $ (compte) + 10 000 DZD (Condor occasion, éventuel).

## Ce que ça ne change PAS

- Le code applicatif ne bouge presque pas : intégration = fichiers `android/`
  + `capacitor.config.ts` + (peut-être) un garde SW. Rien des fichiers
  protégés AGENTS.
- Les tâches humaines restent humaines : 5 sujets blancs (S3-1), micro-vidéos
  (S3-2), lettre مفتش (S4-3), marketing (S4-4).

## Sources (vues 20/10/2026)

- Google Play — target API : API 36 obligatoire pour nouveaux apps depuis
  31/08/2026 (extension au 01/11/2026 demandable dans Play Console).
- Capacitor : stable 8.5.3 (07/10/2026), 9.0 en alpha — rester sur 8.x.
- Deux audits Mentor-IA (62 et 84,75/100) déjà analysés dans la conversation.
