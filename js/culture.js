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
const CONDITIONAL_ELIGIBILITIES = [
  {key:'du', label:'Delhi University quota', short:'DU', note:'Eligibility is separate from domicile; confirm DU rules.'},
  {key:'ip', label:'IP University quota', short:'IPU', note:'Eligibility is separate from domicile; confirm GGSIPU rules.'},
  {key:'esi', label:'ESI insured-person quota', short:'ESI', note:'Enable only if the relevant ESI insured-person eligibility applies.'},
  {key:'amu', label:'AMU quota', short:'AMU', note:'Enable only if the relevant AMU quota eligibility applies.'},
  {key:'puducherry', label:'Puducherry UT internal', short:'Puducherry', note:'For JIPMER Puducherry/Karaikal internal UT-domicile seats.'},
  {key:'cw_du', label:'CW quota — DU', short:'CW-DU', note:'Children/Widows of Armed Forces Personnel under DU.'},
  {key:'cw_ip', label:'CW quota — IPU', short:'CW-IPU', note:'Children/Widows of Armed Forces Personnel under IPU.'},
  {key:'foreign', label:'Foreign Country quota', short:'Foreign', note:'Enable only if specifically eligible.'},
  {key:'amu_nri', label:'AMU NRI quota', short:'AMU NRI', note:'Enable only if specifically eligible.'}
];

function safeJsonParse(raw, fallback){
  try { const v=JSON.parse(raw); return v ?? fallback; } catch(e){ return fallback; }
}
function normaliseCandidateProfile(v){
  v = v && typeof v === 'object' ? v : {};
  const air = Number(v.air);
  const sourceElig = v.eligibilities && typeof v.eligibilities === 'object' ? v.eligibilities : {};
  const eligibilities = {};
  CONDITIONAL_ELIGIBILITIES.forEach(x => { eligibilities[x.key] = sourceElig[x.key] === true; });
  return {
    air: Number.isFinite(air) && air > 0 ? Math.floor(air) : null,
    category: AIQ_CATEGORIES.includes(v.category) ? v.category : 'General',
    domicile: String(v.domicile || '').trim(),
    eligibilities
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
function profileExtraEligibilityLabels(profile=getCandidateProfile()){
  const p=normaliseCandidateProfile(profile);
  return CONDITIONAL_ELIGIBILITIES.filter(x=>p.eligibilities[x.key]).map(x=>x.short);
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
function hasQuotaStreamData(){
  return typeof MCC_CUTOFFS_2026_BY_QUOTA!=='undefined' && MCC_CUTOFFS_2026_BY_QUOTA && Object.keys(MCC_CUTOFFS_2026_BY_QUOTA).length>0;
}
function currentAiqMeta(){
  if(typeof AIQ_2026_META!=='undefined' && AIQ_2026_META) return AIQ_2026_META;
  return {year:2026, rounds:{R1:{published:false,imported:false,status:'awaiting'}}};
}
function currentQuotaMeta(){
  if(typeof MCC_QUOTA_2026_META!=='undefined' && MCC_QUOTA_2026_META) return MCC_QUOTA_2026_META;
  return {year:2026,round:'R1',status:'awaiting'};
}
function quotaStreamMeta(code){
  if(typeof MCC_QUOTA_STREAMS!=='undefined' && MCC_QUOTA_STREAMS && MCC_QUOTA_STREAMS[code]) return MCC_QUOTA_STREAMS[code];
  const fallback={
    AI:{label:'All India',short_label:'AIQ',eligibility:'universal'}, SO:{label:'Open Seat Quota',short_label:'Open Seat',eligibility:'universal'},
    DU:{label:'Delhi University Quota',short_label:'DU quota',eligibility_key:'du'}, IP:{label:'IP University Quota',short_label:'IPU quota',eligibility_key:'ip'},
    ES:{label:'Employees State Insurance Scheme (ESI)',short_label:'ESI',eligibility_key:'esi'}, AM:{label:'Aligarh Muslim University (AMU) Quota',short_label:'AMU',eligibility_key:'amu'},
    JP:{label:'Internal - Puducherry UT Domicile',short_label:'Puducherry internal',eligibility_key:'puducherry'}, DW:{label:'Delhi NCR CW — DU Quota',short_label:'CW-DU',eligibility_key:'cw_du'},
    IW:{label:'Delhi NCR CW — IP Quota',short_label:'CW-IPU',eligibility_key:'cw_ip'}, FQ:{label:'Foreign Country Quota',short_label:'Foreign',eligibility_key:'foreign'}, AN:{label:'NRI (AMU) Quota',short_label:'AMU NRI',eligibility_key:'amu_nri'}
  };
  return fallback[code] || {label:code,short_label:code};
}
function quotaRecordsForCollege(collegeId){
  if(!hasQuotaStreamData()) return {};
  const id=Number(collegeId);
  return MCC_CUTOFFS_2026_BY_QUOTA[id] || MCC_CUTOFFS_2026_BY_QUOTA[String(id)] || {};
}
function eligibleQuotaCodes(profile=getCandidateProfile()){
  const p=normaliseCandidateProfile(profile);
  const codes=['AI','SO'];
  const streamObj=typeof MCC_QUOTA_STREAMS!=='undefined' && MCC_QUOTA_STREAMS ? MCC_QUOTA_STREAMS : {};
  Object.keys(streamObj).forEach(code=>{
    const meta=streamObj[code];
    if(meta && meta.eligibility_key && p.eligibilities[meta.eligibility_key] && !codes.includes(code)) codes.push(code);
  });
  // Fallback so the profile still works on pages that load common.js before the stream file.
  const fallback={du:'DU',ip:'IP',esi:'ES',amu:'AM',puducherry:'JP',cw_du:'DW',cw_ip:'IW',foreign:'FQ',amu_nri:'AN'};
  Object.entries(fallback).forEach(([key,code])=>{ if(p.eligibilities[key] && !codes.includes(code)) codes.push(code); });
  return codes;
}
function quotaRouteStatuses(collegeId, air, category='General', profile=getCandidateProfile()){
  air=validRank(air); category=AIQ_CATEGORIES.includes(category)?category:'General';
  if(!air || !hasQuotaStreamData()) return [];
  const records=quotaRecordsForCollege(collegeId), allowed=new Set(eligibleQuotaCodes(profile));
  const routes=[];
  Object.entries(records).forEach(([code,record])=>{
    if(!allowed.has(code)) return;
    const rounds=categoryRoundsFromRecord(record,category), cutoff=validRank(rounds && rounds.R1);
    if(!cutoff) return;
    const margin=cutoff-air;
    routes.push({
      routeKey:code, quotaCode:code, quotaLabel:(quotaStreamMeta(code).short_label||quotaStreamMeta(code).label||code),
      fullQuotaLabel:quotaStreamMeta(code).label||code, cutoff, round:'R1', basisRound:'R1', margin,
      state:margin>=0?'reached':'missed-current', status:roundStatus(record,'R1'), category, record,
      relativeMargin:margin/cutoff
    });
  });
  // Highest cutoff is the easiest current route for this AIR/category. Keep reached routes first.
  routes.sort((a,b)=>{
    if(a.state!==b.state) return a.state==='reached'?-1:1;
    return b.cutoff-a.cutoff || a.quotaLabel.localeCompare(b.quotaLabel);
  });
  return routes;
}
function bestQuotaRoute(collegeId, air, category='General', profile=getCandidateProfile()){
  const routes=quotaRouteStatuses(collegeId,air,category,profile);
  return routes[0] || null;
}
function choicePlanningBand(route){
  if(!route || !validRank(route.cutoff)) return {label:'Unknown',className:'unknown',note:'No eligible 2026 R1 route loaded'};
  const ratio=Number(route.relativeMargin);
  if(ratio>=0.15) return {label:'Safety',className:'safety',note:'R1 reached with a substantial current cushion'};
  if(ratio>=0.03) return {label:'Likely',className:'likely',note:'R1 reached with a positive current cushion'};
  if(ratio>=-0.08) return {label:'Competitive',className:'competitive',note:ratio>=0?'R1 reached near the current cutoff':'R1 narrowly missed; later rounds are unpublished'};
  return {label:'Dream',className:'dream',note:'Current R1 cutoff is materially stronger than this AIR'};
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
 * 2026 checks each eligible quota stream separately. If R1 is missed, R2/R3 are pending.
 * 2025 remains a historical AIQ/Open fallback only when no eligible 2026 stream record exists.
 */
function getCollegeReach(collegeId, air, category='General', profile=getCandidateProfile()){
  air=validRank(air); category=AIQ_CATEGORIES.includes(category)?category:'General';
  if(!air) return {state:'no-profile',year:null,label:'Set AIR to personalise',category};

  const routes=quotaRouteStatuses(collegeId,air,category,profile);
  if(routes.length){
    const best=routes[0];
    if(best.state==='reached') return {...best,year:2026,current:true,label:`${best.quotaLabel} · R1 reached`,routes};
    return {...best,year:2026,current:true,pending:true,margin:Math.abs(best.margin),label:`${best.quotaLabel} · R1 missed · next round pending`,routes};
  }

  // Backwards-compatible current AIQ record in case the quota stream file is absent.
  const r26=recordForYear(collegeId,2026), rounds26=categoryRoundsFromRecord(r26,category);
  if(rounds26){
    const available=['R1','R2','R3','Stray'].filter(r=>validRank(rounds26[r]));
    if(available.length){
      for(const round of available){
        const cutoff=validRank(rounds26[round]);
        if(air<=cutoff){
          const margin=cutoff-air;
          return {state:'reached',year:2026,current:true,round,cutoff,margin,category,status:roundStatus(r26,round),label:`${round} reached`,record:r26,quotaLabel:'AIQ/Open'};
        }
      }
      const lastRound=available[available.length-1], cutoff=validRank(rounds26[lastRound]);
      const pending=['R1','R2','R3'].some(r=>!validRank(rounds26[r]));
      return {state:pending?'missed-current':'out',year:2026,current:true,round:lastRound,cutoff,margin:air-cutoff,category,status:roundStatus(r26,lastRound),pending,label:pending?`${lastRound} missed · next round pending`:'Out of 2026 loaded range',record:r26,quotaLabel:'AIQ/Open'};
    }
  }

  const r25=recordForYear(collegeId,2025), hist=earliestHistoricalReach(r25,category,air);
  if(!hist) return {state:'unknown',year:2025,current:false,label:'No category-specific cutoff data',category,record:r25};
  if(hist.round){
    const margin=hist.cutoff-air;
    const chance=classifyHistoricalReach(hist.round,hist.cutoff,air);
    return {state:'historical-reach',year:2025,current:false,round:hist.round,cutoff:hist.cutoff,margin,category,chance,label:`${hist.round} · ${chance}`,record:r25,quotaLabel:'AIQ/Open'};
  }
  return {state:'historical-out',year:2025,current:false,round:hist.lastRound,cutoff:hist.cutoff,margin:air-hist.cutoff,category,label:'Out of historical range',record:r25,quotaLabel:'AIQ/Open'};
}

function aiqOpenQuotaFamily(record){
  if(!record) return null;
  const q=String(record.quota||record.quota_label||'').toLowerCase();
  if(q.includes('open seat')) return 'SO';
  if(q.includes('all india') || q.includes('aiq')) return 'AI';
  return null;
}
function getRoundMovement(collegeId, category='General', round='R1'){
  const rec26=recordForYear(collegeId,2026), rec25=recordForYear(collegeId,2025);
  // Movement is only valid for the same counselling pool, same category and same round.
  // Conflicting/ambiguous historical quota labels are excluded rather than cross-compared.
  const family26=aiqOpenQuotaFamily(rec26), family25=aiqOpenQuotaFamily(rec25);
  if(!family26 || !family25 || family26!==family25) return null;
  const a=categoryRoundsFromRecord(rec26,category), b=categoryRoundsFromRecord(rec25,category);
  const current=validRank(a && a[round]), previous=validRank(b && b[round]);
  if(!current || !previous) return null;
  const delta=current-previous;
  return {
    current,previous,delta,
    direction:delta<0?'stronger':delta>0?'softer':'unchanged',
    magnitude:Math.abs(delta),round,quotaFamily:family26
  };
}
function formatIndianRank(v){ const n=validRank(v); return n?n.toLocaleString('en-IN'):'—'; }
function reachShortText(reach){
  if(!reach) return 'Unknown';
  const route=reach.quotaLabel?`${reach.quotaLabel} · `:'';
  if(reach.state==='reached') return `${route}${reach.round||'R1'} reached · ${formatIndianRank(reach.margin)}-rank cushion`;
  if(reach.state==='missed-current') return `${route}${reach.round||'R1'} missed by ${formatIndianRank(reach.margin)} · next round pending`;
  if(reach.state==='historical-reach') return `${reach.round} · ${reach.chance} · ${formatIndianRank(reach.margin)}-rank cushion (2025)`;
  if(reach.state==='historical-out') return `Historical range missed by ${formatIndianRank(reach.margin)} (2025)`;
  return reach.label || 'Unknown';
}
function movementText(m){
  if(!m) return '';
  if(m.direction==='unchanged') return 'R1 unchanged vs 2025';
  return `R1 · ${formatIndianRank(m.magnitude)} AIR ${m.direction} vs 2025`;
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
  overlay.innerHTML=`<div class="candidate-profile-dialog candidate-profile-dialog-wide" role="dialog" aria-modal="true" aria-labelledby="candidate-profile-title">
    <div class="candidate-profile-head"><div><div class="candidate-profile-kicker">Personalise the site</div><h2 id="candidate-profile-title">Your counselling profile</h2></div><button class="candidate-profile-close" type="button" aria-label="Close">×</button></div>
    <p>Save AIR, category and the MCC quota streams you are actually eligible for. All India and Open Seat routes are always checked; special routes are never inferred merely from domicile.</p>
    <div class="candidate-profile-form">
      <label>NEET AIR<input id="candidate-profile-air" type="number" min="1" placeholder="e.g. 232"></label>
      <label>Category<select id="candidate-profile-category">${AIQ_CATEGORIES.map(c=>`<option value="${c}">${CATEGORY_LABELS[c]}</option>`).join('')}</select></label>
      <label>Domicile / home state<input id="candidate-profile-domicile" type="text" placeholder="e.g. Bihar"></label>
    </div>
    <div class="candidate-profile-universal"><strong>Always included:</strong> MCC All India + Open Seat Quota</div>
    <div class="candidate-profile-eligibility-title">Additional quota eligibility</div>
    <div class="candidate-profile-eligibility-grid">${CONDITIONAL_ELIGIBILITIES.map(x=>`<label class="candidate-eligibility-option"><input type="checkbox" data-eligibility-key="${x.key}"><span><strong>${x.label}</strong><small>${x.note}</small></span></label>`).join('')}</div>
    <div class="candidate-profile-actions"><button class="candidate-profile-reset" type="button">Clear profile</button><button class="candidate-profile-save" type="button">Save profile</button></div>
    <div class="candidate-profile-note">This controls which quota cutoffs are shown. It does not independently verify institutional conditions such as sex-specific seats, certificates, schooling requirements or counselling registration.</div>
  </div>`;
  document.body.appendChild(overlay);
  const airEl=overlay.querySelector('#candidate-profile-air'),catEl=overlay.querySelector('#candidate-profile-category'),domEl=overlay.querySelector('#candidate-profile-domicile');
  const eligEls=[...overlay.querySelectorAll('[data-eligibility-key]')];
  function refreshChip(){
    const p=getCandidateProfile(), extras=profileExtraEligibilityLabels(p);
    chip.innerHTML=p.air?`<span>AIR ${formatIndianRank(p.air)}</span><small>${CATEGORY_LABELS[p.category]}${extras.length?' · '+extras.slice(0,2).join('/')+(extras.length>2?` +${extras.length-2}`:''):' · AIQ/Open'} · Edit</small>`:`<span>Set your AIR</span><small>Rank + quota eligibility</small>`;
  }
  function open(){
    const p=getCandidateProfile(); airEl.value=p.air||'';catEl.value=p.category;domEl.value=p.domicile||'';
    eligEls.forEach(el=>{el.checked=!!p.eligibilities[el.dataset.eligibilityKey];});
    overlay.classList.add('open');airEl.focus();
  }
  function close(){overlay.classList.remove('open');}
  chip.addEventListener('click',open); overlay.querySelector('.candidate-profile-close').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  overlay.querySelector('.candidate-profile-save').addEventListener('click',()=>{
    const eligibilities={}; eligEls.forEach(el=>{eligibilities[el.dataset.eligibilityKey]=el.checked;});
    saveCandidateProfile({air:airEl.value,category:catEl.value,domicile:domEl.value,eligibilities});refreshChip();close();
  });
  overlay.querySelector('.candidate-profile-reset').addEventListener('click',()=>{clearCandidateProfile();refreshChip();close();});
  window.addEventListener('candidateprofilechange',refreshChip); refreshChip();
}

function initSharedUi(){ initTheme(); injectCandidateProfileUI(); }

document.addEventListener('DOMContentLoaded', initSharedUi);


// Canonical college master. College IDs are the shared key across every dataset.

/* ALL_COLLEGES moved to shared V8 data layer. */




/* Junior Culture / First 90 Days / timeline moved to shared-culture-v8.js. */

function meritJuniorCulture(collegeId){ return (typeof JUNIOR_CULTURE!=='undefined' && JUNIOR_CULTURE[String(collegeId)]) || (typeof JUNIOR_CULTURE!=='undefined' && JUNIOR_CULTURE[Number(collegeId)]) || null; }
function meritJuniorFirst90(collegeId){ return (typeof JUNIOR_FIRST90!=='undefined' && JUNIOR_FIRST90[String(collegeId)]) || (typeof JUNIOR_FIRST90!=='undefined' && JUNIOR_FIRST90[Number(collegeId)]) || null; }
function meritFreshersTimeline(collegeId){
  const id=String(collegeId);
  const base=(typeof FRESHERS_TIMELINE!=='undefined' && (FRESHERS_TIMELINE[id]||FRESHERS_TIMELINE[Number(id)])) || {phases:{}};
  if(typeof FRESHERS_TIMELINE_META==='undefined') return [];
  return FRESHERS_TIMELINE_META.phases.map(p=>({...p,...(base.phases?.[p.key]||{grade:'GAP',basis:'none',status:'unknown',summary:'No phase-specific evidence reconstructed for this period.',sources:[]})}));
}
function meritCultureEvidenceCount(collegeId){ return meritFreshersTimeline(collegeId).filter(x=>x.grade!=='GAP').length; }


'use strict';
const $c=s=>document.querySelector(s);
const escC=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const collegeMapC=()=>new Map(ALL_COLLEGES.map(c=>[String(c.id),c]));
function sourceKinds(p){return new Set((p.sources||[]).map(s=>s.kind));}
function hasArtifact(p){return /reported|public post|public images|artifact/i.test(p.artifactStatus||'') && !/^No public|^No informal|No senior-issued artifact verified/i.test(p.artifactStatus||'');}
function thinEvidence(p){const kinds=sourceKinds(p);return !kinds.has('student') || /very low|low for lived|lived experience.*low|under-documented/i.test(p.confidence||'');}
function first90(id){return typeof JUNIOR_FIRST90!=='undefined'?JUNIOR_FIRST90[id]:null;}
function hasFirst90(id){const d=first90(id);return !!d&&d.evidenceLevel!=='insufficient';}
function first90Class(level){return ['detailed','partial','official_only'].includes(level)?level:'insufficient';}
function covered(id,key){const d=first90(id);return !!d?.coverage?.[key];}
function first90Sources(d){return (d?.sources||[]).map(s=>`<div class="culture-source"><span class="source-kind ${escC(s.kind)}">${escC(s.kind)}</span><a href="${escC(s.url)}" target="_blank" rel="noopener">${escC(s.label)}</a></div>`).join('');}
function first90Panel(id){const d=first90(id);if(!d)return '';const level=first90Class(d.evidenceLevel);if(level==='insufficient')return `<details class="first90-details first90-insufficient"><summary><span>First 90 days</span><span class="first90-level ${level}">${escC(d.evidenceLabel)}</span></summary><p>${escC(d.firstWeeks)}</p></details>`;return `<details class="first90-details" open><summary><span>First 90 days</span><span class="first90-level ${level}">${escC(d.evidenceLabel)}</span></summary><div class="first90-grid"><div><strong>First weeks</strong><p>${escC(d.firstWeeks)}</p></div><div><strong>Hosteller vs day scholar</strong><p>${escC(d.hostellerVsDayScholar)}</p></div><div><strong>Boys / girls</strong><p>${escC(d.genderDifferences)}</p></div><div><strong>If students opt out</strong><p>${escC(d.optOut)}</p></div><div><strong>After freshers / later first year</strong><p>${escC(d.afterFreshers)}</p></div></div><p class="first90-note">${escC(d.sourceNote)}</p>${(d.sources||[]).length?`<div class="culture-sources first90-source-list">${first90Sources(d)}</div>`:''}</details>`;}
function timelinePhases(id){return typeof freshersTimelineFor==='function'?freshersTimelineFor(id):[];}
function timelineEvidenceCount(id){return timelinePhases(id).filter(x=>x.grade!=='GAP').length;}
function timelinePanel(id){const phases=timelinePhases(id);if(!phases.length)return '';const supported=phases.filter(x=>x.grade!=='GAP').length;return `<details class="freshers-timeline-details"><summary><span>Freshers experience timeline</span><span class="timeline-count">${supported}/6 phases evidenced</span></summary><div class="freshers-timeline">${phases.map(x=>`<div class="timeline-phase ${x.grade==='GAP'?'unknown':''}"><div class="timeline-rail"><span class="timeline-dot ${escC(x.status)}"></span></div><div class="timeline-content"><div class="timeline-phase-top"><strong>${escC(x.label)}</strong><span class="timeline-grade grade-${escC(x.grade)}">${escC(x.grade)}</span></div><p>${escC(x.summary)}</p>${x.grade!=='GAP'?`<span class="timeline-basis">Basis: ${escC(x.basis)}</span>${(x.sources||[]).length?`<div class="timeline-sources">${x.sources.map(s=>`<a href="${escC(s.url)}" target="_blank" rel="noopener">${escC(s.label||'Source')}</a>`).join('')}</div>`:''}`:''}</div></div>`).join('')}</div><p class="timeline-rule">Timing is shown only where a source or reviewed structured field supports that phase; blanks are evidence gaps, not a claim of no hierarchy.</p></details>`;}
function signalPanelC(p){const s=p?.signal;if(!s)return '';const rows=[['Hostel / residence',s.hostelRisk],['Grooming / dress',s.grooming],['Social coercion',s.socialCoercion],['Physical-safety evidence',s.physicalSafety],['Administrative enforcement',s.enforcement],['Evidence mix',s.evidenceMix]].filter(([v])=>v);return `<div class="culture-signal-panel tone-${escC(s.tone||'insufficient')}"><div class="culture-signal-head"><div><span class="culture-signal-kicker">Evidence-graded current signal</span><strong>${escC(s.label||'Signal reconstructed')}</strong></div><div class="culture-signal-meta"><span>${escC(s.confidence||'Confidence not graded')}</span><span>${escC(s.window||'Window not recorded')}</span></div></div><div class="culture-signal-grid">${rows.map(([k,v])=>`<div><span>${escC(k)}</span><p>${escC(v)}</p></div>`).join('')}</div><p class="culture-signal-rule">This is an evidence signal, not a ragging or safety score. Complaint-register entries record complaints and classifications; they do not by themselves prove the allegation.</p></div>`;}
function cardC(id,p,c){const incidents=p.incidents||[];const artifacts=hasArtifact(p);const f=first90(id),density=evidenceDensity(id,p);return `<article class="culture-card">
<div class="culture-card-head"><h3><a href="college.html?id=${id}">${escC(c?.name||`College ${id}`)}</a></h3><div class="culture-loc">${escC(c?.city||'')} · ${escC(c?.state||'')}</div><div class="culture-badges">${artifacts?'<span class="signal artifact">Rulebook / rule-set signal</span>':''}${incidents.length?`<span class="signal incident">${incidents.length} dated incident${incidents.length===1?'':'s'}</span>`:''}${hasFirst90(id)?`<span class="signal first90-signal">First-90 evidence: ${escC(f.evidenceLevel.replace('_',' '))}</span>`:''}${conflictProfile(p)?'<span class="signal conflict">Conflicting accounts</span>':''}${thinEvidence(p)?'<span class="signal">Lived evidence thin</span>':''}<span class="evidence-density">${density.sources} sources · ${density.timeline}/6 phases</span></div></div>
<div class="culture-card-body"><p class="culture-picture">${escC(p.currentPicture)}</p>
${signalPanelC(p)}
${first90Panel(id)}
${timelinePanel(id)}
<div class="culture-section artifact-box"><strong>${escC(p.artifactStatus||p.rulebookStatus)}</strong><p>${escC(p.artifactNote||p.rulebookSummary)}</p>${(p.artifactClaims||[]).length?`<ul class="artifact-claims">${p.artifactClaims.map(x=>`<li>${escC(x)}</li>`).join('')}</ul>`:''}</div>
<div class="culture-section"><h4>Informal rulebook / ground rules</h4><p><strong>${escC(p.rulebookStatus)}</strong> · ${escC(p.groundRules)}</p></div>
<div class="culture-section"><h4>Intro + senior-junior dynamic</h4><p>${escC(p.introCulture)} ${escC(p.seniorJunior)}</p></div>
<div class="culture-section"><h4>Appearance / movement</h4><p>${escC(p.dressAppearance)} ${escC(p.movementCommonAreas)}</p></div>
${incidents.length?`<div class="culture-section"><h4>Dated incidents / proceedings</h4><ul class="incident-list">${incidents.map(x=>`<li><strong>${escC(x.year)} · ${escC(x.label)}</strong><br>${escC(x.detail)}</li>`).join('')}</ul></div>`:''}
<div class="culture-section"><h4>Official response + positives</h4><p>${escC(p.officialResponse)} ${escC(p.positives)}</p></div>
<div class="culture-section"><h4>Trend / what remains unknown</h4><p><strong>Trend:</strong> ${escC(p.trend)}<br><strong>Unknown:</strong> ${escC(p.unknowns)}</p></div>
<div class="culture-section"><h4>Sources</h4><div class="culture-sources">${(p.sources||[]).map(s=>`<div class="culture-source"><span class="source-kind ${escC(s.kind)}">${escC(s.kind)}</span><a href="${escC(s.url)}" target="_blank" rel="noopener">${escC(s.label)}</a></div>`).join('')}</div></div></div>
<div class="culture-foot"><span class="confidence">${escC(p.confidence)}</span><span>Verified ${escC(p.lastVerified)}</span></div></article>`;}
function statsC(rows){const artifact=rows.filter(([p])=>hasArtifact(p)).length,incident=rows.filter(([p])=>(p.incidents||[]).length).length,first=rows.filter(([id])=>hasFirst90(id)).length,residence=rows.filter(([id])=>covered(id,'residenceMode')).length,optout=rows.filter(([id])=>covered(id,'optOut')).length,phases=rows.reduce((n,[id])=>n+timelineEvidenceCount(id),0);return [[rows.length,'culture profiles'],[first,'with first-90 evidence'],[phases,'phase-specific timeline cells'],[residence,'with residence-mode evidence'],[optout,'with opt-out evidence'],[artifact,'rulebook / rule-set signals'],[incident,'profiles with dated incidents']].map(([n,l])=>`<div class="culture-stat"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');}
function artifactSource(p){const student=(p.sources||[]).filter(s=>s.kind==='student');return student.find(s=>/rule|booklet|interaction|senior/i.test(s.label||''))||student[0]||null;}
function renderArtifactLedger(rows,map){const items=rows.filter(([p])=>hasArtifact(p)).map(([id,p])=>{const c=map.get(id),src=artifactSource(p);return `<article class="artifact-ledger-card"><div class="artifact-ledger-top"><span class="source-kind student">Public artifact</span><span>${escC(p.lastVerified||'')}</span></div><h4><a href="college.html?id=${id}">${escC(c?.name||`College ${id}`)}</a></h4><p class="artifact-ledger-status">${escC(p.artifactStatus)}</p>${(p.artifactClaims||[]).length?`<ul>${p.artifactClaims.slice(0,5).map(x=>`<li>${escC(x)}</li>`).join('')}</ul>`:''}<p class="artifact-ledger-note">${escC(p.artifactNote||'')}</p>${src?`<a class="artifact-ledger-link" href="${escC(src.url)}" target="_blank" rel="noopener">Open the public source →</a>`:''}</article>`;}).join('');const el=$c('#artifact-ledger-grid');if(el)el.innerHTML=items||'<div class="empty-culture">No public rulebook-like artifacts are currently indexed.</div>';}
function matchFilter(id,p,f){const k=sourceKinds(p),d=first90(id);if(f==='artifact')return hasArtifact(p);if(f==='incident')return !!(p.incidents||[]).length;if(f==='student')return k.has('student');if(f==='official')return k.has('official');if(f==='conflict')return conflictProfile(p);if(f==='signal-concern')return ['concern','watch'].includes(p.signal?.tone);if(f==='signal-mixed')return p.signal?.tone==='mixed';if(f==='signal-insufficient')return p.signal?.tone==='insufficient';if(f==='thin')return thinEvidence(p);if(f==='timeline')return timelineEvidenceCount(id)>0;if(f==='first90')return hasFirst90(id);if(f==='first90-detailed')return d?.evidenceLevel==='detailed';if(f==='residence')return covered(id,'residenceMode');if(f==='gender')return covered(id,'genderSpecific');if(f==='optout')return covered(id,'optOut');return true;}

function conflictProfile(p){return /conflict|contradict|mixed|vary by|variation/i.test(`${p.currentPicture||''} ${p.trend||''} ${p.confidence||''}`);}
function evidenceDensity(id,p){const kinds=sourceKinds(p),tl=timelineEvidenceCount(id),f=first90(id);return {sources:(p.sources||[]).length,kinds:kinds.size,timeline:tl,first90:!!f};}
function renderBatchWatch(rows,map){
  const candidates=rows.map(([id,p])=>{const src26=(p.sources||[]).filter(x=>Number(x.year)===2026);const artifact26=src26.some(x=>/rule|booklet|artifact|interaction/i.test(x.label||''))&&hasArtifact(p);const student26=src26.some(x=>x.kind==='student');const official26=src26.some(x=>x.kind==='official');return {id,p,c:map.get(id),src26,artifact26,student26,official26,score:(artifact26?4:0)+(student26?3:0)+(official26?1:0)+timelineEvidenceCount(id)};}).filter(x=>x.src26.length).sort((a,b)=>b.score-a.score||(a.c?.name||'').localeCompare(b.c?.name||'')).slice(0,12);
  const el=$c('#batch-watch-grid');if(!el)return;el.innerHTML=candidates.length?candidates.map(x=>{const tags=[x.student26?'<span class="batch-watch-tag live">2026 student evidence</span>':'',x.artifact26?'<span class="batch-watch-tag artifact">2026 artifact signal</span>':'',x.official26?'<span class="batch-watch-tag">2026 official evidence</span>':'',timelineEvidenceCount(x.id)?`<span class="batch-watch-tag">${timelineEvidenceCount(x.id)}/6 timeline</span>`:''].filter(Boolean).join('');return `<article class="batch-watch-card"><h4><a href="college.html?id=${x.id}">${escC(x.c?.name||`College ${x.id}`)}</a></h4><div class="batch-watch-tags">${tags}</div><p>${escC(String(x.p.currentPicture||x.p.trend||'Current-year evidence indexed.').slice(0,260))}</p></article>`;}).join(''):'<div class="empty-culture">No 2026-specific evidence is indexed yet.</div>';
}
function renderC(){const map=collegeMapC();let rows=Object.entries(JUNIOR_CULTURE);const q=$c('#culture-search').value.trim().toLowerCase(),f=$c('#culture-filter').value,st=$c('#culture-state').value;rows=rows.filter(([id,p])=>{const c=map.get(id);const hay=`${c?.name||''} ${c?.city||''} ${c?.state||''}`.toLowerCase();if(q&&!hay.includes(q))return false;if(st!=='all'&&c?.state!==st)return false;return matchFilter(id,p,f);}).sort((a,b)=>(map.get(a[0])?.name||'').localeCompare(map.get(b[0])?.name||''));$c('#culture-count').textContent=`Showing ${rows.length} of ${Object.keys(JUNIOR_CULTURE).length} researched profiles`;$c('#culture-grid').innerHTML=rows.length?rows.map(([id,p])=>cardC(id,p,map.get(id))).join(''):'<div class="empty-culture">No profiles match these filters.</div>';}
document.addEventListener('DOMContentLoaded',()=>{initTheme();const map=collegeMapC(),rows=Object.entries(JUNIOR_CULTURE);$c('#culture-overview').innerHTML=statsC(rows);renderBatchWatch(rows,map);renderArtifactLedger(rows,map);const states=[...new Set(rows.map(([id])=>map.get(id)?.state).filter(Boolean))].sort();$c('#culture-state').innerHTML='<option value="all">All states</option>'+states.map(x=>`<option>${escC(x)}</option>`).join('');['culture-search','culture-filter','culture-state'].forEach(id=>$c('#'+id).addEventListener(id==='culture-search'?'input':'change',renderC));renderC();});
