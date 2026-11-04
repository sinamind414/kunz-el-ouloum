"""Contre-épreuves bornées : pas de copies de calibration ni de compte réel."""
from audit_browser import *

RESULTS.clear()
RESULTS.update({'observations':[],'pageErrors':[],'scenarioErrors':[]})

def guards(p):
    data=p.evaluate('''async()=>{
      const a=await import('/src/data/dictionaries/attendusBac2025.ts');
      const c=await import('/src/data/dictionaries/calibrationBac2025.ts');
      return a.listeGroupesBac2025().map(g=>{
        const r=a.attendusDeGroupe(g.sujet,g.exercice);
        const forms=r.items.flatMap(i=>[...i.formes,...(i.composantes??[]).flat()]);
        const empty=c.noterExerciceCalibre('',g.sujet,g.exercice);
        const salad=c.noterExerciceCalibre(forms.join(' '),g.sujet,g.exercice);
        return {sujet:g.sujet,exercice:g.exercice,max:r.maxPts,
          empty:{points:empty.pointsAutoAcquis,reserve:empty.pointsManuelsAArbitrer,noteFinale:empty.noteFinale,
            manual:empty.verdicts.filter(v=>!v.auto),autoCredit:empty.verdicts.filter(v=>v.auto&&v.credite).length},
          keywordsOnly:{points:salad.pointsAutoAcquis,plafonds:salad.plafonds,reserve:salad.pointsManuelsAArbitrer}};
      });
    }''')
    record('F19-engine-boundaries-six-groups',groups=data)

def bad_tadwin(p):
    tadwin(p)
    p.get_by_test_id('tadwin-demarrer').click()
    for field,submit in [('tadwin-restitution','tadwin-restitution-envoyer'),('tadwin-cle1','tadwin-cle1-envoyer'),('tadwin-assistee','tadwin-assistee-envoyer')]:
        p.get_by_test_id(field).fill('نص تجريبي')
        p.get_by_test_id(submit).click()
    p.get_by_test_id('tadwin-cle-0').click()
    p.get_by_test_id('tadwin-cle-1').click()
    p.get_by_test_id('tadwin-choix-valider').click()
    p.get_by_test_id('tadwin-reponse').fill('درس شيق يتحدث عن البروتين وأهميته في الجسم.')
    p.get_by_test_id('tadwin-evaluer').click()
    record('F18-zero-coverage-saved',coverage=p.get_by_test_id('tadwin-c2').inner_text(),state=state(p))
    snap(p,'27-tadwin-zero-coverage')
    p.get_by_test_id('tadwin-vers-consolidation').click()
    record('F18-zero-consolidated',state=state(p),editors=p.locator('main textarea').count(),selectors=p.locator('main select').count())
    snap(p,'28-tadwin-zero-consolidation')

def print_controls(p):
    method(p)
    click(p,'بطاقة المفتاح — للطباعة')
    p.locator('.miftah-root').wait_for()
    p.locator('main').hover()
    p.mouse.wheel(0,-100000)
    p.wait_for_timeout(350)
    print_pdf(p,'29-card-print-top')
    cardText=p.locator('.miftah-root').inner_text()
    record('F17-print-source',characters=len(cardText),start=cardText[:130],end=cardText[-130:])
    s=p.context.new_page()
    s.goto('http://localhost:3000/miftah.html',wait_until='networkidle')
    s.pdf(path=str(OUT/'standalone-css-size.pdf'),prefer_css_page_size=True,print_background=True)
    doc=fitz.open(OUT/'standalone-css-size.pdf')
    record('F17-css-page-size',pages=len(doc),characters=[len(x.get_text())for x in doc])
    doc.close()
    s.close()

def mobile(p):
    method(p)
    snap(p,'30-mobile-meftah')
    p.get_by_test_id('meftah-level-base').click()
    snap(p,'31-mobile-method-base')
    tadwin(p)
    snap(p,'32-mobile-tadwin')
    record('mobile-widths',width=p.evaluate('innerWidth'),scrollWidth=p.evaluate('document.documentElement.scrollWidth'))

def resume_family(p):
    premium(p)
    home(p)
    click(p,'^التمارين والتدريب')
    p.get_by_test_id('hub-bacideas').click()
    p.get_by_test_id('bac-ideas').wait_for()
    p.locator('[data-testid^="entrainer-"]').first.click()
    families=p.locator('[data-testid^="trainer-famille-"]')
    assert families.count()>1
    selected=families.nth(1).get_attribute('data-testid').replace('trainer-famille-','')
    families.nth(1).click()
    answer='هذا نص تجريبي للتحقق من استعادة الإجابة المحفوظة.'
    p.get_by_test_id('trainer-reponse').fill(answer)
    p.get_by_test_id('trainer-fermer').click()
    p.get_by_test_id('basculer-revue').click()
    p.locator('[data-testid^="review-reprendre-"]').filter(has=p.locator('span')).first.click()
    record('F20-resume-nondefault-family',expectedFamily=selected,expectedAnswer=answer,
        actualAnswer=p.get_by_test_id('trainer-reponse').input_value(),
        families=p.locator('[data-testid^="trainer-famille-"]').evaluate_all('(xs)=>xs.map(x=>({id:x.dataset.testid,class:x.className}))'),state=state(p))
    snap(p,'34-resume-wrong-family')

if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for name,fn in [('guards',guards),('bad-tadwin',bad_tadwin),('print-controls',print_controls),('mobile',mobile),('resume-family',resume_family)]:
            ctx=browser.new_context(viewport={'width':390,'height':844} if name=='mobile' else {'width':1280,'height':900},locale='ar-DZ',is_mobile=name=='mobile',has_touch=name=='mobile')
            p=ctx.new_page()
            p.set_default_timeout(10000)
            p.on('pageerror',lambda e:RESULTS['pageErrors'].append(str(e)))
            try:
                start(p)
                dismiss(p)
                fn(p)
            except Exception as e:
                RESULTS['scenarioErrors'].append({'scenario':name,'error':str(e)})
                snap(p,'error-extra-'+name)
                print(name+' ERROR '+str(e).encode('ascii','backslashreplace').decode(),flush=True)
            ctx.close()
            (OUT/'supplement-results.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2),encoding='utf-8')
        browser.close()
    if RESULTS['scenarioErrors'] or RESULTS['pageErrors']:
        raise SystemExit(1)
