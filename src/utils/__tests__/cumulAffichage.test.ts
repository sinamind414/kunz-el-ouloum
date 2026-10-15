// cumulAffichage.test.ts — LA CHAÎNE COMPLÈTE DU CUMUL (« L'effet cumulé »).
//
// Un compteur calculé mais jamais affiché ne corrige rien ; un compteur affiché
// mais jamais persisté disparaît au rechargement. Ces tests lisent les sources
// RÉELLES et vérifient chaque maillon de la chaîne :
//
//   serie.ts (règle) → activiteQuotidienne.ts (persistance) → types.ts (stockage)
//   → DashboardView.tsx (affichage) → useInvitationCapitaine.ts (parole)
//
// Le défaut couvert : `serieAffichee` renvoie 0 dès qu'un jour est manqué, donc
// un élève ayant travaillé 42 jours lisait « 0 » après une journée ratée.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const lire = (chemin: string) => readFileSync(resolve(process.cwd(), chemin), 'utf8');

describe('le cumul est calculé par une règle pure et testée', () => {
  it('serie.ts expose le cumul et ne le remet jamais à zéro', () => {
    const serie = lire('src/utils/serie.ts');
    expect(serie).toContain('joursTotal: number;');
    expect(serie).toContain('export function cumulJours(');
    // La seule incrémentation du cumul : +1 par jour d'activité, jamais de
    // remise à zéro. Une affectation à 0 serait le retour du défaut.
    expect(serie).toContain('joursTotal: etat.joursTotal + 1');
    expect(serie).not.toMatch(/joursTotal:\s*0\s*[,}]/);
  });
});

describe('le cumul survit au rechargement de l’application', () => {
  it('il est déclaré dans le type persisté', () => {
    expect(lire('src/types.ts')).toContain('joursActifsTotal?: number;');
  });

  it('il est ÉCRIT dans la progression à chaque activité', () => {
    const quotidien = lire('src/utils/activiteQuotidienne.ts');
    expect(quotidien).toContain('joursActifsTotal: progression.etat.joursTotal');
    expect(quotidien).toContain('minute.joursActifsTotal');
  });

  it('il est exposé en lecture pour les écrans', () => {
    expect(lire('src/utils/activiteQuotidienne.ts')).toContain('export function cumulJoursDepuisDaily(');
  });
});

describe('le cumul est AFFICHÉ là où l’élève regarde', () => {
  it('l’accueil ne montre plus un 0 quand du travail a été fait', () => {
    const dash = lire('src/components/DashboardView.tsx');
    expect(dash).toContain('cumulJoursDepuisDaily');
    // Le compteur d'en-tête doit choisir entre la série et le cumul.
    expect(dash).toContain('const cumulSerie = serie > 0 ? serie : cumul;');
    expect(dash).toMatch(/\{cumulSerie > 0 \?/);
  });
});

describe('le capitaine peut nommer l’acquis', () => {
  it('le contexte porte le cumul et le hook le fournit', () => {
    expect(lire('src/lib/invitationCapitaine.ts')).toContain('joursAccumules?: number;');
    expect(lire('src/hooks/useInvitationCapitaine.ts')).toContain('joursAccumules: cumulJoursDepuisDaily(daily)');
  });

  it('le message de reprise parle du cumul, jamais d’un chiffre inventé', () => {
    const capitaine = lire('src/lib/invitationCapitaine.ts');
    // La garde : un cumul inexploitable vaut 0, et le message sobre reprend.
    expect(capitaine).toContain('Number.isInteger(ctx.joursAccumules)');
    expect(capitaine).toContain('في رصيدك');
  });
});
