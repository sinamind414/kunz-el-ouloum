from playwright.sync_api import sync_playwright
from browser_common import *

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':900},locale='ar-DZ')
    page.set_default_timeout(12000)
    start(page)
    summaries(page)
    snap(page,'00-summaries')
    page.locator('[data-testid^="okacha-unite-"]').first.click()
    snap(page,'01-summary-unit')
    maps(page)
    page.wait_for_timeout(1300)
    snap(page,'02-mindmap')
    page.locator('.node-item').first.click(force=True)
    snap(page,'03-node-details')
    if page.locator('.pfe-zoom-overlay.is-open').count():
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)
    data=page.evaluate("""async()=>{
      const m=await import('/src/data/mindMapData.ts');
      const a=await import('/src/components/ScienceAnimations.tsx');
      const c=await import('/src/data/microCapsules.ts');
      return {maps:Object.fromEntries(Object.entries(m.MIND_MAPS_DATABASE).map(([k,v])=>[k,{...v,nodes:v.nodes.map(n=>({id:n.id,label:n.label,unitId:n.unitId}))}])),
        animations:a.ANIMATION_CATALOG.map(({id,titleAr,unitAr})=>({id,titleAr,unitAr})),
        capsuleExports:Object.keys(c)};
    }""")
    (OUT/'metadata.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    animations(page)
    snap(page,'04-animations')
    revision(page)
    snap(page,'05-capsules')
    home(page)
    snap(page,'06-home-quiz-entry')
    browser.close()
