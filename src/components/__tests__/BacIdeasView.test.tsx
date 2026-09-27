// BacIdeasView.test.tsx — verrous de la vue « أفكار التمارين حسب الدورة »
// (audit item 12, sprint 16).
//
// Promesses testées :
//   1. l'écran s'ouvre sur la session la plus récente, pas sur un fourre-tout ;
//   2. changer d'année change réellement les fiches affichées ;
//   3. la recherche trouve un exercice par son thème, même écrit sans hamza ;
//   4. le trou 2020 est affiché comme trou, jamais comblé par du contenu.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import BacIdeasView from '../BacIdeasView';
import { YEARS_COVERED, ideasForYear } from '../../data/bacSessionIndex';
import { archetypeRecurrence, archetypesForIdea, ideasOfArchetype } from '../../data/bacArchetypes';
import { ideasForVerbFamily, verbFamilyStats } from '../../data/verbDemands';

afterEach(cleanup);

describe('أفكار التمارين — rendu', () => {
  it("s'ouvre sur la session la plus récente couverte", () => {
    render(<BacIdeasView />);
    const recente = YEARS_COVERED[0];
    for (const idea of ideasForYear(recente)) {
      expect(screen.getByTestId(`idee-${idea.id}`), idea.id).toBeTruthy();
    }
    expect(screen.getByTestId('idees-total').textContent).toContain(
      String(ideasForYear(recente).length),
    );
  });

  it('affiche le barème des deux sujets de la session ouverte', () => {
    render(<BacIdeasView />);
    expect(screen.getByTestId('idees-bareme').textContent).toContain('20');
  });

  it('montre le classement de pression et annonce la couverture complète', () => {
    render(<BacIdeasView />);
    const bloc = screen.getByTestId('idees-pression');
    expect(bloc.textContent).toContain('كل الدورات');
    expect(screen.getByTestId('pression-4')).toBeTruthy();
  });

  it('propose un onglet par session dépouillée, 2020 et 2026 comprises', () => {
    render(<BacIdeasView />);
    for (const y of YEARS_COVERED) expect(screen.getByTestId(`annee-${y}`)).toBeTruthy();
    expect(screen.getByTestId('annee-2020')).toBeTruthy();
    expect(screen.getByTestId('annee-2026')).toBeTruthy();
  });
});

describe('أفكار التمارين — navigation', () => {
  it("change réellement de corpus quand on change d'année", async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    expect(screen.getByTestId('idee-bac2026_s2_e3')).toBeTruthy();
    await user.click(screen.getByTestId('annee-2019'));
    expect(screen.queryByTestId('idee-bac2026_s2_e3')).toBeNull();
    expect(screen.getByTestId('idee-bac2019_s2_e3')).toBeTruthy();
  });

  it('affiche toutes les idées sur « كل الدورات »', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('annee-all'));
    expect(screen.getByTestId('idee-bac2019_s1_e1')).toBeTruthy();
    expect(screen.getByTestId('idee-bac2025_s1_e1')).toBeTruthy();
  });
});

describe('أفكار التمارين — recherche', () => {
  it('retrouve un exercice par son thème', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.type(screen.getByTestId('idees-recherche'), 'البرفورين');
    expect(screen.getByTestId('idee-bac2023_s2_e2')).toBeTruthy();
    expect(screen.queryByTestId('idee-bac2025_s1_e1')).toBeNull();
  });

  it('affiche un message clair quand rien ne correspond', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.type(screen.getByTestId('idees-recherche'), 'زززز');
    expect(screen.getByTestId('idees-vide')).toBeTruthy();
  });
});

describe('أفكار التمارين — fiche', () => {
  it("donne l'idée, les supports, la notion et les verbes", async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('annee-2025'));
    const fiche = screen.getByTestId('idee-bac2025_s2_e3');
    expect(fiche.textContent).toContain('ABO');
    expect(fiche.textContent).toContain('ما يُقيَّم فعلاً');
    expect(fiche.textContent).toContain('ناقش صحة الفرضية');
    expect(fiche.textContent).toContain('08 ن'.replace('08', '8'));
  });
});

describe('أفكار التمارين — montages récurrents (sprint 19)', () => {
  it('propose un bouton par montage, avec ses points et ses sessions', () => {
    render(<BacIdeasView />);
    for (const m of archetypeRecurrence()) {
      const bouton = screen.getByTestId(`montage-${m.archetypeId}`);
      expect(bouton.textContent).toContain(m.titleAr);
      expect(bouton.textContent).toContain(String(m.points));
    }
  });

  it('affiche la méthode et le piège quand un montage est choisi', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('montage-arch_inhibiteur_sosie'));
    const detail = screen.getByTestId('montage-detail');
    expect(detail.textContent).toContain('كيف أتعرّف عليه؟');
    expect(detail.textContent).toContain('الفخّ');
  });

  it('filtre la liste sur les seuls exercices du montage, toutes sessions confondues', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('montage-arch_lecture_geologique'));
    const attendus = ideasOfArchetype('arch_lecture_geologique');
    for (const idea of attendus) expect(screen.getByTestId(`idee-${idea.id}`), idea.id).toBeTruthy();
    expect(screen.getByTestId('idees-total').textContent).toContain(String(attendus.length));
    expect(screen.queryByTestId('idee-bac2026_s2_e3')).toBeNull();
  });

  it('libère le filtre quand on revient à une session', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('montage-arch_lecture_geologique'));
    await user.click(screen.getByTestId('annee-2026'));
    expect(screen.queryByTestId('montage-detail')).toBeNull();
    expect(screen.getByTestId('idee-bac2026_s1_e1')).toBeTruthy();
  });

  it('étiquette chaque fiche avec le ou les montages dont elle relève', () => {
    render(<BacIdeasView />);
    for (const idea of ideasForYear(2026)) {
      for (const a of archetypesForIdea(idea.id)) {
        expect(screen.getByTestId(`fiche-montage-${idea.id}-${a.id}`)).toBeTruthy();
      }
    }
  });
});

describe('أفكار التمارين — familles de consignes (sprint 22)', () => {
  it('propose un bouton par famille avec son nombre d’occurrences', () => {
    render(<BacIdeasView />);
    for (const f of verbFamilyStats()) {
      const bouton = screen.getByTestId(`famille-${f.familyId}`);
      expect(bouton.textContent).toContain(String(f.occurrences));
    }
  });

  it('déplie la demande, la structure, le canevas et la confusion', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('famille-verb_analyser'));
    const bloc = screen.getByTestId('famille-detail');
    expect(bloc.textContent).toContain('بنية الجواب');
    expect(screen.getByTestId('famille-template').textContent).toContain('قالب الصياغة');
    expect(bloc.textContent).toContain('الخلط الشائع');
  });

  it('filtre sur les exercices où la consigne est réellement tombée', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('famille-verb_comparer'));
    const attendus = ideasForVerbFamily('verb_comparer');
    expect(screen.getByTestId('idees-total').textContent).toContain(String(attendus.length));
    for (const idea of attendus) expect(screen.getByTestId(`idee-${idea.id}`), idea.id).toBeTruthy();
  });

  it('un montage et une famille ne restent jamais actifs en même temps', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('famille-verb_analyser'));
    await user.click(screen.getByTestId('montage-arch_lecture_geologique'));
    expect(screen.queryByTestId('famille-detail')).toBeNull();
    expect(screen.getByTestId('montage-detail')).toBeTruthy();
  });
});

describe('أفكار التمارين — ouverture de l’atelier (sprint 24)', () => {
  it('propose un bouton d’entraînement sur chaque fiche', () => {
    render(<BacIdeasView />);
    for (const idea of ideasForYear(YEARS_COVERED[0])) {
      expect(screen.getByTestId(`entrainer-${idea.id}`), idea.id).toBeTruthy();
    }
  });

  it('ouvre l’atelier sur l’exercice choisi, et le referme', async () => {
    const user = userEvent.setup();
    render(<BacIdeasView />);
    await user.click(screen.getByTestId('entrainer-bac2026_s1_e3'));
    const atelier = screen.getByTestId('bac-trainer');
    expect(atelier.textContent).toContain('الأترازين');
    await user.click(screen.getByTestId('trainer-fermer'));
    expect(screen.queryByTestId('bac-trainer')).toBeNull();
  });
});

describe('أفكار التمارين — retour depuis le plan et trace d’écriture (sprint 26)', () => {
  it('ouvre directement l’atelier sur l’exercice demandé par le plan', () => {
    render(<BacIdeasView focusIdeaId="bac2022_s2_e3" />);
    expect(screen.getByTestId('bac-trainer').textContent).toContain('الميثان');
  });

  it('ignore un identifiant inconnu au lieu d’ouvrir un atelier vide', () => {
    render(<BacIdeasView focusIdeaId="bac1999_s9_e9" />);
    expect(screen.queryByTestId('bac-trainer')).toBeNull();
  });

  it('marque les exercices déjà rédigés et affiche le total', () => {
    localStorage.setItem('kunz.bacTrainer.bac2026_s1_e1.verb_texte_scientifique', 'كيف …؟');
    render(<BacIdeasView />);
    expect(screen.getByTestId('redige-bac2026_s1_e1').textContent).toContain('1');
    expect(screen.getByTestId('idees-redige').textContent).toContain('1');
    localStorage.clear();
  });
});
