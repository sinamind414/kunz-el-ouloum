// fix/navigation-bugs — verrous sources des 3 correctifs de navigation.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = process.cwd();
const APP = readFileSync(resolve(RACINE, 'src/App.tsx'), 'utf-8');
const MAIN = readFileSync(resolve(RACINE, 'src/main.tsx'), 'utf-8');

describe('fix/navigation-bugs', () => {
  it('B1 : le FAB du المرشد utilise la droite RTL, pas left-4 LTR', () => {
    expect(APP).toContain('fixed bottom-24 right-4 z-40 md:bottom-8 flex flex-col items-end gap-2');
    expect(APP).not.toContain('fixed bottom-24 left-4');
  });

  it('B2 : web : main.tsx ajoute un popstate et App.tsx pousse un historique', () => {
    expect(MAIN).toMatch(/popstate/);
    expect(MAIN).toMatch(/pushState/);
    expect(APP).toMatch(/pushState/);
    expect(APP).toMatch(/kunz-web-tab-change/);
    expect(MAIN).toMatch(/kunz-web-tab-change/);
    expect(MAIN).toMatch(/!estApkCapacitor/);
  });

  it('B3 : handleQuizComplete ne mute pas updatedUnits[nextId-1]', () => {
    const m = APP.match(/updatedUnits\[nextId - 1\].isLocked = false/);
    expect(m, 'mutation directe interdite').toBeNull();
    expect(APP).toContain('updatedUnits[nextId - 1] = { ...updatedUnits[nextId - 1], isLocked: false }');
  });
});
