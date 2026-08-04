# Kunz El Ouloum — React/Vite

منصة تفاعلية لمراجعة علوم الطبيعة والحياة للبكالوريا الجزائرية مع مرشد ذكي محلي 100% بدون إنترنت.

## ما الجديد

النسخة الحالية تعمل **بدون إنترنت** و**بدون API** ولا تحتاج أي مفتاح ذكاء اصطناعي:
- المرشد الموجه (`CoachView`) يوجّه التلميذ من تقدمه الحقيقي (نقاط ضعف / مراجعة اليوم / نقاط قوة)
- قاعدة المعرفة المدمجة تبقى متاحة محلياً (TUTOR_KNOWLEDGE + بنك الكتب + المنهجية + البطاقات)
- يعرض المصادر والثقة في الإجابة
- يقترح مواضيع مراجعة سريعة عبر domain cards

## Knowledge Cards / routage exact

Un routeur local par cartes de savoir a été ajouté dans `src/knowledgeCards.ts` pour éviter les erreurs de matching sur les titres de chapitre courts ou ambigus.

Cas corrigés :
- بنية الكرة الأرضية
- طبقات الكرة الأرضية
- الأغلفة الداخلية للأرض
- الموجات الزلزالية وبنية الأرض
- كيف نستدل على بنية الكرة الأرضية من الموجات الزلزالية؟
- كرة القدم → hors programme

Priorité du moteur :
0. Session active prioritaire : si un quiz/تحدي BAC est en cours, la réponse (A/B/C/D) est traitée **avant** toute recherche sémantique
1. Hors programme (كرة القدم, films, etc.) → refus
2. Méthodologie Manhadjiya (`findBestMethodologyQA`, score ≥ 18)
3. Q/R livres scientifiques (`findBestBookQA`, score ≥ 18)
4. Knowledge Cards exactes / aliases
5. leçons, QCM, OPUS (recherche générique)
6. clarification / suggestions méthodologiques

> Fable 5 : garde-fous de longueur (`norm.length ≥ 3`) ajoutés partout pour éviter qu'une lettre isolée (« A ») ne matche un guide/une carte par accident.

## Fusion UX ajoutée (offline)

Les améliorations d'expérience issues de la révision sont fusionnées **sans casser le mode hors-ligne** :

- **Portail aventure de leçon** (`src/components/LessonAdventurePortal.tsx`) : chaque leçon s'ouvre en 3 pages (الوضعية الانطلاقية / النشاط الموجه / الخلاصة والتثبيت), avec badges de mots-clés, zoom du mascotte, et CTA collant « اسأل المرشد الذكي ».
- **Polices** : aucune dépendance Google Fonts ; repli sur les polices système Arabic (Segoe UI / Tahoma / Geeza Pro).

Le **cœur tuteur** (moteur, contenu, QCM, cartes) est **100% offline** : aucun `fetch`, aucune clé API, aucun appel LLM. Les schémas SVG ne contiennent plus d'import Google Fonts.

> Nuance offline-first : l'**auth + la télémétrie Supabase sont optionnelles**. Elles ne s'activent que si `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont fournies. La télémétrie est bufferisée dans `localStorage` puis envoyée au retour du réseau — **jamais bloquante**, et absente si Supabase n'est pas configuré (`src/lib/supabase.ts` renvoie un client `null`).

## المحتوى المتكامل

- 11 وحدة من البرنامج الوطني الجزائري
- 500 سؤال QCM مع شروحات
- 23 درس/مرحلة من ملفات HTML/TypeScript
- 6 أفعال منهجية BAC كاملة
- 500 بطاقة مراجعة (flashcards) مولدة من QCM
- رسومات SVG/PNG مخزنة محلياً من `public/assets`

## البنية التقنية

- Frontend : React + Vite + TypeScript
- Backend : Express (serves SPA + API `/api/health`)
- Offline Tutor Engine : `src/utils/smartTutorEngine.ts`
- Base de connaissance : `src/tutorKnowledge.ts`
- Banque Q/R scientifique (livres) : `src/bookTutorQA.ts`
- Banque méthodologique Manhadjiya : `src/methodologyKnowledge.ts`

## Banque méthodologique Manhadjiya

Le fichier propre `LIVRE MANHADJIYA.md` a été intégré sous forme de banque locale `src/methodologyKnowledge.ts`.

Le Smart Tutor répond maintenant en priorité aux questions de méthodologie depuis cette base avant les Q/R scientifiques et la recherche générique :

- كيف أحلل وثيقة؟
- كيف أفسر نتيجة؟
- ما الفرق بين استخرج واستنتج؟
- كيف أعلل أو أبرر؟
- كيف أقترح فرضية؟
- كيف أكتب نصا علميا؟
- ما معنى الكلمات المفتاحية؟
- ما هو الاستدلال العلمي؟
- ما هو المسعى العلمي؟

Les questions scientifiques fréquentes répondent désormais depuis une banque Q/R extraite des livres (`src/bookTutorQA.ts`) : الاستنساخ، الترجمة، البنية الفراغية، الحمقلية، النشاط الإنزيمي، تأثير pH، المناعة الخلطية، دور LT4، المرحلة الكيميوضوئية، حلقة كالفن، التنفس/التخمر، الغوص والتكتونية.

> مبني وفق منهجية البكالوريا — بدون ادعاء اعتماد رسمي.

## Installation locale

```bash
npm ci
npm run dev
```

L'application écoute par défaut sur `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```

Le serveur respecte `PORT` si la plateforme le fournit :

```bash
PORT=8080 npm run start
```

## Variables d'environnement

```bash
PORT=3000

# Optionnel — auth + télémétrie Supabase (l'app fonctionne sans) :
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...placeholder
```

Aucune clé API n'est requise pour le tuteur : le Smart Tutor est 100% offline. Les variables Supabase ci-dessus n'activent que l'auth et la télémétrie optionnelles.

## Scripts

- `npm run dev` : serveur Express + Vite en développement
- `npm run lint` : vérification TypeScript
- `npm run build` : build client Vite + bundle serveur
- `npm run start` : démarre le serveur de production

## Tests obligatoires

```bash
npm run lint
npm run build
```

Traces interdites :

```bash
grep -RInE "GEMINI|Gemini|genai|google_generative|/api/chat|fetch\\(" \
  --exclude-dir=node_modules --exclude-dir=dist .
```

Résultat attendu : aucune ligne.
