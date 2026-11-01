// verrouSecretsCompose.test.ts — audit externe (15/10/2026), items secrets + TRUST_PROXY.
//
// docker-compose.yml embarquait quatre valeurs par défaut en CLAIR
// (`change-me-strong`, `change-moi-64-caracteres-aleatoires`,
// `change-moi-strong-123`) : quiconque lit ce dépôt public connaît donc le
// mot de passe PostgreSQL, le secret de signature des jetons et le mot de
// passe enseignant amorcé. Le compose exige désormais des variables réelles
// (.env, ignoré par git — voir .env.example) et lie le port sur 127.0.0.1
// pour que TRUST_PROXY=1 (obligatoire derrière nginx pour les limiteurs
// d'IP) ne devienne jamais contournable par X-Forwarded-For forgé.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = process.cwd();
const COMPOSE = readFileSync(resolve(RACINE, 'docker-compose.yml'), 'utf-8');
const ENV_EXEMPLE = readFileSync(resolve(RACINE, '.env.example'), 'utf-8');

describe('docker-compose — aucun secret modèle en clair', () => {
  it("n'embarque aucune valeur par défaut connue", () => {
    const modèles = [
      'change-me-strong',
      'change-moi-64-caracteres-aleatoires',
      'change-moi-strong-123',
    ];
    const présents = modèles.filter((m) => COMPOSE.includes(m));
    expect(présents, `valeurs de template encore en clair : ${présents.join(', ')}`).toEqual([]);
  });

  it('exige JWT_SECRET, POSTGRES_PASSWORD et ADMIN_PASSWORD depuis .env', () => {
    // La syntaxe ${VAR:?message} fait ÉCHEC du compose si la variable manque :
    // on ne démarre plus avec un secret de modèle.
    for (const variable of ['JWT_SECRET', 'POSTGRES_PASSWORD', 'ADMIN_PASSWORD']) {
      expect(COMPOSE.includes(`\${${variable}:?`), `${variable} doit être exigé (${variable}:?)`).toBe(
        true,
      );
    }
    expect(COMPOSE.includes('${POSTGRES_PASSWORD}@db:5432'), 'DATABASE_URL construit depuis la variable').toBe(
      true,
    );
  });

  it('lie le port de l’application sur 127.0.0.1 (TRUST_PROXY=1 présent)', () => {
    // TRUST_PROXY=1 fait venir req.ip de X-Forwarded-For : si le port est
    // exposé directement, ce champ est forgeable et TOUS les limiteurs d'IP
    // sont contournables. Le bind boucle-locale rend la forge impossible par
    // construction : seul le proxy de l'hôte (qui écrase l'en-tête) parle à
    // l'application.
    expect(COMPOSE).toContain("'127.0.0.1:3000:3000'");
    expect(COMPOSE).not.toContain("'3000:3000'");
  });

  it('.env.example documente les variables désormais exigées', () => {
    for (const variable of ['POSTGRES_PASSWORD', 'JWT_SECRET', 'ADMIN_PASSWORD']) {
      expect(ENV_EXEMPLE.includes(variable), `${variable} manquant dans .env.example`).toBe(true);
    }
  });
});
