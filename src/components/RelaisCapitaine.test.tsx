// RelaisCapitaine.test.tsx — LA CARTE FAIT CE QU'ELLE DIT, ET RIEN DE PLUS.
//
// Trois choses sont vérifiées ici, parce qu'elles se jouent dans le composant et
// nulle part ailleurs :
//
//   1. LA QUESTION SE DATE À L'AFFICHAGE. `demandeMs` est écrit quand la carte est
//      réellement montée — pas quand elle est calculée. C'est ce qui garantit le
//      « une seule fois » et empêche qu'une question jamais vue soit consommée ;
//   2. ÉCRIRE, C'EST TOUT. Un nom dans le champ devient un nom dans le stockage
//      local ; « نعم », « لا » et « لا أريد » ne font rien d'autre ;
//   3. RIEN NE SORT. Aucun appel réseau n'existe dans ce chemin — c'est la
//      promesse de l'étape 5, et elle se vérifie.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RelaisCapitaine from './RelaisCapitaine';
import {
  QUESTION_RELAIS_AR,
  RELAIS_VIDE,
  lireRelais,
  phraseRelanceAr,
  type QuestionRelais,
} from '../lib/relais';

const NOMINATION: QuestionRelais = { genre: 'nomination', questionAr: QUESTION_RELAIS_AR };
const RELANCE: QuestionRelais = { genre: 'relance', nom: 'أستاذي', questionAr: phraseRelanceAr('أستاذي') };

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('la carte du relais — nomination', () => {
  it('rien à demander : rien à l’écran', () => {
    const { container } = render(<RelaisCapitaine question={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('la question affichée est datée : elle ne sera plus jamais une question neuve', () => {
    render(<RelaisCapitaine question={NOMINATION} />);
    expect(lireRelais().demandeMs).not.toBeNull();
    expect(lireRelais().nom).toBeNull();
    expect(screen.getByText(QUESTION_RELAIS_AR)).toBeTruthy();
  });

  it('un nom écrit devient un nom gardé — localement, et pas ailleurs', () => {
    const onFait = vi.fn();
    render(<RelaisCapitaine question={NOMINATION} onFait={onFait} />);
    fireEvent.change(screen.getByTestId('relais-nom'), { target: { value: 'أستاذي' } });
    fireEvent.click(screen.getByTestId('relais-nommer'));
    expect(lireRelais().nom).toBe('أستاذي');
    expect(lireRelais().nommeMs).not.toBeNull();
    expect(onFait).toHaveBeenCalled();
  });

  it('un champ vide ne nomme personne', () => {
    render(<RelaisCapitaine question={NOMINATION} />);
    fireEvent.change(screen.getByTestId('relais-nom'), { target: { value: '   ' } });
    fireEvent.click(screen.getByTestId('relais-nommer'));
    expect(lireRelais().nom).toBeNull();
  });

  it('« لا أريد » : la question ne reviendra pas, et le nom n’est pas gardé', () => {
    const onFait = vi.fn();
    render(<RelaisCapitaine question={NOMINATION} onFait={onFait} />);
    fireEvent.click(screen.getByTestId('relais-refus'));
    expect(lireRelais().refusMs).not.toBeNull();
    expect(lireRelais().nom).toBeNull();
    expect(onFait).toHaveBeenCalled();
  });
});

describe('la carte du relais — la relance', () => {
  beforeEach(() => {
    localStorage.setItem(
      'boussole_relais_v1',
      JSON.stringify({ ...RELAIS_VIDE, nom: 'أستاذي', demandeMs: 1, nommeMs: 1 }),
    );
  });

  it('la phrase porte le nom, et la question est datée elle aussi', () => {
    render(<RelaisCapitaine question={RELANCE} />);
    expect(screen.getByText(phraseRelanceAr('أستاذي'))).toBeTruthy();
    expect(lireRelais().relanceMs).not.toBeNull();
  });

  it('« نعم » — et rien d’autre : aucun compteur ne bouge', () => {
    const onFait = vi.fn();
    render(<RelaisCapitaine question={RELANCE} onFait={onFait} />);
    fireEvent.click(screen.getByTestId('relais-oui'));
    expect(lireRelais().reponse).toBe('oui');
    expect(onFait).toHaveBeenCalled();
  });

  it('« لا » — même silence, même absence de conséquence', () => {
    render(<RelaisCapitaine question={RELANCE} />);
    fireEvent.click(screen.getByTestId('relais-non'));
    expect(lireRelais().reponse).toBe('non');
  });

  it('« امسح الاسم » efface le nom ET ferme la question', () => {
    render(<RelaisCapitaine question={RELANCE} />);
    fireEvent.click(screen.getByTestId('relais-effacer'));
    expect(lireRelais().nom).toBeNull();
    expect(lireRelais().refusMs).not.toBeNull();
  });
});
