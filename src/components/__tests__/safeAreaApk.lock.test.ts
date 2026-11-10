// src/components/__tests__/safeAreaApk.lock.test.ts
// VERRU DE ZONE SÛRE (safe-area) — APK Android 15+ / edge-to-edge.
//
// POURQUOI CE VERROU EXISTE
// Android 15 impose l'edge-to-edge aux applications `targetSdk ≥ 35` (notre
// android/variables.gradle : targetSdkVersion = 36). La WebView Capacitor
// passe alors SOUS la barre d'état et SOUS la barre de navigation système.
// Le plugin natif `SystemBars` de Capacitor 8 (mode « css », le défaut)
// calcule les insets et les injecte comme variables CSS sur <html> :
//     --safe-area-inset-top / -right / -bottom / -left
// Tant que le WEB ne les consomme pas, l'interface déborde sous les barres
// système : les icônes de l'en-tête disparaissent, la barre de navigation
// applicative est mangée, la bulle du Capitaine et la fenêtre de chat sont
// tronquées en bas (« le chat n'est pas plein écran », « les icônes
// dépassent l'écran » — signalé par le propriétaire sur l'APK).
//
// CE QUE CE VERROU FIGE
//  1. les quatre alias --pfe-safe-* (source unique, dans index.css) ;
//  2. la consommation de ces alias par les surfaces FIXES : en-tête, barre
//     basse, bouton du Capitaine, fenêtre de chat, barre du quiz, barre de
//     la leçon, portail d'unité, portail de défi, épreuve BAC, splash ;
//  3. le traitement des surfaces montées par le RUNTIME DE ZOOM (bloc de
//     commandes et ligne d'aide), dont les boutons +/− se retrouvaient sous
//     la barre d'état sur l'APK.
//
// Il s'agit d'un verrou « source-scan » (lecture des sources) : les classes
// utilitaires Arbitrary Tailwind (`pb-[calc(...)]`) ne se calculent pas dans
// jsdom, seule une lecture du source peut les figer.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../../..');
const lire = (chemin: string): string => readFileSync(resolve(ROOT, chemin), 'utf8');

const CSS = lire('src/index.css');
const APP = lire('src/App.tsx');

describe('zone sûre (safe-area) — APK Android 15+ edge-to-edge', () => {
  it('index.css définit les quatre alias --pfe-safe-* (Capacitor + env())', () => {
    for (const cote of ['top', 'right', 'bottom', 'left']) {
      expect(
        CSS,
        `--pfe-safe-${cote} absent de src/index.css`,
      ).toContain(`--pfe-safe-${cote}: max(var(--safe-area-inset-${cote}, 0px), env(safe-area-inset-${cote}, 0px));`);
    }
  });

  it('l’en-tête de l’app réserve la barre d’état (hauteur + padding haut)', () => {
    expect(APP).toContain('h-[calc(4rem+var(--pfe-safe-top))]');
    expect(APP).toContain('md:h-[calc(5rem+var(--pfe-safe-top))]');
    expect(APP).toContain('pt-[var(--pfe-safe-top)]');
  });

  it('la barre de navigation basse réserve la barre système', () => {
    expect(APP).toContain('h-[calc(80px+var(--pfe-safe-bottom))]');
    expect(APP).toContain('pb-[calc(0.5rem+var(--pfe-safe-bottom))]');
  });

  it('le bouton du Capitaine reste au-dessus de la barre système', () => {
    expect(APP).toContain('bottom-[calc(6rem+var(--pfe-safe-bottom))]');
    expect(APP).toContain('md:bottom-8');
  });

  it('la fenêtre de chat du Capitaine n’est plus tronquée en bas', () => {
    expect(APP).toContain('pb-[calc(1rem+var(--pfe-safe-bottom))]');
    expect(APP).toContain('max-h-[calc(90dvh-var(--pfe-safe-bottom))]');
  });

  it('le bloc de commandes du zoom (runtime) descend sous la barre d’état', () => {
    expect(CSS).toContain('.pfe-zoom-overlay .pfe-zoom-bar');
    expect(CSS).toContain('padding-top: calc(10px + var(--pfe-safe-top));');
    expect(CSS).toContain('.pfe-zoom-overlay .pfe-zoom-foot');
    expect(CSS).toContain('padding-bottom: calc(8px + var(--pfe-safe-bottom));');
  });

  it('les vues plein écran hors coquille réservent aussi les deux barres', () => {
    const cas: Array<[string, string]> = [
      ['src/components/QuizView.tsx', 'h-[calc(4rem+var(--pfe-safe-top))]'],
      ['src/components/LessonTwoView.tsx', 'pb-[calc(0.5rem+var(--pfe-safe-bottom))]'],
      ['src/components/UnitIntroPortal.tsx', 'pb-[var(--pfe-safe-bottom)]'],
      ['src/components/CombatChallengePortal.tsx', 'pb-[var(--pfe-safe-bottom)]'],
      ['src/components/Bac2025ExamView.tsx', 'pt-[var(--pfe-safe-top)]'],
      ['src/components/SplashView.tsx', 'pt-[var(--pfe-safe-top)]'],
    ];
    for (const [fichier, attendu] of cas) {
      expect(lire(fichier), `${fichier} : zone sûre absente (${attendu})`).toContain(attendu);
    }
  });

  it('aucune surface fixe ne peut régresser vers un inset non consommé', () => {
    // Le runtime de zoom est la seule source qui place ses surfaces en fixed :
    // son CSS doit rester piloté par les variables de zone sûre.
    const runtime = lire('src/utils/figureZoomRuntime.ts');
    expect(runtime).toContain('pfe-zoom-bar');
    expect(runtime).toContain('pfe-zoom-foot');
    // Les modales plein écran de l'appported toutes le padding bas.
    const modales = [
      'src/components/DashboardView.tsx',
      'src/components/StatsView.tsx',
      'src/components/StudentAuthView.tsx',
      'src/components/StreakCelebrationModal.tsx',
      'src/components/WeeklyReportShareModal.tsx',
      'src/components/ParcoursAssimilation.tsx',
      'src/components/LessonTwoView.tsx',
    ];
    for (const f of modales) {
      expect(lire(f), `${f} : modale sans padding de zone sûre`).toContain('var(--pfe-safe-bottom)');
    }
  });
});
