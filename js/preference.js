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



// Official MCC 2025 AIQ/Open Seat category-wise round cutoffs.

/* CUTOFFS moved to shared V8 data layer. */



// 2026 MCC AIQ/Open-seat cutoff dataset. Generated by scripts/import-mcc-result.py.
// Do not hand-edit cutoff ranks; re-run the importer and inspect audit outputs instead.
const AIQ_2026_META = {"year":2026,"rounds":{"R1":{"published":true,"imported":true,"status":"provisional","published_at":"2026-08-20","imported_at":"2026-08-21","discrepancy_deadline":"2026-08-21 15:59 IST","source_title":"MCC NEET UG 2026 Provisional Round 1 Allotment Result","source_url":"https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2026/08/202608202078593834.pdf","profiles_imported":451,"note":"Audited import complete: 451 canonical college profiles. 1 MCC institute label(s) remain outside the canonical government-college master and are retained in the audit log. PwD-specific allotted categories are excluded from ordinary category cutoffs."}}};

/* AIQ_CUTOFFS_2026 moved to shared V8 data layer. */



// MCC NEET UG 2026 MBBS cutoffs, separated by exact quota stream and round.
// Generated by scripts/import-mcc-quota-streams.py; never merge quota streams when interpreting eligibility.
const MCC_QUOTA_2026_META = {"year":2026,"latest_round":"R1","status":"provisional","source_title":"MCC NEET UG 2026 Provisional Round 1 Allotment Result","source_url":"https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2026/08/202608202078593834.pdf","rounds":{"R1":{"published":true,"imported":true,"status":"provisional","published_at":"2026-08-20","imported_at":"2026-08-21","source_title":"MCC NEET UG 2026 Provisional Round 1 Allotment Result","source_url":"https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2026/08/202608202078593834.pdf","matched_site_mbbs_rows":13493,"stream_count":11}},"parsed_allotment_rows":29945,"matched_site_colleges":451,"note":"Quota streams are stored separately. No cutoff is merged across AI, Open Seat, DU, IPU, ESI or other conditional streams. Ordinary-category cutoffs use the exact allotted category; PwD-specific categories are excluded from ordinary cutoffs."};

/* MCC_QUOTA_STREAMS moved to shared V8 data layer. */


/* MCC_CUTOFFS_2026_BY_QUOTA moved to shared V8 data layer. */



'use strict';

const COLLEGE_BY_ID = Object.fromEntries(ALL_COLLEGES.map(c => [Number(c.id), c]));
const SHORTLIST_KEY = 'shortlist';
const ORDER_KEY = 'preference_order';
const COMPARE_STORAGE_KEY = 'merit-register-compare-colleges';
let shortlist = [];
let order = [];

function readIds(key){
  try{
    const raw = JSON.parse(localStorage.getItem(key) || '[]');
    return [...new Set((Array.isArray(raw) ? raw : []).map(Number).filter(id => COLLEGE_BY_ID[id]))];
  }catch(e){ return []; }
}
function saveIds(key, ids){
  try{ localStorage.setItem(key, JSON.stringify(ids)); }catch(e){}
}
function loadState(){
  shortlist = readIds(SHORTLIST_KEY);
  order = readIds(ORDER_KEY);
  syncOrderWithShortlist();
  saveIds(ORDER_KEY, order);
}
function syncOrderWithShortlist(){
  const shortSet = new Set(shortlist);
  order = order.filter(id => shortSet.has(id));
  shortlist.forEach(id => { if(!order.includes(id)) order.push(id); });
}
function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function formatCollegeName(name){ return String(name || '').replace(/^All India Institute of Medical Sciences/i, 'AIIMS'); }
function showToast(msg){
  const toast = document.getElementById('copy-toast');
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}
function renderCandidateSummary(){
  const el=document.getElementById('candidate-pref-summary'); if(!el)return;
  const p=getCandidateProfile();
  if(!p.air){
    el.innerHTML='<div class="pref-candidate-card"><div><strong>Personalise this list</strong><span>Set your AIR and AIQ category in the header to see reach and rank margins beside every choice.</span></div><button type="button" id="pref-set-profile">Set AIR →</button></div>';
    const b=document.getElementById('pref-set-profile');if(b)b.onclick=()=>document.getElementById('candidate-profile-chip')?.click();
    return;
  }
  const loaded=hasQuotaStreamData();
  const extras=profileExtraEligibilityLabels(p);
  el.innerHTML=`<div class="pref-candidate-card is-set"><div><strong>AIR ${formatIndianRank(p.air)} · ${escapeHtml(CATEGORY_LABELS[p.category])}</strong><span>${loaded?`2026 R1 quota-aware: AIQ/Open${extras.length?' + '+escapeHtml(extras.join(', ')):''}. Later rounds remain pending.`:'2026 quota-stream data is not loaded on this page.'}</span></div><button type="button" id="pref-set-profile">Edit →</button></div>`;
  document.getElementById('pref-set-profile').onclick=()=>document.getElementById('candidate-profile-chip')?.click();
}
function r1For(id,year,category){const r=categoryRoundsFromRecord(recordForYear(id,year),category);return validRank(r&&r.R1);}
function renderPreferenceInsights(){
  const el=document.getElementById('pref-insights');if(!el)return;
  const p=getCandidateProfile();
  if(!p.air||!order.length){el.hidden=true;el.innerHTML='';return;}
  const reaches=order.map(id=>{const c=COLLEGE_BY_ID[id],route=bestQuotaRoute(id,p.air,p.category,p),band=choicePlanningBand(route);return {id,c,route,band,reach:getCollegeReach(id,p.air,p.category,p)};});
  const notes=[];
  const unknown=reaches.filter(x=>!x.route);
  if(unknown.length) notes.push({kind:'info',title:'Evidence / eligibility gaps',text:`${unknown.length} choice${unknown.length===1?' has':'s have'} no category-specific 2026 R1 cutoff in any quota stream currently enabled in your profile. Unknown is not treated as weak or ineligible.`});
  const last=reaches[reaches.length-1];
  if(last && (!last.route || ['Dream','Competitive'].includes(last.band.label))) notes.push({kind:'warn',title:'Safety gap',text:`Your last choice, ${formatCollegeName(last.c.name)}, is not a clear current R1 safety anchor for AIR ${formatIndianRank(p.air)} under the quota routes you enabled. That may be intentional, but review how far down your real choice list should extend.`});
  else if(last && last.band.label==='Likely') notes.push({kind:'info',title:'Moderate final cushion',text:`Your final choice is currently in the Likely planning band rather than Safety. This is still based only on provisional R1 distance, not a prediction of later-round allotment.`});
  let inversion=null;
  for(let i=0;i<order.length-1&&!inversion;i++){
    const a=COLLEGE_BY_ID[order[i]],b=COLLEGE_BY_ID[order[i+1]];const ar=r1For(a.id,2025,p.category),br=r1For(b.id,2025,p.category);
    if(ar&&br&&br<ar*.72) inversion={a,b,ar,br};
  }
  if(inversion) notes.push({kind:'info',title:'Demand-order check',text:`${formatCollegeName(inversion.b.name)} had substantially stronger 2025 AIQ/Open R1 demand than ${formatCollegeName(inversion.a.name)} but is placed below it. Keep the order if that reflects your actual preference—choice order should follow preference, not cutoff rank.`});
  const bandCounts=reaches.reduce((a,x)=>{a[x.band.label]=(a[x.band.label]||0)+1;return a;},{});
  notes.push({kind:'ok',title:'Current R1 mix',text:`Safety ${bandCounts.Safety||0} · Likely ${bandCounts.Likely||0} · Competitive ${bandCounts.Competitive||0} · Dream ${bandCounts.Dream||0}. These are planning bands based on distance from 2026 R1 cutoffs, not forecasts of unpublished rounds.`});
  el.hidden=false;el.innerHTML=`<div class="pref-insights-title">Choice-list checks</div>${notes.map(n=>`<div class="pref-insight ${n.kind}"><strong>${escapeHtml(n.title)}</strong><span>${escapeHtml(n.text)}</span></div>`).join('')}`;
}

function renderList(){
  renderCandidateSummary();
  const listEl = document.getElementById('pref-list');
  const emptyEl = document.getElementById('empty-state');
  const countEl = document.getElementById('pref-count-num');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');
  const compareBtn = document.getElementById('compare-top-btn');
  countEl.textContent = order.length;
  copyBtn.disabled = order.length === 0;
  clearBtn.disabled = order.length === 0;
  compareBtn.disabled = order.length < 2;
  compareBtn.textContent = order.length > 4 ? 'Compare top 4' : 'Compare top choices';

  if(order.length === 0){
    listEl.style.display = 'none';
    emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    renderPreferenceInsights();
    return;
  }
  listEl.style.display = 'flex';
  emptyEl.style.display = 'none';
  listEl.innerHTML = order.map((id, i) => {
    const c = COLLEGE_BY_ID[id];
    if(!c) return '';
    return `<li class="pref-row" data-id="${id}" draggable="true">
      <div class="drag-handle" title="Drag to reorder" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="4" cy="2.5" r="1.35"></circle><circle cx="10" cy="2.5" r="1.35"></circle><circle cx="4" cy="7" r="1.35"></circle><circle cx="10" cy="7" r="1.35"></circle><circle cx="4" cy="11.5" r="1.35"></circle><circle cx="10" cy="11.5" r="1.35"></circle></svg>
      </div>
      <div class="pref-rank">${i+1}</div>
      <div class="pref-info">
        <p class="name"><a class="profile-inline-link" href="college.html?id=${id}" draggable="false">${escapeHtml(formatCollegeName(c.name))}</a></p>
        <div class="pref-meta"><span class="type-badge ${escapeHtml(c.type)}">${escapeHtml(c.type)}</span><span class="loc">${escapeHtml(c.city)}, ${escapeHtml(c.state)}</span><span>&middot; ${(c.seats_2026 || c.seats || '—')} seats</span></div>
        ${(()=>{const p=getCandidateProfile();if(!p.air)return '';const r=getCollegeReach(id,p.air,p.category,p);const route=bestQuotaRoute(id,p.air,p.category,p);const band=choicePlanningBand(route);const mv=getRoundMovement(id,p.category,'R1');return `<div class="pref-reach"><span class="choice-band ${escapeHtml(band.className)}">${escapeHtml(band.label)}</span><span class="reach-badge ${escapeHtml(r.state)}">${escapeHtml(reachShortText(r))}</span>${mv?`<span class="pref-movement">${escapeHtml(movementText(mv))}</span>`:''}</div>`;})()}
      </div>
      <div class="pref-controls">
        <button class="icon-btn up" type="button" aria-label="Move ${escapeHtml(formatCollegeName(c.name))} up" draggable="false" ${i===0?'disabled':''}>&uarr;</button>
        <button class="icon-btn down" type="button" aria-label="Move ${escapeHtml(formatCollegeName(c.name))} down" draggable="false" ${i===order.length-1?'disabled':''}>&darr;</button>
        <button class="icon-btn remove" type="button" aria-label="Remove ${escapeHtml(formatCollegeName(c.name))} from list" draggable="false">&times;</button>
      </div>
    </li>`;
  }).join('');
  renderPreferenceInsights();
}
function saveOrder(){ saveIds(ORDER_KEY, order); }
function saveShortlist(){ saveIds(SHORTLIST_KEY, shortlist); }
function moveItem(id, dir){
  const idx = order.indexOf(id), swap = idx + dir;
  if(idx < 0 || swap < 0 || swap >= order.length) return;
  [order[idx], order[swap]] = [order[swap], order[idx]];
  saveOrder(); renderList();
}
function removeItem(id){
  order = order.filter(x => x !== id);
  shortlist = shortlist.filter(x => x !== id);
  saveOrder(); saveShortlist(); renderList();
}
function getDragAfterElement(container, y){
  const rows = [...container.querySelectorAll('.pref-row:not(.dragging)')];
  return rows.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    return (offset < 0 && offset > closest.offset) ? {offset, element:child} : closest;
  }, {offset:-Infinity, element:null}).element;
}
function compareTopChoices(){
  const ids = order.slice(0,4);
  if(ids.length < 2) return;
  saveIds(COMPARE_STORAGE_KEY, ids);
  const p = new URLSearchParams();
  p.set('c', ids.join(','));
  p.set('cat', getCandidateProfile().category || 'General');
  location.href = 'compare.html?' + p.toString();
}

function bindEvents(){
  const list = document.getElementById('pref-list');
  list.addEventListener('click', e => {
    const row = e.target.closest('.pref-row'); if(!row) return;
    const id = Number(row.dataset.id);
    if(e.target.closest('.up')) moveItem(id,-1);
    else if(e.target.closest('.down')) moveItem(id,1);
    else if(e.target.closest('.remove')) removeItem(id);
  });
  list.addEventListener('dragstart', e => {
    const row = e.target.closest('.pref-row');
    if(!row){ e.preventDefault(); return; }
    row.classList.add('dragging'); e.dataTransfer.effectAllowed='move';
    try{ e.dataTransfer.setData('text/plain', row.dataset.id); }catch(err){}
  });
  list.addEventListener('dragover', e => {
    const dragging = list.querySelector('.pref-row.dragging'); if(!dragging) return;
    e.preventDefault(); e.dataTransfer.dropEffect='move';
    const after = getDragAfterElement(list, e.clientY);
    if(after == null) list.appendChild(dragging); else if(after !== dragging) list.insertBefore(dragging, after);
  });
  list.addEventListener('drop', e => e.preventDefault());
  list.addEventListener('dragend', () => {
    const dragging = list.querySelector('.pref-row.dragging'); if(dragging) dragging.classList.remove('dragging');
    order = [...list.querySelectorAll('.pref-row')].map(li => Number(li.dataset.id));
    saveOrder(); renderList();
  });
  document.getElementById('clear-btn').addEventListener('click', () => {
    if(!order.length) return;
    if(!confirm('Remove all colleges from your preference list? This also un-stars them in the Directory.')) return;
    const removed = new Set(order);
    shortlist = shortlist.filter(id => !removed.has(id)); order = [];
    saveOrder(); saveShortlist(); renderList();
  });
  document.getElementById('copy-btn').addEventListener('click', async () => {
    const text = order.map((id,i) => { const c=COLLEGE_BY_ID[id]; return c ? `${i+1}. ${formatCollegeName(c.name)} — ${c.city}, ${c.state}` : ''; }).filter(Boolean).join('\n');
    try{ await navigator.clipboard.writeText(text); showToast('Copied to clipboard'); }
    catch(e){
      try{ const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast('Copied to clipboard'); }
      catch(err){ showToast('Could not copy'); }
    }
  });
  document.getElementById('compare-top-btn').addEventListener('click', compareTopChoices);
  window.addEventListener('candidateprofilechange',()=>renderList());
  window.addEventListener('storage', e => {
    if(e.key === SHORTLIST_KEY || e.key === ORDER_KEY){ loadState(); renderList(); }
  });
}

document.addEventListener('DOMContentLoaded', () => { initTheme(); loadState(); bindEvents(); renderList(); });
