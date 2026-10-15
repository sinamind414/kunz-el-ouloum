// MarqueDocument.test.tsx — le pied de page imprimé : présent, invisible à
// l'écran, et honnête pour un invité.
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import MarqueDocument from '../MarqueDocument';
import { marqueDepuisIdentite } from '../../utils/marque';

function jetonElve(studentId: string): string {
  const payload = Buffer.from(JSON.stringify({ studentId }))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `entete.${payload}.signature`;
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('MarqueDocument — pied de page de traçabilité', () => {
  it('affiche la marque de l’élève connecté', () => {
    localStorage.setItem('boussole_token', jetonElve('eleve-42'));
    render(<MarqueDocument />);
    const bloc = screen.getByTestId('marque-document');
    expect(bloc.textContent).toContain(marqueDepuisIdentite('eleve-42')!);
  });

  it('est INVISIBLE à l’écran et VISIBLE à l’impression', () => {
    localStorage.setItem('boussole_token', jetonElve('eleve-42'));
    render(<MarqueDocument />);
    const classes = screen.getByTestId('marque-document').className;
    // À l'écran, la marque n'apporte rien à l'élève : elle encombrerait.
    expect(classes).toContain('hidden');
    expect(classes).toContain('print:block');
  });

  it('porte le titre du document quand on le lui donne', () => {
    localStorage.setItem('boussole_token', jetonElve('eleve-42'));
    render(<MarqueDocument document="موضوع تجريبي" />);
    expect(screen.getByTestId('marque-document').textContent).toContain('موضوع تجريبي');
  });

  it('pour un INVITÉ : dit que la copie n’est pas traçable, n’invente pas de marque', () => {
    render(<MarqueDocument />);
    const texte = screen.getByTestId('marque-document').textContent ?? '';
    expect(texte).toContain('غير قابلة للتتبع');
    expect(texte).not.toContain('KZ-');
  });

  it('ne divulgue aucun identifiant de connexion', () => {
    localStorage.setItem('boussole_token', jetonElve('AB12-CD34@eleve.local'));
    render(<MarqueDocument />);
    const texte = screen.getByTestId('marque-document').textContent ?? '';
    expect(texte).not.toContain('AB12-CD34');
    expect(texte).not.toContain('eleve.local');
    expect(texte).toContain('KZ-');
  });
});
