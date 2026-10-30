"""Contrôles ciblés : notation Hosila et échéance du QCM avec horloge simulée."""
from playwright.sync_api import sync_playwright
from browser_common import *

result={}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    ctx=browser.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
    page=ctx.new_page()
    page.set_default_timeout(12000)
    start(page)
    metadata=page.evaluate("""async()=>{
      const h=await import('/src/data/hosila.ts');
      const c=await import('/src/data/microCapsules.ts');
      return {hosila:h.HOSILA_STATS,capsules:c.MICRO_CAPSULE_COUNT,units:c.capsuleUnitIds()};
    }""")
    result['corpus']=metadata
    summaries(page)
    page.get_by_test_id('okacha-unite-d1u1').click()
    before=page.evaluate("localStorage.getItem('kunz_flashcard_srs_v1')")
    page.get_by_test_id('toggle-hafiz').click()
    page.locator('[data-testid^="reveal-"]').first.click()
    page.locator('[data-testid^="eval-"]').first.get_by_role('button',name=re.compile('جيدة')).click()
    result['hosilaRating']={'srsBefore':before,'srsAfter':page.evaluate("localStorage.getItem('kunz_flashcard_srs_v1')"),
      'pointCounts':page.evaluate("JSON.parse(localStorage.getItem('kunz_okacha_progress_v1'))")}
    ctx.close()

    # Diagnostic du composant réel isolé, horloge Playwright ; pas un parcours
    # applicatif de bout en bout et aucune attente réelle de quinze minutes.
    ctx=browser.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
    page=ctx.new_page()
    page.set_default_timeout(12000)
    page.goto('http://localhost:3000',wait_until='networkidle')
    page.clock.install()
    page.evaluate("""async()=>{
      const React=await import('/node_modules/.vite/deps/react.js');
      const DOM=await import('/node_modules/.vite/deps/react-dom_client.js');
      const {default:Quiz}=await import('/src/components/QuizView.tsx');
      const {SVT_QUIZ_QUESTIONS}=await import('/src/quizCorpus/index.ts');
      document.getElementById('root').style.display='none';
      const host=document.createElement('section');host.id='audit-timer-harness';document.body.append(host);
      window.auditCompletions=[];
      (DOM.createRoot||DOM.default.createRoot)(host).render((React.createElement||React.default.createElement)(Quiz,{unitId:2,unitTitle:'AUDIT TIMER',
        questions:SVT_QUIZ_QUESTIONS.filter(q=>q.unitId===2).slice(0,2),
        onClose:()=>{},onQuizComplete:(...args)=>window.auditCompletions.push(args)}));
    }""")
    scope=page.locator('#audit-timer-harness')
    scope.get_by_text('15:00',exact=True).wait_for()
    page.wait_for_timeout(600)
    page.clock.fast_forward(901000)
    page.wait_for_timeout(600)
    result['timerExpired']={'mode':'real component isolated in Chromium, simulated clock',
      'zeroVisible':scope.get_by_text('00:00',exact=True).count()>0,
      'questionStillVisible':scope.locator('main h2').count()>0,
      'reportVisible':scope.get_by_role('heading',name='انتهاء تمرين الوحدة',exact=True).count()>0,
      'enabledAnswerButtons':scope.locator('main button.group:enabled').count(),
      'completionCalls':page.evaluate('window.auditCompletions.length')}
    (OUT/'supplement-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    snap(page,'24-quiz-after-expiry')
    print(json.dumps(result,ensure_ascii=True))
    browser.close()
