// corpusLoader.test.ts — chargement différé du corpus (sprint 31).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetCorpusCache, loadCorpus, peekCorpus, prefetchCorpusWhenIdle } from './corpusLoader';

beforeEach(() => __resetCorpusCache());

describe('chargement différé du corpus', () => {
  it('ne connaît rien avant la première demande', () => {
    expect(peekCorpus()).toBeNull();
  });

  it('charge les 549 QCM et les flashcards à la demande', async () => {
    const corpus = await loadCorpus();
    expect(corpus.questions.length).toBe(549);
    expect(corpus.flashcards.length).toBeGreaterThan(100);
    expect(peekCorpus()).toBe(corpus);
  });

  it('ne télécharge qu’une fois, même sur appels concurrents', async () => {
    const [a, b, c] = await Promise.all([loadCorpus(), loadCorpus(), loadCorpus()]);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('sert le cache sans repasser par l’import', async () => {
    const premier = await loadCorpus();
    expect(await loadCorpus()).toBe(premier);
  });

  it('précharge au repos via requestIdleCallback quand il existe', () => {
    const ric = vi.fn((cb: () => void) => cb());
    vi.stubGlobal('requestIdleCallback', ric);
    prefetchCorpusWhenIdle();
    expect(ric).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('se rabat sur un délai quand requestIdleCallback manque', () => {
    vi.stubGlobal('requestIdleCallback', undefined);
    vi.useFakeTimers();
    prefetchCorpusWhenIdle();
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});
