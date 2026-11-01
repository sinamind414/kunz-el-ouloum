// marqueExport.test.ts — LE POINT QUI DÉCIDE SI A3 SERT À QUELQUE CHOSE.
//
// Une marque sans correspondance est un décor. Pour que le professeur puisse
// remonter d'un document qui circule jusqu'à l'élève, il faut que la marque
// apposée sur le document (calculée côté navigateur) soit EXACTEMENT celle de
// la colonne `marque` de son export CSV (calculée côté serveur).
//
// Cette égalité tient à une chaîne de trois maillons, testés ici un par un :
//   1. le jeton élève contient `studentId` = l'identifiant du store ;
//   2. `identiteCourante()` (navigateur) lit ce `studentId` ;
//   3. le CSV (serveur) marque à partir du même identifiant.
// Si un maillon casse, les deux marques divergent et plus rien ne se retrouve.

import { describe, expect, it, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { marqueDepuisIdentite } from '../utils/marque';
import { identiteCourante } from '../utils/activityLog';

const lire = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf-8');

/** Jeton JWT factice (non signé) portant le même payload que le vrai. */
function jetonElve(studentId: string): string {
  const payload = Buffer.from(JSON.stringify({ studentId, email: 'x@y.z' }))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `entete.${payload}.signature`;
}

beforeEach(() => {
  localStorage.clear();
});

describe('chaîne de correspondance marque ↔ élève', () => {
  it('le jeton élève porte bien `studentId` = identifiant du store', () => {
    const serveur = lire('server.ts');
    // Les DEUX créations de jeton élève (inscription classique et inscription
    // sans e-mail) doivent passer l'identifiant du store, pas autre chose.
    expect(serveur).toContain('jwt.sign({ studentId: student.id, email: student.email }');
    expect(serveur).toContain('signer: (eleve: { studentId: string; email: string })');
  });

  it('le navigateur lit ce même `studentId`', () => {
    localStorage.setItem('boussole_token', jetonElve('eleve-abc'));
    expect(identiteCourante()).toBe('eleve-abc');
  });

  it('les deux côtés calculent LA MÊME marque pour le même élève', () => {
    localStorage.setItem('boussole_token', jetonElve('eleve-abc'));
    const coteNavigateur = marqueDepuisIdentite(identiteCourante());
    // Côté serveur, la fonction est appelée avec `studentId` (élève seul) et
    // `row.id` (export complet) — la même valeur.
    const coteServeur = marqueDepuisIdentite('eleve-abc');
    expect(coteNavigateur).toBe(coteServeur);
    expect(coteNavigateur).toMatch(/^KZ-[0-9A-F]{6}$/);
  });

  it('un invité n’aurait aucune marque à retrouver — et c’est écrit', () => {
    expect(identiteCourante()).toBe('invite');
    expect(marqueDepuisIdentite(identiteCourante())).toBeNull();
  });
});

describe('l’export CSV du professeur porte la marque', () => {
  it('la colonne `marque` existe dans l’en-tête, à côté de `code`', () => {
    const serveur = lire('server.ts');
    const entete = /res\.write\(\[([^\]]*)\]\.join\(";"\)/.exec(serveur)?.[1] ?? '';
    expect(entete).toContain('"marque"');
    expect(entete).toContain('"code"');
    expect(entete).toContain('"name"');
  });

  it('les DEUX lignes d’export (un élève / flux complet) écrivent la marque', () => {
    const serveur = lire('server.ts');
    // Un seul élève : identifiant de la requête.
    expect(serveur).toContain('csvCell(marqueDepuisIdentite(studentId) || "")');
    // Flux complet : identifiant de la ligne SQL.
    expect(serveur).toContain('csvCell(marqueDepuisIdentite(row.id) || "")');
  });

  it('l’en-tête et les DEUX lignes ont le même nombre de colonnes', () => {
    const serveur = lire('server.ts');
    const nbEntete = /res\.write\(\[([^\]]*)\]\.join\(";"\)/.exec(serveur)![1].split(',').length;
    expect(nbEntete).toBe(11);

    /**
     * Compte les cellules d'un tableau littéral : virgules au NIVEAU 0 de
     * profondeur (une virgule à l'intérieur d'un appel `csvCell(a, b)` ne compte
     * pas). Compte des `csvCell(` ne suffit pas : les cellules « 1/0 » sont des
     * ternaires nus.
     */
    function cellules(litteral: string): number {
      let profondeur = 0;
      let virgules = 0;
      for (const c of litteral) {
        if (c === '(' || c === '[' || c === '{') profondeur += 1;
        else if (c === ')' || c === ']' || c === '}') profondeur -= 1;
        else if (c === ',' && profondeur === 0) virgules += 1;
      }
      return virgules + 1;
    }

    const lignes = [
      /res\.write\(\[(.*?)\]\.join/s.exec(serveur)![1], // en-tête
      /res\.write\(\[csvCell\(cellId\)(.*?)\]\.join/s.exec(serveur)![1],
      /res\.write\(\[csvCell\(row\.id\)(.*?)\]\.join/s.exec(serveur)![1],
    ];
    // La capture commence par la virgule qui suit `cellId` : on restitue la
    // cellule écrasée dans le motif (`cellId` / `row.id`) sans doubler la virgule.
    lignes[1] = `x${lignes[1]}`;
    lignes[2] = `x${lignes[2]}`;
    for (const ligne of lignes) {
      expect(cellules(ligne), `ligne : ${ligne.slice(0, 50)}…`).toBe(nbEntete);
    }
  });});

describe('le module de marque reste utilisable côté serveur', () => {
  it('il n’accède NI à localStorage, NI au DOM (sinon le serveur planterait)', () => {
    const source = lire('src/utils/marque.ts');
    // On ignore les commentaires : ils CITENT le danger pour l'expliquer.
    const code = source
      .split('\n')
      .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .join('\n');
    for (const interdit of ['localStorage', 'sessionStorage', 'window.', 'document.']) {
      expect(code, `accès interdit dans marque.ts : ${interdit}`).not.toContain(interdit);
    }
  });

  it('le serveur importe bien ce module (et non une copie)', () => {
    const serveur = lire('server.ts');
    expect(serveur).toContain('import { marqueDepuisIdentite } from "./src/utils/marque"');
  });
});

describe('couverture des documents qui sortent', () => {
  const VUES_IMPRIMABLES = [
    'src/components/MockExamPanel.tsx',
    'src/components/RevisionPlanView.tsx',
    'src/components/WritingReportSheet.tsx',
    'src/components/MethodologyCompilerView.tsx',
    'src/components/OkachaView.tsx',
  ];

  it('chaque vue imprimable porte le pied de page de traçabilité', () => {
    for (const vue of VUES_IMPRIMABLES) {
      const src = lire(vue);
      expect(src, `${vue} : import manquant`).toContain("from './MarqueDocument'");
      expect(src, `${vue} : <MarqueDocument /> absent`).toContain('<MarqueDocument');
    }
  });

  it('les images partagées sont marquées AVANT l’export', () => {
    const stats = lire('src/components/StatsView.tsx');
    const partage = lire('src/components/WeeklyReportShareModal.tsx');
    for (const [nom, src] of [['StatsView', stats], ['WeeklyReportShareModal', partage]] as const) {
      const marque = src.indexOf('apposerMarqueCanvas(');
      const exportation = Math.max(src.indexOf('toDataURL('), src.indexOf('toDataURL('));
      expect(marque, `${nom} : marque absente`).toBeGreaterThan(0);
      expect(exportation, `${nom} : export absent`).toBeGreaterThan(0);
      expect(marque, `${nom} : la marque doit être apposée AVANT toDataURL`).toBeLessThan(exportation);
    }
  });
});
