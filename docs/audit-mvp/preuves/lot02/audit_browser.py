"""Audit F06-F10 : actions visibles et fixtures techniques, aucun correctif produit."""
import traceback
from datetime import datetime,timezone
from playwright.sync_api import sync_playwright, expect
from browser_common import *

RESULT={'date':datetime.now(timezone.utc).isoformat(),'base':'http://localhost:3000',
        'mode':'development','checks':[],'pageErrors':[],'scenarioErrors':[]}

def save():
    (OUT/'browser-results.json').write_text(json.dumps(RESULT,ensure_ascii=False,indent=2),encoding='utf-8')

def record(name,**values):
    RESULT['checks'].append({'name':name,**values})
    print(json.dumps({'check':name,**values},ensure_ascii=True),flush=True)
    save()

def read(page,keys):
    return page.evaluate('(keys)=>Object.fromEntries(keys.map(k=>[k,JSON.parse(localStorage.getItem(k)||"null")]))',keys)

def active(page):
    lessons(page)
    click(page,'الدرس النشيط')
    page.get_by_test_id('unite-active-1').click()
    page.get_by_test_id('lecon-active-d1-u1-l1-expression-genique').click()

def dismiss_zoom(page):
    if page.locator('.pfe-zoom-overlay.is-open').count():
        page.keyboard.press('Escape')
        page.wait_for_timeout(250)

def node(page):
    page.locator('.node-item').first.click(force=True)
    page.wait_for_timeout(250)

def f06(page):
    home(page)
    page.get_by_test_id('btn-masari').click()
    page.get_by_test_id('parcours-row-phase1_chapitres_1_2').get_by_role('button').first.click()
    record('F06-parcours-started',state=read(page,['kunz_parcours_v1']))
    home(page)
    record('F06-home-resume',action=page.get_by_test_id('home-nba').inner_text())
    page.get_by_test_id('home-nba-start').click()
    page.locator('iframe').wait_for()
    record('F06-home-resume-target',iframe=page.locator('iframe').get_attribute('title'))
    active(page)
    click(page,'ابدأ الدرس النشيط')
    fixture=json.loads((OUT.parent/'lot01/catalogue.json').read_text(encoding='utf-8'))['lessons']['d1-u1-l1-expression-genique']['blocks']
    for block in fixture[:2]:
        choice=next(c for c in block['choices'] if c.get('completeOnSelect'))
        click(page,re.escape(choice['labelAr']))
    page.locator('textarea').first.fill('AUDIT-DRAFT-2026-10-30')
    key='kunz_lesson_session_v1:d1-u1-l1-expression-genique'
    record('F06-before-reload',draft=page.locator('textarea').first.input_value(),snapshot=read(page,[key]))
    snap(page,'07-draft-before-reload')
    start(page)
    active(page)
    record('F06-after-reload',draft=page.locator('textarea').first.input_value(),snapshot=read(page,[key]))
    snap(page,'08-draft-after-reload')
    click(page,'عودة إلى قائمة الدروس النشيطة')
    record('F06-after-back',snapshot=read(page,[key]))
    page.get_by_test_id('lecon-active-d1-u1-l1-expression-genique').click()
    record('F06-reopen-after-back',startScreen=page.get_by_role('button',name='ابدأ الدرس النشيط',exact=True).count()>0)

def f07(page):
    summaries(page)
    record('F07-free-units',count=page.locator('[data-testid^="okacha-unite-"]').count())
    page.get_by_test_id('okacha-unite-d1u1').click()
    page.get_by_test_id('lu-d1u1').click()
    page.get_by_test_id('toggle-hafiz').click()
    reveals=page.locator('[data-testid^="reveal-"]')
    record('F07-hidden-points',count=reveals.count())
    reveals.first.click()
    evals=page.locator('[data-testid^="eval-"]')
    evals.first.get_by_role('button',name=re.compile('جيدة')).click()
    record('F07-rate',state=read(page,['kunz_okacha_progress_v1','svt_progress']))
    snap(page,'09-summary-rated')
    summaries(page)
    page.get_by_test_id('okacha-unite-d1u1').click()
    record('F07-reopen-persistence',state=read(page,['kunz_okacha_progress_v1']),button=page.get_by_test_id('lu-d1u1').inner_text())
    page.get_by_test_id('okacha-search').fill('zzzzzzzzz')
    record('F07-no-results',text=page.get_by_test_id('okacha-results').inner_text())
    page.get_by_test_id('okacha-search').fill('التركيب الضوئي')
    page.wait_for_timeout(300)
    record('F07-cross-domain-search',buttons=page.get_by_test_id('okacha-results').get_by_role('button').count())
    page.get_by_test_id('okacha-results').get_by_role('button').first.click()
    record('F07-paid-gate',paywall=page.get_by_test_id('ecran-paiement').count(),returnButtons=page.get_by_role('button',name=re.compile('العودة إلى مجال')).count())
    snap(page,'10-summary-paywall')
    click(page,'العودة إلى مجال')
    record('F07-paywall-return',unitsVisible=page.get_by_test_id('okacha-unites-icones').is_visible())
    revision(page)
    record('F07-capsule-initial',answerVisible=page.get_by_test_id('capsule-reponse').count(),question=page.get_by_test_id('capsule-question').inner_text())
    page.get_by_test_id('capsule-voir-reponse').click()
    record('F07-capsule-reveal',answerVisible=page.get_by_test_id('capsule-reponse').is_visible())
    page.get_by_test_id('capsule-suivante').click()
    record('F07-capsule-next',answerVisible=page.get_by_test_id('capsule-reponse').count(),question=page.get_by_test_id('capsule-question').inner_text())
    page.context.set_offline(True)
    page.get_by_test_id('capsule-voir-reponse').click()
    page.get_by_test_id('capsule-precedente').click()
    record('F07-capsule-warm-offline',answerHidden=page.get_by_test_id('capsule-reponse').count()==0)
    page.context.set_offline(False)
    snap(page,'11-capsule')

def f08(page):
    maps(page)
    page.wait_for_timeout(1000)
    record('F08-map',nodes=page.locator('.node-item').count(),links=page.locator('.link-item').count(),keyboardNodes=page.locator('.node-item[tabindex]').count())
    node(page)
    record('F08-node-click',zoomOverlay=page.locator('.pfe-zoom-overlay.is-open').count(),quizButton=page.get_by_role('button',name=re.compile('اختبار فوري')).count())
    snap(page,'12-map-click-overlay')
    dismiss_zoom(page)
    snap(page,'13-node-details-without-overlay')
    search=page.get_by_placeholder(re.compile('ابحث عن مفهوم'))
    search.fill('zzzzzzzzz')
    page.wait_for_timeout(400)
    record('F08-search-no-match',opacities=page.locator('.node-item').evaluate_all('(els)=>[...new Set(els.map(e=>e.getAttribute("opacity")))]'))
    search.fill('')
    click(page,'شجرة هرمية')
    record('F08-radial',nodes=page.locator('.node-item').count())
    click(page,'^الوحدة 4:')
    node(page)
    dismiss_zoom(page)
    record('F08-official-unit4',quizButton=page.get_by_role('button',name=re.compile('اختبار فوري')).inner_text())
    click(page,'اختبار فوري')
    record('F08-unit4-quiz-target',quizHeader=page.locator('body').inner_text()[:550])
    # Revenir au document d'accueil, sans terminer le quiz.
    start(page)
    maps(page)
    click(page,'^الوحدة 6:')
    record('F08-paid-gate',paywall=page.get_by_test_id('ecran-paiement').count(),localBack=page.get_by_role('button',name=re.compile('عودة|العودة')).count())
    snap(page,'14-map-paywall')

def f09(page):
    animations(page)
    record('F09-gallery',figures=page.locator('figure').count(),animateElements=page.locator('animate,animateMotion,animateTransform').count())
    page.get_by_test_id('lancer-migration').click(force=True)
    record('F09-prediction-required',hint=page.get_by_test_id('run-hint').is_visible(),verdict=page.get_by_test_id('verdict').count())
    page.get_by_test_id('ph-slider').fill('7')
    page.get_by_test_id('prediction-cathode').click()
    page.get_by_test_id('lancer-migration').click(force=True)
    record('F09-wrong-prediction',ph=page.get_by_test_id('ph-valeur').inner_text(),verdict=page.get_by_test_id('verdict').inner_text(),score=page.get_by_test_id('score').inner_text())
    page.get_by_test_id('lancer-migration').click(force=True)
    record('F09-idempotent-launch',score=page.get_by_test_id('score').inner_text())
    page.get_by_test_id('nouvelle-manche').click()
    page.get_by_test_id('ph-slider').fill('6')
    page.get_by_test_id('prediction-immobile').click()
    page.get_by_test_id('lancer-migration').click()
    record('F09-equality',verdict=page.get_by_test_id('explication').inner_text(),score=page.get_by_test_id('score').inner_text())
    snap(page,'15-simulation-equality')
    page.get_by_test_id('molecule-glu').click()
    page.get_by_test_id('ph-slider').fill('3')
    page.get_by_test_id('prediction-immobile').click()
    page.get_by_test_id('lancer-migration').click()
    record('F09-near-equality',ph=page.get_by_test_id('ph-valeur').inner_text(),verdict=page.get_by_test_id('explication').inner_text())
    snap(page,'16-simulation-approximation')
    page.context.set_offline(True)
    page.get_by_test_id('nouvelle-manche').click()
    page.get_by_test_id('molecule-ala').click()
    page.get_by_test_id('ph-slider').fill('4')
    page.get_by_test_id('prediction-cathode').click()
    page.get_by_test_id('lancer-migration').click()
    record('F09-warm-offline',verdict=page.get_by_test_id('explication').inner_text())
    page.context.set_offline(False)

def quiz_state(page):
    return read(page,['svt_progress','boussole_activity_queue'])

def quiz_data(page):
    return page.evaluate("""async()=>{
      const q=await import('/src/quizCorpus/index.ts');
      const f=await import('/src/data/fillBlanks.ts');
      const l=await import('/src/data/fillBlanksLoader.ts');
      return [...q.SVT_QUIZ_QUESTIONS.filter(q=>q.unitId===2),...l.versQuizQuestions(f.FILL_BLANK_QUESTIONS,2)];
    }""")

def quiz_open(page):
    maps(page)
    click(page,'^الوحدة 2:')
    node(page)
    dismiss_zoom(page)
    click(page,'اختبار فوري')
    page.locator('main h2').wait_for()

def answer(page,data,wrong=False):
    page.wait_for_function("""()=>{
      if(document.querySelectorAll('main h2').length!==1)return false;
      const opts=[...document.querySelectorAll('main button.group')];
      if(opts.length)return opts.every(b=>!b.disabled);
      const input=document.querySelector('main input[aria-label]');
      return input&&!input.disabled;
    }""",timeout=12000)
    text=page.locator('main h2').inner_text()
    normalize=lambda value:re.sub(r'\s+','',value).replace('\u200e','').replace('\u200f','')
    candidates=[q for q in data if normalize(q['questionText'])==normalize(text)]
    opts=page.locator('main button.group')
    visibleOptions=[normalize(v) for v in opts.all_text_contents()]
    q=max(candidates,key=lambda c:sum(any(normalize(o) in v for v in visibleOptions) for o in c.get('options',[])))
    if q.get('kind')=='fillBlank':
        page.get_by_label('فراغ الإجابة',exact=True).fill('WRONG' if wrong else q['acceptedAnswers'][0])
        page.get_by_role('button',name='تحقّق',exact=True).click()
    else:
        correct=q['options'][q['correctAnswerIndex']]
        for b in opts.all():
            is_correct=normalize(correct) in normalize(b.inner_text())
            if is_correct != wrong:
                b.focus()
                b.press('Enter')
                break
        else:
            (OUT/'quiz-fixture-mismatch.json').write_text(json.dumps({'q':q,'options':opts.all_text_contents()},ensure_ascii=False,indent=2),encoding='utf-8')
            raise AssertionError('Cannot find answer option')
    return q

def f10(page):
    data=quiz_data(page)
    (OUT/'quiz-fixture.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    record('F10-technical-fixture',questions=len(data),qcm=sum(q.get('kind')!='fillBlank' for q in data),fillBlank=sum(q.get('kind')=='fillBlank' for q in data))
    quiz_open(page)
    record('F10-before-answer',nextDisabled=page.get_by_role('button',name='التالي',exact=True).is_disabled())
    first=answer(page,data,wrong=True)
    record('F10-wrong-feedback',questionId=first['id'],lockedOptions=page.locator('main button.group:disabled').count(),feedbackVisible=page.locator('[aria-live="polite"]').count())
    snap(page,'17-quiz-wrong-feedback')
    before=quiz_state(page)
    for i in range(len(data)):
        counter=re.search(r'السؤال\s+(\d+)\s+من\s+(\d+)',page.locator('body').inner_text())
        assert counter and int(counter.group(1))==i+1, 'Question counter does not match fixture traversal'
        if i:
            answer(page,data)
        nextbutton=page.get_by_role('button',name=re.compile('^التالي$|إنهاء وحساب النتيجة'))
        expect(nextbutton).to_be_enabled(timeout=4000)
        nextbutton.focus()
        nextbutton.press('Enter')
        page.wait_for_timeout(650)
        if i%10==0:
            print('F10 progress '+str(i+1)+'/'+str(len(data)),flush=True)
    page.get_by_role('heading',name='انتهاء تمرين الوحدة',exact=True).wait_for()
    record('F10-completed',text=page.locator('body').inner_text()[-2600:],before=before,after=quiz_state(page))
    snap(page,'18-quiz-completed')
    causes=page.locator('[data-testid^="cause-"]')
    if causes.count():
        causes.first.click()
        record('F10-error-cause',acknowledgement=page.get_by_test_id('cause-enregistree').count(),state=read(page,['boussole_profil_erreurs']))
    initial=quiz_state(page)
    page.get_by_test_id('quiz-reprise-erreurs').click()
    record('F10-retry-errors',questionText=page.locator('main h2').inner_text(),sameQuestion=page.locator('main h2').inner_text()==first['questionText'])
    answer(page,data)
    click(page,'إنهاء وحساب النتيجة')
    record('F10-retry-no-double-credit',before=initial,after=quiz_state(page))
    snap(page,'19-quiz-retry-completed')

def mobile(page):
    summaries(page)
    page.get_by_test_id('okacha-unite-d1u1').click()
    snap(page,'20-mobile-summary')
    maps(page)
    page.wait_for_timeout(800)
    snap(page,'21-mobile-map')
    animations(page)
    snap(page,'22-mobile-animation')
    record('mobile-overflow-animation',width=page.evaluate('innerWidth'),scrollWidth=page.evaluate('document.documentElement.scrollWidth'))
    quiz_open(page)
    snap(page,'23-mobile-quiz')
    record('mobile-overflow-quiz',width=page.evaluate('innerWidth'),scrollWidth=page.evaluate('document.documentElement.scrollWidth'))

if __name__=='__main__':
    requested=set(sys.argv[1:])
    if requested and (OUT/'browser-results.json').exists():
        RESULT=json.loads((OUT/'browser-results.json').read_text(encoding='utf-8'))
        RESULT['checks']=[c for c in RESULT['checks'] if c['name'].split('-')[0] not in requested]
        RESULT['scenarioErrors']=[e for e in RESULT['scenarioErrors'] if e['scenario'] not in requested]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        RESULT['browser']=browser.version
        for name,fn in [('F06',f06),('F07',f07),('F08',f08),('F09',f09),('F10',f10),('mobile',mobile)]:
            if requested and name not in requested:
                continue
            ctx=browser.new_context(viewport={'width':390,'height':844} if name=='mobile' else {'width':1280,'height':900},is_mobile=name=='mobile',has_touch=name=='mobile',locale='ar-DZ')
            page=ctx.new_page()
            page.set_default_timeout(12000)
            page.on('pageerror',lambda e:RESULT['pageErrors'].append(str(e)))
            try:
                start(page)
                fn(page)
            except Exception:
                RESULT['scenarioErrors'].append({'scenario':name,'trace':traceback.format_exc()})
                print(traceback.format_exc().encode('ascii','backslashreplace').decode(),flush=True)
            finally:
                save()
                ctx.close()
        browser.close()
    if RESULT['scenarioErrors']:
        raise SystemExit(1)
