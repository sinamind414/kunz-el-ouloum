"""Découverte des portes F16-F20, contextes Chromium jetables."""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(OUT.parent/'lot02'))
import browser_common as common
common.OUT=OUT
from browser_common import start,home,click,snap

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':900},locale='ar-DZ')
    start(page)
    click(page,'^مفتاح المنهجية')
    page.get_by_test_id('meftah-view').wait_for()
    snap(page,'00-method-entry')
    click(page,'الخطوات الأربع')
    snap(page,'01-simulator-entry')
    click(page,'^التمارين والتدريب')
    page.get_by_test_id('hub-tadwin').click()
    page.get_by_test_id('tadwin-demarrer').wait_for()
    snap(page,'02-tadwin-entry')
    metadata=page.evaluate('''async()=>{
      const m=await import('/src/data/meftahManhajia.ts');
      const t=await import('/src/data/tadwinCles.ts');
      const e=await import('/src/data/methodologyEngine.ts');
      const b=await import('/src/data/dictionaries/baremeCorrecteur.ts');
      const a=await import('/src/data/dictionaries/attendusBac2025.ts');
      return {levels:m.MEFTAH_LEVELS,bac:m.MEFTA_BAC_EXERCISES,
        tadwin:t.TADWIN_UNITES,verbs:e.VERB_CARDS_V2,exercises:e.TRAINING_EXERCISES,
        baremes:b.listBaremeQuestions(),groups:a.listeGroupesBac2025()};
    }''')
    (OUT/'metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2,default=str),encoding='utf-8')
    print(json.dumps({'counts':{k:len(v) for k,v in metadata.items() if isinstance(v,list)}}))
    browser.close()
