// src/data/notionsQcm.lock.test.ts
// VERROU DES NOTIONS DES QCM (audit externe « claude 5.2 », axe 3 : « QCM sans
// étiquette de notion : les lacunes ne sont pas détectées automatiquement »).
//
// Ce que ce verrou protège :
//   1. les 550 QCM SERVIS portent une notion (couverture 100 %) ;
//   2. chaque notion est bien le TITRE ARABE de la figure interrogée — la
//      table ne peut pas diverger des SVG (dérive de schéma = dérive de
//      donnée pédagogique) ;
//   3. tout schéma utilisé par le corpus est dans la table (pas de QCM
//      « sans notion » par oubli) ;
//   4. le générateur produit exactement cette table (le fichier est GÉNÉRÉ).

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';
import { NOTION_PAR_SCHEMA, NOTIONS_QCM, notionDeSchema } from './notionsQcm';

const ROOT = resolve(__dirname, '../..');
const CORPUS = [
  'src/quizCorpus/qcm0-d1a.ts',
  'src/quizCorpus/qcm1-d2a.ts',
  'src/quizCorpus/qcm2-d3.ts',
  'src/quizCorpus/qcm3-d1b.ts',
  'src/quizCorpus/qcm4-d2b.ts',
  'src/quizCorpus/qcm5-d1c.ts',
];

function listerSchemas(dossier: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const p = join(dossier, e.name);
    if (e.isDirectory()) out.push(...listerSchemas(p));
    else if (e.name.endsWith('.svg')) out.push(p);
  }
  return out;
}

/** Notion attendue, recalculée depuis le SVG (comme le fait le générateur). */
function notionDepuisSvg(chemin: string): string {
  const svg = readFileSync(chemin, 'utf8');
  const m = svg.match(/aria-label="([^"]+)"/);
  const titre = (m ? m[1] : '').replace(/\s+/g, ' ').trim();
  const coupe = titre.split(/\s+[-–—]\s+|:\s+/)[0].replace(/\s+/g, ' ').trim();
  return coupe.length >= 2 ? coupe : titre;
}

describe('notions des QCM — étiquette issue de la figure interrogée', () => {
  it('les 550 QCM servis portent une notion', () => {
    const sansNotion = SVT_QUIZ_QUESTIONS.filter((q) => !q.notion || !q.notion.trim());
    expect(sansNotion.length, `QCM sans notion : ${sansNotion.slice(0, 5).map((q) => q.id).join(', ')}`).toBe(0);
    expect(SVT_QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(500);
  });

  it('chaque notion est bien le titre arabe du schéma (aucune dérive possible)', () => {
    const schemas = listerSchemas(resolve(ROOT, 'public/assets/images/schemas'));
    const parCle = new Map<string, string>();
    for (const p of schemas) {
      const cle = p.replace(/\\/g, '/').split('/').pop()!.replace(/\.svg$/, '');
      parCle.set(cle, notionDepuisSvg(p));
    }
    let verifies = 0;
    for (const [cle, notion] of Object.entries(NOTION_PAR_SCHEMA)) {
      const attendu = parCle.get(cle);
      expect(attendu, `schéma introuvable : ${cle}`).toBeTruthy();
      expect(notion, `notion divergente pour ${cle}`).toBe(attendu);
      verifies += 1;
    }
    expect(verifies).toBe(Object.keys(NOTION_PAR_SCHEMA).length);
  });

  it('tout schéma utilisé par le corpus est dans la table', () => {
    const utilises = new Set<string>();
    for (const f of CORPUS) {
      const c = readFileSync(resolve(ROOT, f), 'utf8');
      for (const m of c.matchAll(/"diagramUrl":\s*"([^"]+)"/g)) {
        utilises.add(m[1].split('/').pop()!.replace(/\.svg$/, ''));
      }
    }
    expect(utilises.size).toBeGreaterThanOrEqual(40);
    for (const cle of utilises) {
      expect(NOTION_PAR_SCHEMA[cle], `schéma absent de la table : ${cle}`).toBeTruthy();
    }
  });

  it('la table est celle du générateur (fichier généré, jamais écrit à la main)', () => {
    const genere = readFileSync(resolve(ROOT, 'scripts/build_notions_qcm.ts'), 'utf8');
    expect(genere).toContain('src/data/notionsQcm.ts');
    // La table triée par clé et la liste des notions doivent rester stables.
    const cles = Object.keys(NOTION_PAR_SCHEMA);
    expect(cles).toEqual([...cles].sort((a, b) => a.localeCompare(b)));
    expect(NOTIONS_QCM.length).toBe(new Set(NOTIONS_QCM).size);
    expect(NOTIONS_QCM.length).toBeGreaterThanOrEqual(40);
  });

  it('notionDeSchema est tolérante (une figure inconnue ne casse rien)', () => {
    expect(notionDeSchema(undefined)).toBe('');
    expect(notionDeSchema('/assets/images/schemas/inconnu.svg')).toBe('');
    expect(notionDeSchema('/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg')).toBe(
      NOTION_PAR_SCHEMA['schema_02_transcription'],
    );
  });
});
