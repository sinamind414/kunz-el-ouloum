"""Exploration et fixtures réelles : aucune donnée élève, contextes invités jetables.

Construit `metadata.json` depuis les modules VRAIS de l'app (imports dynamiques
depuis la page servie par vite), puis capture les cinq portes d'accueil
utilisées par F21..F25 : hub المراجعة (cartes/plan), مساري, التمارين والتدريب
(banque BAC) et le القبطان (mission).
"""
import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(OUT.parent/'lot02'))
import browser_common as common
common.OUT=OUT
from browser_common import start,home,click,snap

RESULTS={'observations':[],'pageErrors':[],'scenarioErrors':[]}

def record(name,**kw):
    RESULTS['observations'].append({'name':name,**kw})
    print(name,flush=True)

def fixtures(page):
    data=page.evaluate('''async()=>{
        const take=async(spec,run)=>{try{return await run(await import(spec));}
            catch(e){return {'__erreur':String(e)};}};
        const srs=await take('/src/data/spacedRecallPrompts.ts',m=>({
            manuels:Object.keys(m.SPACED_RECALL_PROMPTS),
            questionsParConcept:m.SPACED_RECALL_PROMPTS[Object.keys(m.SPACED_RECALL_PROMPTS)[0]].length}));
        const auto=await take('/src/data/spacedRecallPromptsAuto.ts',m=>({
            auto:Object.keys(m.SPACED_RECALL_PROMPTS_AUTO).length}));
        const hub=await take('/src/data/revisionHub.ts',m=>({
            entrees:m.REVISION_ENTRIES.map(e=>({tab:e.tab,titre:e.titleAr})),
            entrées:m.REVISION_ENTRY_COUNT}));
        const plan=await take('/src/data/planSettings.ts',m=>({
            cle:m.PLAN_SETTINGS_KEY,defaut:m.DEFAULT_PLAN_SETTINGS,
            bornes:{joursMin:1,joursMax:60,minutesMin:20,minutesMax:240}}));
        const par=await take('/src/lib/parcours/parcoursProgress.ts',m=>({
            delaiRevueJours:m.REVIEW_DELAY_DAYS,seuilFragile:m.SEUIL_FRAGILE,
            clee:m.STORAGE_KEY??'kunz_parcours_v1'}));
        const chemin=await take('/src/lib/parcours/parcoursPath.ts',m=>({
            total:m.PARCOURS_FLAT.length,
            premier:m.PARCOURS_FLAT.slice(0,6).map(i=>({id:i.id,kind:i.kind,unitId:i.unitId,titre:i.title}))}));
        const bac=await take('/src/data/bacSessionIndex.ts',m=>({
            annees:m.YEARS_COVERED,manquantes:m.MISSING_YEARS,
            incomplets:m.INCOMPLETE_SUJETS,pendants:m.PENDING_YEARS.map(p=>p.year),
            idees:m.BAC_IDEAS.length,
            exemples:m.BAC_IDEAS.slice(0,3).map(i=>({id:i.id,titre:i.titleAr,annee:i.year}))}));
        const unites=await take('/src/unitCatalog.ts',m=>({
            unite1:m.INITIAL_UNITS.find(u=>u.id===1)?{id:1,titre:m.INITIAL_UNITS.find(u=>u.id===1).title,
                cartes:(m.INITIAL_UNITS.find(u=>u.id===1).flashcards||[]).length}:null}));
        return {srs,auto,hub,plan,par,chemin,bac,unites};
    }''')
    (OUT/'metadata-real.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    return data


if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        ctx=browser.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
        p=ctx.new_page()
        p.set_default_timeout(10000)
        p.on('pageerror',lambda e:RESULTS['pageErrors'].append(str(e)))
        try:
            start(p)
            f=fixtures(p)
            home(p)
            snap(p,'00-home')
            # Hub المراجعة (F21/F23)
            click(p,'^المراجعة')
            p.get_by_test_id('revision-hub').wait_for()
            record('revhub',entrees=p.locator('[data-testid^="revhub-"]').evaluate_all('(xs)=>xs.map(x=>x.dataset.testid)'))
            snap(p,'01-revhub')
            p.get_by_test_id('revhub-plan').click()
            p.get_by_test_id('plan-jours-slider').wait_for()
            snap(p,'02-plan-defaut')
            # مساري (F24)
            home(p)
            p.get_by_test_id('btn-masari').click()
            p.get_by_test_id('parcours-header').wait_for()
            snap(p,'03-parcours-vierge')
            # hub entraînement → banque BAC (F25, invité : porte payante)
            home(p)
            click(p,'^التمارين والتدريب')
            p.get_by_test_id('hub-bacideas').click()
            p.wait_for_timeout(700)
            record('bac-ideas-invite',paywall=p.get_by_test_id('ecran-paiement').count(),ideas=p.get_by_test_id('bac-ideas').count())
            snap(p,'04-bacideas-paywall')
            # القبطان (F22) — porte unique de cette branche : le bouton flottant
            p.get_by_test_id('fab-morchid').click()
            p.get_by_text('أدوات تدريب إضافية').first.click()
            p.get_by_test_id('journey-daily-mission').wait_for()
            snap(p,'05-tutor-vierge')
        except Exception as e:
            RESULTS['scenarioErrors'].append({'scenario':'explore','error':str(e)})
            snap(p,'error-explore')
            print('explore ERROR '+str(e).encode('ascii','backslashreplace').decode(),flush=True)
        ctx.close()
        (OUT/'explore-results.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2),encoding='utf-8')
        browser.close()
    if RESULTS['scenarioErrors'] or RESULTS['pageErrors']:
        raise SystemExit(1)
