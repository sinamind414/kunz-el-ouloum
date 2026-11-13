"""F21-F25 : parcours réels d'interface, contenus d'app uniquement.

Le parcours étatique de F24 et la programmation de F22 passent par l'UI quand
elle existe, sinon par les MODULES DE L'APP importés dans la page (aucune donnée
fabriquée à la main). La banque BAC de F25 en invité est payante : l'accès
d'essai est SIMULÉ côté client avec API interceptée (voir README), comme au
lot 04. Aucun compte réel, aucune facturation.
"""
import json
import re
import sys
from pathlib import Path
import fitz
from playwright.sync_api import sync_playwright

OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(OUT.parent/'lot02'))
import browser_common as common
common.OUT=OUT
from browser_common import start,home,click,snap

META=json.loads((OUT/'metadata-real.json').read_text(encoding='utf-8'))
RESULTS={'observations':[],'pageErrors':[],'scenarioErrors':[]}

def record(name,**kw):
    RESULTS['observations'].append({'name':name,**kw})
    print(name,flush=True)

def storage_all(p):
    return p.evaluate("()=>Object.fromEntries(Object.entries(localStorage))")

def srs_only(p):
    return p.evaluate("""()=>({
      srs:JSON.parse(localStorage.getItem('kunz_flashcard_srs_v1')||'{}'),
      banque:JSON.parse(localStorage.getItem('kunz-rappel-adaptatif-v1')||'{}')})""")

def dismiss(p):
    later=p.get_by_role('button',name='ليس الآن',exact=True)
    if later.count() and later.first.is_visible(): later.first.click()
    b=p.get_by_test_id('bulle-capitaine-fermer')
    if b.count(): b.click()
    # Déclic de motivation : l'overlay bloque les clics tant qu'il est ouvert.
    d=p.get_by_test_id('declic-overlay')
    if d.count() and d.is_visible():
        later2=d.get_by_role('button',name=re.compile('ليس الآن'))
        if later2.count(): later2.first.click()
        p.wait_for_timeout(400)

def reload_app(p):
    start(p)
    welcome=p.get_by_role('button',name='ابدأ رحلة التعلم',exact=True)
    if welcome.count():
        welcome.click()
        p.wait_for_timeout(700)
    dismiss(p)

def revhub(p):
    click(p,'^المراجعة')
    p.get_by_test_id('revision-hub').wait_for()

def cmp_cards(p):
    revhub(p)
    p.get_by_test_id('revhub-review').click()
    p.wait_for_timeout(700)

def go_plan(p):
    revhub(p)
    p.get_by_test_id('revhub-plan').click()
    p.get_by_test_id('plan-jours-slider').wait_for()

def masari(p):
    home(p)
    p.get_by_test_id('btn-masari').click()
    p.get_by_test_id('parcours-header').wait_for()

def bacideas(p):
    home(p)
    click(p,'^التمارين والتدريب')
    p.get_by_test_id('hub-bacideas').click()
    p.wait_for_timeout(700)

def tutor(p):
    home(p)
    p.get_by_test_id('fab-morchid').click()
    p.get_by_text('أدوات تدريب إضافية').first.click()
    p.get_by_test_id('journey-daily-mission').wait_for()

def premium(p):
    p.context.route('**/api/**',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps(
        {'statut':'essai','expireLe':'2099-06-30','joursRestants':30} if 'entitlement' in r.request.url else {})))
    p.evaluate("()=>{localStorage.setItem('boussole_token','audit-local-fixture-not-a-real-token');localStorage.setItem('kunz_acces',JSON.stringify({statut:'essai',expireLe:'2099-06-30'}))}")

def print_pdf(p,name):
    p.pdf(path=str(OUT/(name+'.pdf')),format='A4',print_background=True)
    doc=fitz.open(OUT/(name+'.pdf'))
    result={'pages':len(doc),'text':[page.get_text() for page in doc]}
    (OUT/(name+'.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    doc[0].get_pixmap(matrix=fitz.Matrix(1.2,1.2)).save(str(OUT/(name+'.png')))
    record(name,pages=len(doc),characters=[len(t) for t in result['text']])
    doc.close()

def set_range(p,testid,value):
    p.evaluate("""([id,val])=>{
      const el=document.querySelector(`[data-testid="${id}"]`);
      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
      setter.call(el,String(val));
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }""",[testid,value])

def sliders(p):
    return p.evaluate("""()=>{
      const j=document.querySelector('[data-testid=plan-jours-slider]');
      const m=document.querySelector('[data-testid=plan-minutes-slider]');
      return {jours:j&&j.value,minutes:m&&m.value};}""")

# ── F21 — cartes de révision / SM-2 ──────────────────────────────────────
def f21(p):
    cmp_cards(p)
    avant=srs_only(p)['srs']
    record('F21-compte-avant',srsAvant=avant)
    snap(p,'06-carte-avant')
    # 1) retournement de la carte
    p.locator('main').get_by_text('اضغط على البطاقة').first.click()
    p.wait_for_timeout(900)
    snap(p,'07-carte-retournée')
    boutons=[b for b in p.locator('main button').all_text_contents() if any(t in b for t in ('إعادة','صعب','جيد','سهل'))]
    record('F21-boutons-évaluation',libellésEtIntervales=boutons)
    # 2) noter « جيد » — SM-2 crée l'état de la carte (effacement sûr)
    p.get_by_role('button',name=re.compile('^جيد')).filter(visible=True).first.click()
    p.wait_for_timeout(700)
    apresGood=srs_only(p)['srs']
    record('F21-srs-après-good',cartes=len(apresGood),états=apresGood)
    # 3) noter « إعادة » sur la carte SUIVANTE : elle se RE-présente dans la séance
    pageAvant=p.locator('main').inner_text()
    p.get_by_role('button',name=re.compile('^إعادة')).filter(visible=True).first.click()
    p.wait_for_timeout(700)
    pageAprès=p.locator('main').inner_text()
    snap(p,'08-carte-again')
    apresAgain=srs_only(p)['srs']
    nouveautés={k:v for k,v in apresAgain.items() if k not in apresGood}
    record('F21-srs-again',cartes=len(apresAgain),nouvelÉtat=nouveautés,
        carteReprésentée=pageAprès==pageAvant)
    # 4) la carte ratée arrive EN PREMIER dans la même séance (recharge)
    reload_app(p)
    cmp_cards(p)
    snap(p,'09-carte-ordre-après-recharge')
    boutons2=[b for b in p.locator('main button').all_text_contents() if any(t in b for t in ('إعادة','صعب','جيد','سهل'))]
    record('F21-srs-persisté',srs=srs_only(p)['srs'],boutons=boutons2)

# ── F22 — rappels adaptatifs via القبطان ─────────────────────────────────
def f22(p):
    tutor(p)
    # mission VIERGE : aucun rappel programmé → mission normale (aucun rappel)
    p.get_by_test_id('journey-daily-mission').click()
    p.wait_for_timeout(1000)
    texteMission=p.get_by_test_id('tutor-messages').inner_text()[-900:]
    snap(p,'10-mission-sans-rappel')
    record('F22-mission-vierge',texte=texteMission,banque=srs_only(p)['banque'])
    # programmation PAR LE MODULE DE L'APP (pont H1 tel qu'au QuizView/compileur)
    programmation=p.evaluate('''async()=>{
        const mod=await import('/src/data/spacedRecallPrompts.ts');
        const keys=Object.keys(mod.SPACED_RECALL_PROMPTS);
        const m=await import('/src/lib/planificationRappels.ts');
        const retour=m.planifierRappelPourLecon(keys[0]);
        return {concept:keys[0],retour,
            banque:JSON.parse(localStorage.getItem('kunz-rappel-adaptatif-v1')||'{}')};
    }''')
    record('F22-programmé-par-module',**programmation)
    # la mission suivante pose le rappel du corpus (🔴 مراجعة موعدة)
    p.get_by_test_id('journey-daily-mission').click()
    p.wait_for_timeout(1000)
    texteRappel=p.get_by_test_id('tutor-messages').inner_text()[-1100:]
    snap(p,'11-rappel-corpus-posé')
    record('F22-rappel-posé',texte=texteRappel)
    # réponse insuffisante → verdict honnête + SM-2 rejoué le lendemain
    champ=p.get_by_placeholder('اكتب سؤالك للقبطان')
    champ.fill('جزيرة النواة هي المركز')
    champ.press('Enter')
    p.wait_for_timeout(1300)
    verdict=p.get_by_test_id('tutor-messages').inner_text()[-1000:]
    snap(p,'12-rappel-verdict-insuffisant')
    record('F22-verdict-insuffisant',texte=verdict,banqueAprèsRéponse=srs_only(p)['banque'])
    # mission clôturée JUSQU'À DEMAIN dans tous les cas
    p.get_by_test_id('journey-daily-mission').click()
    p.wait_for_timeout(1000)
    snap(p,'13-mission-clôturée')
    record('F22-mission-clôturée',texte=p.get_by_test_id('tutor-messages').inner_text()[-700:])
    # la même intité de SM-2 : l'élément RÉAPPARAÎT le lendemain (dashboard:
    # lançons بكل صراحة : la banque écrite par noterRappel est la seule mémoire)
    record('F22-état-stockage',clé='kunz-rappel-adaptatif-v1',
        valeur=storage_all(p).get('kunz-rappel-adaptatif-v1'))

def ouvrir_outils(p):
    """Le bloc « المزيد من الأدوات » est replié par défaut : TodayCard vit dedans."""
    p.get_by_text('المزيد من الأدوات').first.click()
    p.get_by_test_id('today-card').wait_for()

# ── F23 — plan de révision + TodayCard ───────────────────────────────────
def f23(p):
    go_plan(p)
    joursAffichés=p.locator('[data-testid^="plan-day-"]').count()
    tasks0=p.locator('[data-testid^="tache-"]').count()
    snap(p,'14-plan-défaut')
    record('F23-plan-défaut',sliders=sliders(p),joursAffichés=joursAffichés,
        boutonsTâches=tasks0,réglages=storage_all(p).get('kunz.revisionPlan.settings'))
    home(p)
    ouvrir_outils(p)
    tachesToday0=p.locator('[data-testid^="today-tache-"]').evaluate_all('(xs)=>xs.map(x=>x.dataset.testid)')
    snap(p,'15-today-card-défaut')
    record('F23-today-sync-défaut',texte=p.get_by_test_id('today-card').inner_text()[:500],
        tâches=tachesToday0)
    # réglage 21×60 : le plan se recalcule, le réglage est ENREGISTRÉ
    go_plan(p)
    set_range(p,'plan-jours-slider',21)
    set_range(p,'plan-minutes-slider',60)
    p.wait_for_timeout(700)
    record('F23-réglé-21x60',sliders=sliders(p),réglages=storage_all(p).get('kunz.revisionPlan.settings'))
    snap(p,'16-plan-21x60')
    # cocher la première tâche du jour 1 (clé kunz.revisionPlan.21x60)
    tache1=p.locator('[data-testid^="tache-"]').first.get_attribute('data-testid')
    p.get_by_test_id(tache1).click()
    p.wait_for_timeout(400)
    snap(p,'17-tâche-cochée')
    record('F23-case-cochée',tâche=tache1,stockage=storage_all(p).get('kunz.revisionPlan.21x60'))
    #TodayCard suit le NOUVEAU réglage (même moteur, lecture d'un unique réglage)
    home(p)
    ouvrir_outils(p)
    tachesToday1=p.locator('[data-testid^="today-tache-"]').evaluate_all('(xs)=>xs.map(x=>x.dataset.testid)')
    record('F23-today-sync-21x60',tâches=tachesToday1)
    snap(p,'18-today-21x60')
    # persistance des réglages ET cases après recharge
    reload_app(p)
    go_plan(p)
    p.wait_for_timeout(700)
    grisé=p.get_by_test_id(tache1).get_attribute('class') or ''
    record('F23-réglages-sauvegardés',sliders=sliders(p),
        cochées=storage_all(p).get('kunz.revisionPlan.21x60'),
        classeTâcheCochée=grisé[:160])
    snap(p,'19-plan-recharge')
    # impression du jour 1 : pipeline réel Chromium + CSS print
    home(p)
    go_plan(p)
    p.get_by_test_id('imprimer-jour').click()
    p.get_by_test_id('feuille-impression').wait_for()
    print_pdf(p,'20-impression-plan')
    p.get_by_test_id('fermer-feuille').click()
    home(p)
    ouvrir_outils(p)
    record('F23-reste-today',reste=p.get_by_test_id('today-reste').inner_text() if p.get_by_test_id('today-reste').count() else None)

# ── F24 — Next Best Action : les quatre états ────────────────────────────
def f24(p):
    # état « NOUVEAU » vierge
    masari(p)
    record('F24-vierge-masari',texteNbaMasari=p.get_by_test_id('parcours-nba').inner_text()[:400],
        bouton=p.get_by_test_id('parcours-nba-start').count(),
        boutonTexte=p.get_by_test_id('parcours-nba-start').inner_text())
    home(p)
    p.get_by_test_id('home-nba').wait_for()
    record('F24-vierge-accueil',texteNbaAccueil=p.get_by_test_id('home-nba').inner_text()[:400],
        boutonTexte=p.get_by_test_id('home-nba-start').inner_text())
    snap(p,'21-nba-vierge')
    # « QUOTA » : marquer 1 tâche via le contrôle d'anneau (« علّم كمحفوظة »)
    masari(p)
    rangée=p.locator('li[data-testid^="parcours-row-"]').first.get_attribute('data-testid')
    p.get_by_test_id(rangée+'-toggle').click()
    p.wait_for_timeout(700)
    record('F24-quota-masari',store=storage_all(p).get('kunz_parcours_v1'),
        texteNbaMasari=p.get_by_test_id('parcours-nba').inner_text()[:300])
    snap(p,'22-nba-repos')
    home(p)
    p.get_by_test_id('home-nba').wait_for()
    record('F24-quota-accueil',texteNbaAccueil=p.get_by_test_id('home-nba').inner_text()[:300])
    # « REPRISE » : annuler la validation, puis OUVRIR la rangée (markStarted), sans finir
    masari(p)
    p.get_by_test_id(rangée+'-toggle').click()
    p.wait_for_timeout(500)
    p.locator(f'[data-testid="{rangée}"] button').first.click()
    p.wait_for_timeout(900)
    dismiss(p)
    home(p)
    p.get_by_test_id('home-nba').wait_for()
    record('F24-reprise-accueil',texteNbaAccueil=p.get_by_test_id('home-nba').inner_text()[:300])
    snap(p,'23-nba-reprise')
    # « RAPPEL » : deux tâches validées et l'horloge devient J+15
    masari(p)
    p.get_by_test_id(rangée+'-toggle').click()
    p.wait_for_timeout(400)
    rangée2=p.locator('li[data-testid^="parcours-row-"]').nth(1).get_attribute('data-testid')
    p.get_by_test_id(rangée2+'-toggle').click()
    p.wait_for_timeout(400)
    storeAvantHorloge=storage_all(p).get('kunz_parcours_v1')
    p.clock.set_system_time('2026-11-16T09:00:00')
    p.wait_for_timeout(400)
    dateSystème=p.evaluate("()=>new Date().toISOString().slice(0,10)")
    # l'ACCUEIL : au moins une revue est due, le bouton « راجعتُه فعلاً » ?
    home(p)
    dismiss(p)
    p.get_by_test_id('home-nba').wait_for()
    boutonRevuAccueil=p.get_by_test_id('home-nba-revu').count()
    # مساري : même état, bouton présent attendu
    masari(p)
    boutonRevuMasari=p.get_by_test_id('parcours-nba-revu').count()
    texteRevue=p.get_by_test_id('parcours-nba').inner_text()[:300]
    snap(p,'24-nba-rappel')
    record('F24-rappel-dû',dateSystème=dateSystème,
        boutonRevuSurMasari=boutonRevuMasari,boutonRevuSurAccueil=boutonRevuAccueil,
        texteNbaMasari=texteRevue,avantHorloge=storeAvantHorloge)
    # clôture EXPLICITE via مساري
    if boutonRevuMasari:
        p.get_by_test_id('parcours-nba-revu').click()
        p.wait_for_timeout(700)
        record('F24-clôture-rappel',store=storage_all(p).get('kunz_parcours_v1'))
        snap(p,'25-nba-clôturée')
    home(p)
    dismiss(p)
    p.get_by_test_id('home-nba').wait_for()
    record('F24-clôture-état-accueil',texteNbaAccueil=p.get_by_test_id('home-nba').inner_text()[:300])
    snap(p,'26-nba-après-clôture')

# ── F25 — banque « أفكار التمارين » ──────────────────────────────────────
def f25(p):
    # 1) invité : porte payante d'abord
    bacideas(p)
    estPaywall=p.get_by_test_id('ecran-paiement').count()
    if estPaywall:
        snap(p,'27-banque-paywall-invité')
        record('F25-invité-paywall',écranPaiement=estPaywall,
            invité=not storage_all(p).get('boussole_token'))
    premium(p)
    bacideas(p)
    p.get_by_test_id('bac-ideas').wait_for()
    # 2) pression par unité + familles + années
    chipsAnnées=p.locator('[data-testid^="annee-"]').evaluate_all('(xs)=>xs.map(x=>x.dataset.testid)')
    pendants=[t for t in chipsAnnées if 'pending' in t]
    pression=p.locator('[data-testid^="pression-"]').count()
    familles=p.locator('[data-testid^="famille-"]').count()
    snap(p,'28-banque-défaut')
    record('F25-ouvert',chapeauPression=pression,familles=familles,
        chipsRéelles=[t for t in chipsAnnées if 'pending' not in t],
        pendants=pendants,basculeSujet=p.get_by_test_id('basculer-sujet').count())
    # 3) sélection de la dernière année RÉELLE de la banque
    anneeDernier='annee-'+str(META['bac']['annees'][-1])
    p.get_by_test_id(anneeDernier).click()
    p.wait_for_timeout(700)
    idées=p.locator('[data-testid^="idee-"]').evaluate_all('(xs)=>xs.map(x=>x.dataset.testid)')
    pdfs=p.locator('[data-testid^="carte-pdf-"]').evaluate_all("(xs)=>xs.map(x=>({id:x.dataset.testid,href:x.getAttribute('href')}))")
    incomplètes=p.locator('[data-testid^="carte-incomplet-"]').count()
    barème=p.get_by_test_id('idees-bareme').inner_text() if p.get_by_test_id('idees-bareme').count() else None
    snap(p,'29-banque-dernière-année')
    record('F25-année-réelle',chip=anneeDernier,idees=idées,
        sessionCarte=p.get_by_test_id('session-carte').count(),
        liensPdf=pdfs,incomplètes=incomplètes,barème=barème)
    # 4) correction OFFICIELLE : lien externe
    corrigé=p.get_by_test_id('lien-correction')
    record('F25-correction',liens=corrigé.evaluate_all("(xs)=>xs.map(x=>x.getAttribute('href'))"))
    # 5) recherche : mot réel (premier titre de la banque) puis à vide
    exemples=META['bac']['exemples']
    mot=exemples[0]['titre'].split()[0] if exemples and exemples[0]['titre'] else 'الجينتاميسين'
    rech=p.get_by_test_id('idees-recherche')
    rech.fill(mot)
    p.wait_for_timeout(700)
    record('F25-recherche-résultats',mot=mot,idees=p.locator('[data-testid^="idee-"]').count())
    snap(p,'30-recherche')
    rech.fill('NO_AUDIT_MATCH_123')
    p.wait_for_timeout(700)
    record('F25-recherche-vide',vide=p.get_by_test_id('idees-vide').count())
    snap(p,'31-recherche-vide')
    rech.fill('')
    p.wait_for_timeout(500)
    # 6) le montage et son piège
    montagesAtt=[t for t in p.locator('[data-testid^="montage-"]').evaluate_all('(xs)=>xs.map(x=>x.dataset.testid)') if t.startswith('montage-')]
    p.get_by_test_id(montagesAtt[0]).click()
    p.wait_for_timeout(700)
    detail=p.get_by_test_id('montage-detail')
    record('F25-montage',choisis=montagesAtt[:4],
        détail=detail.inner_text()[:900] if detail.count() else None)
    snap(p,'32-montage-détail')
    home(p)
    # 7) l'atelier : famille + rédaction + verdict + notion
    bacideas(p)
    p.get_by_test_id('bac-ideas').wait_for()
    idée1=p.evaluate("""()=>{
        const el=document.querySelector('[data-testid^="entrainer-"]');
        return el?el.dataset.testid.replace('entrainer-',''):null;}""")
    p.get_by_test_id('entrainer-'+idée1).click()
    p.wait_for_timeout(800)
    famillesTrainer=p.locator('[data-testid^="trainer-famille-"]').evaluate_all('(xs)=>xs.map(x=>x.dataset.testid)')
    if famillesTrainer:
        p.get_by_test_id(famillesTrainer[-1]).click()
        p.wait_for_timeout(500)
    canevas=p.get_by_test_id('trainer-canevas').inner_text()
    p.get_by_test_id('trainer-reponse').fill('نقطة: النواة. هذا نص قصير للفحص.')
    p.wait_for_timeout(700)
    verdict1=p.get_by_test_id('trainer-verdict')
    snap(p,'33-atelier-verdict')
    record('F25-atelier',idée=idée1,famillesTrainer=famillesTrainer,
        canevas=canevas[:400],
        verdict=verdict1.inner_text()[:400] if verdict1.count() else None)
    savedKeys=[k for k in storage_all(p) if k.startswith('kunz.bacTrainer.')]
    record('F25-persistance-écriture',clés=savedKeys,
        valeurs={k:storage_all(p)[k] for k in savedKeys})
    # la notion s'ouvre SUR DEMANDE (après la rédaction, jamais avant)
    if p.get_by_test_id('trainer-notion').count():
        p.get_by_test_id('trainer-notion').click()
        p.wait_for_timeout(500)
        record('F25-notion-sur-demande',
            texte=p.get_by_test_id('trainer-notion-texte').inner_text()[:400] if p.get_by_test_id('trainer-notion-texte').count() else None)
        snap(p,'34-notion-dévoilée')
    p.get_by_test_id('trainer-fermer').click()
    p.wait_for_timeout(500)
    # recharge : l'atelier cumule la même réponse (clé idée+famille)
    reload_app(p)
    bacideas(p)
    p.get_by_test_id('bac-ideas').wait_for()
    p.get_by_test_id('entrainer-'+idée1).click()
    p.wait_for_timeout(800)
    # l'atelier remonte la PREMIÈRE famille après recharge : re-sélectionner
    # celle où la rédaction a été faite (clé de stockage idée+famille).
    famillesRecharge=p.locator('[data-testid^="trainer-famille-"]').evaluate_all('(xs)=>xs.map(x=>x.dataset.testid)')
    if famillesTrainer and famillesRecharge and famillesTrainer[-1] in famillesRecharge:
        p.get_by_test_id(famillesTrainer[-1]).click()
    p.wait_for_timeout(500)
    rep=p.get_by_test_id('trainer-reponse').input_value()
    record('F25-reprise-écriture',attendu='نقطة: النواة. هذا نص قصير للفحص.',retrouvé=rep,
        famille=famillesTrainer[-1] if famillesTrainer else None)
    snap(p,'35-atelier-recharge')

if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for name,fn in [('f21',f21),('f22',f22),('f23',f23),('f24',f24),('f25',f25)]:
            ctx=browser.new_context(viewport={'width':1280,'height':900},locale='ar-DZ')
            p=ctx.new_page()
            p.set_default_timeout(10000)
            p.on('pageerror',lambda e:RESULTS['pageErrors'].append(str(e)))
            try:
                start(p)
                dismiss(p)
                fn(p)
            except Exception as e:
                RESULTS['scenarioErrors'].append({'scenario':name,'error':str(e)})
                snap(p,'error-'+name)
                print(name+' ERROR '+str(e).encode('ascii','backslashreplace').decode(),flush=True)
            ctx.close()
            (OUT/'browser-results.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2),encoding='utf-8')
        browser.close()
    if RESULTS['scenarioErrors'] or RESULTS['pageErrors']:
        raise SystemExit(1)
