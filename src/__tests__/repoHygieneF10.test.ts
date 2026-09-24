/**
 * F10 — le VCS réel du projet est git, pas une pile de patches.
 * Verrou : aucun *.patch / apply_patches.sh tracké, racine sans dumps non-code.
 */
import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function tracked(): string[] {
  const out = execSync('git ls-files', { encoding: 'utf-8', cwd: root });
  return out.split('\n').filter(Boolean);
}

describe('F10 — hygiène VCS (pas de pile de patches)', () => {
  const files = tracked();

  it('aucun *.patch tracké', () => {
    const patches = files.filter((f) => f.endsWith('.patch'));
    expect(patches).toEqual([]);
  });

  it('apply_patches.sh jamais tracké', () => {
    expect(files.filter((f) => f.endsWith('apply_patches.sh'))).toEqual([]);
  });

  it('bun.lock jamais tracké (lockfile unique = package-lock)', () => {
    expect(files.filter((f) => f === 'bun.lock')).toEqual([]);
  });

  it('l’historique n’est pas un commit unique (skip si shallow clone CI)', () => {
    const shallow = execSync('git rev-parse --is-shallow-repository', {
      encoding: 'utf-8',
      cwd: root,
    }).trim();
    if (shallow === 'true') {
      // actions/checkout@v4 défaut depth=1 — le lock porte sur le dépôt complet
      return;
    }
    const n = Number(
      execSync('git rev-list --count HEAD', { encoding: 'utf-8', cwd: root }).trim(),
    );
    expect(n).toBeGreaterThan(1);
  });

  it('audits/bilans racine migrés vers docs/', () => {
    const rootAudits = [
      'AUDIT_QUALITE_2026-09-22.md',
      'AUDIT_RENOMMAGE_MIFTAH_2026-09-22.md',
      'BILAN_PROPOSITION_MIFTAH_OS_VS_CONTRAT_REEL.md',
      'architecture_integration_plan.md',
    ];
    for (const f of rootAudits) {
      expect(files).not.toContain(f);
      expect(existsSync(join(root, 'docs', f))).toBe(true);
    }
  });

  it('dumps non-code non trackés à la racine', () => {
    expect(files).not.toContain('المكتبة_الكاملة_SVT.md');
    expect(files).not.toContain('الملخص_الشامل_لآليات_تركيب_البروتين.jpg');
  });

  it('pas de *.patch sur disque à la racine (dette fantôme)', () => {
    const rootEntries = readdirSync(root);
    const patches = rootEntries.filter((e) => e.endsWith('.patch'));
    expect(patches).toEqual([]);
  });
});
