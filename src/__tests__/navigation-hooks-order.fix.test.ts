import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const path = require('path');
const APP_PATH = path.join(__dirname, '..', 'App.tsx');

describe('correction navigation-hooks-order', () => {
  it('place le useEffect de kunz-web-tab-change AVANT le return du splash', () => {
    const src = readFileSync(APP_PATH, 'utf-8');

    const useEffectIndex = src.indexOf('useEffect(() => {');
    const splashIfIndex = src.indexOf("if (currentTab === 'splash')");

    expect(useEffectIndex).toBeGreaterThan(-1);
    expect(splashIfIndex).toBeGreaterThan(-1);

    expect(useEffectIndex).toBeLessThan(splashIfIndex);
  });

  it('le useEffect est toujours appelé (ku pas trop avec splash)', () => {
    const src = readFileSync(APP_PATH, 'utf-8');

    const effectIndex = src.indexOf('useEffect(() => {');
    const splashIndex = src.indexOf("if (currentTab === 'splash')");
    const returnSplashIndex = src.indexOf('return <SplashView', splashIndex);

    expect(effectIndex).toBeLessThan(splashIndex);
    expect(returnSplashIndex).toBeGreaterThan(effectIndex);
  });
});
