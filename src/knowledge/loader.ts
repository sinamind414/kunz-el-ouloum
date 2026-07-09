// src/knowledge/loader.ts

export async function loadDomainKnowledge(domain: number) {
  switch (domain) {
    case 1:
      const d1 = await import('./domain1')
      return d1.DOMAIN_1_KNOWLEDGE
      
    case 2:
      const d2 = await import('./domain2')
      return d2.DOMAIN_2_KNOWLEDGE
      
    case 3:
      const d3 = await import('./domain3')
      return d3.DOMAIN_3_KNOWLEDGE
      
    default:
      return []
  }
}
