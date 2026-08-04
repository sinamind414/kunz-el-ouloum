// src/knowledge/domain3.ts
// Données OPUS massives du domaine 3 (unités 9 à 11)
import { TUTOR_KNOWLEDGE, type TutorKnowledgeChunk } from '../tutorKnowledge'

export const DOMAIN_3_KNOWLEDGE: TutorKnowledgeChunk[] = TUTOR_KNOWLEDGE.filter(
  (c) => c.unitId >= 9 && c.unitId <= 11
)
