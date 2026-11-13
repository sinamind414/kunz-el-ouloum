"""F16-F20 : parcours réels, productions techniques synthétiques seulement.

Aucun fichier élève ni corpus de calibration consulté. Seul F20 emploie une
simulation d'accès client (pas d'authentification/facturation validée).
"""
import json
import re
import sys
from pathlib import Path
import fitz
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(OUT.parent/'lot02'))
import browser_common as common
common.OUT=OUT
from browser_common import start,home,click,snap

META=json.loads((OUT/'metadata.json').read_text(encoding='utf-8'))
RESULTS={'observations':[],'pageErrors':[],'scenarioErrors':[]}

def record(name,**kw):
    RESULTS['observations'].append({'name':name,**kw})
    print(name,flush=True)

def method(p):
    click(p,'^مفتاح المنهجية')
    p.locator('main').get_by_role('button',name=re.compile('الخطوات الأربع')).wait_for()
    p.wait_for_timeout(350)

def state(p):
    return p.evaluate("()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>!['svt_flashcards','svt_quiz_questions'].includes(k)))")

def reload_app(p):
    # start recharge l'URL et traverse les écrans d'accueil sans vider le store.
    start(p)
    # Après l'horloge simulée, l'animation d'accueil peut finir après start.
    welcome=p.get_by_role('button',name='ابدأ رحلة التعلم',exact=True)
    if welcome.count():
        welcome.click()
        p.wait_for_timeout(700)
    dismiss(p)

def tadwin(p):
    home(p)
    click(p,'^التمارين والتدريب')
    p.get_by_test_id('hub-tadwin').click()
    p.wait_for_timeout(650)

def dismiss(p):
    later=p.get_by_role('button',name='ليس الآن',exact=True)
    if later.count() and later.first.is_visible(): later.first.click()
    b=p.get_by_test_id('bulle-capitaine-fermer')
    if b.count(): b.click()

def premium(p):
    p.context.route('**/api/**',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps(
        {'statut':'essai','expireLe':'2099-06-30','joursRestants':30} if 'entitlement' in r.request.url else {})))
    p.evaluate("()=>{localStorage.setItem('boussole_token','audit-local-fixture-not-a-real-token');localStorage.setItem('kunz_acces',JSON.stringify({statut:'essai',expireLe:'2099-06-30'}))}")

def print_pdf(p,name):
    p.pdf(path=str(OUT/(name+'.pdf')),format='A4',print_background=True)
    doc=fitz.open(OUT/(name+'.pdf'))
    result={'pages':len(doc),'text':[page.get_text() for page in doc]}
    (OUT/(name+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    # Preuve visuelle issue de l'impression Chromium, PDF local ignoré par Git.
    doc[0].get_pixmap(matrix=fitz.Matrix(1.2,1.2)).save(str(OUT/(name+'.png')))
    record(name,pages=len(doc),characters=[len(t) for t in result['text']])
    doc.close()

def f16(p):
    method(p)
    p.get_by_test_id('meftah-home').wait_for()
    record('F16-home',levels=p.locator('[data-testid^="meftah-level-"]').count(),guest=p.evaluate("!localStorage.getItem('boussole_token')"))
    p.get_by_test_id('meftah-level-base').click()
    p.get_by_test_id('meftah-level-view-base').wait_for()
    view=p.get_by_test_id('meftah-level-view-base')
    record('F16-base',text=view.inner_text()[:1200])
    snap(p,'03-meftah-base')
    search=p.get_by_placeholder('ابحث في المفتاح...')
    search.fill('NO_AUDIT_MATCH_123')
    snap(p,'04-meftah-search-empty')
    record('F16-search-empty',text=view.inner_text())
    search.fill('')
    click(p,'الرجوع إلى المفتاح')
    p.get_by_test_id('meftah-level-bac').click()
    p.get_by_test_id('meftah-bac-exercise-bac2025-ex1').click()
    q='bac2025-ex1-q2'
    p.get_by_test_id(q+'-header').click()
    record('F16-bac-hidden',modelVisible=p.get_by_test_id(q+'-modele').count())
    snap(p,'05-meftah-bac-hidden')
    p.get_by_test_id(q+'-devoiler').click()
    record('F16-bac-revealed',text=p.get_by_test_id(q+'-modele').inner_text())
    snap(p,'06-meftah-bac-revealed')
    card=p.get_by_test_id('meftah-bac-question-'+q)
    card.get_by_role('button',name=re.compile('تدرب على الفعل')).click()
    p.wait_for_timeout(500)
    record('F16-verb-link',requested='explain',selected=p.locator('main select').evaluate_all('(xs)=>xs.map(x=>({value:x.value,text:x.selectedOptions[0]?.textContent}))'),headings=p.locator('main h2,main h3').all_text_contents())
    snap(p,'07-meftah-verb-destination')
    home(p)
    method(p)
    record('F16-reentry',home=p.get_by_test_id('meftah-home').count())

def f17(p):
    method(p)
    click(p,'بطاقة المفتاح — للطباعة')
    p.locator('main a[href="/miftah.html"]').wait_for()
    record('F17-primary-card',legacyVisible=p.locator('.boussole-card').count(),standalone=p.locator('main a[href="/miftah.html"]').get_attribute('href'))
    snap(p,'08-card-primary')
    p.locator('main summary').filter(has_text='بطاقة البوصلة المدمجة').click()
    p.locator('.boussole-card').wait_for()
    record('F17-legacy',steps=p.locator('.boussole-card h2').all_text_contents(),text=p.locator('.boussole-card').inner_text()[-800:])
    snap(p,'09-boussole-legacy')
    print_pdf(p,'10-card-app-print')
    standalone=p.context.new_page()
    standalone.goto('http://localhost:3000/miftah.html',wait_until='networkidle')
    record('F17-standalone',status=standalone.locator('body').inner_text()[:600])
    print_pdf(standalone,'11-card-standalone-print')
    standalone.close()

def f18(p):
    tadwin(p)
    p.get_by_test_id('tadwin-unite-select').select_option('1')
    p.get_by_test_id('tadwin-demarrer').click()
    record('F18-empty',disabled=p.get_by_test_id('tadwin-restitution-envoyer').is_disabled())
    p.get_by_test_id('tadwin-restitution').fill('استنساخ وترجمة')
    p.get_by_test_id('tadwin-restitution-envoyer').click()
    p.get_by_test_id('tadwin-cle1').fill('يتم الاستنساخ في النواة')
    p.get_by_test_id('tadwin-cle1-envoyer').click()
    p.get_by_test_id('tadwin-assistee').fill('كلمة '*25)
    record('F18-stuffing-warning',text=p.locator('main').inner_text()[-1000:])
    snap(p,'12-tadwin-assisted')
    p.get_by_test_id('tadwin-assistee').fill('الزبدة: استنساخ ثم ترجمة')
    p.get_by_test_id('tadwin-assistee-envoyer').click()
    record('F18-selection-minimum',disabled=p.get_by_test_id('tadwin-choix-valider').is_disabled())
    p.get_by_test_id('tadwin-cle-0').click()
    p.get_by_test_id('tadwin-cle-1').click()
    p.get_by_test_id('tadwin-choix-valider').click()
    answer='تتمثل المرحلة الأولى من التعبير المورثي في استنساخ المعلومة الوراثية داخل النواة، حيث تتدخل إنزيمة ARN بوليميراز لتركيب جزيئة ARNm انطلاقاً من إحدى سلسلتي ADN.'
    p.get_by_test_id('tadwin-reponse').fill(answer)
    record('F18-draft-before-reload',state=state(p))
    reload_app(p)
    tadwin(p)
    record('F18-draft-after-reload',selected=p.locator('[data-testid="tadwin-reponse"]').count(),stage3Selection=p.get_by_test_id('tadwin-cle-0').count())
    snap(p,'13-tadwin-draft-reset')
    p.get_by_test_id('tadwin-cle-0').click()
    p.get_by_test_id('tadwin-cle-1').click()
    p.get_by_test_id('tadwin-choix-valider').click()
    p.get_by_test_id('tadwin-reponse').fill(answer)
    p.get_by_test_id('tadwin-evaluer').click()
    record('F18-verdict',coverage=p.get_by_test_id('tadwin-c2').inner_text(),verdict=p.get_by_test_id('tadwin-verdict').inner_text(),state=state(p))
    snap(p,'14-tadwin-verdict')
    p.get_by_test_id('tadwin-vers-consolidation').click()
    record('F18-consolidation',selectors=p.get_by_test_id('tadwin-unite-select').count(),newProduction=p.get_by_test_id('tadwin-choix-valider').count(),text=p.locator('main').inner_text(),state=state(p))
    snap(p,'15-tadwin-no-new-sheet')
    reload_app(p)
    tadwin(p)
    record('F18-reentry-consolidation',state=state(p),newProduction=p.get_by_test_id('tadwin-evaluer').count())
    due=p.evaluate("JSON.parse(localStorage.getItem('kunz_tadwin_fiches_v1'))[0].prochainRappelAt")
    # Simulation explicite du temps, sans modifier les dates sauvegardées.
    p.clock.set_system_time(due+1000)
    p.wait_for_timeout(700)
    dismiss(p)
    home(p)
    dismiss(p)
    tadwin(p)
    reveal=p.locator('[data-testid^="tadwin-rappel-reveler-"]').first
    reveal.wait_for()
    record('F18-recall-hidden',answerVisible=answer in p.locator('main').inner_text())
    reveal.click()
    snap(p,'16-tadwin-recall-revealed')
    p.locator('[data-testid^="tadwin-rappel-ok-"]').first.click()
    record('F18-recall-graded',state=state(p),selectors=p.get_by_test_id('tadwin-unite-select').count())

def stage3(p):
    click(p,'الخطوات الأربع')
    click(p,'Guidée')
    click(p,r'^قفل\s+وثيقة')
    click(p,'^وثيقة فقط')
    click(p,'^الصورة')
    p.locator('main textarea').first.wait_for()

def f19(p):
    method(p)
    stage3(p)
    p.locator('main textarea').first.fill('WRONG')
    click(p,'تقييم الإجابة وحساب ICM')
    record('F19-wrong-production',state=state(p),text=p.locator('main').inner_text()[-1500:])
    snap(p,'17-method-wrong')
    answer=META['exercises'][0]['stage1']['expertAnswer']
    p.locator('main textarea').first.fill(answer)
    click(p,'تقييم الإجابة وحساب ICM')
    record('F19-model-production',state=state(p))
    snap(p,'18-method-model-result')
    click(p,'^المصححة')
    p.get_by_role('heading',name='المصححة — قائمة التصحيح').wait_for()
    record('F19-queue',tokenPresent=p.evaluate("!!localStorage.getItem('boussole_token')"),state=state(p))
    snap(p,'19-correction-queue')
    click(p,'المصحح الآلي')
    p.locator('main select').first.wait_for()
    combos=p.locator('main select')
    groups=combos.filter(has=p.locator('option[value="1-1"]'))
    groups.first.select_option('1-3')
    record('F19-official-panel',text=p.locator('main').inner_text()[-6500:])
    snap(p,'20-official-manual-reserve')
    click(p,'^المضمون سليم$')
    record('F19-self-approval',state=state(p),tokenPresent=p.evaluate("!!localStorage.getItem('boussole_token')"))
    snap(p,'21-guest-self-approval')
    reload_app(p)
    method(p)
    click(p,'^المصححة')
    record('F19-after-reload',state=state(p))
    # Le carnet d'évolution est une autre vue du même vrai travail corrigé.
    click(p,'مصفوفة الإتقان')
    record('F20-method-evolution',text=p.locator('main').inner_text()[-1800:])
    snap(p,'22-method-evolution')

def f20(p):
    premium(p)
    home(p)
    click(p,'^التمارين والتدريب')
    p.get_by_test_id('hub-bacideas').click()
    p.get_by_test_id('bac-ideas').wait_for()
    dismiss(p)
    p.locator('[data-testid^="entrainer-"]').first.click()
    p.get_by_test_id('trainer-reponse').wait_for()
    chosen=p.locator('[data-testid^="trainer-famille-"]').first
    family=chosen.get_attribute('data-testid').replace('trainer-famille-','')
    chosen.click()
    answer='نلاحظ أن النشاط يرتفع.'
    p.get_by_test_id('trainer-reponse').fill(answer)
    record('F20-write',family=family,state=state(p),verdict=p.get_by_test_id('trainer-verdict').inner_text())
    snap(p,'23-writing-trainer')
    p.get_by_test_id('trainer-fermer').click()
    p.get_by_test_id('basculer-revue').click()
    p.get_by_test_id('writing-review').wait_for()
    record('F20-review',summary=p.get_by_test_id('review-bilan').inner_text())
    snap(p,'24-writing-review')
    p.get_by_test_id('basculer-rapport').click()
    record('F20-report',text=p.get_by_test_id('writing-report').inner_text())
    snap(p,'25-writing-report')
    print_pdf(p,'26-writing-report-print')
    p.locator('main').hover()
    p.mouse.wheel(0,-100000)
    p.wait_for_timeout(350)
    print_pdf(p,'33-writing-report-print-top')
    p.get_by_test_id('rapport-fermer').click()
    p.locator('[data-testid^="review-reprendre-"]').first.click()
    record('F20-resume',expected=answer,actual=p.get_by_test_id('trainer-reponse').input_value(),family=family)
    p.get_by_test_id('trainer-reponse').fill(answer+' هذا تعديل للاختبار.')
    reload_app(p)
    home(p)
    click(p,'^التمارين والتدريب')
    p.get_by_test_id('hub-bacideas').click()
    p.get_by_test_id('bac-ideas').wait_for()
    record('F20-after-reload',state=state(p))

if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        RESULTS['browser']=browser.version
        for name,fn in [('F16',f16),('F17',f17),('F18',f18),('F19',f19),('F20',f20)]:
            ctx=browser.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
            p=ctx.new_page()
            p.set_default_timeout(10000)
            p.on('pageerror',lambda e:RESULTS['pageErrors'].append(str(e)))
            try:
                start(p)
                dismiss(p)
                fn(p)
            except Exception as e:
                RESULTS['scenarioErrors'].append({'feature':name,'error':str(e)})
                snap(p,'error-'+name)
                print(name+' ERROR '+str(e).encode('ascii','backslashreplace').decode(),flush=True)
            ctx.close()
            (OUT/'browser-results.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2),encoding='utf-8')
        browser.close()
    if RESULTS['scenarioErrors'] or RESULTS['pageErrors']:
        raise SystemExit(1)
