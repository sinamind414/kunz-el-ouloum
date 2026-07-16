// ValidationEngine.test.ts
// Spec vitest (Speckit §9 / §12). Exécutée par `npm run test:vitest`.
import { describe, it, expect } from 'vitest';
import { runValidationTests } from './validationTests';

describe('ValidationEngine T1–T12', () => {
  const results = runValidationTests();
  for (const r of results) {
    it(`${r.id} · ${r.desc} — ${r.detail}`, () => {
      expect(r.pass, `${r.id} a échoué: ${r.info}`).toBe(true);
    });
  }
});
