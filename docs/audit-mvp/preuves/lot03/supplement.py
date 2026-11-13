"""Contrôles complémentaires : porte invité, documents, mobile et validateurs."""
from audit_browser import *

EXTRA={'observations':[],'pageErrors':[],'scenarioErrors':[]}
# Les fonctions importées écrivent dans ce même dictionnaire.
RESULTS.clear()
RESULTS.update(EXTRA)

def guest_bridge(p):
    home(p)
    p.get_by_test_id('btn-masari').click()
    unit=p.get_by_test_id('parcours-unit-1')
    unit.wait_for()
    unit.get_by_role('button',name='علّم كمحفوظة',exact=True).first.wait_for()
    for _ in range(15):
        toggles=unit.get_by_role('button',name='علّم كمحفوظة',exact=True)
        if not toggles.count(): break
        # Déclarations réelles par clic, pas de falsification du store.
        toggles.first.click()
        p.wait_for_timeout(70)
    p.get_by_test_id('parcours-jalon-1').get_by_role('button').first.click()
    p.get_by_test_id('qcm-livre').wait_for()
    p.wait_for_timeout(500)
    record('F11-guest-bridge',tokenPresent=p.evaluate("!!localStorage.getItem('boussole_token')"),freeChapter=p.get_by_test_id('qcm-unite-1').count())
    snap(p,'23-guest-bridge')
    click(p,'اختبار تشخيصي شامل')
    click(p,'ابدأ')
    domains=[]
    for i in range(3):
        domains.append(p.get_by_test_id('qcm-livre').inner_text())
        # Une option suffit pour constater les trois domaines successifs.
        options=p.locator('[data-testid="qcm-livre"] button.w-full.text-right')
        options.first.click()
        if i<2: click(p,'^التالي')
    record('F11-guest-bilan-three-domains',screens=domains)
    snap(p,'24-guest-bilan-domain3')

def documents(p):
    premium(p)
    training(p,'situations')
    stats=[]
    for s in META['situations']:
        p.get_by_test_id('situation-'+s['id']).click()
        stats.append({'id':s['id'],'figures':p.get_by_test_id('doc-figure').count(),'unavailable':p.get_by_test_id('doc-indisponible').count(),'contexts':p.get_by_test_id('fiche-documents').count(),'elite':p.get_by_test_id('fiche-exercices-elite').count()})
        p.get_by_test_id('fermer-fiche').click()
    record('F14-documents-inventory',cards=stats)
    # Exemple qui possède un vrai rendu documentaire.
    target=next((s for s in stats if s['figures']),None)
    if target:
        p.get_by_test_id('situation-'+target['id']).click()
        p.get_by_test_id('doc-figure').first.scroll_into_view_if_needed()
        snap(p,'25-situation-document')
        p.get_by_test_id('fermer-fiche').click()
    p.get_by_test_id('situation-lecture_shifra').click()
    p.get_by_test_id('doc-indisponible').first.scroll_into_view_if_needed()
    snap(p,'30-situation-missing-documents')

def validator(p):
    result=p.evaluate('''async()=>{
      const {validateFillBlank}=await import('/src/utils/fillBlankValidate.ts');
      const {FILL_BLANK_QUESTIONS}=await import('/src/data/fillBlanks.ts');
      const q=FILL_BLANK_QUESTIONS.find(q=>q.id==='fb_1_3');
      const expected=q.microTest.acceptedAnswers;
      const wrong='A تقابل C وG تقابل T في ADN';
      return {id:q.id,prompt:q.microTest.prompt,expected,wrong,result:validateFillBlank(wrong,expected),
        empty:validateFillBlank('',expected),exact:validateFillBlank(expected[0],expected),
        exported:FILL_BLANK_QUESTIONS.length};
    }''')
    record('F12-reversed-pairing-validator',**result)

def mobile(p):
    bubble=p.get_by_test_id('bulle-capitaine-fermer')
    if bubble.count(): bubble.click()
    premium(p)
    book(p)
    snap(p,'26-mobile-book')
    schemas(p)
    p.get_by_test_id('drill-drill_synapse').click()
    p.get_by_test_id('drill-fini').click()
    snap(p,'27-mobile-schema')
    training(p,'situations')
    p.get_by_test_id('situation-diabete_januvia').click()
    p.get_by_test_id('basculer-correction').click()
    snap(p,'28-mobile-situation')
    training(p,'workshop')
    snap(p,'29-mobile-workshop')
    record('mobile-dimensions',width=p.evaluate('innerWidth'),scrollWidth=p.evaluate('document.documentElement.scrollWidth'))

if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for name,fn in [('guest-bridge',guest_bridge),('documents',documents),('validator',validator),('mobile',mobile)]:
            ctx=browser.new_context(viewport={'width':390,'height':844} if name=='mobile' else {'width':1280,'height':900},locale='ar-DZ',is_mobile=name=='mobile',has_touch=name=='mobile')
            p=ctx.new_page()
            p.set_default_timeout(10000)
            p.on('pageerror',lambda e: RESULTS['pageErrors'].append(str(e)))
            try:
                start(p)
                fn(p)
            except Exception as e:
                RESULTS['scenarioErrors'].append({'scenario':name,'error':str(e)})
                snap(p,'error-extra-'+name)
                print(name+' ERROR '+str(e).encode('ascii','backslashreplace').decode(),flush=True)
            ctx.close()
            (OUT/'supplement-results.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2),encoding='utf-8')
        browser.close()
