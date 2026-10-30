"""Outils d'audit local, contextes invités jetables uniquement."""
import json
import re
import sys
from pathlib import Path

OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(OUT.parent/'lot01'))
from explorer import start

def click(page,text):
    page.get_by_role('button',name=re.compile(text)).filter(visible=True).first.click()
    page.wait_for_timeout(300)

def home(page):
    click(page,'^الرئيسية')

def lessons(page):
    home(page)
    click(page,'^الدروس')

def snap(page,name):
    page.wait_for_timeout(500)
    data=page.evaluate("""()=>({text:document.body.innerText,
      buttons:[...document.querySelectorAll('button')].map(b=>({text:b.innerText,label:b.getAttribute('aria-label'),testid:b.dataset.testid,disabled:b.disabled})),
      testids:[...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid),
      inputs:[...document.querySelectorAll('input,textarea')].map(e=>({type:e.type,label:e.getAttribute('aria-label'),placeholder:e.placeholder})),
      width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      storage:Object.fromEntries(Object.entries(localStorage).filter(([k])=>!['svt_flashcards','svt_quiz_questions'].includes(k)).map(([k,v])=>[k,v.length>12000?'[omitted '+v.length+' chars]':v]))})""")
    (OUT/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    page.screenshot(path=str(OUT/(name+'.png')),full_page=True)
    print(json.dumps({'snapshot':name,'buttonsCount':len(data['buttons'])},ensure_ascii=True),flush=True)
    return data

def summaries(page):
    lessons(page)
    click(page,'الدرس الرسمي')
    page.get_by_test_id('domaine-1').click()
    page.get_by_test_id('okacha-entree-domaine').click()
    page.get_by_test_id('okacha-unites-icones').wait_for()

def maps(page):
    lessons(page)
    page.get_by_test_id('lecons-mindmap').click()
    page.locator('.node-item').first.wait_for()

def animations(page):
    home(page)
    click(page,'^التمارين والتدريب')
    click(page,'الأنميشن العلمي')
    page.get_by_test_id('electrophorese-sim').wait_for()

def revision(page):
    home(page)
    click(page,'^المراجعة')
    click(page,'المراجعة الذكية')
    page.get_by_test_id('capsule-panel').wait_for()
