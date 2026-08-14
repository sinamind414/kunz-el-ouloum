// #59 — « Validation enseignant » : un mode sans authentification.
// N'importe quel élève ouvre « وضع الأستاذ » depuis l'onglet progrès, tape le
// nom qu'il veut et publie du contenu qui lui est ensuite servi comme
// « مراجعة: <nom> ». Ces tests fixent les deux garde-fous possibles hors
// authentification : refuser les métadonnées non plausibles, et ne jamais
// présenter une revue locale comme une validation externe.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import SurvivalCardView from './SurvivalCardView';
import EditorialReviewPanel from './EditorialReviewPanel';
import { SURVIVAL_CARDS, getPublishableSurvivalCards, getPublishableSurvivalCardById } from '../data/survivalCards';
import { setReviewOverride } from '../services/editorialReviewService';
import { isCardPublishable } from '../types/survivalCard';
import type { SurvivalCard } from '../types/survivalCard';

const baseCard = (): SurvivalCard => ({ ...SURVIVAL_CARDS[0] });

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('#59 — plausibilité des métadonnées de revue', () => {
  it('refuse un relecteur vide ou réduit à des espaces', () => {
    expect(isCardPublishable({
      ...baseCard(),
      review: { reviewed: true, reviewedBy: '   ', reviewedAt: '2026-01-01T00:00:00Z', sourceProgram: 'BAC DZ' },
    })).toBe(false);
  });

  it('refuse une revue datée dans le futur', () => {
    expect(isCardPublishable({
      ...baseCard(),
      review: { reviewed: true, reviewedBy: 'أستاذة سميرة', reviewedAt: '3000-01-01T00:00:00Z', sourceProgram: 'BAC DZ' },
    })).toBe(false);
  });

  it('refuse une date illisible', () => {
    expect(isCardPublishable({
      ...baseCard(),
      review: { reviewed: true, reviewedBy: 'أستاذة سميرة', reviewedAt: 'pas-une-date', sourceProgram: 'BAC DZ' },
    })).toBe(false);
  });

  it('accepte une revue complète et datée dans le passé', () => {
    expect(isCardPublishable({
      ...baseCard(),
      review: { reviewed: true, reviewedBy: 'أستاذة سميرة', reviewedAt: '2026-01-01T00:00:00Z', sourceProgram: 'BAC DZ' },
    })).toBe(true);
  });

  it('une carte publiée avec un nom blanc n’est pas servie à l’élève', () => {
    const target = SURVIVAL_CARDS[0];
    setReviewOverride('survival_card', target.id, {
      reviewed: true, reviewedBy: ' ', reviewedAt: '2026-01-01T00:00:00Z', sourceProgram: 'x',
    });
    expect(getPublishableSurvivalCardById(target.id)).toBeUndefined();
    expect(getPublishableSurvivalCards()).toHaveLength(0);
  });
});

describe('#59 — une revue locale ne se présente pas comme une autorité', () => {
  it('qualifie la revue déclarée localement au lieu de la signer', () => {
    const card = baseCard();
    card.review = {
      reviewed: true, reviewedBy: 'أنا التلميذ', reviewedAt: '2026-01-01T00:00:00Z',
      sourceProgram: 'برنامج مخترع', locallyDeclared: true,
    };
    render(<SurvivalCardView card={card} />);
    const origin = screen.getByTestId('survival-card-review-origin').textContent ?? '';
    expect(origin).toContain('مراجعة محلية على هذا الجهاز');
    expect(origin).toContain('غير موثقة');
    // Le programme inventé ne doit pas être affiché comme une caution.
    expect(origin).not.toContain('برنامج مخترع');
  });

  it('affiche la mention classique pour une revue livrée avec l’application', () => {
    const card = baseCard();
    card.review = { reviewed: true, reviewedBy: 'أستاذة سميرة', reviewedAt: '2026-01-01T00:00:00Z', sourceProgram: 'BAC DZ' };
    render(<SurvivalCardView card={card} />);
    const origin = screen.getByTestId('survival-card-review-origin').textContent ?? '';
    expect(origin).toContain('أستاذة سميرة');
    expect(origin).not.toContain('مراجعة محلية');
  });

  it('marque locallyDeclared toute publication faite depuis le mode enseignant', () => {
    render(<EditorialReviewPanel />);
    fireEvent.click(screen.getByText('نشر الكل'));
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('kunz_review_v2:'));
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) {
      expect(JSON.parse(localStorage.getItem(k)!).locallyDeclared).toBe(true);
    }
  });

  it('avertit que le mode enseignant n’est pas protégé', () => {
    render(<EditorialReviewPanel />);
    const notice = screen.getByTestId('editorial-local-only-notice').textContent ?? '';
    expect(notice).toContain('غير محمي بكلمة سر');
    expect(notice).toContain('مراجعة محلية على هذا الجهاز');
  });
});

describe('#59 — un aller-retour export/import ne blanchit pas une signature', () => {
  it('force locallyDeclared sur tout override importé', () => {
    // Le fichier de sauvegarde est un JSON éditable à la main : on lit le
    // source pour prouver que l'import n'y fait pas confiance. Chemin de
    // rendu non observable en jsdom, donc assertion au niveau de la source.
    const src = readFileSync(resolve(process.cwd(), 'src/services/progressionTransferService.ts'), 'utf8');
    const importBlock = src.slice(src.indexOf('if (file.data.editorialOverrides)'));
    expect(importBlock).toContain('locallyDeclared: true');
    // et surtout : pas de recopie brute de la valeur importée.
    expect(importBlock).not.toContain('replacement.set(key, JSON.stringify(value));');
  });
});
