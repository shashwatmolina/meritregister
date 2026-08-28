'use strict';

const EV_TODAY = new Date('2026-08-27T12:00:00+05:30');
const EV_PHASES = (typeof FRESHERS_TIMELINE_META !== 'undefined' && Array.isArray(FRESHERS_TIMELINE_META.phases)) ? FRESHERS_TIMELINE_META.phases : [];

function evEscape(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function evCollege(id){return (typeof ALL_COLLEGES!=='undefined' ? ALL_COLLEGES : []).find(c=>Number(c.id)===Number(id))||null;}
function evCulture(id){return (typeof JUNIOR_CULTURE!=='undefined' && (JUNIOR_CULTURE[String(id)]||JUNIOR_CULTURE[Number(id)]))||null;}
function evFirst90(id){return (typeof JUNIOR_FIRST90!=='undefined' && (JUNIOR_FIRST90[String(id)]||JUNIOR_FIRST90[Number(id)]))||null;}
function evTimeline(id){
  const base=(typeof FRESHERS_TIMELINE!=='undefined' && (FRESHERS_TIMELINE[String(id)]||FRESHERS_TIMELINE[Number(id)]))||{phases:{}};
  return EV_PHASES.map(p=>({...p,...(base.phases?.[p.key]||{grade:'GAP',status:'unknown',sources:[]})}));
}
function evFormatName(name){return String(name||'').replace(/^All India Institute of Medical Sciences/i,'AIIMS');}
function evParseVerified(raw){
  const s=String(raw||'').trim(); if(!s)return null;
  const d=new Date(s.replace(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/,'$2 $1, $3'));
  return Number.isNaN(d.getTime())?null:d;
}
function evAgeDays(raw){const d=evParseVerified(raw);return d?Math.max(0,Math.floor((EV_TODAY-d)/86400000)):null;}
function evUniqueSources(id){
  const jc=evCulture(id), f=evFirst90(id), timeline=evTimeline(id);
  const all=[...(Array.isArray(jc?.sources)?jc.sources:[]),...(Array.isArray(f?.sources)?f.sources:[])];
  timeline.forEach(p=>(Array.isArray(p.sources)?p.sources:[]).forEach(s=>all.push({...s,kind:s.kind||'timeline'})));
  const map=new Map();
  all.forEach(s=>{
    const url=String(s?.url||'').trim(); const label=String(s?.label||'').trim(); if(!url&&!label)return;
    const key=url||label.toLowerCase();
    if(!map.has(key))map.set(key,{...s,url,label});
    else if(map.get(key).kind==='timeline'&&s.kind)map.set(key,{...map.get(key),kind:s.kind});
  });
  return [...map.values()];
}
function evFirst90Coverage(id){
  const f=evFirst90(id); const cov=f?.coverage||{}; const keys=['firstWeeks','residenceMode','genderSpecific','optOut','afterFreshers'];
  return {count:keys.filter(k=>cov[k]===true).length,total:keys.length};
}
function evTimelineCoverage(id){const t=evTimeline(id);return {supported:t.filter(p=>['A','B','C'].includes(p.grade)).length,lead:t.filter(p=>p.grade==='D').length,total:t.length};}
function evMetrics(id){
  const jc=evCulture(id); if(!jc)return null;
  const src=evUniqueSources(id);
  const direct=[...(Array.isArray(jc.sources)?jc.sources:[]),...(Array.isArray(evFirst90(id)?.sources)?evFirst90(id).sources:[])];
  const directMap=new Map(); direct.forEach(s=>{const k=String(s?.url||s?.label||'').trim();if(k&&!directMap.has(k))directMap.set(k,s);});
  const directUnique=[...directMap.values()];
  const official=directUnique.filter(s=>s.kind==='official').length;
  const student=directUnique.filter(s=>s.kind==='student').length;
  const news=directUnique.filter(s=>s.kind==='news').length;
  const sourceClasses=[official>0,student>0,news>0].filter(Boolean).length;
  const newestYear=Math.max(0,...src.map(s=>Number(s.year)||0));
  const f90=evFirst90Coverage(id), timeline=evTimelineCoverage(id), age=evAgeDays(jc.lastVerified);
  const mixed=(jc.signal?.tone==='mixed') || /conflicting|contradictory|mixed accounts|accounts (?:differ|diverge)|reports (?:differ|conflict)|evidence (?:conflicts|is mixed)/i.test([jc.currentPicture,jc.trend].join(' '));
  const officialOnly=official>0&&student===0&&news===0;
  const noSources=directUnique.length===0;
  const noStudent=student===0;
  const singleSource=directUnique.length===1;
  const noTimeline=timeline.supported===0;
  const thinFirst90=f90.count<2;
  const olderSource=newestYear>0&&newestYear<2026;
  const noDatedSource=newestYear===0;
  let coverage=0;
  coverage += sourceClasses*10;                       // 0..30 diversity
  coverage += Math.min(4,directUnique.length)*5;      // 0..20 source count
  coverage += age===null?0:(age<=30?15:age<=90?10:4); // 0..15 verification recency
  coverage += Math.round((f90.count/f90.total)*20);   // 0..20 First-90 breadth
  coverage += Math.round((timeline.supported/timeline.total)*15); // 0..15 phase coverage
  coverage=Math.min(100,coverage);
  let priority=0; const reasons=[];
  if(noSources){priority+=5;reasons.push('no direct sources');}
  if(noStudent){priority+=4;reasons.push('no student/community source');}
  if(officialOnly){priority+=2;reasons.push('official-only evidence');}
  if(singleSource){priority+=2;reasons.push('single-source profile');}
  if(noTimeline){priority+=3;reasons.push('no supported timeline phase');}
  if(thinFirst90){priority+=2;reasons.push('thin First-90 coverage');}
  if(olderSource){priority+=2;reasons.push('no 2026 source');}
  if(noDatedSource){priority+=1;reasons.push('source dates unavailable');}
  if(mixed){priority+=1;reasons.push('conflicting/mixed evidence needs resolution');}
  return {id:Number(id),jc,directSources:directUnique.length,allSources:src.length,official,student,news,sourceClasses,newestYear,f90,timeline,age,mixed,officialOnly,noSources,noStudent,singleSource,noTimeline,thinFirst90,olderSource,noDatedSource,coverage,priority,reasons};
}

const EV_ROWS = Object.keys(typeof JUNIOR_CULTURE!=='undefined'?JUNIOR_CULTURE:{}).map(id=>evMetrics(id)).filter(Boolean).map(m=>({...m,college:evCollege(m.id)})).filter(r=>r.college);

function evSetTheme(){
  const saved=localStorage.getItem('merit-register-theme'); if(saved==='dark')document.body.dataset.theme='dark';
  const btn=document.getElementById('theme-toggle'); if(!btn)return;
  btn.setAttribute('aria-pressed',document.body.dataset.theme==='dark'?'true':'false');
  btn.addEventListener('click',()=>{const dark=document.body.dataset.theme!=='dark';document.body.dataset.theme=dark?'dark':'';localStorage.setItem('merit-register-theme',dark?'dark':'light');btn.setAttribute('aria-pressed',dark?'true':'false');});
}
function evPopulateStates(){const el=document.getElementById('evidence-state');[...new Set(EV_ROWS.map(r=>r.college.state))].sort().forEach(s=>el.insertAdjacentHTML('beforeend',`<option value="${evEscape(s)}">${evEscape(s)}</option>`));}
function evSummaryCounts(){
  const count=fn=>EV_ROWS.filter(fn).length;
  return {profiles:EV_ROWS.length,withStudent:count(r=>r.student>0),diverse:count(r=>r.sourceClasses>=2),timeline:count(r=>r.timeline.supported>0),first90:count(r=>r.f90.count>=3),noSources:count(r=>r.noSources),noStudent:count(r=>r.noStudent),officialOnly:count(r=>r.officialOnly),singleSource:count(r=>r.singleSource),noTimeline:count(r=>r.noTimeline),thinFirst90:count(r=>r.thinFirst90),olderSource:count(r=>r.olderSource),mixed:count(r=>r.mixed)};
}
function evRenderStats(){const c=evSummaryCounts();document.getElementById('evidence-stats').innerHTML=[['200', 'Junior Culture profiles'],[c.withStudent,'with student/community evidence'],[c.diverse,'with 2+ source classes'],[c.first90,'with 3+ First-90 dimensions'],[c.timeline,'with supported timeline timing']].map(([n,l])=>`<div class="evidence-stat"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');}
function evRenderGapSummary(){
  const c=evSummaryCounts(); const cards=[
    ['no-sources',c.noSources,'No direct sources','Highest-value source acquisition gap'],
    ['no-student',c.noStudent,'No lived source','No student/community account in the profile'],
    ['official-only',c.officialOnly,'Official only','Formal safeguards without lived corroboration'],
    ['single-source',c.singleSource,'Single source','Needs independent corroboration'],
    ['no-timeline',c.noTimeline,'No timeline timing','No A–C phase-specific evidence'],
    ['thin-first90',c.thinFirst90,'Thin First 90','Fewer than 2 of 5 dimensions supported'],
    ['older-source',c.olderSource,'No 2026 source','Newest dated source is 2025 or earlier'],
    ['conflict',c.mixed,'Conflicting / mixed','Current evidence needs reconciliation']
  ];
  const grid=document.getElementById('gap-summary-grid');grid.innerHTML=cards.map(([k,n,t,d])=>`<button type="button" class="gap-card" data-gap="${k}"><div class="n">${n}</div><div class="t">${t}</div><div class="d">${d}</div></button>`).join('');
  grid.querySelectorAll('[data-gap]').forEach(b=>b.addEventListener('click',()=>{const sel=document.getElementById('evidence-gap');sel.value=b.dataset.gap;document.querySelectorAll('.gap-card').forEach(x=>x.classList.toggle('active',x===b));evRenderTable();document.getElementById('evidence-table').scrollIntoView({behavior:'smooth',block:'start'});}));
}
function evGapMatch(r,v){if(v==='all')return true;return ({'no-sources':r.noSources,'no-student':r.noStudent,'official-only':r.officialOnly,'single-source':r.singleSource,'no-timeline':r.noTimeline,'thin-first90':r.thinFirst90,'older-source':r.olderSource,'conflict':r.mixed})[v]===true;}
function evFiltered(){
  const q=document.getElementById('evidence-search').value.trim().toLowerCase(), st=document.getElementById('evidence-state').value, gap=document.getElementById('evidence-gap').value, src=document.getElementById('evidence-source').value, cov=document.getElementById('evidence-coverage').value, sort=document.getElementById('evidence-sort').value;
  let rows=EV_ROWS.filter(r=>{
    if(st!=='all'&&r.college.state!==st)return false;
    if(q&&![r.college.name,evFormatName(r.college.name),r.college.city,r.college.state].join(' ').toLowerCase().includes(q))return false;
    if(!evGapMatch(r,gap))return false;
    if(src==='diverse'&&r.sourceClasses<2)return false;if(src==='official'&&!r.official)return false;if(src==='student'&&!r.student)return false;if(src==='news'&&!r.news)return false;
    if(cov==='strong'&&r.coverage<70)return false;if(cov==='medium'&&(r.coverage<40||r.coverage>=70))return false;if(cov==='thin'&&r.coverage>=40)return false;if(cov==='timeline3'&&r.timeline.supported<3)return false;if(cov==='first903'&&r.f90.count<3)return false;
    return true;
  });
  if(sort==='coverage-desc')rows.sort((a,b)=>b.coverage-a.coverage||b.directSources-a.directSources||a.college.name.localeCompare(b.college.name));
  else if(sort==='coverage-asc')rows.sort((a,b)=>a.coverage-b.coverage||b.priority-a.priority||a.college.name.localeCompare(b.college.name));
  else if(sort==='sources')rows.sort((a,b)=>b.directSources-a.directSources||b.sourceClasses-a.sourceClasses||a.college.name.localeCompare(b.college.name));
  else if(sort==='timeline')rows.sort((a,b)=>b.timeline.supported-a.timeline.supported||b.f90.count-a.f90.count||a.college.name.localeCompare(b.college.name));
  else if(sort==='name')rows.sort((a,b)=>a.college.name.localeCompare(b.college.name));
  else rows.sort((a,b)=>b.priority-a.priority||a.coverage-b.coverage||a.college.name.localeCompare(b.college.name));
  return rows;
}
function evPriorityLabel(r){if(r.priority>=12)return ['High research gap','high'];if(r.priority>=7)return ['Medium gap','med'];return ['Lower gap',''];}
function evSourceBadges(r){const b=[];if(r.official)b.push(`<span class="ev-badge official">Official ${r.official}</span>`);if(r.news)b.push(`<span class="ev-badge news">News ${r.news}</span>`);if(r.student)b.push(`<span class="ev-badge student">Student ${r.student}</span>`);if(!r.directSources)b.push('<span class="ev-badge gap">No direct source</span>');return b.join('');}
function evRenderTable(){
  const rows=evFiltered(); const root=document.getElementById('evidence-table');document.getElementById('evidence-count').textContent=`${rows.length} of ${EV_ROWS.length} researched profiles shown`;
  document.querySelectorAll('.gap-card').forEach(x=>x.classList.toggle('active',x.dataset.gap===document.getElementById('evidence-gap').value));
  if(!rows.length){root.innerHTML='<div class="empty-evidence">No profiles match these evidence filters.</div>';return;}
  const head=`<div class="evidence-row head"><div>College / evidence mix</div><div>Coverage</div><div>Research gap</div><div>Independent sources</div><div>First 90</div><div>Timeline</div></div>`;
  root.innerHTML=head+rows.map(r=>{const [pl,pc]=evPriorityLabel(r);const reason=r.reasons.slice(0,2).join(' · ')||'comparatively complete evidence';const newest=r.newestYear||'undated';return `<article class="evidence-row">
    <div class="ev-name"><a href="college.html?id=${r.id}">${evEscape(evFormatName(r.college.name))}</a><div class="ev-loc">${evEscape(r.college.city)}, ${evEscape(r.college.state)} · verified ${evEscape(r.jc.lastVerified||'undated')}</div><div class="ev-badges">${evSourceBadges(r)}</div><div class="ev-actions"><a href="college.html?id=${r.id}">Profile</a><a href="compare.html?c=${r.id}">Compare</a><a href="culture.html">Culture</a><a href="timeline.html?college=${r.id}">Timeline</a></div></div>
    <div><div class="ev-score">${r.coverage}/100<small>evidence breadth</small></div><div class="ev-meter"><span style="width:${r.coverage}%"></span></div></div>
    <div class="ev-priority ${pc}">${r.priority}<small>${evEscape(pl)}</small><div class="ev-detail">${evEscape(reason)}</div></div>
    <div class="ev-sources"><strong>${r.directSources}</strong> direct<div class="ev-detail">${r.sourceClasses}/3 classes · newest ${newest}</div></div>
    <div class="ev-first90"><strong>${r.f90.count}/5</strong> dimensions<div class="ev-detail">first weeks · residence · gender · opt-out · after freshers</div></div>
    <div class="ev-timeline"><strong>${r.timeline.supported}/6</strong> supported<div class="ev-detail">${r.timeline.lead?`${r.timeline.lead} lead-only cell${r.timeline.lead===1?'':'s'}`:'timing-strict'}</div></div>
  </article>`;}).join('');
}
function evInit(){
  evSetTheme();evPopulateStates();evRenderStats();evRenderGapSummary();
  ['evidence-search','evidence-state','evidence-gap','evidence-source','evidence-coverage','evidence-sort'].forEach(id=>{const el=document.getElementById(id);el.addEventListener(id==='evidence-search'?'input':'change',evRenderTable);});
  evRenderTable();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',evInit);else evInit();
