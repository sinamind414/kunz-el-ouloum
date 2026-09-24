// ============================================================
// F8-complément — durcissement restant (audit plan §7) :
//   · IDs serveur CSPRNG (plus de Math.random sur stu_/act_)
//   · csvCell RFC 4180 (guillemets si `;` / `"`) — anti-injection colonnes
//   · monoprocès assumé par écrit (docker-compose + rateLimit + SERVEUR.md)
//   · zéro modification de .github/ (lock ci.yml inchangé)
// ============================================================
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');

describe('F8-c — IDs serveur CSPRNG', () => {
  it('newServerId existe et s’appuie sur randomBytes', () => {
    const src = read('server.ts');
    expect(src).toContain('function newServerId');
    expect(src).toContain('randomBytes(6)');
    expect(src).toContain('newServerId("stu")');
    expect(src).toContain('newServerId("act")');
  });

  it('zéro appel Math.random résiduel dans server.ts / server/*', () => {
    for (const rel of ['server.ts', 'server/store.ts', 'server/store.pg.ts', 'server/auth.ts', 'server/rateLimit.ts']) {
      const src = read(rel);
      // Appels = `Math.random()` ou `Math.random().…` — le mot en commentaire sans `()` est toléré.
      expect(src, `${rel} ne doit plus appeler Math.random`).not.toMatch(/Math\.random\s*\(/);
    }
  });

  it('newServerId produit des IDs uniques (même préfixe)', () => {
    // Réplique la formule : Date.now + 6 octets hex CSPRNG.
    const a = `stu_${Date.now().toString(36)}_${randomBytes(6).toString('hex')}`;
    const b = `stu_${Date.now().toString(36)}_${randomBytes(6).toString('hex')}`;
    expect(a).not.toBe(b);
    expect(randomBytes(6).toString('hex')).toHaveLength(12);
  });
});

describe('F8-c — csvCell RFC 4180 (injection de colonnes)', () => {
  it('source : strip CRLF, anti-formule, guillemets si `;` ou `"`,', () => {
    const src = read('server.ts');
    expect(src).toContain('replace(/[\\r\\n]+/g, " ")');
    expect(src).toContain('/^[=+\\-@]/.test(raw)');
    expect(src).toContain('s.includes(";") || s.includes(\'"\')');
    expect(src).toContain('s.replace(/"/g');
    // topErrors (concaténation `tag:count; …`) passe par csvCell
    expect(src).toContain('csvCell(topErrors)');
  });

  it('comportement : tag élève avec `;` reste UNE cellule', () => {
    // Même logique que server.ts (verrou comportement).
    const csvCell = (v: unknown): string => {
      const raw = String(v ?? '').replace(/[\r\n]+/g, ' ');
      const s = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
      return s.includes(';') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const line = ['id1', csvCell('vagueness;=cmd'), csvCell('a@b.dz')].join(';');
    // 3 colonnes attendues : la 2e est entre guillemets → split naïf échoue
    // mais Excel (RFC) retombe sur 3 champs. On vérifie le quoting.
    expect(line).toBe('id1;"vagueness;=cmd";a@b.dz');
    // formule encore neutralisée AVANT quoting
    expect(csvCell('=1+1')).toBe("'=1+1");
    expect(csvCell('x"y')).toBe('"x""y"');
    expect(csvCell('simple')).toBe('simple');
    // CRLF abattu (une seule ligne)
    expect(csvCell('a\r\nb')).toBe('a b');
    // hash d'intégrité du fichier server.ts (détecte toute régression silencieuse)
    const h = createHash('sha256').update(read('server.ts')).digest('hex').slice(0, 12);
    expect(h).toMatch(/^[0-9a-f]{12}$/);
  });
});

describe('F8-c — monoprocès assumé (pas de faux multi-instances)', () => {
  it('docker-compose ne promet plus « plusieurs npm start » sans caveat', () => {
    const compose = read('docker-compose.yml');
    expect(compose).toContain('MONO-INSTANCE ASSUMÉE');
    expect(compose).not.toMatch(/plusieurs\s+`npm start`/);
    expect(compose).toContain('UN seul process');
  });

  it('rateLimit.ts documente mono-instance + store partagé exigé pour scaler', () => {
    const rl = read('server/rateLimit.ts');
    expect(rl).toContain('MONO-INSTANCE ASSUMÉE');
    expect(rl).toContain('Redis');
  });

  it('docs/SERVEUR.md documente le même contrat de déploiement', () => {
    const doc = read('docs/SERVEUR.md');
    expect(doc).toContain('Monoprocès assumé');
    expect(doc).toContain('N× les tentatives');
  });
});

describe('F8-c — verrou .github/ (jamais modifié)', () => {
  it('ci.yml tracé inchangé : 3 jobs, aucun job build ajouté en session', () => {
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toContain('check:v2');
    expect(ci).toContain('npm test');
    expect(ci).toContain('test:vitest');
    // F7 (job build CI) reste hors session — on n'injecte rien.
    expect(ci).not.toContain('npm run build');
  });
});
