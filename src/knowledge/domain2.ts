// src/knowledge/domain2.ts
// Données OPUS massives du domaine 2 (unités 6 à 8)
import { TUTOR_KNOWLEDGE, type TutorKnowledgeChunk } from '../tutorKnowledge'

export const DOMAIN_2_KNOWLEDGE: TutorKnowledgeChunk[] = TUTOR_KNOWLEDGE.filter(
  (c) => c.unitId >= 6 && c.unitId <= 8
)
