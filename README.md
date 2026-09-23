# كنز العلوم — Kunz El Ouloum

Plateforme d'étude **SVT — BAC DZ** : leçons hors-ligne, quiz, boussole méthodologique **المفتاح v6**, suivi enseignant.

## Démarrage

```bash
npm ci
npm run dev        # serveur Express + Vite
```

Variables serveur : voir `.env.example` (`JWT_SECRET` obligatoire, options `DATABASE_URL` PostgreSQL).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | développement (port 3000) |
| `npm run build` | `vite build` + bundle serveur |
| `npm start` | production (`dist/server.cjs`) |
| `npm test` | harnais natif (boussole, 138 invariants) |
| `npm run test:vitest` | suite Vitest complète |
| `npm run check:v2` | noyau méthodologique |
| `npm run check:miftah` | verrous de marque Miftah |

## Déploiement

- **Docker** : `docker compose up --build` (lit les secrets du `.env` à la racine — jamais dans le dépôt).
- **PM2 / nginx** : exemples dans `deploy/`.

## Notes

- App **offline-first** côté élève (service worker + cache local).
- Comptes et tableau de bord enseignant optionnels (SQLite par défaut).
- Fiche élève live : `public/miftah.html` (source historique v6 : `docs/propositions/al_miftah_final_v6.html`).
