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
// Aug-2026 deep research refresh: newest source-backed findings layered on top of the structured profiles.


function deepUniqueSources(c){
  const objs=[CLINICAL_EXPOSURE[c.id],ACADEMICS_TEACHING[c.id],RESEARCH_USMLE[c.id],CAMPUS_STUDENT_LIFE[c.id],FEES_BOND_STIPEND[c.id],HOSTELS[c.id],DEEP_RESEARCH_REFRESH[c.id],typeof meritJuniorCulture==='function'?meritJuniorCulture(c.id):null,typeof meritJuniorFirst90==='function'?meritJuniorFirst90(c.id):null];
  const seen=new Map();
  objs.forEach(o=>{if(!o)return;const srcs=o.sources||[];srcs.forEach(s=>{const label=Array.isArray(s)?s[0]:s.label,url=Array.isArray(s)?s[1]:s.url;if(url&&!seen.has(url))seen.set(url,{label:label||new URL(url).hostname,url});});});
  return [...seen.values()];
}
function deepLine(label,val){if(val===null||val===undefined||val===''||String(val)==='Unknown')return '';return `<div class="deep-line"><strong>${esc(label)}:</strong> ${esc(typeof val==='object'?JSON.stringify(val):val)}</div>`;}
function deepRoom(h){if(!h)return '';const r=h.roomAllocation||{};return [r.year1&&`Y1 ${r.year1}`,r.year2&&`Y2 ${r.year2}`,r.year3&&`Y3 ${r.year3}`,r.year4&&`Y4 ${r.year4}`,r.internship&&`Intern ${r.internship}`].filter(Boolean).join(' · ');}
function deepDossierCard(c){
 const cl=CLINICAL_EXPOSURE[c.id]||{},ac=ACADEMICS_TEACHING[c.id]||{},re=RESEARCH_USMLE[c.id]||{},ca=CAMPUS_STUDENT_LIFE[c.id]||{},fi=FEES_BOND_STIPEND[c.id]||{},h=HOSTELS[c.id]||{},rf=DEEP_RESEARCH_REFRESH[c.id]||{},jc=typeof meritJuniorCulture==='function'?(meritJuniorCulture(c.id)||{}):{},f90=typeof meritJuniorFirst90==='function'?(meritJuniorFirst90(c.id)||{}):{};
 const src=deepUniqueSources(c),cov=profileDimensionCoverage(c);
 const srcHtml=src.length?`<div class="deep-source-list">${src.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label||'Source')}</a>`).join('')}</div>`:'<div class="deep-line">No auditable source link stored.</div>';
 return `<details class="deep-dossier"><summary><span class="deep-college-name">${esc(c.name)}</span></summary><div class="deep-meta"><a class="deep-profile-link" href="college.html?id=${c.id}">Open profile →</a><span>${cov.known}/6 dimensions</span><span>${src.length} unique sources</span><span>Freshness ${esc(rf.freshness||'Mixed')}</span><span>Verified 20 Aug 2026</span></div>
 ${rf.findings?.length?`<div class="deep-section"><div class="deep-section-title">New findings in this pass</div>${rf.findings.map(x=>`<div class="deep-finding">${esc(x)}</div>`).join('')}</div>`:''}
 <div class="deep-section"><div class="deep-section-title">Clinical dossier</div>${deepLine('Teaching hospitals',cl.hospitals)}${deepLine('Beds',cl.beds)}${deepLine('OPD',cl.opd)}${deepLine('Emergency',cl.emergency)}${deepLine('IPD',cl.ipd)}${deepLine('Surgery / procedures',cl.surgery)}${deepLine('Trauma',cl.trauma)}${deepLine('Superspecialties',cl.superspecialty)}${deepLine('Patient mix',cl.patientMix)}${deepLine('UG learning context',cl.teaching)}</div>
 <div class="deep-section"><div class="deep-section-title">Academics dossier</div>${deepLine('Teaching model',ac.teachingModel)}${deepLine('Attendance',ac.attendance)}${deepLine('Internal assessment',ac.internalAssessment)}${deepLine('Clinical teaching',ac.clinicalTeaching)}${deepLine('Library',ac.library)}${deepLine('Reading hours',ac.readingHours)}${deepLine('Academic culture',ac.learningEnvironment)}${deepLine('Student reports',ac.studentReported)}</div>
 <div class="deep-section"><div class="deep-section-title">Research / international dossier</div>${deepLine('Research ecosystem',re.researchStrength)}${deepLine('UG access',re.undergradAccess)}${deepLine('Funding',re.funding)}${deepLine('Infrastructure',re.infrastructure)}${deepLine('Student opportunities',re.studentOpportunities)}${deepLine('International / USMLE',re.internationalPathway)}${deepLine('Networking',re.cityNetworking)}${deepLine('International alumni evidence',re.alumniInternational)}</div>
 <div class="deep-section"><div class="deep-section-title">Hostel dossier</div>${deepLine('Hostel blocks',h.hostelBlocks)}${deepLine('Year-wise rooms',deepRoom(h))}${deepLine('Boys',h.genderRoomAllocation?.boys)}${deepLine('Girls',h.genderRoomAllocation?.girls)}${deepLine('Bathroom',h.bathroom)}${deepLine('Bathroom ratio',h.bathroomRatio)}${deepLine('Room size',h.roomSize)}${deepLine('Mess',h.messDetails)}${deepLine('Wi‑Fi',yesno(h.wifi))}${deepLine('Cooling',joinTruthy([h.acProvided===true?'AC provided':null,h.acAllowed===true?'AC allowed':h.acAllowed===false?'AC not allowed':null,h.coolerAllowed===true?'Cooler allowed':null]))}${deepLine('Housekeeping',h.housekeeping)}${deepLine('Curfew',h.curfew)}${deepLine('Condition',joinTruthy([h.roomCondition,h.hygiene,h.renovationStatus,h.blockVariation]))}${deepLine('Student report',h.studentReport)}</div>
 <div class="deep-section"><div class="deep-section-title">Junior experience / senior culture dossier</div>${deepLine('Current picture',jc.currentPicture)}${deepLine('Rulebook / artifact',jc.artifactStatus||jc.rulebookStatus)}${deepLine('Ground rules',jc.groundRules)}${deepLine('Intro / PDP',jc.introCulture)}${deepLine('Appearance',jc.dressAppearance)}${deepLine('Movement / common areas',jc.movementCommonAreas)}${deepLine('Senior-junior relationship',jc.seniorJunior)}${deepLine('First weeks',f90.firstWeeks)}${deepLine('Hosteller vs day scholar',f90.hostellerVsDayScholar)}${deepLine('Opt-out evidence',f90.optOut)}${deepLine('After freshers',f90.afterFreshers)}${deepLine('Official response',jc.officialResponse)}${deepLine('Unknowns',jc.unknowns)}</div>
 <div class="deep-section"><div class="deep-section-title">Campus / student-life dossier</div>${deepLine('Campus',ca.campus)}${deepLine('Sports',ca.sports)}${deepLine('Clubs',ca.clubs)}${deepLine('Fest',ca.fest)}${deepLine('Food',ca.food)}${deepLine('City / transport',ca.city)}${deepLine('Social culture',ca.social)}${deepLine('Safety / welfare',ca.safety)}${deepLine('Main trade-off',ca.tradeoff)}</div>
 <div class="deep-section"><div class="deep-section-title">Finance / admin dossier</div>${deepLine('Academic fee',fi.academicFee)}${deepLine('Hostel fee',fi.hostelFee)}${deepLine('Mess',fi.mess)}${deepLine('Intern stipend',fi.internStipend)}${deepLine('Service bond',fi.bond)}${deepLine('Bond terms',fi.penalty)}${deepLine('Currentness',fi.currentness)}</div>
 <div class="deep-section"><div class="deep-section-title">Evidence ledger</div>${deepLine('Clinical confidence',cl.confidence)}${deepLine('Academic confidence',ac.confidence)}${deepLine('Research confidence',re.confidence)}${deepLine('Campus confidence',ca.confidence)}${deepLine('Finance confidence',fi.confidence)}${deepLine('Hostel confidence',h.confidence)}${deepLine('Junior-culture confidence',jc.confidence)}${srcHtml}</div></details>`;
}
function renderDeepResearch(cols){return `<section class="research-depth-section"><div class="research-depth-head"><div><div class="research-depth-title">Full evidence dossiers</div><div class="research-depth-sub">Deep-pass research for the 30-college pilot. Open only the college you want to inspect. Each dossier preserves granular facts, currentness, confidence and source links; missing evidence stays missing rather than being inferred.</div></div><span class="compare-pill accent">Updated 20 Aug 2026</span></div><div class="research-depth-grid" style="--compare-cols:${cols.length}">${cols.map(deepDossierCard).join('')}</div></section>`;}

const $ = (sel,root=document)=>root.querySelector(sel);
const esc = (v)=>String(v ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = (v)=> (v===null||v===undefined||v==='') ? 'Unknown' : (typeof v==='number' ? v.toLocaleString('en-IN') : String(v));
const yesno = (v)=> v===true?'Yes':v===false?'No':'Unknown';
const posnum = (v)=> Number.isFinite(Number(v)) && Number(v)>0 ? Number(v) : null;
const collegeById = id => ALL_COLLEGES.find(c=>Number(c.id)===Number(id));
const collegeByName = name => ALL_COLLEGES.find(c=>c.name.toLowerCase()===String(name||'').trim().toLowerCase());
const trendFor = id => AIIMS_R1_MEDIAN_TRENDS[id] || BIHAR_GMC_R1_MEDIAN_TRENDS[id] || null;
const hasHostel = id => { const h=HOSTELS[id]; return !!(h && Object.entries(h).some(([k,v])=>k!=='ratings' && v!==null && v!==undefined && v!=='' && !(typeof v==='object' && !Array.isArray(v) && Object.values(v).every(x=>x===null||x===undefined||x==='')))); };
const hostelText=(h,...keys)=>keys.map(k=>String(k.split('.').reduce((o,p)=>o&&o[p],h)||'')).join(' ').toLowerCase();
const hostelBoolScore=(v,yes=4,no=1)=>v===true?yes:v===false?no:null;
const avgKnown=vals=>{const xs=vals.filter(Number.isFinite);return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;};
function hostelLabel(score,known=1){if(!Number.isFinite(score)||known<2)return 'Unknown';if(score>=3.35)return 'Excellent';if(score>=2.55)return 'Good';if(score>=1.7)return 'Mixed';return 'Poor';}
function textQuality(text){text=String(text||'').toLowerCase();if(!text.trim())return null;if(/dilapidat|severe overcrowd|very poor|poor sanitation|poor condition|weak/.test(text))return 1;if(/mixed|mediocre|ageing|aging|vary|block-dependent|block dependent|overcrowd|transitional/.test(text))return 2;if(/excellent|modern|very good|well-maintained|well maintained|clean and well|strong/.test(text))return 4;if(/good|decent|functional|positive|clean/.test(text))return 3;return 2.5;}
function roomPrivacyScore(h){const t=hostelText(h,'roomAllocation.year1','roomAllocation.year2','roomAllocation.year3','roomAllocation.year4','roomAllocation.internship','genderRoomAllocation.boys','genderRoomAllocation.girls','bathroom');const vals=[];if(/single/.test(t))vals.push(4);if(/double|two-seater|two seater/.test(t))vals.push(2.7);if(/triple|dorm/.test(t))vals.push(1.6);if(/attached/.test(t)&&!/common/.test(String(h.bathroom||'').toLowerCase()))vals.push(4);else if(/common/.test(String(h.bathroom||'').toLowerCase()))vals.push(2.2);return {score:avgKnown(vals),known:vals.length};}
function hostelDecisionProfile(h){if(!h)return {overall:{score:null,known:0,label:'Unknown'}};const privacy=roomPrivacyScore(h);let vals=[];[textQuality(h.hygiene),textQuality(h.roomCondition),textQuality(h.housekeeping)].forEach(v=>{if(v!=null)vals.push(v)});const hygiene={score:avgKnown(vals),known:vals.length};vals=[];[hostelBoolScore(h.wifi),hostelBoolScore(h.powerBackup),hostelBoolScore(h.hotWater),hostelBoolScore(h.drinkingWater),hostelBoolScore(h.acAllowed),hostelBoolScore(h.coolerAllowed)].forEach(v=>{if(v!=null)vals.push(v)});if(h.electricityReliability)vals.push(textQuality(h.electricityReliability));if(h.waterReliability)vals.push(textQuality(h.waterReliability));const comfort={score:avgKnown(vals),known:vals.length};vals=[];const cur=String(h.curfew||'').toLowerCase();if(cur){if(/no fixed|no curfew|flexible|loose/.test(cur))vals.push(4);else if(/11\s*pm|10\s*pm|strict/.test(cur))vals.push(1.8);else vals.push(2.5);}[hostelBoolScore(h.refrigeratorAllowed,3.5,1.8),hostelBoolScore(h.kettleAllowed,3.5,1.8),hostelBoolScore(h.coolerAllowed,3.3,1.8),hostelBoolScore(h.acAllowed,3.5,1.8)].forEach(v=>{if(v!=null)vals.push(v)});const freedom={score:avgKnown(vals),known:vals.length};vals=[];if(Number.isFinite(Number(h.walkingTimeMinutes)))vals.push(Number(h.walkingTimeMinutes)<=5?4:Number(h.walkingTimeMinutes)<=12?3:2);if(Number.isFinite(Number(h.hospitalDistanceMeters)))vals.push(Number(h.hospitalDistanceMeters)<=500?4:Number(h.hospitalDistanceMeters)<=1200?3:2);[hostelBoolScore(h.laundry),hostelBoolScore(h.washingMachine),hostelBoolScore(h.foodDelivery),hostelBoolScore(h.nightFood)].forEach(v=>{if(v!=null)vals.push(v)});if(h.campusFood||h.messDetails)vals.push(3);const convenience={score:avgKnown(vals),known:vals.length};vals=[];[hostelBoolScore(h.readingRoom),hostelBoolScore(h.commonRoom),hostelBoolScore(h.gym),hostelBoolScore(h.indoorGames),hostelBoolScore(h.sportsNearby),hostelBoolScore(h.libraryAfterHours)].forEach(v=>{if(v!=null)vals.push(v)});const recreation={score:avgKnown(vals),known:vals.length};const dims={privacy,hygiene,comfort,freedom,convenience,recreation};const overallVals=Object.values(dims).filter(d=>Number.isFinite(d.score)&&d.known>=2).map(d=>d.score);const overall={score:avgKnown(overallVals),known:overallVals.length};return {...dims,overall:{...overall,label:hostelLabel(overall.score,overall.known)}};}
function qualityBadge(label){const cls=String(label||'Unknown').toLowerCase().replace(/[^a-z]+/g,'-');return `<span class="compare-quality ${cls}">${esc(label||'Unknown')}</span>`;}
function hostelSources(id){const h=HOSTELS[id];if(!h)return 'Unknown';const src=Array.isArray(h.sources)?h.sources:(Array.isArray(h.source)?h.source:[]);if(!src.length)return 'Unknown';return `<div class="compare-source-links">${src.slice(0,8).map((x,i)=>{const url=typeof x==='string'?x:(x.url||x.href||'');const label=typeof x==='string'?`Source ${i+1}`:(x.label||x.title||x.type||`Source ${i+1}`);return url?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`:esc(label);}).join('')}</div>`;}


const COMPARE_STORAGE_KEY='merit-register-compare-colleges';
let selected=[];
let category='General';

function storedCompareSelection(){
  try{return [...new Set((JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY)||'[]')||[]).map(Number).filter(id=>collegeById(id)))].slice(0,4);}catch(e){return [];}
}
function saveCompareSelection(){try{localStorage.setItem(COMPARE_STORAGE_KEY,JSON.stringify(selected));}catch(e){}}
function initFromUrl(){
  const p=new URLSearchParams(location.search);
  const ids=(p.get('c')||'').split(',').map(Number).filter(id=>collegeById(id));
  if(ids.length) selected=[...new Set(ids)].slice(0,4);
  else {
    const stored=storedCompareSelection();
    selected=stored.length?stored:[64,262];
  }
  const cat=p.get('cat'); if(['General','OBC','EWS','SC','ST'].includes(cat)) category=cat;
  saveCompareSelection();
}
function syncUrl(replace=true){
  saveCompareSelection();
  const p=new URLSearchParams(); p.set('c',selected.join(',')); p.set('cat',category);
  const url=location.pathname+'?'+p.toString(); try{history[replace?'replaceState':'pushState'](null,'',url);}catch(e){}
}
function normalizeSearch(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim();}
function acronym(name){const stop=new Set(['of','and','the','for','in','at','hospital','college']);return normalizeSearch(name).split(' ').filter(w=>w&&!stop.has(w)).map(w=>w[0]).join('');}
function collegeSearchIndex(c){return normalizeSearch([c.name,c.city,c.state,c.type,c.management,acronym(c.name)].join(' '));}
function searchColleges(q){const nq=normalizeSearch(q);if(!nq)return [];return ALL_COLLEGES.filter(c=>!selected.includes(c.id)).map(c=>{const ok=typeof collegeSearchMatches==='function'?collegeSearchMatches(c,q):collegeSearchIndex(c).includes(nq);if(!ok)return null;const score=typeof collegeSearchScore==='function'?collegeSearchScore(c,q):0;return {c,score};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.c.name.localeCompare(b.c.name)).slice(0,12).map(x=>x.c);}
function renderSearchResults(){const input=$('#college-search'),box=$('#college-search-results'),count=$('#search-count');if(!input||!box)return;const q=input.value.trim();count.textContent=selected.length>=4?'Maximum 4 selected':'';if(!q||selected.length>=4){box.hidden=true;box.innerHTML='';return;}const results=searchColleges(q);box.innerHTML=results.length?results.map(c=>`<div class="search-result"><a class="search-result-main profile-inline-link" href="college.html?id=${c.id}"><span class="search-result-name">${esc(c.name)}</span><span class="search-result-meta">${esc(c.city)}, ${esc(c.state)} · ${esc(c.type)}</span></a><button class="search-result-add" type="button" data-add-college="${c.id}">+ Add</button></div>`).join(''):`<div class="search-empty">No matching colleges. Try a shorter name, city, state or abbreviation.</div>`;box.hidden=false;box.querySelectorAll('[data-add-college]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.addCollege);if(selected.length<4&&!selected.includes(id)){selected.push(id);input.value='';box.hidden=true;syncUrl();renderAll();input.focus();}});}
function populateOptions(){const input=$('#college-search');if(!input)return;input.addEventListener('input',renderSearchResults);input.addEventListener('focus',renderSearchResults);input.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#college-search-results').hidden=true;}if(e.key==='Enter'){const first=$('#college-search-results [data-add-college]');if(first){e.preventDefault();first.click();}}});document.addEventListener('click',e=>{if(!e.target.closest('.college-search-block'))$('#college-search-results').hidden=true;});}
function renderPickers(){const root=$('#compare-pickers');if(!root)return;root.innerHTML=selected.map((id,i)=>{const c=collegeById(id);return `<div class="selected-chip"><div class="selected-chip-text"><a class="selected-chip-name profile-inline-link" href="college.html?id=${c.id}">${esc(c.name)}</a><div class="selected-chip-meta">${esc(c.city)}, ${esc(c.state)}</div></div><button type="button" data-remove="${i}" aria-label="Remove ${esc(c.name)}">×</button></div>`;}).join('');root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{selected.splice(Number(b.dataset.remove),1);syncUrl();renderAll();});const ct=$('#selected-count');if(ct)ct.textContent=`${selected.length} / 4`;const sc=$('#search-count');if(sc)sc.textContent=selected.length>=4?'Maximum 4 selected':'';}
function cutoffRoundsFor(id,year){
  const co=recordForYear(id,year); if(!co) return null;
  const cr=categoryRoundsFromRecord(co,category); if(!cr)return null;
  return {R1:posnum(cr.R1),R2:posnum(cr.R2),R3:posnum(cr.R3)};
}
function cutoffRounds(id){return cutoffRoundsFor(id,2026)||cutoffRoundsFor(id,2025);}
function bestR1(ids){
 const vals=ids.map(id=>cutoffRounds(id)?.R1).filter(Boolean); return vals.length?Math.min(...vals):null;
}
function valueClass(val,best,lower=true){return val && best && val===best?' good':'';}
function metric(label, vals, opts={}){
 const valid=opts.numeric?vals.map(v=>posnum(v)).filter(Boolean):[]; const best=valid.length?(opts.lowerBest===false?Math.max(...valid):Math.min(...valid)):null;
 return `<div class="compare-metric">${esc(label)}</div>`+vals.map(v=>{const n=opts.numeric?posnum(v):null; const txt=opts.format?opts.format(v):fmt(v); const unknown=(v===null||v===undefined||v===''||txt==='Unknown'); const body=opts.raw?txt:(opts.numeric&&n?`<span class="num">${n.toLocaleString('en-IN')}</span>`:esc(txt)); return `<div class="compare-value${n&&best===n?' good':''}${unknown?' unknown':''}">${body}</div>`;}).join('');
}
function section(title){return `<div class="compare-section-title">${esc(title)}</div>`;}
function sectionNote(text){return `<div class="compare-section-note">${esc(text)}</div>`;}
function hostelValue(id,key,formatter){const h=HOSTELS[id]; if(!h||!hasHostel(id)) return 'Unknown'; const v=h[key]; return formatter?formatter(v,h):v;}
function joinTruthy(arr){return arr.filter(v=>v!==null&&v!==undefined&&v!=='').join(' · ')||'Unknown';}
function roomProgression(h){if(!h) return 'Unknown'; const r=h.roomAllocation||{}; const parts=[['Y1',r.year1],['Y2',r.year2],['Y3',r.year3],['Y4',r.year4],['Intern',r.internship]].filter(([v])=>v); return parts.length?parts.map(([k,v])=>`${k}: ${v}`).join(' | '):'Unknown';}
function hostelAmenity(h,keys){if(!h)return 'Unknown'; return keys.map(([lab,key])=>h[key]===true?lab:h[key]===false?`No ${lab}`:null).filter(Boolean).join(' · ')||'Unknown';}
function sourceCount(h){return Array.isArray(h?.source)?h.source.length:(Array.isArray(h?.sources)?h.sources.length:'Unknown');}

function aspectRow(label,value,raw=false){const unknown=value===null||value===undefined||value===''||value==='Unknown';const val=raw?value:esc(fmt(value));return `<div class="aspect-row"><span class="aspect-label">${esc(label)}</span><span class="aspect-value${unknown?' unknown':''}">${val}</span></div>`;}
function aspectSection(title,subtitle,cols,cardBuilder,id=''){return `<section class="compare-section-card"${id?` id="${esc(id)}"`:''}><div class="compare-section-head"><h3>${esc(title)}</h3>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><div class="compare-card-grid" style="--compare-cols:${cols.length}">${cols.map(cardBuilder).join('')}</div></section>`;}
function collegeCard(c,body){return `<article class="college-aspect-card"><a class="aspect-college-name profile-inline-link" href="college.html?id=${c.id}" title="${esc(c.name)}">${esc(c.name)}</a>${body}</article>`;}
function trendMini(id){const t=trendFor(id);if(!t)return aspectRow('Demand history','Unknown');const yrs=[2022,2023,2024,2025],vals=yrs.map(y=>posnum(t[y])),known=vals.filter(Boolean);if(!known.length)return aspectRow('Demand history','Unknown');const min=Math.min(...known),max=Math.max(...known),range=Math.max(1,max-min);const bars=vals.map(v=>{if(!v)return `<div class="trend-bar" style="height:8px;opacity:.15"></div>`;const h=18+((max-v)/range)*42;return `<div class="trend-bar" style="height:${h.toFixed(0)}px"><span>${v.toLocaleString('en-IN')}</span></div>`}).join('');return `<div class="trend-mini">${bars}</div><div class="trend-years">${yrs.map(y=>`<span>${y}</span>`).join('')}</div>`;}
function compactRoom(h){
  if(!h) return 'Unknown';
  const y1=h.roomAllocation?.year1||'';
  const txt=String(y1||h.genderRoomAllocation?.boys||h.genderRoomAllocation?.girls||'').trim();
  if(!txt) return 'Unknown';
  const l=txt.toLowerCase();
  if(l.includes('single')&&l.includes('double')) return 'Single / double varies';
  if(l.includes('single')) return 'Single reported';
  if(l.includes('double')||l.includes('two-seater')||l.includes('two seater')) return 'Double sharing';
  if(l.includes('triple')) return 'Triple sharing';
  if(l.includes('shared')) return 'Shared room';
  return txt.length>34?txt.slice(0,31)+'…':txt;
}
function compactBath(h){
  const t=String(h?.bathroom||'').toLowerCase();
  if(!t) return 'Bathroom unknown';
  if(t.includes('attached')&&!t.includes('common')) return 'Attached bath';
  if(t.includes('attached')&&t.includes('common')) return 'Bath varies by block';
  if(t.includes('common')) return 'Common bath';
  return String(h.bathroom).length>28?String(h.bathroom).slice(0,25)+'…':h.bathroom;
}
function compactCooling(h){
  if(!h) return 'Cooling unknown';
  if(h.acProvided===true) return 'AC provided';
  if(h.acAllowed===true) return 'AC allowed';
  if(h.coolerAllowed===true) return 'Cooler allowed';
  if(h.acAllowed===false&&h.coolerAllowed===false) return 'No AC/cooler';
  return 'Cooling unknown';
}
function glanceChip(v){const u=!v||v==='Unknown'||/unknown/i.test(String(v));return `<span class="hostel-glance-chip${u?' unknown':''}">${esc(v||'Unknown')}</span>`;}
function hostelDetailBody(h,ok){
  if(!ok) return '<div class="hostel-note">Detailed hostel research is not available yet.</div>';
  return `<div class="compare-detail-body">
    ${aspectRow('Room progression',roomProgression(h))}
    ${aspectRow('Hostel blocks',h.hostelBlocks)}
    ${aspectRow('Boys allocation',h.genderRoomAllocation?.boys)}
    ${aspectRow('Girls allocation',h.genderRoomAllocation?.girls)}
    ${aspectRow('Room size',h.roomSize)}
    ${aspectRow('Bathroom ratio',h.bathroomRatio)}
    ${aspectRow('Wi-Fi',yesno(h.wifi))}
    ${aspectRow('Power / electricity',joinTruthy([yesno(h.powerBackup),h.electricityReliability]))}
    ${aspectRow('Water',joinTruthy([h.drinkingWater,yesno(h.hotWater)]))}
    ${aspectRow('Laundry / housekeeping',joinTruthy([h.laundry,h.washingMachine,h.housekeeping]))}
    ${aspectRow('Study / recreation',joinTruthy([h.readingRoom===true?'Reading room':null,h.gym===true?'Gym':null,h.commonRoom===true?'Common room':null,h.sportsNearby===true?'Sports nearby':null]))}
    ${aspectRow('Visitor / vehicle rules',joinTruthy([h.visitorRules,h.personalVehicles]))}
    ${aspectRow('Condition',joinTruthy([h.roomCondition,h.hygiene]))}
    ${aspectRow('Renovation / variation',joinTruthy([h.renovationStatus,h.blockVariation]))}
    ${aspectRow('Senior culture',h.raggingSeniorCulture)}
    ${aspectRow('Evidence confidence',h.confidence)}
    ${aspectRow('Sources',hostelSources(h.__collegeId||0),true)}
  </div>`;
}


function hasAcademics(id){return !!ACADEMICS_TEACHING[id];}
function academicsSources(id){const d=ACADEMICS_TEACHING[id];if(!d||!Array.isArray(d.sources)||!d.sources.length)return 'Unknown';return `<div class="compare-source-links">${d.sources.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('')}</div>`;}
function shortAcademic(v,max=42){if(!v)return 'Unknown';const t=String(v);return t.length>max?t.slice(0,max-1)+'…':t;}
function academicsGlance(c,d){if(!d)return `${glanceChip('Academic profile pending')}`;const batch=(c.seats_2026||c.seats)?`${c.seats_2026||c.seats} students/batch`:'Batch unknown';return `${glanceChip(batch)}${glanceChip(shortAcademic(d.attendance,34))}${glanceChip(d.readingHours||'Library hours unknown')}${glanceChip(shortAcademic(d.internalAssessment,34))}`;}
function academicsDetailBody(c){const d=ACADEMICS_TEACHING[c.id];if(!d)return '<div class="hostel-note">Structured academics-and-teaching research is not available for this college yet.</div>';return `<div class="compare-detail-body">
  ${aspectRow('Teaching model',d.teachingModel)}
  ${aspectRow('Attendance',d.attendance)}
  ${aspectRow('Internal assessment',d.internalAssessment)}
  ${aspectRow('Clinical teaching',d.clinicalTeaching)}
  ${aspectRow('Library / reading',d.library)}
  ${aspectRow('Reading hours',d.readingHours)}
  ${aspectRow('Academic culture',d.learningEnvironment)}
  ${aspectRow('What students report',d.studentReported)}
  ${aspectRow('Evidence confidence',d.confidence)}
  ${aspectRow('Sources',academicsSources(c.id),true)}
</div>`;}


function campusSources(id){const d=CAMPUS_STUDENT_LIFE[id];if(!d||!Array.isArray(d.sources)||!d.sources.length)return 'Unknown';return `<div class="compare-source-links">${d.sources.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('')}</div>`;}
function shortCampus(v,max=38){if(!v)return 'Unknown';const t=String(v);return t.length>max?t.slice(0,max-1)+'…':t;}
function campusGlance(d){if(!d)return `${glanceChip('Student-life profile pending')}`;return `${glanceChip(shortCampus(d.fest,28))}${glanceChip(shortCampus(d.sports,34))}${glanceChip(shortCampus(d.city,34))}${glanceChip(d.confidence||'Confidence unknown')}`;}
function campusDetailBody(c){const d=CAMPUS_STUDENT_LIFE[c.id];if(!d)return '<div class="hostel-note">Structured campus & student-life research is not available for this college yet.</div>';return `<div class="compare-detail-body">
  ${aspectRow('Campus character',d.campus)}
  ${aspectRow('Sports / fitness',d.sports)}
  ${aspectRow('Clubs / societies',d.clubs)}
  ${aspectRow('Fest / major events',d.fest)}
  ${aspectRow('Food / hangout',d.food)}
  ${aspectRow('City access',d.city)}
  ${aspectRow('Social culture',d.social)}
  ${aspectRow('Safety / welfare',d.safety)}
  ${aspectRow('Main trade-off',d.tradeoff)}
  ${aspectRow('Evidence confidence',d.confidence)}
  ${aspectRow('Sources',campusSources(c.id),true)}
</div>`;}


function financeSources(id){const d=FEES_BOND_STIPEND[id];if(!d||!Array.isArray(d.sources)||!d.sources.length)return 'Unknown';return `<div class="compare-source-links">${d.sources.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('')}</div>`;}
function shortFinance(v,max=38){if(!v)return 'Unknown';const t=String(v);return t.length>max?t.slice(0,max-1)+'…':t;}
function financeGlance(d){if(!d)return `${glanceChip('Finance profile pending')}`;return `${glanceChip(shortFinance(d.academicFee,38))}${glanceChip(shortFinance(d.hostelFee,30))}${glanceChip(shortFinance(d.internStipend,30))}${glanceChip(shortFinance(d.bond,32))}`;}
function financeDetailBody(c){const d=FEES_BOND_STIPEND[c.id];if(!d)return '<div class="hostel-note">Structured fees / bond / stipend research is not available for this college yet.</div>';return `<div class="compare-detail-body">
  ${aspectRow('Academic fees',d.academicFee)}
  ${aspectRow('Hostel fee',d.hostelFee)}
  ${aspectRow('Mess / food',d.mess)}
  ${aspectRow('Intern stipend',d.internStipend)}
  ${aspectRow('Service bond',d.bond)}
  ${aspectRow('Bond penalty / terms',d.penalty)}
  ${aspectRow('Source currentness',d.currentness)}
  ${aspectRow('Evidence confidence',d.confidence)}
  ${aspectRow('Sources',financeSources(c.id),true)}
</div>`;}

function researchSources(id){const d=RESEARCH_USMLE[id];if(!d||!Array.isArray(d.sources)||!d.sources.length)return 'Unknown';return `<div class="compare-source-links">${d.sources.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('')}</div>`;}
function shortResearch(v,max=40){if(!v)return 'Unknown';const t=String(v);return t.length>max?t.slice(0,max-1)+'…':t;}
function researchGlance(d){if(!d)return `${glanceChip('Research profile pending')}`;return `${glanceChip(shortResearch(d.researchStrength,34))}${glanceChip(shortResearch(d.undergradAccess,36))}${glanceChip(shortResearch(d.internationalPathway,34))}${glanceChip(d.confidence||'Confidence unknown')}`;}
function researchDetailBody(c){const d=RESEARCH_USMLE[c.id];if(!d)return '<div class="hostel-note">Structured research / international-pathway research is not available for this college yet.</div>';return `<div class="compare-detail-body">
  ${aspectRow('Research ecosystem',d.researchStrength)}
  ${aspectRow('Undergraduate access',d.undergradAccess)}
  ${aspectRow('Funding',d.funding)}
  ${aspectRow('Research infrastructure',d.infrastructure)}
  ${aspectRow('Student opportunities',d.studentOpportunities)}
  ${aspectRow('USMLE / international pathway',d.internationalPathway)}
  ${aspectRow('City / networking context',d.cityNetworking)}
  ${aspectRow('International alumni evidence',d.alumniInternational)}
  ${aspectRow('Evidence confidence',d.confidence)}
  ${aspectRow('Sources',researchSources(c.id),true)}
</div>`;}

function hasClinical(id){return !!CLINICAL_EXPOSURE[id];}
function clinicalSources(id){const d=CLINICAL_EXPOSURE[id];if(!d||!Array.isArray(d.sources)||!d.sources.length)return 'Unknown';return `<div class="compare-source-links">${d.sources.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('')}</div>`;}
function shortClinical(v,max=42){if(!v)return 'Unknown';const t=String(v);return t.length>max?t.slice(0,max-1)+'…':t;}
function clinicalDetailBody(c){const d=CLINICAL_EXPOSURE[c.id];if(!d)return '<div class="hostel-note">Structured clinical-exposure research is not available for this college yet.</div>';return `<div class="compare-detail-body">
  ${aspectRow('Teaching hospital(s)',d.hospitals)}
  ${aspectRow('Bed strength',d.beds)}
  ${aspectRow('OPD load',d.opd)}
  ${aspectRow('Emergency',d.emergency)}
  ${aspectRow('Inpatient load',d.ipd)}
  ${aspectRow('Surgery / procedures',d.surgery)}
  ${aspectRow('Trauma',d.trauma)}
  ${aspectRow('Superspecialty breadth',d.superspecialty)}
  ${aspectRow('Patient mix',d.patientMix)}
  ${aspectRow('MBBS learning context',d.teaching)}
  ${aspectRow('Evidence confidence',d.confidence)}
  ${aspectRow('Sources',clinicalSources(c.id),true)}
</div>`;}
function clinicalGlance(d){if(!d)return `${glanceChip('Clinical profile pending')}`;return `${glanceChip(shortClinical(d.beds,34))}${glanceChip(shortClinical(d.opd,38))}${glanceChip(shortClinical(d.emergency,38))}${glanceChip(shortClinical(d.trauma,34))}`;}


function textOrdinal(text){
  const t=String(text||'').toLowerCase(); if(!t)return null;
  if(/unknown|not verified|not established|not found|not reliably|insufficient|limited public|no current|could not|not inserted|unavailable|not separately|not reconstructed/.test(t))return null;
  if(/exceptional|outstanding|very strong|unusually strong|one of the strongest|extremely high|excellent/.test(t))return 4;
  if(/strong|high-volume|large|broad|substantial|active|modern|spacious/.test(t))return 3;
  if(/mixed|moderate|medium|adequate|varies|compact/.test(t))return 2;
  if(/weak|poor|limited|deteriorated|overcrowd|dilapidated|problem/.test(t))return 1;
  return 2.4;
}
function parseLargestNumber(text){
  const t=String(text||'').replace(/,/g,''); const vals=[...t.matchAll(/\b(\d+(?:\.\d+)?)\s*(million|m|lakh|k|thousand)?\b/gi)].map(m=>{let v=Number(m[1]);const u=(m[2]||'').toLowerCase();if(u==='million'||u==='m')v*=1e6;else if(u==='lakh')v*=1e5;else if(u==='k'||u==='thousand')v*=1e3;return v;}).filter(v=>Number.isFinite(v));
  return vals.length?Math.max(...vals):null;
}
function clinicalAutoScore(d){if(!d)return null;let s=0,k=0;const add=(v,w=1)=>{if(Number.isFinite(v)){s+=v*w;k+=w}};const beds=parseLargestNumber(d.beds);if(beds)add(Math.min(4,1+Math.log10(Math.max(beds,100)/100)*1.55),1.1);const opd=parseLargestNumber(d.opd);if(opd)add(Math.min(4,1+Math.log10(Math.max(opd,1000)/1000)*.95),1.35);const er=parseLargestNumber(d.emergency);if(er)add(Math.min(4,1+Math.log10(Math.max(er,100)/100)*.85),.8);add(textOrdinal(d.superspecialty),1);add(textOrdinal(d.trauma),.6);return k?s/k:null;}
function researchAutoScore(d){if(!d)return null;const vals=[textOrdinal(d.researchStrength),textOrdinal(d.undergradAccess),textOrdinal(d.funding),textOrdinal(d.infrastructure),textOrdinal(d.studentOpportunities)].filter(Number.isFinite);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;}
function campusAutoScore(d){if(!d)return null;const vals=[textOrdinal(d.sports),textOrdinal(d.clubs),textOrdinal(d.fest),textOrdinal(d.social)].filter(Number.isFinite);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;}
function networkingAutoScore(d){if(!d)return null;return textOrdinal(d.cityNetworking||d.city);}
function academicAutoScore(d){if(!d)return null;const vals=[textOrdinal(d.teachingModel),textOrdinal(d.clinicalTeaching),textOrdinal(d.library),textOrdinal(d.learningEnvironment)].filter(Number.isFinite);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;}
function firstRupeeNumber(text){const t=String(text||'').replace(/,/g,'');const m=t.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)/i);return m?Number(m[1]):null;}

// Absolute calibration layer for the 30 deeply researched pilot colleges.
// These are evidence-informed decision scores, not a universal national ranking.

function legacyPct(raw){return Number.isFinite(raw)?Math.max(0,Math.min(100,((raw-1)/3)*100)):null;}
function hostelPct(c){const h=HOSTELS[c.id],p=h?hostelDecisionProfile(h):null;return Number.isFinite(p?.overall?.score)?Math.max(0,Math.min(100,((p.overall.score-1)/3)*100)):null;}
function calibratedDimensionScore(c,key){
  const row=DIMENSION_CALIBRATION[c.id];
  if(row&&Number.isFinite(row[key]))return row[key];
  if(key==='hostel')return hostelPct(c);
  if(key==='clinical')return legacyPct(clinicalAutoScore(CLINICAL_EXPOSURE[c.id]));
  if(key==='academics')return legacyPct(academicAutoScore(ACADEMICS_TEACHING[c.id]));
  if(key==='research')return legacyPct(researchAutoScore(RESEARCH_USMLE[c.id]));
  if(key==='campus')return legacyPct(campusAutoScore(CAMPUS_STUDENT_LIFE[c.id]));
  if(key==='networking')return legacyPct(networkingAutoScore(RESEARCH_USMLE[c.id]));
  return null;
}
function advantageMeta(diff){
  if(!Number.isFinite(diff)||diff<=2)return {label:'Essentially tied',cls:'tie'};
  if(diff<=5)return {label:'Slight edge',cls:'slight'};
  if(diff<=10)return {label:'Clear advantage',cls:'clear'};
  return {label:'Major advantage',cls:'major'};
}
function rankedDimension(cols,key){
  const ranked=cols.map(c=>({c,score:calibratedDimensionScore(c,key)})).filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score);
  if(!ranked.length)return {ranked:[],winner:null,meta:{label:'Insufficient data',cls:'tie'},diff:null};
  if(ranked.length===1)return {ranked,winner:ranked[0],meta:{label:'Only one scored profile',cls:'tie'},diff:null};
  const diff=ranked[0].score-ranked[1].score,meta=advantageMeta(diff);
  const tied=meta.cls==='tie'?ranked.filter(x=>ranked[0].score-x.score<=2):[];
  return {ranked,winner:ranked[0],tied,meta,diff};
}
function dimensionHeadline(result){
  if(!result?.ranked?.length)return 'Insufficient data';
  if(result.meta.cls==='tie')return result.tied.map(x=>x.c.name).join(' / ');
  return result.winner.c.name;
}
function dimensionScoreline(result){
  if(!result?.ranked?.length)return '';
  if(result.ranked.length===1)return `Score ${result.ranked[0].score.toFixed(0)}/100`;
  return `${result.ranked[0].score.toFixed(0)} vs ${result.ranked[1].score.toFixed(0)}`;
}
function shortWhy(text,n=86){const s=String(text||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s||'Based on available structured data.';}
function strengthPoints(c){
 const candidates=[
   ['Clinical',calibratedDimensionScore(c,'clinical'),CLINICAL_EXPOSURE[c.id]?.superspecialty||CLINICAL_EXPOSURE[c.id]?.opd],
   ['Hostel',calibratedDimensionScore(c,'hostel'),HOSTELS[c.id]?`${hostelDecisionProfile(HOSTELS[c.id]).overall.label} overall profile`:null],
   ['Academics',calibratedDimensionScore(c,'academics'),ACADEMICS_TEACHING[c.id]?.library||ACADEMICS_TEACHING[c.id]?.teachingModel],
   ['Research',calibratedDimensionScore(c,'research'),RESEARCH_USMLE[c.id]?.undergradAccess||RESEARCH_USMLE[c.id]?.researchStrength],
   ['Student life',calibratedDimensionScore(c,'campus'),CAMPUS_STUDENT_LIFE[c.id]?.sports||CAMPUS_STUDENT_LIFE[c.id]?.social],
   ['Networking',calibratedDimensionScore(c,'networking'),RESEARCH_USMLE[c.id]?.cityNetworking]
 ].filter(x=>Number.isFinite(x[1])).sort((a,b)=>b[1]-a[1]).slice(0,3);
 return candidates.length?candidates.map(([label,score,why])=>({text:`${label}: ${shortWhy(why||'Strong evidence-backed profile',84)}`,score})):[];
}

function dossierCompareBody(c){
 const d=typeof meritProfileIntelligence==='function'?meritProfileIntelligence(c.id):null;
 if(!d)return '<div class="hostel-note">This college is queued for the systematic V7 profile refresh.</div>';
 const facts=(d.hardFacts||[]).slice(0,4).map(([k,v])=>`<div class="dossier-compare-fact"><strong>${esc(k)}</strong><span>${esc(v)}</span></div>`).join('');
 const best=(d.bestFor||[]).slice(0,4).map(x=>`<span class="glance-chip">${esc(x)}</span>`).join('');
 return `<div class="dossier-compare-head">${esc(d.headline)}</div><div class="hostel-glance">${best}</div>${facts?`<div class="dossier-compare-facts">${facts}</div>`:''}<div class="hostel-note"><strong>Main trade-off:</strong> ${esc((d.tradeoffs||[])[0]||'No single dominant trade-off stored yet.')}</div><div class="hostel-note"><strong>Still unresolved:</strong> ${esc((d.unresolved||[])[0]||'No material unresolved field recorded.')}</div>`;
}

function tradeoffFor(c){const ca=CAMPUS_STUDENT_LIFE[c.id],h=HOSTELS[c.id],re=RESEARCH_USMLE[c.id];if(ca?.tradeoff)return ca.tradeoff;if(h?.studentReport&&/poor|mixed|overcrowd|deterior|problem/i.test(h.studentReport))return h.studentReport;if(re?.internationalPathway&&/no formal|limited|not verified|student-driven/i.test(re.internationalPathway))return re.internationalPathway;return 'No single evidence-backed trade-off dominates the current structured profile.';}
function dimensionReason(key,c){
 if(!c)return '';
 if(key==='clinical')return CLINICAL_EXPOSURE[c.id]?.opd||CLINICAL_EXPOSURE[c.id]?.superspecialty||'Clinical ecosystem';
 if(key==='hostel')return HOSTELS[c.id]?`${hostelDecisionProfile(HOSTELS[c.id]).overall.label} derived hostel profile`:'Hostel evidence';
 if(key==='academics')return ACADEMICS_TEACHING[c.id]?.library||ACADEMICS_TEACHING[c.id]?.teachingModel||'Academic ecosystem';
 if(key==='research')return RESEARCH_USMLE[c.id]?.undergradAccess||RESEARCH_USMLE[c.id]?.researchStrength||'Research ecosystem';
 if(key==='campus')return CAMPUS_STUDENT_LIFE[c.id]?.sports||CAMPUS_STUDENT_LIFE[c.id]?.social||'Campus / student life';
 if(key==='networking')return RESEARCH_USMLE[c.id]?.cityNetworking||'City / institutional networking context';
 return '';
}
function renderStrengthSummary(cols){
 const dims=[['Clinical exposure','clinical'],['Hostel','hostel'],['Academics','academics'],['Research ecosystem','research'],['Campus / student life','campus'],['Networking context','networking']];
 const results=dims.map(([label,key])=>({label,key,result:rankedDimension(cols,key)}));
 return `<section class="compare-verdict"><div class="compare-verdict-head"><div><div class="compare-verdict-title">Where each college stands out</div><div class="compare-verdict-sub">Calibrated 0–100 dimension scores from the structured evidence. Scores are decision aids—not a universal ranking. A 0–2 point gap is treated as essentially tied; larger gaps are labelled as slight, clear, or major advantages.</div></div></div><div class="verdict-winners">${results.map(({label,key,result})=>{const lead=result.winner?.c;return `<div class="verdict-win"><div class="verdict-win-label">${esc(label)}</div><div class="verdict-win-name">${esc(dimensionHeadline(result))}</div>${result.ranked.length?`<div class="verdict-scoreline"><strong>${esc(dimensionScoreline(result))}</strong> calibrated score</div>`:''}<span class="verdict-win-edge ${result.meta.cls}">${esc(result.meta.label)}</span><div class="verdict-win-why">${esc(shortWhy(dimensionReason(key,lead),105))}</div></div>`}).join('')}</div><div class="verdict-colleges" style="--compare-cols:${cols.length}">${cols.map(c=>`<article class="verdict-college"><a class="verdict-college-name profile-inline-link" href="college.html?id=${c.id}">${esc(c.name)}</a><div class="verdict-list">${strengthPoints(c).map(x=>`<div class="verdict-point"><span>${esc(x.text)}</span><span class="verdict-point-score">${x.score.toFixed(0)}/100</span></div>`).join('')||'<div class="verdict-point">Profile too incomplete for a calibrated strengths summary.</div>'}</div><div class="verdict-tradeoff"><strong>Main trade-off:</strong> ${esc(shortWhy(tradeoffFor(c),170))}</div></article>`).join('')}</div></section>`;
}


const PRIORITY_DEFAULTS={clinical:3,academics:2,research:3,hostel:2,campus:2,networking:3};
let priorityImportance={...PRIORITY_DEFAULTS};
const PRIORITY_LABELS={clinical:'Clinical exposure',academics:'Academics',research:'Research / international',hostel:'Hostel',campus:'Campus life',networking:'City / networking'};
const IMPORTANCE_LABELS=['Not important','Low','Medium','High','Very high'];
const PRIORITY_PRESETS={
 balanced:{clinical:2,academics:2,research:2,hostel:2,campus:2,networking:2},
 clinical:{clinical:4,academics:3,research:2,hostel:1,campus:1,networking:2},
 research:{clinical:2,academics:2,research:4,hostel:1,campus:1,networking:3},
 campus:{clinical:2,academics:1,research:1,hostel:3,campus:4,networking:2},
 delhi:{clinical:3,academics:2,research:3,hostel:1,campus:2,networking:4},
 comfort:{clinical:2,academics:1,research:1,hostel:4,campus:3,networking:1}
};
function normalizedPriorityWeights(){
 const positive=Object.entries(priorityImportance).filter(([v])=>Number(v)>0);
 const total=positive.reduce((s,[v])=>s+Number(v),0);
 if(!total)return Object.fromEntries(Object.keys(priorityImportance).map(k=>[k,0]));
 const raw=Object.fromEntries(Object.entries(priorityImportance).map(([k,v])=>[k,Number(v)>0?(Number(v)/total)*100:0]));
 // Preserve an exact visible 100% by assigning the rounding residue to the largest weight.
 const rounded=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,Math.round(v)]));
 let residue=100-Object.values(rounded).reduce((a,b)=>a+b,0);
 if(residue){
   const key=Object.entries(raw).sort((a,b)=>b[1]-a[1])[0]?.[0];
   if(key)rounded[key]+=residue;
 }
 return rounded;
}
function priorityRawScore(c,key){return calibratedDimensionScore(c,key);}
function priorityPctScore(raw){if(!Number.isFinite(raw))return null;return Math.max(0,Math.min(100,raw));}
function profileDimensionCoverage(c){
 const dims=[CLINICAL_EXPOSURE[c.id],ACADEMICS_TEACHING[c.id],RESEARCH_USMLE[c.id],CAMPUS_STUDENT_LIFE[c.id],FEES_BOND_STIPEND[c.id],hasHostel(c.id)?HOSTELS[c.id]:null];
 const known=dims.filter(Boolean).length; return {known,total:6,pct:Math.round((known/6)*100)};
}
function priorityCollegeResult(c){
 const weights=normalizedPriorityWeights();
 let weighted=0,used=0;const parts=[];
 const requested=Object.values(weights).reduce((a,b)=>a+(Number(b)>0?Number(b):0),0);
 Object.entries(weights).forEach(([key,w])=>{const raw=priorityRawScore(c,key),pct=priorityPctScore(raw);if(Number.isFinite(pct)&&w>0){weighted+=pct*w;used+=w;parts.push({key,w,pct,contrib:pct*w/100});}else parts.push({key,w,pct:null,contrib:null});});
 const coverage=requested?Math.round((used/requested)*100):0;
 return {c,score:used?weighted/used:null,used,requested,coverage,parts};
}
function renderPriorityRank(cols){
 const ranked=cols.map(priorityCollegeResult).sort((a,b)=>{
   const aq=a.coverage>=60?1:0,bq=b.coverage>=60?1:0;
   if(aq!==bq)return bq-aq;
   return (Number.isFinite(b.score)?b.score:-1)-(Number.isFinite(a.score)?a.score:-1);
 });
 return `<div class="priority-rank" style="--compare-cols:${cols.length}">${ranked.map((r,i)=>{const qualified=r.coverage>=60,provisional=r.coverage<75;return `<article class="priority-card ${i===0&&Number.isFinite(r.score)&&qualified?'winner':''}"><div class="priority-rank-no">${Number.isFinite(r.score)?`${qualified?`#${i+1} fit`:'Provisional fit'}`:'Insufficient data'}</div><div class="priority-name">${esc(r.c.name)}</div><div class="priority-score">${Number.isFinite(r.score)?r.score.toFixed(0):'—'}<small>${Number.isFinite(r.score)?'/100':''}</small></div><div class="priority-coverage"><strong>Evidence coverage ${r.coverage}%</strong>${provisional?`<span class="priority-provisional warn">${qualified?'Use cautiously':'Too incomplete to rank confidently'}</span>`:''}</div><div class="priority-explain">${r.parts.filter(p=>p.w>0).map(p=>Number.isFinite(p.pct)?`<div class="priority-contrib"><span><strong>${esc(PRIORITY_LABELS[p.key])}</strong> · ${p.w}%</span><span>${p.contrib.toFixed(1)}</span></div>`:`<div class="priority-contrib priority-missing"><span>${esc(PRIORITY_LABELS[p.key])} · ${p.w}%</span><span>Unknown</span></div>`).join('')}</div></article>`}).join('')}</div>`;
}

function importanceControl(key,label){
 const current=Number(priorityImportance[key])||0;
 return `<div class="priority-row priority-row-easy"><div class="priority-dimension"><strong>${esc(label)}</strong><span id="priority-auto-${key}"></span></div><div class="importance-segments" role="group" aria-label="${esc(label)} importance">${IMPORTANCE_LABELS.map((txt,i)=>`<button type="button" class="importance-btn ${current===i?'active':''}" data-priority-key="${key}" data-priority-level="${i}" aria-pressed="${current===i?'true':'false'}">${txt}</button>`).join('')}</div></div>`;
}
function renderPriorityMode(cols){
 const weights=normalizedPriorityWeights();
 return `<details class="priority-mode" id="priority-mode" open><summary><span class="priority-summary-copy"><span class="priority-summary-title">Personalize this comparison</span><span class="priority-summary-sub">Just choose how important each factor is. We calculate the percentages automatically.</span></span></summary><div class="priority-inner"><div class="priority-intro">No percentage balancing needed. Pick an importance level for each factor; the site automatically normalizes your choices to 100%. Set a factor to <strong>Not important</strong> to exclude it.</div><div class="priority-presets"><button type="button" class="priority-preset" data-priority-preset="balanced">Balanced</button><button type="button" class="priority-preset" data-priority-preset="clinical">Clinical-first</button><button type="button" class="priority-preset" data-priority-preset="research">Research / USMLE</button><button type="button" class="priority-preset" data-priority-preset="campus">Campus life</button><button type="button" class="priority-preset" data-priority-preset="delhi">Networking</button><button type="button" class="priority-preset" data-priority-preset="comfort">Hostel / comfort</button><button type="button" class="priority-preset" data-priority-reset="1">Reset</button></div><div class="priority-grid priority-grid-easy">${Object.entries(PRIORITY_LABELS).map(([key,label])=>importanceControl(key,label)).join('')}</div><div class="priority-total" id="priority-total">Calculated weights: ${Object.entries(weights).filter(([v])=>v>0).map(([k,v])=>`${PRIORITY_LABELS[k]} ${v}%`).join(' · ')||'Choose at least one factor'}</div><div id="priority-rank-output">${Object.values(weights).some(v=>v>0)?renderPriorityRank(cols):'<div class="compare-empty-state" style="margin-top:10px">Choose at least one factor to calculate your personalized ranking.</div>'}</div></div></details>`;
}
function refreshPriorityUI(){
 const cols=selected.map(collegeById).filter(Boolean),weights=normalizedPriorityWeights();
 document.querySelectorAll('[data-priority-key][data-priority-level]').forEach(btn=>{const active=Number(priorityImportance[btn.dataset.priorityKey])===Number(btn.dataset.priorityLevel);btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');});
 Object.entries(weights).forEach(([k,v])=>{const el=document.getElementById(`priority-auto-${k}`);if(el)el.textContent=v>0?`${IMPORTANCE_LABELS[priorityImportance[k]]} · ${v}%`:'Excluded';});
 const totalEl=document.getElementById('priority-total');if(totalEl)totalEl.textContent=`Calculated weights: ${Object.entries(weights).filter(([v])=>v>0).map(([k,v])=>`${PRIORITY_LABELS[k]} ${v}%`).join(' · ')||'Choose at least one factor'}`;
 const out=document.getElementById('priority-rank-output');if(out)out.innerHTML=Object.values(weights).some(v=>v>0)?renderPriorityRank(cols):'<div class="compare-empty-state" style="margin-top:10px">Choose at least one factor to calculate your personalized ranking.</div>';
}
document.addEventListener('click',e=>{
 const level=e.target.closest?.('[data-priority-key][data-priority-level]');
 if(level){priorityImportance[level.dataset.priorityKey]=Number(level.dataset.priorityLevel)||0;refreshPriorityUI();return;}
 const p=e.target.closest?.('[data-priority-preset]');
 if(p){priorityImportance={...PRIORITY_PRESETS[p.dataset.priorityPreset]};refreshPriorityUI();return;}
 const r=e.target.closest?.('[data-priority-reset]');
 if(r){priorityImportance={...PRIORITY_DEFAULTS};refreshPriorityUI();}
});


function quotaCompareBody(c){
  const profile=getCandidateProfile();
  const enabled=new Set(eligibleQuotaCodes(profile));
  const streams=quotaRecordsForCollege(c.id);
  const order=['AI','SO','DU','IP','ES','AM','JP','DW','IW','FQ','AN'];
  const entries=Object.entries(streams).sort((a,b)=>order.indexOf(a[0])-order.indexOf(b[0]));
  if(!entries.length)return '<div class="compare-movement unknown">No 2026 MCC quota-stream record</div>';
  const rows=entries.map(([code,rec])=>{
    const meta=quotaStreamMeta(code), rounds=categoryRoundsFromRecord(rec,category), cutoff=validRank(rounds&&rounds.R1);
    if(!cutoff)return '';
    const active=enabled.has(code), air=profile.air;
    const state=air?(air<=cutoff?'reached':'missed'):'';
    const margin=air?Math.abs(cutoff-air):null;
    return `<div class="quota-compare-row ${active?'enabled':'disabled'}"><div><strong>${esc(meta.short_label||meta.label||code)}</strong><span>${esc(meta.label||code)}</span></div><div class="quota-compare-rank">${cutoff.toLocaleString('en-IN')}</div><div class="quota-compare-status ${state}">${active?(air?`${state==='reached'?'Reached':'Missed'} by ${margin.toLocaleString('en-IN')}`:'Enabled'):'Not enabled'}</div></div>`;
  }).filter(Boolean).join('');
  return `<div class="quota-compare-list">${rows||'<div class="compare-movement unknown">No category-specific R1 cutoff</div>'}</div>`;
}



function cultureSourceStats(id){
  const d=typeof meritJuniorCulture==='function'?meritJuniorCulture(id):null;
  const sources=Array.isArray(d?.sources)?d.sources:[];
  const stats={official:0,news:0,student:0,other:0,total:sources.length,latest:null};
  sources.forEach(s=>{const k=String(s.kind||'other').toLowerCase();if(k.includes('official'))stats.official++;else if(k.includes('news')||k.includes('report'))stats.news++;else if(k.includes('student')||k.includes('community')||k.includes('reddit'))stats.student++;else stats.other++;const y=Number(s.year);if(Number.isFinite(y))stats.latest=Math.max(stats.latest||0,y);});
  return stats;
}
function first90CoverageCount(f){return f?.coverage?Object.values(f.coverage).filter(Boolean).length:0;}
function cultureSignalClass(d){const t=String(d?.signal?.tone||'').toLowerCase();if(/concern|risk|severe|coerc/.test(t))return 'concern';if(/positive|improv|low/.test(t))return 'positive';return 'unknown';}
function sourceMixText(st){const parts=[];if(st.official)parts.push(`${st.official} official`);if(st.news)parts.push(`${st.news} news`);if(st.student)parts.push(`${st.student} student/community`);if(st.other)parts.push(`${st.other} other`);return parts.length?parts.join(' · '):'No direct profile sources';}
function sourceKindBadge(kind){const k=String(kind||'source').toLowerCase();const cls=k.includes('official')?'official':(k.includes('news')?'news':(k.includes('student')||k.includes('community')?'student':'other'));return `<span class="culture-source-kind ${cls}">${esc(kind||'source')}</span>`;}
function cultureSourceDrawer(id){
  const d=typeof meritJuniorCulture==='function'?meritJuniorCulture(id):null;const sources=Array.isArray(d?.sources)?d.sources:[];
  if(!sources.length)return '<div class="culture-source-empty">No direct profile sources are attached yet. That is an evidence gap, not evidence of safety.</div>';
  return `<div class="culture-source-drawer-list">${sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener"><span>${sourceKindBadge(s.kind)}</span><strong>${esc(s.label||'Source')}</strong><small>${s.year?esc(String(s.year)):''}</small></a>`).join('')}</div>`;
}
function cultureSnapshotCard(c){
  const d=typeof meritJuniorCulture==='function'?meritJuniorCulture(c.id):null;
  if(!d)return `<article class="culture-snapshot-card"><a class="culture-snapshot-name profile-inline-link" href="college.html?id=${c.id}">${esc(c.name)}</a><div class="culture-gap-callout">Junior Culture profile pending. No inference made.</div></article>`;
  const f=typeof meritJuniorFirst90==='function'?meritJuniorFirst90(c.id):null;
  const phaseCount=typeof meritCultureEvidenceCount==='function'?meritCultureEvidenceCount(c.id):0;
  const st=cultureSourceStats(c.id),f90=first90CoverageCount(f),tone=cultureSignalClass(d);
  const official=d.officialResponse||'No current formal response was independently reconstructed in this profile.';
  const why=d.currentPicture||d.signal?.label||'Evidence remains limited.';
  const unknown=d.unknowns||'No explicit unresolved-field note stored.';
  return `<article class="culture-snapshot-card ${tone}">
    <div class="culture-snapshot-top"><a class="culture-snapshot-name profile-inline-link" href="college.html?id=${c.id}">${esc(c.name)}</a><span class="culture-signal ${tone}">${esc(d.signal?.label||'Evidence signal ungraded')}</span></div>
    <p class="culture-snapshot-why">${esc(why)}</p>
    <div class="culture-evidence-metrics">
      <div><span>Confidence</span><strong>${esc(d.signal?.confidence||d.confidence||'Unknown')}</strong></div>
      <div><span>Last checked</span><strong>${esc(d.lastVerified||d.signal?.window||'Unknown')}</strong></div>
      <div><span>Source mix</span><strong>${esc(sourceMixText(st))}</strong></div>
      <div><span>First 90 days</span><strong>${f90}/5 fields · ${phaseCount}/6 timed phases</strong></div>
    </div>
    <div class="culture-evidence-block official"><span>Official / institutional record</span><p>${esc(official)}</p></div>
    <div class="culture-evidence-block lived"><span>Lived / reported evidence</span><p>${st.student||st.news?esc(d.signal?.evidenceMix||`${st.student} student/community and ${st.news} news source(s) attached; claims retain their source status.`):'No current lived/reporting source is attached to this profile.'}</p></div>
    <div class="culture-evidence-block gap"><span>What remains unknown</span><p>${esc(unknown)}</p></div>
    <details class="culture-sources-drawer"><summary>Sources · ${st.total}</summary>${cultureSourceDrawer(c.id)}</details>
  </article>`;
}
function renderCultureSnapshot(cols){
  return `<section class="culture-snapshot" id="compare-culture"><div class="culture-snapshot-head"><div><div class="culture-snapshot-kicker">Evidence first</div><h3>Junior Culture + first 90 days</h3><p>Official safeguards, news reporting and student/community evidence are shown separately. This section does <strong>not</strong> produce a ragging or safety score.</p></div><a href="#compare-culture-detail" class="culture-deep-link">Full field-by-field evidence ↓</a></div><div class="culture-snapshot-grid" style="--compare-cols:${cols.length}">${cols.map(cultureSnapshotCard).join('')}</div></section>`;
}
function renderCompareJumpNav(){
  return `<nav class="compare-jump" aria-label="Jump to comparison section"><span>Jump to</span><a href="#compare-culture">Junior Culture</a><a href="#compare-counselling">Counselling</a><a href="#compare-clinical">Clinical</a><a href="#compare-academics">Academics</a><a href="#compare-research">Research</a><a href="#compare-hostel">Hostel</a><a href="#compare-campus">Campus</a></nav>`;
}

function cultureSourcesHtml(id){
  const d=typeof meritJuniorCulture==='function'?meritJuniorCulture(id):null;if(!d||!Array.isArray(d.sources)||!d.sources.length)return 'Unknown';
  return `<div class="compare-source-links">${d.sources.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label||x.kind||'Source')}</a>`).join('')}</div>`;
}
function cultureGlance(id){
  const d=typeof meritJuniorCulture==='function'?meritJuniorCulture(id):null;if(!d)return `${glanceChip('Junior-culture profile pending')}`;
  const f=typeof meritJuniorFirst90==='function'?meritJuniorFirst90(id):null;
  const n=typeof meritCultureEvidenceCount==='function'?meritCultureEvidenceCount(id):0;
  const incidents=(d.incidents||[]).length;
  return `${d.signal?.label?glanceChip(`Signal: ${d.signal.label}`):''}${d.signal?.confidence?glanceChip(`Confidence: ${d.signal.confidence}`):''}${glanceChip(d.artifactStatus||d.rulebookStatus||'Artifact status unknown')}${glanceChip(f?.evidenceLabel||'First-90 detail limited')}${glanceChip(`${n}/6 timeline phases`)}${glanceChip(`${incidents} dated incident${incidents===1?'':'s'}`)}`;
}
function cultureDetailBody(c){
  const d=typeof meritJuniorCulture==='function'?meritJuniorCulture(c.id):null;if(!d)return '<div class="hostel-note">Structured Junior Culture research is not available for this college yet.</div>';
  const f=typeof meritJuniorFirst90==='function'?meritJuniorFirst90(c.id):null;
  const tl=typeof meritFreshersTimeline==='function'?meritFreshersTimeline(c.id):[];
  const incidents=(d.incidents||[]).length?`<div class="culture-compare-incidents">${d.incidents.map(x=>`<div><strong>${esc(x.year||'')} · ${esc(x.label||'Incident')}</strong><span>${esc(x.detail||'')}</span></div>`).join('')}</div>`:'<div class="hostel-note">No dated incident is stored in this profile.</div>';
  const timeline=tl.length?`<div class="culture-compare-timeline">${tl.map(x=>`<div class="culture-compare-phase ${x.grade==='GAP'?'gap':''}"><strong>${esc(x.label)} · ${esc(x.grade)}</strong><span>${esc(x.summary)}</span></div>`).join('')}</div>`:'';
  return `<div class="compare-detail-body">
  ${aspectRow('Current picture',d.currentPicture)}
  ${d.signal?aspectRow('Current evidence signal',`${d.signal.label} · ${d.signal.confidence||'confidence not graded'} · ${d.signal.window||'window not recorded'}`):''}
  ${d.signal?aspectRow('Hostel / residence signal',d.signal.hostelRisk):''}
  ${d.signal?aspectRow('Grooming / dress signal',d.signal.grooming):''}
  ${d.signal?aspectRow('Social-coercion signal',d.signal.socialCoercion):''}
  ${d.signal?aspectRow('Physical-safety evidence',d.signal.physicalSafety):''}
  ${d.signal?aspectRow('Administrative enforcement',d.signal.enforcement):''}
  ${d.signal?aspectRow('Evidence mix',d.signal.evidenceMix):''}
  ${aspectRow('Rulebook / artifact',d.artifactStatus||d.rulebookStatus)}
  ${aspectRow('Ground rules',d.groundRules)}
  ${aspectRow('Intro / PDP',d.introCulture)}
  ${aspectRow('Dress / appearance',d.dressAppearance)}
  ${aspectRow('Movement / common areas',d.movementCommonAreas)}
  ${aspectRow('Senior-junior relationship',d.seniorJunior)}
  ${aspectRow('Positive mentoring',d.positives)}
  ${f?aspectRow('First weeks',f.firstWeeks):''}
  ${f?aspectRow('Hosteller vs day scholar',f.hostellerVsDayScholar):''}
  ${f?aspectRow('Boys / girls',f.genderDifferences):''}
  ${f?aspectRow('If students opt out',f.optOut):''}
  ${f?aspectRow('After freshers',f.afterFreshers):''}
  ${aspectRow('Official response',d.officialResponse)}
  ${aspectRow('Trend',d.trend)}
  ${aspectRow('What remains unknown',d.unknowns)}
  ${aspectRow('Evidence confidence',d.confidence)}
  ${incidents}${timeline}${aspectRow('Sources',cultureSourcesHtml(c.id),true)}
  </div>`;
}

function renderComparison(){const cols=selected.map(collegeById).filter(Boolean),n=cols.length;document.documentElement.style.setProperty('--compare-cols',n);if(n<2){$('#compare-output').innerHTML='<div class="compare-empty-state">Search above and add at least two colleges to start comparing.</div>';return;}let out=`<div class="compare-output-v3"><div class="compare-overview-grid" style="--compare-cols:${n}">`;out+=cols.map(c=>{const r=cutoffRounds(c.id),h=hasHostel(c.id),cov=profileDimensionCoverage(c);return `<article class="compare-overview-card"><a class="compare-overview-name profile-inline-link" href="college.html?id=${c.id}">${esc(c.name)}</a><div class="compare-overview-meta">${esc(c.city)}, ${esc(c.state)} · ${esc(c.type)}</div><div class="compare-overview-stats"><span class="compare-pill">${fmt(c.seats_2026||c.seats)} seats</span>${r?.R1?`<span class="compare-pill accent">R1 ${r.R1.toLocaleString('en-IN')}</span>`:''}<span class="compare-pill">${h?'Hostel researched':'Hostel pending'}</span><span class="compare-pill profile-coverage-pill">Profile ${cov.known}/${cov.total}</span></div></article>`}).join('')+`</div>`;
out+=renderCompareJumpNav();
out+=renderCultureSnapshot(cols);
out+=renderStrengthSummary(cols);
out+=renderPriorityMode(cols);
out+=renderDeepResearch(cols);
out+=aspectSection('College profile','Key institutional facts.',cols,c=>collegeCard(c,aspectRow('City / state',`${c.city}, ${c.state}`)+aspectRow('Institution type',c.type)+aspectRow('Management',c.management)+aspectRow('Established',c.established)));
out+=aspectSection('MBBS seats · 2026','Current intake.',cols,c=>collegeCard(c,aspectRow('Total MBBS seats',c.seats_2026||c.seats)+aspectRow('Increase for 2026',c.seats_increased_2026)));
out+=aspectSection(`2026 MCC Round 1 · quota routes · ${category}`,'Each counselling pool is shown separately. Enabled status follows your saved profile; no AIQ/DU/IPU/ESI cutoff is merged with another.',cols,c=>collegeCard(c,quotaCompareBody(c)),'compare-counselling');
out+=aspectSection(`AIQ/Open Round 1 · 2026 vs 2025 · ${category}`,'2026 R1 is provisional. Lower AIR means more competitive; negative movement means stronger demand.',cols,c=>{const r26=cutoffRoundsFor(c.id,2026)||{},r25=cutoffRoundsFor(c.id,2025)||{},m=getRoundMovement(c.id,category,'R1');return collegeCard(c,`<div class="cutoff-tiles"><div class="cutoff-tile"><div class="cutoff-round">2025 R1</div><div class="cutoff-air${r25.R1?'':' unknown'}">${r25.R1?r25.R1.toLocaleString('en-IN'):'Unknown'}</div></div><div class="cutoff-tile"><div class="cutoff-round">2026 R1</div><div class="cutoff-air${r26.R1?'':' unknown'}">${r26.R1?r26.R1.toLocaleString('en-IN'):'Unknown'}</div></div></div>${m?`<div class="compare-movement ${m.direction}"><strong>${m.direction==='stronger'?'↓ Stronger':'↑ Softer'}</strong><span>${m.magnitude.toLocaleString('en-IN')} AIR vs 2025</span></div>`:'<div class="compare-movement unknown">No comparable R1 pair</div>'}`)});
out+=aspectSection(`AIQ/Open historical rounds · 2025 · ${category}`,'R2/R3 history remains useful context while later 2026 rounds are pending.',cols,c=>{const r=cutoffRoundsFor(c.id,2025)||{};return collegeCard(c,`<div class="cutoff-tiles">${['R1','R2','R3'].map(x=>`<div class="cutoff-tile"><div class="cutoff-round">${x}</div><div class="cutoff-air${r[x]?'':' unknown'}">${r[x]?r[x].toLocaleString('en-IN'):'Unknown'}</div></div>`).join('')}</div>`)});
out+=aspectSection('Round-1 demand history','Median AIR where reconstructed; missing history means unresearched.',cols,c=>{const t=trendFor(c.id);let move='Unknown';if(t&&posnum(t[2022])&&posnum(t[2025])){const d=t[2025]-t[2022];move=`${Math.abs(d).toLocaleString('en-IN')} ranks ${d<0?'stronger':d>0?'weaker':'flat'}`;}return collegeCard(c,trendMini(c.id)+aspectRow('2022 → 2025',move));});
out+=aspectSection('Decision dossier','Current source-led synthesis: strongest use-cases, hard facts, trade-offs and unresolved gaps. No service-bond weighting.',cols,c=>collegeCard(c,dossierCompareBody(c)));
out+=aspectSection('Academics & teaching','Teaching structure, attendance, assessment and study infrastructure. Student-reported strictness is labelled separately from official rules.',cols,c=>{const d=ACADEMICS_TEACHING[c.id];return collegeCard(c,`<div class="hostel-glance">${academicsGlance(c,d)}</div>${d&&d.learningEnvironment?`<div class="hostel-note">${esc(String(d.learningEnvironment).length>155?String(d.learningEnvironment).slice(0,152)+'…':d.learningEnvironment)}</div>`:''}<details class="compare-detail-toggle"><summary>View academic details</summary>${academicsDetailBody(c)}</details>`) },'compare-academics');
out+=aspectSection('Research & international pathway','Undergraduate research access, funding, mentorship and international-pathway context. No fake USMLE score: weak or unverified evidence stays explicitly limited.',cols,c=>{const d=RESEARCH_USMLE[c.id];return collegeCard(c,`<div class="hostel-glance">${researchGlance(d)}</div>${d&&d.studentOpportunities?`<div class="hostel-note">${esc(String(d.studentOpportunities).length>155?String(d.studentOpportunities).slice(0,152)+'…':d.studentOpportunities)}</div>`:''}<details class="compare-detail-toggle"><summary>View research / international details</summary>${researchDetailBody(c)}</details>`) },'compare-research');
out+=aspectSection('Fees, bond & internship stipend','Current official figures are preferred. Stale fee schedules and unverified bond penalties are explicitly flagged instead of silently reused.',cols,c=>{const d=FEES_BOND_STIPEND[c.id];return collegeCard(c,`<div class="hostel-glance">${financeGlance(d)}</div>${d&&d.currentness?`<div class="hostel-note">${esc(String(d.currentness).length>155?String(d.currentness).slice(0,152)+'…':d.currentness)}</div>`:''}<details class="compare-detail-toggle"><summary>View fees / bond / stipend details</summary>${financeDetailBody(c)}</details>`) });
out+=aspectSection('Campus & student life','Campus character, sports, fests, societies and city access. Official facilities are separated from student-reported lived experience.',cols,c=>{const d=CAMPUS_STUDENT_LIFE[c.id];return collegeCard(c,`<div class="hostel-glance">${campusGlance(d)}</div>${d&&d.tradeoff?`<div class="hostel-note">${esc(String(d.tradeoff).length>155?String(d.tradeoff).slice(0,152)+'…':d.tradeoff)}</div>`:''}<details class="compare-detail-toggle"><summary>View campus / student-life details</summary>${campusDetailBody(c)}</details>`) },'compare-campus');
out+=aspectSection('Clinical exposure','Hospital scale, patient load and tertiary-care breadth. Official figures are preferred; unknowns stay unknown.',cols,c=>{const d=CLINICAL_EXPOSURE[c.id];return collegeCard(c,`<div class="hostel-glance">${clinicalGlance(d)}</div>${d&&d.superspecialty?`<div class="hostel-note">${esc(String(d.superspecialty).length>150?String(d.superspecialty).slice(0,147)+'…':d.superspecialty)}</div>`:''}<details class="compare-detail-toggle"><summary>View clinical details</summary>${clinicalDetailBody(c)}</details>`)},'compare-clinical');
out+=aspectSection('Hostel','Quick decision view. Open details only when you want the full evidence.',cols,c=>{const h=HOSTELS[c.id],ok=hasHostel(c.id),prof=ok?hostelDecisionProfile(h):null;if(h)h.__collegeId=c.id;const fee=ok?(h.annualFee||'Fee unknown'):'Fee unknown';const mess=ok?(h.messMonthly||'Mess unknown'):'Mess unknown';const curfew=ok?(h.curfew||'Curfew unknown'):'Curfew unknown';return collegeCard(c,`<div class="hostel-badge-line">${qualityBadge(prof?.overall?.label||'Unknown')}</div><div class="hostel-glance">${glanceChip(ok?compactRoom(h):'Room unknown')}${glanceChip(ok?compactBath(h):'Bathroom unknown')}${glanceChip(fee)}${glanceChip(mess)}${glanceChip(ok?compactCooling(h):'Cooling unknown')}${glanceChip(curfew)}</div>${ok&&h.studentReport?`<div class="hostel-note">${esc(String(h.studentReport).length>145?String(h.studentReport).slice(0,142)+'…':h.studentReport)}</div>`:''}<details class="compare-detail-toggle"><summary>View hostel details</summary>${hostelDetailBody(h,ok)}</details>`)},'compare-hostel');
out+=aspectSection('Junior experience & senior culture','No single ragging score. Compare current picture, informal-rule signals, First-90 evidence, opt-out/residence differences, dated incidents and official response side by side.',cols,c=>{const d=typeof meritJuniorCulture==='function'?meritJuniorCulture(c.id):null;return collegeCard(c,`<div class="hostel-glance">${cultureGlance(c.id)}</div>${d?.currentPicture?`<div class="hostel-note">${esc(String(d.currentPicture).length>190?String(d.currentPicture).slice(0,187)+'…':d.currentPicture)}</div>`:''}<details class="compare-detail-toggle"><summary>View Junior Culture evidence</summary>${cultureDetailBody(c)}</details>`) },'compare-culture-detail');
out+='</div>';$('#compare-output').innerHTML=out;}
let differencesOnly=false;
function normDiffText(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase();}
function applyDifferenceFilter(){
 const btn=document.getElementById('diff-toggle');
 if(btn){btn.classList.toggle('diff-active',differencesOnly);btn.setAttribute('aria-pressed',differencesOnly?'true':'false');btn.textContent=differencesOnly?'Showing differences only':'Show only differences';}
 document.querySelectorAll('.diff-hidden').forEach(el=>el.classList.remove('diff-hidden'));
 document.querySelectorAll('.compare-section-card.diff-no-differences').forEach(el=>el.classList.remove('diff-no-differences'));
 if(!differencesOnly)return;
 document.querySelectorAll('.compare-section-card').forEach(section=>{
   const cards=[...section.querySelectorAll(':scope .compare-card-grid > .college-aspect-card')];
   if(cards.length<2)return;
   let anySimpleDifference=false;
   const labels=new Set();
   cards.forEach(card=>card.querySelectorAll('.aspect-row .aspect-label').forEach(l=>labels.add(normDiffText(l.textContent))));
   labels.forEach(label=>{
     const rows=cards.map(card=>[...card.querySelectorAll('.aspect-row')].find(r=>normDiffText(r.querySelector('.aspect-label')?.textContent)===label));
     if(rows.every(Boolean)){const vals=rows.map(r=>normDiffText(r.querySelector('.aspect-value')?.textContent));if(vals.every(v=>v===vals[0]))rows.forEach(r=>r.classList.add('diff-hidden'));else anySimpleDifference=true;}
   });
   const rounds=['r1','r2','r3'];
   rounds.forEach(round=>{const tiles=cards.map(card=>[...card.querySelectorAll('.cutoff-tile')].find(t=>normDiffText(t.querySelector('.cutoff-round')?.textContent)===round));if(tiles.every(Boolean)){const vals=tiles.map(t=>normDiffText(t.querySelector('.cutoff-air')?.textContent));if(vals.every(v=>v===vals[0]))tiles.forEach(t=>t.classList.add('diff-hidden'));else anySimpleDifference=true;}});
   const simpleRows=[...section.querySelectorAll('.aspect-row,.cutoff-tile')];
   if(simpleRows.length&&simpleRows.every(x=>x.classList.contains('diff-hidden')))section.classList.add('diff-no-differences');
 });
}
function renderAll(){renderPickers(); $('#compare-category').value=category; renderComparison(); applyDifferenceFilter();}

$('#compare-category').addEventListener('change',e=>{category=e.target.value; syncUrl(); renderComparison(); applyDifferenceFilter();});
$('#diff-toggle').addEventListener('click',()=>{differencesOnly=!differencesOnly;applyDifferenceFilter();});
$('#copy-link').addEventListener('click',async()=>{syncUrl(); try{await navigator.clipboard.writeText(location.href); $('#copy-link').textContent='Copied'; setTimeout(()=>$('#copy-link').textContent='Copy link',1200);}catch(e){prompt('Copy this comparison link',location.href);}});



initFromUrl(); populateOptions(); initTheme(); syncUrl(); renderAll();

window.addEventListener('candidateprofilechange',()=>{renderComparison();applyDifferenceFilter();});
