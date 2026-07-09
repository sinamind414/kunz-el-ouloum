// src/smartTutorEngine.ts
import { loadDomainKnowledge } from './knowledge/loader'
import { normalizeArabic, tokenizeArabic } from './utils/arabicNormalize'
import { KNOWLEDGE_CARDS } from './data/smartBotData'
import { BOOK_TUTOR_QA, findBestBookQA, type BookTutorQA } from './bookTutorQA'
import { METHODOLOGY_QA, findBestMethodologyQA, type MethodologyQA } from './methodologyKnowledge'

export { normalizeArabic, tokenizeArabic } from './utils/arabicNormalize'

export type SourceType =
  | 'internal_card'
  | 'legacy_card'
  | 'book'
  | 'opus'
  | 'methodology'
  | 'domain'
  | 'quiz'
  | 'out_of_scope'

export interface SourceRef {
  type: SourceType
  title: string
}

// Système de cache en mémoire (ne recharge pas le chunk du domaine)
let cachedDomain: number | null = null
let cachedKnowledge: any[] = []

async function ensureDomainLoaded(domain: number) {
  if (cachedDomain !== domain) {
    cachedKnowledge = await loadDomainKnowledge(domain)
    cachedDomain = domain
  }
  return cachedKnowledge
}

interface SearchChunk {
  id: string
  type: 'book' | 'opus' | 'card'
  title: string
  text: string
  keywords: string[]
  normTitle: string
  normKeywords: string[]
  sourceLabel?: string
  followUp?: string
}

function toChunks(domainKnowledge: any[]): SearchChunk[] {
  const opus: SearchChunk[] = (domainKnowledge || []).map((c: any) => ({
    id: c.id,
    type: 'opus' as const,
    title: c.title,
    text: c.content,
    keywords: c.keywords || [],
    normTitle: normalizeArabic(c.title),
    normKeywords: (c.keywords || []).map((k: string) => normalizeArabic(k)),
  }))

  const book: SearchChunk[] = BOOK_TUTOR_QA.map((q: BookTutorQA) => ({
    id: q.id,
    type: 'book' as const,
    title: q.question,
    text: q.answer,
    keywords: q.keywords,
    followUp: q.followUp,
    sourceLabel: q.sourceBook,
    normTitle: normalizeArabic(q.question),
    normKeywords: q.keywords.map((k) => normalizeArabic(k)),
  }))

  return [...opus, ...book]
}

function scoreChunk(norm: string, ch: SearchChunk): number {
  let score = 0
  if (ch.normTitle && norm.includes(ch.normTitle)) score += 80
  for (const kw of ch.normKeywords) {
    if (kw && kw.length >= 3 && norm.includes(kw)) score += 6
  }
  if (ch.type === 'opus') score *= 0.7
  return score
}

// === logique métier de recherche (réintégrée) ===
export async function searchAllBases(query: string, domain: number): Promise<SearchChunk[]> {
  const knowledgeBase = await ensureDomainLoaded(domain)
  const chunks = toChunks(knowledgeBase)
  const norm = normalizeArabic(query)
  return chunks
    .map((ch) => ({ ch, score: scoreChunk(norm, ch) }))
    .filter((x) => x.score >= 12)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.ch)
}

function findBestKnowledgeCard(input: string, activeDomainId: number | null) {
  const norm = normalizeArabic(input)
  if (!norm || norm.length < 2) return null
  const inputTokens = tokenizeArabic(norm)
  let best: any = null
  let bestRankingScore = 0
  let bestContentScore = 0

  for (const card of KNOWLEDGE_CARDS) {
    let contentScore = 0

    for (const alias of card.aliases) {
      const na = normalizeArabic(alias)
      if (na && na.length >= 2 && norm.includes(na)) {
        contentScore += 100 + na.length
      }
    }

    const nt = normalizeArabic(card.title)
    if (nt && nt.length >= 2 && norm.includes(nt)) contentScore += 50

    let keywordHits = 0
    for (const kw of card.keywords) {
      const nk = normalizeArabic(kw)
      if (nk.length < 2) continue
      if (inputTokens.includes(nk) || norm.includes(nk)) {
        keywordHits += 1
      }
    }
    contentScore += keywordHits * 8

    const domainBonus = activeDomainId != null && card.domainId === activeDomainId ? 5 : 0
    const rankingScore = contentScore + domainBonus

    if (rankingScore > bestRankingScore) {
      bestRankingScore = rankingScore
      bestContentScore = contentScore
      best = card
    }
  }

  if (best && bestContentScore >= 8) return best
  return null
}

// === logique de génération de réponse (réintégrée) ===
export async function processStudentInput(input: string, domain: number): Promise<string> {
  const trimmed = (input || '').trim()

  // 1. Méthodologie (LIVRE MANHADJIYA) en priorité
  const methodologyMatches = findBestMethodologyQA(input)
  if (methodologyMatches.length > 0 && methodologyMatches[0].score >= 18) {
    const qa: MethodologyQA = methodologyMatches[0].qa
    return (
      `🧭 **إجابة منهجية من كتاب المنهجية المحلي.**\n\n` +
      `📌 **السؤال:** ${qa.question}\n\n` +
      `✅ **الطريقة الصحيحة:**\n${qa.answer}\n\n` +
      `🧩 **قالب جاهز:**\n${qa.template || '—'}\n\n` +
      `🔑 **كلمات مفتاحية:** ${qa.keywords.join(' • ')}\n` +
      `📖 **المصدر:** ${qa.sourceBook}`
    )
  }

  // 2. بنك الأسئلة المستخرج من الكتب
  const bookMatches = findBestBookQA(input)
  if (bookMatches.length > 0 && bookMatches[0].score >= 18) {
    const qa: BookTutorQA = bookMatches[0].qa
    return (
      `📚 **إجابة من بنك الأسئلة المستخرج من الكتب المرفقة.**\n\n` +
      `🎯 **المحور:** ${qa.topic}\n\n` +
      `📌 **السؤال:** ${qa.question}\n\n` +
      `✅ **الجواب الدقيق:**\n${qa.answer}\n\n` +
      `🔑 **كلمات مفتاحية:** ${qa.keywords.join(' • ')}\n` +
      `📖 **المصدر:** ${qa.sourceBook}`
    )
  }

  // 3. Recherche dans la base OPUS du domaine (chargée dynamiquement)
  const knowledgeBase = await ensureDomainLoaded(domain)
  const hits = await searchAllBases(input, domain)
  if (hits.length > 0) {
    const best = hits[0]
    const snippet = best.text.length > 400 ? `${best.text.slice(0, 397)}…` : best.text
    let sourceType: SourceType = 'opus'
    if (best.type === 'book') sourceType = 'book'
    else if (best.type === 'card') sourceType = 'legacy_card'
    void sourceType
    return `📚 **${best.title}**\n\n${snippet}`
  }

  // 4. Carte de connaissance interne
  const norm = normalizeArabic(trimmed)
  const card = findBestKnowledgeCard(norm, domain)
  if (card) {
    return `🧩 **${card.title}**\n\n${card.shortAnswer}\n\n🔑 كلمات مفتاحية: ${card.keywords.join(' • ')}`
  }

  return 'لم أجد إجابة دقيقة في قاعدتي المحلية لهذا المجال. جرّب طرح سؤال حول: البروتينات والمناعة، التحولات الطاقوية، أو التكتونية العامة.'
}
