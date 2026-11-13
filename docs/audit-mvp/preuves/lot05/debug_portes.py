"""Sonde ponctuelle : essence des portes du القبطان sur cette branche."""
import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path('docs/audit-mvp/preuves/lot02').resolve()))
from playwright.sync_api import sync_playwright
sys.path.insert(0,str(Path('docs/audit-mvp/preuves/lot01').resolve()))
from explorer import start

OUT=Path(__file__).resolve().parent
with sync_playwright() as pw:
    b=pw.chromium.launch(headless=True)
    ctx=b.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
    p=ctx.new_page(); p.set_default_timeout(9000)
    p.on('pageerror',lambda e:print('PAGEERROR esc'.encode('ascii','backslashreplace').decode()))
    start(p)
    p.wait_for_timeout(2500)
    data=p.evaluate('''()=>{
      const ariaCaptain=[...document.querySelectorAll('button')].filter(
        b=>(b.getAttribute('aria-label')||'\u0627').includes('\u0627\u0644\u0642\u0628\u0637\u0627\u0646'));
      const boutonsAsk=[...document.querySelectorAll('button')].filter(
        b=>(b.innerText||'').includes('\u0627\u0633\u0623\u0644'));
      return {
        ariaCaptain:ariaCaptain.map(b=>({aria:b.getAttribute('aria-label'),testid:b.dataset.testid??null,
          vis:!!(b.offsetParent),classes:(b.className||'').slice(0,120)})),
        boutonsAsk:boutonsAsk.map(b=>({t:(b.innerText||'').slice(0,80)})),
        sections:[...document.querySelectorAll('h2,h3')].map(h=>({t:h.innerText.slice(0,60),id:h.id||null}))};
    }''')
    (OUT/'debug-portes.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    b.close()
print('OK')
