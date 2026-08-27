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



// Structured hostel intelligence. Unknown values stay null.
/* emptyHostelRecord moved to shared V8 intelligence layer. */



/* HOSTELS moved to shared V8 data layer. */



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



// Dormant legacy state-quota dataset retained for future 2026 rebuild. Not surfaced in the production UI.

/* STATE_QUOTA_DATA moved to shared V8 data layer. */



const NATIONAL_STATS = {"year": 2025, "appeared": 2209318, "qualified": 1236531, "topper": "AIR 1 - 686/720 (Mahesh Kumar, Rajasthan)", "qualifying_marks": {"General/EWS": 144, "OBC/SC/ST": 113}, "govt_aiq_final_closing_rank": {"General": 26178, "OBC": 26231, "SC": 136445, "ST": 162975}, "source": "NTA NEET UG 2025 result + MCC NEET UG 2025 Round 3 (final round) counselling data"};


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



// Latest evidence refresh and source notes.

/* DEEP_RESEARCH_REFRESH moved to shared V8 data layer. */



// Calibrated 0–100 comparison scores for researched colleges.
const DIMENSION_CALIBRATION={
  64:{clinical:100,academics:100,research:100,campus:82,networking:100},
  262:{clinical:88,academics:91,research:88,campus:97,networking:76},
  72:{clinical:98,academics:93,research:87,campus:80,networking:97},
  69:{clinical:99,academics:96,research:91,campus:84,networking:98},
  65:{clinical:95,academics:89,research:84,campus:76,networking:97},
  71:{clinical:94,academics:94,research:88,campus:85,networking:95},
  49:{clinical:95,academics:86,research:72,campus:60,networking:75},
  45:{clinical:88,academics:86,research:80,campus:78,networking:72},
  402:{clinical:99,academics:96,research:94,campus:86,networking:84},
  220:{clinical:98,academics:91,research:83,campus:85,networking:96},
  168:{clinical:90,academics:92,research:89,campus:92,networking:79},
  239:{clinical:92,academics:91,research:91,campus:91,networking:76},
  372:{clinical:90,academics:91,research:88,campus:96,networking:72},
  189:{clinical:85,academics:88,research:84,campus:93,networking:76},
  38:{clinical:89,academics:89,research:85,campus:83,networking:72},
  255:{clinical:97,academics:98,research:97,campus:92,networking:85},
  288:{clinical:97,academics:93,research:84,campus:80,networking:82},
  75:{clinical:96,academics:91,research:82,campus:78,networking:86},
  360:{clinical:95,academics:90,research:82,campus:77,networking:85},
  440:{clinical:97,academics:93,research:90,campus:76,networking:92},
  226:{clinical:99,academics:94,research:89,campus:83,networking:97},
  230:{clinical:96,academics:91,research:82,campus:78,networking:96},
  51:{clinical:94,academics:94,research:88,campus:92,networking:88},
  66:{clinical:88,academics:85,research:70,campus:79,networking:93},
  129:{clinical:91,academics:87,research:76,campus:82,networking:74},
  181:{clinical:92,academics:88,research:78,campus:80,networking:80},
  211:{clinical:94,academics:89,research:79,campus:76,networking:82},
  248:{clinical:96,academics:91,research:82,campus:78,networking:78},
  327:{clinical:95,academics:91,research:80,campus:80,networking:92},
  323:{clinical:98,academics:94,research:87,campus:81,networking:93}
};



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
/*
 * Hostel intelligence schema.
 * Keep unknown values as null. Student-reported fields must not be presented
 * as verified institutional facts. The pilot set below is intentionally
 * unpopulated until source-backed research is added.
 */




Object.keys(STATE_QUOTA_DATA).forEach(id => {
  if (!CUTOFFS[id]) CUTOFFS[id] = {};
  CUTOFFS[id].state_cutoff = STATE_QUOTA_DATA[id];
  CUTOFFS[id].state_cutoff_source = CUTOFFS[id].state_cutoff_source || (CUTOFFS[id].state_cutoff && CUTOFFS[id].state_cutoff.length ? "State counselling cutoffs from offline spreadsheet mapping" : "");
});


let shortlist = [];
let activeTypes = new Set();
let visibleCount = 50;

if(!window.storage){
  window.storage = {
    get: async (key) => ({ value: localStorage.getItem(key) }),
    set: async (key, value) => { localStorage.setItem(key, value); return { value }; },
    remove: async (key) => { localStorage.removeItem(key); return true; }
  };
}

async function loadShortlist(){
  try{
    const res = await window.storage.get('shortlist', false);
    if(res && res.value) shortlist = JSON.parse(res.value);
  }catch(e){ shortlist = []; }
}
async function saveShortlist(){
  try{ await window.storage.set('shortlist', JSON.stringify(shortlist), false); }
  catch(e){ console.error('Could not save shortlist', e); }
}
function toggleShortlist(id){
  id = Number(id);
  const idx = shortlist.indexOf(id);
  if(idx>-1) shortlist.splice(idx,1); else shortlist.push(id);
  saveShortlist();
  renderList();
}

const TYPES = [...new Set(ALL_COLLEGES.map(c=>c.type))];
const STATES = [...new Set(ALL_COLLEGES.map(c=>c.state))].sort();



function directoryCultureSourceStats(id){
  const c=typeof meritJuniorCulture==='function'?meritJuniorCulture(id):null;
  const src=Array.isArray(c?.sources)?c.sources:[];
  return {count:src.length,official:src.filter(s=>s.kind==='official').length,student:src.filter(s=>s.kind==='student').length,news:src.filter(s=>s.kind==='news').length};
}
function directoryCultureVerifiedAgeDays(id){
  const c=typeof meritJuniorCulture==='function'?meritJuniorCulture(id):null;
  const raw=String(c?.lastVerified||'').trim(); if(!raw)return null;
  const dt=new Date(raw.replace(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/,'$2 $1, $3'));
  if(Number.isNaN(dt.getTime()))return null;
  return Math.max(0,Math.floor((Date.now()-dt.getTime())/86400000));
}

function directoryResearchFlags(id){
  const clinical=typeof CLINICAL_EXPOSURE!=='undefined'&&!!CLINICAL_EXPOSURE[id];
  const academics=typeof ACADEMICS_TEACHING!=='undefined'&&!!ACADEMICS_TEACHING[id];
  const research=typeof RESEARCH_USMLE!=='undefined'&&!!RESEARCH_USMLE[id];
  const campus=typeof CAMPUS_STUDENT_LIFE!=='undefined'&&!!CAMPUS_STUDENT_LIFE[id];
  const finance=typeof FEES_BOND_STIPEND!=='undefined'&&!!FEES_BOND_STIPEND[id];
  const hostel=typeof HOSTELS!=='undefined'&&!!HOSTELS[id]&&hasHostelData(HOSTELS[id]);
  const culture=typeof meritJuniorCulture==='function'&&!!meritJuniorCulture(id);
  const timeline=typeof meritCultureEvidenceCount==='function'&&meritCultureEvidenceCount(id)>0;
  const core=[clinical,academics,research,campus,finance,hostel].filter(Boolean).length;
  return {clinical,academics,research,campus,finance,hostel,culture,timeline,core,total:core+(culture?1:0)};
}
function directoryResearchTags(id){
  const f=directoryResearchFlags(id);const bits=[];
  if(f.clinical)bits.push('<span class="research-mini on">Clinical</span>');
  if(f.research)bits.push('<span class="research-mini on">Research</span>');
  if(f.hostel)bits.push('<span class="research-mini on">Hostel</span>');
  if(f.culture)bits.push(`<span class="research-mini culture">Culture${f.timeline?' + timeline':''}</span>`);
  if(f.core>=4)bits.unshift(`<span class="research-depth-tag">${f.core}/6 deep layers</span>`);
  return bits.length?`<div class="row-evidence">${bits.join('')}</div>`:'';
}
function concise(v,n=150){const t=String(v||'').trim();return !t?'Not yet reconstructed':(t.length>n?t.slice(0,n-1)+'…':t);}
function renderDirectoryDecisionSnapshot(id){
  const cl=typeof CLINICAL_EXPOSURE!=='undefined'?CLINICAL_EXPOSURE[id]:null;
  const ac=typeof ACADEMICS_TEACHING!=='undefined'?ACADEMICS_TEACHING[id]:null;
  const re=typeof RESEARCH_USMLE!=='undefined'?RESEARCH_USMLE[id]:null;
  const ca=typeof CAMPUS_STUDENT_LIFE!=='undefined'?CAMPUS_STUDENT_LIFE[id]:null;
  const items=[];
  if(cl)items.push(['Clinical',cl.opd||cl.patientMix||cl.superspecialty]);
  if(ac)items.push(['Academics',ac.learningEnvironment||ac.teachingModel||ac.library]);
  if(re)items.push(['Research / international',re.studentOpportunities||re.researchStrength||re.internationalPathway]);
  if(ca)items.push(['Campus trade-off',ca.tradeoff||ca.campus||ca.city]);
  if(!items.length)return '';
  return `<div class="msection"><h4>Decision snapshot</h4><div class="modal-decision-grid">${items.slice(0,4).map(([k,v])=>`<div class="modal-decision-item"><div class="mk">${escapeHtml(k)}</div><div class="mv">${escapeHtml(concise(v))}</div></div>`).join('')}</div></div>`;
}
function renderDirectoryCultureSummary(id){
  if(typeof meritJuniorCulture!=='function')return '';
  const c=meritJuniorCulture(id);if(!c)return '';
  const f=typeof meritJuniorFirst90==='function'?meritJuniorFirst90(id):null;
  const phases=typeof meritCultureEvidenceCount==='function'?meritCultureEvidenceCount(id):0;
  const artifact=c.artifactStatus||c.rulebookStatus||'No public artifact verified';
  const picture=c.currentPicture||c.overallPicture||c.summary||c.currentSituation||'Junior-culture profile researched.';
  return `<div class="msection"><h4>Junior experience & senior culture</h4><div class="modal-culture-summary">${c.signal?`<span class="modal-culture-signal tone-${escapeHtml(c.signal.tone||'insufficient')}">${escapeHtml(c.signal.label)} · ${escapeHtml(c.signal.confidence||'confidence not graded')}</span><br>`:''}<strong>${escapeHtml(concise(picture,220))}</strong><br>${escapeHtml(concise(artifact,180))}${f?`<br>First-90 evidence: ${escapeHtml(f.evidenceLabel||f.evidenceLevel||'researched')}.`:''}${phases?` <strong>${phases}/6</strong> timeline phases currently evidenced.`:''}</div><div style="margin-top:8px"><a href="culture.html">Open Junior Culture evidence →</a></div></div>`;
}

const COMPARE_STORAGE_KEY='merit-register-compare-colleges';
let compareSelection=[];
function loadCompareSelection(){
  try{
    const raw=JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY)||'[]');
    compareSelection=[...new Set((Array.isArray(raw)?raw:[]).map(Number).filter(id=>ALL_COLLEGES.some(c=>c.id===id)))].slice(0,4);
  }catch(e){compareSelection=[];}
}
function saveCompareSelection(){try{localStorage.setItem(COMPARE_STORAGE_KEY,JSON.stringify(compareSelection));}catch(e){}}
function currentCompareCategory(){const el=document.getElementById('category-select');const cat=el&&el.value;return ['General','OBC','EWS','SC','ST'].includes(cat)?cat:'General';}
function compareUrl(){const p=new URLSearchParams();p.set('c',compareSelection.join(','));p.set('cat',currentCompareCategory());return 'compare.html?'+p.toString();}
function compareToast(message){const el=document.getElementById('compare-tray-toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(compareToast._t);compareToast._t=setTimeout(()=>el.classList.remove('show'),1500);}
function toggleCompareSelection(id){
  id=Number(id);const ix=compareSelection.indexOf(id);
  if(ix>=0) compareSelection.splice(ix,1);
  else{
    if(compareSelection.length>=4){compareToast('You can compare up to 4 colleges.');return;}
    compareSelection.push(id);
  }
  saveCompareSelection();renderCompareTray();syncCompareButtons();
}
function removeCompareSelection(id){const ix=compareSelection.indexOf(Number(id));if(ix>=0){compareSelection.splice(ix,1);saveCompareSelection();renderCompareTray();syncCompareButtons();}}
function clearCompareSelection(){compareSelection=[];saveCompareSelection();renderCompareTray();syncCompareButtons();}
function syncCompareButtons(){
  document.querySelectorAll('[data-compare-id]').forEach(btn=>{const active=compareSelection.includes(Number(btn.dataset.compareId));btn.classList.toggle('is-active',active);btn.textContent=active?(btn.classList.contains('modal-compare-btn')?'✓ In compare':'✓ Compare'):'+ Compare';});
  const modalBtn=document.getElementById('modal-compare-btn');if(modalBtn){const id=Number(modalBtn.closest('.modal')?.dataset?.collegeId||0);}
}
function renderCompareTray(){
  const tray=document.getElementById('compare-tray'),chips=document.getElementById('compare-tray-chips'),count=document.getElementById('compare-tray-count'),go=document.getElementById('compare-tray-go');
  if(!tray||!chips)return;
  const items=compareSelection.map(id=>ALL_COLLEGES.find(c=>c.id===id)).filter(Boolean);
  tray.classList.toggle('is-visible',items.length>0);document.body.classList.toggle('compare-tray-active',items.length>0);
  if(count)count.textContent=`${items.length} / 4 selected`;
  chips.innerHTML=items.map(c=>`<div class="compare-tray-chip"><span class="compare-tray-chip-name">${escapeHtml(formatCollegeName(c.name))}</span><button type="button" data-tray-remove="${c.id}" aria-label="Remove ${escapeHtml(formatCollegeName(c.name))}">×</button></div>`).join('');
  chips.querySelectorAll('[data-tray-remove]').forEach(b=>b.onclick=()=>removeCompareSelection(Number(b.dataset.trayRemove)));
  if(go){go.disabled=items.length<2;go.textContent=items.length<2?'Add one more college':'Compare selected →';go.onclick=()=>{if(items.length>=2)location.href=compareUrl();};}
}

function currentDirectoryCutoff(id){
  const cur = recordForYear(id,2026);
  return cur || CUTOFFS[id] || null;
}
function directoryCutoffLabel(id){
  const r26=recordForYear(id,2026);
  const r26g=categoryRoundsFromRecord(r26,'General');
  if(r26g){
    for(const r of ['R3','R2','R1']){
      const n=validRank(r26g[r]);
      if(n) return `26 ${r} ${n.toLocaleString('en-IN')}`;
    }
  }
  const r25=recordForYear(id,2025);
  const label=cutoffLabel(r25);
  return label==='—'?'—':`25 ${label}`;
}
function renderCurrentAiqStatus(){
  const el=document.getElementById('current-aiq-status'); if(!el)return;
  const meta=currentAiqMeta(),r1=meta.rounds&&meta.rounds.R1;
  const loaded=typeof AIQ_CUTOFFS_2026!=='undefined'?Object.keys(AIQ_CUTOFFS_2026).length:0;
  if(r1&&r1.published){
    const streamCount=(typeof MCC_QUOTA_STREAMS!=='undefined'?Object.values(MCC_QUOTA_STREAMS).filter(s=>s.rows>0).length:0);el.innerHTML=`<div class="current-data-strip"><span class="current-data-pill ${loaded?'live':''}">${loaded?'2026 live':'2026 provisional'}</span><strong>MCC Round 1</strong><span>${loaded?`${loaded} college AIQ/Open profiles · ${streamCount||'multiple'} quota streams kept separate.`:'Provisional result published; audited cutoff import is pending.'}</span>${!loaded?'<span>2025 remains the predictor fallback — no 2026 ranks are being guessed.</span>':''}</div>`;
  }else el.innerHTML='';
}
function syncCandidateIntoPredictor(){
  const p=getCandidateProfile(),air=document.getElementById('air-input'),cat=document.getElementById('category-select');
  if(air&&p.air&&!air.value)air.value=p.air;
  if(cat&&p.category)cat.value=p.category;
}
function init(){
  loadCompareSelection();
  renderCurrentAiqStatus();
  syncCandidateIntoPredictor();
  const trayClear=document.getElementById('compare-tray-clear');if(trayClear)trayClear.addEventListener('click',clearCompareSelection);
  renderCompareTray();
  const totalSeats = ALL_COLLEGES.reduce((sum, c) => sum + Number(c.seats || 0), 0);
  const totalSeatsEl = document.getElementById('total-seats');
  if (totalSeatsEl) totalSeatsEl.textContent = totalSeats.toLocaleString('en-IN');
  const cc=document.getElementById('college-count');if(cc)cc.textContent=ALL_COLLEGES.length.toLocaleString('en-IN');
  const sc=document.getElementById('state-count');if(sc)sc.textContent=new Set(ALL_COLLEGES.map(c=>c.state)).size.toLocaleString('en-IN');
  const curCount=document.getElementById('current-cutoff-count');if(curCount)curCount.textContent=(typeof AIQ_CUTOFFS_2026!=='undefined'?Object.keys(AIQ_CUTOFFS_2026).length:0).toLocaleString('en-IN');
  const moveCount=document.getElementById('movement-pair-count');if(moveCount)moveCount.textContent=ALL_COLLEGES.filter(c=>getRoundMovement(c.id,'General','R1')).length.toLocaleString('en-IN');
  const deepCount=document.getElementById('deep-profile-count');if(deepCount)deepCount.textContent=ALL_COLLEGES.filter(c=>directoryResearchFlags(c.id).core>=4).length.toLocaleString('en-IN');
  const cultureCount=document.getElementById('culture-profile-count');if(cultureCount)cultureCount.textContent=(typeof JUNIOR_CULTURE!=='undefined'?Object.keys(JUNIOR_CULTURE).length:0).toLocaleString('en-IN');
  const stateSel = document.getElementById('state-select');
  STATES.forEach(s=>{
    const o = document.createElement('option'); o.value=s; o.textContent=s; stateSel.appendChild(o);
  });
  const chipRow = document.getElementById('type-chips');
  TYPES.forEach(t=>{
    const c = document.createElement('span');
    c.className='chip'; c.textContent=t; c.dataset.type=t;
    c.onclick=()=>{
      if(activeTypes.has(t)){ activeTypes.delete(t); c.classList.remove('active'); }
      else { activeTypes.add(t); c.classList.add('active'); }
      visibleCount=50; renderList();
    };
    chipRow.appendChild(c);
  });
  document.getElementById('search-input').addEventListener('input', ()=>{visibleCount=50; renderList();});
  stateSel.addEventListener('change', ()=>{visibleCount=50; renderList();});
  document.getElementById('sort-select').addEventListener('change', renderList);
  document.getElementById('hostel-filter-select').addEventListener('change', ()=>{visibleCount=50; renderList();});
  document.getElementById('research-filter-select')?.addEventListener('change', ()=>{visibleCount=50; renderList();});
  ['culture-source-select','culture-coverage-select','culture-recency-select'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>{visibleCount=50;renderList();}));
  document.getElementById('load-more').addEventListener('click', ()=>{visibleCount+=50; renderList();});
  initPredictorControls();
  document.getElementById('check-btn').addEventListener('click', runChecker);
  document.getElementById('air-input').addEventListener('keydown', e=>{ if(e.key==='Enter') runChecker(); });
  document.getElementById('modal-overlay').addEventListener('click', e=>{
    if(e.target.id==='modal-overlay') closeModal();
  });
  window.addEventListener('candidateprofilechange',()=>{syncCandidateIntoPredictor();renderList();});
  renderList();
}

function getFiltered(){
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  const st = document.getElementById('state-select').value;
  let list = ALL_COLLEGES.filter(c=>{
    if(st && c.state!==st) return false;
    if(activeTypes.size>0 && !activeTypes.has(c.type)) return false;
    const hf=(document.getElementById('hostel-filter-select')||{}).value||'';
    const h=HOSTELS[c.id];
    if(hf){
      if(!h || !hasHostelData(h)) return false;
      const hp=hostelDecisionProfile(h);
      if(hf==='good' && !['Good','Excellent'].includes(hp.overall.label)) return false;
      if(hf==='single' && !hasSingleRoomReported(h)) return false;
      if(hf==='attached' && !hasAttachedBathReported(h)) return false;
      if(hf==='cooling' && !hasCoolingReported(h)) return false;
      if(hf==='freedom' && !hasLooseCurfewReported(h)) return false;
    }
    const rf=(document.getElementById('research-filter-select')||{}).value||'';
    if(rf){
      const flags=directoryResearchFlags(c.id);
      if(rf==='deep'&&flags.core<4)return false;
      if(rf==='clinical'&&!flags.clinical)return false;
      if(rf==='research'&&!flags.research)return false;
      if(rf==='hostel'&&!flags.hostel)return false;
      if(rf==='culture'&&!flags.culture)return false;
      if(rf==='timeline'&&!flags.timeline)return false;
    }
    const cs=(document.getElementById('culture-source-select')||{}).value||'';
    if(cs){
      const stats=directoryCultureSourceStats(c.id);
      if(cs==='2plus'&&stats.count<2)return false;
      if(cs==='official'&&!stats.official)return false;
      if(cs==='student'&&!stats.student)return false;
      if(cs==='news'&&!stats.news)return false;
      if(cs==='gap'&&stats.count!==0)return false;
    }
    const cc=(document.getElementById('culture-coverage-select')||{}).value||'';
    if(cc){
      const flags=directoryResearchFlags(c.id); const phases=meritCultureEvidenceCount(c.id);
      if(cc==='culture'&&!flags.culture)return false;
      if(cc==='first90'&&!meritJuniorFirst90(c.id))return false;
      if(cc==='timeline1'&&phases<1)return false;
      if(cc==='timeline3'&&phases<3)return false;
    }
    const cr=(document.getElementById('culture-recency-select')||{}).value||'';
    if(cr){
      const age=directoryCultureVerifiedAgeDays(c.id);
      if(cr==='30'&&!(Number.isFinite(age)&&age<=30))return false;
      if(cr==='90'&&!(Number.isFinite(age)&&age<=90))return false;
      if(cr==='older'&&(Number.isFinite(age)&&age<=90))return false;
    }
    const searchable = [c.name, formatCollegeName(c.name), c.city, c.state, c.type].join(' ').toLowerCase();
    if(q && !searchable.includes(q)) return false;
    return true;
  });
  const sort = document.getElementById('sort-select').value;
  if(sort==='seats-desc') list.sort((a,b)=>b.seats-a.seats);
  else if(sort==='estd-asc') list.sort((a,b)=>a.established-b.established);
  else if(sort==='estd-desc') list.sort((a,b)=>b.established-a.established);
  else if(sort==='cutoff-first') list.sort((a,b)=>(currentDirectoryCutoff(b.id)?1:0)-(currentDirectoryCutoff(a.id)?1:0));
  else if(sort==='research-depth') list.sort((a,b)=>directoryResearchFlags(b.id).total-directoryResearchFlags(a.id).total||directoryResearchFlags(b.id).core-directoryResearchFlags(a.id).core||a.name.localeCompare(b.name));
  else if(sort==='movement-stronger') list.sort((a,b)=>{const ma=getRoundMovement(a.id,'General','R1'),mb=getRoundMovement(b.id,'General','R1');if(ma&&mb)return ma.delta-mb.delta||a.name.localeCompare(b.name);if(ma)return -1;if(mb)return 1;return a.name.localeCompare(b.name);});
  else if(sort==='movement-softer') list.sort((a,b)=>{const ma=getRoundMovement(a.id,'General','R1'),mb=getRoundMovement(b.id,'General','R1');if(ma&&mb)return mb.delta-ma.delta||a.name.localeCompare(b.name);if(ma)return -1;if(mb)return 1;return a.name.localeCompare(b.name);});
  else if(sort==='hostel-quality') list.sort((a,b)=>{
    const ha=HOSTELS[a.id]&&hasHostelData(HOSTELS[a.id])?hostelDecisionProfile(HOSTELS[a.id]).overall.score:null;
    const hb=HOSTELS[b.id]&&hasHostelData(HOSTELS[b.id])?hostelDecisionProfile(HOSTELS[b.id]).overall.score:null;
    if(Number.isFinite(hb)&&Number.isFinite(ha)) return hb-ha || a.name.localeCompare(b.name);
    if(Number.isFinite(hb)) return 1;
    if(Number.isFinite(ha)) return -1;
    return a.name.localeCompare(b.name);
  });
  else list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}

function cutoffLabel(cutoff){
  if(!cutoff) return '—';

  const fmt = value => Number(value).toLocaleString('en-IN');

  // Directory policy: R2 is the preferred realistic reference.
  // If R2 is unavailable, use R1; only if both are unavailable, use R3.
  if(cutoff.category_rounds && cutoff.category_rounds.General){
    const rounds = cutoff.category_rounds.General;
    if(Number.isFinite(rounds.R2)) return 'R2 ' + fmt(rounds.R2);
    if(Number.isFinite(rounds.R1)) return 'R1 ' + fmt(rounds.R1);
    if(Number.isFinite(rounds.R3)) return 'R3 ' + fmt(rounds.R3);
    return '—';
  }

  if(cutoff.rounds){
    if(Number.isFinite(cutoff.rounds.R2)) return 'R2 ' + fmt(cutoff.rounds.R2);
    if(Number.isFinite(cutoff.rounds.R1)) return 'R1 ' + fmt(cutoff.rounds.R1);
    if(Number.isFinite(cutoff.rounds.R3)) return 'R3 ' + fmt(cutoff.rounds.R3);
    return '—';
  }

  return '—';
}

function formatCollegeName(name){
  if(!name) return '';
  return name.replace(/^All India Institute of Medical Sciences/i, 'AIIMS');
}

function renderList(){
  const list = getFiltered();
  document.getElementById('result-count').textContent = `${list.length} college${list.length===1?'':'s'} matching`;
  const container = document.getElementById('college-list');
  container.innerHTML='';
  const slice = list.slice(0, visibleCount);
  slice.forEach(c=>{
    const row = document.createElement('div');
    row.className='college-row';
    const starred = shortlist.includes(c.id);
    const cutoff = currentDirectoryCutoff(c.id);
    const cp=getCandidateProfile();
    const reach=cp.air?getCollegeReach(c.id,cp.air,cp.category):null;
    const move26=getRoundMovement(c.id,'General','R1');
    row.innerHTML = `
      <button class="star-btn ${starred?'active':''}" data-id="${c.id}" title="Shortlist">${starred?'&#9733;':'&#9734;'}</button>
      <div class="row-main">
        <div class="name"><a class="profile-inline-link" href="college.html?id=${c.id}">${escapeHtml(formatCollegeName(c.name))}</a></div>
        <div class="row-subline">
          <div class="loc">${escapeHtml(c.city)}, ${escapeHtml(c.state)} &middot; Est. ${c.established}${c.established===2026 ? ' &middot; <span class="new-2026-tag">NEW 2026</span>' : ''}${HOSTELS[c.id]&&hasHostelData(HOSTELS[c.id]) ? ' <span class="hostel-data-tag">HOSTEL PROFILE</span>' : ''}</div>${reach?`<div class="directory-reach-line"><span class="reach-badge ${escapeHtml(reach.state)}">${escapeHtml(reachShortText(reach))}</span></div>`:''}
          <button class="compare-mini-btn ${compareSelection.includes(c.id)?'is-active':''}" data-compare-id="${c.id}" type="button">${compareSelection.includes(c.id)?'✓ Compare':'+ Compare'}</button>
        </div>
        ${directoryResearchTags(c.id)}
      </div>
      <span class="type-badge ${c.type}">${c.type}</span>
      <span class="seats-col">${c.seats}</span>
      <span class="cutoff-col ${cutoff?'has-data':''}"><span>${directoryCutoffLabel(c.id)}</span>${move26?`<small class="cutoff-movement ${move26.direction}">${escapeHtml(movementText(move26))}</small>`:''}</span>
    `;
    row.querySelector('.star-btn').addEventListener('click', (e)=>{ e.stopPropagation(); toggleShortlist(c.id); });
    const compareBtn=row.querySelector('[data-compare-id]');
    if(compareBtn) compareBtn.addEventListener('click',(e)=>{e.stopPropagation();toggleCompareSelection(c.id);});
    row.addEventListener('click', (e)=>{ if(e.target.closest('a,button')) return; location.href=`college.html?id=${c.id}`; });
    container.appendChild(row);
  });
  document.getElementById('load-more').style.display = list.length>visibleCount ? 'block':'none';
}

function cleanStateCategory(category){
  return String(category || '')
    .replace(/\s*\((?:R1|R2|R3|Mop-?Up|Stray Vacancy|Special Stray)\)\s*$/i, '')
    .trim();
}

function roundPriority(round){
  const key = String(round || '').trim().toLowerCase();
  const order = {
    'r1': 1,
    'round 1': 1,
    'r2': 2,
    'round 2': 2,
    'r3': 3,
    'round 3': 3,
    'mop-up': 4,
    'mopup': 4,
    'mop up': 4,
    'stray vacancy': 5,
    'stray': 5,
    'special stray': 6,
    'special stray vacancy': 6,
    'final': 90
  };
  return order[key] || 80;
}

function displayRound(round){
  const key = String(round || '').trim();
  if(/^round\s*1$/i.test(key)) return 'R1';
  if(/^round\s*2$/i.test(key)) return 'R2';
  if(/^round\s*3$/i.test(key)) return 'R3';
  return key || 'Round';
}

function getStateQuotaStates(){
  const states = new Set();
  Object.keys(STATE_QUOTA_DATA).forEach(id=>{
    const college = ALL_COLLEGES.find(c=>c.id===Number(id));
    if(college && Array.isArray(STATE_QUOTA_DATA[id]) && STATE_QUOTA_DATA[id].length) states.add(college.state);
  });
  return [...states].sort();
}

function getStateQuotaCategories(state){
  const categories = new Set();
  Object.keys(STATE_QUOTA_DATA).forEach(id=>{
    const college = ALL_COLLEGES.find(c=>c.id===Number(id));
    if(!college || college.state!==state) return;
    normalizeStateQuotaRows(STATE_QUOTA_DATA[id]).forEach(row=>{
      const category = cleanStateCategory(row.category);
      if(category) categories.add(category);
    });
  });
  const preferred = ['UR','General','OBC','OBC/State BC','OBC/State EBC','EWS','SC','ST'];
  return [...categories].sort((a,b)=>{
    const ai=preferred.indexOf(a), bi=preferred.indexOf(b);
    if(ai!==-1 || bi!==-1) return (ai===-1?999:ai)-(bi===-1?999:bi);
    return a.localeCompare(b);
  });
}

function getActiveAiqPredictorDataset(){
  // Drop-in hook for 2026: once AIQ_CUTOFFS_2026 is injected, the predictor
  // automatically prefers it for AIQ/Open display. Quota-aware prediction uses the separate stream dataset; R2/R3 remain pending until imported.
  if(typeof AIQ_CUTOFFS_2026 !== 'undefined' && AIQ_CUTOFFS_2026 && Object.keys(AIQ_CUTOFFS_2026).length){
    return {year:2026, data:AIQ_CUTOFFS_2026, label:'MCC AIQ 2026', current:true};
  }
  return {year:2025, data:CUTOFFS, label:'MCC AIQ 2025 historical', current:false};
}

function populatePredictorFilters(){
  const stateSelect=document.getElementById('predictor-filter-state');
  const typeSelect=document.getElementById('predictor-filter-type');
  if(stateSelect){
    const states=[...new Set(ALL_COLLEGES.map(c=>c.state).filter(Boolean))].sort();
    stateSelect.innerHTML='<option value="">All states</option>'+states.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
  }
  if(typeSelect){
    const types=[...new Set(ALL_COLLEGES.map(c=>c.type).filter(Boolean))].sort();
    typeSelect.innerHTML='<option value="">All types</option>'+types.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
  }
}

function initPredictorControls(){
  populatePredictorFilters();
  const dataset=getActiveAiqPredictorDataset();
  const note=document.getElementById('predictor-dataset-note');
  if(note){const qm=currentQuotaMeta();const streams=(typeof MCC_QUOTA_STREAMS!=='undefined'?Object.values(MCC_QUOTA_STREAMS).filter(s=>s.rows>0).length:0);note.textContent=hasQuotaStreamData()?`2026 MCC R1 provisional · ${streams} separate MBBS quota streams loaded · later rounds pending.`:(dataset.year===2026?`${dataset.label} current imported rounds; later rounds are pending.`:`${dataset.label} reference · 2026 provisional cutoff import pending`);}
  ['predictor-filter-state','predictor-filter-type','predictor-filter-status','predictor-sort'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.addEventListener('change',()=>{
      const air=parseInt(document.getElementById('air-input').value,10);
      if(air>0) runChecker();
    });
  });
  const category=document.getElementById('category-select');
  if(category) category.addEventListener('change',()=>{
    const air=parseInt(document.getElementById('air-input').value,10);
    if(air>0) runChecker();
    else document.getElementById('checker-results').innerHTML='';
  });
}

function earliestAiqReach(cutoff, category, air){
  if(!cutoff) return null;
  let rounds = null;
  let confidence = cutoff.categories_confidence || cutoff.confidence || 'moderate';
  if(cutoff.category_rounds && cutoff.category_rounds[category]){
    rounds = cutoff.category_rounds[category];
  } else if(category==='General' && cutoff.rounds){
    rounds = cutoff.rounds;
  }
  if(!rounds) return null;
  for(const round of ['R1','R2','R3']){
    const rawClosing = rounds[round];
    const closing = (rawClosing === null || rawClosing === undefined || rawClosing === '') ? NaN : Number(rawClosing);
    if(Number.isFinite(closing) && closing > 0 && air<=closing){
      return {closing, basisRound:round, conf:confidence};
    }
  }
  return null;
}

function earliestStateReach(stateRows, category, air){
  const rows = normalizeStateQuotaRows(stateRows)
    .filter(row=>cleanStateCategory(row.category)===category)
    .map(row=>({...row, closingNum:Number(row.closing)}))
    .filter(row=>Number.isFinite(row.closingNum));

  if(!rows.length) return null;

  // Final-only records can confirm that a college was reachable, but cannot establish
  // the first round. Prefer actual round-wise rows whenever they exist.
  const roundWise = rows.filter(row=>roundPriority(row.round)<80);
  const candidates = roundWise.length ? roundWise : rows.filter(row=>String(row.round).toLowerCase()==='final');
  candidates.sort((a,b)=>roundPriority(a.round)-roundPriority(b.round) || a.closingNum-b.closingNum);
  for(const row of candidates){
    if(air<=row.closingNum){
      return {
        closing: row.closingNum,
        basisRound: displayRound(row.round),
        conf: row.confidence || 'moderate',
        finalOnly: roundPriority(row.round)>=80
      };
    }
  }
  return null;
}

function aiqDemandSortRank(cutoff, category){
  if(!cutoff) return Number.POSITIVE_INFINITY;
  let rounds = null;
  if(cutoff.category_rounds && cutoff.category_rounds[category]){
    rounds = cutoff.category_rounds[category];
  } else if(category==='General' && cutoff.rounds){
    rounds = cutoff.rounds;
  }
  if(!rounds) return Number.POSITIVE_INFINITY;

  // IMPORTANT: null/blank values are missing data, not rank 0.
  // Number(null) === 0 in JavaScript, which previously promoted colleges with
  // missing R1 data to the very top of the predictor. Only positive ranks count.
  const validRank = value => {
    if(value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  // R1 is the primary demand signal. Missing R1 must NOT be numerically mixed
  // with verified R1 colleges; those entries are deliberately pushed down.
  const r1 = validRank(rounds.R1);
  if(r1 !== null) return r1;
  return Number.POSITIVE_INFINITY;
}

function stateDemandSortRank(stateRows, category){
  const rows = normalizeStateQuotaRows(stateRows)
    .filter(row=>cleanStateCategory(row.category)===category)
    .map(row=>({...row, closingNum:Number(row.closing)}))
    .filter(row=>Number.isFinite(row.closingNum));
  if(!rows.length) return Number.POSITIVE_INFINITY;

  // R1 is the primary demand signal; lower closing AIR = more competitive college.
  const r1Rows = rows.filter(row=>String(row.round).toUpperCase()==='R1');
  if(r1Rows.length) return Math.min(...r1Rows.map(row=>row.closingNum));

  // If R1 is unavailable, use the earliest actual round on record, never a later
  // round merely because that is when this particular user's AIR first qualifies.
  const roundWise = rows.filter(row=>roundPriority(row.round)<80);
  if(roundWise.length){
    const earliestPriority = Math.min(...roundWise.map(row=>roundPriority(row.round)));
    return Math.min(...roundWise.filter(row=>roundPriority(row.round)===earliestPriority).map(row=>row.closingNum));
  }

  const finals = rows.filter(row=>String(row.round).toLowerCase()==='final');
  return finals.length ? Math.min(...finals.map(row=>row.closingNum)) : Number.POSITIVE_INFINITY;
}

function classifyHistoricalReach(result, air){
  const closing = Number(result.closing);
  const margin = Number.isFinite(closing) ? closing - air : 0;
  const ratio = Number.isFinite(closing) && closing>0 ? margin / closing : 0;
  const round = String(result.basisRound || '').toUpperCase();

  // Final-only data can confirm historical reach but cannot establish an early-round safety margin.
  if(result.finalOnly) return {label:'Reach', className:'reach', margin, ratio};

  if(round==='R1') {
    if(ratio >= 0.10) return {label:'Safe', className:'safe', margin, ratio};
    if(ratio >= 0.03) return {label:'Competitive', className:'competitive', margin, ratio};
    return {label:'Reach', className:'reach', margin, ratio};
  }
  if(round==='R2') return {label:'Competitive', className:'competitive', margin, ratio};
  return {label:'Reach', className:'reach', margin, ratio};
}

function formatRankMargin(margin){
  if(!Number.isFinite(margin)) return '';
  if(margin===0) return 'at historical cutoff';
  if(margin>0) return `+${Math.round(margin).toLocaleString('en-IN')} rank cushion`;
  return `${Math.abs(Math.round(margin)).toLocaleString('en-IN')} ranks short`;
}

function routeRoundPriority(route){
  if(!route) return 999;
  if(route.finalOnly) return 90;
  return roundPriority(route.basisRound);
}

function chooseBestRoute(routes, air){
  const valid=routes.filter(Boolean);
  if(!valid.length) return null;
  return valid.slice().sort((a,b)=>{
    const rp=routeRoundPriority(a)-routeRoundPriority(b);
    if(rp!==0) return rp;
    const am=Number(a.closing)-air, bm=Number(b.closing)-air;
    if(bm!==am) return bm-am; // larger cushion first when same round
    return Number(a.closing)-Number(b.closing);
  })[0];
}


function predictorDemandRank(collegeId, category){
  const rec=recordForYear(collegeId,2026);
  const rounds=categoryRoundsFromRecord(rec,category);
  const r1=validRank(rounds&&rounds.R1);
  return r1 || Number.POSITIVE_INFINITY;
}

function routeLine(route, air){
  const reached=route.state==='reached';
  const amount=Math.abs(route.cutoff-air);
  const marginText=reached?`+${amount.toLocaleString('en-IN')} cushion`:`${amount.toLocaleString('en-IN')} short`;
  return `<span class="quota-route-pill ${reached?'reached':'missed-current'}">${escapeHtml(route.quotaLabel)} · R1 ${route.cutoff.toLocaleString('en-IN')} · ${escapeHtml(marginText)}</span>`;
}

function renderTopMatches(eligible, air){
  const top=eligible.slice(0,8);
  const body=top.map((e,i)=>{
    const best=e.best;
    return `<div class="top-match-row">
      <span class="top-match-index">${i+1}</span>
      <a class="top-match-open" href="college.html?id=${e.college.id}">
        <span class="top-match-name">${escapeHtml(formatCollegeName(e.college.name))}</span>
        <span class="top-match-loc">${escapeHtml(e.college.city)}, ${escapeHtml(e.college.state)}</span>
        <span class="quota-route-stack">${e.routes.map(r=>routeLine(r,air)).join('')}</span>
      </a>
      <span class="top-match-side">
        <span class="reach-status ${e.band.className}">${escapeHtml(e.band.label)}</span>
        <span class="top-match-round">Best: ${escapeHtml(best.quotaLabel)} · R1 ${best.cutoff.toLocaleString('en-IN')}</span>
      </span>
      <button class="compare-mini-btn ${compareSelection.includes(e.college.id)?'is-active':''}" type="button" data-compare-id="${e.college.id}">${compareSelection.includes(e.college.id)?'✓ Compare':'+ Compare'}</button>
    </div>`;
  }).join('');
  return `<div class="top-matches">
    <div class="top-matches-head">
      <div><div class="top-matches-title">Top matches</div><div class="top-matches-sub">Colleges reached in 2026 R1 through at least one quota stream enabled in your profile. Routes are never merged.</div></div>
    </div>
    ${body}
  </div>`;
}

function renderFullPredictorResults(eligible, air){
  return eligible.map(e=>{
    const best=e.best;
    return `
    <div class="result-row" data-college-id="${e.college.id}">
      <div class="result-main">
        <a class="result-name" href="college.html?id=${e.college.id}">${escapeHtml(formatCollegeName(e.college.name))}</a>
        <div class="result-loc">${escapeHtml(e.college.city)}, ${escapeHtml(e.college.state)}</div>
        <div class="route-stack"><div class="quota-route-stack">${e.routes.map(r=>routeLine(r,air)).join('')}</div></div>
      </div>
      <div class="result-side">
        <span class="reach-status ${e.band.className}">${escapeHtml(e.band.label)}</span>
        <div class="result-cutoff"><div class="result-rank">Best: ${escapeHtml(best.quotaLabel)} ${best.cutoff.toLocaleString('en-IN')}</div></div>
        <button class="compare-mini-btn ${compareSelection.includes(e.college.id)?'is-active':''}" type="button" data-compare-id="${e.college.id}">${compareSelection.includes(e.college.id)?'✓ Compare':'+ Compare'}</button>
      </div>
    </div>`;
  }).join('');
}

function runChecker(){
  const air=parseInt(document.getElementById('air-input').value,10);
  const category=document.getElementById('category-select').value;
  const resultsEl=document.getElementById('checker-results');
  const stateFilter=(document.getElementById('predictor-filter-state')||{}).value||'';
  const typeFilter=(document.getElementById('predictor-filter-type')||{}).value||'';
  const statusFilter=(document.getElementById('predictor-filter-status')||{}).value||'';
  const sortMode=(document.getElementById('predictor-sort')||{}).value||'demand';

  if(!air || air<1){
    resultsEl.innerHTML='<p class="empty-note">Enter a valid AIR to check.</p>';
    return;
  }
  const existingProfile=getCandidateProfile();
  const profile=saveCandidateProfile({air,category,domicile:existingProfile.domicile,eligibilities:existingProfile.eligibilities});

  let eligible=[];
  ALL_COLLEGES.forEach(college=>{
    const routes=quotaRouteStatuses(college.id,air,category,profile);
    if(!routes.length) return;
    const reached=routes.filter(r=>r.state==='reached');
    if(!reached.length) return;
    // Best route is the reachable route with the largest current cutoff/cushion.
    reached.sort((a,b)=>b.cutoff-a.cutoff);
    const best=reached[0];
    const band=choicePlanningBand(best);
    eligible.push({college,routes,best,band,demandSortRank:predictorDemandRank(college.id,category)});
  });

  eligible=eligible.filter(e=>(!stateFilter||e.college.state===stateFilter) && (!typeFilter||e.college.type===typeFilter) && (!statusFilter||e.band.label===statusFilter));

  const bandScore=e=>({Safety:0,Likely:1,Competitive:2,Dream:3,Unknown:9}[e.band.label]??9);
  eligible.sort((a,b)=>{
    if(sortMode==='safety'){
      const s=bandScore(a)-bandScore(b); if(s) return s;
      const cushion=(b.best.cutoff-air)-(a.best.cutoff-air); if(cushion) return cushion;
    } else if(sortMode==='round'){
      // Only R1 is currently published. Within R1, sort by best cushion.
      const cushion=(b.best.cutoff-air)-(a.best.cutoff-air); if(cushion) return cushion;
    } else if(sortMode==='name'){
      return a.college.name.localeCompare(b.college.name);
    } else {
      const ad=a.demandSortRank,bd=b.demandSortRank;
      if(Number.isFinite(ad)&&Number.isFinite(bd)&&ad!==bd) return ad-bd;
      if(Number.isFinite(ad)!==Number.isFinite(bd)) return Number.isFinite(ad)?-1:1;
      const cushion=(b.best.cutoff-air)-(a.best.cutoff-air); if(cushion) return cushion;
    }
    return a.college.name.localeCompare(b.college.name);
  });

  if(!eligible.length){
    const extras=profileExtraEligibilityLabels(profile);
    resultsEl.innerHTML=`<p class="empty-note">No college in the loaded 2026 R1 quota streams is currently reached for AIR ${air.toLocaleString('en-IN')}, ${escapeHtml(category)}, and the selected filters${extras.length?` with ${escapeHtml(extras.join(', '))} enabled`:''}. Later rounds are still pending.</p>`;
    return;
  }

  const sortLabel={demand:'AIQ/Open R1 demand',safety:'planning band',round:'R1 cushion',name:'college name'}[sortMode]||'AIQ/Open R1 demand';
  const allId='predictor-all-results';
  const toggleId='predictor-show-all';
  const extras=profileExtraEligibilityLabels(profile);
  resultsEl.innerHTML=
    `<div class="simple-results-head">
      <div class="simple-results-title">${eligible.length} college${eligible.length===1?'':'s'} reached in 2026 R1 for AIR ${air.toLocaleString('en-IN')}</div>
      <div class="simple-results-sub">${escapeHtml(category)} · AIQ/Open${extras.length?' + '+escapeHtml(extras.join(', ')):''}${sortMode!=='demand'?' · sorted by '+escapeHtml(sortLabel):''}</div>
    </div>`+
    renderTopMatches(eligible,air)+
    (eligible.length>8 ? `<button class="show-all-colleges" id="${toggleId}" type="button" aria-expanded="false">Show all ${eligible.length} reached colleges</button>` : '')+
    `<div class="all-predictor-results ${eligible.length>8?'is-collapsed':''}" id="${allId}">${renderFullPredictorResults(eligible,air)}</div>`;

  const toggle=document.getElementById(toggleId);
  const allResults=document.getElementById(allId);
  if(toggle && allResults){
    toggle.addEventListener('click',()=>{
      const collapsed=allResults.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.textContent=collapsed ? `Show all ${eligible.length} reached colleges` : 'Hide full list';
    });
  }

  resultsEl.querySelectorAll('[data-compare-id]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{e.stopPropagation();toggleCompareSelection(Number(btn.dataset.compareId));});
  });
  resultsEl.querySelectorAll('.result-row').forEach(row=>{
    row.addEventListener('dblclick',e=>{if(!e.target.closest('[data-compare-id]'))openModal(Number(row.dataset.collegeId));});
  });
}

function normalizeStateQuotaRows(stateCutoff){
  if(!stateCutoff) return [];
  const entries = Array.isArray(stateCutoff) ? stateCutoff : [stateCutoff];
  return entries.flatMap(item => {
    if (Array.isArray(item)) return item;
    if (!item || typeof item !== 'object') return [];
    if (item.authority || item.year || item.category || item.closing || item.rank || item.round || item.air) {
      return [{
        authority: item.authority || item.authority_name || item.state || item.label || 'State',
        year: item.year || item.session || item.cycle || 2025,
        category: item.category || item.cat || item.category_name || 'General',
        round: item.round || item.round_name || item.round_standardised || 'Final',
        closing: item.closing || item.rank || item.final_closing || item.air || item.value || item.closing_air || '-',
        confidence: item.confidence || item.conf || 'High'
      }];
    }
    return Object.entries(item).map(([key, value]) => ({
      authority: value && typeof value === 'object' ? (value.authority || value.authority_name || key) : key,
      year: value && typeof value === 'object' ? (value.year || value.session || value.cycle || 2025) : 2025,
      category: value && typeof value === 'object' ? (value.category || value.cat || value.category_name || 'General') : 'General',
      round: value && typeof value === 'object' ? (value.round || value.round_name || value.round_standardised || 'Final') : 'Final',
      closing: value && typeof value === 'object' ? (value.closing || value.rank || value.final_closing || value.air || value.value || value.closing_air || '-') : value,
      confidence: value && typeof value === 'object' ? (value.confidence || value.conf || 'High') : 'High'
    }));
  });
}

function renderAiqCategorySelector(cutoff, selectedCategory){
  if(!cutoff) return '<div class="pending-note">No AIQ data for this college yet.</div>';

  if(cutoff.category_rounds){
    const categories = ['General','OBC','EWS','SC','ST'].filter(c => cutoff.category_rounds[c]);
    const category = categories.includes(selectedCategory) ? selectedCategory : (categories[0] || 'General');
    const rounds = cutoff.category_rounds[category] || {};
    const fmt = value => Number.isFinite(value) ? Number(value).toLocaleString('en-IN') : '&mdash;';
    const anyLoaded = ['R1','R2','R3'].some(r => Number.isFinite(rounds[r]));

    return `
      <div class="category-filter-row" style="margin-bottom:10px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <label for="aiq-category-select" style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-soft); font-weight:600;">Category</label>
        <select id="aiq-category-select" style="border:1px solid var(--hairline); background:var(--input-bg); color:var(--ink); padding:8px 10px; border-radius:9px; min-width:140px;">
          ${categories.map(opt => `<option value="${opt}" ${opt===category?'selected':''}>${escapeHtml(opt)}</option>`).join('')}
        </select>
        <span class="conf-badge moderate" style="margin-left:0;">Official MCC</span>
      </div>
      ${anyLoaded ? `
      <table class="cutoff-table">
        <thead><tr><th>Category</th><th>Round 1</th><th>Round 2</th><th>Round 3</th></tr></thead>
        <tbody><tr>
          <td>${escapeHtml(category)}</td>
          <td class="tabular">${fmt(rounds.R1)}</td>
          <td class="tabular">${fmt(rounds.R2)}</td>
          <td class="tabular">${fmt(rounds.R3)}</td>
        </tr></tbody>
      </table>
      <p class="checker-note"><strong>Closing AIR for fresh/upgraded allotments in that round.</strong> A dash means no allotment for this college + category was recorded in that round. Source: ${escapeHtml(cutoff.source || 'Official MCC NEET UG 2025 final allotment results')}.</p>
      ` : '<div class="pending-note">No allotment was recorded for this category in R1, R2 or R3.</div>'}
    `;
  }

  const categories = cutoff.categories_final_round ? Object.keys(cutoff.categories_final_round).filter(k => cutoff.categories_final_round[k] !== undefined && cutoff.categories_final_round[k] !== null) : ['General'];
  const category = categories.includes(selectedCategory) ? selectedCategory : (categories[0] || 'General');

  if (cutoff.rounds && category === 'General') {
    return `
      <div class="category-filter-row" style="margin-bottom:10px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <label for="aiq-category-select" style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-soft); font-weight:600;">Category</label>
        <select id="aiq-category-select" style="border:1px solid var(--hairline); background:var(--input-bg); color:var(--ink); padding:8px 10px; border-radius:9px; min-width:140px;">
          ${['General', ...categories.filter(c => c !== 'General')].map(opt => `<option value="${opt}" ${opt===category?'selected':''}>${escapeHtml(opt)}</option>`).join('')}
        </select>
      </div>
      <table class="cutoff-table">
        <thead><tr><th>Category / Year</th><th>R1</th><th>R2</th><th>R3</th></tr></thead>
        <tbody><tr>
          <td>${cutoff.category ?? 'General (UR)'}, ${cutoff.year}</td>
          <td>${cutoff.rounds.R1 ?? '&mdash;'}</td>
          <td>${cutoff.rounds.R2 ?? '&mdash;'}</td>
          <td>${cutoff.rounds.R3 ?? '&mdash;'}</td>
        </tr></tbody>
      </table>
      <p class="checker-note">Closing All India Rank. Source: ${escapeHtml(cutoff.source)}.</p>
    `;
  }

  if (cutoff.categories_final_round && cutoff.categories_final_round[category] !== undefined) {
    return `
      <div class="category-filter-row" style="margin-bottom:10px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <label for="aiq-category-select" style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-soft); font-weight:600;">Category</label>
        <select id="aiq-category-select" style="border:1px solid var(--hairline); background:var(--input-bg); color:var(--ink); padding:8px 10px; border-radius:9px; min-width:140px;">
          ${categories.map(opt => `<option value="${opt}" ${opt===category?'selected':''}>${escapeHtml(opt)}</option>`).join('')}
        </select>
      </div>
      <table class="cutoff-table">
        <thead><tr><th>Category</th><th>Closing AIR</th></tr></thead>
        <tbody><tr><td>${escapeHtml(category)}</td><td class="tabular">${Number(cutoff.categories_final_round[category]).toLocaleString('en-IN')}</td></tr></tbody>
      </table>
      <p class="checker-note">2025, closing AIR. Source: ${escapeHtml(cutoff.categories_source)}.</p>
      ${cutoff.categories_confidence==='low' ? `<p class="checker-note" style="color:var(--stamp-dark);">Single-sourced &mdash; treat as directional only.</p>` : ''}
    `;
  }

  return '<div class="pending-note">No category-wise AIQ data is available for this college yet.</div>';
}

function normalizeStateCategoryName(category){
  const raw = String(category || 'General').trim();
  if(!raw) return 'General';
  return raw.replace(/\s*\((?:R\d+|Round\s+\d+|Mop[- ]?Up|Special Stray|Stray Vacancy|Stray|.*Vacancy|.*Counselling.*)\)\s*$/i, '').trim() || 'General';
}

function renderStateQuotaTable(stateCutoff, selectedCategory){
  if(!stateCutoff) return '<div class="pending-note">Not yet populated.</div>';

  const rows = normalizeStateQuotaRows(stateCutoff).map(row => ({
    ...row,
    categoryKey: normalizeStateCategoryName(row.category),
    round: row.round || 'Final'
  }));

  const categories = [...new Set(rows.map(row => row.categoryKey).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const defaultUR = categories.includes('UR') ? 'UR' : categories.includes('General') ? 'General' : (categories[0] || '');
  const normalizedSelection = selectedCategory ? normalizeStateCategoryName(selectedCategory) : '';
  const category = categories.includes(normalizedSelection) ? normalizedSelection : defaultUR;
  const filtered = category ? rows.filter(row => row.categoryKey === category) : rows;

  if (!rows.length || !filtered.length) return '<div class="pending-note">State quota data is available but not yet formatted for this college.</div>';

  const selector = `
    <div class="category-filter-row" style="margin-bottom:12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
      <label for="state-category-select" style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-soft); font-weight:600;">Category</label>
      <select id="state-category-select" style="border:1px solid var(--hairline); background:var(--paper); padding:7px 10px; border-radius:2px; min-width:160px;">
        ${categories.map(opt => `<option value="${escapeHtml(opt)}" ${opt===category?'selected':''}>${escapeHtml(opt)}</option>`).join('')}
      </select>
    </div>
  `;

  const rowsHtml = filtered.map(row => `
    <tr>
      <td>${escapeHtml(String(row.authority))}</td>
      <td>${escapeHtml(String(row.year))}</td>
      <td>${escapeHtml(String(row.round))}</td>
      <td class="tabular">${String(row.closing) === '-' ? '&mdash;' : Number(row.closing).toLocaleString('en-IN')}</td>
      <td>${row.source_type === 'Archived UPNEET institute-wise allotment'
        ? '<span class="conf-badge moderate" style="margin-left:0;">Primary archive</span>'
        : row.source_type === 'Cross-verified final closing only'
          ? '<span class="conf-badge low" style="margin-left:0;">Final-only</span>'
          : row.source_type === 'Unresolved'
            ? '<span class="conf-badge low" style="margin-left:0;">Unresolved</span>'
            : '<span class="conf-badge low" style="margin-left:0;">Cross-verified</span>'}</td>
    </tr>
  `).join('');

  const sourceRows = rows.filter(row => row.source);
  const sourceText = sourceRows.length ? sourceRows[0].source : '';
  const sourceUrl = sourceRows.length ? sourceRows[0].source_url : '';

  return `
    ${selector}
    ${rows.some(r => String(r.authority || '').startsWith('DGME Uttar Pradesh')) ? `<p class="checker-note"><strong>UP reconstruction rule:</strong> ordinary vertical category seats only (UROP/BCOP/EWOP/SCOP/STOP). Horizontal/special codes are excluded.<br><strong>Evidence:</strong> Primary archive = candidate-level UPNEET institute list recovered · Cross-verified = published round-wise 2025 compilation, primary archive not recovered · Final-only = final/last closing known but exact primary round source unavailable.</p>` : ''}
    <table class="state-cutoff-table">
      <thead><tr><th>Authority</th><th>Year</th><th>Round</th><th>Closing AIR</th><th>Evidence</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    ${sourceText ? `<p class="checker-note">State-quota source/evidence: ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(sourceText)}</a>` : escapeHtml(sourceText)}.</p>` : ''}
  `;
}



function formatMedianRank(value){
  if(!Number.isFinite(value)) return '—';
  return Number.isInteger(value) ? value.toLocaleString('en-IN') : value.toLocaleString('en-IN',{minimumFractionDigits:1,maximumFractionDigits:1});
}

function renderAimsMedianTrend(collegeId){
  const trend = AIIMS_R1_MEDIAN_TRENDS[collegeId];
  if(!trend) return '';
  const years = [2022,2023,2024,2025];
  const values = years.map(y=>Number(trend[y]));
  const w=520,h=180,padX=54,padTop=36,padBottom=36;
  const min=Math.min(...values), max=Math.max(...values);
  const spread=Math.max(max-min,1);
  // Invert rank scale: lower AIR plots higher, so upward movement visually means stronger demand.
  const yFor=v=>padTop + ((v-min)/spread)*(h-padTop-padBottom);
  const xs=years.map((_,i)=>padX + i*((w-2*padX)/(years.length-1)));
  const pts=values.map((v,i)=>({x:xs[i],y:yFor(v),v,year:years[i]}));
  const path=pts.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
  const delta=values[values.length-1]-values[0];
  const stronger=delta<0, weaker=delta>0;
  const changeClass=stronger?'stronger':weaker?'weaker':'flat';
  const changeText=delta===0?'No net change':`${stronger?'↑':'↓'} ${formatMedianRank(Math.abs(delta))} ranks ${stronger?'more':'less'} competitive`;
  const gridYs=[padTop,(padTop+h-padBottom)/2,h-padBottom];
  return `
    <div class="msection">
      <h4>AIQ Round 1 median AIR trend</h4>
      <div class="trend-card">
        <div class="trend-summary">
          <div>
            <div class="trend-title">Demand trend · 2022–2025</div>
            <div class="trend-sub">Median AIR of all Round 1 MCC AIQ/Open-seat MBBS allottees, excluding PwD.</div>
          </div>
          <span class="trend-change ${changeClass}">${changeText}</span>
        </div>
        <svg class="trend-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="AIQ Round 1 median AIR trend from 2022 to 2025">
          ${gridYs.map(y=>`<line class="trend-grid" x1="${padX}" y1="${y}" x2="${w-padX}" y2="${y}"></line>`).join('')}
          <path class="trend-line" d="${path}"></path>
          ${pts.map(p=>`
            <circle class="trend-dot" cx="${p.x}" cy="${p.y}" r="5"></circle>
            <text class="trend-value" x="${p.x}" y="${Math.max(15,p.y-12)}">${formatMedianRank(p.v)}</text>
            <text class="trend-year" x="${p.x}" y="${h-11}">${p.year}</text>
          `).join('')}
        </svg>
        <div class="trend-values">
          ${pts.map(p=>`<div><div class="y">${p.year}</div><div class="v">${formatMedianRank(p.v)}</div></div>`).join('')}
        </div>
        <p class="trend-axis-note"><strong>How to read:</strong> lower AIR = stronger demand. The chart is intentionally inverted, so a line moving upward means the college became more competitive. This is a demand indicator, not an admission cutoff.</p>
        <p class="trend-source">Source: official MCC NEET-UG Round 1 allotment results. All AIIMS Open Seat Quota MBBS allotments are included except PwD-labelled allotments.</p>
      </div>
    </div>`;
}

function renderBiharGmcMedianTrend(collegeId){
  const trend = BIHAR_GMC_R1_MEDIAN_TRENDS[collegeId];
  if(!trend) return '';
  const years = [2022,2023,2024,2025].filter(y=>Number.isFinite(Number(trend[y])));
  if(years.length < 2) return '';
  const values = years.map(y=>Number(trend[y]));
  const w=520,h=180,padX=54,padTop=36,padBottom=36;
  const min=Math.min(...values), max=Math.max(...values);
  const spread=Math.max(max-min,1);
  // Invert rank scale: lower AIR plots higher, so upward movement visually means stronger demand.
  const yFor=v=>padTop + ((v-min)/spread)*(h-padTop-padBottom);
  const xs=years.map((_,i)=>years.length===1 ? w/2 : padX + i*((w-2*padX)/(years.length-1)));
  const pts=values.map((v,i)=>({x:xs[i],y:yFor(v),v,year:years[i]}));
  const path=pts.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
  const delta=values[values.length-1]-values[0];
  const stronger=delta<0, weaker=delta>0;
  const changeClass=stronger?'stronger':weaker?'weaker':'flat';
  const changeText=delta===0?'No net change':`${stronger?'↑':'↓'} ${formatMedianRank(Math.abs(delta))} ranks ${stronger?'more':'less'} competitive`;
  const gridYs=[padTop,(padTop+h-padBottom)/2,h-padBottom];
  const yearRange=`${years[0]}–${years[years.length-1]}`;
  return `
    <div class="msection">
      <h4>AIQ Round 1 median AIR trend</h4>
      <div class="trend-card">
        <div class="trend-summary">
          <div>
            <div class="trend-title">Demand trend · ${yearRange}</div>
            <div class="trend-sub">Median AIR of all Round 1 MCC 15% All India MBBS allottees, excluding PwD.</div>
          </div>
          <span class="trend-change ${changeClass}">${changeText}</span>
        </div>
        <svg class="trend-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="AIQ Round 1 median AIR trend from ${years[0]} to ${years[years.length-1]}">
          ${gridYs.map(y=>`<line class="trend-grid" x1="${padX}" y1="${y}" x2="${w-padX}" y2="${y}"></line>`).join('')}
          <path class="trend-line" d="${path}"></path>
          ${pts.map(p=>`
            <circle class="trend-dot" cx="${p.x}" cy="${p.y}" r="5"></circle>
            <text class="trend-value" x="${p.x}" y="${Math.max(15,p.y-12)}">${formatMedianRank(p.v)}</text>
            <text class="trend-year" x="${p.x}" y="${h-11}">${p.year}</text>
          `).join('')}
        </svg>
        <div class="trend-values">
          ${pts.map(p=>`<div><div class="y">${p.year}</div><div class="v">${formatMedianRank(p.v)}</div></div>`).join('')}
        </div>
        <p class="trend-axis-note"><strong>How to read:</strong> lower AIR = stronger demand. The chart is intentionally inverted, so a line moving upward means the college became more competitive. This is a demand indicator, not an admission cutoff.</p>
        <p class="trend-source">Source: official MCC NEET-UG Round 1 allotment results; 15% All India MBBS allotments only. All regular allotted categories are included and every PwD-labelled allotment is excluded.</p>
      </div>
    </div>`;
}


function hostelValue(value, fallback='Not verified'){
  if(value===true) return 'Yes';
  if(value===false) return 'No';
  if(value===null || value===undefined || value==='') return fallback;
  return escapeHtml(String(value));
}

function hostelMoney(value){
  if(value===null || value===undefined || value==='') return 'Not verified';
  const n=Number(value);
  return Number.isFinite(n) ? `₹${n.toLocaleString('en-IN')}` : escapeHtml(String(value));
}

function hostelAmenity(label, value){
  const cls=value===true?'yes':value===false?'no':'unknown';
  const display=value===null || value===undefined ? `${label}: ?` : label;
  return `<span class="hostel-chip ${cls}">${escapeHtml(display)}</span>`;
}

function hasHostelData(h){
  if(!h) return false;
  const ignored=new Set(['sources','lastVerified','confidence','researchStatus','ratings','roomAllocation','furniture']);
  if(Object.keys(h).some(k=>!ignored.has(k) && h[k]!==null && h[k]!==undefined && h[k]!=='')) return true;
  if(h.roomAllocation && Object.values(h.roomAllocation).some(v=>v!==null && v!==undefined && v!=='')) return true;
  if(h.ratings && Object.values(h.ratings).some(v=>v!==null && v!==undefined && v!=='' && Number.isFinite(Number(v)))) return true;
  return Array.isArray(h.sources) && h.sources.length>0;
}

function hostelRoomHeadline(h){
  const text=String(h?.roomAllocation?.year1 || h?.roomAllocation?.year2 || '').toLowerCase();
  if(!text) return 'Room type not verified';
  if(text.includes('triple')) return 'Triple sharing';
  if(text.includes('double') || text.includes('two-seater') || text.includes('two seater')) return 'Double sharing';
  if(text.includes('single') && (text.includes('share') || text.includes('double'))) return 'Single / shared';
  if(text.includes('single')) return 'Single room';
  if(text.includes('sharing') || text.includes('shared')) return 'Shared room';
  return 'Room pattern verified';
}

function hostelBathroomHeadline(value){
  const text=String(value||'').toLowerCase();
  if(!text) return 'Bath not verified';
  if(text.includes('common')) return 'Common bath';
  if(text.includes('attached') && !text.includes('common')) return 'Attached bath';
  if(text.includes('mixed') || (text.includes('attached') && text.includes('common'))) return 'Mixed bathrooms';
  return 'Bathroom verified';
}

function hostelFeeHeadline(value){
  if(value===null || value===undefined || value==='') return 'Fee not verified';
  if(Number.isFinite(Number(value))) return `₹${Number(value).toLocaleString('en-IN')}/yr`;
  const text=String(value);
  let m=text.match(/₹\s*([\d,]+(?:\s*[–-]\s*₹?\s*[\d,]+)?)\s*\/\s*year/i);
  if(m) return `₹${m[1].replace(/\s+/g,'')}/yr`;
  m=text.match(/₹\s*([\d,]+(?:\s*[–-]\s*₹?\s*[\d,]+)?)\s*\/\s*month/i);
  if(m) return `₹${m[1].replace(/\s+/g,'')}/mo`;
  m=text.match(/₹\s*([\d,]+)\s*total/i);
  if(m) return `₹${m[1]} total`;
  return text.length<=28 ? text : 'Fee details verified';
}

function hostelMessHeadline(h){
  if(h?.messCompulsory===true) return 'Mess compulsory';
  if(h?.messCompulsory===false) return 'Mess optional';
  if(h?.messMonthly!==null && h?.messMonthly!==undefined && h?.messMonthly!==''){
    const text=String(h.messMonthly);
    const m=text.match(/₹\s*([\d,]+(?:\s*[–-]\s*₹?\s*[\d,]+)?)/i);
    if(m) return `Mess ₹${m[1].replace(/\s+/g,'')}/mo`;
    return 'Mess available';
  }
  return 'Mess not verified';
}

function hostelConditionHeadline(h){
  const text=`${h?.roomCondition||''} ${h?.hygiene||''}`.toLowerCase();
  if(!text.trim()) return 'Condition not verified';
  if(/dilapidat|severe overcrowd|poor maintenance|poor condition/.test(text)) return 'Condition: weak/mixed';
  if(/ageing|aging|mixed|block-dependent|block dependent|vary|uneven|mediocre/.test(text)) return 'Condition: mixed';
  if(/modern|newer|good|clean|well-maintained|well maintained|decent/.test(text)) return 'Condition: good/mixed';
  return 'Condition documented';
}

function hostelQuickSummary(h){
  return [
    ['Room',hostelRoomHeadline(h)],
    ['Fee',hostelFeeHeadline(h?.annualFee)],
    ['Bath',hostelBathroomHeadline(h?.bathroom)],
    ['Mess',hostelMessHeadline(h)],
    ['Condition',hostelConditionHeadline(h)]
  ];
}


function hostelText(h,...keys){
  return keys.map(k=>String(k.split('.').reduce((o,p)=>o&&o[p],h)||'')).join(' ').toLowerCase();
}
function hostelBoolScore(v,yes=4,no=1){ return v===true?yes:v===false?no:null; }
function avgKnown(vals){ const xs=vals.filter(v=>Number.isFinite(v)); return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null; }
function hostelLabel(score,known=1){
  if(!Number.isFinite(score)||known<2) return 'Unknown';
  if(score>=3.35) return 'Excellent';
  if(score>=2.55) return 'Good';
  if(score>=1.7) return 'Mixed';
  return 'Poor';
}
function textQuality(text){
  text=String(text||'').toLowerCase();
  if(!text.trim()) return null;
  if(/dilapidat|severe overcrowd|very poor|poor sanitation|poor condition|weak/.test(text)) return 1;
  if(/mixed|mediocre|ageing|aging|vary|block-dependent|block dependent|overcrowd|transitional/.test(text)) return 2;
  if(/excellent|modern|very good|well-maintained|well maintained|clean and well|strong/.test(text)) return 4;
  if(/good|decent|functional|positive|clean/.test(text)) return 3;
  return 2.5;
}
function roomPrivacyScore(h){
  const t=hostelText(h,'roomAllocation.year1','roomAllocation.year2','roomAllocation.year3','roomAllocation.year4','roomAllocation.internship','genderRoomAllocation.boys','genderRoomAllocation.girls','bathroom');
  const vals=[];
  if(/single/.test(t)) vals.push(4);
  if(/double|two-seater|two seater/.test(t)) vals.push(2.7);
  if(/triple|dorm/.test(t)) vals.push(1.6);
  if(/attached/.test(t)&&!/common/.test(String(h.bathroom||'').toLowerCase())) vals.push(4);
  else if(/common/.test(String(h.bathroom||'').toLowerCase())) vals.push(2.2);
  return {score:avgKnown(vals),known:vals.length};
}
function hostelDimensions(h){
  const privacy=roomPrivacyScore(h);
  let vals=[];
  [textQuality(h.hygiene),textQuality(h.roomCondition),textQuality(h.housekeeping)].forEach(v=>{if(v!=null)vals.push(v)});
  const hygiene={score:avgKnown(vals),known:vals.length};
  vals=[];
  [hostelBoolScore(h.wifi),hostelBoolScore(h.powerBackup),hostelBoolScore(h.hotWater),hostelBoolScore(h.drinkingWater),hostelBoolScore(h.acAllowed),hostelBoolScore(h.coolerAllowed)].forEach(v=>{if(v!=null)vals.push(v)});
  if(h.electricityReliability) vals.push(textQuality(h.electricityReliability));
  if(h.waterReliability) vals.push(textQuality(h.waterReliability));
  const comfort={score:avgKnown(vals),known:vals.length};
  vals=[];
  const cur=String(h.curfew||'').toLowerCase();
  if(cur){ if(/no fixed|no curfew|flexible|loose/.test(cur)) vals.push(4); else if(/11\s*pm|10\s*pm|strict/.test(cur)) vals.push(1.8); else vals.push(2.5); }
  [hostelBoolScore(h.refrigeratorAllowed,3.5,1.8),hostelBoolScore(h.kettleAllowed,3.5,1.8),hostelBoolScore(h.coolerAllowed,3.3,1.8),hostelBoolScore(h.acAllowed,3.5,1.8)].forEach(v=>{if(v!=null)vals.push(v)});
  const freedom={score:avgKnown(vals),known:vals.length};
  vals=[];
  if(Number.isFinite(Number(h.walkingTimeMinutes))) vals.push(Number(h.walkingTimeMinutes)<=5?4:Number(h.walkingTimeMinutes)<=12?3:2);
  if(Number.isFinite(Number(h.hospitalDistanceMeters))) vals.push(Number(h.hospitalDistanceMeters)<=500?4:Number(h.hospitalDistanceMeters)<=1200?3:2);
  [hostelBoolScore(h.laundry),hostelBoolScore(h.washingMachine),hostelBoolScore(h.foodDelivery),hostelBoolScore(h.nightFood)].forEach(v=>{if(v!=null)vals.push(v)});
  if(h.campusFood||h.messDetails) vals.push(3);
  const convenience={score:avgKnown(vals),known:vals.length};
  vals=[];
  [hostelBoolScore(h.readingRoom),hostelBoolScore(h.commonRoom),hostelBoolScore(h.gym),hostelBoolScore(h.indoorGames),hostelBoolScore(h.sportsNearby),hostelBoolScore(h.libraryAfterHours)].forEach(v=>{if(v!=null)vals.push(v)});
  const recreation={score:avgKnown(vals),known:vals.length};
  const dims={privacy,hygiene,comfort,freedom,convenience,recreation};
  const overallVals=Object.values(dims).filter(d=>Number.isFinite(d.score)&&d.known>=2).map(d=>d.score);
  const overallScore=avgKnown(overallVals);
  return {...dims,overall:{score:overallScore,known:overallVals.length}};
}
function hostelDecisionProfile(h){
  const d=hostelDimensions(h);
  const out={};
  Object.entries(d).forEach(([k,v])=>out[k]={...v,label:hostelLabel(v.score,v.known)});
  return out;
}
function hostelLabelClass(label){ return String(label||'').toLowerCase().replace(/[^a-z]+/g,'-'); }
function hasSingleRoomReported(h){ return /single/.test(hostelText(h,'roomAllocation.year1','roomAllocation.year2','roomAllocation.year3','roomAllocation.year4','roomAllocation.internship','genderRoomAllocation.boys','genderRoomAllocation.girls')); }
function hasAttachedBathReported(h){ return /attached/.test(String(h?.bathroom||'').toLowerCase()) || /attached washroom|attached bathroom/.test(hostelText(h,'officialNotes','studentNotes')); }
function hasCoolingReported(h){ return h?.acAllowed===true || h?.coolerAllowed===true || /central ac|air-conditioned|air conditioned/.test(hostelText(h,'officialNotes','studentNotes','roomCondition')); }
function hasLooseCurfewReported(h){ return /no fixed|no curfew|flexible|loose/.test(String(h?.curfew||'').toLowerCase()); }
function renderHostelDecision(h){
  const p=hostelDecisionProfile(h);
  const names=[['Privacy',p.privacy],['Hygiene',p.hygiene],['Comfort',p.comfort],['Freedom',p.freedom],['Convenience',p.convenience],['Study & recreation',p.recreation]];
  return `<div class="hostel-decision">
    <div class="hostel-decision-top"><div><div class="hostel-decision-title">Hostel decision profile</div><div class="hostel-headnote" style="margin:3px 0 0">Derived from the researched fields below; not a student-star rating.</div></div><span class="hostel-overall-badge ${hostelLabelClass(p.overall.label)}">Overall: ${escapeHtml(p.overall.label)}</span></div>
    <div class="hostel-dimensions">${names.map(([k,v])=>`<div class="hostel-dimension"><div class="dk">${escapeHtml(k)}</div><div class="dv">${escapeHtml(v.label)}</div></div>`).join('')}</div>
  </div>`;
}

function renderHostelSection(collegeId){
  const h=HOSTELS[collegeId];
  if(!h || !hasHostelData(h)){
    const pilot=h ? '<br><strong>This college is in the first hostel-research pilot.</strong>' : '';
    return `<div class="msection">
      <h4>Hostel</h4>
      <div class="hostel-empty">Structured hostel profile not yet verified for this college.${pilot}<br>Unknown fields are deliberately left blank rather than inferred.</div>
    </div>`;
  }

  const roomYears=[
    ['1st year',h.roomAllocation?.year1],
    ['2nd year',h.roomAllocation?.year2],
    ['3rd year',h.roomAllocation?.year3],
    ['4th year',h.roomAllocation?.year4],
    ['Internship',h.roomAllocation?.internship]
  ];
  const ratings=[
    ['Room',h.ratings?.room],['Hygiene',h.ratings?.hygiene],['Mess',h.ratings?.mess],
    ['Freedom',h.ratings?.freedom],['Study',h.ratings?.studyEnvironment],['Recreation',h.ratings?.recreation],
    ['Overall',h.ratings?.overall]
  ].filter(([v])=>v!==null && v!==undefined && v!=='' && Number.isFinite(Number(v)));

  const distance = Number.isFinite(Number(h.walkingTimeMinutes))
    ? `${Number(h.walkingTimeMinutes)} min walk`
    : Number.isFinite(Number(h.hospitalDistanceMeters))
      ? `${Number(h.hospitalDistanceMeters).toLocaleString('en-IN')} m`
      : 'Not verified';
  const detailRows=[
    ['Hostel blocks',h.hostelBlocks],['Room size',h.roomSize],['Balcony',h.balcony],['Bathroom ratio',h.bathroomRatio],['Lifts',h.elevators],
    ['Room condition',h.roomCondition],['Renovation / current works',h.renovationStatus],['Block / batch variation',h.blockVariation],['Hygiene',h.hygiene],['Mess compulsory',h.messCompulsory],['Mess setup',h.messDetails],['Campus food alternatives',h.campusFood],
    ['Furniture',h.furniture ? [h.furniture.bed?'bed':null,h.furniture.studyTable?'study table':null,h.furniture.chair?'chair':null,h.furniture.cupboard?'cupboard/almirah':null,h.furniture.bookshelf?'bookshelf':null].filter(Boolean).join(', ') : null],
    ['Housekeeping',h.housekeeping],['Laundry',h.laundry],['Washing machine',h.washingMachine],['Drinking water',h.drinkingWater],['Water reliability',h.waterReliability],['Electricity reliability',h.electricityReliability],['Mobile network',h.mobileNetwork],
    ['Refrigerator allowed',h.refrigeratorAllowed],['Kettle / appliance policy',h.kettleAllowed],['Common kitchen',h.commonKitchen],
    ['Overnight leave',h.overnightLeave],['Visitor rules',h.visitorRules],['Vehicles',h.personalVehicles],['Parcel reception',h.parcelReception],['Security / entry',h.controlledEntry===true?'Controlled entry / register':h.controlledEntry],
    ['Senior culture / ragging',h.raggingSeniorCulture]
  ].filter(([v])=>v!==null && v!==undefined && v!=='');
  const sourceLinks=(h.sources||[]).map((u,i)=>`<a href="${escapeHtml(u)}" target="_blank" rel="noopener">Source ${i+1}</a>`).join(' · ');
  const quick=hostelQuickSummary(h);

  return `<div class="msection">
    <h4>Hostel</h4>

    ${renderHostelDecision(h)}

    <div class="hostel-quickline">
      ${quick.map(([k,v])=>`<span class="hostel-quickpill"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</span>`).join('')}
    </div>
    <div class="hostel-headnote">
      ${h.confidence ? `Evidence confidence: <strong>${escapeHtml(h.confidence)}</strong>. ` : ''}
      Expand for year-wise allocation, amenities, rules and source-backed student reports.
    </div>

    <details class="hostel-expand">
      <summary>Detailed hostel information</summary>
      <div class="hostel-detail-wrap">
        <div class="hostel-overview">
          <div class="hostel-stat"><div class="hk">Boys hostel</div><div class="hv">${hostelValue(h.boysAvailable)}</div></div>
          <div class="hostel-stat"><div class="hk">Girls hostel</div><div class="hv">${hostelValue(h.girlsAvailable)}</div></div>
          <div class="hostel-stat"><div class="hk">Allocation</div><div class="hv">${hostelValue(h.guaranteed)}</div></div>
          <div class="hostel-stat"><div class="hk">Hospital distance</div><div class="hv">${distance}</div></div>
          <div class="hostel-stat"><div class="hk">Hostel charges</div><div class="hv">${hostelMoney(h.annualFee)}</div></div>
          <div class="hostel-stat"><div class="hk">Mess / month</div><div class="hv">${hostelMoney(h.messMonthly)}</div></div>
          <div class="hostel-stat"><div class="hk">Bathroom</div><div class="hv">${hostelValue(h.bathroom)}</div></div>
          <div class="hostel-stat"><div class="hk">Curfew</div><div class="hv">${hostelValue(h.curfew)}</div></div>
        </div>

        <div class="hostel-years">
          ${roomYears.map(([y,v])=>`<div class="hostel-year"><div class="y">${y}</div><div class="v">${hostelValue(v,'—')}</div></div>`).join('')}
        </div>

        ${(h.genderRoomAllocation?.boys||h.genderRoomAllocation?.girls)?`<div class="hostel-detail-grid">
          ${h.genderRoomAllocation?.boys?`<div class="hostel-detail"><div class="dk">Boys · allocation pattern</div><div class="dv">${hostelValue(h.genderRoomAllocation.boys)}</div></div>`:''}
          ${h.genderRoomAllocation?.girls?`<div class="hostel-detail"><div class="dk">Girls · allocation pattern</div><div class="dv">${hostelValue(h.genderRoomAllocation.girls)}</div></div>`:''}
        </div>`:''}

        <div class="hostel-amenities">
          ${hostelAmenity('Wi-Fi',h.wifi)}
          ${hostelAmenity('Power backup',h.powerBackup)}
          ${hostelAmenity('Hot water',h.hotWater)}
          ${hostelAmenity('Reading room',h.readingRoom)}
          ${hostelAmenity('Common room',h.commonRoom)}
          ${hostelAmenity('Gym',h.gym)}
          ${hostelAmenity('Cooler allowed',h.coolerAllowed)}
          ${hostelAmenity('AC allowed',h.acAllowed)}
          ${hostelAmenity('Food delivery',h.foodDelivery)}
          ${hostelAmenity('Night food',h.nightFood)}
        </div>

        ${detailRows.length?`<div class="hostel-detail-grid">${detailRows.map(([k,v])=>`<div class="hostel-detail"><div class="dk">${escapeHtml(k)}</div><div class="dv">${hostelValue(v)}</div></div>`).join('')}</div>`:''}

        ${(h.officialNotes?.length||h.studentNotes?.length)?`<div class="hostel-notes">
          ${h.officialNotes?.length?`<div class="hostel-note-box"><h5>Official / hard facts</h5><ul>${h.officialNotes.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>`:''}
          ${h.studentNotes?.length?`<div class="hostel-note-box"><h5>What students report</h5><ul>${h.studentNotes.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>`:''}
        </div>`:''}

        ${ratings.length ? `<div class="hostel-ratings">${ratings.map(([k,v])=>`<div class="hostel-rating"><div class="rk">${k}</div><div class="rv">${Number(v).toFixed(1)}/10</div></div>`).join('')}</div>` : ''}

        <div class="hostel-meta">
          Confidence: <strong>${escapeHtml(h.confidence || 'Unknown')}</strong>
          · Last verified: <strong>${escapeHtml(h.lastVerified || 'Not recorded')}</strong>
          ${Array.isArray(h.sources) && h.sources.length ? ` · Sources: <strong>${h.sources.length}</strong>` : ''}
          <br>${escapeHtml(h.researchStatus || '')}
          ${sourceLinks?`<div class="hostel-sources">${sourceLinks}</div>`:''}
          <br>Student-reported impressions are shown separately from official institutional facts and may vary by batch or hostel block.
        </div>
      </div>
    </details>
  </div>`;
}

function openModal(id){
  const c = ALL_COLLEGES.find(x=>x.id===id);
  const cutoff = CUTOFFS[id];
  const starred = shortlist.includes(id);
 const stateCutoff = cutoff && (cutoff.state_cutoff || cutoff.stateQuota || cutoff.state_quota || cutoff.state_cutoff_data);
 const modal = document.getElementById('modal-content');
 modal.dataset.collegeId=String(id);
 modal.innerHTML = `
   <div class="modal-head">
     <div>
       <h3>${escapeHtml(formatCollegeName(c.name))}</h3>
       <div class="loc">${escapeHtml(c.city)}, ${escapeHtml(c.state)}</div>
     </div>
     <div class="modal-head-actions">
       <a class="modal-compare-btn modal-profile-link" href="college.html?id=${id}">Full profile →</a>
       <button class="modal-compare-btn ${compareSelection.includes(id)?'is-active':''}" id="modal-compare-btn" type="button">${compareSelection.includes(id)?'✓ In compare':'+ Compare'}</button>
       <button class="modal-shortlist ${starred?'active':''}" id="modal-shortlist-btn" type="button">${starred?'★ Shortlisted':'☆ Shortlist'}</button>
       <button class="modal-close" id="modal-close-btn" type="button">&times;</button>
     </div>
   </div>
   <div class="modal-body">
     <div class="mrow"><span class="k">Type</span><span class="v">${c.type}</span></div>
     <div class="mrow"><span class="k">Management</span><span class="v">${escapeHtml(c.management)}</span></div>
     <div class="mrow"><span class="k">Established</span><span class="v">${c.established}</span></div>
     <div class="mrow"><span class="k">MBBS seats</span><span class="v">${c.seats}</span></div>

     <div class="msection">
       <h4>MCC AIQ / Open Seat cutoff</h4>
       <div id="aiq-cutoff-panel">${renderAiqCategorySelector(cutoff, cutoff && cutoff.category_rounds ? 'General' : (cutoff && cutoff.categories_final_round ? Object.keys(cutoff.categories_final_round)[0] : 'General'))}</div>
     </div>



     ${renderAimsMedianTrend(id)}
     ${renderBiharGmcMedianTrend(id)}


     ${renderDirectoryDecisionSnapshot(id)}
     ${renderHostelSection(id)}
     ${renderDirectoryCultureSummary(id)}

   </div>
 `;
 const bindCategoryControls = () => {
   const aiqSelect = modal.querySelector('#aiq-category-select');
   if (aiqSelect) {
     aiqSelect.onchange = (event) => {
       const panel = modal.querySelector('#aiq-cutoff-panel');
       if (!panel) return;
       panel.innerHTML = renderAiqCategorySelector(cutoff, event.target.value || 'General');
       bindCategoryControls();
     };
   }

 };

 bindCategoryControls();

 modal.querySelector('#modal-close-btn').addEventListener('click', closeModal);
 const modalCompareBtn=modal.querySelector('#modal-compare-btn');
 if(modalCompareBtn) modalCompareBtn.addEventListener('click',()=>toggleCompareSelection(id));
 const shortlistBtn = modal.querySelector('#modal-shortlist-btn');
 if(shortlistBtn){
   shortlistBtn.addEventListener('click', async ()=>{
     toggleShortlist(id);
     const nowStarred = shortlist.includes(id);
     shortlistBtn.classList.toggle('active', nowStarred);
     shortlistBtn.textContent = nowStarred ? '★ Shortlisted' : '☆ Shortlist';
   });
 }
 document.getElementById('modal-overlay').classList.add('open');
}
function closeModal(){ document.getElementById('modal-overlay').classList.remove('open'); }

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

window.addEventListener('storage', async (e)=>{
  if(e.key === 'shortlist'){ await loadShortlist(); renderList(); }
});

loadShortlist().then(init);



    initTheme();
