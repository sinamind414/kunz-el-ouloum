"""Audit F11-F15. Profils jetables ; accès payant SIMULÉ côté client.

Le serveur de facturation n'est pas validé : les appels API sont interceptés
dans le seul contexte de test premium. Les réponses attendues sont des fixtures
techniques, pas une validation scientifique indépendante.
"""
import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(OUT.parent/'lot02'))
import browser_common as common
common.OUT=OUT
from browser_common import start,home,click,snap,maps

RESULTS={'observations':[],'pageErrors':[],'scenarioErrors':[]}
META=json.loads((OUT/'metadata.json').read_text(encoding='utf-8'))

def record(name,**data):
    RESULTS['observations'].append({'name':name,**data})
    print(name,flush=True)

def storage(p):
    return p.evaluate("()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>!['svt_flashcards','svt_quiz_questions'].includes(k)))")

def close_zoom(p):
    # Laisser aboutir la transition native requestFullscreen avant Esc.
    p.wait_for_timeout(600)
    if p.locator('.pfe-zoom-overlay.is-open').count(): p.keyboard.press('Escape')
    p.wait_for_timeout(500)

def training(p,tab):
    home(p)
    click(p,'^التمارين والتدريب')
    p.get_by_test_id('hub-'+tab).click()
    p.wait_for_timeout(1200)

def schemas(p):
    home(p)
    click(p,'^المراجعة')
    p.get_by_test_id('revhub-schemas').click()
    p.wait_for_timeout(1200)

def premium(p):
    # Identité factice réservée au navigateur isolé, aucun appel authentifié réel.
    p.context.route('**/api/**',lambda route: route.fulfill(status=200,content_type='application/json',body=json.dumps(
        {'statut':'essai','expireLe':'2099-06-30','joursRestants':30,'prixSaisonDA':1200,'uniteGratuite':1}
        if 'entitlement' in route.request.url else {})))
    p.evaluate("""()=>{localStorage.setItem('boussole_token','audit-local-fixture-not-a-real-token');
      localStorage.setItem('kunz_acces',JSON.stringify({statut:'essai',expireLe:'2099-06-30'}));} """)

def book(p):
    training(p,'examens')
    p.get_by_test_id('examens-qcm').click()
    p.get_by_test_id('qcm-livre').wait_for()
    p.locator('[data-testid^="qcm-unite-"]').first.wait_for()

def f11(p):
    training(p,'examens')
    record('F11-guest-entry',paywall=p.get_by_test_id('bouton-activer-code').count(),hub=p.get_by_test_id('examens-hub').count())
    snap(p,'03-guest-exams-paywall')
    premium(p)
    book(p)
    record('F11-book-list',count=len(META['book']),chapters=len(set(q['chapitre'] for q in META['book'])),unitGroups=p.locator('[data-testid^="qcm-unite-"]').count())
    snap(p,'04-book-list')
    c=META['book'][0]['chapitre']
    title=META['chapters'][c-1]['titreAr']
    questions=[q for q in META['book'] if q['chapitre']==c]
    p.get_by_role('button',name=re.compile(re.escape(title))).first.click()
    before=storage(p)
    for i,q in enumerate(questions):
        text=q['options'][(q['correct']+1)%len(q['options'])] if i==0 else q['options'][q['correct']]
        p.get_by_role('button',name=text,exact=True).click()
    p.wait_for_timeout(400)
    record('F11-chapter-completed',chapter=c,total=len(questions),expectedScore=len(questions)-1,text=p.get_by_test_id('qcm-livre').inner_text(),before=before,after=storage(p),images=p.locator('main img').evaluate_all('(xs)=>xs.map(x=>({src:x.getAttribute("src"),loaded:x.complete&&x.naturalWidth>0}))'))
    snap(p,'05-book-result')
    click(p,'عودة إلى الفصول')
    p.get_by_role('button',name=re.compile(re.escape(title))).first.click()
    record('F11-chapter-reentry',resultVisible='النتيجة :' in p.get_by_test_id('qcm-livre').inner_text())
    click(p,'عودة إلى الفصول')
    click(p,'اختبار تشخيصي شامل')
    pool=p.evaluate("async()=>{const m=await import('/src/data/qcmBilan.ts');return m.POOL}")
    record('F11-bilan-pool',count=len(pool),domains={str(d):sum(q['domaine']==d for q in pool) for d in [1,2,3]})
    # L'intitulé exact de démarrage est lu sur la vraie intro.
    snap(p,'06-bilan-intro')
    click(p,'ابدأ')
    before=storage(p)
    for i in range(15):
        p.wait_for_timeout(100)
        body=p.get_by_test_id('qcm-livre').inner_text()
        matches=[q for q in pool if q['question'] in body]
        assert matches,'bilan question not found in fixture'
        q=max(matches,key=lambda q:len(q['question']))
        chosen=q['options'][(q['correct']+1)%len(q['options'])] if i==0 else q['options'][q['correct']]
        p.get_by_role('button',name=chosen,exact=True).click()
        click(p,'النتيجة والتشخيص' if i==14 else '^التالي')
    record('F11-bilan-completed',expected='14/15',text=p.get_by_test_id('qcm-livre').inner_text(),before=before,after=storage(p))
    snap(p,'07-bilan-result')
    p.reload(wait_until='networkidle')
    record('F11-after-reload',bilanVisible=p.get_by_test_id('qcm-livre').count(),state=storage(p))

def f12(p):
    data=p.evaluate("""async()=>{const q=await import('/src/quizCorpus/index.ts');const f=await import('/src/data/fillBlanks.ts');
      const l=await import('/src/data/fillBlanksLoader.ts');return [...q.SVT_QUIZ_QUESTIONS.filter(q=>q.unitId===1),...l.versQuizQuestions(f.FILL_BLANK_QUESTIONS,1)]}""")
    maps(p)
    click(p,'^الوحدة 1:')
    p.locator('.node-item').first.click(force=True)
    close_zoom(p)
    launch=p.get_by_role('button',name=re.compile('اختبار فوري'))
    launch.focus()
    launch.press('Enter')
    p.wait_for_timeout(1000)
    if p.get_by_test_id('portal-commencer').count():
        p.get_by_test_id('portal-commencer').click()
    p.wait_for_function("()=>!!document.querySelector('main button.group, main input[aria-label]')")
    found=0
    for _ in range(len(data)):
        p.wait_for_timeout(650)
        text=p.locator('main h2').inner_text()
        norm=lambda s: re.sub(r'\s+','',s).replace('\u200e','').replace('\u200f','')
        candidates=[q for q in data if norm(q['questionText'])==norm(text)]
        assert candidates,'quiz fixture mismatch'
        q=candidates[0]
        if q.get('kind')=='fillBlank':
            field=p.get_by_label('فراغ الإجابة',exact=True)
            if found==0:
                record('F12-empty',submitDisabled=p.get_by_role('button',name='تحقّق',exact=True).is_disabled(),prompt=text)
                answer='ليس صحيحا أن '+q['acceptedAnswers'][0]
            elif found==1: answer='WRONG'
            else: answer=q['acceptedAnswers'][0]
            field.fill(answer)
            field.press('Enter')
            p.wait_for_timeout(150)
            record('F12-answer-'+str(found),prompt=text,answer=answer,accepted=q['acceptedAnswers'],correctFeedback=p.get_by_text('إجابة صحيحة',exact=True).count(),inputLocked=field.is_disabled(),text=p.locator('main').inner_text()[-1800:])
            snap(p,'08-fill-negation' if found==0 else '09-fill-wrong' if found==1 else '10-fill-correct')
            found+=1
            if found==3: break
        else:
            opts=p.locator('main button.group')
            q=max(candidates,key=lambda c:sum(any(norm(o) in norm(v) for v in opts.all_text_contents()) for o in c['options']))
            correct=q['options'][q['correctAnswerIndex']]
            for b in opts.all():
                if norm(correct) in norm(b.inner_text()):
                    b.focus(); b.press('Enter'); break
        b=p.get_by_role('button',name=re.compile('^التالي$|إنهاء وحساب النتيجة'))
        b.focus(); b.press('Enter')
    assert found==3
    before=storage(p)
    p.reload(wait_until='networkidle')
    record('F12-reload-incomplete-session',quizVisible=p.locator('main h2').all_text_contents(),before=before,after=storage(p))

def f13(p):
    schemas(p)
    record('F13-guest',paywall=p.get_by_test_id('bouton-activer-code').count())
    snap(p,'11-guest-schema-paywall')
    premium(p)
    schemas(p)
    record('F13-list',count=p.get_by_test_id('drill-count').inner_text())
    p.get_by_test_id('drill-unite-5').click()
    record('F13-filter',count=p.get_by_test_id('drill-count').inner_text())
    p.get_by_test_id('drill-unite-5').click()
    p.get_by_test_id('drill-drill_synapse').click()
    record('F13-draw',images=p.locator('main img').count())
    snap(p,'12-schema-draw')
    p.get_by_test_id('drill-fini').click()
    record('F13-evaluation',images=p.locator('main img').count(),criteria=p.locator('[data-testid^="element-"]').count())
    p.get_by_test_id('drill-valider').click()
    record('F13-zero',score=p.get_by_test_id('drill-score').inner_text(),verdict=p.get_by_test_id('drill-verdict').inner_text(),missing=p.get_by_test_id('drill-oublis').count())
    snap(p,'13-schema-zero')
    p.get_by_test_id('drill-recommencer').click()
    p.get_by_test_id('drill-fini').click()
    for el in p.locator('[data-testid^="element-"]').all():
        el.focus(); el.press('Enter')
    before=storage(p)
    p.get_by_test_id('drill-valider').click()
    p.get_by_test_id('drill-asset').scroll_into_view_if_needed()
    p.wait_for_timeout(400)
    record('F13-perfect',score=p.get_by_test_id('drill-score').inner_text(),verdict=p.get_by_test_id('drill-verdict').inner_text(),image=p.get_by_test_id('drill-asset').evaluate('(x)=>({src:x.src,loaded:x.complete&&x.naturalWidth>0})'),before=before,after=storage(p))
    snap(p,'14-schema-perfect')
    p.context.set_offline(True)
    p.get_by_test_id('drill-recommencer').click()
    p.get_by_test_id('drill-fini').click()
    p.get_by_test_id('drill-valider').click()
    record('F13-offline-warm',score=p.get_by_test_id('drill-score').inner_text())
    p.context.set_offline(False)
    p.get_by_test_id('drill-quitter').click()
    p.get_by_test_id('drill-drill_synapse').click()
    record('F13-reentry',drawing=p.get_by_test_id('phase-dessin').count())

def f14(p):
    training(p,'situations')
    record('F14-guest',paywall=p.get_by_test_id('bouton-activer-code').count())
    snap(p,'15-guest-situation-paywall')
    premium(p)
    training(p,'situations')
    record('F14-list',count=p.get_by_test_id('situation-count').inner_text())
    p.get_by_test_id('situation-search').fill('زرافة')
    record('F14-empty',empty=p.get_by_test_id('situation-vide').count())
    p.get_by_test_id('situation-search').fill('السكري')
    record('F14-search',count=p.get_by_test_id('situation-count').inner_text())
    snap(p,'16-situation-search')
    p.get_by_test_id('situation-search').fill('')
    p.get_by_test_id('filtre-unite-4').click()
    record('F14-unit-filter',count=p.get_by_test_id('situation-count').inner_text())
    p.get_by_test_id('filtre-unite-4').click()
    p.get_by_test_id('situation-diabete_januvia').click()
    record('F14-detail-hidden',documents=p.get_by_test_id('fiche-documents').count(),elite=p.get_by_test_id('fiche-exercices-elite').count(),correction=p.get_by_test_id('fiche-correction').count(),inputs=p.locator('main input,main textarea').count())
    snap(p,'17-situation-hidden')
    before=storage(p)
    p.get_by_test_id('basculer-correction').click()
    record('F14-correction',text=p.get_by_test_id('fiche-correction').inner_text(),before=before,after=storage(p))
    snap(p,'18-situation-correction')
    p.context.set_offline(True)
    p.get_by_test_id('basculer-correction').click()
    p.get_by_test_id('basculer-correction').click()
    record('F14-offline-warm',correction=p.get_by_test_id('fiche-correction').count())
    p.context.set_offline(False)
    p.get_by_test_id('fermer-fiche').click()
    p.get_by_test_id('situation-diabete_januvia').click()
    record('F14-reentry',correctionHidden=p.get_by_test_id('fiche-correction').count()==0)

def section(p,n):
    return p.locator('main section').filter(has=p.get_by_role('heading',name=re.compile(['الأولى','الثانية','الثالثة','الرابعة','الخامسة'][n-1]))).first

def f15(p):
    training(p,'workshop')
    record('F15-entry',text=p.locator('main').inner_text()[:700])
    s=section(p,1)
    s.get_by_role('button',name='السلسلة الناسخة',exact=True).click()
    s.locator('input').fill('WRONG')
    s.get_by_role('button',name='تحقق',exact=True).focus()
    s.get_by_role('button',name='تحقق',exact=True).press('Enter')
    record('F15-wrong',progress=p.locator('main').inner_text()[:450])
    s.locator('input').fill('لأنها قالب لصنع ARNm')
    s.get_by_role('button',name='تحقق',exact=True).click()
    snap(p,'19-workshop-stage1')
    s=section(p,2)
    s.get_by_role('button',name='ARN بوليميراز',exact=True).click()
    s.locator('svg g').filter(has_text='ARN بوليميراز').click()
    close_zoom(p)
    s.locator('input').fill('لا يحدث تثبيط')
    s.get_by_role('button',name='تحقق',exact=True).focus()
    s.get_by_role('button',name='تحقق',exact=True).press('Enter')
    p.wait_for_timeout(400)
    record('F15-negation',answer='لا يحدث تثبيط',inputDisabled=s.locator('input').is_disabled(),feedback=s.inner_text()[-650:])
    snap(p,'20-workshop-negation')
    s=section(p,3)
    s.get_by_role('button',name='مبدأ التكامل',exact=True).click()
    # Chaque colonne possède les quatre bases proposées.
    for i,b in enumerate(['A','U','G','C','C','A','U']):
        cell=s.locator('div.relative.group').nth(i)
        cell.hover()
        cell.get_by_role('button',name=b,exact=True).focus()
        cell.get_by_role('button',name=b,exact=True).press('Enter')
    s.locator('input').fill('AUG')
    s.get_by_role('button',name='تحقق',exact=True).focus()
    s.get_by_role('button',name='تحقق',exact=True).press('Enter')
    s=section(p,4)
    s.get_by_role('button',name='قصيرة',exact=True).click()
    s.locator('svg g').filter(has_text='بداية 1').click()
    close_zoom(p)
    s.locator('svg g').filter(has_text='نهاية 2').click()
    close_zoom(p)
    s.locator('input').fill('خيوط قصيرة في البداية وطويلة في النهاية')
    s.get_by_role('button',name='تحقق',exact=True).focus()
    s.get_by_role('button',name='تحقق',exact=True).press('Enter')
    s=section(p,5)
    s.get_by_role('button',name='ARNm',exact=True).click()
    s.locator('textarea').fill('يتم في النواة صنع ARNm باستعمال السلسلة الناسخة ومبدأ التكامل')
    s.get_by_role('button',name=re.compile('إنهاء الدرس')).focus()
    s.get_by_role('button',name=re.compile('إنهاء الدرس')).press('Enter')
    p.wait_for_timeout(500)
    record('F15-completed',has100='100%' in p.locator('main').inner_text(),text=p.locator('main').inner_text()[-1400:],state=storage(p))
    snap(p,'21-workshop-completed')
    before=storage(p)
    home(p)
    training(p,'workshop')
    record('F15-reentry',has100='100%' in p.locator('main').inner_text(),input=p.locator('main input').first.input_value(),before=before,after=storage(p))
    snap(p,'22-workshop-reset')

if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        RESULTS['browser']=browser.version
        for name,fn in [('F11',f11),('F12',f12),('F13',f13),('F14',f14),('F15',f15)]:
            ctx=browser.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
            p=ctx.new_page()
            p.set_default_timeout(10000)
            p.on('pageerror',lambda e: RESULTS['pageErrors'].append(str(e)))
            try:
                start(p)
                fn(p)
            except Exception as e:
                RESULTS['scenarioErrors'].append({'feature':name,'error':str(e)})
                snap(p,'error-'+name)
                print(name+' ERROR '+str(e).encode('ascii','backslashreplace').decode(),flush=True)
            ctx.close()
            (OUT/'browser-results.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2),encoding='utf-8')
        browser.close()
