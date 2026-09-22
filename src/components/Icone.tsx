// Icone.tsx — résolution CLÉ d'icône → composant lucide, en UN SEUL endroit.
//
// Les clés vivent dans src/data/lessonIcons.ts (aucun import lucide côté data,
// donc testable sans DOM). Le Record ci-dessous est typé `Record<IconeCle,
// LucideIcon>` : ajouter une clé licite sans lui donner de composant casse la
// compilation (tsc) — et le verrou Icone.test.tsx vérifie qu'elle rend un <svg>.
// Utilisé par LessonsView (leçons actives + passives) et OkachaView (بنك الحفظ).

import {
  Dna, Boxes, Gauge, ShieldCheck, Brain, Sun, Flame, BatteryCharging,
  Earth, Layers, Mountain, Activity, Microscope, FileText,
  Compass, Grid3x3, Lightbulb, Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { IconeCle } from '../data/lessonIcons';

export const ICONES: Record<IconeCle, LucideIcon> = {
  Dna,
  Boxes,
  Gauge,
  ShieldCheck,
  Brain,
  Sun,
  Flame,
  BatteryCharging,
  Earth,
  Layers,
  Mountain,
  Activity,
  Microscope,
  FileText,
  Compass,
  Grid3x3,
  Lightbulb,
  Target,
};

export default function Icone({ cle, className }: { cle: IconeCle; className?: string }) {
  const C = ICONES[cle] ?? FileText;
  return <C className={className} />;
}
