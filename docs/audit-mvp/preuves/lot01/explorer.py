"""Exploration Chromium locale ; profil jetable, aucune donnée élève réelle."""
import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent

def dump(page, name):
    result = page.evaluate("""() => ({title:document.title, text:document.body.innerText,
      buttons:[...document.querySelectorAll('button')].map(b=>({text:b.innerText,
      label:b.getAttribute('aria-label'),testid:b.dataset.testid,disabled:b.disabled})),
      inputs:[...document.querySelectorAll('input,textarea')].map(b=>({tag:b.tagName,
      placeholder:b.getAttribute('placeholder'),label:b.getAttribute('aria-label')})),
      testids:[...document.querySelectorAll('[data-testid]')].map(b=>b.dataset.testid),
      storage:Object.fromEntries(Object.entries(localStorage).filter(([k])=>!['svt_flashcards','svt_quiz_questions'].includes(k)).map(([k,v])=>[k,v.length>12000?'[omitted '+v.length+' chars]':v])),
      width:innerWidth,scrollWidth:document.documentElement.scrollWidth})""")
    (OUT / f'{name}.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    page.screenshot(path=str(OUT / f'{name}.png'), full_page=True)
    print(json.dumps({'name':name,'testids':result['testids'],'buttons':len(result['buttons'])},ensure_ascii=True))

def start(page):
    page.goto('http://localhost:3000', wait_until='networkidle')
    # Deux écrans d'accueil, traversés exclusivement par des clics visibles.
    page.get_by_role('button').first.click()
    page.wait_for_timeout(1200)
    for _ in range(4):
        if page.get_by_role('button', name='ابدأ رحلة التعلم').count():
            page.get_by_role('button', name='ابدأ رحلة التعلم').click()
            page.wait_for_timeout(1200)
            dismiss = page.get_by_role('button', name='ليس الآن', exact=True)
            if dismiss.count() and dismiss.is_visible():
                dismiss.click()
            return
        buttons = page.get_by_role('button').all()
        for button in buttons:
            if 'الكنز' in button.inner_text() or 'افتح' in button.inner_text():
                button.click()
                page.wait_for_timeout(1000)
                break
        else:
            return

if __name__ == '__main__':
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width':1280,'height':900}, locale='ar-DZ')
        page = context.new_page()
        page.on('pageerror', lambda err: print('PAGEERROR '+str(err).encode('ascii','backslashreplace').decode()))
        start(page)
        dump(page, '00-home')
        page.get_by_role('button', name=re.compile('^الدروس')).filter(visible=True).first.click()
        page.wait_for_timeout(1000)
        dump(page, '01-lessons')
        metadata = page.evaluate("""async () => {
          const m = await import('/src/data/lessonModes.ts');
          const s = await import('/src/data/unitLessonSequences.ts');
          const a = await import('/src/data/activeLessons.ts');
          const c = await import('/src/data/curriculumOfficial.ts');
          const h = await import('/src/data/lessonHtmlGetters.ts');
          return {domains:m.PASSIVE_DOMAINS, units:c.PROGRESSION_OFFICIELLE,
            sequences:Array.from({length:11},(_,i)=>({unit:i+1,keys:s.getUnitLessonSequence(i+1),active:m.getActiveLessonKeysForUnit(i+1)})),
            lessons:a.ACTIVE_LESSONS,htmlExports:Object.keys(h)};
        }""")
        (OUT/'catalogue.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
        page.get_by_role('button',name=re.compile('الدرس الرسمي')).click()
        dump(page,'02-domains')
        page.get_by_test_id('domaine-1').click()
        dump(page,'03-units')
        page.get_by_test_id('unite-1').click()
        dump(page,'04-chapters')
        page.locator('[data-testid^="chapitre-"]').first.click()
        page.locator('iframe').wait_for()
        page.wait_for_timeout(1200)
        dump(page,'05-html')
        frame=page.frames[1]
        (OUT/'05-html-frame.json').write_text(json.dumps({'text':frame.locator('body').inner_text(),'buttons':frame.locator('button').all_text_contents()},ensure_ascii=False,indent=2),encoding='utf-8')
        browser.close()
