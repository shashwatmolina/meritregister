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

const ASSIST_SHORTLIST_KEY='shortlist';
const ASSIST_ORDER_KEY='preference_order';
const BAND_ORDER=['Dream','Competitive','Likely','Safety'];
const BAND_DESCRIPTIONS={
  Dream:'R1 cutoff materially stronger than your AIR.',
  Competitive:'At or within about 8% of the current R1 cutoff.',
  Likely:'R1 reached with a positive 3–15% cushion.',
  Safety:'R1 reached with at least a 15% cushion.'
};
let assistantScope='all';
let visiblePerBand={Dream:12,Competitive:12,Likely:12,Safety:12};

function aEsc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function aCollege(id){return ALL_COLLEGES.find(c=>Number(c.id)===Number(id));}
function readIds(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return [...new Set((Array.isArray(v)?v:[]).map(Number).filter(id=>aCollege(id)))];}catch(e){return [];}}
function writeIds(key,ids){try{localStorage.setItem(key,JSON.stringify([...new Set(ids.map(Number))]));}catch(e){}}
function toast(msg){const el=document.getElementById('assistant-toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1500);}
function shortCollegeName(name){return String(name||'').replace(/^All India Institute of Medical Sciences/i,'AIIMS');}
function universalDemandRank(id,category){const r=recordForYear(id,2026),cr=categoryRoundsFromRecord(r,category);return validRank(cr&&cr.R1)||Number.POSITIVE_INFINITY;}

function assistantEvidence(id){
  const dims=[typeof CLINICAL_EXPOSURE!=='undefined'&&CLINICAL_EXPOSURE[id],typeof ACADEMICS_TEACHING!=='undefined'&&ACADEMICS_TEACHING[id],typeof RESEARCH_USMLE!=='undefined'&&RESEARCH_USMLE[id],typeof CAMPUS_STUDENT_LIFE!=='undefined'&&CAMPUS_STUDENT_LIFE[id],typeof FEES_BOND_STIPEND!=='undefined'&&FEES_BOND_STIPEND[id],typeof HOSTELS!=='undefined'&&HOSTELS[id]].filter(Boolean).length;
  const culture=typeof meritJuniorCulture==='function'&&!!meritJuniorCulture(id);
  const timeline=typeof meritCultureEvidenceCount==='function'?meritCultureEvidenceCount(id):0;
  return {core:dims,culture,timeline,deep:dims>=4};
}
function assistantStrengths(id){
  const d=typeof DIMENSION_CALIBRATION!=='undefined'?DIMENSION_CALIBRATION[id]:null;if(!d)return [];
  const labels={clinical:'Clinical',academics:'Academics',research:'Research',campus:'Campus',networking:'Networking'};
  return Object.entries(d).filter(([k,v])=>labels[k]&&Number.isFinite(Number(v))).map(([k,v])=>({label:labels[k],score:Number(v)})).sort((a,b)=>b.score-a.score).slice(0,2);
}
function assistantContext(x,p){
  const e=assistantEvidence(x.college.id),mv=getRoundMovement(x.college.id,p.category,'R1'),strengths=assistantStrengths(x.college.id);
  const reached=x.routes.filter(r=>r.state==='reached'),conditionalOnly=reached.length>0&&reached.every(r=>!['AI','SO'].includes(r.quotaCode));
  return {e,mv,strengths,conditionalOnly,reachedCount:reached.length};
}

function classifyCollege(c,p){
  const routes=quotaRouteStatuses(c.id,p.air,p.category,p);
  if(!routes.length)return {college:c,routes:[],best:null,band:{label:'Unknown',className:'unknown'}};
  const best=routes[0];
  return {college:c,routes,best,band:choicePlanningBand(best),demand:universalDemandRank(c.id,p.category)};
}
function activeDataset(){
  const p=getCandidateProfile();
  if(!p.air)return [];
  let colleges=ALL_COLLEGES.slice();
  if(assistantScope==='preference'){
    const ids=readIds(ASSIST_ORDER_KEY); const pos=new Map(ids.map((id,i)=>[id,i]));
    colleges=ids.map(aCollege).filter(Boolean);
    return colleges.map(c=>({...classifyCollege(c,p),prefIndex:pos.get(c.id)}));
  }
  return colleges.map(c=>classifyCollege(c,p));
}
function filteredDataset(){
  const q=(document.getElementById('assistant-search')?.value||'').trim().toLowerCase();
  const st=document.getElementById('assistant-state')?.value||'';
  const type=document.getElementById('assistant-type')?.value||'';
  const band=document.getElementById('assistant-band')?.value||'';
  const evidence=document.getElementById('assistant-evidence')?.value||'';
  return activeDataset().filter(x=>{
    const c=x.college;
    if(st&&c.state!==st)return false;
    if(type&&c.type!==type)return false;
    if(band&&x.band.label!==band)return false;
    if(evidence){const e=assistantEvidence(c.id);if(evidence==='deep'&&!e.deep)return false;if(evidence==='culture'&&!e.culture)return false;if(evidence==='hostel'&&!(typeof HOSTELS!=='undefined'&&HOSTELS[c.id]))return false;}
    if(q&&!`${c.name} ${c.city} ${c.state}`.toLowerCase().includes(q))return false;
    return true;
  });
}
function renderProfile(){
  const el=document.getElementById('assistant-profile'),p=getCandidateProfile();
  if(!p.air){
    el.innerHTML='<div class="assistant-profile-card"><div><h3>Set your counselling profile first</h3><p>The assistant needs AIR, category and any special quota eligibility. AIQ/Open are always included; DU/IPU/ESI and other routes are only used when you enable them.</p></div><button type="button" id="assistant-edit-profile">Set profile →</button></div>';
  }else{
    const extras=profileExtraEligibilityLabels(p);
    el.innerHTML=`<div class="assistant-profile-card"><div><h3>AIR ${formatIndianRank(p.air)} · ${aEsc(CATEGORY_LABELS[p.category])}</h3><p>${p.domicile?`Domicile: ${aEsc(p.domicile)} · `:''}Active routes: AIQ/Open${extras.length?' + '+aEsc(extras.join(', ')):''}. Special-route eligibility is user-selected, not inferred from domicile.</p></div><button type="button" id="assistant-edit-profile">Edit profile →</button></div>`;
  }
  document.getElementById('assistant-edit-profile')?.addEventListener('click',()=>document.getElementById('candidate-profile-chip')?.click());
}
function renderSummary(data){
  const el=document.getElementById('assistant-band-summary');
  const counts=Object.fromEntries(BAND_ORDER.map(b=>[b,data.filter(x=>x.band.label===b).length]));
  el.innerHTML=BAND_ORDER.map(b=>`<div class="assistant-band-stat ${b.toLowerCase()}"><div class="label">${b}</div><div class="count">${counts[b].toLocaleString('en-IN')}</div><div class="desc">${aEsc(BAND_DESCRIPTIONS[b])}</div></div>`).join('');
}
function renderListCheck(data){
  const el=document.getElementById('assistant-list-check'),p=getCandidateProfile();
  if(!p.air){el.innerHTML='';return;}
  const order=readIds(ASSIST_ORDER_KEY);
  if(assistantScope!=='preference'){
    const deep=data.filter(x=>assistantEvidence(x.college.id).deep).length,culture=data.filter(x=>assistantEvidence(x.college.id).culture).length;
    el.innerHTML=`<div class="assistant-check-card assistant-check-grid"><div><strong>Choice-order rule</strong><span>Use bands to test breadth, not to override your genuine preference. Dream colleges should stay above safeties if you would actually choose them.</span></div><div><strong>Evidence depth</strong><span>${deep} filtered colleges have deep profiles · ${culture} have Junior Culture research.</span></div><div><strong>Your saved list</strong><span>${order.length?`${order.length} college${order.length===1?'':'s'} currently saved.`:'No colleges saved yet.'}</span></div></div>`;
    return;
  }
  const counts=Object.fromEntries(BAND_ORDER.map(b=>[b,data.filter(x=>x.band.label===b).length]));
  const unknown=data.filter(x=>x.band.label==='Unknown').length;
  const last=data.length?data[data.length-1]:null;
  const conditional=data.filter(x=>assistantContext(x,p).conditionalOnly).length;
  const deep=data.filter(x=>assistantEvidence(x.college.id).deep).length;
  const culture=data.filter(x=>assistantEvidence(x.college.id).culture).length;
  const routeCodes=new Set(data.flatMap(x=>x.routes.filter(r=>r.state==='reached').map(r=>r.quotaCode)));
  let tail='';
  if(last&&['Dream','Competitive'].includes(last.band.label))tail=`Your final listed college is ${last.band.label}; the bottom of the list has no clear current R1 safety anchor.`;
  else if(last&&last.band.label==='Safety')tail='Your final listed college is currently a Safety-band option.';
  else tail='The bottom of the list is not yet classifiable from loaded R1 data.';
  el.innerHTML=`<div class="assistant-check-card assistant-check-grid"><div><strong>Band mix</strong><span>Dream ${counts.Dream||0} · Competitive ${counts.Competitive||0} · Likely ${counts.Likely||0} · Safety ${counts.Safety||0}${unknown?` · Unknown ${unknown}`:''}.</span></div><div><strong>Route diversity</strong><span>${routeCodes.size?`${routeCodes.size} reached quota stream${routeCodes.size===1?'':'s'} represented.`:'No currently reached route in the filtered list.'} ${conditional?`${conditional} college${conditional===1?' is':'s are'} reached only through conditional/non-AIQ routes.`:''}</span></div><div><strong>Research depth</strong><span>${deep}/${data.length||0} deep-profiled · ${culture}/${data.length||0} with Junior Culture evidence.</span></div><div><strong>Bottom-of-list check</strong><span>${aEsc(tail)}</span></div></div>`;
}
function routePills(x,p){
  return x.routes.map(r=>{
    const d=Math.abs(r.cutoff-p.air),text=r.state==='reached'?`+${d.toLocaleString('en-IN')}`:`−${d.toLocaleString('en-IN')}`;
    return `<span class="assistant-route ${r.state}">${aEsc(r.quotaLabel)} ${r.cutoff.toLocaleString('en-IN')} · ${text}</span>`;
  }).join('');
}
function cardHtml(x,p,inList){
  const c=x.college,b=x.band.label,best=x.best,ctx=assistantContext(x,p);
  const strength=ctx.strengths.length?ctx.strengths.map(y=>`${y.label} ${y.score}`).join(' · '):'';
  const mv=ctx.mv?`${ctx.mv.direction==='stronger'?'R1 stronger':'R1 softer'} ${ctx.mv.magnitude.toLocaleString('en-IN')} vs 2025`:'';
  return `<article class="assistant-college-card" data-college-id="${c.id}">
    <div class="assistant-card-head"><a class="assistant-college-name" href="college.html?id=${c.id}">${aEsc(shortCollegeName(c.name))}</a><span class="assistant-evidence-badge">${ctx.e.core}/6${ctx.e.culture?' + culture':''}</span></div>
    <div class="assistant-college-meta">${aEsc(c.city)}, ${aEsc(c.state)} · ${aEsc(c.type)}</div>
    <div class="assistant-route-line">${routePills(x,p)}</div>
    <div class="assistant-context-line">${ctx.conditionalOnly?'<span class="assistant-context warn">Conditional-route dependent</span>':''}${mv?`<span class="assistant-context">${aEsc(mv)}</span>`:''}${ctx.e.timeline?`<span class="assistant-context">Culture timeline ${ctx.e.timeline}/6</span>`:''}</div>
    ${strength?`<div class="assistant-strengths"><strong>Research strengths:</strong> ${aEsc(strength)}</div>`:''}
    <div class="assistant-card-foot"><div class="assistant-best-route">${best?`Best current route: ${aEsc(best.quotaLabel)} · ${best.state==='reached'?'R1 reached':'R1 missed'} · ${Math.abs(best.margin).toLocaleString('en-IN')} AIR ${best.margin>=0?'cushion':'gap'}`:'No enabled 2026 R1 route'}</div><button class="assistant-add-btn ${inList?'active':''}" type="button" data-toggle-list="${c.id}">${inList?'✓ In list':'+ Add'}</button></div>
  </article>`;
}
function renderColumns(data){
  const p=getCandidateProfile(),root=document.getElementById('assistant-columns'),unknownEl=document.getElementById('assistant-unknown');
  if(!p.air){root.innerHTML='<div class="assistant-empty">Set your profile to generate choice bands.</div>';unknownEl.innerHTML='';return;}
  const order=readIds(ASSIST_ORDER_KEY),inList=new Set(order);
  const cols=BAND_ORDER.map(b=>{
    let items=data.filter(x=>x.band.label===b);
    if(assistantScope==='preference') items.sort((a,b)=>(a.prefIndex??9999)-(b.prefIndex??9999));
    else items.sort((a,b)=>{
      const ad=a.demand,bd=b.demand;
      if(Number.isFinite(ad)&&Number.isFinite(bd)&&ad!==bd)return ad-bd;
      if(Number.isFinite(ad)!==Number.isFinite(bd))return Number.isFinite(ad)?-1:1;
      return a.college.name.localeCompare(b.college.name);
    });
    const shown=items.slice(0,visiblePerBand[b]);
    return `<section class="assistant-column ${b.toLowerCase()}"><div class="assistant-column-head"><h3>${b}</h3><span>${items.length}</span></div><div class="assistant-college-list">${shown.length?shown.map(x=>cardHtml(x,p,inList.has(x.college.id))).join(''):'<div class="assistant-empty">No colleges in this band with the current filters.</div>'}</div>${items.length>shown.length?`<button class="assistant-more" type="button" data-more-band="${b}">Show ${Math.min(12,items.length-shown.length)} more</button>`:''}</section>`;
  }).join('');
  root.innerHTML=cols;
  const unknown=data.filter(x=>x.band.label==='Unknown');
  unknownEl.innerHTML=unknown.length?`${unknown.length} college${unknown.length===1?' has':'s have'} no category-specific 2026 R1 cutoff in any quota stream enabled in your profile. They are kept unclassified rather than guessed.`:'';
  root.querySelectorAll('[data-more-band]').forEach(btn=>btn.addEventListener('click',()=>{visiblePerBand[btn.dataset.moreBand]+=12;renderAll();}));
  root.querySelectorAll('[data-toggle-list]').forEach(btn=>btn.addEventListener('click',()=>toggleList(Number(btn.dataset.toggleList))));
}
function toggleList(id){
  let shortlist=readIds(ASSIST_SHORTLIST_KEY),order=readIds(ASSIST_ORDER_KEY);
  const inList=order.includes(id)||shortlist.includes(id);
  if(inList){shortlist=shortlist.filter(x=>x!==id);order=order.filter(x=>x!==id);toast('Removed from preference list');}
  else{shortlist.push(id);order.push(id);toast('Added to preference list');}
  writeIds(ASSIST_SHORTLIST_KEY,shortlist);writeIds(ASSIST_ORDER_KEY,order);renderAll();
}
function renderAll(){
  renderProfile();
  const data=filteredDataset();
  renderSummary(data);renderListCheck(data);renderColumns(data);
}
function populateFilters(){
  const states=[...new Set(ALL_COLLEGES.map(c=>c.state).filter(Boolean))].sort();
  const types=[...new Set(ALL_COLLEGES.map(c=>c.type).filter(Boolean))].sort();
  document.getElementById('assistant-state').innerHTML='<option value="">All states</option>'+states.map(x=>`<option>${aEsc(x)}</option>`).join('');
  document.getElementById('assistant-type').innerHTML='<option value="">All types</option>'+types.map(x=>`<option>${aEsc(x)}</option>`).join('');
}
function bind(){
  document.querySelectorAll('[data-scope]').forEach(btn=>btn.addEventListener('click',()=>{
    assistantScope=btn.dataset.scope;document.querySelectorAll('[data-scope]').forEach(x=>x.classList.toggle('active',x===btn));
    visiblePerBand={Dream:12,Competitive:12,Likely:12,Safety:12};renderAll();
  }));
  ['assistant-search','assistant-state','assistant-type','assistant-band','assistant-evidence'].forEach(id=>document.getElementById(id)?.addEventListener(id==='assistant-search'?'input':'change',renderAll));
  window.addEventListener('candidateprofilechange',()=>{visiblePerBand={Dream:12,Competitive:12,Likely:12,Safety:12};renderAll();});
  window.addEventListener('storage',e=>{if([ASSIST_SHORTLIST_KEY,ASSIST_ORDER_KEY].includes(e.key))renderAll();});
}

document.addEventListener('DOMContentLoaded',()=>{initTheme();populateFilters();bind();renderAll();});
