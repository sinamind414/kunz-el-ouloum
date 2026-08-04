import { KNOWLEDGE_CARDS, BOSS_FIGHT_SCENARIOS } from '../data/smartBotData';

export interface BacExercise {
  id: string;
  question: string;
  points: number;
  correction: string;
}

export interface BacExam {
  title: string;
  duration: number; // en minutes
  exercises: BacExercise[];
}

export interface BacDomainInfo {
  id: number;
  title: string;
  duration: number; // en minutes
  note: string;
}

export const BAC_DOMAINS: BacDomainInfo[] = [
  { id: 1, title: 'البروتينات والمناعة', duration: 50, note: '50 دقيقة' },
  { id: 2, title: 'التحولات الطاقوية', duration: 80, note: '80 دقيقة' },
  { id: 3, title: 'التكتونية العامة', duration: 110, note: '110 دقيقة' },
];

export function generateBacExam(domain: number): BacExam {
  const cards = KNOWLEDGE_CARDS.filter((c) => c.domainId === domain);
  const boss = BOSS_FIGHT_SCENARIOS[domain] || [];

  const exercises: BacExercise[] = [];

  cards.forEach((c) => {
    exercises.push({
      id: `gen_${domain}_card_${c.id}`,
      question: `اشرح الموضوع التالي بدقة علمية :\n${c.title}`,
      points: 4,
      correction: c.shortAnswer,
    });
  });

  boss.forEach((s) => {
    exercises.push({
      id: `gen_${domain}_boss_${s.id}`,
      question: s.situation,
      points: 6,
      correction: s.correction,
    });
  });

  if (exercises.length === 0) {
    exercises.push({
      id: `gen_${domain}_empty`,
      question: 'راجع مجالات هذا المجال وأعد صياغتها.',
      points: 4,
      correction: '',
    });
  }

  const info = BAC_DOMAINS.find((d) => d.id === domain);

  return {
    title: `تدريب المجال ${domain} — ${info?.title || ''}`,
    duration: info?.duration || 60,
    exercises,
  };
}
