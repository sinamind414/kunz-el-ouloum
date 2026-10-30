"""Exploration réelle Chromium, aucun compte ni donnée élève réelle."""
import sys
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent
sys.path.insert(0, str(OUT.parent / 'lot02'))
import browser_common as common
common.OUT = OUT
from browser_common import start, click, home, snap

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width':1280,'height':900}, locale='ar-DZ')
    start(page)
    home(page)
    click(page, '^التمارين والتدريب')
    page.get_by_test_id('hub-examens').click()
    snap(page,'00-exams-entry')
    home(page)
    click(page, '^التمارين والتدريب')
    page.get_by_test_id('hub-workshop').click()
    snap(page,'01-workshop')
    home(page)
    click(page, '^المراجعة')
    snap(page,'02-revision-entry')
    metadata = page.evaluate('''async()=>{
      const q=await import('/src/data/qcmLivre.ts');
      const b=await import('/src/data/qcmBilan.ts');
      const c=await import('/src/data/bookIndex.ts');
      const f=await import('/src/data/fillBlanks.ts');
      const s=await import('/src/data/schemaDrills.ts');
      const t=await import('/src/data/situationIndex.ts');
      return {chapters:c.CHAPITRES,book:q.QCM_CHAPITRES,bilanExports:Object.keys(b),
        pool:b.POOL,blanks:f.FILL_BLANK_QUESTIONS,drills:s.SCHEMA_DRILLS,
        situations:t.SITUATION_INDEX};
    }''')
    (OUT/'metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'metadataCounts':{k:len(v) for k,v in metadata.items() if isinstance(v,list)}}))
    browser.close()
