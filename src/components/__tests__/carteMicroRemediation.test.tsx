// carteMicroRemediation.test.tsx — LA CARTE MONTRE LE CORPUS, RIEN D'AUTRE.
//
// Garde-fou anti-dérive : tout ce qui s'affiche doit venir INTEGRALEMENT de
// l'entrée `MicroRemediation` passée en prop. Un texte reformulé ici créerait
// une seconde source qui divergerait en silence du corpus. Le test fixe donc
// des extraits EXACTS d'une entrée réelle (mr_method_analysis_interp).

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import CarteMicroRemediation from '../CarteMicroRemediation';
import { MICRO_REMEDIATIONS } from '../../data/microRemediations';

const REMEDE = MICRO_REMEDIATIONS['method_analysis_interp']!;

afterEach(cleanup);

describe('CarteMicroRemediation — affichage verbatim', () => {
  it('affiche le titre, l’explication et la question active du corpus', () => {
    render(<CarteMicroRemediation remediation={REMEDE} />);

    expect(screen.getByTestId('carte-micro-remediation')).toBeTruthy();
    // Titre et explication : des EXTRAITS exacts du corpus, pas des paraphrases.
    expect(screen.getByText(REMEDE.titleAr)).toBeTruthy();
    expect(document.body.textContent).toContain(REMEDE.explanationAr.slice(0, 40));
    // La question active est précédée du glyphe ✍️ dans le même paragraphe :
    // on vérifie le contenu verbatim, pas l'égalité exacte du nœud.
    expect(document.body.textContent).toContain(REMEDE.activeQuestionAr);
  });

  it('affiche la durée estimée avec son unité (la promesse « c’est court » se lit d’abord)', () => {
    render(<CarteMicroRemediation remediation={REMEDE} />);
    expect(screen.getByText(`${REMEDE.estimatedMinutes} د`)).toBeTruthy();
  });
});
