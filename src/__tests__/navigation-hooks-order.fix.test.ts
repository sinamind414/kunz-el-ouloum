import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const path = require('path');
const APP_PATH = path.join(__dirname, '..', 'App.tsx');

describe('correction navigation-hooks-order', () => {
  it('place le useEffect de kunz-web-tab-change AVANT le return du splash', () => {
    const src = readFileSync(APP_PATH, 'utf-8');

    const useEffectIndex = src.indexOf('useEffect(() => {');
    const splashIfIndex = src.indexOf("if (currentTab === 'splash')");

    expect(useEffectIndex).toBeGreaterThan(-1, 'useEffect présent');
    expect(splashIfIndex).toBeGreaterThan(-1, 'splash if présent');

    expect(useEffectIndex).toBeLessThan(splashIfIndex, 'useEffect devant splash if');
  });

  it('le useEffect est toujours appelé (ku pas trop avec splash)', () => {
    const src = readFileSync(APP_PATH, 'utf-8');

    const effectIndex = src.indexOf('useEffect(() => {');
    const splashIndex = src.indexOf("if (currentTab === 'splash')");
    const returnSplashIndex = src.indexOf('return <SplashView', splashIndex);

    expect(effectIndex).toBeLessThan(splashIndex, 'effect avant splash');
    expect(returnSplashIndex).toBeGreaterThan(effectIndex, 'return après effect');
  });
});
