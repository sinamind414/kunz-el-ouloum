// TadwinView.test.tsx — parcours des 5 paliers de التدوين الشامل (Spec §5).
//
// Convention repo : pas de @testing-library/jest-dom → .toBeTruthy() /
// .toBeNull() / .toHaveLength(). cleanup() explicite après chaque test.
// L'état persiste en localStorage entre les renders → on clear avant chaque.

import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import TadwinView from '../TadwinView';

// Réponse modèle couvrant 2 clés de l'unité 1 (prose فصحًى naturelle).
const REPONSE_2_CLES =
  'تتمثل المرحلة الأولى من التعبير المورثي في استنساخ المعلومة الوراثية داخل النواة، ' +
  'حيث تتدخل إنزيمة ARN بوليميراز لتركيب جزيئة ARNm انطلاقاً من إحدى سلسلتي ADN.';

const REPONSE_0_CLE = 'درس شيّق يتحدث عن البروتين وأهميته في الجسم.';

beforeEach(() => {
  localStorage.clear();
});

afterEach(cleanup);

/** Enchaîne démarrage + restitution : l'entrée du palier 1 (message الصدمة). */
async function jusquauPalier1() {
  render(<TadwinView onBackToHome={() => {}} />);
  expect(screen.getByTestId('tadwin-demarrer')).toBeTruthy();
  await fireEvent.click(screen.getByTestId('tadwin-demarrer'));

  // Palier 0 : restitution (la preuve de l'oubli).
  await fireEvent.change(screen.getByTestId('tadwin-restitution'), {
    target: { value: 'استنساخ وترجمة' },
  });
  await fireEvent.click(screen.getByTestId('tadwin-restitution-envoyer'));
}

/** Enchaîne les 4 transitions de palier pour atteindre le palier 3. */
async function jusquauPalier3() {
  // Entrée : démarrage du défi 3 jours.
  render(<TadwinView onBackToHome={() => {}} />);
  expect(screen.getByTestId('tadwin-demarrer')).toBeTruthy();
  await fireEvent.click(screen.getByTestId('tadwin-demarrer'));

  // Palier 0 : restitution (la preuve de l'oubli).
  await fireEvent.change(screen.getByTestId('tadwin-restitution'), {
    target: { value: 'استنساخ وترجمة' },
  });
  await fireEvent.click(screen.getByTestId('tadwin-restitution-envoyer'));

  // Palier 1 : clé mécanisme dans le gabarit pré-rempli.
  await fireEvent.change(screen.getByTestId('tadwin-cle1'), {
    target: { value: 'يتم الاستنساخ في النواة' },
  });
  await fireEvent.click(screen.getByTestId('tadwin-cle1-envoyer'));

  // Palier 2 : pratique assistée.
  await fireEvent.change(screen.getByTestId('tadwin-assistee'), {
    target: { value: 'الزبدة: استنساخ ثم ترجمة' },
  });
  await fireEvent.click(screen.getByTestId('tadwin-assistee-envoyer'));
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. Écran d'entrée — défi 3 jours + choix de l'unité
// ──────────────────────────────────────────────────────────────────────────────

describe('TadwinView — entrée du module', () => {
  it('affiche le défi 3 jours et le sélecteur d\'unité', () => {
    render(<TadwinView onBackToHome={() => {}} />);
    expect(screen.getByTestId('tadwin-demarrer')).toBeTruthy();
    expect(screen.getByTestId('tadwin-unite-select')).toBeTruthy();
  });

  it('le bouton de démarrage est absent tant que le défi n\'est pas lancé', () => {
    render(<TadwinView onBackToHome={() => {}} />);
    expect(screen.queryByTestId('tadwin-restitution')).toBeNull();
  });

  it('changer d\'unité est possible avant de démarrer', async () => {
    render(<TadwinView onBackToHome={() => {}} />);
    fireEvent.change(screen.getByTestId('tadwin-unite-select'), { target: { value: '5' } });
    expect((screen.getByTestId('tadwin-unite-select') as HTMLSelectElement).value).toBe('5');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Parcours complet — libération graduelle des 5 paliers
// ──────────────────────────────────────────────────────────────────────────────

describe('TadwinView — parcours des paliers', () => {
  it('palier 0 → message الصدمة après la restitution', async () => {
    await jusquauPalier1();
    // Le message « المشكلة ليست في ذاكرتك… » s'affiche en entrée du palier 1.
    expect(screen.getByText('المشكلة ليست في ذاكرتك، بل في طريقة تدوينك')).toBeTruthy();
    expect(screen.getByTestId('tadwin-cle1')).toBeTruthy();
  });

  it('un palier ne s\'ouvre pas tant que la production est vide (bouton désactivé)', async () => {
    render(<TadwinView onBackToHome={() => {}} />);
    await fireEvent.click(screen.getByTestId('tadwin-demarrer'));
    const envoyer = screen.getByTestId('tadwin-restitution-envoyer') as HTMLButtonElement;
    expect(envoyer.disabled).toBe(true);
  });

  it('palier 3 : la sélection exige 2 clés minimum (قاوم الرغبة — مفتاحان يكفيان)', async () => {
    await jusquauPalier3();
    expect(screen.getByTestId('tadwin-cle-0')).toBeTruthy();
    const valider = screen.getByTestId('tadwin-choix-valider') as HTMLButtonElement;
    expect(valider.disabled).toBe(true);

    await fireEvent.click(screen.getByTestId('tadwin-cle-0'));
    await fireEvent.click(screen.getByTestId('tadwin-cle-1'));
    expect(valider.disabled).toBe(false);
  });

  it('palier 3 : 3 clés maximum, la 4e est impossible (il n\'y en a que 3)', async () => {
    await jusquauPalier3();
    for (let i = 0; i < 3; i++) {
      await fireEvent.click(screen.getByTestId(`tadwin-cle-${i}`));
    }
    // Toutes les clés sont cochées : recomposer un clic décoche, n'ajoute pas.
    await fireEvent.click(screen.getByTestId('tadwin-cle-0'));
    expect(screen.getByText(/الاختيار: 2 من 3/)).toBeTruthy();
  });

  it('palier 3 : verdict C2 + conseil unique + étiquette « ليست نقطة البكالوريا »', async () => {
    await jusquauPalier3();
    await fireEvent.click(screen.getByTestId('tadwin-cle-0'));
    await fireEvent.click(screen.getByTestId('tadwin-cle-1'));
    await fireEvent.click(screen.getByTestId('tadwin-choix-valider'));

    await fireEvent.change(screen.getByTestId('tadwin-reponse'), {
      target: { value: REPONSE_2_CLES },
    });
    await fireEvent.click(screen.getByTestId('tadwin-evaluer'));

    await waitFor(() => expect(screen.getByTestId('tadwin-verdict')).toBeTruthy());
    expect(screen.getByTestId('tadwin-c2').textContent).toBe('100%');
    expect(screen.getByTestId('tadwin-conseil').textContent).toBeTruthy();
    expect(screen.getByText('تقييم التدوين — ليست نقطة البكالوريا')).toBeTruthy();
    expect(screen.getByTestId('tadwin-vers-consolidation')).toBeTruthy();
  });

  it('palier 3 : verdict 0% sur une réponse sans aucun atome', async () => {
    await jusquauPalier3();
    await fireEvent.click(screen.getByTestId('tadwin-cle-0'));
    await fireEvent.click(screen.getByTestId('tadwin-cle-1'));
    await fireEvent.click(screen.getByTestId('tadwin-choix-valider'));
    await fireEvent.change(screen.getByTestId('tadwin-reponse'), {
      target: { value: REPONSE_0_CLE },
    });
    await fireEvent.click(screen.getByTestId('tadwin-evaluer'));

    await waitFor(() => expect(screen.getByTestId('tadwin-verdict')).toBeTruthy());
    expect(screen.getByTestId('tadwin-c2').textContent).toBe('0%');
  });

  it('palier 4 : la fiche enregistrée est due en J+1 (rappel masqué)', async () => {
    await jusquauPalier3();
    await fireEvent.click(screen.getByTestId('tadwin-cle-0'));
    await fireEvent.click(screen.getByTestId('tadwin-cle-1'));
    await fireEvent.click(screen.getByTestId('tadwin-choix-valider'));
    await fireEvent.change(screen.getByTestId('tadwin-reponse'), {
      target: { value: REPONSE_2_CLES },
    });
    await fireEvent.click(screen.getByTestId('tadwin-evaluer'));
    await waitFor(() => expect(screen.getByTestId('tadwin-vers-consolidation')).toBeTruthy());
    await fireEvent.click(screen.getByTestId('tadwin-vers-consolidation'));

    // Palier 4 : pas de rappel dû avant J+1.
    expect(screen.getByText(/لا توجد فقرة مستحقة/)).toBeTruthy();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Rappel espacé (palier 4) — visée depuis un état persisté
// ──────────────────────────────────────────────────────────────────────────────

describe('TadwinView — rappel espacé (carnet masqué)', () => {
  it('une fiche due peut être révélée puis auto-évaluée', async () => {
    // On crée une fiche « due » directement dans le carnet persisté, en
    // programmant son rappel dans le passé (J+1 dépassé).
    const { enregistrerFiche } = await import('../../lib/tadwin/tadwinEngine');
    const fiche = enregistrerFiche(REPONSE_2_CLES, {
      uniteId: 1,
      clesChoisies: ['استنساخ (النواة/ARN بوليميراز)', 'ARNm'],
    }, Date.now() - 2 * 24 * 60 * 60 * 1000);

    render(<TadwinView onBackToHome={() => {}} />);
    // Forcer l'affichage du palier 4 via l'état persisté.
    const { ecrireEtat } = await import('../../lib/tadwin/tadwinEngine');
    ecrireEtat({ uniteId: 1, palier: 4, defiDebutAt: Date.now() });
    cleanup();
    render(<TadwinView onBackToHome={() => {}} />);

    const reveler = screen.queryByTestId(`tadwin-rappel-reveler-${fiche.id}`);
    expect(reveler).not.toBeNull();
    await fireEvent.click(reveler!);

    expect(screen.getByTestId(`tadwin-rappel-ok-${fiche.id}`)).toBeTruthy();
    await fireEvent.click(screen.getByTestId(`tadwin-rappel-ok-${fiche.id}`));

    // Après réussite, la fiche n'est plus due → elle disparaît de la liste.
    await waitFor(() =>
      expect(screen.queryByTestId(`tadwin-rappel-reveler-${fiche.id}`)).toBeNull(),
    );
  });
});
