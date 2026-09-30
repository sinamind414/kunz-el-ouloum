// MotivationDeclic.test.tsx — verrous de la brique MOTIVATION (module Déclic).
//
// Le Déclic s'affiche AVANT une session pour vaincre la procrastination
// (docs/INTEGRATION_FOCUS_MOTIVATION.md §5). On fige ici les comportements
// qui font son utilité : message actionnable, non-répétition immédiate,
// démarrage de session, et badge de série.

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MotivationDeclic from '../MotivationDeclic';
import { MOTIVATION_CAPSULES } from '../../data/motivationCapsules';

// Le module retient le dernier déclic montré (kunz_declic_last_id_v1) :
// on isole chaque test pour que le tirage reste déterministe.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('module Déclic — motivation', () => {
  it('affiche un message de la banque (contenu, pas un placeholder)', () => {
    render(<MotivationDeclic />);
    const texte = screen.getByTestId('motivation-declic').textContent ?? '';
    const match = MOTIVATION_CAPSULES.some((c) => texte.includes(c.texteAr));
    expect(match, 'le texte affiché doit venir de MOTIVATION_CAPSULES').toBe(true);
  });

  it('« رسالة أخرى » ne répète pas le dernier message montré', () => {
    // Math.random() = 0 → tire toujours le PREMIER candidat du pool.
    // Le contrat réel est la non-répétition immédiate (pickCapsule exclut le
    // dernier id montré via kunz_declic_last_id_v1). AnimatePresence
    // retardant le swap visuel, on vérifie le changement sur la clé persistée.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      render(<MotivationDeclic />);
      const avant = localStorage.getItem('kunz_declic_last_id_v1');
      fireEvent.click(screen.getByText('رسالة أخرى'));
      const apres = localStorage.getItem('kunz_declic_last_id_v1');
      expect(apres, 'un nouveau déclic doit être tiré, différent du précédent').not.toBe(avant);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('« ابدأ الآن » appelle onStart exactement une fois', () => {
    const onStart = vi.fn();
    render(<MotivationDeclic onStart={onStart} />);
    fireEvent.click(screen.getByText('ابدأ الآن'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('« جلسة تركيز » appelle onStartFocus quand il est fourni', () => {
    const onStartFocus = vi.fn();
    render(<MotivationDeclic onStartFocus={onStartFocus} />);
    fireEvent.click(screen.getByText('جلسة تركيز'));
    expect(onStartFocus).toHaveBeenCalledTimes(1);
  });

  it('n\'affiche pas le bouton de focus si onStartFocus est absent', () => {
    render(<MotivationDeclic />);
    expect(screen.queryByText('جلسة تركيز')).toBeNull();
  });

  it('affiche le badge de série dès que streakDays >= 1', () => {
    render(<MotivationDeclic streakDays={5} />);
    expect(screen.getByText('5 يوم')).toBeTruthy();
  });

  it('n\'affiche aucun badge de série à streakDays = 0', () => {
    render(<MotivationDeclic streakDays={0} />);
    expect(screen.queryByText(/يوم$/)).toBeNull();
  });
});
