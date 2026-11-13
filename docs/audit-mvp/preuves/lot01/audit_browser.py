"""Audit F01-F05, Chromium réel. Aucun compte ni état utilisateur réel utilisé.

Prérequis : serveur local :3000, Python playwright et Chromium déjà installés.
Les réponses de parcours sont des fixtures techniques issues des attendus ;
elles ne valident ni la pertinence pédagogique ni la robustesse du correcteur.
"""
import json
import re
import traceback
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright
from explorer import start, dump

OUT = Path(__file__).resolve().parent
RESULT = {'date':datetime.now(timezone.utc).isoformat(),'base':'http://localhost:3000',
          'mode':'development','profile':'guest, isolated browser context',
          'checks':[], 'pageErrors':[], 'failedRequests':[]}

def record(name, **data):
    RESULT['checks'].append({'name':name, **data})
    print(json.dumps({'check':name,**data},ensure_ascii=True),flush=True)
    (OUT/'browser-results.json').write_text(json.dumps(RESULT,ensure_ascii=False,indent=2),encoding='utf-8')

def click(page, text):
    page.get_by_role('button',name=re.compile(text)).filter(visible=True).first.click()
    page.wait_for_timeout(250)

def lessons(page):
    click(page,'^الرئيسية')
    click(page, '^الدروس')

def home(page):
    click(page,'^الرئيسية')

def search(page, query):
    lessons(page)
    click(page,'بحث في كل الدروس')
    field=page.get_by_role('searchbox')
    field.fill(query)
    page.wait_for_timeout(900)
    return field

def active(page,key='d1-u1-l1-expression-genique'):
    lessons(page)
    click(page,'الدرس النشيط')
    page.get_by_test_id('unite-active-1').click()
    page.get_by_test_id('lecon-active-'+key).click()
    page.wait_for_timeout(300)

def storage(page):
    return page.evaluate("""() => Object.fromEntries(Object.entries(localStorage)
      .filter(([k])=>k.startsWith('kunz_lesson_session')||k==='kunz_parcours_v1'))""")

def sequence(page):
    home(page)
    page.get_by_test_id('btn-masari').click()
    page.get_by_test_id('parcours-header').wait_for()

def snapshot(page,name):
    dump(page,name)

def run_desktop(browser):
    ctx=browser.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
    page=ctx.new_page()
    page.on('pageerror',lambda e:RESULT['pageErrors'].append(str(e)))
    page.on('requestfailed',lambda req:RESULT['failedRequests'].append({'url':req.url,'error':req.failure}))
    start(page)
    RESULT['browser']=browser.version

    # F01 : toutes les unités depuis les portes visibles, accès invité.
    lessons(page)
    click(page,'الدرس الرسمي')
    domains=page.locator('[data-testid^="domaine-"]').count()
    units=[]
    for domain in range(1,4):
        page.get_by_test_id('domaine-'+str(domain)).click()
        units.extend(page.locator('[data-testid^="unite-"]').evaluate_all('(els)=>els.map(e=>e.dataset.testid)'))
        click(page,'عودة')
    record('F01-catalogue-ui',domains=domains,units=units)

    # F02 : ouverture, interaction dans la sandbox et navigation vers le suivant.
    page.get_by_test_id('domaine-1').click()
    page.get_by_test_id('unite-1').click()
    page.get_by_test_id('chapitre-phase1_chapitres_1_2').click()
    page.locator('iframe').wait_for()
    page.wait_for_timeout(700)
    frame=page.frames[1]
    before=frame.locator('body').inner_text()
    qbutton=frame.get_by_role('button',name=re.compile(r'ب\)'))
    qbutton.click()
    after=frame.locator('body').inner_text()
    record('F02-html-quiz',title=page.locator('iframe').get_attribute('title'),
           bodyLength=len(before),feedbackChanged=before!=after,
           brokenImages=frame.locator('img').evaluate_all('(els)=>els.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)'),
           sandbox=page.locator('iframe').get_attribute('sandbox'))
    snapshot(page,'06-html-quiz')
    click(page,'الدرس الموالي')
    page.wait_for_timeout(500)
    record('F02-html-next',title=page.locator('iframe').get_attribute('title'))
    click(page,'عودة إلى قائمة الدروس')
    record('F02-html-return',chaptersVisible=page.get_by_test_id('chapitres-icones').is_visible())

    # F03 : progression d'une mission puis sortie et retour.
    active(page)
    click(page,'ابدأ الدرس النشيط')
    data=json.loads((OUT/'catalogue.json').read_text(encoding='utf-8'))
    fixture=data['lessons']['d1-u1-l1-expression-genique']['blocks']
    first=fixture[0]['choices'][0]['labelAr']
    click(page,re.escape(first))
    saved=storage(page)
    snapshot(page,'07-active-before-back')
    click(page,'عودة إلى قائمة الدروس النشيطة')
    afterback=storage(page)
    page.get_by_test_id('lecon-active-d1-u1-l1-expression-genique').click()
    record('F03-resume-after-back',before=saved,afterBack=afterback,
           missionScreenReturned=page.get_by_role('button',name='ابدأ الدرس النشيط',exact=True).count()>0)
    snapshot(page,'08-active-after-back')

    # F03 : compléter les six blocs avec des fixtures techniques connues.
    click(page,'ابدأ الدرس النشيط')
    for index,block in enumerate(fixture):
        kind=block['type']
        if kind=='MISSION_CHOICE':
            choice=next((c for c in block['choices'] if c.get('completeOnSelect')),block['choices'][0])
            click(page,re.escape(choice['labelAr']))
        elif kind=='GUIDED_DOC_QA':
            click(page,'تحقّق من الأجوبة')
            record('F03-empty-answer',errorVisible='أعد العمل' in page.locator('body').inner_text())
            for qi,q in enumerate(block['questions']):
                answer=' '.join(q.get('orderedKeywords',[])+q.get('requiredKeywords',[]))
                page.locator('textarea').nth(qi).fill(answer)
            click(page,'تحقّق من الأجوبة')
        elif kind=='DUAL_EVIDENCE':
            page.locator('textarea').nth(0).fill(' '.join(block['extractionKeywords']))
            page.locator('textarea').nth(1).fill(' '.join(block['justificationKeywords']))
            page.get_by_role('button',name='تحقّق',exact=True).click()
        elif kind=='HYPOTHESIS_EXPERIMENT':
            for i,values in enumerate([block['expectedTargets'],block['resultKeywords'],block['validationKeywords']]):
                page.locator('textarea').nth(i).fill(' '.join(values))
            page.get_by_role('button',name='تحقّق',exact=True).click()
        else:
            raise AssertionError('Unsupported fixture block '+kind)
        page.wait_for_timeout(200)
        record('F03-block-'+str(index),kind=kind,session=storage(page))
    click(page,'أتقنت جيداً')
    record('F03-completion',nextButtons=page.get_by_role('button',name=re.compile('الدرس الموالي')).count(),storage=storage(page))
    snapshot(page,'09-active-completed')
    click(page,'الدرس الموالي')
    record('F03-next-lesson-state',text=page.locator('body').inner_text()[-2400:],storage=storage(page))
    snapshot(page,'10-active-next')

    # F04 : recherche, cas vide, favoris, ouverture et accès gratuit/payant.
    field=search(page,'zzzzzzzzz')
    record('F04-no-result',messageVisible='لا توجد نتائج' in page.locator('body').inner_text())
    field.fill('تركيب البروتين')
    page.get_by_role('button',name='فتح الدرس',exact=True).first.wait_for()
    field.press('Enter')
    record('F04-query',openableLessons=page.get_by_role('button',name='فتح الدرس',exact=True).count())
    stars=page.get_by_role('button',name='إضافة إلى المفضلة',exact=True)
    stars.first.click()
    snapshot(page,'11-search-results')
    ctx.set_offline(True)
    field.fill('البروتين')
    page.wait_for_timeout(400)
    record('F04-warm-offline-search',openableLessons=page.get_by_role('button',name='فتح الدرس',exact=True).count())
    ctx.set_offline(False)
    page.get_by_role('button',name='فتح الدرس',exact=True).first.click()
    page.wait_for_timeout(400)
    record('F04-open-result',iframe=page.locator('iframe').count(),bodyTail=page.locator('body').inner_text()[-500:])
    # revenir par navigation principale pour contrôler la persistance des favoris.
    search(page,'')
    record('F04-favorites-recents',favorites=page.get_by_role('button',name='إزالة من المفضلة',exact=True).count(),
           hasRecent='عمليات البحث الأخيرة' in page.locator('body').inner_text())
    field=page.get_by_role('searchbox')
    field.fill('التركيب الضوئي')
    page.wait_for_timeout(700)
    record('F04-paid-search',openableLessons=page.get_by_role('button',name='فتح الدرس',exact=True).count())
    page.get_by_role('button',name='إضافة إلى المفضلة',exact=True).first.click()
    record('F04-paid-result-identity',favorites=page.evaluate("JSON.parse(localStorage.getItem('boussole_favorites'))"),tokenPresent=page.evaluate("!!localStorage.getItem('boussole_token')"))
    page.get_by_role('button',name='فتح الدرس',exact=True).first.click()
    page.wait_for_timeout(350)
    record('F04-paid-result-return',returnButtons=page.get_by_role('button',name=re.compile('عودة')).count(),
           iframe=page.locator('iframe').count(),bodyTail=page.locator('body').inner_text()[-1300:])
    snapshot(page,'12-paid-search-result')

    # Comparaison : une leçon active correctement rattachée à U6 reste verrouillée.
    lessons(page)
    click(page,'الدرس النشيط')
    page.get_by_test_id('unite-active-6').click()
    page.get_by_test_id('lecon-active-d2-u6-l1-hill-ruben').click()
    record('F01-paid-normal-gate',missionVisible=page.get_by_role('button',name='ابدأ الدرس النشيط',exact=True).count()>0,
           hasCodeInput=page.locator('input').count()>0,text=page.locator('body').inner_text()[-1700:])
    snapshot(page,'19-paid-normal-gate')

    # F02 : panne simulée du téléchargement HTML, retour toujours possible.
    lessons(page)
    click(page,'الدرس الرسمي')
    page.get_by_test_id('domaine-1').click()
    page.get_by_test_id('unite-1').click()
    page.route('**/lessons/phase1_chapitres_1_2.html',lambda route:route.abort())
    page.get_by_test_id('chapitre-phase1_chapitres_1_2').click()
    page.get_by_text('تعذّر تحميل الدرس.',exact=True).wait_for()
    record('F02-load-error',explicitError=True,returnVisible=page.get_by_role('button',name=re.compile('عودة إلى قائمة الدروس')).is_visible())
    snapshot(page,'20-html-load-error')
    page.unroute('**/lessons/phase1_chapitres_1_2.html')

    # F05 : ouverture, état commencé, marquage déclaratif, annulation et reload.
    sequence(page)
    rows=page.locator('li[data-testid^="parcours-"]')
    record('F05-initial',rows=rows.count(),enabledRows=rows.filter(has=page.locator('button')).count(),
           lockedRows=page.locator('li [aria-disabled="true"]').count())
    snapshot(page,'13-parcours')
    firstrow=page.get_by_test_id('parcours-row-phase1_chapitres_1_2')
    firstrow.get_by_role('button').first.click()
    record('F05-open',iframe=page.locator('iframe').count(),storage=storage(page))
    sequence(page)
    page.get_by_test_id('parcours-row-phase1_chapitres_1_2-toggle').click()
    stateMarked=storage(page)
    second=page.get_by_test_id('parcours-row-lecon_transcription')
    record('F05-declarative-completion',storage=stateMarked,secondEnabled=second.get_by_role('button').count()>0)
    page.get_by_test_id('parcours-row-phase1_chapitres_1_2-toggle').click()
    record('F05-undo',storage=storage(page),secondEnabled=second.get_by_role('button').count()>0)
    page.get_by_test_id('parcours-row-phase1_chapitres_1_2-toggle').click()
    page.reload(wait_until='networkidle')
    # Le rechargement retourne à l'accueil initial, sans effacer la progression.
    record('F05-reload-persistence',storage=storage(page))
    start(page)
    sequence(page)
    dialogs=[]
    page.on('dialog',lambda dialog:(dialogs.append(dialog.message),dialog.dismiss()))
    click(page,'إعادة تعيين المسار')
    record('F05-reset',dialogs=dialogs,storage=storage(page))
    ctx.close()

def run_mobile(browser):
    ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,locale='ar-DZ')
    page=ctx.new_page()
    start(page)
    lessons(page)
    page.get_by_role('button',name=re.compile('الدرس الرسمي')).wait_for()
    snapshot(page,'14-mobile-lessons')
    record('mobile-lessons-overflow',dimensions=page.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})'))
    click(page,'الدرس الرسمي')
    page.get_by_test_id('domaine-1').click()
    page.get_by_test_id('unite-1').click()
    page.get_by_test_id('chapitre-phase1_chapitres_1_2').click()
    page.wait_for_timeout(700)
    snapshot(page,'15-mobile-html')
    frame=page.frames[1]
    record('mobile-html-overflow',outer=page.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})'),
           frame=frame.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})'))
    active(page)
    click(page,'ابدأ الدرس النشيط')
    snapshot(page,'16-mobile-active')
    sequence(page)
    snapshot(page,'17-mobile-parcours')
    record('mobile-parcours-overflow',dimensions=page.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})'))
    search(page,'البروتين')
    snapshot(page,'18-mobile-search')
    record('mobile-search',openableLessons=page.get_by_role('button',name='فتح الدرس',exact=True).count())
    ctx.close()

if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            run_desktop(browser)
            run_mobile(browser)
        except Exception:
            RESULT['harnessError']=traceback.format_exc()
            print(RESULT['harnessError'].encode('ascii','backslashreplace').decode())
        finally:
            (OUT/'browser-results.json').write_text(json.dumps(RESULT,ensure_ascii=False,indent=2),encoding='utf-8')
            browser.close()
    if 'harnessError' in RESULT:
        raise SystemExit(1)
