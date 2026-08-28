'use strict';

/* Shared theme, browser storage, candidate profile and counselling helpers. */

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.dataset.theme = isDark ? 'dark' : 'light';
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }
}

function initTheme() {
  try { applyTheme(localStorage.getItem('merit-register-theme') || 'light'); }
  catch (e) { applyTheme('light'); }
  const toggle = document.getElementById('theme-toggle');
  if (toggle && !toggle.dataset.themeBound) {
    toggle.dataset.themeBound = '1';
    toggle.addEventListener('click', () => {
      const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('merit-register-theme', nextTheme); } catch (e) {}
      applyTheme(nextTheme);
    });
  }
}

if(!window.storage){
  window.storage = {
    get: async (key) => ({ value: localStorage.getItem(key) }),
    set: async (key, value) => { localStorage.setItem(key, value); return { value }; },
    remove: async (key) => { localStorage.removeItem(key); return true; }
  };
}

const CANDIDATE_PROFILE_KEY = 'merit-register-candidate-profile-v1';
const AIQ_CATEGORIES = ['General','OBC','EWS','SC','ST'];
const CATEGORY_LABELS = {General:'General / UR',OBC:'OBC-NCL',EWS:'EWS',SC:'SC',ST:'ST'};

function safeJsonParse(raw, fallback){
  try { const v=JSON.parse(raw); return v ?? fallback; } catch(e){ return fallback; }
}
function normaliseCandidateProfile(v){
  v = v && typeof v === 'object' ? v : {};
  const air = Number(v.air);
  return {
    air: Number.isFinite(air) && air > 0 ? Math.floor(air) : null,
    category: AIQ_CATEGORIES.includes(v.category) ? v.category : 'General',
    domicile: String(v.domicile || '').trim()
  };
}
function getCandidateProfile(){
  try { return normaliseCandidateProfile(safeJsonParse(localStorage.getItem(CANDIDATE_PROFILE_KEY), {})); }
  catch(e){ return normaliseCandidateProfile({}); }
}
function saveCandidateProfile(profile){
  const clean=normaliseCandidateProfile(profile);
  try { localStorage.setItem(CANDIDATE_PROFILE_KEY, JSON.stringify(clean)); } catch(e){}
  window.dispatchEvent(new CustomEvent('candidateprofilechange',{detail:clean}));
  return clean;
}
function clearCandidateProfile(){
  try { localStorage.removeItem(CANDIDATE_PROFILE_KEY); } catch(e){}
  const clean=normaliseCandidateProfile({});
  window.dispatchEvent(new CustomEvent('candidateprofilechange',{detail:clean}));
  return clean;
}

function recordForYear(collegeId, year){
  const id=Number(collegeId);
  if(year===2026 && typeof AIQ_CUTOFFS_2026!=='undefined') return AIQ_CUTOFFS_2026[id] || AIQ_CUTOFFS_2026[String(id)] || null;
  if(year===2025 && typeof CUTOFFS!=='undefined') return CUTOFFS[id] || CUTOFFS[String(id)] || null;
  return null;
}
function categoryRoundsFromRecord(record, category='General'){
  if(!record) return null;
  if(record.category_rounds && record.category_rounds[category]) return record.category_rounds[category];
  if(category==='General' && record.rounds) return record.rounds;
  if(record.categories_final_round && record.categories_final_round[category] != null){
    return {Final: Number(record.categories_final_round[category])};
  }
  return null;
}
function validRank(v){ const n=Number(v); return Number.isFinite(n) && n>0 ? n : null; }
function roundStatus(record, round){
  return (record && record.round_status && record.round_status[round]) || (record && record.status) || 'final';
}
function has2026CutoffData(){
  return typeof AIQ_CUTOFFS_2026!=='undefined' && AIQ_CUTOFFS_2026 && Object.keys(AIQ_CUTOFFS_2026).length>0;
}
function currentAiqMeta(){
  if(typeof AIQ_2026_META!=='undefined' && AIQ_2026_META) return AIQ_2026_META;
  return {year:2026, rounds:{R1:{published:false,imported:false,status:'awaiting'}}};
}
function earliestHistoricalReach(record, category, air){
  const rounds=categoryRoundsFromRecord(record,category);
  if(!rounds || !air) return null;
  for(const r of ['R1','R2','R3','Stray','Final']){
    const cutoff=validRank(rounds[r]);
    if(cutoff && air<=cutoff) return {round:r,cutoff};
  }
  const known=['R1','R2','R3','Stray','Final'].map(r=>({round:r,cutoff:validRank(rounds[r])})).filter(x=>x.cutoff);
  if(!known.length) return null;
  return {round:null,cutoff:known[known.length-1].cutoff,lastRound:known[known.length-1].round};
}
function classifyHistoricalReach(round, cutoff, air){
  if(!round || !cutoff || !air) return null;
  const cushion=(cutoff-air)/cutoff;
  if(round==='R1'){
    if(cushion>=0.10) return 'Safe';
    if(cushion>=0.03) return 'Competitive';
    return 'Reach';
  }
  if(round==='R2') return 'Competitive';
  return 'Reach';
}

/**
 * One counselling interpretation used everywhere.
 * 2026 is current-state only: if R1 exists and AIR misses it, R2/R3 are *pending*, not out-of-range.
 * 2025 is historical fallback and may use all loaded rounds.
 */
function getCollegeReach(collegeId, air, category='General'){
  air=validRank(air); category=AIQ_CATEGORIES.includes(category)?category:'General';
  if(!air) return {state:'no-profile',year:null,label:'Set AIR to personalise',category};

  const r26=recordForYear(collegeId,2026), rounds26=categoryRoundsFromRecord(r26,category);
  if(rounds26){
    const available=['R1','R2','R3','Stray'].filter(r=>validRank(rounds26[r]));
    if(available.length){
      for(const round of available){
        const cutoff=validRank(rounds26[round]);
        if(air<=cutoff){
          const margin=cutoff-air;
          return {state:'reached',year:2026,current:true,round,cutoff,margin,category,status:roundStatus(r26,round),label:`${round} reached`,record:r26};
        }
      }
      const lastRound=available[available.length-1], cutoff=validRank(rounds26[lastRound]);
      const pending=['R1','R2','R3'].some(r=>!validRank(rounds26[r]));
      return {state:pending?'missed-current':'out',year:2026,current:true,round:lastRound,cutoff,margin:air-cutoff,category,status:roundStatus(r26,lastRound),pending,label:pending?`${lastRound} missed · next round pending`:'Out of 2026 loaded range',record:r26};
    }
  }

  const r25=recordForYear(collegeId,2025), hist=earliestHistoricalReach(r25,category,air);
  if(!hist) return {state:'unknown',year:2025,current:false,label:'No category-specific cutoff data',category,record:r25};
  if(hist.round){
    const margin=hist.cutoff-air;
    const chance=classifyHistoricalReach(hist.round,hist.cutoff,air);
    return {state:'historical-reach',year:2025,current:false,round:hist.round,cutoff:hist.cutoff,margin,category,chance,label:`${hist.round} · ${chance}`,record:r25};
  }
  return {state:'historical-out',year:2025,current:false,round:hist.lastRound,cutoff:hist.cutoff,margin:air-hist.cutoff,category,label:'Out of historical range',record:r25};
}

function getRoundMovement(collegeId, category='General', round='R1'){
  const a=categoryRoundsFromRecord(recordForYear(collegeId,2026),category);
  const b=categoryRoundsFromRecord(recordForYear(collegeId,2025),category);
  const current=validRank(a && a[round]), previous=validRank(b && b[round]);
  if(!current || !previous) return null;
  const delta=current-previous;
  return {
    current,previous,delta,
    direction:delta<0?'stronger':delta>0?'softer':'unchanged',
    magnitude:Math.abs(delta)
  };
}
function formatIndianRank(v){ const n=validRank(v); return n?n.toLocaleString('en-IN'):'—'; }
function reachShortText(reach){
  if(!reach) return 'Unknown';
  if(reach.state==='reached') return `${reach.round} reached · ${formatIndianRank(reach.margin)}-rank cushion`;
  if(reach.state==='missed-current') return `${reach.round} missed by ${formatIndianRank(reach.margin)} · next round pending`;
  if(reach.state==='historical-reach') return `${reach.round} · ${reach.chance} · ${formatIndianRank(reach.margin)}-rank cushion (2025)`;
  if(reach.state==='historical-out') return `Historical range missed by ${formatIndianRank(reach.margin)} (2025)`;
  return reach.label || 'Unknown';
}
function movementText(m){
  if(!m) return '';
  if(m.direction==='unchanged') return 'unchanged vs 2025';
  return `${formatIndianRank(m.magnitude)} AIR ${m.direction} vs 2025`;
}

function injectCandidateProfileUI(){
  if(document.getElementById('candidate-profile-chip')) return;
  const controls=document.querySelector('.masthead-controls');
  if(!controls) return;
  const chip=document.createElement('button');
  chip.id='candidate-profile-chip'; chip.type='button'; chip.className='candidate-profile-chip';
  controls.insertBefore(chip,controls.firstChild);

  const overlay=document.createElement('div');
  overlay.className='candidate-profile-overlay'; overlay.id='candidate-profile-overlay';
  overlay.innerHTML=`<div class="candidate-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="candidate-profile-title">
    <div class="candidate-profile-head"><div><div class="candidate-profile-kicker">Personalise the site</div><h2 id="candidate-profile-title">Your counselling profile</h2></div><button class="candidate-profile-close" type="button" aria-label="Close">×</button></div>
    <p>Save your AIR and AIQ category once. The Directory, Compare, college profiles and Preference List will use the same profile.</p>
    <div class="candidate-profile-form">
      <label>NEET AIR<input id="candidate-profile-air" type="number" min="1" placeholder="e.g. 232"></label>
      <label>AIQ category<select id="candidate-profile-category">${AIQ_CATEGORIES.map(c=>`<option value="${c}">${CATEGORY_LABELS[c]}</option>`).join('')}</select></label>
      <label>Domicile <span>(saved for later)</span><input id="candidate-profile-domicile" type="text" placeholder="e.g. Bihar"></label>
    </div>
    <div class="candidate-profile-actions"><button class="candidate-profile-reset" type="button">Clear profile</button><button class="candidate-profile-save" type="button">Save profile</button></div>
    <div class="candidate-profile-note">Domicile does not affect calculations while the site is AIQ-only.</div>
  </div>`;
  document.body.appendChild(overlay);
  const airEl=overlay.querySelector('#candidate-profile-air'),catEl=overlay.querySelector('#candidate-profile-category'),domEl=overlay.querySelector('#candidate-profile-domicile');
  function refreshChip(){
    const p=getCandidateProfile();
    chip.innerHTML=p.air?`<span>AIR ${formatIndianRank(p.air)}</span><small>${CATEGORY_LABELS[p.category]} · Edit</small>`:`<span>Set your AIR</span><small>Personalise results</small>`;
  }
  function open(){ const p=getCandidateProfile(); airEl.value=p.air||'';catEl.value=p.category;domEl.value=p.domicile||'';overlay.classList.add('open');airEl.focus(); }
  function close(){overlay.classList.remove('open');}
  chip.addEventListener('click',open); overlay.querySelector('.candidate-profile-close').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  overlay.querySelector('.candidate-profile-save').addEventListener('click',()=>{
    saveCandidateProfile({air:airEl.value,category:catEl.value,domicile:domEl.value});refreshChip();close();
  });
  overlay.querySelector('.candidate-profile-reset').addEventListener('click',()=>{clearCandidateProfile();refreshChip();close();});
  window.addEventListener('candidateprofilechange',refreshChip); refreshChip();
}

function initSharedUi(){ initTheme(); injectCandidateProfileUI(); }

document.addEventListener('DOMContentLoaded', initSharedUi);


// Canonical college master. College IDs are the shared key across every dataset.

/* ALL_COLLEGES moved to shared V8 data layer. */



// Official MCC 2025 AIQ/Open Seat category-wise round cutoffs.

/* CUTOFFS moved to shared V8 data layer. */



// 2026 MCC AIQ/Open-seat cutoff dataset. Generated by scripts/import-mcc-result.py.
// Do not hand-edit cutoff ranks; re-run the importer and inspect audit outputs instead.
const AIQ_2026_META = {"year":2026,"rounds":{"R1":{"published":true,"imported":true,"status":"provisional","published_at":"2026-08-20","imported_at":"2026-08-21","discrepancy_deadline":"2026-08-21 15:59 IST","source_title":"MCC NEET UG 2026 Provisional Round 1 Allotment Result","source_url":"https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2026/08/202608202078593834.pdf","profiles_imported":451,"note":"Audited import complete: 451 canonical college profiles. 1 MCC institute label(s) remain outside the canonical government-college master and are retained in the audit log. PwD-specific allotted categories are excluded from ordinary category cutoffs."}}};

/* AIQ_CUTOFFS_2026 moved to shared V8 data layer. */




'use strict';
const $m=id=>document.getElementById(id);
const MOVEMENT_CATS=['General','OBC','EWS','SC','ST'];
function mEsc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function evidence2025(record){
  if(!record)return {tier:'none',label:'No 2025 record'};
  const text=`${record.source||''} ${record.categories_source||''}`.toLowerCase();
  const official=record.categories_confidence==='high'||text.includes('official mcc');
  return official?{tier:'official',label:'Official MCC'}:{tier:'legacy',label:'Legacy / secondary'};
}
function movementRows(){
  const cat=MOVEMENT_CATS.includes($m('movement-category').value)?$m('movement-category').value:'General';
  const state=$m('movement-state').value, q=$m('movement-search').value.trim().toLowerCase(), quality=$m('movement-quality').value;
  let rows=ALL_COLLEGES.map(c=>{
    const m=getRoundMovement(c.id,cat,'R1'); if(!m)return null;
    const ev=evidence2025(recordForYear(c.id,2025));
    return {c,m,ev,pct:m.previous?m.delta/m.previous*100:null};
  }).filter(Boolean).filter(x=>{
    if(state&&x.c.state!==state)return false;
    if(quality==='official'&&x.ev.tier!=='official')return false;
    if(q&&!(typeof collegeSearchMatches==='function'?collegeSearchMatches(x.c,q):`${x.c.name} ${x.c.city} ${x.c.state}`.toLowerCase().includes(q)))return false;
    return true;
  });
  const sort=$m('movement-sort').value;
  if(sort==='stronger')rows.sort((a,b)=>(a.m.delta-b.m.delta)||a.c.name.localeCompare(b.c.name));
  else if(sort==='softer')rows.sort((a,b)=>(b.m.delta-a.m.delta)||a.c.name.localeCompare(b.c.name));
  else if(sort==='current')rows.sort((a,b)=>a.m.current-b.m.current||a.c.name.localeCompare(b.c.name));
  else if(sort==='previous')rows.sort((a,b)=>a.m.previous-b.m.previous||a.c.name.localeCompare(b.c.name));
  else rows.sort((a,b)=>a.c.name.localeCompare(b.c.name));
  return rows;
}
function signed(n){if(!Number.isFinite(n))return '—';return `${n>0?'+':''}${Math.round(n).toLocaleString('en-IN')}`;}
function pct(n){if(!Number.isFinite(n))return '—';return `${n>0?'+':''}${n.toFixed(1)}%`;}
function median(values){const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const i=Math.floor(a.length/2);return a.length%2?a[i]:(a[i-1]+a[i])/2;}
function card(x){return `<div class="movement-card"><div><a href="college.html?id=${x.c.id}">${mEsc(x.c.name)}</a><div class="meta">${mEsc(x.c.city)}, ${mEsc(x.c.state)}</div></div><div class="shift ${x.m.direction}">${x.m.direction==='stronger'?'↓':'↑'} ${x.m.magnitude.toLocaleString('en-IN')} AIR<div class="ranks">${x.m.previous.toLocaleString('en-IN')} → ${x.m.current.toLocaleString('en-IN')}</div></div></div>`;}
function renderMovement(){
  const rows=movementRows(),cat=$m('movement-category').value;
  const stronger=rows.filter(x=>x.m.direction==='stronger'),softer=rows.filter(x=>x.m.direction==='softer'),official=rows.filter(x=>x.ev.tier==='official');
  const med=median(rows.map(x=>x.m.delta));
  const allComparable=ALL_COLLEGES.map(c=>getRoundMovement(c.id,cat,'R1')).filter(Boolean).length;
  $m('movement-summary').innerHTML=`<div class="movement-stat"><div class="n">${rows.length}</div><div class="l">Comparable shown</div></div><div class="movement-stat stronger"><div class="n">${stronger.length}</div><div class="l">Stronger vs 2025</div></div><div class="movement-stat softer"><div class="n">${softer.length}</div><div class="l">Softer vs 2025</div></div><div class="movement-stat"><div class="n">${med===null?'—':signed(med)}</div><div class="l">Median Δ AIR</div></div><div class="movement-stat"><div class="n">${official.length}</div><div class="l">Official 2025 evidence</div></div>`;
  const strongest=[...rows].filter(x=>x.m.direction==='stronger').sort((a,b)=>a.m.delta-b.m.delta).slice(0,8);
  const softest=[...rows].filter(x=>x.m.direction==='softer').sort((a,b)=>b.m.delta-a.m.delta).slice(0,8);
  $m('movement-risers').innerHTML=strongest.length?strongest.map(card).join(''):'<div class="movement-empty">No stronger movements match these filters.</div>';
  $m('movement-fallers').innerHTML=softest.length?softest.map(card).join(''):'<div class="movement-empty">No softer movements match these filters.</div>';
  $m('movement-body').innerHTML=rows.length?rows.map(x=>`<tr><td class="movement-college"><a href="college.html?id=${x.c.id}">${mEsc(x.c.name)}</a><small>${mEsc(x.c.city)}, ${mEsc(x.c.state)} · ${mEsc(x.c.type)}</small></td><td>${x.m.previous.toLocaleString('en-IN')}</td><td><strong>${x.m.current.toLocaleString('en-IN')}</strong></td><td class="movement-delta ${x.m.direction}">${signed(x.m.delta)}</td><td><span class="movement-direction ${x.m.direction}">${x.m.direction==='stronger'?'Stronger':'Softer'} · ${pct(x.pct)}</span></td><td class="movement-evidence">${mEsc(x.ev.label)}</td></tr>`).join(''):`<tr><td colspan="6"><div class="movement-empty">No comparable 2025 ↔ 2026 Round-1 records match these filters.</div></td></tr>`;
  $m('movement-count').textContent=`${rows.length} shown · ${allComparable} nationwide comparable`;
  $m('movement-table-note').textContent=`${cat==='General'?'General / UR':cat} · exact allotted-category closing AIRs · lower rank = stronger demand`;
}
function initMovement(){
  [...new Set(ALL_COLLEGES.map(c=>c.state))].sort().forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;$m('movement-state').appendChild(o);});
  const meta=currentAiqMeta(),r1=meta.rounds?.R1,profiles=Object.keys(AIQ_CUTOFFS_2026||{}).length;
  $m('movement-data-strip').innerHTML=`<div class="movement-provisional"><span class="pill">${mEsc(r1?.status||'provisional')}</span><strong>2026 MCC Round 1</strong><span>${profiles.toLocaleString('en-IN')} current college profiles loaded.</span><span>Movement appears only where a 2025 R1 value also exists.</span></div>`;
  ['movement-category','movement-state','movement-quality','movement-sort'].forEach(id=>$m(id).addEventListener('change',renderMovement));$m('movement-search').addEventListener('input',renderMovement);
  renderMovement();
}
document.addEventListener('DOMContentLoaded',initMovement);
