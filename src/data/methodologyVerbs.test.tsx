import { describe, expect, it } from 'vitest';
import { METHODOLOGY_VERBS } from './methodologyVerbs';

describe('METHODOLOGY_VERBS', () => {
  it('aligne les six cartes principales sur les six réflexes canoniques', () => {
    expect(METHODOLOGY_VERBS.map((verb) => verb.id)).toEqual([
      'analyse',
      'interpret',
      'compare',
      'hypothesize',
      'explain',
      'validate',
    ]);
  });

  it('n expose plus deduce ni justify comme verbes principaux', () => {
    const ids = METHODOLOGY_VERBS.map((verb) => verb.id);
    expect(ids).not.toContain('deduce');
    expect(ids).not.toContain('justify');
  });
});
