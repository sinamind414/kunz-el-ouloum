// src/knowledge/domain1.ts
// Données OPUS massives du domaine 1 (unités 0 à 5)
import { TUTOR_KNOWLEDGE, type TutorKnowledgeChunk } from '../tutorKnowledge'

export const DOMAIN_1_KNOWLEDGE: TutorKnowledgeChunk[] = TUTOR_KNOWLEDGE.filter(
  (c) => c.unitId >= 0 && c.unitId <= 5
)
