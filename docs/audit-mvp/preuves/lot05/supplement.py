"""Contre-épreuves bornées : garde-fous moteurs, mobile, aucune donnée élève."""
import json
from audit_browser import *
from audit_browser import RESULTS as _R

RESULTS.clear()
RESULTS.update({'observations':[],'pageErrors':[],'scenarioErrors':[]})

def plan_moteur(p):
    """Le plan est DÉTERMINISTE : deux appels aux mêmes réglages coïncident."""
    data=p.evaluate('''async()=>{
        const m=await import('/src/data/revisionPlan.ts');
        const a=m.buildRevisionPlan({daysLeft:21,minutesPerDay:60});
        const b=m.buildRevisionPlan({daysLeft:21,minutesPerDay:60});
        const j14=m.buildRevisionPlan({daysLeft:14,minutesPerDay:60});
        return {
          tachesJour1:a.days[0].tasks.map(t=>({genre:t.kind,ref:t.refId,titre:t.titleAr,
            minutes:t.minutes})),
          secondAppelIdentique:JSON.stringify(a)===JSON.stringify(b),
          jours:a.days.length,totalMinutesJour1:a.days[0].totalMinutes,
          totalMinutesDefaut14x60:j14.days[0].totalMinutes};
    }''')
    record('F23-moteur-déterministe',**data)

def srs_moteur(p):
    """Les libellés des boutons viennent de SM-2 : l'intervalle par note.

    `previous=null` = première notation d'une carte neuve (état SRS absent du
    stockage) ; un état `dueAt:0` serait au contraire une carte SORTIE de la
    boucle (toute réussite y renvoie 21 jours, borne H3).
    """
    data=p.evaluate('''async()=>{
        const s=await import('/src/utils/flashcardsSrs.ts');
        const out={};
        for(const q of ['again','hard','good','easy']){
          out[q]=s.formatIntervalLabel(s.previewIntervalDays(null,q));
        }
        return out;
    }''')
    record('F21-libellés-moteur',intervales=data)

def parcours_gardes(p):
    data=p.evaluate('''async()=>{
        const p=await import('/src/lib/parcours/parcoursProgress.ts');
        const n=await import('/src/lib/parcours/nbaEngine.ts');
        localStorage.clear();
        const closureInexistante=p.replanifierRevue('inexistant-item-x');
        const typeSurStoreVide=n.nextBestAction(p.loadParcours()).type;
        p.resetParcours();
        return {typeSurStoreVide,closureInexistante};
    }''')
    record('F24-garde-fous',clé='kunz_parcours_v1',**data)
    snap(p,'36-parcours-garde-fous')

def revue_mobile(p):
    home(p)
    p.get_by_test_id('home-nba').wait_for()
    snap(p,'37-mobile-home-nba')
    cmp_cards(p)
    snap(p,'38-mobile-cartes')
    go_plan(p)
    snap(p,'39-mobile-plan')
    masari(p)
    snap(p,'40-mobile-masari')
    record('mobile-largeur',largeur=p.evaluate('innerWidth'),
        scrollWidth=p.evaluate('document.documentElement.scrollWidth'))

if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for name,fn in [('plan-moteur',plan_moteur),('srs-moteur',srs_moteur),
                        ('parcours-gardes',parcours_gardes),('revue-mobile',revue_mobile)]:
            ctx=browser.new_context(viewport={'width':390,'height':844} if name=='revue-mobile' else {'width':1280,'height':900},
                locale='ar-DZ',is_mobile=name=='revue-mobile',has_touch=name=='revue-mobile')
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
