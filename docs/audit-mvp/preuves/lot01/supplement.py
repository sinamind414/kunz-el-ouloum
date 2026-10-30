"""Contrôles complémentaires : reprise sur reload et retour depuis paywall HTML."""
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright
from explorer import start, dump
from audit_browser import lessons, click, active, search, storage

OUT=Path(__file__).resolve().parent
results={}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    ctx=browser.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
    page=ctx.new_page()
    start(page)
    active(page)
    click(page,'ابدأ الدرس النشيط')
    data=json.loads((OUT/'catalogue.json').read_text(encoding='utf-8'))
    block=data['lessons']['d1-u1-l1-expression-genique']['blocks'][0]
    click(page,re.escape(block['choices'][0]['labelAr']))
    results['beforeReload']=storage(page)
    start(page)  # nouvelle navigation document, même contexte de stockage
    active(page)
    results['afterReload']=storage(page)
    results['reloadHasMissionStart']=page.get_by_role('button',name='ابدأ الدرس النشيط',exact=True).count()>0
    dump(page,'21-active-reload')
    search(page,'التركيب الضوئي')
    # Les boutons favori et ouverture sont présents uniquement sur les leçons.
    stars=page.get_by_role('button',name='إضافة إلى المفضلة',exact=True)
    for i in range(stars.count()):
        # Une étoile ajoutée quitte ce locator : toujours prendre la première.
        stars.first.click()
    favorites=page.evaluate("JSON.parse(localStorage.getItem('boussole_favorites')||'[]')")
    # L'ordre d'insertion est inversé par unshift ; retrouver l'index d'affichage.
    ordered=list(reversed(favorites))
    results['searchLessons']=ordered
    htmlIndex=next((i for i,f in enumerate(ordered) if f['lessonKind']=='html' and f['unitId']==6),None)
    if htmlIndex is not None:
        page.get_by_role('button',name='فتح الدرس',exact=True).nth(htmlIndex).click()
        page.wait_for_timeout(400)
        results['htmlPaywall']={'lesson':ordered[htmlIndex],
          'hasCodeInput':page.locator('input').count()>0,
          'returnButtons':page.get_by_role('button',name=re.compile('عودة')).count(),
          'text':page.locator('body').inner_text()}
        dump(page,'22-html-search-paywall')
    else:
        results['htmlPaywall']='No matching HTML lesson in this query'
    (OUT/'supplement-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'reloadHasMissionStart':results['reloadHasMissionStart'],
      'htmlPaywall':{k:v for k,v in results.get('htmlPaywall',{}).items() if k!='text'} if isinstance(results.get('htmlPaywall'),dict) else results.get('htmlPaywall')},ensure_ascii=True))
    browser.close()
