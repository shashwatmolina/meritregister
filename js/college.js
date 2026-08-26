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



// Reconstructed MCC Round-1 median AIR demand series.
const BIHAR_GMC_R1_MEDIAN_TRENDS = {
  39: {2022:9989,   2023:10593,   2024:11157,   2025:11143},
  40: {2022:8133.5, 2023:8177,    2024:7954,    2025:9511.5},
  41: {2022:7556,   2023:7959,    2024:8261,    2025:8288},
  43: {2022:10382,  2023:13376,   2024:13226,   2025:13700},
  44: {             2023:14892,   2024:14476,   2025:15406},
  45: {2022:4501,   2023:4875,    2024:4860.5,  2025:5046},
  46: {2022:12645,  2023:13233,   2024:14001,   2025:14664.5},
  47: {2022:9030.5, 2023:9240.5,  2024:9294,    2025:9915},
  48: {2022:5905,   2023:6317,    2024:6616,    2025:6316},
  49: {2022:3490.5, 2023:4484,    2024:4478,    2025:4163.5},
  50: {2022:9281,   2023:10418,   2024:9918,    2025:10681}
};

const AIIMS_R1_MEDIAN_TRENDS = {
  3:   {2022:2713,   2023:2363,   2024:2257,   2025:2139},
  22:  {2022:4648,   2023:4543,   2024:3939,   2025:3798},
  38:  {2022:1874.5, 2023:1799,   2024:1687.5, 2025:1834},
  52:  {2022:1795,   2023:1761,   2024:1409,   2025:1651},
  64:  {2022:112.5,  2023:119,    2024:91,     2025:87},
  74:  {2022:2979,   2023:2935,   2024:2242,   2025:2453.5},
  106: {2022:3476,   2023:3457.5, 2024:2815.5, 2025:2711.5},
  113: {2022:4976,   2023:4456.5, 2024:4152,   2025:3709},
  124: {2022:4500,   2023:4014.5, 2024:3521.5, 2025:3530.5},
  168: {2022:824,    2023:899,    2024:714,    2025:814},
  189: {2022:1722,   2023:1765,   2024:1343,   2025:1186.5},
  239: {2022:1024.5, 2023:698,    2024:1052,   2025:978},
  256: {2022:2225,   2023:2417,   2024:2175,   2025:2112.5},
  262: {2022:721.5,  2023:735.5,  2024:500,    2025:540},
  295: {2022:5585,   2023:4996,   2024:4932.5, 2025:3989},
  334: {2022:3569,   2023:3386.5, 2024:2859,   2025:2538.5},
  372: {2022:1346,   2023:1252.5, 2024:899,    2025:921},
  378: {2022:2887,   2023:2532,   2024:2350,   2025:2351.5},
  379: {2022:3340,   2023:3143,   2024:2969.5, 2025:3002},
  429: {2022:3532.5, 2023:2917,   2024:2647,   2025:2810}
};


// Structured hostel intelligence. Unknown values stay null.
/* emptyHostelRecord moved to shared V8 intelligence layer. */



/* HOSTELS moved to shared V8 data layer. */



// Clinical exposure research profiles.

/* CLINICAL_EXPOSURE moved to shared V8 data layer. */



// Academics and teaching research profiles.

/* ACADEMICS_TEACHING moved to shared V8 data layer. */



// Research and international-pathway research profiles.

/* RESEARCH_USMLE moved to shared V8 data layer. */



// Campus and student-life research profiles.

/* CAMPUS_STUDENT_LIFE moved to shared V8 data layer. */



// Fees, bond and stipend research profiles.

/* FEES_BOND_STIPEND moved to shared V8 data layer. */



// V7 systematic deep-profile refresh layer.
// This file does two things:
// 1) patches the existing dimension datasets with newer / more precise evidence;
// 2) provides a decision-oriented dossier without turning qualitative evidence into a fake score.
// Service-bond information is intentionally excluded from this decision layer.

const PROFILE_INTELLIGENCE_V7_META = {
  version: '7.0',
  updated: '26 Aug 2026',
  methodology: 'Official institutional sources first; dated student evidence is labelled separately; unresolved fields remain unresolved.',
  first_batch_ids: [64,72,69,65,71,262,255,402,49,45]
};

function v7Patch(target,id,patch){
  if(target && target[id]) Object.assign(target[id], patch);
}
function v7AppendSources(target,id,newSources){
  if(!target || !target[id]) return;
  const old=Array.isArray(target[id].sources)?target[id].sources:[];
  const norm=x=>typeof x==='string'?x:(x&&x.url)||'';
  const seen=new Set(old.map(norm).filter(Boolean));
  for(const s of (newSources||[])){
    const u=norm(s); if(u && !seen.has(u)){old.push(s);seen.add(u);}
  }
  target[id].sources=old;
}

// ---- AIIMS New Delhi -------------------------------------------------------
v7Patch(ACADEMICS_TEACHING,64,{
  learningEnvironment:'Highly self-driven but supported by a large institutional teaching ecosystem. AIIMS publishes current annual reports and maintains extensive clinical/simulation infrastructure; the lived academic experience still varies sharply by department and phase.',
  confidence:'High for curriculum/library/institutional structure; Medium for lived teaching culture because it varies by department and phase.'
});
v7Patch(FEES_BOND_STIPEND,64,{
  hostelFee:'₹2,728 total hostel charges over 5.5 years for MBBS (official hostel FAQ, updated Nov 2025)',
  currentness:'Hostel eligibility and fee schedule verified from official material current to late 2025; a single consolidated 2026 academic-fee total and current MBBS-intern stipend are still unresolved.'
});
v7Patch(HOSTELS,64,{
  guaranteed:'All MBBS undergraduates are eligible to apply; eligibility does not guarantee immediate allotment when accommodation is short.',
  annualFee:'₹2,728 total hostel charges over 5.5 years for MBBS (official schedule)',
  lastVerified:'2026-08-22',
  confidence:'High for official eligibility, fee schedule, rules and basic furniture; Medium for year-wise room progression because it is block- and vacancy-dependent.'
});
v7AppendSources(CLINICAL_EXPOSURE,64,[{label:'AIIMS 69th Annual Report 2024-25 archive',url:'https://aiims.edu/index.php/en/about-us/annual-reports'}]);
v7AppendSources(HOSTELS,64,['https://www.aiims.edu/index.php/en/hostel_accomodation_faqs']);

// ---- VMMC / Safdarjung ----------------------------------------------------
v7Patch(ACADEMICS_TEACHING,72,{
  internalAssessment:'Current MBBS notice-board records show formal internal-assessment and attendance reporting for the 2025 first-professional batch in Anatomy, Biochemistry and Physiology (June 2026).',
  studentReported:'Official institutional material also documents an active mentorship programme for new MBBS admissions, used for early identification and support of students with mental-health concerns.',
  confidence:'High for current assessment/attendance and formal mentorship structure; Medium for department-to-department lived teaching intensity.'
});
v7AppendSources(ACADEMICS_TEACHING,72,[
  {label:'VMMC MBBS notice board — assessment & attendance 2026',url:'https://vmmc-sjh.mohfw.gov.in/mbbs-notice-board'},
  {label:'VMMC Principal message — UG induction & mentorship',url:'https://vmmc-sjh.mohfw.gov.in/principals-message'}
]);
v7Patch(HOSTELS,72,{
  guaranteed:'Not guaranteed. The 2025-26 official hostel-allotment instructions give priority to AIQ students residing outside Delhi; other eligible streams are subject to availability.',
  lastVerified:'2026-08-22'
});
v7AppendSources(HOSTELS,72,['https://vmmc-sjh.mohfw.gov.in/notice-dated-10092025-instructions-hostel-allotment-mbbs-batch-2025-26']);

// ---- MAMC -----------------------------------------------------------------
v7Patch(ACADEMICS_TEACHING,69,{
  learningEnvironment:'Large traditional government-college academic ecosystem with structured professional phases, internal assessment and very high-volume clinical attachments; current college notices show active curriculum administration, orientation and white-coat/foundation activities.',
  studentReported:'The public 2025-26 notice stream confirms current orientation, hostel allotment and student-facing academic administration; a current institution-wide student-satisfaction measure is not available.',
  confidence:'High for current institutional/academic administration; Medium for lived teaching culture and department-level variation.'
});
v7AppendSources(ACADEMICS_TEACHING,69,[{label:'MAMC current circulars/notices',url:'https://mamc.delhi.gov.in/circular-notices/473'}]);
v7AppendSources(CAMPUS_STUDENT_LIFE,69,[{label:'MAMC current circulars — orientation, safety, hostels',url:'https://mamc.delhi.gov.in/circular-notices/473'}]);

// ---- ABVIMS / Dr RML Hospital --------------------------------------------
v7Patch(HOSTELS,65,{
  hostelBlocks:'Dhanwantri Chhatrawas — 20-storey, three-wing hostel (Ganga, Yamuna, Saraswati), with separate accommodation arrangements for boys and girls.',
  elevators:'Six elevators (official hostel page)',
  powerBackup:true,
  drinkingWater:'Water coolers with purifiers on every floor',
  bathroom:'Centrally air-conditioned rooms with attached washrooms are described on the official hostel page.',
  furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:null},
  securityGuards:true,
  cctv:true,
  controlledEntry:true,
  messDetails:'Two hostel messes on the ground floor; departmental canteen and additional food stalls are also listed by the institute.',
  roomCondition:'Modern high-rise hostel stock with centrally air-conditioned rooms and attached washrooms according to the official institutional page.',
  lastVerified:'2026-08-22',
  confidence:'High for building, lift, security, room, washroom and mess facts from the official hostel page; room-allotment priority still depends on hostel rules.'
});
v7AppendSources(HOSTELS,65,['https://rmlh.nic.in/printmain.aspx?langid=1&lev=3&lid=3567&lsid=2576']);

// ---- UCMS / GTB -----------------------------------------------------------
v7Patch(CLINICAL_EXPOSURE,71,{
  teaching:'UCMS is directly integrated with GTB Hospital; its current NAAC repository publishes hospital-services material and 2023-24 OPD/IPD medical-record datasets, giving unusually auditable clinical-volume evidence even where a single aggregate number has not yet been inserted.',
  confidence:'High for GTB Hospital linkage, bed structure and existence of current OPD/IPD datasets; Medium until the 2023-24 medical-record files are fully reduced to clean aggregate totals.'
});
v7AppendSources(CLINICAL_EXPOSURE,71,[{label:'UCMS NAAC — GTB hospital services & 2023-24 OPD/IPD datasets',url:'https://www.ucms.ac.in/misc/naac'}]);
v7Patch(HOSTELS,71,{
  lastVerified:'2026-08-22'
});
v7AppendSources(HOSTELS,71,['https://www.ucms.ac.in/common/viewallnotifications']);

// ---- AIIMS Jodhpur --------------------------------------------------------
v7Patch(CLINICAL_EXPOSURE,262,{
  beds:'960 current beds in the 2023-24 annual report, including 134 ICU beds',
  opd:'380,601 new OPD registrations in 2023-24; follow-up visits are additional and are not folded into this number here',
  ipd:'87,727 admissions in 2023-24 (up from 80,519 in 2022-23)',
  surgery:'Advanced procedural ecosystem includes robotic surgery and transplant programmes; exact institute-wide annual operation total is not inserted here without a single clean table.',
  patientMix:'Large regional tertiary referral load with rapidly expanding superspecialty/transplant activity.',
  confidence:'High for 2023-24 bed strength and admissions from the official annual report; High for institutional specialty/transplant structure.'
});
v7AppendSources(CLINICAL_EXPOSURE,262,[{label:'AIIMS Jodhpur Annual Report 2023-24',url:'https://www.aiimsjodhpur.edu.in/annual%20report/ENG%20-%20Annual%20Report%2023-24%20%288%29%20%281%29%20%281%29.pdf'}]);
v7Patch(RESEARCH_USMLE,262,{
  undergradAccess:'AIIMS Jodhpur has a formal Student Innovation and Research Initiative (SIRI), including structured undergraduate research/summer-project routes under faculty mentorship.',
  studentOpportunities:'SIRI and faculty-mentored projects provide an explicit research entry point rather than leaving undergraduate research entirely informal.',
  confidence:'High for the existence of a formal undergraduate research pathway; Medium for how many MBBS students obtain projects in any given year.'
});
v7AppendSources(RESEARCH_USMLE,262,[{label:'AIIMS Jodhpur SIRI / undergraduate research guidance',url:'https://www.aiimsjodhpur.edu.in/'}]);
v7Patch(CAMPUS_STUDENT_LIFE,262,{
  sports:'Large residential-campus sports ecosystem documented in institutional reporting, including outdoor fields/courts and the Student Activity Centre with indoor recreation and aquatic facilities.',
  confidence:'High for institutional sports infrastructure; Medium for current club-by-club activity.'
});
v7Patch(HOSTELS,262,{
  guaranteed:'The 2025 admission booklet prioritises hostel accommodation for outstation students and states that the institute strives to provide accommodation on the day of reporting, subject to availability.',
  roomAllocation:{year1:'Double-sharing accommodation is the standard first-year arrangement described in the 2025 admission material',year2:null,year3:null,year4:null,internship:null},
  furniture:{bed:true,mattress:true,studyTable:true,chair:true,cupboard:true,bookshelf:null},
  messCompulsory:true,
  messDetails:'The 2025 admission booklet describes a mandatory residential mess arrangement for hostel residents; the annual charge quoted for that admission cycle was ₹56,350.',
  messMonthly:'2025 admission-cycle annual residential mess charge: ₹56,350 (about ₹4,696/month equivalent; not a monthly billing quote)',
  lastVerified:'2026-08-22',
  confidence:'High for first-year room/furniture and 2025 admission-cycle mess terms; later-year room progression remains insufficiently documented.'
});

// ---- JIPMER Puducherry ----------------------------------------------------
v7Patch(CLINICAL_EXPOSURE,255,{
  beds:'1,828 functional beds (2023-24 annual report)',
  opd:'1,457,264 OPD attendances in 2023-24; daily average 4,940',
  ipd:'80,556 admissions in 2023-24; occupied inpatient census 609,390; bed occupancy 91%',
  surgery:'44,851 operations performed in 2023-24 (daily average 123)',
  patientMix:'High-volume tertiary referral centre with about 34 specialties and more than 105 special clinics documented in the 2023-24 report.',
  confidence:'High for 2023-24 hospital volume and bed data from the official annual report.'
});
v7AppendSources(CLINICAL_EXPOSURE,255,[{label:'JIPMER Annual Report 2023-24 — hospital statistics',url:'https://jipmer.edu.in/sites/default/files/Annual%20report_2023-24%20English.pdf'}]);
v7Patch(RESEARCH_USMLE,255,{
  undergradAccess:'JIPMER has a dedicated Undergraduate Research Monitoring Committee (UGRMC) whose stated purpose is to improve undergraduate research quality and encourage publication.',
  studentOpportunities:'UGRMC review, faculty-guided undergraduate proposals and the GJ-STRAUS short-term undergraduate research award provide formal routes into research.',
  confidence:'High for the formal UG research-governance structure; Medium for the current annual number of MBBS participants.'
});
v7AppendSources(RESEARCH_USMLE,255,[
  {label:'JIPMER Undergraduate Research Monitoring Committee',url:'https://jipmer.edu.in/research/research-committees/undergraduate-research-monitoring-committee-ugrmc'},
  {label:'JIPMER Annual Report 2024-25',url:'https://www.jipmer.edu.in/sites/default/files/2024-25_Annual%20report_English_Binder.pdf'}
]);
if(!HOSTELS[255]) HOSTELS[255]=emptyHostelRecord();
Object.assign(HOSTELS[255],{
  boysAvailable:true,girlsAvailable:true,
  guaranteed:'Hostel accommodation is for outstation students, subject to availability and first-come-first-served allotment; a waiting list operates when rooms are full.',
  hostelBlocks:'2025 admission material identifies Harvey House III for boys and Curie House I for girls in the new hostel complex for reporting/allotment purposes.',
  roomAllocation:{year1:'Sharing accommodation is the default; current MBBS admission material does not promise a single room',year2:'Sharing accommodation; exact progression depends on availability',year3:'Sharing accommodation; exact progression depends on availability',year4:'Single rooms may become available subject to stock; not a right',internship:'Hostel continues for eligible residents subject to rules/allotment'},
  annualFee:'₹20,000 at entry for standard double accommodation (includes ₹6,000 annual establishment, ₹5,000 refundable caution, ₹3,000 refundable mess deposit and ₹6,000 annual room rent); subsequent double-sharing years ₹12,000',
  securityDeposit:'₹5,000 hostel caution deposit + ₹3,000 mess deposit, both refundable subject to deductions',
  messCompulsory:null,
  messDetails:'Mess facility available on payment of charges; ₹3,000 refundable mess deposit is collected at hostel entry.',
  electricityReliability:'Room rent quoted by JIPMER includes electricity charges.',
  furniture:{bed:true,mattress:null,studyTable:true,chair:true,cupboard:true,bookshelf:null},
  roomCondition:'Structured institutional hostel system; room type and single-room availability depend on year and vacancy rather than entitlement.',
  blockVariation:'Separate boys/girls hostels; sharing and room availability vary across hostel stock.',
  officialNotes:[
    'Outstation students can apply for hostel accommodation, subject to availability and first-come-first-served allotment.',
    'The 2025 MBBS admission brochure warns that boys’ rooms are limited and a waiting list may operate.',
    'Official hostel charges are ₹20,000 at entry for double accommodation and ₹12,000/year thereafter for double/triple sharing; single accommodation costs more when available.'
  ],
  studentNotes:[],
  sources:[
    'https://www.jipmer.edu.in/sites/default/files/Revised%20Information%20Brochure%20for%20MBBS%20admission%202025_JIPMER%20Puducherry%20-%2014.08.2025.pdf',
    'https://www.jipmer.edu.in/sites/default/files/JIPMER%20Hostel%20Manual.pdf'
  ],
  lastVerified:'2026-08-22',
  confidence:'High for eligibility, allotment model and fee structure from official JIPMER material; Medium for year-wise room progression.',
  researchStatus:'V7 official-source reconstruction'
});

// ---- KGMU -----------------------------------------------------------------
v7Patch(CLINICAL_EXPOSURE,402,{
  beds:'4,250 operational beds on the current KGMU institutional overview',
  opd:'KGMU describes roughly 10,000 new OPD patients per day across its associated hospitals',
  patientMix:'Very large Uttar Pradesh tertiary/quaternary referral base, also drawing patients from neighbouring states and Nepal.',
  confidence:'High for current institutional bed/OPD headline figures; department-level student autonomy remains unquantified.'
});
v7AppendSources(CLINICAL_EXPOSURE,402,[{label:'KGMU current institutional overview',url:'https://www.kgmu.org/about-us.php'}]);
v7Patch(RESEARCH_USMLE,402,{
  studentOpportunities:'University student-welfare schemes include support/awards for students presenting research papers; formal research activity is extensive across a large university hospital system.',
  confidence:'High for institutional research scale and student-welfare research support; Medium for outbound international-programme participation rates.'
});
v7AppendSources(RESEARCH_USMLE,402,[{label:'KGMU Student Welfare Schemes',url:'https://www.kgmu.org/'}]);

// ---- PMCH -----------------------------------------------------------------
v7Patch(CLINICAL_EXPOSURE,49,{
  teaching:'Extremely high-value legacy public-hospital environment, but the ongoing PMCH megaredevelopment makes a single static infrastructure snapshot misleading. Current teaching value should be judged from functioning departments and patient flow, not advertised end-state bed capacity.',
  confidence:'Medium-High for department breadth and present teaching role; Medium for aggregate current bed/volume numbers during redevelopment.'
});
v7Patch(HOSTELS,49,{
  lastVerified:'2026-08-22',
  confidence:'High for official hostel names/capacity; Medium for current lived experience because redevelopment makes block conditions highly variable.'
});
v7AppendSources(HOSTELS,49,['https://patnamedicalcollege.edu.in/hostel']);

// ---- IGIMS ----------------------------------------------------------------
v7Patch(ACADEMICS_TEACHING,45,{
  teachingModel:'CBME-aligned MBBS programme with a formal foundation course; the 2025 foundation schedule included self-directed learning, professionalism/ethics, communication skills, simulation-based Skill Lab sessions, hostel/interpersonal orientation and doctor-attendant communication.',
  confidence:'High for the current foundation-course structure; Medium for year-to-year lived teaching intensity.'
});
v7AppendSources(ACADEMICS_TEACHING,45,[{label:'IGIMS Foundation Course — MBBS Batch 2025',url:'https://igims.org/Datafiles/cms/Foundation%20Course%20for%20Batch%202025.pdf'}]);
v7Patch(RESEARCH_USMLE,45,{
  researchStrength:'Formal institute research governance includes a Dean Research structure, Research Advisory Committee, ethics processes and multidisciplinary research-unit oversight.',
  confidence:'High for research governance; Medium for routine undergraduate access/participation because a current MBBS-specific project-count dataset is not published.'
});
v7AppendSources(RESEARCH_USMLE,45,[{label:'IGIMS Research Advisory Committee',url:'https://igims.org/topics.aspx?mid=Minutes+of+Research+Advisory+Committee'}]);
v7AppendSources(HOSTELS,45,['https://www.igims.org/topics.aspx?mid=Rules+and+Regulations+-+Hostel++%2F+Hostel+Committee']);

const PROFILE_INTELLIGENCE_V7 = {
  64:{
    status:'Refreshed · Batch 1', evidence:'High', asOf:'2026-08-22',
    headline:'Best-in-class national academic/research ecosystem with unusually low hostel cost; the remaining data gap is not institutional scale but clean current aggregation of the enormous AIIMS network.',
    bestFor:['Research-heavy MBBS','National/international academic networking','Complex tertiary/quaternary clinical exposure','Students who want a dense Delhi medical ecosystem'],
    tradeoffs:['The campus is an intense medical complex rather than a relaxed residential university.','Some aggregate hospital-volume figures span multiple centres and should not be reduced to one number unless the annual report table is cleanly reconstructed.'],
    hardFacts:[['Annual-report freshness','69th Annual Report 2024-25 is on the official archive'],['Hostel eligibility','All MBBS undergraduates are eligible to apply'],['MBBS hostel charge','₹2,728 total across 5.5 years']],
    whyItMatters:['Research and networking depth are structural advantages, not dependent on one department.','For clinical learning, complexity and specialty breadth matter as much as raw OPD counts.'],
    unresolved:['Current official single-table aggregate of network OPD/IPD/surgery volume','Current official MBBS-intern stipend'],
    sources:[{label:'AIIMS Annual Reports',url:'https://aiims.edu/index.php/en/about-us/annual-reports'},{label:'AIIMS Hostel FAQ',url:'https://www.aiims.edu/index.php/en/hostel_accomodation_faqs'}]
  },
  72:{
    status:'Refreshed · Batch 1', evidence:'High', asOf:'2026-08-22',
    headline:'A very high-volume clinical college whose current academic administration is more structured than the usual “service hospital = self-study” caricature suggests.',
    bestFor:['Massive real-world patient exposure','Delhi networking','Students who value a large central-government hospital','Strong clinical apprenticeship environment'],
    tradeoffs:['Hostel rooms are not guaranteed for every eligible student and are commonly described as compact.','Current official UG fee material is less cleanly surfaced than the clinical/academic notice stream.'],
    hardFacts:[['2026 academic signal','Internal assessment + attendance are published for the 2025 first-professional batch'],['Mentorship','Formal mentorship programme for all new MBBS admissions'],['Hostel priority','Outside-Delhi AIQ students receive priority in the 2025-26 allotment instructions']],
    whyItMatters:['The mentorship and published assessment trail show an active undergraduate academic system.','Safdarjung volume gives repeated exposure to common disease as well as tertiary referrals.'],
    unresolved:['Current hostel fee/mess cost from a clean official 2026 UG source','Department-level procedure autonomy for MBBS students'],
    sources:[{label:'VMMC MBBS notice board',url:'https://vmmc-sjh.mohfw.gov.in/mbbs-notice-board'},{label:'Principal message',url:'https://vmmc-sjh.mohfw.gov.in/principals-message'},{label:'Hostel allotment 2025-26',url:'https://vmmc-sjh.mohfw.gov.in/notice-dated-10092025-instructions-hostel-allotment-mbbs-batch-2025-26'}]
  },
  69:{
    status:'Refreshed · Batch 1', evidence:'High', asOf:'2026-08-22',
    headline:'A traditional high-volume Delhi government-college experience with deep attached-hospital exposure and a very active current student-administration/academic notice stream.',
    bestFor:['High-volume clinical medicine','Delhi professional network','Students comfortable in a historic, busy urban campus','Strong government-hospital exposure'],
    tradeoffs:['The physical campus/hostel experience is older and more variable than newer institutions.','Current hospital aggregates are spread across associated hospitals rather than one clean campus-wide statistic.'],
    hardFacts:[['2025-26 student administration','Current notices include hostel allotment, orientation completion, white-coat ceremony and fee/stipend circulars'],['Clinical context','Multi-hospital Delhi teaching ecosystem with very high daily patient load']],
    whyItMatters:['MAMC’s value is the combination of clinical volume and Delhi ecosystem, not luxury infrastructure.','The live notice stream confirms a currently active undergraduate academic/administrative system.'],
    unresolved:['Clean 2025-26 institution-wide patient statistics across attached hospitals','Current year-specific hostel room progression and amenities by block'],
    sources:[{label:'MAMC current notices',url:'https://mamc.delhi.gov.in/circular-notices/473'}]
  },
  65:{
    status:'Refreshed · Batch 1', evidence:'High', asOf:'2026-08-22',
    headline:'A compact Delhi option combining a strong RML clinical base with one of the best-documented modern hostel setups among the Delhi government colleges.',
    bestFor:['Delhi networking','Strong general + emergency medicine exposure','Students who care about modern hostel infrastructure','Smaller institutional footprint than MAMC/VMMC'],
    tradeoffs:['The college is younger and has a smaller historical alumni footprint than MAMC/VMMC/UCMS.','Research opportunity is present but less obviously undergraduate-systematised than at AIIMS/JIPMER.'],
    hardFacts:[['Hostel','20-storey Dhanwantri Chhatrawas'],['Rooms','Official page describes central AC + attached washrooms'],['Vertical access','Six elevators'],['Food','Two hostel messes + canteen/stalls']],
    whyItMatters:['For daily MBBS quality of life, the hostel is a genuine differentiator rather than a cosmetic detail.','RML’s central Delhi location preserves the conference/networking advantages of the city.'],
    unresolved:['Current official year-wise room-allotment pattern','Current MBBS-specific undergraduate research participation numbers'],
    sources:[{label:'ABVIMS/RML hostel',url:'https://rmlh.nic.in/printmain.aspx?langid=1&lev=3&lid=3567&lsid=2576'}]
  },
  71:{
    status:'Refreshed · Batch 1', evidence:'High', asOf:'2026-08-22',
    headline:'A clinically strong DU medical college with unusually transparent NAAC documentation and a compelling balance of GTB patient exposure, Delhi access and established student ecosystem.',
    bestFor:['DU clinical ecosystem','Delhi networking','Students who want strong clinical exposure without the MAMC/VMMC campus feel','Research-minded students who can self-initiate'],
    tradeoffs:['GTB/UCMS infrastructure is functional rather than premium.','Several useful OPD/IPD datasets exist but still need full numerical reduction for a clean headline metric.'],
    hardFacts:[['Hospital evidence','UCMS NAAC repository publishes GTB hospital services and 2023-24 OPD/IPD medical records'],['Hostel/currentness','2026 hostel maintenance/mess fee notices are published']],
    whyItMatters:['The public audit trail makes the clinical profile easier to verify than many peer colleges.','Its Delhi location amplifies research/conference opportunities beyond what the college alone provides.'],
    unresolved:['Full reduction of GTB 2023-24 OPD/IPD files into clean totals','Current block-by-block hostel facilities and exact first-year allotment availability'],
    sources:[{label:'UCMS NAAC',url:'https://www.ucms.ac.in/misc/naac'},{label:'UCMS Notifications',url:'https://www.ucms.ac.in/common/viewallnotifications'}]
  },
  262:{
    status:'Refreshed · Batch 1', evidence:'High', asOf:'2026-08-22',
    headline:'A newer AIIMS that now has enough hospital scale to be judged on current performance rather than “still developing” stereotypes, plus an explicit undergraduate research pathway.',
    bestFor:['INI/AIIMS academic ecosystem','Formal undergraduate research','Residential campus life','Students who want strong tertiary exposure in a newer campus'],
    tradeoffs:['Jodhpur offers less city-scale external networking than Delhi/Mumbai.','Some later-year hostel details are still less transparent than first-year admission information.'],
    hardFacts:[['Beds','960 including 134 ICU beds (2023-24)'],['IPD','87,727 admissions in 2023-24'],['OPD signal','380,601 new OPD registrations in 2023-24'],['UG research','Formal SIRI pathway']],
    whyItMatters:['The clinical numbers show a mature high-volume tertiary hospital, not a small new-AIIMS setup.','SIRI lowers the activation energy for a first-time undergraduate researcher.'],
    unresolved:['Clean institute-wide annual surgery/procedure total','Later-year room progression and current mess cost beyond the 2025 admission cycle'],
    sources:[{label:'AIIMS Jodhpur Annual Report 2023-24',url:'https://www.aiimsjodhpur.edu.in/annual%20report/ENG%20-%20Annual%20Report%2023-24%20%288%29%20%281%29%20%281%29.pdf'},{label:'AIIMS Jodhpur website / SIRI',url:'https://www.aiimsjodhpur.edu.in/'}]
  },
  255:{
    status:'Refreshed · Batch 1', evidence:'High', asOf:'2026-08-22',
    headline:'One of the cleanest evidence-backed all-round profiles: very high clinical volume, a formal undergraduate research committee and a now-fully reconstructed official hostel layer.',
    bestFor:['Research-oriented MBBS','High-volume tertiary clinical exposure','Students who want an INI with a strong residential identity','Structured UG research entry'],
    tradeoffs:['Hostel rooms are not guaranteed immediately; boys’ room stock is explicitly described as limited in the 2025 admission material.','External city networking is smaller than Delhi/Mumbai, so the institute itself carries more of the opportunity load.'],
    hardFacts:[['Functional beds','1,828 (2023-24)'],['OPD','1,457,264/year; 4,940/day average'],['Admissions','80,556/year'],['Operations','44,851/year'],['Bed occupancy','91%'],['UG research','Dedicated UGRMC']],
    whyItMatters:['The combination of volume + formal UG research is rare and makes JIPMER unusually balanced.','The hostel evidence is now concrete enough to separate availability risk from facility quality.'],
    unresolved:['Current annual MBBS participation in UGRMC/GJ-STRAUS','Current block-specific hostel room quality and mess price'],
    sources:[{label:'JIPMER Annual Report 2023-24',url:'https://jipmer.edu.in/sites/default/files/Annual%20report_2023-24%20English.pdf'},{label:'JIPMER UGRMC',url:'https://jipmer.edu.in/research/research-committees/undergraduate-research-monitoring-committee-ugrmc'},{label:'JIPMER MBBS admission 2025-26',url:'https://www.jipmer.edu.in/sites/default/files/Revised%20Information%20Brochure%20for%20MBBS%20admission%202025_JIPMER%20Puducherry%20-%2014.08.2025.pdf'}]
  },
  402:{
    status:'Refreshed · Batch 1', evidence:'High', asOf:'2026-08-22',
    headline:'A giant university-hospital ecosystem: exceptional patient scale and specialty breadth, with more of a traditional large-state-university experience than an INI-style residential model.',
    bestFor:['Maximum clinical volume','Broad superspecialty exposure','Students targeting Indian PG while retaining research options','North-India tertiary referral exposure'],
    tradeoffs:['The very large system can be less curated/personalised than smaller institutions.','International-pathway opportunities exist, but participation is more student-driven than a dedicated USMLE pipeline.'],
    hardFacts:[['Operational beds','4,250'],['OPD','About 10,000 new patients/day'],['Students','~5,300 UG/PG students across the university'],['Hostel rooms','2,105']],
    whyItMatters:['Raw case volume is a major clinical advantage across common and rare disease.','The scale creates huge specialty breadth but also makes self-navigation important.'],
    unresolved:['Current MBBS-specific undergraduate research participation rate','Block-level UG hostel allocation and current mess experience'],
    sources:[{label:'KGMU About Us',url:'https://www.kgmu.org/about-us.php'}]
  },
  49:{
    status:'Refreshed · Batch 1', evidence:'Medium-High', asOf:'2026-08-22',
    headline:'PMCH’s clinical upside is enormous, but redevelopment means the profile must distinguish functioning 2026 reality from future megaproject promises.',
    bestFor:['Very high public-hospital exposure','Bihar clinical network','Students comfortable with a rapidly changing campus','Broad traditional government-hospital medicine'],
    tradeoffs:['Redevelopment makes hostel/infrastructure experience highly block- and year-dependent.','Future advertised capacity should not be treated as current clinical exposure until commissioned and functioning.'],
    hardFacts:[['UG intake','200 MBBS seats in the current institutional/master data'],['Hostel inventory','Official PMCH hostel page lists multiple UG/intern blocks and legacy capacity'],['Department breadth','Large traditional teaching-hospital department set']],
    whyItMatters:['Patient exposure is the core reason to choose PMCH; construction renderings are not.','The correct comparison is “current functioning PMCH + transition cost” versus peers, not the eventual redevelopment endpoint.'],
    unresolved:['Clean 2025-26 current hospital bed/OPD/IPD totals during redevelopment','Which hostel blocks the incoming 2026 MBBS batch will actually occupy'],
    sources:[{label:'PMCH Hostel',url:'https://patnamedicalcollege.edu.in/hostel'},{label:'PMCH official site',url:'https://patnamedicalcollege.edu.in/'}]
  },
  45:{
    status:'Refreshed · Batch 1', evidence:'Medium-High', asOf:'2026-08-22',
    headline:'A modern Bihar tertiary institute with a notably structured foundation-course/skill-lab environment and formal research governance; the biggest remaining weakness is clean current hospital-volume aggregation.',
    bestFor:['Modern tertiary-care environment in Bihar','Skill-lab oriented early training','Students who want formal research governance','Campus-based specialty exposure'],
    tradeoffs:['Current institute-wide patient statistics are published in fragmented/monthly formats rather than a simple single headline.','Hostel allocation can involve a wait according to student reports.'],
    hardFacts:[['Foundation course','2025 schedule includes SDL, ethics, communication, simulation and hostel/interpersonal orientation'],['Research governance','Formal Research Advisory Committee / Dean Research structure'],['Hostel administration','Separate official hostel-rule/committee framework for boys and girls']],
    whyItMatters:['The foundation-course design suggests stronger early institutional scaffolding than many traditional colleges.','Formal research governance helps, but actual undergraduate access still depends on mentorship and initiative.'],
    unresolved:['Clean 2024-25/2025 institute-wide OPD/IPD/operation totals','Current official MBBS-specific hostel fee and room-wait distribution'],
    sources:[{label:'IGIMS Foundation Course 2025',url:'https://igims.org/Datafiles/cms/Foundation%20Course%20for%20Batch%202025.pdf'},{label:'IGIMS Research Advisory Committee',url:'https://igims.org/topics.aspx?mid=Minutes+of+Research+Advisory+Committee'},{label:'IGIMS Hostel rules/committees',url:'https://www.igims.org/topics.aspx?mid=Rules+and+Regulations+-+Hostel++%2F+Hostel+Committee'}]
  }
};

function meritProfileIntelligence(id){ return PROFILE_INTELLIGENCE_V7[Number(id)] || null; }

const PROFILE_UPGRADE_STATUS_V7 = {
  64:{batch:1,status:'refreshed'},72:{batch:1,status:'refreshed'},69:{batch:1,status:'refreshed'},65:{batch:1,status:'refreshed'},71:{batch:1,status:'refreshed'},262:{batch:1,status:'refreshed'},255:{batch:1,status:'refreshed'},402:{batch:1,status:'refreshed'},49:{batch:1,status:'refreshed'},45:{batch:1,status:'refreshed'},
  168:{batch:2,status:'queued'},38:{batch:2,status:'queued'},239:{batch:2,status:'queued'},372:{batch:2,status:'queued'},189:{batch:2,status:'queued'},220:{batch:2,status:'queued'},226:{batch:2,status:'queued'},230:{batch:2,status:'queued'},51:{batch:2,status:'queued'},288:{batch:2,status:'queued'},
  129:{batch:3,status:'queued'},75:{batch:3,status:'queued'},248:{batch:3,status:'queued'},323:{batch:3,status:'queued'},360:{batch:3,status:'queued'},440:{batch:3,status:'queued'},66:{batch:3,status:'queued'},181:{batch:3,status:'queued'},211:{batch:3,status:'queued'},327:{batch:3,status:'queued'}
};
function meritProfileUpgradeStatus(id){return PROFILE_UPGRADE_STATUS_V7[Number(id)]||null;}

// Standardized decision dossiers for the remaining 20 deep profiles.
// These are synthesized from the already-reviewed dimension datasets so every deep
// profile uses the same decision schema immediately. Their source-refresh stage is
// explicitly distinguished from the 10 profiles freshly re-verified on 2026-08-22.
function v7ExistingSources(id){
  const layers=[CLINICAL_EXPOSURE[id],ACADEMICS_TEACHING[id],RESEARCH_USMLE[id],CAMPUS_STUDENT_LIFE[id],FEES_BOND_STIPEND[id],HOSTELS[id]];
  const out=[],seen=new Set();
  for(const layer of layers){
    for(const s of (layer?.sources||[])){
      const url=typeof s==='string'?s:(s&&s.url)||'';
      const label=typeof s==='string'?'Existing reviewed source':(s&&s.label)||'Existing reviewed source';
      if(url&&!seen.has(url)){seen.add(url);out.push({label,url});}
    }
  }
  return out.slice(0,10);
}
function v7Standardized(id,cfg){
  const cl=CLINICAL_EXPOSURE[id]||{}, re=RESEARCH_USMLE[id]||{}, ca=CAMPUS_STUDENT_LIFE[id]||{};
  const facts=(cfg.hardFacts||[]).slice();
  if(!facts.length){
    if(cl.beds)facts.push(['Clinical scale',cl.beds]);
    if(cl.opd)facts.push(['Patient load',cl.opd]);
    if(re.undergradAccess)facts.push(['UG research',re.undergradAccess]);
  }
  return {status:'Standardized · source-refresh pending',evidence:cfg.evidence||'Medium-High',asOf:'2026-08-22',headline:cfg.headline,bestFor:cfg.bestFor||[],tradeoffs:cfg.tradeoffs||[ca.tradeoff].filter(Boolean),hardFacts:facts.slice(0,5),whyItMatters:cfg.whyItMatters||[],unresolved:cfg.unresolved||[],sources:v7ExistingSources(id)};
}
Object.assign(PROFILE_INTELLIGENCE_V7,{
  168:v7Standardized(168,{headline:'A modern, residential central-India AIIMS with a structured and academically demanding feel; the main evidence gap is clean current hospital-volume aggregation rather than service breadth.',bestFor:['Residential AIIMS experience','Structured academic environment','Central-India tertiary exposure','Students who value modern campus infrastructure'],tradeoffs:['Less metro-scale external networking than Delhi/Mumbai.','Current official aggregate OPD/IPD/bed figures need a fresh single-source reconstruction.'],whyItMatters:['The residential AIIMS model gives strong campus cohesion and easier access to academic facilities.','A missing clean volume total should not be confused with low clinical exposure.'],unresolved:['Current official aggregate bed/OPD/IPD figures','Formal current UG-research pathway beyond mentor/ICMR routes']}),
  38:v7Standardized(38,{headline:'A rapidly maturing AIIMS that now functions as a major Bihar tertiary referral centre, with strong regional relevance but still-incomplete current public hospital-volume data.',bestFor:['AIIMS/INI ecosystem in Bihar','Regional tertiary referral exposure','Residential institute model','Students wanting a growing superspecialty centre'],tradeoffs:['Capacity pressure is part of the current clinical environment.','Several current hospital-volume and hostel facts are fragmented across sources.'],hardFacts:[['Clinical scale','~960 beds reported in the existing 2025 evidence layer'],['Regional role','High-demand tertiary referral centre for Bihar']],whyItMatters:['High occupancy/capacity pressure can translate to case exposure, although it may also strain infrastructure.','The institution has moved well beyond an early “new AIIMS” phase.'],unresolved:['Clean current daily OPD/IPD/operation totals','Fully official current hostel room progression and fees']}),
  239:v7Standardized(239,{headline:'One of the more mature 2012-generation AIIMS campuses, combining broad tertiary/superspecialty services with a formal research ecosystem and an established eastern-India referral role.',bestFor:['Mature AIIMS clinical ecosystem','Research-oriented students','Eastern-India superspecialty exposure','Residential campus experience'],tradeoffs:['External city/networking density is below Delhi/Mumbai.','A fresh aggregate annual patient-volume extraction is still needed.'],hardFacts:[['Bed evidence','Official live IPD page publishes department-wise bed strength'],['Research','Advanced Research Center + projects/collaborations/patents ecosystem']],whyItMatters:['Department-wise live bed data is stronger evidence than generic “large hospital” claims.','Formal research infrastructure can make mentor discovery and project execution easier.'],unresolved:['Single current aggregate bed total from the live department list','Current annual OPD/IPD/operation totals']}),
  372:v7Standardized(372,{headline:'A fully developed scenic residential AIIMS with broad specialty exposure, including Nuclear Medicine, and a stronger current hospital base than its “smaller-city AIIMS” label may imply.',bestFor:['Residential campus life','Broad AIIMS specialty exposure','Students valuing outdoor/lifestyle environment','INI/PG-oriented pathway'],tradeoffs:['Smaller external medical-networking ecosystem than metros.','Current aggregate daily patient figures still need a clean official extraction.'],hardFacts:[['Beds','1,060 inpatient beds in the existing current official evidence'],['Specialty breadth','85+ specialty clinics and broad superspecialty portfolio']],whyItMatters:['The clinical base is large enough that the campus/lifestyle advantage need not mean sacrificing tertiary exposure.','Rishikesh’s biggest relative trade-off is networking geography, not core institutional capability.'],unresolved:['Fresh 2025-26 aggregate OPD/IPD/procedure totals','Current structured UG-research participation data']}),
  189:v7Standardized(189,{headline:'A fast-maturing, purpose-built AIIMS with strong current hospital numbers and modern MIHAN infrastructure; the main lifestyle trade-off is its peripheral location.',bestFor:['Modern AIIMS infrastructure','Strong current tertiary workload','Students who like self-contained campuses','Emerging transplant/advanced-care exposure'],tradeoffs:['MIHAN is less central than legacy Nagpur colleges.','UG research access is still documented more as mentor/project opportunity than a distinctive formal programme.'],hardFacts:[['Beds','940 functional beds + 110 ICU beds in the existing current official layer'],['OPD','3,500–4,000 visits/day'],['Admissions','100–120/day']],whyItMatters:['These current volumes argue against treating AIIMS Nagpur as an immature new institute.','Peripheral location matters more for spontaneous city access than for on-campus academic infrastructure.'],unresolved:['Current MBBS-specific UG research participation numbers','Deep hostel room/allotment reconstruction']}),
  220:v7Standardized(220,{headline:'A classic Mumbai clinical powerhouse: huge JJ Group case exposure and city-networking depth, traded against older, dense urban infrastructure rather than a modern residential-campus experience.',bestFor:['Very high clinical volume','Mumbai academic/networking ecosystem','Broad public-hospital specialty exposure','Students who prefer legacy clinical intensity over campus luxury'],tradeoffs:['Older urban infrastructure and hostel stock.','The ecosystem is spread across the JJ Group rather than one compact residential campus.'],hardFacts:[['Beds','1,885 in the existing current institutional summary'],['OPD','~1.2 million/year'],['IPD','~80,000/year']],whyItMatters:['High annual case load gives repeated exposure to common disease as well as complex referrals.','Mumbai’s external academic ecosystem substantially extends opportunity beyond the college itself.'],unresolved:['Current UG hostel allocation/quality by block','More explicit undergraduate research-entry mechanisms']}),
  226:v7Standardized(226,{headline:'KEM/Seth GS combines elite Mumbai clinical intensity with a notably active research/academic culture, making it one of the strongest legacy-college options for students who will tolerate dense urban infrastructure.',bestFor:['Massive clinical volume','Research + clinical combination','Mumbai networking','Students seeking a strong academic legacy'],tradeoffs:['Limited open campus space and older hostel infrastructure.','Current MBBS fee/stipend figures need cleaner official reconstruction.'],hardFacts:[['Beds','1,800'],['OPD','~1.8 million/year'],['IPD','~85,000/year'],['Research','Active institutional trust/research ecosystem']],whyItMatters:['The unusually strong mix of research culture and case volume differentiates KEM from “clinical-only” legacy colleges.','Mumbai adds external conferences, alumni and specialty-network access.'],unresolved:['Current official MBBS fee/intern stipend','Current UG hostel allocation and lived-quality evidence']}),
  230:v7Standardized(230,{headline:'A compact central-Mumbai municipal college with very strong city/clinical access; its biggest current practical issue is constrained and changing hostel availability rather than academic opportunity.',bestFor:['Mumbai clinical ecosystem','Urban networking','Municipal-hospital exposure','Students comfortable with a compact city campus'],tradeoffs:['Hostel constraints/renovation can materially affect first-year living arrangements.','Current clean hospital bed/volume totals need better official reconstruction.'],whyItMatters:['A Mumbai location can compensate for a compact campus through dense external opportunity.','Hostel availability is a real decision variable and should not be hidden inside a generic campus score.'],unresolved:['Current official hospital bed/OPD/IPD totals','2026-27 hostel availability by gender/year']}),
  51:v7Standardized(51,{headline:'A smaller but strategically placed government medical college in Chandigarh, benefiting from a planned-city campus and a uniquely strong academic neighbourhood around PGIMER/Panjab University.',bestFor:['Chandigarh quality of life','Tri-city academic network','Large tertiary hospital exposure','Students wanting a smaller college ecosystem'],tradeoffs:['Smaller alumni/institutional scale than the biggest legacy colleges.','Current MBBS-specific research pathway and hostel detail need deeper reconstruction.'],hardFacts:[['Beds','~1,198 cited in the existing 2026 seat-expansion evidence'],['Location advantage','Close academic ecosystem with PGIMER and Panjab University']],whyItMatters:['External academic density can matter disproportionately for research/conferences at a smaller college.','The planned-city environment is a genuine lifestyle differentiator.'],unresolved:['Current aggregate OPD/IPD/procedure totals','Current UG hostel fee/room progression','UG-specific research programme']}),
  288:v7Standardized(288,{headline:'A central-Jaipur legacy college built around one of Rajasthan’s largest public-hospital systems, offering enormous clinical breadth at the cost of an older, dense hospital-campus experience.',bestFor:['Very high clinical exposure','Rajasthan tertiary referrals','Broad superspecialty exposure','Central Jaipur access'],tradeoffs:['Older infrastructure and hospital density reduce the residential-campus feel.','Clean current multi-hospital aggregate statistics remain fragmented.'],whyItMatters:['The key advantage is the scale of the attached hospital network, not campus aesthetics.','Jaipur adds a large-city opportunity base without Mumbai/Delhi-level density.'],unresolved:['Current aggregate bed/OPD/IPD totals across attached hospitals','UG research pathway and current hostel specifics']}),
  129:v7Standardized(129,{headline:'Jharkhand’s major state tertiary institute with strong current patient flow and statewide referral relevance; infrastructure modernization is real but still uneven.',bestFor:['High state-referral clinical exposure','Jharkhand/regional network','Students prioritising clinical volume','Broad tertiary medicine'],tradeoffs:['Modernization remains uneven and RIMS-2 is still future-facing.','External academic network is smaller than metro peers.'],hardFacts:[['Live-dashboard example','2,501 OPD visits on 04 Aug 2026'],['Live-dashboard example','298 admissions on 04 Aug 2026']],whyItMatters:['A live dashboard is better evidence of present workload than generic historical claims.','Future RIMS-2 plans should be kept separate from the experience of a student joining now.'],unresolved:['Current aggregate functional bed total','Structured current UG research and hostel evidence']}),
  75:v7Standardized(75,{headline:'A huge Ahmedabad Civil Hospital clinical ecosystem whose strongest asset is case breadth; the current student-life story is complicated by hostel reconstruction after the 2025 air-crash damage.',bestFor:['Very high public-hospital volume','Transplant/superspecialty exposure','Ahmedabad medical ecosystem','Students prioritising clinical breadth'],tradeoffs:['Temporary/reconstruction hostel arrangements can affect daily life.','Clean current aggregate hospital-volume numbers need stronger official consolidation.'],whyItMatters:['The Civil Hospital ecosystem gives exposure that is hard to infer from college size alone.','Temporary hostel disruption should be treated as time-specific, not a permanent college trait.'],unresolved:['Current aggregate beds/OPD/IPD from a single official source','2026 hostel reconstruction/allotment status']}),
  248:v7Standardized(248,{headline:'A massive eastern-India tertiary/superspecialty referral centre with more than two thousand current beds and an enormous redevelopment programme; construction transition is the principal lifestyle caveat.',bestFor:['Very high clinical exposure','Broad superspecialties/transplant','Odisha/eastern-India referrals','Students comfortable with a major government-hospital complex'],tradeoffs:['Construction/redevelopment can affect campus convenience and crowding.','Future 3,000/5,000-bed targets must not be treated as current capacity.'],hardFacts:[['Current beds','2,132 in the existing evidence layer'],['Redevelopment','3,000-bed Phase 1 target; 5,000 ultimately — future, not current']],whyItMatters:['The current 2,132-bed base is already large before future expansion.','Separating current from planned capacity prevents inflated comparisons.'],unresolved:['Current aggregate daily OPD/IPD/operation numbers','Current UG hostel and research-entry detail']}),
  323:v7Standardized(323,{headline:'A uniquely broad Chennai clinical network anchored by RGGGH and multiple dedicated institutes; outstanding for exposure and networking, but fundamentally an urban multi-institution ecosystem rather than a self-contained campus.',bestFor:['Extreme clinical breadth','Chennai academic network','Transplant/advanced tertiary exposure','Students who prefer legacy urban medicine'],tradeoffs:['Not a single self-contained residential campus.','Some public activity figures are older or spread across multiple attached institutions.'],hardFacts:[['RGGGH scale','~3,772 beds in the existing institutional evidence'],['Clinical network','Multiple dedicated child, OBG, ophthalmic, mental-health, thoracic and rehabilitation institutes']],whyItMatters:['Separate specialty institutes dramatically broaden the clinical canvas beyond a single hospital.','Chennai provides a dense external academic ecosystem comparable to other major metros.'],unresolved:['Fresh 2025-26 aggregate activity across the full attached network','Deep current UG hostel profile']}),
  360:v7Standardized(360,{headline:'A historic Hyderabad medical-college ecosystem with huge current patient flow and a major hospital transition underway; the present and future OGH must be kept analytically separate.',bestFor:['High-volume Hyderabad clinical exposure','Legacy government-hospital medicine','City networking','Broad tertiary/surgical exposure'],tradeoffs:['Hospital infrastructure is in a major transition.','Future 2,000-bed Goshamahal plans should not be counted as current capacity.'],hardFacts:[['Current OPD context','>3,000 outpatients/day in the existing evidence'],['Current inpatient context','~1,200 inpatients/day'],['Future project','New 2,000-bed OGH complex — under construction']],whyItMatters:['Current workload is already very high; future capacity is upside, not a present fact.','Hyderabad adds strong external specialty and research options.'],unresolved:['Clean current functional bed count for present OGH network','Current UG hostel and structured research-entry evidence']}),
  440:v7Standardized(440,{headline:'A dense central-Kolkata superspecialty ecosystem with strong research credentials and rapid recent expansion, trading residential-campus space for exceptional city and tertiary-network access.',bestFor:['Superspecialty exposure','Kolkata academic network','Research-minded students','Dense tertiary-care environment'],tradeoffs:['Less spacious/self-contained residential feel.','Aggregate patient-volume figures across annex hospitals remain difficult to reduce cleanly.'],hardFacts:[['Recent expansion','131-bed Ananya block opened 2025'],['Recent expansion','>350-bed cancer hub added 2026'],['Research','MRU Centre of Research Excellence recognition in the existing layer']],whyItMatters:['Recent expansions indicate current institutional momentum rather than relying only on historical reputation.','The Kolkata location broadens opportunities beyond the core SSKM campus.'],unresolved:['Current aggregate OPD/IPD/procedure totals','Current detailed UG hostel and UG-research participation data']}),
  66:v7Standardized(66,{headline:'A younger Delhi government medical college with a busy attached hospital and more campus space than many central-Delhi peers; its main limitation is depth of institutional legacy/research rather than location.',bestFor:['Delhi networking','Busy public-hospital exposure','Students wanting an integrated campus','North/West Delhi access'],tradeoffs:['Younger alumni/society ecosystem than MAMC/VMMC/UCMS.','In-house research ecosystem is still developing relative to older Delhi institutions.'],hardFacts:[['Functional beds','500–550'],['Admissions','>150/day in the existing official layer'],['Campus','29.4-acre integrated college-hospital campus']],whyItMatters:['Delhi external networking can partly compensate for a younger in-house academic ecosystem.','A relatively spacious integrated campus is a real lifestyle advantage within Delhi.'],unresolved:['Current aggregate OPD/procedure totals','Formal UG research programme','Deep current hostel reconstruction']}),
  181:v7Standardized(181,{headline:'A strong central-Indore government-college option centred on MY Hospital and multiple attached hospitals, with high clinical volume and good city convenience but variable older-campus infrastructure.',bestFor:['High regional clinical exposure','Central Indore location','Broad multi-hospital experience','Students prioritising clinical work over campus polish'],tradeoffs:['Older infrastructure varies substantially by block.','UG research is mentor/department dependent rather than a single flagship programme.'],hardFacts:[['MY Hospital','930 beds'],['Clinical ecosystem','Additional attached hospitals expand the inpatient/superspecialty base']],whyItMatters:['Multiple attached hospitals broaden exposure beyond the headline MYH bed count.','Central city location improves daily convenience and external opportunity.'],unresolved:['Current aggregate OPD/IPD/procedure totals across all attached hospitals','Deep current hostel profile']}),
  211:v7Standardized(211,{headline:'A high-volume Vidarbha state referral college with major modernization underway; the clinical upside is strong, but current evidence should distinguish upgraded facilities from older sections still in transition.',bestFor:['Vidarbha tertiary exposure','High government-hospital workload','Central Nagpur access','Students comfortable with a modernizing legacy campus'],tradeoffs:['Older campus sections remain in transition.','Current exact aggregate bed/OPD statistics need a cleaner official source.'],whyItMatters:['Modernization improves infrastructure without erasing the legacy high-volume clinical base.','The college should not be compared with AIIMS Nagpur solely on building age; their clinical ecosystems and city positions differ.'],unresolved:['Current official aggregate beds/OPD/IPD/procedures','Structured UG research pathway and hostel specifics']}),
  327:v7Standardized(327,{headline:'A dense North-Chennai legacy college with major transplant/surgical heritage and strong urban clinical exposure; the biggest evidence weakness is freshness of aggregate hospital activity numbers.',bestFor:['Surgical/transplant heritage','Chennai clinical network','High-volume government medicine','Students who value historic college culture'],tradeoffs:['Older, dense urban campus rather than a spacious residential institute.','Latest clean activity totals in the existing layer are older than ideal.'],hardFacts:[['Beds','1,661 on the existing official NMC pro-forma'],['2021 OPD','1,622,789'],['2021 admissions','77,483']],whyItMatters:['The historical activity figures confirm scale but should be refreshed before making fine-grained 2026 comparisons.','Chennai’s wider ecosystem adds value beyond the Stanley campus itself.'],unresolved:['Fresh 2025-26 hospital activity totals','Current detailed hostel and UG research-entry evidence']})
});
for(const [id,st] of Object.entries(PROFILE_UPGRADE_STATUS_V7)){
  if(PROFILE_INTELLIGENCE_V7[id] && st.status==='queued') st.status='standardized';
}


// Latest evidence refresh and source notes.

/* DEEP_RESEARCH_REFRESH moved to shared V8 data layer. */




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

const SHORTLIST_KEY='shortlist';
const ORDER_KEY='preference_order';
const COMPARE_KEY='merit-register-compare-colleges';
const VALID_CATEGORIES=['General','OBC','EWS','SC','ST'];

const $=sel=>document.querySelector(sel);
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function fmt(v){if(v===null||v===undefined||v==='')return 'Unknown';if(typeof v==='number')return v.toLocaleString('en-IN');if(typeof v==='boolean')return v?'Yes':'No';return String(v);}
function pos(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:null;}
function shortName(name){return String(name||'').replace(/^All India Institute of Medical Sciences/i,'AIIMS');}
function collegeById(id){return ALL_COLLEGES.find(c=>Number(c.id)===Number(id));}
function profileUrl(id){return `college.html?id=${encodeURIComponent(id)}`;}

function readIds(key){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return [...new Set((Array.isArray(a)?a:[]).map(Number).filter(id=>collegeById(id)))];}catch(e){return [];}}
function writeIds(key,ids){try{localStorage.setItem(key,JSON.stringify([...new Set(ids.map(Number))]));}catch(e){}}
function showToast(msg){let el=$('#profile-toast');if(!el){el=document.createElement('div');el.id='profile-toast';el.className='profile-toast';document.body.appendChild(el);}el.textContent=msg;el.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>el.classList.remove('show'),1500);}

function sourceObjects(srcs){
  if(!Array.isArray(srcs))return [];
  return srcs.map((s,i)=>{
    if(typeof s==='string')return {label:`Source ${i+1}`,url:s};
    if(Array.isArray(s))return {label:s[0]||`Source ${i+1}`,url:s[1]||''};
    if(s&&typeof s==='object')return {label:s.label||s.title||`Source ${i+1}`,url:s.url||s.href||''};
    return null;
  }).filter(s=>s&&s.url);
}
function renderSources(srcs,title='Sources'){
  const list=sourceObjects(srcs); if(!list.length)return '';
  return `<div class="profile-sources"><div class="profile-sources-title">${esc(title)}</div><div class="profile-source-links">${list.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</div></div>`;
}
function field(label,value){
  const unknown=value===null||value===undefined||value===''||String(value).trim()==='Unknown';
  return `<div class="profile-field"><div class="key">${esc(label)}</div><div class="val${unknown?' unknown':''}">${unknown?'Not yet reconstructed':esc(fmt(value))}</div></div>`;
}
function confidence(text){return text?`<span class="profile-confidence">${esc(text)}</span>`:'';}
function card(title,subtitle,body,conf=''){
  return `<section class="profile-card"><div class="profile-card-head"><div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div>${confidence(conf)}</div><div class="profile-card-body">${body}</div></section>`;
}
function pending(message){return `<div class="profile-pending">${esc(message)}</div>`;}

function cutoffRow(cutoff,cat){
  if(!cutoff)return null;
  const cr=cutoff.category_rounds?.[cat];
  if(cr)return {R1:pos(cr.R1),R2:pos(cr.R2),R3:pos(cr.R3)};
  if(cat==='General'&&cutoff.rounds)return {R1:pos(cutoff.rounds.R1),R2:pos(cutoff.rounds.R2),R3:pos(cutoff.rounds.R3)};
  if(cat==='General'&&(cutoff.r1||cutoff.r2||cutoff.r3))return {R1:pos(cutoff.r1?.closing),R2:pos(cutoff.r2?.closing),R3:pos(cutoff.r3?.closing)};
  if(cutoff.categories_final_round?.[cat])return {R1:null,R2:null,R3:pos(cutoff.categories_final_round[cat])};
  return null;
}
function availableCategories(cutoff){
  if(!cutoff)return [];
  if(cutoff.category_rounds)return VALID_CATEGORIES.filter(c=>cutoff.category_rounds[c]);
  if(cutoff.categories_final_round)return VALID_CATEGORIES.filter(c=>cutoff.categories_final_round[c]);
  return (cutoff.rounds||cutoff.r1||cutoff.r2||cutoff.r3)?['General']:[];
}
function cutoffSourceLinks(cutoff){
  const u=cutoff?.source_urls;if(!u)return '';
  return renderSources(Object.entries(u).filter(([url])=>url).map(([round,url])=>({label:`Official ${round} result`,url})),'Counselling sources');
}
function cutoffTable(cutoff,year){
  if(!cutoff)return pending(`${year} MCC AIQ cutoff data is not loaded for this college.`);
  const cats=availableCategories(cutoff); if(!cats.length)return pending(`${year} cutoff record exists, but no round-wise category table is available.`);
  const rows=cats.map(cat=>{const r=cutoffRow(cutoff,cat)||{};return `<tr><td>${esc(cat==='General'?'General / UR':cat)}</td><td class="rank">${r.R1?fmt(r.R1):'—'}</td><td class="rank">${r.R2?fmt(r.R2):'—'}</td><td class="rank">${r.R3?fmt(r.R3):'—'}</td></tr>`}).join('');
  return `<div class="profile-cutoff-table-wrap"><table class="profile-cutoff-table"><thead><tr><th>Category</th><th>Round 1</th><th>Round 2</th><th>Round 3</th></tr></thead><tbody>${rows}</tbody></table></div><div class="profile-cutoff-note">Ranks are historical closing AIRs in the loaded MCC dataset. A dash means no verified value is stored for that round; it does not mean the category was ineligible.${cutoff.source?`<br>Dataset source: ${esc(cutoff.source)}`:''}</div>${cutoffSourceLinks(cutoff)}`;
}
function renderQuotaPoolTable(id){
  const streams=quotaRecordsForCollege(id);
  const entries=Object.entries(streams);
  if(!entries.length) return pending('No 2026 MCC quota-stream cutoff record is loaded for this college.');
  const p=getCandidateProfile();
  const enabled=new Set(eligibleQuotaCodes(p));
  const order=['AI','SO','DU','IP','ES','AM','JP','DW','IW','FQ','AN'];
  entries.sort((a,b)=>order.indexOf(a[0])-order.indexOf(b[0]));
  const rows=entries.map(([code,record])=>{
    const meta=quotaStreamMeta(code), active=enabled.has(code);
    const vals=VALID_CATEGORIES.map(cat=>{
      const r=cutoffRow(record,cat); const v=r&&r.R1;
      return `<td class="rank${v?'':' unknown'}">${v?fmt(v):'—'}</td>`;
    }).join('');
    const profileText=(meta.eligibility==='universal'||!meta.eligibility_key)?'Universal MCC route':(active?'Enabled in your profile':'Not enabled in your profile');
    return `<tr class="quota-pool-row ${active?'is-enabled':'is-disabled'}"><td><div class="quota-pool-name">${esc(meta.short_label||meta.label||code)}</div><div class="quota-pool-full">${esc(meta.label||code)}</div><div class="quota-pool-profile ${active?'enabled':''}">${esc(profileText)}</div></td>${vals}</tr>`;
  }).join('');
  const personal=p.air?`<div class="quota-personal-summary"><strong>Your saved profile:</strong> AIR ${fmt(p.air)} · ${esc(p.category==='General'?'General / UR':p.category)}. Rows marked enabled are the quota streams the site will use for personalised reach calculations.</div>`:'<div class="quota-personal-summary">Set your AIR and quota eligibility from the profile chip above to highlight the routes that apply to you.</div>';
  return `${personal}<div class="profile-cutoff-table-wrap"><table class="profile-cutoff-table quota-pool-table"><thead><tr><th>Counselling pool</th><th>General</th><th>OBC</th><th>EWS</th><th>SC</th><th>ST</th></tr></thead><tbody>${rows}</tbody></table></div><div class="profile-cutoff-note">All values are <strong>2026 Round 1 provisional closing AIRs</strong> for the exact quota stream and exact ordinary allotted category. Streams are never merged. A dash means no verified ordinary-category closing AIR is stored for that pool/category, not that the candidate is ineligible.</div>`;
}
function renderCutoffs(id){
  const c25=CUTOFFS[id];
  const source=(typeof MCC_QUOTA_2026_META!=='undefined'&&MCC_QUOTA_2026_META.source_url)?`<div class="profile-sources"><div class="profile-sources-title">Counselling source</div><div class="profile-source-links"><a href="${esc(MCC_QUOTA_2026_META.source_url)}" target="_blank" rel="noopener">Official MCC 2026 R1 provisional result</a></div></div>`:'';
  const historical=c25?`<details class="historical-cutoff-details"><summary>Show 2025 AIQ/Open historical rounds</summary>${cutoffTable(c25,2025)}</details>`:'';
  return card('Cutoffs by counselling pool','2026 Round-1 quota streams are kept separate so AIQ, Open Seat, DU, IPU, ESI and other conditional routes cannot be accidentally mixed.',`${renderQuotaPoolTable(id)}${source}${historical}`);
}

function renderMovementCard(id){
  const pairs=VALID_CATEGORIES.map(cat=>({cat,m:getRoundMovement(id,cat,'R1')})).filter(x=>x.m);
  if(!pairs.length)return card('2026 vs 2025 · Round 1','Exact category-specific year-on-year closing AIR movement.',pending('No comparable Round-1 pair is available for this college yet. A movement is never inferred from a missing year.'));
  const rows=pairs.map(({cat,m})=>`<tr><td>${esc(cat==='General'?'General / UR':cat)}</td><td class="rank">${fmt(m.previous)}</td><td class="rank">${fmt(m.current)}</td><td class="rank movement-rank ${m.direction}">${m.delta>0?'+':''}${fmt(m.delta)}</td><td><span class="profile-movement-pill ${m.direction}">${m.direction==='stronger'?'Stronger':'Softer'}</span></td></tr>`).join('');
  return card('AIQ/Open · 2026 vs 2025 · Round 1','Same-quota-family, same-category, same-round movement only. Lower closing AIR = stronger demand. 2026 Round 1 is provisional.',`<div class="profile-cutoff-table-wrap"><table class="profile-cutoff-table"><thead><tr><th>Category</th><th>2025 R1</th><th>2026 R1</th><th>Δ AIR</th><th>Direction</th></tr></thead><tbody>${rows}</tbody></table></div><div class="profile-cutoff-note">Δ AIR = 2026 − 2025. Negative values indicate stronger demand; positive values indicate softer demand. Only categories with both years loaded are shown.</div>`);
}

function demandFor(id){return (typeof AIIMS_R1_MEDIAN_TRENDS!=='undefined'&&AIIMS_R1_MEDIAN_TRENDS[id])||(typeof BIHAR_GMC_R1_MEDIAN_TRENDS!=='undefined'&&BIHAR_GMC_R1_MEDIAN_TRENDS[id])||null;}
function renderDemand(id){
  const t=demandFor(id); if(!t)return card('Round-1 demand history','Median AIR of MCC Round-1 non-PwD allottees. Lower AIR means stronger historical demand.',pending('A reconstructed 2022–2025 demand series is not available for this college yet.'));
  const years=[2022,2023,2024,2025],vals=years.map(y=>pos(t[y]));const known=vals.filter(Boolean);const min=Math.min(...known),max=Math.max(...known),range=Math.max(1,max-min);
  const bars=years.map((y,i)=>{const v=vals[i];if(!v)return `<div class="demand-bar-wrap"><div class="demand-rank">—</div><div class="demand-bar" style="height:7px;opacity:.18"></div><div class="demand-year">${y}</div></div>`;const height=28+((max-v)/range)*62;return `<div class="demand-bar-wrap"><div class="demand-rank">${fmt(v)}</div><div class="demand-bar" style="height:${height.toFixed(0)}px"></div><div class="demand-year">${y}</div></div>`}).join('');
  const current=vals[3]||known[known.length-1];
  return card('Round-1 demand history','Median AIR of all MCC Round-1 MBBS allottees in the relevant AIQ/Open Seat Quota, excluding PwD-labelled allotments. This is a demand signal, not an admission cutoff.',`<div class="demand-chart"><div class="demand-current"><div class="big">${fmt(current)}</div><div class="small">latest median AIR</div></div><div><div class="demand-bars">${bars}</div></div></div><div class="profile-cutoff-note" style="margin-top:25px">Lower AIR is plotted taller to make stronger demand visually higher.</div>`);
}

const FIELD_MAPS={
  clinical:[['Teaching hospitals','hospitals'],['Beds','beds'],['OPD / patient load','opd'],['Emergency','emergency'],['Inpatient load','ipd'],['Surgery / procedures','surgery'],['Trauma setup','trauma'],['Superspecialty breadth','superspecialty'],['Patient mix','patientMix'],['MBBS learning context','teaching']],
  academics:[['Teaching model','teachingModel'],['Attendance','attendance'],['Internal assessment','internalAssessment'],['Clinical teaching','clinicalTeaching'],['Library','library'],['Reading hours','readingHours'],['Academic culture','learningEnvironment'],['Student-reported context','studentReported']],
  research:[['Research ecosystem','researchStrength'],['Undergraduate access','undergradAccess'],['Funding','funding'],['Infrastructure','infrastructure'],['Student opportunities','studentOpportunities'],['International pathway','internationalPathway'],['City / networking context','cityNetworking'],['International alumni evidence','alumniInternational']],
  campus:[['Campus character','campus'],['Sports','sports'],['Clubs / societies','clubs'],['Festival','fest'],['Food','food'],['City access','city'],['Social environment','social'],['Safety / welfare','safety'],['Main trade-off','tradeoff']],
  finance:[['Academic fee','academicFee'],['Hostel fee','hostelFee'],['Mess','mess'],['Internship stipend','internStipend'],['Currentness','currentness']]
};
function renderEvidenceSection(title,subtitle,data,map){
  if(!data)return card(title,subtitle,pending('This research layer has not been reconstructed for this college yet. Missing evidence is not treated as a negative signal.'));
  const fields=map.map(([lab,key])=>field(lab,data[key])).join('');
  return card(title,subtitle,`<div class="profile-section-grid">${fields}</div>${renderSources(data.sources)}`,data.confidence||'');
}

function roomProgression(h){const r=h?.roomAllocation||{};return [['1st year',r.year1],['2nd year',r.year2],['3rd year',r.year3],['Final year',r.year4],['Internship',r.internship]].filter(([v])=>v).map(([k,v])=>`${k}: ${v}`).join(' | ')||null;}
function coolingText(h){const a=[];if(h.acAllowed!==null&&h.acAllowed!==undefined)a.push(`AC ${h.acAllowed?'allowed':'not allowed'}`);if(h.coolerAllowed!==null&&h.coolerAllowed!==undefined)a.push(`Cooler ${h.coolerAllowed?'allowed':'not allowed'}`);return a.join(' · ')||null;}
function connectivityText(h){const a=[];if(h.wifi!==null&&h.wifi!==undefined)a.push(`Wi-Fi ${h.wifi?'reported':'not reported'}`);if(h.mobileNetwork)a.push(h.mobileNetwork);if(h.powerBackup!==null&&h.powerBackup!==undefined)a.push(`Power backup ${h.powerBackup?'reported':'not reported'}`);return a.join(' · ')||null;}
function recreationText(h){const a=[];[['Reading room','readingRoom'],['Common room','commonRoom'],['Gym','gym'],['Indoor games','indoorGames'],['Sports nearby','sportsNearby']].forEach(([lab,key])=>{if(h[key]===true)a.push(lab)});return a.join(' · ')||null;}
function renderHostel(id){
  const h=HOSTELS[id];
  if(!h)return card('Hostel','Room allocation, facilities, rules, cost and lived-experience evidence.',pending('A deep hostel profile has not been reconstructed for this college yet. Hostel unknowns are not treated as “No”.'));
  const rows=[
    field('Availability',`${h.boysAvailable===true?'Boys ✓':h.boysAvailable===false?'Boys —':'Boys ?'} · ${h.girlsAvailable===true?'Girls ✓':h.girlsAvailable===false?'Girls —':'Girls ?'}`),
    field('Allotment / guarantee',h.guaranteed),field('Hostel blocks',h.hostelBlocks),field('Room progression',roomProgression(h)),
    field('Bathroom',h.bathroom),field('Students per bathroom',h.studentsPerBathroom),field('Cooling policy',coolingText(h)),field('Connectivity / power',connectivityText(h)),
    field('Hostel fee',h.annualFee),field('Mess cost',h.messMonthly),field('Mess / campus food',h.messDetails||h.campusFood),field('Recreation / study',recreationText(h)),
    field('Curfew',h.curfew),field('Visitors',h.visitorRules),field('Room condition',h.roomCondition),field('Hygiene',h.hygiene)
  ].join('');
  const notes=(h.officialNotes?.length||h.studentNotes?.length)?`<div class="hostel-note-columns">${h.officialNotes?.length?`<div class="hostel-note"><h3>Official / hard facts</h3><ul>${h.officialNotes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}${h.studentNotes?.length?`<div class="hostel-note"><h3>What students report</h3><ul>${h.studentNotes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}</div>`:'';
  return card('Hostel','Room allocation, facilities, rules, cost and lived-experience evidence.',`<div class="profile-section-grid">${rows}</div>${notes}${renderSources(h.sources)}${h.lastVerified?`<div class="profile-cutoff-note">Last verified: ${esc(h.lastVerified)} · ${esc(h.researchStatus||'')}</div>`:''}`,h.confidence||'');
}


function renderCultureSignalDashboard(jc){const s=jc?.signal;if(!s)return '';const rows=[['Hostel / residence',s.hostelRisk],['Grooming / dress',s.grooming],['Social coercion',s.socialCoercion],['Physical-safety evidence',s.physicalSafety],['Administrative enforcement',s.enforcement],['Evidence mix',s.evidenceMix]].filter(([v])=>v);return `<div class="culture-signal-dashboard tone-${esc(s.tone||'insufficient')}"><div class="culture-signal-dashboard-head"><div><span>Evidence-graded current signal</span><strong>${esc(s.label||'Signal reconstructed')}</strong></div><div class="culture-signal-dashboard-meta"><b>${esc(s.confidence||'Confidence not graded')}</b><small>${esc(s.window||'Window not recorded')}</small></div></div><div class="culture-signal-dashboard-grid">${rows.map(([k,v])=>`<div><span>${esc(k)}</span><p>${esc(v)}</p></div>`).join('')}</div><div class="profile-cutoff-note">This is not a ragging/safety score. Public complaint-register entries show that a complaint was recorded and how it was classified; they do not by themselves prove the allegation or prevalence.</div></div>`;}

function renderJuniorCulture(id){
  const jc=typeof meritJuniorCulture==='function'?meritJuniorCulture(id):null;
  if(!jc)return card('Junior experience & senior culture','Informal rules, first-year hierarchy, First-90 evidence and dated incidents are kept separate from official policy.',pending('This college does not yet have a structured Junior Culture profile. Missing research is not evidence of a good or bad senior-junior culture.'));
  const f90=typeof meritJuniorFirst90==='function'?meritJuniorFirst90(id):null;
  const timeline=typeof meritFreshersTimeline==='function'?meritFreshersTimeline(id):[];
  const supported=timeline.filter(x=>x.grade!=='GAP');
  const incidentHtml=(jc.incidents||[]).length?`<div class="culture-profile-incidents"><h3>Dated incidents / proceedings</h3>${jc.incidents.map(x=>`<div class="culture-profile-incident"><strong>${esc(x.year||'Year not recorded')} · ${esc(x.label||'Incident')}</strong><p>${esc(x.detail||'')}</p></div>`).join('')}</div>`:'';
  const claims=(jc.artifactClaims||[]).length?`<ul class="culture-profile-claims">${jc.artifactClaims.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';
  const first90=f90?`<div class="culture-profile-block"><div class="culture-profile-block-head"><h3>First 90 days</h3><span class="profile-confidence">${esc(f90.evidenceLabel||f90.evidenceLevel||'Evidence reconstructed')}</span></div><div class="culture-first90-grid">${[['First weeks',f90.firstWeeks],['Hosteller vs day scholar',f90.hostellerVsDayScholar],['Boys / girls',f90.genderDifferences],['If students opt out',f90.optOut],['After freshers',f90.afterFreshers]].map(([k,v])=>`<div>${field(k,v)}</div>`).join('')}</div>${f90.sourceNote?`<div class="profile-cutoff-note">${esc(f90.sourceNote)}</div>`:''}</div>`:'';
  const timelineHtml=timeline.length?`<div class="culture-profile-block"><div class="culture-profile-block-head"><h3>Freshers experience timeline</h3><span class="profile-confidence">${supported.length}/6 phases evidenced</span></div><div class="culture-timeline-grid">${timeline.map(x=>`<div class="culture-timeline-cell ${x.grade==='GAP'?'gap':''}"><div class="culture-timeline-top"><strong>${esc(x.label)}</strong><span class="timeline-grade-v6 grade-${esc(x.grade)}">${esc(x.grade)}</span></div><p>${esc(x.summary)}</p>${x.grade!=='GAP'?`<small>Basis: ${esc(x.basis)}</small>${renderSources(x.sources,'Phase sources')}`:''}</div>`).join('')}</div><div class="profile-cutoff-note">Timeline timing is populated only where a reviewed source supports that phase. GAP means evidence missing, not that nothing happens.</div></div>`:'';
  const overview=`<div class="culture-profile-picture">${esc(jc.currentPicture||'Structured profile researched.')}</div>${renderCultureSignalDashboard(jc)}<div class="culture-profile-grid">${field('Informal rulebook / artifact',jc.artifactStatus||jc.rulebookStatus)}${field('Ground rules',jc.groundRules)}${field('Intro / PDP culture',jc.introCulture)}${field('Dress / appearance',jc.dressAppearance)}${field('Movement / common areas',jc.movementCommonAreas)}${field('Senior-junior relationship',jc.seniorJunior)}${field('Positive mentoring / support',jc.positives)}${field('Official response',jc.officialResponse)}${field('Trend',jc.trend)}${field('What remains unknown',jc.unknowns)}</div>${claims}${incidentHtml}${first90}${timelineHtml}${renderSources(jc.sources,'Junior-culture sources')}<div class="profile-cutoff-note">Last verified: ${esc(jc.lastVerified||'Not recorded')}. Anonymous/student reports are not presented as official institutional facts. Evidence strength is not a safety score.</div>`;
  return card('Junior experience & senior culture','What a fresher may actually encounter: rulebook signals, introductions, hierarchy, residence effects, opt-out evidence and how things change over time.',overview,jc.confidence||'');
}


function renderDecisionDossier(id){
  const d=typeof meritProfileIntelligence==='function'?meritProfileIntelligence(id):null;
  const q=typeof meritProfileUpgradeStatus==='function'?meritProfileUpgradeStatus(id):null;
  if(!d){
    if(q)return card('Decision dossier',`Systematic V7 refresh · Batch ${q.batch}`,pending('This deep profile is in the structured refresh queue. The existing evidence layers below remain available while the new source-led dossier is being reconstructed.'),'Queued');
    return '';
  }
  const chips=(items,kind='')=>(items||[]).map(x=>`<span class="dossier-chip ${kind}">${esc(x)}</span>`).join('');
  const facts=(d.hardFacts||[]).map(([k,v])=>`<div class="dossier-fact"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
  const why=(d.whyItMatters||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const gaps=(d.unresolved||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const body=`<div class="dossier-headline">${esc(d.headline)}</div>
    <div class="dossier-label">Best suited to</div><div class="dossier-chips">${chips(d.bestFor,'good')}</div>
    <div class="dossier-label">Trade-offs to keep in mind</div><div class="dossier-chips">${chips(d.tradeoffs,'tradeoff')}</div>
    ${facts?`<div class="dossier-facts">${facts}</div>`:''}
    <div class="dossier-two-col"><div><h3>Why these facts matter</h3><ul>${why||'<li>No decision interpretation stored yet.</li>'}</ul></div><div><h3>Still unresolved</h3><ul class="dossier-gaps">${gaps||'<li>No material unresolved field recorded.</li>'}</ul></div></div>
    ${renderSources(d.sources,'Dossier sources')}<div class="profile-cutoff-note">${esc(d.status)} · Evidence ${esc(d.evidence)} · As of ${esc(d.asOf)}. This layer is descriptive, not a score. Service-bond terms are intentionally excluded from the decision dossier.</div>`;
  return card('Decision dossier','A current, source-led synthesis of what actually differentiates this college — hard facts, implications, trade-offs and unresolved gaps.',body,`Evidence ${d.evidence}`);
}

function renderLatest(id){
  const r=typeof DEEP_RESEARCH_REFRESH!=='undefined'?DEEP_RESEARCH_REFRESH[id]:null;if(!r)return '';
  const findings=(r.findings||[]).map(x=>`<div class="latest-finding">${esc(x)}</div>`).join('');
  return card('Latest verification notes','New evidence or caveats from the most recent research pass.',`<div class="latest-findings">${findings||pending('No new findings were recorded in the latest pass.')}</div>${renderSources(r.sources,'Newest sources')}`,`Freshness ${r.freshness||'Mixed'}`);
}

function generalR1(id){const co=(typeof AIQ_CUTOFFS_2026!=='undefined'&&AIQ_CUTOFFS_2026[id])||CUTOFFS[id];return cutoffRow(co,'General')?.R1||null;}
function similarColleges(c){
  const baseR1=generalR1(c.id),baseSeats=Number(c.seats_2026||c.seats||0);
  return ALL_COLLEGES.filter(x=>x.id!==c.id).map(x=>{
    let s=0;if(x.type===c.type)s+=5;if(x.state===c.state)s+=2.5;if(x.management===c.management)s+=1;
    const seats=Number(x.seats_2026||x.seats||0);if(baseSeats&&seats)s+=Math.max(0,2-Math.abs(seats-baseSeats)/75);
    const r=generalR1(x.id);if(baseR1&&r){const d=Math.abs(Math.log(r/baseR1));s+=Math.max(0,7-d*5.2);}else if(!baseR1&&!r)s+=.4;
    return {c:x,s,r};
  }).sort((a,b)=>b.s-a.s||a.c.name.localeCompare(b.c.name)).slice(0,5);
}
function renderSimilar(c){
  return `<div class="side-card"><h3>Similar colleges</h3><div class="similar-list">${similarColleges(c).map(({c:x,r})=>`<a class="similar-item" href="${profileUrl(x.id)}"><div class="similar-name">${esc(shortName(x.name))}</div><div class="similar-meta">${esc(x.city)}, ${esc(x.state)}${r?` · R1 ${fmt(r)}`:''}</div></a>`).join('')}</div><p style="margin-top:9px">Generated from institute type, location, seat scale and historical R1 demand where available.</p></div>`;
}
function researchCoverage(id){
  const dims=[['Clinical',CLINICAL_EXPOSURE[id]],['Academics',ACADEMICS_TEACHING[id]],['Research',RESEARCH_USMLE[id]],['Hostel',HOSTELS[id]],['Campus',CAMPUS_STUDENT_LIFE[id]],['Finance',FEES_BOND_STIPEND[id]],['Junior culture',typeof meritJuniorCulture==='function'?meritJuniorCulture(id):null]];
  return dims;
}
function renderCoverage(id){
  const dims=researchCoverage(id),known=dims.filter(([v])=>!!v).length;
  return `<div class="side-card"><h3>Evidence coverage</h3><div class="coverage-list">${dims.map(([lab,v])=>`<div class="coverage-row"><span><span class="coverage-dot ${v?'yes':''}"></span>${esc(lab)}</span><strong>${v?'Researched':'Pending'}</strong></div>`).join('')}</div><p style="margin-top:10px">${known}/7 research layers currently reconstructed. Pending never means poor.</p></div>`;
}
function renderMethod(){return `<div class="side-card"><h3>How to read this profile</h3><p>Official institutional material is preferred for hard facts. Student-reported material is labelled where used. “Pending” means the field has not been reconstructed yet, not that the college lacks the facility.</p></div>`;}

function renderHero(c){
  const coverage=researchCoverage(c.id).filter(([v])=>!!v).length;const co=(typeof AIQ_CUTOFFS_2026!=='undefined'&&AIQ_CUTOFFS_2026[c.id])||CUTOFFS[c.id];const r1=cutoffRow(co,'General')?.R1;const mv=getRoundMovement(c.id,'General','R1');
  return `<div class="profile-breadcrumb"><a href="index.html">Directory</a><span>›</span><span>${esc(shortName(c.name))}</span></div>
  <section class="profile-hero"><div class="profile-hero-top"><div class="profile-title-wrap"><div class="profile-kicker"><span class="profile-tag accent">${esc(c.type)}</span>${c.established===2026?'<span class="profile-tag accent">NEW 2026</span>':''}<span class="profile-tag">Research ${coverage}/7</span></div><h2 class="profile-title">${esc(shortName(c.name))}</h2><p class="profile-location">${esc(c.city)}, ${esc(c.state)} · ${esc(c.management||'Management not recorded')}</p></div><div class="profile-actions"><button class="profile-action" id="profile-pref-btn" type="button"></button><button class="profile-action" id="profile-compare-btn" type="button"></button><a class="profile-action primary" id="profile-open-compare" href="compare.html">Open Compare →</a></div></div>
  <div class="profile-stat-grid">${[['2026 MBBS seats',c.seats_2026||c.seats],['Established',c.established],['MCC code',c.mcc_code_2026||'Not recorded'],['AIQ/Open Gen R1',r1?fmt(r1):'Not loaded'],['R1 vs 2025',mv?(mv.direction==='stronger'?'↓ ':'↑ ')+fmt(mv.magnitude)+' AIR':'Not comparable'],['Research depth',`${coverage}/7 layers`]].map(([lab,val])=>`<div class="profile-stat"><div class="label">${esc(lab)}</div><div class="value">${esc(val)}</div></div>`).join('')}</div></section>`;
}

function bindActions(c){
  const pref=$('#profile-pref-btn'),cmp=$('#profile-compare-btn'),openCmp=$('#profile-open-compare');
  function refresh(){
    const shortlist=readIds(SHORTLIST_KEY),selected=readIds(COMPARE_KEY).slice(0,4);
    const inPref=shortlist.includes(c.id),inCmp=selected.includes(c.id);
    pref.textContent=inPref?'★ In preference list':'☆ Add to preference list';pref.classList.toggle('is-active',inPref);
    cmp.textContent=inCmp?'✓ In compare':'+ Add to compare';cmp.classList.toggle('is-active',inCmp);
    const p=new URLSearchParams();if(selected.length)p.set('c',selected.join(','));p.set('cat','General');openCmp.href='compare.html?'+p.toString();openCmp.textContent=selected.length>=2?'Compare selected →':'Open Compare →';
  }
  pref.addEventListener('click',()=>{
    let shortlist=readIds(SHORTLIST_KEY),order=readIds(ORDER_KEY);const ix=shortlist.indexOf(c.id);
    if(ix>=0){shortlist=shortlist.filter(id=>id!==c.id);order=order.filter(id=>id!==c.id);showToast('Removed from preference list');}
    else{shortlist.push(c.id);if(!order.includes(c.id))order.push(c.id);showToast('Added to preference list');}
    writeIds(SHORTLIST_KEY,shortlist);writeIds(ORDER_KEY,order);refresh();
  });
  cmp.addEventListener('click',()=>{
    let selected=readIds(COMPARE_KEY).slice(0,4);const ix=selected.indexOf(c.id);
    if(ix>=0){selected=selected.filter(id=>id!==c.id);showToast('Removed from comparison');}
    else{if(selected.length>=4){showToast('You can compare up to 4 colleges');return;}selected.push(c.id);showToast('Added to comparison');}
    writeIds(COMPARE_KEY,selected);refresh();
  });
  window.addEventListener('storage',e=>{if([SHORTLIST_KEY,ORDER_KEY,COMPARE_KEY].includes(e.key))refresh();});refresh();
}

function renderProfile(c){
  const root=$('#profile-root');
  document.title=`${shortName(c.name)} — The Merit Register`;
  root.innerHTML=`${renderHero(c)}<div class="profile-layout"><div class="profile-main">${renderLatest(c.id)}${renderDecisionDossier(c.id)}${renderCutoffs(c.id)}${renderMovementCard(c.id)}${renderDemand(c.id)}${renderEvidenceSection('Clinical exposure','Hospitals, patient load, trauma, specialty breadth and MBBS learning context.',CLINICAL_EXPOSURE[c.id],FIELD_MAPS.clinical)}${renderEvidenceSection('Academics & teaching','Teaching model, attendance, internal assessment, clinical teaching and study infrastructure.',ACADEMICS_TEACHING[c.id],FIELD_MAPS.academics)}${renderEvidenceSection('Research & international pathway','Institutional research strength, undergraduate access, mentorship, funding and international context.',RESEARCH_USMLE[c.id],FIELD_MAPS.research)}${renderHostel(c.id)}${renderJuniorCulture(c.id)}${renderEvidenceSection('Campus & student life','Sports, clubs, festivals, city access, social environment and the main lifestyle trade-off.',CAMPUS_STUDENT_LIFE[c.id],FIELD_MAPS.campus)}${renderEvidenceSection('Fees & internship stipend','Current fee evidence, hostel/mess cost and internship stipend. Service-bond terms are intentionally kept out of the decision profile.',FEES_BOND_STIPEND[c.id],FIELD_MAPS.finance)}</div><aside class="profile-side">${renderCoverage(c.id)}${renderSimilar(c)}${renderMethod()}</aside></div>`;
  root.hidden=false;$('#profile-loading').hidden=true;bindActions(c);
}

function renderError(){
  const root=$('#profile-root');$('#profile-loading').hidden=true;root.hidden=false;root.innerHTML=`<div class="profile-error"><h2>College profile not found</h2><p>The link does not contain a valid college ID from the current 465-college master dataset.</p><a class="profile-action primary" href="index.html">Back to Directory →</a></div>`;
}

document.addEventListener('DOMContentLoaded',()=>{
  initTheme();
  const params=new URLSearchParams(window.location.search);
  const raw=params.get('id')||params.get('college')||params.get('c');
  const id=Number(raw);
  const c=collegeById(id);
  if(!c)return renderError();
  renderProfile(c);
  window.addEventListener('candidateprofilechange',()=>renderProfile(c));
});
