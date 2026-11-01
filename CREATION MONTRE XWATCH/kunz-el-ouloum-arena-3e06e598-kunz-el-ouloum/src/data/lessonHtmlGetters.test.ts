// lessonHtmlGetters.test.ts — M1 (audit 8 axes 2026-10-14, P1) :
// « Supprimer le double embarquement des leçons : chaque leçon existe en
// public/lessons/*.html ET en chunk JS ?raw — ~4,3 Mo téléchargés et stockés
// deux fois sur un téléphone bas de gamme. Garder une seule source de vérité. »
//
// La source unique restera public/lessons/*.html (précachée par le SW —
// verrou swPrecacheComplet.test.ts) ; les getters la CONSULTENT par fetch :
// hors ligne, le SW sert le cache ; dans le bundle, plus un seul octet de
// leçon dupliqué. Le contrat HtmlLessonViewer est inchangé :
// Promise<{ default: string }>, rejet → message d'erreur du viewer.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LESSON_HTML_GETTERS } from './lessonHtmlGetters';

const PUBLIC = resolve(__dirname, '../../public');

describe('les getters lisent la source unique par fetch (M1)', () => {
  const urlsAppelées: string[] = [];

  beforeEach(() => {
    urlsAppelées.length = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        urlsAppelées.push(String(url));
        const fichier = String(url).replace(/^.*\/lessons\//, '');
        const texte = readFileSync(resolve(PUBLIC, 'lessons', decodeURIComponent(fichier)), 'utf8');
        return Promise.resolve(new Response(texte, { status: 200 }));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('un getter fetch /lessons/<fichier> et rend { default: html } sans réimport ?raw', async () => {
    const mod = await LESSON_HTML_GETTERS.phase1_chapitres_1_2();
    expect(urlsAppelées).toEqual(['/lessons/phase1_chapitres_1_2.html']);
    expect(mod.default.startsWith('<!DOCTYPE html')).toBe(true);
  });

  it('les deux clés d un fichier à 2 chapitres fetchent le MÊME fichier (slice, pas copie)', async () => {
    await LESSON_HTML_GETTERS.phase1_chapitres_1_2();
    await LESSON_HTML_GETTERS.phase1_chapitres_1_2_2();
    expect(urlsAppelées).toEqual([
      '/lessons/phase1_chapitres_1_2.html',
      '/lessons/phase1_chapitres_1_2.html',
    ]);
  });

  it('fichier 404 → promesse rejetée (le viewer affiche son message, pas de faux blanc)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('nop', { status: 404 }))),
    );
    await expect(LESSON_HTML_GETTERS.lecon_transcription()).rejects.toThrow(/404/);
  });
});
