import { INITIAL_UNITS } from '../data';
import type { Unit } from '../types';

export interface DomainInfo {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
}

const DOMAIN_UNIT_RANGES: Record<number, [number, number]> = {
  1: [1, 5],
  2: [6, 8],
  3: [9, 11],
};

export const DOMAINS_INFO: DomainInfo[] = [
  { id: 1, title: 'البروتينات والمناعة', subtitle: 'تركيب البروتين، الإنزيمات، المناعة، الاتصال العصبي', emoji: '🧬', color: '#006d37' },
  { id: 2, title: 'التحولات الطاقوية', subtitle: 'التركيب الضوئي، التنفس، التخمر، ATP', emoji: '⚡', color: '#944a00' },
  { id: 3, title: 'التكتونية العامة', subtitle: 'الصفائح، بنية الأرض، الغوص، البنيات الجيولوجية', emoji: '🌍', color: '#0891b2' },
];

export function getUnitDomainId(unitId: number): number {
  for (const [domainId, range] of Object.entries(DOMAIN_UNIT_RANGES)) {
    const [min, max] = range;
    if (unitId >= min && unitId <= max) return Number(domainId);
  }
  return 1;
}

export function getDomainInfo(domainId: number): DomainInfo {
  return DOMAINS_INFO.find((d) => d.id === domainId) || DOMAINS_INFO[0];
}

export function getUnitsForDomain(domainId: number, allUnits: Unit[] = INITIAL_UNITS): Unit[] {
  const range = DOMAIN_UNIT_RANGES[domainId];
  if (!range) return [];
  const [min, max] = range;
  return allUnits.filter((u) => u.id >= min && u.id <= max);
}

export function getDomainUnitsCount(domainId: number): number {
  const range = DOMAIN_UNIT_RANGES[domainId];
  if (!range) return 0;
  return range[1] - range[0] + 1;
}

export function getUnitById(unitId: number, allUnits: Unit[] = INITIAL_UNITS): Unit | undefined {
  return allUnits.find((u) => u.id === unitId);
}

export function getDomainProgress(domainId: number, allUnits: Unit[] = INITIAL_UNITS): number {
  const units = getUnitsForDomain(domainId, allUnits);
  if (units.length === 0) return 0;
  const totalProgress = units.reduce((sum, u) => sum + (u.progress || 0), 0);
  return Math.round(totalProgress / units.length);
}
