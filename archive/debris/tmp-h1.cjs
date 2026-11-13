const fs = require('fs');
const path = require('path');
const dir = 'public/lessons';
function strip(s){ return s.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(); }
function findBlocks(html){
  const blocks=[]; const openRe=/<div\s+id="([^"]+)"\s+class="[^"]*chapter-view[^"]*"[^>]*>/g;
  let m;
  while((m=openRe.exec(html))){
    let depth=0; const tagRe=/<div\b[^>]*>|<\/div>/g; tagRe.lastIndex=m.index; let end=-1; let t;
    while((t=tagRe.exec(html))){ if(t[0]==='</div>'){depth--; if(depth===0){end=t.index+t[0].length;break;}} else depth++; }
    if(end<0) break;
    blocks.push({id:m[1], html:html.slice(m.index,end)});
    openRe.lastIndex=end;
  }
  return blocks;
}
const files=fs.readdirSync(dir).filter(f=>/^phase\d+_chapitres_\d+_\d+\.html$/.test(f))
  .sort((a,b)=>parseInt(a.match(/phase(\d+)/)[1])-parseInt(b.match(/phase(\d+)/)[1]));
let n=0;
for(const f of files){
  const html=fs.readFileSync(path.join(dir,f),'utf8');
  const blocks=findBlocks(html);
  for(const b of blocks){
    n++;
    const h1=(b.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]||'(PAS DE H1)';
    const crumb=(b.html.match(/<div class="lesson-breadcrumb"[^>]*>([\s\S]*?)<\/div>/)||[])[1]||'';
    console.log('LECON '+n+' | '+f+' #'+b.id+' | H1: '+strip(h1)+' | CRUMB: '+strip(crumb).slice(0,60));
  }
}
console.log('TOTAL='+n);
const tr=fs.readFileSync(path.join(dir,'lecon_transcription.html'),'utf8');
const th=(tr.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]||'(PAS DE H1)';
console.log('TRANSCRIPTION H1: '+strip(th));
