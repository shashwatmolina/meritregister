
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
const ALL_COLLEGES = [{"id":1,"name":"Andaman & Nicobar Islands Institute of Medical Sciences, Port Blair","state":"Andaman & Nicobar Islands","city":"Port Blair","type":"State","management":"Govt.","established":2015,"seats":114,"seats_2026":114,"nmc_code_2026":"AN/001/G/1","seats_renewed_2026":114,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":2,"name":"ACSR Government Medical College, Nellore","state":"Andhra Pradesh","city":"Nellore","type":"State","management":"State Govt.","established":2014,"seats":200,"seats_2026":200,"nmc_code_2026":"AP/001/G/1","seats_renewed_2026":175,"seats_increased_2026":25,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":3,"name":"All India Institute of Medical Sciences, Mangalagiri, Vijayawada","state":"Andhra Pradesh","city":"Vijayawada","type":"AIIMS","management":"Central Govt.","established":2018,"seats":125,"seats_2026":125,"mcc_code_2026":"200510","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":4,"name":"Andhra Medical College, Visakhapatnam","state":"Andhra Pradesh","city":"Visakhapatnam","type":"State","management":"State Govt.","established":1923,"seats":250,"seats_2026":250,"nmc_code_2026":"AP/003/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":5,"name":"Government Medical College, Ananthapuram","state":"Andhra Pradesh","city":"Ananthapuram","type":"State","management":"State Govt.","established":2000,"seats":200,"seats_2026":200,"nmc_code_2026":"AP/010/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":6,"name":"Government Medical College, Eluru","state":"Andhra Pradesh","city":"Eluru","type":"State","management":"State Govt.","established":2023,"seats":150,"seats_2026":150,"nmc_code_2026":"AP/011/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":7,"name":"Rajiv Gandhi Institute of Medical Sciences, Kadapa","state":"Andhra Pradesh","city":"Kadapa","type":"State","management":"State Govt.","established":2006,"seats":250,"seats_2026":250,"nmc_code_2026":"AP/030/G/1","seats_renewed_2026":175,"seats_increased_2026":75,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":8,"name":"Government Medical College, Machilipatnam","state":"Andhra Pradesh","city":"Machilipatnam","type":"State","management":"State Govt.","established":2023,"seats":150,"seats_2026":150,"nmc_code_2026":"AP/012/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":9,"name":"Government Medical College, Nandyal","state":"Andhra Pradesh","city":"Nandyal","type":"State","management":"State Govt.","established":2023,"seats":150,"seats_2026":150,"nmc_code_2026":"AP/013/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":10,"name":"Rajiv Gandhi Institute of Medical Sciences, Ongole","state":"Andhra Pradesh","city":"Ongole","type":"State","management":"State Govt.","established":2011,"seats":150,"seats_2026":150,"nmc_code_2026":"AP/031/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":11,"name":"Government Medical College, Paderu, Visakhapatnam","state":"Andhra Pradesh","city":"Visakhapatnam","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"AP/014/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":12,"name":"Government Medical College, Rajamahendravaram","state":"Andhra Pradesh","city":"Rajamahendravaram","type":"State","management":"State Govt.","established":2023,"seats":150,"seats_2026":150,"nmc_code_2026":"AP/015/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":13,"name":"Government Medical College, Vizianagaram","state":"Andhra Pradesh","city":"Vizianagaram","type":"State","management":"State Govt.","established":2023,"seats":150,"seats_2026":150,"nmc_code_2026":"AP/016/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":14,"name":"Government Siddhartha Medical College, Vijaywada","state":"Andhra Pradesh","city":"Vijaywada","type":"State","management":"State Govt.","established":1980,"seats":250,"seats_2026":250,"nmc_code_2026":"AP/017/G/1","seats_renewed_2026":175,"seats_increased_2026":75,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":15,"name":"Guntur Medical College, Guntur","state":"Andhra Pradesh","city":"Guntur","type":"State","management":"State Govt.","established":1946,"seats":250,"seats_2026":250,"nmc_code_2026":"AP/020/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":16,"name":"Kurnool Medical College, Kurnool","state":"Andhra Pradesh","city":"Kurnool","type":"State","management":"State Govt.","established":1957,"seats":250,"seats_2026":250,"nmc_code_2026":"AP/023/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":17,"name":"Rajiv Gandhi Institute of Medical Sciences, Srikakulam","state":"Andhra Pradesh","city":"Srikakulam","type":"State","management":"State Govt.","established":2008,"seats":200,"seats_2026":200,"nmc_code_2026":"AP/032/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":18,"name":"Rangaraya Medical College, Kakinada","state":"Andhra Pradesh","city":"Kakinada","type":"State","management":"State Govt.","established":1958,"seats":250,"seats_2026":250,"nmc_code_2026":"AP/033/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":19,"name":"S V Medical College, Tirupati","state":"Andhra Pradesh","city":"Tirupati","type":"State","management":"State Govt.","established":1960,"seats":240,"seats_2026":240,"nmc_code_2026":"AP/034/G/1","seats_renewed_2026":240,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":20,"name":"SVIMS - Sri Padmavathi Medical College for Women, Tirupati","state":"Andhra Pradesh","city":"Tirupati","type":"State","management":"State Govt.","established":2014,"seats":175,"seats_2026":175,"nmc_code_2026":"AP/037/G/1","seats_renewed_2026":175,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":459,"name":"Government Medical College, Piduguralla","state":"Andhra Pradesh","city":"Piduguralla","type":"State","management":"State Govt.","established":2026,"seats":50,"mcc_code_2026":"904737","seats_2026":50,"nmc_code_2026":"New Establishment","seats_renewed_2026":0,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":21,"name":"Tomo Riba Institute of Health & Medical Sciences, Naharlagun","state":"Arunachal Pradesh","city":"Naharlagun","type":"State","management":"State Govt.","established":2018,"seats":100,"seats_2026":100,"nmc_code_2026":"AR/001/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":22,"name":"All India Institute of Medical Sciences, Guwahati","state":"Assam","city":"Guwahati","type":"AIIMS","management":"Central Govt.","established":2020,"seats":100,"seats_2026":100,"mcc_code_2026":"200519","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":23,"name":"Assam Medical College, Dibrugarh","state":"Assam","city":"Dibrugarh","type":"State","management":"State Govt.","established":1947,"seats":250,"seats_2026":250,"nmc_code_2026":"AS/001/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":24,"name":"Dhubri Medical College, Dhubri","state":"Assam","city":"Dhubri","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"AS/002/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":25,"name":"Diphu Medical College & Hospital, Diphu","state":"Assam","city":"Diphu","type":"State","management":"State Govt.","established":2020,"seats":100,"seats_2026":100,"nmc_code_2026":"AS/003/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":26,"name":"ESIC Medical College and Hospital, Beltola","state":"Assam","city":"Beltola","type":"ESIC","management":"Central Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"AS/004/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":27,"name":"Fakhruddin Ali Ahmed Medical College, Barpeta","state":"Assam","city":"Barpeta","type":"State","management":"State Govt.","established":2012,"seats":125,"seats_2026":125,"nmc_code_2026":"AS/005/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":28,"name":"Gauhati Medical College, Guwahati","state":"Assam","city":"Guwahati","type":"State","management":"State Govt.","established":1960,"seats":250,"seats_2026":250,"nmc_code_2026":"AS/006/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":29,"name":"Jorhat Medical College & Hospital, Jorhat","state":"Assam","city":"Jorhat","type":"State","management":"State Govt.","established":2010,"seats":125,"seats_2026":125,"nmc_code_2026":"AS/007/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":30,"name":"Kokrajhar Medical College, Kokrajhar","state":"Assam","city":"Kokrajhar","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"AS/008/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":31,"name":"Lakhimpur Medical College, Lakhimpur","state":"Assam","city":"Lakhimpur","type":"State","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"AS/009/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":32,"name":"Nagaon Medical College, Nagaon","state":"Assam","city":"Nagaon","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"AS/010/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":33,"name":"Nalbari Medical College, Nalbari","state":"Assam","city":"Nalbari","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"AS/011/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":34,"name":"Silchar Medical College, Silchar","state":"Assam","city":"Silchar","type":"State","management":"State Govt.","established":1968,"seats":150,"seats_2026":150,"nmc_code_2026":"AS/013/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":35,"name":"Tezpur Medical College & Hospital, Tezpur","state":"Assam","city":"Tezpur","type":"State","management":"State Govt.","established":2014,"seats":125,"seats_2026":125,"nmc_code_2026":"AS/014/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":36,"name":"Tinsukia Medical College, Luhari","state":"Assam","city":"Luhari","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"AS/015/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":37,"name":"Pragjyotishpur Medical College, Guwahati","state":"Assam","city":"Guwahati","type":"State","management":"State Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"AS/012/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":38,"name":"All India Institute of Medical Sciences, Patna","state":"Bihar","city":"Patna","type":"AIIMS","management":"Central Govt.","established":2012,"seats":125,"seats_2026":125,"mcc_code_2026":"200508","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":39,"name":"Anugrah Narayan Magadh Medical College, Gaya","state":"Bihar","city":"Gaya","type":"State","management":"State Govt.","established":1970,"seats":120,"seats_2026":120,"nmc_code_2026":"BR/001/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":40,"name":"Bhagwan Mahavir Institute of Medical Sciences, Pawapuri, Nalanda","state":"Bihar","city":"Nalanda","type":"State","management":"State Govt.","established":2013,"seats":120,"seats_2026":120,"nmc_code_2026":"BR/023/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":41,"name":"Darbhanga Medical College, Lehriasarai","state":"Bihar","city":"Lehriasarai","type":"State","management":"State Govt.","established":1946,"seats":150,"seats_2026":150,"nmc_code_2026":"BR/002/G/1","seats_renewed_2026":120,"seats_increased_2026":30,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":42,"name":"ESIC Medical College & Hospital, Bihta, Patna","state":"Bihar","city":"Bihta","type":"ESIC","management":"Central Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"BR/003/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":43,"name":"Government Medical College, Bettiah","state":"Bihar","city":"Bettiah","type":"State","management":"State Govt.","established":2013,"seats":120,"seats_2026":120,"nmc_code_2026":"BR/004/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":44,"name":"Government Medical College, Purnea","state":"Bihar","city":"Purnea","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"BR/005/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":45,"name":"Indira Gandhi Institute of Medical Sciences, Sheikhpura, Patna","state":"Bihar","city":"Patna","type":"State","management":"State Govt.","established":2011,"seats":150,"seats_2026":150,"nmc_code_2026":"BR/007/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":46,"name":"Jannayak Karpoori Thakur Medical College & Hospital, Madhepura","state":"Bihar","city":"Madhepura","type":"State","management":"State Govt.","established":2020,"seats":100,"seats_2026":100,"nmc_code_2026":"BR/008/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":47,"name":"Jawaharlal Nehru Medical College, Bhagalpur","state":"Bihar","city":"Bhagalpur","type":"State","management":"State Govt.","established":1971,"seats":150,"seats_2026":150,"nmc_code_2026":"BR/009/G/1","seats_renewed_2026":120,"seats_increased_2026":30,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":48,"name":"Nalanda Medical College, Patna","state":"Bihar","city":"Patna","type":"State","management":"State Govt.","established":1970,"seats":200,"seats_2026":200,"nmc_code_2026":"BR/015/G/1","seats_renewed_2026":150,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":49,"name":"Patna Medical College, Patna","state":"Bihar","city":"Patna","type":"State","management":"State Govt.","established":1925,"seats":250,"seats_2026":250,"nmc_code_2026":"BR/018/G/1","seats_renewed_2026":200,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":50,"name":"Shri Krishna Medical College, Muzzafarpur","state":"Bihar","city":"Muzzafarpur","type":"State","management":"State Govt.","established":1970,"seats":150,"seats_2026":150,"nmc_code_2026":"BR/021/G/1","seats_renewed_2026":120,"seats_increased_2026":30,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":51,"name":"Government Medical College, Chandigarh","state":"Chandigarh","city":"Chandigarh","type":"State","management":"Govt.","established":1991,"seats":200,"seats_2026":200,"nmc_code_2026":"CH/001/G/1","seats_renewed_2026":150,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":52,"name":"All India Institute of Medical Sciences, Raipur","state":"Chhattisgarh","city":"Raipur","type":"AIIMS","management":"Central Govt.","established":2012,"seats":125,"seats_2026":125,"mcc_code_2026":"200506","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":53,"name":"Chandulal Chandrakar Memorial Medical College, Durg","state":"Chhattisgarh","city":"Durg","type":"State","management":"State Govt.","established":2013,"seats":200,"seats_2026":200,"nmc_code_2026":"CG/002/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":54,"name":"Chhattisgarh Institute of Medical Sciences, Bilaspur","state":"Chhattisgarh","city":"Bilaspur","type":"State","management":"State Govt.","established":2001,"seats":150,"seats_2026":150,"nmc_code_2026":"CG/003/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":55,"name":"Government Medical College, Kanker","state":"Chhattisgarh","city":"Kanker","type":"State","management":"State Govt.","established":2021,"seats":125,"seats_2026":125,"nmc_code_2026":"CG/015/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":56,"name":"Government Medical College, Korba","state":"Chhattisgarh","city":"Korba","type":"State","management":"State Govt.","established":2022,"seats":125,"seats_2026":125,"nmc_code_2026":"CG/006/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":57,"name":"Bharat Ratna Atal Bihari Vajpayee Memorial Medical College, Rajnandgaon","state":"Chhattisgarh","city":"Rajnandgaon","type":"State","management":"State Govt.","established":2014,"seats":125,"seats_2026":125,"nmc_code_2026":"CG/004/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":58,"name":"Rajmata Devendra Kumari Singhdeo Government Medical College, Ambikapur","state":"Chhattisgarh","city":"Ambikapur","type":"State","management":"State Govt.","established":2016,"seats":125,"seats_2026":125,"nmc_code_2026":"CG/005/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":59,"name":"Government Medical College, Mahasamund","state":"Chhattisgarh","city":"Mahasamund","type":"State","management":"State Govt.","established":2022,"seats":125,"seats_2026":125,"nmc_code_2026":"CG/007/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":60,"name":"Late Baliram Kashyap Memorial Govt. Medical College, Jagdalpur","state":"Chhattisgarh","city":"Jagdalpur","type":"State","management":"State Govt.","established":2006,"seats":150,"seats_2026":150,"nmc_code_2026":"CG/008/G/1","seats_renewed_2026":125,"seats_increased_2026":25,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":61,"name":"Late Lakhi Ram Agrawal Memorial Govt. Medical College, Raigarh","state":"Chhattisgarh","city":"Raigarh","type":"State","management":"State Govt.","established":2013,"seats":100,"seats_2026":100,"nmc_code_2026":"CG/009/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":62,"name":"Pt. J N M Medical College, Raipur","state":"Chhattisgarh","city":"Raipur","type":"State","management":"State Govt.","established":1963,"seats":250,"seats_2026":250,"nmc_code_2026":"CG/010/G/1","seats_renewed_2026":230,"seats_increased_2026":20,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":460,"name":"Government Medical College, Dantewada","state":"Chhattisgarh","city":"Dantewada","type":"State","management":"State Govt.","established":2026,"seats":50,"mcc_code_2026":"904738","seats_2026":50,"nmc_code_2026":"New Establishment","seats_renewed_2026":0,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":461,"name":"Government Medical College, Janjgir-Champa","state":"Chhattisgarh","city":"Janjgir-Champa","type":"State","management":"State Govt.","established":2026,"seats":50,"mcc_code_2026":"904739","seats_2026":50,"nmc_code_2026":"New Establishment","seats_renewed_2026":0,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":462,"name":"Government Medical College, Jashpur-Kunkuri","state":"Chhattisgarh","city":"Kunkuri","type":"State","management":"State Govt.","established":2026,"seats":50,"mcc_code_2026":"904740","seats_2026":50,"nmc_code_2026":"New Establishment","seats_renewed_2026":0,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":463,"name":"Government Medical College, Kabeerdham","state":"Chhattisgarh","city":"Kawardha","type":"State","management":"State Govt.","established":2026,"seats":50,"mcc_code_2026":"904741","seats_2026":50,"nmc_code_2026":"New Establishment","seats_renewed_2026":0,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":464,"name":"Government Medical College, Manendragarh","state":"Chhattisgarh","city":"Manendragarh","type":"State","management":"State Govt.","established":2026,"seats":50,"mcc_code_2026":"904742","seats_2026":50,"nmc_code_2026":"New Establishment","seats_renewed_2026":0,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":63,"name":"NAMO Medical Education & Research Institute, Silvassa","state":"Dadra and Nagar Haveli","city":"Silvassa","type":"State","management":"State Govt.","established":2019,"seats":177,"seats_2026":177,"nmc_code_2026":"ND/001/G/1","seats_renewed_2026":177,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":64,"name":"All India Institute of Medical Sciences, New Delhi","state":"Delhi","city":"New Delhi","type":"AIIMS","management":"Central Govt.","established":1956,"seats":132,"seats_2026":132,"mcc_code_2026":"200502","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":65,"name":"Atal Bihari Vajpayee Institute of Medical Sciences and Dr. RML Hospital, New Delhi","state":"Delhi","city":"New Delhi","type":"Central","management":"Central Govt.","established":2008,"seats":100,"seats_2026":100,"nmc_code_2026":"DL/007/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":66,"name":"Dr. Baba Saheb Ambedkar Medical College, Rohini, Delhi","state":"Delhi","city":"Delhi","type":"State","management":"State Govt.","established":2016,"seats":125,"seats_2026":125,"nmc_code_2026":"DL/002/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":67,"name":"ESIC Medical College & Hospital, Basaidarapur, New Delhi","state":"Delhi","city":"New Delhi","type":"ESIC","management":"Central Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"DL/003/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":68,"name":"Lady Hardinge Medical College, New Delhi","state":"Delhi","city":"New Delhi","type":"Central","management":"Central Govt.","established":1916,"seats":240,"seats_2026":240,"nmc_code_2026":"DL/008/G/1","seats_renewed_2026":240,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":69,"name":"Maulana Azad Medical College, New Delhi","state":"Delhi","city":"New Delhi","type":"Central","management":"Central Govt.","established":1958,"seats":250,"seats_2026":250,"nmc_code_2026":"DL/005/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":70,"name":"North Delhi Municipal Corporation Medical College, Delhi","state":"Delhi","city":"Delhi","type":"State","management":"State Govt.","established":2013,"seats":60,"seats_2026":60,"nmc_code_2026":"DL/006/G/1","seats_renewed_2026":60,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":71,"name":"University College of Medical Sciences & GTB Hospital, New Delhi","state":"Delhi","city":"New Delhi","type":"Central","management":"Central Govt.","established":1971,"seats":170,"seats_2026":170,"nmc_code_2026":"DL/010/G/1","seats_renewed_2026":170,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":72,"name":"Vardhman Mahavir Medical College & Safdarjung Hospital, Delhi","state":"Delhi","city":"Delhi","type":"Central","management":"Central Govt.","established":2002,"seats":170,"seats_2026":170,"nmc_code_2026":"DL/009/G/1","seats_renewed_2026":170,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":467,"name":"Central Armed Police Forces Institute of Medical Sciences (CAPFIMS), Delhi","state":"Delhi","city":"New Delhi","type":"Central","management":"Central Govt.","established":2026,"seats":100,"mcc_code_2026":"904764","seats_2026":100,"seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":73,"name":"Goa Medical College, Panaji","state":"Goa","city":"Panaji","type":"State","management":"Govt.","established":1963,"seats":250,"seats_2026":250,"nmc_code_2026":"GA/001/G/1","seats_renewed_2026":200,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":74,"name":"All India Institute of Medical Sciences, Rajkot","state":"Gujarat","city":"Rajkot","type":"AIIMS","management":"Central Govt.","established":2020,"seats":75,"seats_2026":75,"mcc_code_2026":"200520","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":75,"name":"B.J. Medical College, Ahmedabad","state":"Gujarat","city":"Ahmedabad","type":"State","management":"State Govt.","established":1946,"seats":250,"seats_2026":250,"nmc_code_2026":"GJ/003/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":76,"name":"ESIC Medical College Naroda, Bapunagar, Ahmedabad","state":"Gujarat","city":"Ahmedabad","type":"ESIC","management":"Central Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"GJ/010/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":77,"name":"GMERS Medical College, Dharpur, Patan","state":"Gujarat","city":"Patan","type":"State","management":"State Govt.","established":2012,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/012/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":78,"name":"GMERS Medical College, Gandhinagar","state":"Gujarat","city":"Gandhinagar","type":"State","management":"State Govt.","established":2012,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/013/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":79,"name":"GMERS Medical College, Gotri, Vadodara","state":"Gujarat","city":"Vadodara","type":"State","management":"State Govt.","established":2011,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/014/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":80,"name":"GMERS Medical College, Morbi","state":"Gujarat","city":"Morbi","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"GJ/022/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":81,"name":"GMERS Medical College, Panchmahal Godhra","state":"Gujarat","city":"Panchmahal Godhra","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"GJ/024/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":82,"name":"GMERS Medical College, Himmatnagar","state":"Gujarat","city":"Himmatnagar","type":"State","management":"State Govt.","established":2015,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/015/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":83,"name":"GMERS Medical College, Junagadh","state":"Gujarat","city":"Junagadh","type":"State","management":"State Govt.","established":2015,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/016/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":84,"name":"GMERS Medical College, Sola, Ahmedabad","state":"Gujarat","city":"Ahmedabad","type":"State","management":"State Govt.","established":2011,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/018/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":85,"name":"GMERS Medical College, Vadnagar, Mehsana","state":"Gujarat","city":"Mehsana","type":"State","management":"State Govt.","established":2017,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/019/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":86,"name":"GMERS Medical College, Navsari","state":"Gujarat","city":"Navsari","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"GJ/023/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":87,"name":"GMERS Medical College, Rajpipla","state":"Gujarat","city":"Rajpipla","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"GJ/017/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":88,"name":"GMERS Medical College, Valsad","state":"Gujarat","city":"Valsad","type":"State","management":"State Govt.","established":2012,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/020/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":89,"name":"Government Medical College, Bhavnagar","state":"Gujarat","city":"Bhavnagar","type":"State","management":"State Govt.","established":1995,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/021/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":90,"name":"Government Medical College, Surat","state":"Gujarat","city":"Surat","type":"State","management":"State Govt.","established":1964,"seats":250,"seats_2026":250,"nmc_code_2026":"GJ/026/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":91,"name":"GMERS Medical College, Porbandar","state":"Gujarat","city":"Porbandar","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"GJ/025/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":92,"name":"Medical College, Baroda","state":"Gujarat","city":"Baroda","type":"State","management":"State Govt.","established":1949,"seats":250,"seats_2026":250,"nmc_code_2026":"GJ/030/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":93,"name":"MP Shah Medical College, Jamnagar","state":"Gujarat","city":"Jamnagar","type":"State","management":"State Govt.","established":1955,"seats":250,"seats_2026":250,"nmc_code_2026":"GJ/031/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":94,"name":"Narendra Modi Medical College, Ahmedabad","state":"Gujarat","city":"Ahmedabad","type":"State","management":"State Govt.","established":2009,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/001/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":95,"name":"Pandit Deendayal Upadhyay Medical College, Rajkot","state":"Gujarat","city":"Rajkot","type":"State","management":"State Govt.","established":1995,"seats":200,"seats_2026":200,"nmc_code_2026":"GJ/033/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":96,"name":"Smt. N.H.L. Municipal Medical College, Ahmedabad","state":"Gujarat","city":"Ahmedabad","type":"State","management":"State Govt.","established":1963,"seats":250,"seats_2026":250,"nmc_code_2026":"GJ/039/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":97,"name":"Surat Municipal Institute of Medical Education & Research, Surat","state":"Gujarat","city":"Surat","type":"State","management":"State Govt.","established":1999,"seats":250,"seats_2026":250,"nmc_code_2026":"GJ/040/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":98,"name":"BPS Government Medical College for Women, Sonepat","state":"Haryana","city":"Sonepat","type":"State","management":"State Govt.","established":2012,"seats":120,"seats_2026":120,"nmc_code_2026":"HR/004/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":99,"name":"Employees State Insurance Corporation Medical College, Faridabad","state":"Haryana","city":"Faridabad","type":"ESIC","management":"Central Govt.","established":2015,"seats":150,"seats_2026":150,"nmc_code_2026":"HR/005/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":100,"name":"Kalpana Chawla Government Medical College, Karnal","state":"Haryana","city":"Karnal","type":"State","management":"State Govt.","established":2017,"seats":120,"seats_2026":120,"nmc_code_2026":"HR/007/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":101,"name":"Maharishi Chyawan Medical College, Koriawas","state":"Haryana","city":"Koriawas","type":"State","management":"State Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"HR/009/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":102,"name":"Pt. B D Sharma Postgraduate Institute of Medical Sciences, Rohtak","state":"Haryana","city":"Rohtak","type":"State","management":"State Govt.","established":1960,"seats":250,"seats_2026":250,"nmc_code_2026":"HR/014/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":103,"name":"Pt. Neki Ram Sharma Government Medical College, Bhiwani","state":"Haryana","city":"Bhiwani","type":"State","management":"State Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"HR/013/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":104,"name":"Shaheed Hasan Khan Mewati Government Medical College, Nalhar","state":"Haryana","city":"Nalhar","type":"State","management":"State Govt.","established":2013,"seats":120,"seats_2026":120,"nmc_code_2026":"HR/015/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":105,"name":"Shri Atal Bihari Vajpayee Government Medical College, Faridabad","state":"Haryana","city":"Faridabad","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"HR/016/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":466,"name":"All India Institute of Medical Sciences, Rewari","state":"Haryana","city":"Rewari","type":"AIIMS","management":"Central Govt.","established":2026,"seats":50,"mcc_code_2026":"904759","seats_2026":50,"seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":106,"name":"All India Institute of Medical Sciences, Bilaspur","state":"Himachal Pradesh","city":"Bilaspur","type":"AIIMS","management":"Central Govt.","established":2020,"seats":125,"seats_2026":125,"mcc_code_2026":"200530","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":107,"name":"Dr. Radhakrishnan Government Medical College, Hamirpur","state":"Himachal Pradesh","city":"Hamirpur","type":"State","management":"State Govt.","established":2018,"seats":120,"seats_2026":120,"nmc_code_2026":"HP/001/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":108,"name":"Dr. Rajendra Prasad Government Medical College, Tanda","state":"Himachal Pradesh","city":"Tanda","type":"State","management":"State Govt.","established":1996,"seats":120,"seats_2026":120,"nmc_code_2026":"HP/002/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":109,"name":"Government Medical College, Nahan, Sirmour","state":"Himachal Pradesh","city":"Sirmour","type":"State","management":"State Govt.","established":2016,"seats":120,"seats_2026":120,"nmc_code_2026":"HP/003/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":110,"name":"Indira Gandhi Medical College, Shimla","state":"Himachal Pradesh","city":"Shimla","type":"State","management":"State Govt.","established":1966,"seats":120,"seats_2026":120,"nmc_code_2026":"HP/004/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":111,"name":"Pt. Jawahar Lal Nehru Government Medical College, Chamba","state":"Himachal Pradesh","city":"Chamba","type":"State","management":"State Govt.","established":2017,"seats":121,"seats_2026":121,"nmc_code_2026":"HP/006/G/1","seats_renewed_2026":120,"seats_increased_2026":1,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":112,"name":"Shri Lal Bahadur Shastri Government Medical College, Mandi","state":"Himachal Pradesh","city":"Mandi","type":"State","management":"State Govt.","established":2017,"seats":120,"seats_2026":120,"nmc_code_2026":"HP/007/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":113,"name":"All India Institute of Medical Sciences, Vijaypur","state":"Jammu & Kashmir","city":"Vijaypur","type":"AIIMS","management":"Central Govt.","established":2020,"seats":125,"seats_2026":125,"mcc_code_2026":"200518","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":114,"name":"Government Medical College & Associated Hospital, Rajouri","state":"Jammu & Kashmir","city":"Rajouri","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"JK/008/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":115,"name":"Government Medical College, Anantnag","state":"Jammu & Kashmir","city":"Anantnag","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"JK/004/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":116,"name":"Government Medical College, Baramulla","state":"Jammu & Kashmir","city":"Baramulla","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"JK/005/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":117,"name":"Government Medical College, Doda","state":"Jammu & Kashmir","city":"Doda","type":"State","management":"State Govt.","established":2020,"seats":150,"seats_2026":150,"nmc_code_2026":"JK/010/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":118,"name":"Government Medical College, Handwara","state":"Jammu & Kashmir","city":"Handwara","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"JK/002/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":119,"name":"Government Medical College, Jammu","state":"Jammu & Kashmir","city":"Jammu","type":"State","management":"State Govt.","established":1972,"seats":250,"seats_2026":250,"nmc_code_2026":"JK/006/G/1","seats_renewed_2026":200,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":120,"name":"Government Medical College, Kathua","state":"Jammu & Kashmir","city":"Kathua","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"JK/007/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":121,"name":"Government Medical College, Udhampur","state":"Jammu & Kashmir","city":"Udhampur","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"JK/003/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":122,"name":"Government Medical College, Srinagar","state":"Jammu & Kashmir","city":"Srinagar","type":"State","management":"State Govt.","established":1959,"seats":250,"seats_2026":250,"nmc_code_2026":"JK/009/G/1","seats_renewed_2026":200,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":123,"name":"SKIMS Medical College & Hospital, Bemina, Srinagar","state":"Jammu & Kashmir","city":"Srinagar","type":"State","management":"State Govt.","established":1988,"seats":125,"seats_2026":125,"nmc_code_2026":"JK/011/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":124,"name":"All India Institute of Medical Sciences, Deoghar","state":"Jharkhand","city":"Deoghar","type":"AIIMS","management":"Central Govt.","established":2019,"seats":125,"seats_2026":125,"mcc_code_2026":"200512","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":125,"name":"Dumka Medical College, Dighi, Dumka","state":"Jharkhand","city":"Dumka","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"JH/001/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":126,"name":"Hazaribagh Medical College, Hazaribagh","state":"Jharkhand","city":"Hazaribagh","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"JH/002/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":127,"name":"M G M Medical College, Jamshedpur","state":"Jharkhand","city":"Jamshedpur","type":"State","management":"State Govt.","established":1961,"seats":150,"seats_2026":150,"nmc_code_2026":"JH/004/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":128,"name":"Palamu Medical College, Palamu","state":"Jharkhand","city":"Palamu","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"JH/007/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":129,"name":"Rajendra Institute of Medical Sciences, Ranchi","state":"Jharkhand","city":"Ranchi","type":"State","management":"State Govt.","established":1960,"seats":250,"seats_2026":250,"nmc_code_2026":"JH/008/G/1","seats_renewed_2026":180,"seats_increased_2026":70,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":130,"name":"Shahed Nirmal Mahto Medical College & Hospital, Dhanbad","state":"Jharkhand","city":"Dhanbad","type":"State","management":"State Govt.","established":1969,"seats":100,"seats_2026":100,"nmc_code_2026":"JH/009/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":131,"name":"Bangalore Medical College and Research Institute, Bangalore","state":"Karnataka","city":"Bangalore","type":"State","management":"State Govt.","established":1955,"seats":250,"seats_2026":250,"nmc_code_2026":"KA/005/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":132,"name":"Belagavi Institute of Medical Sciences, Belagavi","state":"Karnataka","city":"Belagavi","type":"State","management":"State Govt.","established":2006,"seats":200,"seats_2026":200,"nmc_code_2026":"KA/007/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":133,"name":"Bidar Institute of Medical Sciences, Bidar","state":"Karnataka","city":"Bidar","type":"State","management":"State Govt.","established":2007,"seats":200,"seats_2026":200,"nmc_code_2026":"KA/010/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":134,"name":"Chikkaballapura Institute of Medical Sciences, Chikkaballapura","state":"Karnataka","city":"Chikkaballapura","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/012/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":135,"name":"Chamrajanagar Institute of Medical Sciences, Chamarajanagar","state":"Karnataka","city":"Chamarajanagar","type":"State","management":"State Govt.","established":2016,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/011/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":136,"name":"Chikkamagaluru Institute of Medical Sciences, Chikkamagaluru","state":"Karnataka","city":"Chikkamagaluru","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/013/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":137,"name":"Chitradurga Medical College and Research Institute, Chitradurga","state":"Karnataka","city":"Chitradurga","type":"State","management":"State Govt.","established":2023,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/014/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":138,"name":"Employees State Insurance Corporation Medical College, Bangalore","state":"Karnataka","city":"Bangalore","type":"ESIC","management":"Central Govt.","established":2012,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/018/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":139,"name":"Employees State Insurance Corporation Medical College, Gulbarga","state":"Karnataka","city":"Gulbarga","type":"ESIC","management":"Central Govt.","established":2013,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/019/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":140,"name":"Gadag Institute of Medical Sciences, Gadag","state":"Karnataka","city":"Gadag","type":"State","management":"State Govt.","established":2015,"seats":200,"seats_2026":200,"nmc_code_2026":"KA/031/G/1","seats_renewed_2026":150,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":141,"name":"Gulbarga Institute of Medical Sciences, Gulbarga","state":"Karnataka","city":"Gulbarga","type":"State","management":"State Govt.","established":2015,"seats":200,"seats_2026":200,"nmc_code_2026":"KA/022/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":142,"name":"Hassan Institute of Medical Sciences, Hassan","state":"Karnataka","city":"Hassan","type":"State","management":"State Govt.","established":2006,"seats":200,"seats_2026":200,"nmc_code_2026":"KA/023/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":143,"name":"Karnataka Institute of Medical Sciences, Hubballi","state":"Karnataka","city":"Hubballi","type":"State","management":"State Govt.","established":1957,"seats":250,"seats_2026":250,"nmc_code_2026":"KA/033/G/1","seats_renewed_2026":200,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":144,"name":"Karwar Institute of Medical Sciences, Karwar","state":"Karnataka","city":"Karwar","type":"State","management":"State Govt.","established":2016,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/034/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":145,"name":"Kodagu Institute of Medical Sciences, Kodagu","state":"Karnataka","city":"Kodagu","type":"State","management":"State Govt.","established":2016,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/039/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":146,"name":"Koppal Institute of Medical Sciences, Koppal","state":"Karnataka","city":"Koppal","type":"State","management":"State Govt.","established":2015,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/040/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":147,"name":"Mandya Institute of Medical Sciences, Mandya","state":"Karnataka","city":"Mandya","type":"State","management":"State Govt.","established":2006,"seats":200,"seats_2026":200,"nmc_code_2026":"KA/043/G/1","seats_renewed_2026":150,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":148,"name":"Mysore Medical College and Research Institute, Mysore","state":"Karnataka","city":"Mysore","type":"State","management":"State Govt.","established":1924,"seats":250,"seats_2026":250,"nmc_code_2026":"KA/045/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":149,"name":"Raichur Institute of Medical Sciences, Raichur","state":"Karnataka","city":"Raichur","type":"State","management":"State Govt.","established":2007,"seats":200,"seats_2026":200,"nmc_code_2026":"KA/048/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":150,"name":"Shimoga Institute of Medical Sciences, Shimoga","state":"Karnataka","city":"Shimoga","type":"State","management":"State Govt.","established":2007,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/054/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":151,"name":"Shri Atal Bihari Vajpayee Medical College & Research Institute, Bengaluru","state":"Karnataka","city":"Bengaluru","type":"State","management":"State Govt.","established":2019,"seats":200,"seats_2026":200,"nmc_code_2026":"KA/055/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":152,"name":"Vijaynagar Institute of Medical Sciences, Bellary","state":"Karnataka","city":"Bellary","type":"State","management":"State Govt.","established":1961,"seats":250,"seats_2026":250,"nmc_code_2026":"KA/069/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":153,"name":"Yadgiri Institute of Medical Sciences, Yadgiri","state":"Karnataka","city":"Yadgiri","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/071/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":468,"name":"Haveri Institute of Medical Sciences, Haveri","state":"Karnataka","city":"Haveri","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"KA/024/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":154,"name":"Government Medical College (Institute of Integrated Medical Sciences), Yakkara, Palakkad","state":"Kerala","city":"Palakkad","type":"State","management":"State Govt.","established":2014,"seats":100,"seats_2026":100,"nmc_code_2026":"KL/008/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":155,"name":"Government Medical College, Ernakulam","state":"Kerala","city":"Ernakulam","type":"State","management":"State Govt.","established":2000,"seats":110,"seats_2026":110,"nmc_code_2026":"KL/010/G/1","seats_renewed_2026":110,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":156,"name":"Government Medical College, Kottayam","state":"Kerala","city":"Kottayam","type":"State","management":"State Govt.","established":1960,"seats":175,"seats_2026":175,"nmc_code_2026":"KL/013/G/1","seats_renewed_2026":175,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":157,"name":"Government Medical College, Kozhikode","state":"Kerala","city":"Kozhikode","type":"State","management":"State Govt.","established":1957,"seats":250,"seats_2026":250,"nmc_code_2026":"KL/014/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":158,"name":"Government Medical College, Manjeri, Malappuram","state":"Kerala","city":"Malappuram","type":"State","management":"State Govt.","established":2013,"seats":110,"seats_2026":110,"nmc_code_2026":"KL/015/G/1","seats_renewed_2026":110,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":159,"name":"Government Medical College, Idukki","state":"Kerala","city":"Idukki","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"KL/011/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":160,"name":"Government Medical College, Parippally, Kollam","state":"Kerala","city":"Kollam","type":"Central","management":"Central Govt.","established":2017,"seats":110,"seats_2026":110,"nmc_code_2026":"KL/016/G/1","seats_renewed_2026":110,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":161,"name":"Government Medical College, Konni","state":"Kerala","city":"Konni","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"KL/012/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":162,"name":"Government Medical College, Pariyaram, Kannur","state":"Kerala","city":"Kannur","type":"State","management":"State Govt.","established":1995,"seats":100,"seats_2026":100,"nmc_code_2026":"KL/019/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":163,"name":"Government Medical College, Thrissur","state":"Kerala","city":"Thrissur","type":"State","management":"State Govt.","established":1981,"seats":175,"seats_2026":175,"nmc_code_2026":"KL/017/G/1","seats_renewed_2026":175,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":164,"name":"Medical College, Thiruvananthapuram","state":"Kerala","city":"Thiruvananthapuram","type":"State","management":"State Govt.","established":1951,"seats":250,"seats_2026":250,"nmc_code_2026":"KL/027/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":165,"name":"T D Medical College, Alappuzha","state":"Kerala","city":"Alappuzha","type":"State","management":"State Govt.","established":1963,"seats":175,"seats_2026":175,"nmc_code_2026":"KL/035/G/1","seats_renewed_2026":175,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":166,"name":"Government Medical College, Kasaragod","state":"Kerala","city":"Kasaragod","type":"State","management":"State Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"KL/009/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":167,"name":"Government Medical College, Wayanad","state":"Kerala","city":"Wayanad","type":"State","management":"State Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"KL/018/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":168,"name":"All India Institute of Medical Sciences, Bhopal","state":"Madhya Pradesh","city":"Bhopal","type":"AIIMS","management":"Central Govt.","established":2012,"seats":125,"seats_2026":125,"mcc_code_2026":"200503","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":169,"name":"Bundelkhand Medical College, Sagar","state":"Madhya Pradesh","city":"Sagar","type":"State","management":"State Govt.","established":2009,"seats":150,"seats_2026":150,"nmc_code_2026":"MP/002/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":170,"name":"ESIC Medical College and Hospital, Indore","state":"Madhya Pradesh","city":"Indore","type":"ESIC","management":"Central Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"MP/004/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":171,"name":"Gajra Raja Medical College, Gwalior","state":"Madhya Pradesh","city":"Gwalior","type":"State","management":"State Govt.","established":1946,"seats":250,"seats_2026":250,"nmc_code_2026":"MP/005/G/1","seats_renewed_2026":200,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":172,"name":"Gandhi Medical College, Bhopal","state":"Madhya Pradesh","city":"Bhopal","type":"State","management":"State Govt.","established":1955,"seats":250,"seats_2026":250,"nmc_code_2026":"MP/006/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":173,"name":"Government Medical College, Chhindwara","state":"Madhya Pradesh","city":"Chhindwara","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"MP/009/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":174,"name":"Government Medical College, Datia","state":"Madhya Pradesh","city":"Datia","type":"State","management":"State Govt.","established":2018,"seats":120,"seats_2026":120,"nmc_code_2026":"MP/010/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":175,"name":"Government Medical College, Khandwa","state":"Madhya Pradesh","city":"Khandwa","type":"State","management":"State Govt.","established":2018,"seats":120,"seats_2026":120,"nmc_code_2026":"MP/011/G/1","seats_renewed_2026":120,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":176,"name":"Government Medical College, Ratlam","state":"Madhya Pradesh","city":"Ratlam","type":"State","management":"State Govt.","established":2018,"seats":200,"seats_2026":200,"nmc_code_2026":"MP/012/G/1","seats_renewed_2026":180,"seats_increased_2026":20,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":177,"name":"Government Medical College, Satna","state":"Madhya Pradesh","city":"Satna","type":"State","management":"State Govt.","established":2023,"seats":150,"seats_2026":150,"nmc_code_2026":"MP/013/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":178,"name":"Government Medical College, Shahdol","state":"Madhya Pradesh","city":"Shahdol","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"MP/015/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":179,"name":"Government Medical College, Shivpuri","state":"Madhya Pradesh","city":"Shivpuri","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"MP/016/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":180,"name":"Government Medical College, Vidisha","state":"Madhya Pradesh","city":"Vidisha","type":"State","management":"State Govt.","established":2018,"seats":180,"seats_2026":180,"nmc_code_2026":"MP/017/G/1","seats_renewed_2026":180,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":181,"name":"M G M Medical College, Indore","state":"Madhya Pradesh","city":"Indore","type":"State","management":"State Govt.","established":1948,"seats":250,"seats_2026":250,"nmc_code_2026":"MP/021/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":182,"name":"Netaji Subhash Chandra Bose Medical College, Jabalpur","state":"Madhya Pradesh","city":"Jabalpur","type":"State","management":"State Govt.","established":1955,"seats":250,"seats_2026":250,"nmc_code_2026":"MP/024/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":183,"name":"Shyam Shah Medical College, Rewa","state":"Madhya Pradesh","city":"Rewa","type":"State","management":"State Govt.","established":1963,"seats":200,"seats_2026":200,"nmc_code_2026":"MP/030/G/1","seats_renewed_2026":150,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":184,"name":"Virendra Kumar Sakhlecha Government Medical College, Neemuch","state":"Madhya Pradesh","city":"Neemuch","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MP/034/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":185,"name":"Government Medical College, Seoni","state":"Madhya Pradesh","city":"Seoni","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MP/014/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":186,"name":"Sundarlal Patwa Government Medical College, Mandsaur","state":"Madhya Pradesh","city":"Mandsaur","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MP/033/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":187,"name":"Government Medical College, Singrauli","state":"Madhya Pradesh","city":"Singrauli","type":"State","management":"State Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"MP/008/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":188,"name":"Government Medical College, Sheopur","state":"Madhya Pradesh","city":"Sheopur","type":"State","management":"State Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"MP/007/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":189,"name":"All India Institute of Medical Sciences, Nagpur","state":"Maharashtra","city":"Nagpur","type":"AIIMS","management":"Central Govt.","established":2018,"seats":125,"seats_2026":125,"mcc_code_2026":"200509","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":190,"name":"Armed Forces Medical College, Pune","state":"Maharashtra","city":"Pune","type":"AFMC","management":"Central Govt.","established":1962,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/002/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":191,"name":"B. J. Government Medical College, Pune","state":"Maharashtra","city":"Pune","type":"State","management":"State Govt.","established":1964,"seats":250,"seats_2026":250,"nmc_code_2026":"MH/004/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":192,"name":"Dr. Vaishampayan Memorial Medical College, Solapur","state":"Maharashtra","city":"Solapur","type":"State","management":"State Govt.","established":1963,"seats":200,"seats_2026":200,"nmc_code_2026":"MH/010/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":193,"name":"Dr. Shankarrao Chavan Government Medical College, Nanded","state":"Maharashtra","city":"Nanded","type":"State","management":"State Govt.","established":1988,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/016/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":194,"name":"ESIC Medical College and Hospital, Andheri","state":"Maharashtra","city":"Andheri","type":"ESIC","management":"Central Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"MH/021/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":195,"name":"Government Medical College, Alibag","state":"Maharashtra","city":"Alibag","type":"State","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/026/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":196,"name":"Government Medical College, Amravati","state":"Maharashtra","city":"Amravati","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/028/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":197,"name":"Government Medical College & Hospital, Baramati","state":"Maharashtra","city":"Baramati","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/022/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":198,"name":"Government Medical College, Akola","state":"Maharashtra","city":"Akola","type":"State","management":"State Govt.","established":2002,"seats":200,"seats_2026":200,"nmc_code_2026":"MH/025/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":199,"name":"Government Medical College, Ambernath","state":"Maharashtra","city":"Ambernath","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/027/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":200,"name":"Government Medical College, Aurangabad","state":"Maharashtra","city":"Aurangabad","type":"State","management":"State Govt.","established":1956,"seats":200,"seats_2026":200,"nmc_code_2026":"MH/029/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":201,"name":"Government Medical College, Bhandara","state":"Maharashtra","city":"Bhandara","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/030/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":202,"name":"Government Medical College, Buldhana","state":"Maharashtra","city":"Buldhana","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/031/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":203,"name":"Government Medical College, Chandrapur","state":"Maharashtra","city":"Chandrapur","type":"State","management":"State Govt.","established":2015,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/032/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":204,"name":"Government Medical College, Gadchiroli","state":"Maharashtra","city":"Gadchiroli","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/033/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":205,"name":"Government Medical College, Gondia","state":"Maharashtra","city":"Gondia","type":"State","management":"State Govt.","established":2016,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/034/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":206,"name":"Government Medical College, Hingoli","state":"Maharashtra","city":"Hingoli","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/035/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":207,"name":"Government Medical College, Jalgaon","state":"Maharashtra","city":"Jalgaon","type":"State","management":"State Govt.","established":2018,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/036/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":208,"name":"Government Medical College, Jalna","state":"Maharashtra","city":"Jalna","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/037/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":209,"name":"Government Medical College, Latur","state":"Maharashtra","city":"Latur","type":"State","management":"State Govt.","established":2002,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/038/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":210,"name":"Government Medical College, Miraj","state":"Maharashtra","city":"Miraj","type":"State","management":"State Govt.","established":1962,"seats":200,"seats_2026":200,"nmc_code_2026":"MH/039/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":211,"name":"Government Medical College, Nagpur","state":"Maharashtra","city":"Nagpur","type":"State","management":"State Govt.","established":1947,"seats":250,"seats_2026":250,"nmc_code_2026":"MH/040/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":212,"name":"Government Medical College, Nandurbar","state":"Maharashtra","city":"Nandurbar","type":"State","management":"State Govt.","established":2020,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/041/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":213,"name":"Government Medical College, Nashik","state":"Maharashtra","city":"Nashik","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/047/G/1","seats_renewed_2026":50,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":214,"name":"Government Medical College, Osmanabad","state":"Maharashtra","city":"Osmanabad","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/042/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":215,"name":"Government Medical College, Parbhani","state":"Maharashtra","city":"Parbhani","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/043/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":216,"name":"Government Medical College and District Hospital, Ratnagiri","state":"Maharashtra","city":"Ratnagiri","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/023/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":217,"name":"Government Medical College, Satara","state":"Maharashtra","city":"Satara","type":"State","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/044/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":218,"name":"Government Medical College, Sindhudurg","state":"Maharashtra","city":"Sindhudurg","type":"State","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/045/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":219,"name":"Government Medical College, Washim","state":"Maharashtra","city":"Washim","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/046/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":220,"name":"Grant Medical College, Mumbai","state":"Maharashtra","city":"Mumbai","type":"State","management":"State Govt.","established":1845,"seats":250,"seats_2026":250,"nmc_code_2026":"MH/048/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":221,"name":"H.B.T. Medical College & Dr. R.N. Cooper Hospital, Mumbai","state":"Maharashtra","city":"Mumbai","type":"State","management":"State Govt.","established":2015,"seats":200,"seats_2026":200,"nmc_code_2026":"MH/049/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":222,"name":"Indira Gandhi Medical College & Hospital, Nagpur","state":"Maharashtra","city":"Nagpur","type":"State","management":"State Govt.","established":1968,"seats":200,"seats_2026":200,"nmc_code_2026":"MH/051/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":223,"name":"Lokmanya Tilak Municipal Medical College, Sion, Mumbai","state":"Maharashtra","city":"Mumbai","type":"State","management":"State Govt.","established":1964,"seats":200,"seats_2026":200,"nmc_code_2026":"MH/055/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":224,"name":"Rajashree Chatrapati Shahu Maharaj Government Medical College, Kolhapur","state":"Maharashtra","city":"Kolhapur","type":"State","management":"State Govt.","established":2001,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/069/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":225,"name":"Rajiv Gandhi Medical College and Chhatrapati Shivaji Maharaj Hospital, Thane","state":"Maharashtra","city":"Thane","type":"State","management":"State Govt.","established":1992,"seats":100,"seats_2026":100,"nmc_code_2026":"MH/070/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":226,"name":"Seth GS Medical College, Mumbai","state":"Maharashtra","city":"Mumbai","type":"State","management":"State Govt.","established":1925,"seats":250,"seats_2026":250,"nmc_code_2026":"MH/073/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":227,"name":"Shri Vasant Rao Naik Government Medical College, Yavatmal","state":"Maharashtra","city":"Yavatmal","type":"State","management":"State Govt.","established":1989,"seats":200,"seats_2026":200,"nmc_code_2026":"MH/074/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":228,"name":"Sri Bhausaheb Hire Government Medical College, Dhule","state":"Maharashtra","city":"Dhule","type":"State","management":"State Govt.","established":1988,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/079/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":229,"name":"SRTR Medical College, Ambajogai","state":"Maharashtra","city":"Ambajogai","type":"State","management":"State Govt.","established":1974,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/080/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":230,"name":"Topiwala National Medical College, Mumbai","state":"Maharashtra","city":"Mumbai","type":"State","management":"State Govt.","established":1964,"seats":150,"seats_2026":150,"nmc_code_2026":"MH/083/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":231,"name":"Government Medical College, Mumbai","state":"Maharashtra","city":"Mumbai","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"MH/024/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":232,"name":"Government Medical College, Churachandpur","state":"Manipur","city":"Churachandpur","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"MN/001/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":233,"name":"Jawaharlal Nehru Institute of Medical Sciences, Imphal","state":"Manipur","city":"Imphal","type":"State","management":"State Govt.","established":2010,"seats":150,"seats_2026":150,"nmc_code_2026":"MN/002/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":234,"name":"Regional Institute of Medical Sciences, Imphal","state":"Manipur","city":"Imphal","type":"State","management":"State Govt.","established":1972,"seats":150,"seats_2026":150,"nmc_code_2026":"MN/003/G/1","seats_renewed_2026":125,"seats_increased_2026":25,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":235,"name":"North Eastern Indira Gandhi Regional Institute of Health and Medical Sciences, Shillong","state":"Meghalaya","city":"Shillong","type":"Central","management":"Central Govt.","established":2008,"seats":50,"seats_2026":50,"nmc_code_2026":"ML/001/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":236,"name":"Shillong Medical College, Shillong","state":"Meghalaya","city":"Shillong","type":"State","management":"State Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"ML/003/G/5","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":237,"name":"Zoram Medical College, Falkawn","state":"Mizoram","city":"Falkawn","type":"State","management":"State Govt.","established":2018,"seats":100,"seats_2026":100,"nmc_code_2026":"MZ/001/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":238,"name":"Nagaland Institute of Medical Sciences & Research, Kohima","state":"Nagaland","city":"Kohima","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"NL/001/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":239,"name":"AIIMS, Bhubaneswar","state":"Odisha","city":"Bhubaneswar","type":"AIIMS","management":"Central Govt.","established":2012,"seats":125,"seats_2026":125,"mcc_code_2026":"200504","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":240,"name":"Dharanidhar Medical College & Hospital, Keonjhar","state":"Odisha","city":"Keonjhar","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"OD/005/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":241,"name":"Bhima Bhoi Medical College & Hospital, Balangir","state":"Odisha","city":"Balangir","type":"State","management":"State Govt.","established":2018,"seats":100,"seats_2026":100,"nmc_code_2026":"OD/001/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":242,"name":"Fakir Mohan Medical College & Hospital, Balasore","state":"Odisha","city":"Balasore","type":"State","management":"State Govt.","established":2018,"seats":100,"seats_2026":100,"nmc_code_2026":"OD/002/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":243,"name":"MKCG Medical College, Berhampur","state":"Odisha","city":"Berhampur","type":"State","management":"State Govt.","established":1962,"seats":250,"seats_2026":250,"nmc_code_2026":"OD/013/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":244,"name":"Pt. Raghunath Murmu Medical College and Hospital, Baripada","state":"Odisha","city":"Baripada","type":"State","management":"State Govt.","established":2017,"seats":125,"seats_2026":125,"nmc_code_2026":"OD/015/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":245,"name":"Saheed Rendo Majhi Medical College & Hospital, Bhawanipatna, Kalahandi","state":"Odisha","city":"Kalahandi","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"OD/004/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":246,"name":"Saheed Laxman Nayak Medical College & Hospital, Koraput","state":"Odisha","city":"Koraput","type":"State","management":"State Govt.","established":2017,"seats":125,"seats_2026":125,"nmc_code_2026":"OD/016/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":247,"name":"Sri Jagannath Medical College & Hospital, Puri","state":"Odisha","city":"Puri","type":"State","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"OD/018/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":248,"name":"SCB Medical College, Cuttack","state":"Odisha","city":"Cuttack","type":"State","management":"State Govt.","established":1944,"seats":250,"seats_2026":250,"nmc_code_2026":"OD/017/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":249,"name":"Government Medical College, Sundargarh","state":"Odisha","city":"Sundargarh","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"OD/006/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":250,"name":"Veer Surendra Sai Institute of Medical Sciences and Research, Burla","state":"Odisha","city":"Burla","type":"State","management":"State Govt.","established":1959,"seats":250,"seats_2026":250,"nmc_code_2026":"OD/019/G/1","seats_renewed_2026":200,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":251,"name":"Government Medical College and Hospital, Jajpur","state":"Odisha","city":"Jajpur","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"OD/012/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":252,"name":"Pabitra Mohan Pradhan Medical College, Talcher","state":"Odisha","city":"Talcher","type":"State","management":"State Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"OD/014/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":253,"name":"Government Medical College, Phulbani, Kandhamal","state":"Odisha","city":"Kandhamal","type":"State","management":"State Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"OD/003/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":254,"name":"Indira Gandhi Medical College & Research Institute, Puducherry","state":"Puducherry","city":"Puducherry","type":"State","management":"Govt.","established":2010,"seats":180,"seats_2026":180,"nmc_code_2026":"PY/002/G/1","seats_renewed_2026":180,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":255,"name":"Jawaharlal Institute of Postgraduate Medical Education & Research (JIPMER), Puducherry","state":"Puducherry","city":"Puducherry","type":"JIPMER","management":"Central Govt.","established":1956,"seats":182,"seats_2026":182,"mcc_code_2026":"200521","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":256,"name":"All India Institute of Medical Sciences, Bathinda","state":"Punjab","city":"Bathinda","type":"AIIMS","management":"Central Govt.","established":2019,"seats":125,"seats_2026":125,"mcc_code_2026":"200511","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":257,"name":"Dr B R Ambedkar State Institute of Medical Sciences, Mohali","state":"Punjab","city":"Mohali","type":"State","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"PB/004/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":258,"name":"ESIC Medical College, Ludhiana","state":"Punjab","city":"Ludhiana","type":"ESIC","management":"State Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"PB/005/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":259,"name":"Government Medical College, Amritsar","state":"Punjab","city":"Amritsar","type":"State","management":"State Govt.","established":1943,"seats":250,"seats_2026":250,"nmc_code_2026":"PB/007/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":260,"name":"Government Medical College, Patiala","state":"Punjab","city":"Patiala","type":"State","management":"State Govt.","established":1953,"seats":250,"seats_2026":250,"nmc_code_2026":"PB/008/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":261,"name":"Guru Govind Singh Medical College, Faridkot","state":"Punjab","city":"Faridkot","type":"State","management":"State Govt.","established":1973,"seats":250,"seats_2026":250,"nmc_code_2026":"PB/009/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":262,"name":"All India Institute of Medical Sciences, Jodhpur","state":"Rajasthan","city":"Jodhpur","type":"AIIMS","management":"Central Govt.","established":2012,"seats":150,"seats_2026":150,"mcc_code_2026":"200505","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":263,"name":"Employees State Insurance Corporation Medical College, Alwar","state":"Rajasthan","city":"Alwar","type":"ESIC","management":"Central Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/007/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":264,"name":"ESIC Medical College & Hospital, Jaipur","state":"Rajasthan","city":"Jaipur","type":"ESIC","management":"Central Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"RJ/008/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":265,"name":"Dr SN Medical College, Jodhpur","state":"Rajasthan","city":"Jodhpur","type":"State","management":"State Govt.","established":1965,"seats":250,"seats_2026":250,"nmc_code_2026":"RJ/006/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":266,"name":"Government Medical College, Alwar","state":"Rajasthan","city":"Alwar","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/011/G/5","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":267,"name":"Government Medical College, Barmer","state":"Rajasthan","city":"Barmer","type":"State","management":"State Govt.","established":2019,"seats":130,"seats_2026":130,"nmc_code_2026":"RJ/014/G/1","seats_renewed_2026":130,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":268,"name":"Government Medical College, Bharatpur","state":"Rajasthan","city":"Bharatpur","type":"State","management":"State Govt.","established":2018,"seats":150,"seats_2026":150,"nmc_code_2026":"RJ/015/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":269,"name":"Government Medical College, Bhilwara","state":"Rajasthan","city":"Bhilwara","type":"State","management":"State Govt.","established":2018,"seats":150,"seats_2026":150,"nmc_code_2026":"RJ/016/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":270,"name":"Government Medical College, Bundi","state":"Rajasthan","city":"Bundi","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/017/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":271,"name":"Government Medical College, Chittorgarh","state":"Rajasthan","city":"Chittorgarh","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/018/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":272,"name":"Government Medical College, Churu","state":"Rajasthan","city":"Churu","type":"State","management":"State Govt.","established":2018,"seats":150,"seats_2026":150,"nmc_code_2026":"RJ/019/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":273,"name":"Government Medical College, Dausa","state":"Rajasthan","city":"Dausa","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/020/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":274,"name":"Government Medical College, Dholpur","state":"Rajasthan","city":"Dholpur","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/021/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":275,"name":"Government Medical College, Dungarpur","state":"Rajasthan","city":"Dungarpur","type":"State","management":"State Govt.","established":2018,"seats":150,"seats_2026":150,"nmc_code_2026":"RJ/022/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":276,"name":"Government Medical College, Hanumangarh","state":"Rajasthan","city":"Hanumangarh","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/023/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":277,"name":"Government Medical College, Karauli","state":"Rajasthan","city":"Karauli","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/026/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":278,"name":"Government Medical College, Kota","state":"Rajasthan","city":"Kota","type":"State","management":"State Govt.","established":1992,"seats":250,"seats_2026":250,"nmc_code_2026":"RJ/027/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":279,"name":"Government Medical College, Pali","state":"Rajasthan","city":"Pali","type":"State","management":"State Govt.","established":2018,"seats":150,"seats_2026":150,"nmc_code_2026":"RJ/029/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":280,"name":"Government Medical College, Sirohi","state":"Rajasthan","city":"Sirohi","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/030/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":281,"name":"Government Medical College, Sri Ganganagar","state":"Rajasthan","city":"Sri Ganganagar","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/031/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":282,"name":"Jawaharlal Nehru Medical College, Ajmer","state":"Rajasthan","city":"Ajmer","type":"State","management":"State Govt.","established":1965,"seats":250,"seats_2026":250,"nmc_code_2026":"RJ/034/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":283,"name":"Jhalawar Medical College, Jhalawar","state":"Rajasthan","city":"Jhalawar","type":"State","management":"State Govt.","established":2008,"seats":200,"seats_2026":200,"nmc_code_2026":"RJ/035/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":284,"name":"R N T Medical College, Udaipur","state":"Rajasthan","city":"Udaipur","type":"State","management":"State Govt.","established":1961,"seats":250,"seats_2026":250,"nmc_code_2026":"RJ/041/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":285,"name":"RUHS College of Medical Sciences, Jaipur","state":"Rajasthan","city":"Jaipur","type":"State","management":"State Govt.","established":2014,"seats":150,"seats_2026":150,"nmc_code_2026":"RJ/042/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":286,"name":"Sardar Patel Medical College, Bikaner","state":"Rajasthan","city":"Bikaner","type":"State","management":"State Govt.","established":1959,"seats":250,"seats_2026":250,"nmc_code_2026":"RJ/043/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":287,"name":"Shri Kalyan Government Medical College, Sikar","state":"Rajasthan","city":"Sikar","type":"State","management":"State Govt.","established":2020,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/044/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":288,"name":"SMS Medical College, Jaipur","state":"Rajasthan","city":"Jaipur","type":"State","management":"State Govt.","established":1947,"seats":250,"seats_2026":250,"nmc_code_2026":"RJ/045/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":289,"name":"Government Medical College, Baran","state":"Rajasthan","city":"Baran","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/013/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":290,"name":"Government Medical College, Nagaur","state":"Rajasthan","city":"Nagaur","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/028/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":291,"name":"Government Medical College, Jhunjhunu","state":"Rajasthan","city":"Jhunjhunu","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/025/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":292,"name":"Government Medical College, Sawai Madhopur","state":"Rajasthan","city":"Sawai Madhopur","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/001/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":293,"name":"Government Medical College, Jaisalmer","state":"Rajasthan","city":"Jaisalmer","type":"State","management":"State Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"RJ/024/G/5","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":294,"name":"Government Medical College, Tonk","state":"Rajasthan","city":"Tonk","type":"State","management":"State Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"RJ/032/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":458,"name":"Government Medical College, Banswara","state":"Rajasthan","city":"Banswara","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"RJ/012/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":295,"name":"All India Institute of Medical Sciences, Madurai","state":"Tamil Nadu","city":"Madurai","type":"AIIMS","management":"Central Govt.","established":2020,"seats":50,"seats_2026":50,"mcc_code_2026":"200580","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":296,"name":"Chengalpattu Medical College, Chengalpattu","state":"Tamil Nadu","city":"Chengalpattu","type":"State","management":"State Govt.","established":1965,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/006/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":297,"name":"Coimbatore Medical College, Coimbatore","state":"Tamil Nadu","city":"Coimbatore","type":"State","management":"State Govt.","established":1966,"seats":200,"seats_2026":200,"nmc_code_2026":"TN/009/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":298,"name":"ESI-PGIMSR, ESI Hospital, K.K Nagar, Chennai","state":"Tamil Nadu","city":"Chennai","type":"ESIC","management":"Central Govt.","established":2013,"seats":149,"seats_2026":149,"nmc_code_2026":"TN/012/G/1","seats_renewed_2026":149,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":299,"name":"Government Medical College, Ariyalur","state":"Tamil Nadu","city":"Ariyalur","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/017/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":300,"name":"Government Dharmapuri Medical College, Dharmapuri","state":"Tamil Nadu","city":"Dharmapuri","type":"State","management":"State Govt.","established":2008,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/014/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":301,"name":"Government Medical College, Dindigul","state":"Tamil Nadu","city":"Dindigul","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/018/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":302,"name":"Government Medical College & ESIC Hospital, Coimbatore","state":"Tamil Nadu","city":"Coimbatore","type":"ESIC","management":"Central Govt.","established":2016,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/016/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":303,"name":"Government Medical College, Kallakurichi","state":"Tamil Nadu","city":"Kallakurichi","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/019/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":304,"name":"Government Medical College, Karur","state":"Tamil Nadu","city":"Karur","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/020/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":305,"name":"Government Medical College, Krishnagiri","state":"Tamil Nadu","city":"Krishnagiri","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/021/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":306,"name":"Government Medical College, Nagapattinam","state":"Tamil Nadu","city":"Nagapattinam","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/022/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":307,"name":"Government Medical College, Namakkal","state":"Tamil Nadu","city":"Namakkal","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/023/G/1","seats_renewed_2026":100,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":308,"name":"Government Medical College, The Nilgiris","state":"Tamil Nadu","city":"The Nilgiris","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/027/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":309,"name":"Government Medical College, Omandurar, Chennai","state":"Tamil Nadu","city":"Chennai","type":"State","management":"State Govt.","established":2015,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/024/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":310,"name":"Government Medical College, Pudukottai","state":"Tamil Nadu","city":"Pudukottai","type":"State","management":"State Govt.","established":2017,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/025/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":311,"name":"Government Medical College, Ramanathapuram","state":"Tamil Nadu","city":"Ramanathapuram","type":"State","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/026/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":312,"name":"Government Sivagangai Medical College, Sivaganga","state":"Tamil Nadu","city":"Sivaganga","type":"State","management":"State Govt.","established":2012,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/031/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":313,"name":"Government Medical College, Thiruvallur","state":"Tamil Nadu","city":"Thiruvallur","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/028/G/1","seats_renewed_2026":100,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":314,"name":"Government Medical College, Tiruppur","state":"Tamil Nadu","city":"Tiruppur","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/029/G/1","seats_renewed_2026":100,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":315,"name":"Government Thiruvannamalai Medical College, Thiruvannamalai","state":"Tamil Nadu","city":"Thiruvannamalai","type":"State","management":"State Govt.","established":2013,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/032/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":316,"name":"Government Vellore Medical College, Vellore","state":"Tamil Nadu","city":"Vellore","type":"State","management":"State Govt.","established":2005,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/033/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":317,"name":"Government Medical College, Virudhunagar","state":"Tamil Nadu","city":"Virudhunagar","type":"State","management":"State Govt.","established":2021,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/030/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":318,"name":"Government Villupuram Medical College, Villupuram","state":"Tamil Nadu","city":"Villupuram","type":"State","management":"State Govt.","established":2010,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/034/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":319,"name":"Government Erode Medical College & Hospital, Perundurai","state":"Tamil Nadu","city":"Perundurai","type":"State","management":"State Govt.","established":1992,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/015/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":320,"name":"K A P Viswanathan Government Medical College, Trichy","state":"Tamil Nadu","city":"Trichy","type":"State","management":"State Govt.","established":1998,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/038/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":321,"name":"Kanyakumari Government Medical College, Asaripallam","state":"Tamil Nadu","city":"Asaripallam","type":"State","management":"State Govt.","established":2003,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/039/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":322,"name":"Kilpauk Medical College, Chennai","state":"Tamil Nadu","city":"Chennai","type":"State","management":"State Govt.","established":1960,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/043/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":323,"name":"Madras Medical College, Chennai","state":"Tamil Nadu","city":"Chennai","type":"State","management":"State Govt.","established":1835,"seats":250,"seats_2026":250,"nmc_code_2026":"TN/046/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":324,"name":"Madurai Medical College, Madurai","state":"Tamil Nadu","city":"Madurai","type":"State","management":"State Govt.","established":1954,"seats":250,"seats_2026":250,"nmc_code_2026":"TN/047/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":325,"name":"Mohan Kumaramangalam Medical College, Salem","state":"Tamil Nadu","city":"Salem","type":"State","management":"State Govt.","established":1986,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/035/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":326,"name":"Government Medical College & Hospital, Cuddalore","state":"Tamil Nadu","city":"Cuddalore","type":"State","management":"State Govt.","established":1985,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/054/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":327,"name":"Stanley Medical College, Chennai","state":"Tamil Nadu","city":"Chennai","type":"State","management":"State Govt.","established":1838,"seats":250,"seats_2026":250,"nmc_code_2026":"TN/065/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":328,"name":"Thanjavur Medical College, Thanjavur","state":"Tamil Nadu","city":"Thanjavur","type":"State","management":"State Govt.","established":1959,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/069/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":329,"name":"Theni Government Medical College, Theni","state":"Tamil Nadu","city":"Theni","type":"State","management":"State Govt.","established":2006,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/070/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":330,"name":"Thiruvarur Government Medical College, Thiruvarur","state":"Tamil Nadu","city":"Thiruvarur","type":"State","management":"State Govt.","established":2010,"seats":100,"seats_2026":100,"nmc_code_2026":"TN/071/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":331,"name":"Thoothukudi Medical College, Thoothukudi","state":"Tamil Nadu","city":"Thoothukudi","type":"State","management":"State Govt.","established":2000,"seats":150,"seats_2026":150,"nmc_code_2026":"TN/072/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":332,"name":"Tirunelveli Medical College, Tirunelveli","state":"Tamil Nadu","city":"Tirunelveli","type":"State","management":"State Govt.","established":1965,"seats":250,"seats_2026":250,"nmc_code_2026":"TN/073/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":334,"name":"All India Institute of Medical Sciences, Bibinagar","state":"Telangana","city":"Bibinagar","type":"AIIMS","management":"Central Govt.","established":2019,"seats":100,"seats_2026":100,"mcc_code_2026":"200517","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":335,"name":"Employees State Insurance Corporation Medical College, Hyderabad","state":"Telangana","city":"Hyderabad","type":"ESIC","management":"Central Govt.","established":2016,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/011/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":336,"name":"Government Medical College, Jagtial","state":"Telangana","city":"Jagtial","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/020/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":337,"name":"Government Medical College, Jayashankar Bhupalpally","state":"Telangana","city":"Jayashankar Bhupalpally","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/021/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":338,"name":"Government Medical College, Jangaon","state":"Telangana","city":"Jangaon","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/014/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":339,"name":"Government Medical College, Kamareddy","state":"Telangana","city":"Kamareddy","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/023/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":340,"name":"Government Medical College, Karimnagar","state":"Telangana","city":"Karimnagar","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/024/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":341,"name":"Government Medical College, Khammam","state":"Telangana","city":"Khammam","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/015/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":342,"name":"Government Medical College, Bhadradri Kothagudem","state":"Telangana","city":"Bhadradri Kothagudem","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/019/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":343,"name":"Government Medical College, Kumuram Bheem Asifabad","state":"Telangana","city":"Kumuram Bheem Asifabad","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/016/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":344,"name":"Government Medical College, Mahabubabad","state":"Telangana","city":"Mahabubabad","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/026/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":345,"name":"Government Medical College, Mancherial","state":"Telangana","city":"Mancherial","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/029/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":346,"name":"Government Medical College, Nagarkurnool","state":"Telangana","city":"Nagarkurnool","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/031/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":347,"name":"Government Medical College, Sangareddy","state":"Telangana","city":"Sangareddy","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/040/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":348,"name":"Government Medical College, Vikarabad","state":"Telangana","city":"Vikarabad","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/018/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":349,"name":"Government Medical College, Wanaparthy","state":"Telangana","city":"Wanaparthy","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/043/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":350,"name":"Gandhi Medical College, Secunderabad","state":"Telangana","city":"Secunderabad","type":"State","management":"State Govt.","established":1954,"seats":250,"seats_2026":250,"nmc_code_2026":"TS/013/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":351,"name":"Government Medical College, Mahabubnagar","state":"Telangana","city":"Mahabubnagar","type":"State","management":"State Govt.","established":2016,"seats":200,"seats_2026":200,"nmc_code_2026":"TS/027/G/1","seats_renewed_2026":175,"seats_increased_2026":25,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":352,"name":"Government Medical College, Nalgonda","state":"Telangana","city":"Nalgonda","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/032/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":353,"name":"Government Medical College, Nirmal","state":"Telangana","city":"Nirmal","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/035/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":354,"name":"Government Medical College, Nizamabad","state":"Telangana","city":"Nizamabad","type":"State","management":"State Govt.","established":2013,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/036/G/1","seats_renewed_2026":120,"seats_increased_2026":30,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":355,"name":"Government Medical College, Ramagundam","state":"Telangana","city":"Ramagundam","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/039/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":356,"name":"Government Medical College, Rajanna Sircilla","state":"Telangana","city":"Rajanna Sircilla","type":"State","management":"State Govt.","established":2023,"seats":100,"seats_2026":100,"nmc_code_2026":"TS/038/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":357,"name":"Government Medical College, Siddipet","state":"Telangana","city":"Siddipet","type":"State","management":"State Govt.","established":2018,"seats":200,"seats_2026":200,"nmc_code_2026":"TS/041/G/1","seats_renewed_2026":175,"seats_increased_2026":25,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":358,"name":"Government Medical College, Suryapet","state":"Telangana","city":"Suryapet","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/042/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":359,"name":"Kakatiya Medical College, Warangal","state":"Telangana","city":"Warangal","type":"State","management":"State Govt.","established":1959,"seats":250,"seats_2026":250,"nmc_code_2026":"TS/044/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":360,"name":"Osmania Medical College, Hyderabad","state":"Telangana","city":"Hyderabad","type":"State","management":"State Govt.","established":1946,"seats":250,"seats_2026":250,"nmc_code_2026":"TS/057/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":361,"name":"Rajiv Gandhi Institute of Medical Sciences, Adilabad","state":"Telangana","city":"Adilabad","type":"State","management":"State Govt.","established":2008,"seats":150,"seats_2026":150,"nmc_code_2026":"TS/061/G/1","seats_renewed_2026":120,"seats_increased_2026":30,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":362,"name":"Government Medical College, Maheshwaram","state":"Telangana","city":"Maheshwaram","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/028/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":363,"name":"Government Medical College, Medak","state":"Telangana","city":"Medak","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/017/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":364,"name":"Government Medical College, Yadadri","state":"Telangana","city":"Yadadri","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/003/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":365,"name":"Government Medical College, Quthbullapur","state":"Telangana","city":"Quthbullapur","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/037/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":366,"name":"Government Medical College, Mulugu","state":"Telangana","city":"Mulugu","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/030/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":367,"name":"Government Medical College, Jogulamba Gadwal","state":"Telangana","city":"Jogulamba Gadwal","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/022/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":368,"name":"Government Medical College, Narsampet","state":"Telangana","city":"Narsampet","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/034/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":369,"name":"Government Medical College, Narayanpet","state":"Telangana","city":"Narayanpet","type":"State","management":"State Govt.","established":2024,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/033/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":370,"name":"Government Medical College, Kodangal","state":"Telangana","city":"Kodangal","type":"State","management":"State Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"TS/025/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":371,"name":"Agartala Government Medical College, Agartala","state":"Tripura","city":"Agartala","type":"State","management":"State Govt.","established":2005,"seats":200,"seats_2026":200,"nmc_code_2026":"TR/001/G/1","seats_renewed_2026":150,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":372,"name":"All India Institute of Medical Sciences, Rishikesh","state":"Uttarakhand","city":"Rishikesh","type":"AIIMS","management":"Central Govt.","established":2021,"seats":125,"seats_2026":125,"mcc_code_2026":"200507","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":373,"name":"Doon Medical College, Dehradun","state":"Uttarakhand","city":"Dehradun","type":"State","management":"State Govt.","established":2016,"seats":150,"seats_2026":150,"nmc_code_2026":"UK/001/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":374,"name":"Government Medical College, Haldwani","state":"Uttarakhand","city":"Haldwani","type":"State","management":"State Govt.","established":2001,"seats":125,"seats_2026":125,"nmc_code_2026":"UK/003/G/1","seats_renewed_2026":125,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":375,"name":"Soban Singh Jeena Government Institute of Medical Science & Research, Almora","state":"Uttarakhand","city":"Almora","type":"State","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UK/008/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":376,"name":"Veer Chandra Singh Garhwali Govt. Medical Science & Research Institute, Srinagar, Pauri Garhwal","state":"Uttarakhand","city":"Pauri Garhwal","type":"State","management":"State Govt.","established":2008,"seats":150,"seats_2026":150,"nmc_code_2026":"UK/009/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":377,"name":"Government Medical College and Hospital, Haridwar","state":"Uttarakhand","city":"Haridwar","type":"State","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UK/004/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":378,"name":"All India Institute of Medical Sciences, Gorakhpur","state":"Uttar Pradesh","city":"Gorakhpur","type":"AIIMS","management":"Central Govt.","established":2019,"seats":125,"seats_2026":125,"mcc_code_2026":"200513","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":379,"name":"All India Institute of Medical Sciences, Rae Bareli","state":"Uttar Pradesh","city":"Rae Bareli","type":"AIIMS","management":"Central Govt.","established":2019,"seats":125,"seats_2026":125,"mcc_code_2026":"200516","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":380,"name":"Autonomous State Medical College, Etah","state":"Uttar Pradesh","city":"Etah","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/013/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":381,"name":"Autonomous State Medical College, Fatehpur","state":"Uttar Pradesh","city":"Fatehpur","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/014/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":382,"name":"Autonomous State Medical College, Ghazipur","state":"Uttar Pradesh","city":"Ghazipur","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/012/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":383,"name":"Autonomous State Medical College, Hardoi","state":"Uttar Pradesh","city":"Hardoi","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/015/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":384,"name":"Autonomous State Medical College, Mirzapur","state":"Uttar Pradesh","city":"Mirzapur","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/019/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":385,"name":"Autonomous State Medical College, Pratapgarh","state":"Uttar Pradesh","city":"Pratapgarh","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/011/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":386,"name":"Autonomous State Medical College, Siddharthnagar","state":"Uttar Pradesh","city":"Siddharthnagar","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/017/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":387,"name":"Autonomous State Medical College, Sonebhadra","state":"Uttar Pradesh","city":"Sonebhadra","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/018/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":388,"name":"BRD Medical College, Gorakhpur","state":"Uttar Pradesh","city":"Gorakhpur","type":"State","management":"State Govt.","established":1972,"seats":150,"seats_2026":150,"nmc_code_2026":"UP/021/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":389,"name":"Dr. Ram Manohar Lohia Institute of Medical Sciences, Lucknow","state":"Uttar Pradesh","city":"Lucknow","type":"State","management":"State Govt.","established":2012,"seats":200,"seats_2026":200,"nmc_code_2026":"UP/024/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":390,"name":"Government Allopathic Medical College, Banda","state":"Uttar Pradesh","city":"Banda","type":"State","management":"State Govt.","established":2016,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/030/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":391,"name":"Government Medical College, Rampur, Basti","state":"Uttar Pradesh","city":"Basti","type":"ASMC","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/037/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":392,"name":"Government Institute of Medical Sciences, Kasna, Greater Noida","state":"Uttar Pradesh","city":"Greater Noida","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/031/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":393,"name":"Government Medical College & Superfacility Hospital, Azamgarh","state":"Uttar Pradesh","city":"Azamgarh","type":"State","management":"State Govt.","established":2013,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/032/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":394,"name":"Government Medical College, Badaun","state":"Uttar Pradesh","city":"Badaun","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/033/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":395,"name":"Government Medical College, Faizabad","state":"Uttar Pradesh","city":"Faizabad","type":"ASMC","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/034/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":396,"name":"Government Medical College, Firozabad","state":"Uttar Pradesh","city":"Firozabad","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/035/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":397,"name":"Government Medical College, Kannauj","state":"Uttar Pradesh","city":"Kannauj","type":"State","management":"State Govt.","established":2012,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/036/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":398,"name":"Government Medical College, Shahjahanpur","state":"Uttar Pradesh","city":"Shahjahanpur","type":"State","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/038/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":399,"name":"GSVM Medical College, Kanpur","state":"Uttar Pradesh","city":"Kanpur","type":"State","management":"State Govt.","established":1955,"seats":250,"seats_2026":250,"nmc_code_2026":"UP/039/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":400,"name":"Institute of Medical Sciences, BHU, Varanasi","state":"Uttar Pradesh","city":"Varanasi","type":"Central","management":"Central Govt.","established":1960,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/043/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":401,"name":"Jawaharlal Nehru Medical College, Aligarh (AMU)","state":"Uttar Pradesh","city":"Aligarh","type":"Central","management":"Central Govt.","established":1961,"seats":150,"seats_2026":150,"nmc_code_2026":"UP/045/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":402,"name":"King George's Medical University, Lucknow","state":"Uttar Pradesh","city":"Lucknow","type":"State","management":"State Govt.","established":1911,"seats":250,"seats_2026":250,"nmc_code_2026":"UP/048/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":403,"name":"LLRM Medical College, Meerut","state":"Uttar Pradesh","city":"Meerut","type":"State","management":"State Govt.","established":1966,"seats":150,"seats_2026":150,"nmc_code_2026":"UP/051/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":404,"name":"Moti Lal Nehru Medical College, Allahabad","state":"Uttar Pradesh","city":"Allahabad","type":"State","management":"State Govt.","established":1961,"seats":200,"seats_2026":200,"nmc_code_2026":"UP/057/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":405,"name":"Maharshi Devraha Baba Autonomous State Medical College, Deoria","state":"Uttar Pradesh","city":"Deoria","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/054/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":406,"name":"Mahamaya Rajkiya Allopathic Medical College, Ambedkarnagar","state":"Uttar Pradesh","city":"Ambedkarnagar","type":"State","management":"State Govt.","established":2011,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/052/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":407,"name":"Maharani Laxmi Bai Medical College, Jhansi","state":"Uttar Pradesh","city":"Jhansi","type":"State","management":"State Govt.","established":1968,"seats":150,"seats_2026":150,"nmc_code_2026":"UP/053/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":408,"name":"Rajkiya Allopathic Medical College, Bahraich","state":"Uttar Pradesh","city":"Bahraich","type":"ASMC","management":"State Govt.","established":2019,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/063/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":409,"name":"Rajkiya Medical College, Jalaun, Orai","state":"Uttar Pradesh","city":"Orai","type":"ASMC","management":"State Govt.","established":2013,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/064/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":410,"name":"Shaikh-Ul-Hind Maulana Mahmood Hasan Medical College, Saharanpur","state":"Uttar Pradesh","city":"Saharanpur","type":"State","management":"State Govt.","established":2015,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/074/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":411,"name":"S.N. Medical College, Agra","state":"Uttar Pradesh","city":"Agra","type":"State","management":"State Govt.","established":1939,"seats":200,"seats_2026":200,"nmc_code_2026":"UP/069/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":412,"name":"Uma Nath Singh Autonomous State Medical College, Jaunpur","state":"Uttar Pradesh","city":"Jaunpur","type":"ASMC","management":"State Govt.","established":2021,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/082/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":413,"name":"Uttar Pradesh University of Medical Sciences, Etawah","state":"Uttar Pradesh","city":"Etawah","type":"State","management":"State Govt.","established":2006,"seats":200,"seats_2026":200,"nmc_code_2026":"UP/084/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":414,"name":"Autonomous State Medical College, Lalitpur","state":"Uttar Pradesh","city":"Lalitpur","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/009/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":415,"name":"Autonomous State Medical College, Akbarpur","state":"Uttar Pradesh","city":"Akbarpur","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/016/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":416,"name":"Autonomous State Medical College and Hospital, Kaushambi","state":"Uttar Pradesh","city":"Kaushambi","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/006/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":417,"name":"Autonomous State Medical College, Sultanpur","state":"Uttar Pradesh","city":"Sultanpur","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/002/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":418,"name":"Autonomous State Medical College, Kushinagar","state":"Uttar Pradesh","city":"Kushinagar","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/008/G/5","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":419,"name":"Autonomous State Medical College, Pilibhit","state":"Uttar Pradesh","city":"Pilibhit","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/010/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":420,"name":"Mahatma Vidur Autonomous State Medical College, Bijnor","state":"Uttar Pradesh","city":"Bijnor","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/055/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":421,"name":"Kalyan Singh Government Medical College, Bulandshahr","state":"Uttar Pradesh","city":"Bulandshahr","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/047/G/5","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":422,"name":"Autonomous State Medical College and Hospital, Auraiya","state":"Uttar Pradesh","city":"Auraiya","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/004/G/5","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":423,"name":"Autonomous State Medical College and Hospital, Gonda","state":"Uttar Pradesh","city":"Gonda","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/005/G/5","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":424,"name":"Autonomous State Medical College and Hospital, Lakhimpur Kheri","state":"Uttar Pradesh","city":"Lakhimpur Kheri","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/007/G/5","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":425,"name":"Baba Kina Ram Autonomous State Medical College and Hospital, Chandauli","state":"Uttar Pradesh","city":"Chandauli","type":"ASMC","management":"State Govt.","established":2024,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/020/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":426,"name":"Autonomous State Medical College, Amethi","state":"Uttar Pradesh","city":"Amethi","type":"ASMC","management":"State Govt.","established":2025,"seats":100,"seats_2026":100,"nmc_code_2026":"UP/003/G/5","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":427,"name":"ESIC Medical College and Hospital, Noida","state":"Uttar Pradesh","city":"Noida","type":"ESIC","management":"Central Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"UP/026/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":428,"name":"ESIC Medical College and Hospital, Varanasi","state":"Uttar Pradesh","city":"Varanasi","type":"ESIC","management":"Central Govt.","established":2025,"seats":50,"seats_2026":50,"nmc_code_2026":"UP/027/G/1","seats_renewed_2026":50,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":429,"name":"AIIMS, Kalyani, Nadia","state":"West Bengal","city":"Nadia","type":"AIIMS","management":"Central Govt.","established":2019,"seats":125,"seats_2026":125,"mcc_code_2026":"200514","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":430,"name":"ESI-PGIMSR and ESIC Medical College, Joka, Kolkata","state":"West Bengal","city":"Kolkata","type":"ESIC","management":"Central Govt.","established":2013,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/010/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":431,"name":"Bankura Sammilani Medical College, Bankura","state":"West Bengal","city":"Bankura","type":"State","management":"State Govt.","established":1956,"seats":200,"seats_2026":200,"nmc_code_2026":"WB/001/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":432,"name":"Barasat Government Medical College and Hospital, Barasat","state":"West Bengal","city":"Barasat","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"WB/002/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":433,"name":"Burdwan Medical College, Burdwan","state":"West Bengal","city":"Burdwan","type":"State","management":"State Govt.","established":1969,"seats":200,"seats_2026":200,"nmc_code_2026":"WB/003/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":434,"name":"Calcutta National Medical College, Kolkata","state":"West Bengal","city":"Kolkata","type":"State","management":"State Govt.","established":1948,"seats":250,"seats_2026":250,"nmc_code_2026":"WB/004/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":435,"name":"College of Medicine and JNM Hospital, Kalyani, Nadia","state":"West Bengal","city":"Nadia","type":"State","management":"State Govt.","established":2010,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/005/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":436,"name":"College of Medicine and Sagore Dutta Hospital, Kolkata","state":"West Bengal","city":"Kolkata","type":"State","management":"State Govt.","established":2011,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/006/G/1","seats_renewed_2026":125,"seats_increased_2026":25,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":439,"name":"Diamond Harbour Government Medical College and Hospital, Diamond Harbour","state":"West Bengal","city":"Diamond Harbour","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/008/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":440,"name":"Institute of Postgraduate Medical Education & Research, Kolkata","state":"West Bengal","city":"Kolkata","type":"State","management":"State Govt.","established":1957,"seats":250,"seats_2026":250,"nmc_code_2026":"WB/014/G/1","seats_renewed_2026":200,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":441,"name":"Jalpaiguri Government Medical College and Hospital, Jalpaiguri","state":"West Bengal","city":"Jalpaiguri","type":"State","management":"State Govt.","established":2022,"seats":100,"seats_2026":100,"nmc_code_2026":"WB/019/G/1","seats_renewed_2026":100,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":442,"name":"Jhargram Government Medical College and Hospital, Jhargram","state":"West Bengal","city":"Jhargram","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/020/G/1","seats_renewed_2026":100,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":443,"name":"Maharaja Jitendra Narayan Medical College and Hospital, Coochbehar","state":"West Bengal","city":"Coochbehar","type":"State","management":"State Govt.","established":2024,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/007/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":444,"name":"Malda Medical College & Hospital, Malda","state":"West Bengal","city":"Malda","type":"State","management":"State Govt.","established":2011,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/025/G/1","seats_renewed_2026":125,"seats_increased_2026":25,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":445,"name":"Medical College, Kolkata","state":"West Bengal","city":"Kolkata","type":"State","management":"State Govt.","established":1838,"seats":250,"seats_2026":250,"nmc_code_2026":"WB/012/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":446,"name":"Midnapore Medical College, Midnapore","state":"West Bengal","city":"Midnapore","type":"State","management":"State Govt.","established":2001,"seats":200,"seats_2026":200,"nmc_code_2026":"WB/026/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":447,"name":"Murshidabad Medical College & Hospitals, Murshidabad","state":"West Bengal","city":"Murshidabad","type":"State","management":"State Govt.","established":2012,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/027/G/1","seats_renewed_2026":125,"seats_increased_2026":25,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":448,"name":"Nilratan Sircar Medical College, Kolkata","state":"West Bengal","city":"Kolkata","type":"State","management":"State Govt.","established":1948,"seats":250,"seats_2026":250,"nmc_code_2026":"WB/028/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":449,"name":"North Bengal Medical College, Darjeeling","state":"West Bengal","city":"Darjeeling","type":"State","management":"State Govt.","established":1968,"seats":200,"seats_2026":200,"nmc_code_2026":"WB/029/G/1","seats_renewed_2026":200,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":450,"name":"Prafulla Chandra Sen Government Medical College and Hospital, Arambag, Hooghly","state":"West Bengal","city":"Hooghly","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/031/G/1","seats_renewed_2026":100,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":451,"name":"Purulia Government Medical College & Hospital","state":"West Bengal","city":"Purulia","type":"State","management":"State Govt.","established":2020,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/032/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":452,"name":"RG Kar Medical College, Kolkata","state":"West Bengal","city":"Kolkata","type":"State","management":"State Govt.","established":1916,"seats":250,"seats_2026":250,"nmc_code_2026":"WB/036/G/1","seats_renewed_2026":250,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":453,"name":"Raiganj Government Medical College & Hospital, Raiganj","state":"West Bengal","city":"Raiganj","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/033/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":454,"name":"Rampurhat Government Medical College & Hospital, Rampurhat","state":"West Bengal","city":"Rampurhat","type":"State","management":"State Govt.","established":2019,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/034/G/1","seats_renewed_2026":150,"seats_increased_2026":0,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":455,"name":"Sarat Chandra Chattopadhyay Medical College and Hospital, Uluberia, Howrah","state":"West Bengal","city":"Howrah","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/038/G/1","seats_renewed_2026":100,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":456,"name":"Tamralipto Government Medical College & Hospital, Tamluk","state":"West Bengal","city":"Tamluk","type":"State","management":"State Govt.","established":2022,"seats":150,"seats_2026":150,"nmc_code_2026":"WB/040/G/1","seats_renewed_2026":100,"seats_increased_2026":50,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"},{"id":457,"name":"Jawaharlal Institute of Postgraduate Medical Education & Research (JIPMER), Karaikal","state":"Puducherry","city":"Karaikal","type":"JIPMER","management":"Central Govt.","established":2016,"seats":61,"seats_2026":61,"mcc_code_2026":"200522","seat_source_2026":"MCC Round-1 2026 Seat Matrix (07-08-2026)"},{"id":465,"name":"Sikkim Government Medical College","state":"Sikkim","city":"Gangtok","type":"State","management":"State Govt.","established":2026,"seats":100,"mcc_code_2026":"904744","seats_2026":100,"nmc_code_2026":"New Establishment","seats_renewed_2026":0,"seats_increased_2026":100,"seat_source_2026":"NMC 2026-27 MBBS Seat Matrix (13-07-2026)"}];




'use strict';

// Junior Experience & Senior Culture — pilot research layer, 21 Aug 2026.
// Important: a public student report is evidence that a claim was publicly reported,
// not proof that every student experienced it or that an institution verified it.
// "Not verified" means this research pass did not find enough traceable evidence.
const JUNIOR_CULTURE_META = {
  updated: '21 Aug 2026',
  scope: '31 researched profiles: all 30 deep-profile colleges + IMS-BHU bonus',
  method: 'Official anti-ragging/hostel material is separated from news-reported disciplinary cases and public student reports. No absence-of-reports claim is treated as evidence of absence.',
  sourceKinds: {
    official: 'Official institution / government source',
    news: 'Reported disciplinary case / established news source',
    student: 'Public student report — unverified lived-experience evidence'
  }
};

const JUNIOR_CULTURE = {
  38: {
    currentPicture: 'An April 2026 anonymous public student report alleges a formalized senior-junior interaction system at AIIMS Patna, including a 24-rule PDF, compulsory collection of senior details/introduction messages and head-shaving for boys. A July 2026 commenter identifying as an AIIMS Patna student then said the batch collectively stopped following the rules and boycotted seniors. Neither account is an institutional finding, but together they provide unusually useful evidence that the lived experience may have changed within the same batch. Separately, AIIMS Patna publishes a current anti-ragging framework.',
    rulebookStatus: 'Reported 24-rule senior PDF — unverified',
    rulebookSummary: 'An Apr 2026 public first-person-style post says the fresher batch was sent a PDF containing 24 rules attributed to seniors. The document itself was not independently authenticated in this research pass, so the site records the report rather than presenting the rules as established fact.',
    groundRules: 'The same public report alleges that freshers were told to collect seniors’ names/contact details and send introductions, with compliance linked to the freshers’ event. Exact enforcement and batch-wide participation are unverified.',
    introCulture: 'A current public report describes structured senior interaction beginning during the foundation period; no representative 2026 survey was found.',
    dressAppearance: 'The Apr 2026 report alleges boys were asked to shave their heads very closely. This is a serious but currently single-source student allegation, not an official finding.',
    movementCommonAreas: 'No specific senior-imposed common-area restriction was independently reconstructed from the sources used here.',
    seniorJunior: 'The public report suggests a strong hierarchy for at least some 2025–26 freshers; the dataset does not generalize that account to every student without corroboration.',
    positives: 'AIIMS Patna’s official anti-ragging measures provide a dedicated cell, reporting contact, 24/7 hostel wardens/security, fresher awareness sessions and faculty vigilance in hostels and student-congregation areas during the initial admission period.',
    incidents: [
      {year:2026,label:'Public student report alleges 24-rule senior PDF and coercive fresher practices',detail:'An anonymous Apr 2026 post describing the 2025-batch fresher experience alleged a 24-rule PDF, compulsory senior-detail/introduction tasks and head-shaving. The Merit Register labels this as an unverified student report, not an adjudicated incident.'}
    ],
    officialResponse: 'AIIMS Patna reconstituted its Anti-Ragging Core Committee in Apr 2026 with administration, hostel, security, police/community and fresher/parent representation. Published institute measures also describe 24/7 wardens/security and faculty vigilance during the initial month of a new batch.',
    trend: 'Conflicting but meaningful 2026 trend signal: an April account alleges a structured rule system, while a July self-identified student says the batch collectively stopped following those rules. This suggests possible rapid change, but does not establish what future batches will experience.',
    unknowns: 'The 24-rule PDF’s authorship and batch-wide enforcement remain unverified. The July follow-up supports a reported collective opt-out, but the hostel/day-scholar split, girls’ experience and durability of that change for future batches remain unknown.',
    confidence: 'High for official 2026 anti-ragging framework · Medium for existence of current public allegation · Low for exact enforcement/prevalence',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'AIIMS Patna — Anti-Ragging Core Committee office order (Apr 2026)',url:'https://api.aiimspatna.edu.in/advertisement/Office-Order-recostitutionOfAnti-RaggingCommittee-23052026.pdf',year:2026},
      {kind:'official',label:'AIIMS Patna — published anti-ragging measures',url:'https://aiimspatna.edu.in/document/Anti-Ragging-Measures.pdf',year:2022},
      {kind:'student',label:'Anonymous public report — “Interaction at AIIMS Patna” (Apr 2026)',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1soxst2/interaction_at_aiims_patna/',year:2026},
      {kind:'student',label:'Public follow-up — self-identified student says batch stopped following rules (Jul 2026)',url:'https://www.reddit.com/r/genzmedschool/comments/1up48ur/one_of_my_aakash_senior_is_studying_in_aiims/',year:2026}
    ]
  },
  64: {
    currentPicture: 'Strong, unusually explicit official prevention rules are visible. Current public first-hand evidence about informal senior-imposed rules is too thin to characterize the lived experience confidently.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'The research pass found official hostel/anti-ragging rules, not a senior-issued fresher rulebook.',
    groundRules: 'Official hostel guidance says a junior should not be taken into or found in a senior student’s room until the freshers’ welcome party is over; such a situation is treated as ragging unless otherwise proven.',
    introCulture: 'Current informal intro practice not reliably reconstructed from public evidence.',
    dressAppearance: 'No senior-imposed haircut, shaving or fresher dress rules verified in this pass.',
    movementCommonAreas: 'No informal restriction verified. The clearest official separation rule concerns junior entry into senior rooms before the freshers’ welcome party.',
    seniorJunior: 'Official material expects seniors to help new students settle in; current lived-experience evidence remains insufficient for a broader claim.',
    positives: 'Formal anti-ragging surveillance and an annual committee are explicitly described by the institute.',
    incidents: [],
    officialResponse: 'AIIMS states ragging in any form is prohibited, describes punitive measures including rustication, and says an Anti-Ragging Committee is constituted every year.',
    trend: 'Current trend unclear; formal prevention framework is strong.',
    unknowns: 'No current public evidence strong enough to rate frequency, gender differences, or an informal “intro” hierarchy.',
    confidence: 'High for official rules · Low for lived experience',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'AIIMS Delhi hostel FAQ — anti-ragging rules',url:'https://www.aiims.edu/index.php/en/hostel_accomodation_faqs',year:2026},
      {kind:'official',label:'AIIMS Delhi anti-ragging document index',url:'https://www.aiims.edu/aiims/academic/Anti%20Ragging/',year:2025}
    ]
  },
  72: {
    currentPicture: 'A recent public student AMA describes very limited senior-junior hierarchy, mainly wishing seniors as “sir/ma’am”. This is a single self-report, while VMMC’s formal anti-ragging machinery was actively refreshed in August 2026.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No traceable senior-issued fresher booklet or rule sheet was found in this pass.',
    groundRules: 'One August 2026 public student AMA reports a basic sir/ma’am greeting convention; no broader set of compulsory ground rules was verified.',
    introCulture: 'Reported as very limited in one current public AMA; not independently corroborated across multiple students.',
    dressAppearance: 'No senior-imposed haircut or special fresher dress code verified in this pass.',
    movementCommonAreas: 'No current informal common-area restriction verified.',
    seniorJunior: 'Available current public evidence suggests a relatively light hierarchy, but the sample is too small for a definitive campus-wide label.',
    positives: 'Current institutional anti-ragging committee/squad and a principal-led anti-ragging awareness message were posted in August 2026.',
    incidents: [],
    officialResponse: 'VMMC lists an anti-ragging policy and reconstituted its Anti-Ragging Committee and Squad on 5 Aug 2026; an anti-ragging awareness video from the Principal was posted on 10 Aug 2026.',
    trend: 'Recent student signal is reassuring, but evidence depth is limited.',
    unknowns: 'Hostel-by-hostel and gender-specific differences are not adequately reconstructed.',
    confidence: 'High for official response · Medium-low for lived experience',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'VMMC Student Zone — anti-ragging policy',url:'https://vmmc-sjh.mohfw.gov.in/student-zone',year:2026},
      {kind:'official',label:'VMMC 2026 committee / latest notices',url:'https://vmmc-sjh.mohfw.gov.in/latest-news-page',year:2026},
      {kind:'student',label:'Public VMMC AMA — Aug 2026',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1vjz21q/ama_related_to_vmmc/',year:2026}
    ]
  },
  69: {
    currentPicture: 'Current MAMC student accounts conflict. Multiple 2025–26 posts describe PDP/senior interaction as avoidable and reject stereotyped haircut, bowing and forced-intro rules; a separate May 2026 student post describes PDP pressure and social exclusion after refusing to conform. The dataset therefore treats MAMC as variable by senior group/social circle rather than reducing it to a low-ragging label.',
    rulebookStatus: 'No senior-issued rulebook verified',
    rulebookSummary: 'MAMC publishes an official anti-ragging booklet. That should not be confused with an informal booklet issued by seniors; no such senior rulebook was verified here.',
    groundRules: 'A 2025 student post explicitly reported no compulsory haircut/beard rules, bowing, mandatory social-media follows, or forced intros. A 2026 student AMA similarly said senior interaction can be avoided in UG.',
    introCulture: 'Public student reports describe it as avoidable rather than compulsory; corroboration is still limited.',
    dressAppearance: 'No senior-imposed special fresher dress rule is supported by the current student reports used here. Official hostel rules are separate institutional rules.',
    movementCommonAreas: 'No senior-imposed restriction verified in this pass.',
    seniorJunior: 'One public student report described seniors as helpful during counselling; a 2026 AMA said juniors can choose not to attend senior interaction sessions.',
    positives: 'Recent student reports describe a comparatively relaxed hierarchy and helpful seniors.',
    incidents: [],
    officialResponse: 'MAMC maintains anti-ragging material, and its undergraduate hostel rules say ragging can lead to immediate expulsion from the hostel.',
    trend: 'Current evidence is genuinely mixed: several students report that PDPs can be skipped, while at least one 2026 account alleges meaningful social coercion after refusing. No single narrative is treated as campus-wide fact.',
    unknowns: 'No representative evidence by hostel/gender; isolated contrary reports are not enough to quantify frequency.',
    confidence: 'High for official rules · Medium for recent student reports',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'MAMC undergraduate hostel rules',url:'https://mamc.delhi.gov.in/mamc/under-graduate-hostel-rules',year:2026},
      {kind:'official',label:'MAMC circulars — Anti Ragging Booklet',url:'https://mamc.delhi.gov.in/circular-notices/473',year:2026},
      {kind:'student',label:'Student report: “MAMC has no weird rules for 1st years”',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1n4z2iw/mamc_has_no_weird_rules_for_1st_years/',year:2025},
      {kind:'student',label:'MAMC 2025-batch AMA — Aug 2026',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1vl9ak9/senior_from_mamc_25_batch_ama/',year:2026},
      {kind:'student',label:'MAMC student AMA — hostel/PG and first-year context (Jul 2026)',url:'https://www.reddit.com/r/JEENEETards/comments/1uzwn2q/i_am_a_student_of_mamc_delhi_ama/',year:2026},
      {kind:'student',label:'Conflicting student account alleging PDP pressure / social exclusion (May 2026)',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1tfki4s/horrendous_college/',year:2026}
    ]
  },
  65: {
    currentPicture: 'ABVIMS has a current, visible institutional anti-ragging structure, but this pass did not find enough recent public first-hand evidence to characterize informal senior culture reliably.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No senior-issued fresher booklet or ground-rule document was verified.',
    groundRules: 'No senior-imposed rules reliably reconstructed. Institutional do’s and don’ts include total prohibition of ragging and professional dress expectations.',
    introCulture: 'Current lived experience is insufficiently documented in public sources; no ABVIMS-specific PDP pattern was verified.',
    dressAppearance: 'Official student guidance asks for decent dress and aprons in hospital/clinics; this is an institutional rule, not evidence of senior-imposed fresher clothing rules.',
    movementCommonAreas: 'No informal restriction verified.',
    seniorJunior: 'Current lived experience insufficiently documented in public sources.',
    positives: 'The anti-ragging committee includes faculty and student representatives and states that raids/inspections occur in hostels, canteens, playgrounds and other risk areas.',
    incidents: [],
    officialResponse: 'The institutional Anti-Ragging Committee explicitly urges students to report incidents and describes inspections in common student areas.',
    trend: 'Unknown from current public lived-experience evidence.',
    unknowns: 'Rulebook, intro format, hierarchy intensity and hostel-specific experience remain unverified.',
    confidence: 'High for official response · Low for lived experience',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'ABVIMS / RML Institutional Anti-Ragging Committee',url:'https://rmlh.mohfw.gov.in/index1.aspx?langid=1&lev=4&lid=3556&lsid=2584',year:2026},
      {kind:'official',label:'ABVIMS Student Corner — do’s and don’ts',url:'https://rmlh.mohfw.gov.in/index1.aspx?langid=1&lev=3&lid=3575&lsid=2581',year:2026}
    ]
  },
  71: {
    currentPicture: 'Detailed Aug 2025 student responses provide a useful boys/day-scholar picture: non-physical senior interaction and a tolerable PDP are reported, with lower exposure for day scholars and a separate first-year boys hostel. UCMS also has a broad Anti-Ragging and Disciplinary Committee with external and student representation.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No current senior-issued rulebook located in this pass.',
    groundRules: 'No formal senior rulebook was verified. One student response says first-year boys are expected to be clean-shaven and that remaining informal expectations are communicated by seniors.',
    introCulture: 'Two Aug 2025 student responses describe some senior interaction/PDP. One calls it non-physical and not very serious; another calls the PDP tolerable.',
    dressAppearance: 'A detailed 2025 student response reports a clean-shaven expectation for first-year boys; there is no evidence here that this is an official UCMS rule or that it applies to women.',
    movementCommonAreas: 'One day-scholar account says they avoided the canteen during first year to reduce senior interaction; this is a personal avoidance strategy, not a verified senior-imposed common-area ban.',
    seniorJunior: 'The same accounts say seniors often become friends later; evidence is detailed enough to describe some first-year patterns but not to quantify campus-wide prevalence.',
    positives: 'Official committee includes faculty, judiciary/police/media, parent and student representation.',
    incidents: [],
    officialResponse: 'UCMS publicly lists an Anti-Ragging and Disciplinary Committee and has documented anti-ragging awareness activity.',
    trend: 'Evidence suggests interaction relaxes later and seniors often become friends, but the exact timing is not quantified and the strongest detailed evidence is boys/day-scholar-heavy.',
    unknowns: 'The evidence is boys/day-scholar-heavy. Girls’ experience, direct refusal consequences and current 2026 batch practice remain under-documented.',
    confidence: 'High for official response · Medium for 2025 boys/day-scholar lived-experience detail · Low for campus-wide prevalence',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'UCMS committees — Anti Ragging & Disciplinary Committee',url:'https://www.ucms.ac.in/administration/committees',year:2026},
      {kind:'official',label:'UCMS institutional gallery / anti-ragging activity',url:'https://www.ucms.ac.in/aboutucms/viewgallery',year:2024},
      {kind:'student',label:'UCMS admissions / ragging / hostel discussion (Aug 2025)',url:'https://www.reddit.com/r/indianmedschool/comments/1mqy6gc/any_ucms_senior_here/',year:2025}
    ]
  },
  262: {
    currentPicture: 'Official prevention controls are unusually visible: first-years have been allocated separate living rooms, escorted to class, and covered by scheduled anti-ragging rounds. Public anecdotal allegations also exist, but they are not strong enough to establish current frequency or typical severity.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No senior-issued fresher rule sheet was verified in this pass.',
    groundRules: 'The strongest reconstructed “ground rules” are institutional protections separating new students from potential senior contact, not senior-imposed rules.',
    introCulture: 'Current informal intro practices are not reliably reconstructed.',
    dressAppearance: 'No senior-imposed dress/hair rule verified.',
    movementCommonAreas: 'Official annual-report material describes monitoring of hostels, sports field, amphitheatre, canteens, mess, library and campus common areas; this is a prevention measure, not a junior ban.',
    seniorJunior: 'The institute reports a mentorship programme with faculty mentors and peer mentors; informal hierarchy intensity remains uncertain.',
    positives: 'Separate first-year living arrangements, guard escorts, multiple daily squad rounds, surprise checks and peer/faculty mentorship are explicitly reported by the institute.',
    incidents: [],
    officialResponse: 'AIIMS Jodhpur’s 2023–24 annual report describes anti-ragging squads, daily reporting, separate new-student rooms, guard escorts and three planned rounds per day.',
    trend: 'Official prevention is strong; current lived-experience trend remains uncertain.',
    unknowns: 'Anecdotal online allegations are insufficiently corroborated to quantify current ragging.',
    confidence: 'High for prevention framework · Low for current lived experience',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'AIIMS Jodhpur Annual Report 2023–24 — anti-ragging measures',url:'https://www.aiimsjodhpur.edu.in/annual%20report/ENG%20-%20Annual%20Report%2023-24%20%288%29%20%281%29%20%281%29.pdf',year:2024},
      {kind:'official',label:'AIIMS Jodhpur anti-ragging measures',url:'https://www.aiimsjodhpur.edu.in/news/antiragging.pdf',year:2026}
    ]
  },
  372: {
    currentPicture: 'Formal anti-ragging onboarding and disciplinary controls are clear, but current UG lived-experience evidence is insufficient to label the campus low-, moderate- or high-ragging with confidence.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No senior-issued fresher booklet verified.',
    groundRules: 'Institute reporting/admission material treats ragging as a disciplinary offence and requires anti-ragging compliance; this is official policy, not a senior rule set.',
    introCulture: 'Insufficient current public evidence.',
    dressAppearance: 'No senior-imposed fresher appearance rule verified.',
    movementCommonAreas: 'No informal junior movement restriction verified.',
    seniorJunior: 'Not enough traceable current UG student evidence to characterize typical hierarchy.',
    positives: 'The institute maintains a formal anti-ragging squad/order structure and includes ragging in the list of serious disciplinary offences.',
    incidents: [],
    officialResponse: 'AIIMS Rishikesh has issued anti-ragging squad orders and admission/reporting material with disciplinary penalties that can extend to hostel or institute expulsion and police action depending on the offence.',
    trend: 'Unclear.',
    unknowns: 'Current intro culture, hostel-specific hierarchy and any informal rules remain unverified.',
    confidence: 'High for official response · Low for lived experience',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'AIIMS Rishikesh office orders — Anti-Ragging Squad',url:'https://aiimsrishikesh.edu.in/a1_1/?page_id=2277',year:2024},
      {kind:'official',label:'AIIMS Rishikesh MBBS reporting guidelines',url:'https://aiimsrishikesh.edu.in/a1_1/wp-content/uploads/2020/11/Reporting-guidelines-for-MBBS-at-AIIMS-Rishikesh-for-Session-2022-Round-1.pdf',year:2022}
    ]
  },
  168: {
    currentPicture: 'A 2025 public complaint/exposé alleged a detailed digital rule set imposed by seniors, including eye-contact, address, messaging and behaviour controls. The existence of the public allegations is clear; the underlying facts and final institutional adjudication were not independently verified in this pass.',
    rulebookStatus: 'Reported digital senior rule set — unverified',
    rulebookSummary: 'Public posts in Aug 2025 reproduced/quoted a set of alleged senior instructions. Treat this as a reported rule set, not an official college document.',
    groundRules: 'Reported rules included not leaving senior messages seen, formal address, restrictions on emojis/reactions, avoiding arguments, and accepting senior instructions. These are allegations from public student posts, not verified institutional rules.',
    introCulture: 'The reported rule set centered on hierarchy and controlled communication; exact frequency and enforcement across the batch are unverified.',
    dressAppearance: 'No specific appearance rule included in the strongest source used here.',
    movementCommonAreas: 'One reproduced rule reportedly restricted appearing on the ground before juniors knew all seniors; verification is limited to the public post.',
    seniorJunior: 'The public allegations describe a high-control hierarchy. Because the evidence is social-media based, this cannot be generalized to every senior or every cohort.',
    positives: 'The controversy generated visible anti-ragging pushback from students online; AIIMS Bhopal also has a formal anti-ragging policy.',
    incidents: [
      {year:2025,label:'Public digital-rule allegation',detail:'Multiple public posts described an alleged senior-issued list of communication and behavioural controls. The website records the allegation and source, not a finding of guilt.'}
    ],
    officialResponse: 'A formal AIIMS Bhopal anti-ragging policy exists. This research pass did not verify the final outcome of the specific 2025 online complaint.',
    trend: 'Unclear after the 2025 controversy; a current 2026 first-hand follow-up was not found.',
    unknowns: 'Final complaint disposition, current enforcement, gender differences and 2026 batch experience are unverified.',
    confidence: 'Medium for existence of public reports · Low for adjudicated facts',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'AIIMS Bhopal anti-ragging policy',url:'https://nursing.aiimsbhopal.edu.in/downloads/anti_ragging_policy.pdf',year:2026},
      {kind:'student',label:'Public student post reproducing alleged senior rules',url:'https://www.reddit.com/r/indianmedschool/comments/1n484x3/',year:2025},
      {kind:'student',label:'Public complaint post regarding alleged AIIMS Bhopal rules',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1n4o2qn/',year:2025}
    ]
  },
  239: {
    currentPicture: 'The available detailed student account describes the environment as relaxed and ragging as almost nil by 2024, while recalling lighter regional interactions in earlier years and strong administrative suppression. This is useful but still a single public lived-experience source.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No senior-issued fresher rulebook found.',
    groundRules: 'No current senior-imposed rule set verified.',
    introCulture: 'One alumnus/student-style account described older “light interactions” but said current ragging had largely stopped after stricter administration.',
    dressAppearance: 'No senior-imposed appearance rules verified.',
    movementCommonAreas: 'No informal restrictions verified.',
    seniorJunior: 'The available account describes seniors later becoming important guides, suggesting a potentially positive mentoring relationship after first year.',
    positives: 'A public account describes a multicultural, chilled environment and helpful senior relationships after freshers; official anti-ragging policy is explicit.',
    incidents: [],
    officialResponse: 'AIIMS Bhubaneswar publishes an MBBS anti-ragging policy banning ragging inside and outside campus.',
    trend: 'Available student account suggests improvement to very low current levels by 2024; independent corroboration is limited.',
    unknowns: 'No strong 2026 first-hand update or batch-wide evidence.',
    confidence: 'High for policy · Medium-low for lived experience',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'AIIMS Bhubaneswar anti-ragging policy for MBBS',url:'https://aiimsbhubaneswar.nic.in/wp-content/uploads/2024/07/studentnotice_1349953378.pdf',year:2024},
      {kind:'official',label:'AIIMS Bhubaneswar anti-ragging page',url:'https://aiimsbhubaneswar.nic.in/anti-ragging/',year:2026},
      {kind:'student',label:'Public student/alumni account — Sep 2024',url:'https://www.reddit.com/r/indianmedschool/comments/1f73hxr',year:2024}
    ]
  },
  402: {
    currentPicture: 'KGMU has a documented recent UG case in addition to its long-standing ragging reputation: in Oct 2024, the university suspended nine second-year students (eight MBBS and one BDS) for three months after an investigation into late-night video-call ragging of first-years. Current 2026 public discussion is mixed, so this dataset does not assume that the 2024 pattern describes every fresher now.',
    rulebookStatus: 'No current informal senior rulebook verified',
    rulebookSummary: 'No current senior-issued booklet was verified in this pass.',
    groundRules: 'No current informal rule set was verified. KGMU’s published student do’s/don’ts contain an institutional dress code; this should not be mislabelled as senior ragging.',
    introCulture: 'The 2024 case involved late-night video calls where juniors reported being made to sing or dance and being threatened against reporting; current 2026 comments are too inconsistent to quantify how common similar interactions are now.',
    dressAppearance: 'KGMU publishes formal institutional dress expectations for students. These are college rules, not evidence of seniors imposing a separate fresher dress code.',
    movementCommonAreas: 'No current senior-imposed common-area restriction verified. In the 2024 case, the reported interaction shifted to video calls despite physical hostel security.',
    seniorJunior: 'A committee-linked 2024 disciplinary action establishes that coercive senior-junior interaction occurred; present-day prevalence remains uncertain rather than presumed unchanged.',
    positives: 'KGMU investigated the 2024 complaint, checked phones, suspended the involved students and removed them from hostel; the university also maintains a formal anti-ragging squad.',
    incidents: [
      {year:2024,label:'Nine second-year students suspended after video-call ragging complaint',detail:'Times of India reported that eight MBBS and one BDS second-year students were suspended for three months and removed from hostel after KGMU’s investigation confirmed late-night video calls to first-years; juniors reported being made to sing or dance and being threatened against reporting.'}
    ],
    officialResponse: 'KGMU publicly lists its anti-ragging squad. In the Oct 2024 UG case, officials reported a Proctorial Board investigation, phone checks, three-month suspensions and hostel removal for the nine students involved.',
    trend: 'Unclear: a serious UG disciplinary case is documented in 2024, while 2026 public comments vary on how much the culture has reduced since then.',
    unknowns: 'Current rulebook status, actual 2026 frequency, gender/hostel differences and severity distribution remain uncertain.',
    confidence: 'High for 2024 disciplinary case and official rules · Low-medium for 2026 lived experience',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'KGMU Anti-Ragging Squad',url:'https://www.kgmu.org/anti_ragging_squad.php',year:2026},
      {kind:'official',label:'KGMU student do’s & don’ts / institutional dress',url:'https://placement.kgmu.org/do_donts.php',year:2026},
      {kind:'news',label:'Times of India — nine KGMU students suspended for video-call ragging (Oct 2024)',url:'https://timesofindia.indiatimes.com/city/lucknow/nine-kgmu-medical-students-suspended-for-ragging-juniors-via-video-calls/articleshow/114556300.cms',year:2024},
      {kind:'student',label:'Public KGMU ragging discussion — Aug 2026',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1vrlm9c/ragging_in_kgmu/',year:2026}
    ]
  },
  400: {
    currentPicture: 'A 2025 case is unusually well documented: 25 senior MBBS students were reported as fined after an anti-ragging investigation found them involved in ragging juniors. Public student accounts about the present-day culture conflict, so the 2026 trend is not labelled as settled.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No senior-issued rulebook was verified in this pass.',
    groundRules: 'No current informal ground-rule document verified.',
    introCulture: 'Public accounts conflict: some characterize current practice as little more than introductions, while others report a meaningful ragging culture.',
    dressAppearance: 'No senior-imposed appearance rule verified.',
    movementCommonAreas: 'No informal restriction verified.',
    seniorJunior: 'The documented 2025 case prevents a “no ragging” label; current public accounts are mixed rather than uniformly negative.',
    positives: 'The 2025 complaint led to an anti-ragging committee investigation and disciplinary fines, demonstrating a traceable institutional response.',
    incidents: [
      {year:2025,label:'25 MBBS seniors fined after anti-ragging investigation',detail:'A June 2025 report states that 25 senior MBBS students from the 2023–24 batch were identified and fined ₹25,000 each after the anti-ragging committee investigated complaints from juniors.'}
    ],
    officialResponse: 'The reported 2025 case involved committee investigation, parental meetings and monetary penalties.',
    trend: 'Unclear: recent student accounts conflict, so the site does not infer that the 2025 incident either persists unchanged or has disappeared.',
    unknowns: 'No representative 2026 survey; exact current prevalence and hostel/gender differences remain unknown.',
    confidence: 'High for 2025 disciplinary case · Medium-low for 2026 trend',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'BHU Institute of Medical Sciences — Anti-Ragging page',url:'https://bhu.ac.in/Site/Page/84_4_4657_7055_Institute-of-Medical-Sciences-Anti-Ragging-%28IMS%29',year:2026},
      {kind:'news',label:'Medical Dialogues — 25 IMS-BHU MBBS students fined (Jun 2025)',url:'https://medicaldialogues.in/news/education/medical-colleges/ims-bhu-25-mbbs-students-fined-rs-25k-each-for-ragging-juniors-149920',year:2025},
      {kind:'student',label:'Public IMS BHU AMA / student discussion',url:'https://www.reddit.com/r/MBBSindia/comments/1llsyyj/ama_ask_me_anything_about_ims_bhu/',year:2025}
    ]
  },
  255: {
    currentPicture: 'JIPMER has clear formal anti-ragging rules and admission affidavits, but this pass did not find enough current UG first-hand evidence to characterize informal fresher hierarchy fairly.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No senior-issued UG fresher booklet verified.',
    groundRules: 'Formal rules ban ragging and require anti-ragging affidavits; no informal senior rule set reconstructed.',
    introCulture: 'Insufficient current UG evidence.',
    dressAppearance: 'No senior-imposed fresher appearance rules verified.',
    movementCommonAreas: 'No informal restrictions verified.',
    seniorJunior: 'Current UG lived-experience evidence insufficient.',
    positives: 'JIPMER’s prospectus describes explicit anti-ragging sanctions and an institutional complaint pathway.',
    incidents: [],
    officialResponse: 'The MBBS prospectus states that ragging is banned and can trigger FIR, suspension/rustication, fines or expulsion; students submit anti-ragging affidavits.',
    trend: 'Unknown from current UG public evidence.',
    unknowns: 'Informal rulebook, intro culture and current senior-junior hierarchy remain unverified.',
    confidence: 'High for official framework · Low for lived experience',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'JIPMER MBBS Prospectus 2025–26',url:'https://jipmer.ac.in/sites/default/files/2025%20MBBS%20PROSPECTUS.pdf',year:2025},
      {kind:'official',label:'JIPMER Anti-Ragging Committee',url:'https://jipmer.edu.in/anti-ragging-committee',year:2026}
    ]
  },
  49: {
    currentPicture: 'PMCH has the strongest “informal rulebook reported” signal in this pilot. A Sep 2025 public thread asked freshers to confirm a booklet allegedly circulated by seniors, and a similar rulebook was posted again on 20 Aug 2026. The documents’ authorship, official authenticity, scope and enforcement were not institutionally verified, so every such field remains labelled reported rather than factual.',
    rulebookStatus: 'Informal fresher booklet reported — not officially verified',
    rulebookSummary: 'A public anti-ragging community post in Sep 2025 said a booklet was being circulated as a “freshers guide”; commenters linked a fuller pamphlet and some claimed familiarity. A visually similar/related rulebook post resurfaced on 20 Aug 2026. This supports a recurring public report, not proof of who authored or enforced it.',
    groundRules: 'Public comments around the alleged booklet describe senior-address conventions such as “boss/ma’am” and various behavioural rules. Because the source is social media, the site does not present the full alleged rule list as established campus policy.',
    introCulture: 'A public commenter claiming direct reporting-day experience described being told to address seniors as “boss”; another commenter said most alleged rules could be ignored apart from basic courtesy. Experiences clearly vary.',
    dressAppearance: 'The 2025 thread discusses alleged appearance/accessory restrictions in the circulated material, but exact enforcement is unverified.',
    movementCommonAreas: 'The alleged pamphlet and comments discuss behavioural restrictions; no institutionally verified current junior-access rule was found.',
    seniorJunior: 'Public accounts range from intimidation concerns to claims that the rules are largely ignorable and seniors later provide academic help. This variation is preserved rather than collapsed into one score.',
    positives: 'Some commenters describe seniors as useful for guidance and say the most coercive expectations can be ignored; this remains anecdotal.',
    incidents: [
      {year:2025,label:'Reported fresher booklet / pamphlet',detail:'A public anti-ragging thread asked PMCH freshers to confirm a booklet allegedly circulated by seniors as a fresher guide; multiple commenters claimed familiarity, but no official authentication was found.'}
    ],
    officialResponse: 'PMCH’s official site links to anti-ragging resources, but this pass did not find an official statement authenticating or adjudicating the circulated booklet.',
    trend: 'The rulebook allegation resurfaced publicly in Aug 2026, so it is current enough to matter. A batch-wide 2026 prevalence or enforcement rate is still not established.',
    unknowns: 'Who authored the booklet, how widely it was circulated, gender/hostel differences, what was actually enforced, and any official disciplinary outcome.',
    confidence: 'Medium for recurring public booklet report · Low for exact enforcement',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'PMCH official website',url:'https://patnamedicalcollege.edu.in/',year:2026},
      {kind:'student',label:'Public thread: PMCH fresher booklet confirmation request',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1n8xi7u/medicos_from_pmch_kindly_confirm_this/',year:2025},
      {kind:'student',label:'Public post: PMCH fresher rulebook resurfaced',url:'https://www.reddit.com/r/MEDICOreTARDS/comments/1vtkr1h/rulebook_given_to_freshers_at_pmchpatna/',year:2026}
    ]
  },
  220: {
    currentPicture: 'A recent disciplinary case is well documented: in Oct 2024, two second-year MBBS students were reported as found guilty of ragging a junior and suspended from the hostel for one year after the junior was forced to dance. This establishes a recent incident, not the frequency of the entire campus in 2026.',
    rulebookStatus: 'No informal senior rulebook verified',
    rulebookSummary: 'No senior-issued fresher rulebook found in this pass.',
    groundRules: 'No current informal senior rule set verified. A 2024 report said seniors were not allowed to interact with freshers in the first-year hostel; that is a protective institutional separation rule.',
    introCulture: 'The 2024 case involved seniors asking a fresher for his name and forcing him to dance; this is a documented incident, not proof that such interactions are routine.',
    dressAppearance: 'No current senior-imposed appearance rules verified. A 2019 dress-code controversy involved college/hostel authorities, not seniors, and is therefore kept out of the senior-rulebook label.',
    movementCommonAreas: 'The 2024 report describes first-year and senior hostels as separated and anti-ragging rounds in hostels.',
    seniorJunior: 'A documented recent incident exists, while typical 2026 senior-junior relationships remain insufficiently reconstructed.',
    positives: 'The 2024 incident was intercepted during anti-ragging monitoring and followed by investigation and a one-year hostel suspension recommendation/action; the college also ran Anti-Ragging Week in 2025.',
    incidents: [
      {year:2024,label:'Two second-year MBBS students disciplined',detail:'A reported Anti-Ragging Committee investigation found two second-year students guilty after a junior was forced to dance in the first-year hostel; they were suspended from the hostel for one year.'}
    ],
    officialResponse: 'The college has anti-ragging monitoring and held an Anti-Ragging Week programme in Aug 2025.',
    trend: 'Unknown for 2026; the documented 2024 incident should not be extrapolated into a current campus-wide frequency claim.',
    unknowns: 'No current representative student evidence about rulebooks, day-to-day intros or gender/hostel differences.',
    confidence: 'High for 2024 incident · Low for 2026 frequency',
    lastVerified: '21 Aug 2026',
    sources: [
      {kind:'official',label:'Grant GMC / JJ — Anti-Ragging Week 2025 programme',url:'https://gmcjjh.edu.in/wp-content/uploads/2025/08/Anti-ragging-week-program-12-18-aug-2025.pdf',year:2025},
      {kind:'news',label:'Medical Dialogues — 2024 Grant/JJ ragging disciplinary case',url:'https://medicaldialogues.in/news/education/medical-colleges/jj-hospitals-grant-medical-college-two-2-year-mbbs-students-suspended-for-ragging-junior-136665',year:2024}
    ]
  }
};


// Expanded research pass — 21 Aug 2026. Adds all missing deep-profile colleges and artifact metadata.
Object.assign(JUNIOR_CULTURE, {
  "45": {
    "currentPicture": "IGIMS publishes anti-ragging material and an affidavit link, but this pass did not find a current authenticated senior-issued rulebook. Public discussion contains historical and second-hand claims about hierarchy and appearance rules; those are too weak to present as current campus facts.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current 2026 intro culture is not reliably reconstructed. Older public recollections and 2026 hearsay exist, but neither is strong enough to quantify present practice.",
    "dressAppearance": "Head-shaving is mentioned in current public hearsay, but no direct current first-person corroboration or institutional finding was located, so it is not marked as verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "There are public concerns about hierarchy, but current first-hand evidence is too thin for a strong label.",
    "positives": "IGIMS currently surfaces an anti-ragging affidavit/resource on its official website and has previously published anti-ragging committee/mentor mechanisms.",
    "incidents": [],
    "officialResponse": "The official IGIMS site currently lists an “Affidavit Regarding Ragging”; historical institute orders also document anti-ragging committee and mentor/mentee structures.",
    "trend": "Current trend remains unclear because lived-experience evidence is limited.",
    "unknowns": "Whether any informal rulebook exists in 2026, prevalence of senior-imposed dress/hair expectations, hostel differences and current enforcement.",
    "confidence": "High for official anti-ragging resource · Low for current lived experience",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "IGIMS official website — Affidavit Regarding Ragging",
        "url": "https://www.igims.org/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Public 2026 discussion about IGIMS ragging concerns — unverified",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/",
        "year": 2026
      }
    ]
  },
  "189": {
    "currentPicture": "AIIMS Nagpur has a current, detailed official Anti-Ragging Committee and Squad updated in April 2026. This pass found almost no substantive current student evidence describing an informal senior rule system, so the lived-experience fields remain deliberately open.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current informal intro practice could not be reconstructed confidently.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Current senior-junior hierarchy remains insufficiently documented for a campus-wide claim.",
    "positives": "The 2026 committee includes student-welfare, hostel, security and outside members, with a separately listed Anti-Ragging Squad.",
    "incidents": [],
    "officialResponse": "AIIMS Nagpur publishes a current National Ragging Prevention Programme page with committee and squad contacts; the page states it was last updated 30 Apr 2026.",
    "trend": "Formal prevention evidence is current; lived-experience trend is unknown.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "High for current official framework · Very low for informal-culture claims",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "AIIMS Nagpur — Anti-Ragging Committee and Squad 2025/current",
        "url": "https://dell.aiimsnagpur.edu.in/pages/anti-ragging_committee_2025",
        "year": 2026
      }
    ]
  },
  "288": {
    "currentPicture": "SMS Jaipur has recent, concrete disciplinary evidence rather than just rumor. In late 2025, 16 MBBS students and one intern were reported suspended after an inquiry into a first-year complaint. A separate March 2026 complaint initially led to six suspensions but was later reportedly linked to an interpersonal dispute/false complaint. These events show why allegations and final findings must be versioned separately.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "No dependable current source was found that reconstructs ordinary day-to-day intro culture for the whole first-year batch.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Recent disciplinary cases show that serious complaints can arise, but they do not establish that all senior-junior interaction at SMS is coercive.",
    "positives": "The administration has used an anti-ragging committee and imposed suspensions in response to complaints.",
    "incidents": [
      {
        "year": 2025,
        "label": "16 MBBS students + 1 intern reported suspended after first-year complaint",
        "detail": "A Dec 2025 report said the anti-ragging committee found 16 second-year students and one intern guilty and suspended them after a first-year MBBS complaint."
      },
      {
        "year": 2026,
        "label": "Six students initially suspended; later probe reportedly disputed the ragging allegation",
        "detail": "A Mar 2026 report said six students were initially suspended, while a later internal probe reportedly attributed the episode to interpersonal disputes. The dataset preserves both stages."
      }
    ],
    "officialResponse": "No current senior-issued rulebook was found. Administrative response is evidenced through recent anti-ragging inquiries and suspensions reported in the press.",
    "trend": "Recent record is mixed: serious confirmed/reported disciplinary action in late 2025, followed by a 2026 complaint that was reportedly not upheld as ragging after further probe.",
    "unknowns": "Current routine fresher ground rules, hostel-specific hierarchy and whether any informal booklet exists.",
    "confidence": "High for existence of recent reported disciplinary proceedings · Low for routine lived experience",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "news",
        "label": "Medical Dialogues — 16 MBBS students and 1 intern suspended (Dec 2025)",
        "url": "https://medicaldialogues.in/news/education/medical-colleges/sms-medical-college-16-mbbs-students-1-intern-suspended-for-ragging-159791",
        "year": 2025
      },
      {
        "kind": "news",
        "label": "Medical Dialogues — six suspended; later probe disputes complaint (Mar 2026)",
        "url": "https://medicaldialogues.in/n-167238",
        "year": 2026
      }
    ]
  },
  "75": {
    "currentPicture": "B.J. Medical College Ahmedabad has a current official anti-ragging committee and a serious June 2026 disciplinary case in its postgraduate orthopaedics department. That PG case is relevant to institutional response but should not be misrepresented as evidence about first-year MBBS culture.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "No sufficiently current UG source was found to characterize normal MBBS senior-junior interaction.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Current UG hierarchy is unknown. A 2026 PG disciplinary case should not be generalized to MBBS freshers.",
    "positives": "A current committee is published and the state/college imposed six-to-twelve-month suspensions in the 2026 PG case after committee investigation.",
    "incidents": [
      {
        "year": 2026,
        "label": "Three second-year PG residents suspended after anti-ragging inquiry",
        "detail": "The June 2026 case involved first-year orthopaedic residents, not MBBS freshers. One student was suspended for a year and two for six months after the anti-ragging committee report was accepted."
      }
    ],
    "officialResponse": "The college publishes an anti-ragging committee. In the June 2026 PG case, the Gujarat Health Department confirmed the committee-recommended suspensions.",
    "trend": "Institutional enforcement is current; UG lived-experience trend remains unknown.",
    "unknowns": "Current MBBS fresher rulebook, intro culture, dress rules and hostel hierarchy.",
    "confidence": "High for official/PG disciplinary evidence · Low for UG lived experience",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "BJMC Ahmedabad — Anti-Ragging Committee",
        "url": "https://www.bjmcabd.edu.in/",
        "year": 2026
      },
      {
        "kind": "news",
        "label": "Indian Express — 3 PG students suspended for ragging juniors",
        "url": "https://indianexpress.com/article/cities/ahmedabad/3-pg-students-at-b-j-medical-college-suspended-for-ragging-juniors-10745072/",
        "year": 2026
      }
    ]
  },
  "360": {
    "currentPicture": "Osmania Medical College publishes a current UG Anti-Ragging Committee with faculty, hostel wardens, police/civil representatives and class representatives. Public 2026 discussion about day-to-day ragging is rumor-heavy and often conflates Osmania with other Telangana colleges, so this build does not infer specific fresher rules from it.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current informal intro practice could not be reconstructed confidently.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Current senior-junior hierarchy remains insufficiently documented for a campus-wide claim.",
    "positives": "The official UG anti-ragging committee explicitly includes boys’ and girls’ hostel wardens plus representatives from multiple student batches.",
    "incidents": [],
    "officialResponse": "Osmania Medical College lists a dedicated Anti-Ragging Committee for undergraduates on its official website.",
    "trend": "Official mechanism is current; present informal culture remains under-documented.",
    "unknowns": "Whether “intro” sessions, dress/hair rules or senior-imposed common-area restrictions occur in the current batch.",
    "confidence": "High for official committee · Very low for current informal-culture claims",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "Osmania Medical College — UG Anti-Ragging Committee",
        "url": "https://www.omc.ac.in/anti-ragging-committee.php",
        "year": 2026
      }
    ]
  },
  "440": {
    "currentPicture": "IPGMER has a current prospectus-level Anti-Ragging & Disciplinary Committee and a zero-tolerance notice. A June 2026 public discussion contains one anonymous statement saying there is “no ragging in IPGMER”; that is a reassuring but very small lived-experience signal, not a prevalence estimate.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "One current anonymous public comment reports no ragging, but it does not describe intro practices in enough detail to reconstruct them.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Available public evidence is reassuring but too sparse to rate senior hierarchy confidently.",
    "positives": "The prospectus lists a standing committee involving administration, hostel superintendents, police and NGO representation; the institute also publishes a zero-tolerance notice with reporting routes.",
    "incidents": [],
    "officialResponse": "IPGMER’s prospectus states ragging is strictly forbidden and identifies its Anti-Ragging & Disciplinary Committee and reporting contacts.",
    "trend": "Single 2026 student signal is reassuring; evidence depth remains low.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "High for official framework · Low for lived experience",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "IPGMER prospectus — Anti-Ragging & Disciplinary Committee",
        "url": "https://www.ipgmer.gov.in/pdf/Prospectus.pdf",
        "year": 2026
      },
      {
        "kind": "official",
        "label": "IPGMER — Zero Tolerance for Ragging notice",
        "url": "https://ipgmer.gov.in/pdf/AntiraggingNotice.pdf",
        "year": 2024
      },
      {
        "kind": "student",
        "label": "Public Kolkata college discussion — single IPGMER “no ragging” claim",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1uelq3s/best_college_for_mbbs_in_kolkata/",
        "year": 2026
      }
    ]
  },
  "226": {
    "currentPicture": "Current public evidence for Seth GS/KEM leans reassuring: a July 2026 commenter claiming to have chosen KEM the previous year said there was no ragging, and another 2025 Mumbai discussion similarly described KEM as low/no ragging. These remain anonymous student reports and are not a representative survey.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current public reports do not describe a compulsory intro system.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Recent student reports describe seniors as accessible/helpful rather than coercive, with limited evidence depth.",
    "positives": "Current student reports emphasize approachable seniors and many activities; KEM also maintains formal anti-ragging mechanisms.",
    "incidents": [],
    "officialResponse": "KEM’s official site lists anti-ragging resources/committee. This pass did not find a current senior-issued rulebook.",
    "trend": "Recent public signals are reassuring, while much older historical incidents are not used to characterize today’s batch.",
    "unknowns": "Hostel-specific differences, gender differences and the exact first-month interaction pattern.",
    "confidence": "Medium-low for recent lived experience · High for formal anti-ragging mechanism",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "KEM Hospital / Seth GS Medical College — official site",
        "url": "https://www.kem.edu/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Public 2026 KEM student report",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1uyed5z/college_help_kem_vs_aiims/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Public 2025 Mumbai medical-college ragging discussion",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1mdtk9o/is_there_ragging_in_bombay_medical_colleges/",
        "year": 2025
      }
    ]
  },
  "230": {
    "currentPicture": "TNMC/Nair has a current 2025–26 Anti-Ragging Committee with first- and second-year student/parent representation, and the college marked National Anti-Ragging Day/Week in August 2026. Current public evidence about informal fresher rules is too thin to make a campus-wide claim.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current informal intro practice could not be reconstructed confidently.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Current senior-junior hierarchy remains insufficiently documented for a campus-wide claim.",
    "positives": "The current committee explicitly includes 2025–26 first-year and 2024–25 second-year student representatives plus police/NGO/media members.",
    "incidents": [],
    "officialResponse": "TNMC publishes the 2025–26 Anti-Ragging Committee membership and current anti-ragging awareness activity.",
    "trend": "Formal framework is current; lived-experience trend unknown.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "High for official framework · Very low for informal-culture claims",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "TNMC/Nair — Anti-Ragging Committee members 2025–26",
        "url": "https://tnmcnair.edu.in/wp-content/uploads/2025/10/ARC-Members-list-FINAL-2025-26-26.12.25.pdf",
        "year": 2026
      },
      {
        "kind": "official",
        "label": "TNMC/Nair official website",
        "url": "https://tnmcnair.edu.in/",
        "year": 2026
      }
    ]
  },
  "51": {
    "currentPicture": "GMCH Chandigarh has a very current official anti-ragging framework: its committee page was updated in 2026, the site advertises a dedicated anti-ragging number, and the admissions page links anti-ragging guidelines. Current student evidence about informal senior rules is insufficient.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current informal intro practice could not be reconstructed confidently.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Current senior-junior hierarchy remains insufficiently documented for a campus-wide claim.",
    "positives": "The official site makes the anti-ragging number prominent and lists a multidisciplinary committee.",
    "incidents": [],
    "officialResponse": "GMCH publishes its Anti-Ragging Committee and admissions-related anti-ragging guidelines; the main site lists a dedicated anti-ragging contact.",
    "trend": "Official protection framework is current; informal culture cannot yet be rated.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "High for current official framework · Very low for lived experience",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "GMCH Chandigarh — Anti-Ragging Committee",
        "url": "https://www.gmch.gov.in/anti-ragging-gmch-committee",
        "year": 2026
      },
      {
        "kind": "official",
        "label": "GMCH Chandigarh — Admissions / anti-ragging guidelines",
        "url": "https://www.gmch.gov.in/admissions",
        "year": 2026
      }
    ]
  },
  "66": {
    "currentPicture": "Dr BSA Medical College has a detailed institutional anti-ragging booklet for the 2021–22 batch that explicitly acknowledges new-entrant anxiety and states the goal of a ragging-free campus. The research pass did not find strong, current 2026 student evidence describing informal senior ground rules.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current informal intro practice could not be reconstructed confidently.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Current senior-junior hierarchy remains insufficiently documented for a campus-wide claim.",
    "positives": "The college booklet is specifically written for incoming MBBS students and explains prevention/control measures.",
    "incidents": [],
    "officialResponse": "The published anti-ragging booklet states the institution has taken measures to prevent and control ragging and aims to provide a conducive environment during the initial period.",
    "trend": "Current student-level trend is unknown because the strongest institutional booklet is several years old.",
    "unknowns": "Whether any senior-issued rule sheet exists now, current intro hierarchy, and current hostel-specific differences.",
    "confidence": "High for official booklet · Low for 2026 lived experience",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "Dr BSA Medical College — Anti-Ragging booklet for MBBS batch 2021–22",
        "url": "https://bsamch.ac.in/wp-content/uploads/2022/05/Anti-Ragging-Batch-2021-22-14-Feb-2022.pdf",
        "year": 2022
      }
    ]
  },
  "129": {
    "currentPicture": "RIMS Ranchi has official anti-ragging infrastructure and documented orientation activity, but current public evidence is mixed and sparse. This pass found no authenticated informal rulebook and will not elevate questions/rumors about senior titles or restrictions into facts.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current intro culture remains unclear. Public discussions contain both “minimal intro/cooperative seniors” claims and concerns about first-year hostel restrictions, but the latter can involve administration rather than seniors.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "Some public discussion describes strict first-year hostel control, but attribution to hostel administration versus seniors is unclear; it is therefore not coded as a senior-imposed rule.",
    "seniorJunior": "Mixed low-confidence public reports; no strong current campus-wide characterization.",
    "positives": "RIMS has held anti-ragging orientation activity and its site identifies an anti-ragging cell/zero-tolerance posture.",
    "incidents": [],
    "officialResponse": "RIMS documents an anti-ragging orientation programme (2023) and maintains anti-ragging references on its official site.",
    "trend": "Insufficient current evidence for a trend.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "Medium-high for official framework · Low for lived experience",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "RIMS Ranchi — anti-ragging orientation programme",
        "url": "https://rimsranchi.ac.in/gallery-antiraging.php",
        "year": 2023
      },
      {
        "kind": "official",
        "label": "RIMS Ranchi — anti-ragging cell reference",
        "url": "https://rimsranchi.ac.in/mand_disc.php",
        "year": 2026
      }
    ]
  },
  "181": {
    "currentPicture": "MGM Indore has strong recent evidence of real UG anti-ragging cases and also evidence that at least one later complaint was investigated and found false. In Nov 2025, four senior MBBS students were suspended for one month after first-year students complained of assault, abuse, forced smoking/alcohol and confinement. In Dec 2025, a separate anonymous allegation was closed after juniors did not confirm it.",
    "rulebookStatus": "No informal rulebook authenticated; serious fresher “rules” alleged in recent reporting",
    "rulebookSummary": "No actual senior rulebook artifact was authenticated. A Feb 2026 family allegation after a first-year student’s death referred to humiliating hostel/mess rules, but police and college inquiries were still relevant and the allegation was not established as fact in the source.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Routine intro culture is not safely reconstructable from the recent cases alone.",
    "dressAppearance": "No current authenticated dress/hair rulebook was found. Older historical MGM cases involved imposed uniforms, but they are not used as a current rule claim.",
    "movementCommonAreas": "Current online discussion repeatedly describes hostel exposure as the main concern, but those posts are anecdotal.",
    "seniorJunior": "Recent confirmed disciplinary action means the risk signal cannot be dismissed as pure rumor; it still cannot be generalized to every senior or every fresher.",
    "positives": "The college anti-ragging committee has investigated complaints, suspended students, and also closed a later allegation after the junior batch did not substantiate it.",
    "incidents": [
      {
        "year": 2025,
        "label": "Four senior MBBS students suspended for one month",
        "detail": "First-year MBBS students complained to the national anti-ragging system; reporting described assault, verbal abuse, forced smoking/alcohol and confinement in a private flat."
      },
      {
        "year": 2025,
        "label": "Separate anonymous complaint later found false by committee",
        "detail": "In Dec 2025, the committee questioned junior MBBS students and closed a separate anonymous allegation after none confirmed the incident."
      },
      {
        "year": 2026,
        "label": "Family alleges humiliating hostel/mess rules after first-year student death",
        "detail": "The family sought a probe into alleged ragging/bullying; police initially cited academic stress and said the allegations would be investigated. This remains an allegation, not a finding."
      }
    ],
    "officialResponse": "Recent cases show active committee investigation and sanctions, as well as willingness to close an allegation when evidence did not support it.",
    "trend": "Persistent concern is supported by recent disciplinary history, but the record is not one-directional: the institution has both sanctioned verified/reported misconduct and rejected an unsubstantiated complaint.",
    "unknowns": "Current batch-wide prevalence, exact informal ground rules, day-scholar/hosteller difference and outcome of the 2026 family allegations.",
    "confidence": "High for 2025 reported disciplinary cases · Medium for current risk signal · Low for exact prevalence",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "MGM Medical College Indore — official site / anti-ragging helpline",
        "url": "https://www.mgmmedicalcollege.edu.in/",
        "year": 2026
      },
      {
        "kind": "news",
        "label": "Free Press Journal — four seniors suspended after 2025 fresher complaint",
        "url": "https://www.freepressjournal.in/indore/indore-news-mbbs-freshers-assaulted-forced-to-smoke-drink-four-suspended",
        "year": 2025
      },
      {
        "kind": "news",
        "label": "Times of India — separate anonymous complaint found false",
        "url": "https://timesofindia.indiatimes.com/city/indore/anonymous-ragging-complaint-at-mgm-found-false-after-investigation/articleshow/126128202.cms",
        "year": 2025
      },
      {
        "kind": "news",
        "label": "Medical Dialogues — family alleges ragging after first-year death",
        "url": "https://medicaldialogues.in/state-news/madhya-pradesh/mgm-indore-mbbs-student-death-family-alleges-ragging-seeks-probe-164034",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Current public discussion about MGM Indore hostel concerns — unverified",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1v5cdtu/bhai_mgmmc_indore_ki_ragging_kitni_buri_h_can_i/",
        "year": 2026
      }
    ]
  },
  "211": {
    "currentPicture": "GMC Nagpur has a current formal anti-ragging committee and unusually fresh public discussion from August 2026. The student discussion is mixed: commenters say conditions have improved, describe basic intros and occasional junior tasks such as journal writing, and suggest boys/hostellers may face more interaction. Physical-harassment claims remain disputed and unverified.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "A current public discussion describes “basic interactions” and possible journal-writing for seniors; this is anonymous and not a verified requirement.",
    "introCulture": "A 17 Aug 2026 thread describes intros as basic and concentrated in roughly the initial months, while other commenters express concern. Treat as low-confidence lived evidence.",
    "dressAppearance": "No current verified haircut/shaving/formal-dress rule was established.",
    "movementCommonAreas": "Current comments suggest hostel context matters, but no specific verified common-area ban was found.",
    "seniorJunior": "Mixed: some current commenters say conditions improved substantially; others say boys face more senior interaction. No representative survey exists.",
    "positives": "Official GMC Nagpur pages list an Anti-Ragging Committee; current public accounts include claims that conditions have improved.",
    "incidents": [],
    "officialResponse": "The official GMC Nagpur site lists an Anti-Ragging Committee among its standing committees.",
    "trend": "Low-confidence current student evidence suggests improvement compared with older reputational concerns, but contradictory comments remain.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "High for official committee · Medium-low for current student reports",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "Government Medical College Nagpur — official site / Anti-Ragging Committee menu",
        "url": "https://gmcnagpur.org/announcements",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Public current discussion — “Anyone from GMC Nagpur?” (17 Aug 2026)",
        "url": "https://www.reddit.com/r/nagpur/comments/1vqnsng/anyone_from_gmc_nagpur/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Public current discussion — “Ragging in GMC NAGPUR” (20 Aug 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1vthm7h/ragging_in_gmc_nagpur/",
        "year": 2026
      }
    ]
  },
  "248": {
    "currentPicture": "SCB Cuttack combines unusually explicit official fresher protection with a recent allegation. Its anti-ragging flying-squad page says faculty squads may make hostel rounds for up to 90 days and physically verify first-year students in their rooms. In Nov 2024, first-year students alleged ragging by final-year seniors; the college deployed security and opened a probe, while early comments from the dean cautioned that the allegation had not yet been established.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current informal intro practice could not be reconstructed confidently.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "Officially, first-year hostel rooms are actively monitored during the initial period by anti-ragging flying squads. That is an institutional safety measure, not a senior-imposed restriction.",
    "seniorJunior": "A 2024 allegation shows that senior-junior problems have been reported, but the available source did not establish a final finding.",
    "positives": "One of the strongest official fresher-monitoring systems in this research set: day-to-day faculty flying squads can inspect hostels for up to 90 days.",
    "incidents": [
      {
        "year": 2024,
        "label": "First-year MBBS ragging allegation prompted hostel probe/security response",
        "detail": "Students/parents reported targeting by final-year seniors; the anti-ragging committee investigated and security was deployed. The source described the matter as an allegation under probe, not a final finding."
      }
    ],
    "officialResponse": "SCB publishes a multi-group Anti-Ragging Flying Squad and states squads may make hostel rounds and verify first-year students for up to 90 days.",
    "trend": "Formal prevention is strong; insufficient newer student evidence to say whether the 2024 concern persisted.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "High for official prevention · High for existence of 2024 allegation · Low for current prevalence",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "SCB Medical College — Anti-Ragging Flying Squad / committee",
        "url": "https://scbmch.odisha.gov.in/en/light/subpage/various-committee",
        "year": 2026
      },
      {
        "kind": "news",
        "label": "New Indian Express — probe into alleged first-year MBBS ragging",
        "url": "https://www.newindianexpress.com/states/odisha/2024/Nov/05/scb-medical-college-initiates-probe-into-alleged-ragging-of-first-year-mbbs-student",
        "year": 2024
      }
    ]
  },
  "327": {
    "currentPicture": "Stanley Medical College publishes an Anti-Ragging Squad, but current lived-experience evidence about senior-imposed fresher rules is scarce. Older historical anti-ragging initiatives and incidents exist, but this build deliberately avoids using decade-old culture as a proxy for 2026.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "Current informal intro practice could not be reconstructed confidently.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "Current senior-junior hierarchy remains insufficiently documented for a campus-wide claim.",
    "positives": "An official Anti-Ragging Squad document identifies the dean, vice-principal, faculty and hostel wardens.",
    "incidents": [],
    "officialResponse": "Stanley publishes an Anti-Ragging Squad order/document.",
    "trend": "Current lived-experience trend unknown.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "High for official squad · Very low for current informal culture",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "official",
        "label": "Stanley Medical College — Anti-Ragging Squad",
        "url": "https://www.stanleymedicalcollege.in/templates/default/file/DOC-20230530-WA0003.pdf",
        "year": 2023
      }
    ]
  },
  "323": {
    "currentPicture": "Madras Medical College has a recent serious hostel incident with disciplinary action, but the facts were still contested/investigated. In Dec 2025, six final-year MBBS students were suspended after a junior complaint; reports said a late-night unauthorized hostel meeting occurred and a junior was asked to kneel, while the dean also stated the dispute concerned kabaddi and denied that the established facts amounted to ragging. The site therefore labels this as a suspended/probed allegation rather than a final “ragging conviction”.",
    "rulebookStatus": "No informal senior rulebook verified",
    "rulebookSummary": "No traceable senior-issued fresher booklet or rule sheet was authenticated in this research pass.",
    "groundRules": "No specific senior-imposed ground rules could be verified from sufficiently strong current evidence.",
    "introCulture": "No evidence supports treating the Dec 2025 sports/hostel episode as the normal intro culture for freshers.",
    "dressAppearance": "No current senior-imposed haircut, shaving or special fresher dress rule was verified.",
    "movementCommonAreas": "No current senior-imposed common-area restriction was verified.",
    "seniorJunior": "A serious late-night senior-junior hostel dispute produced suspensions and a high-level inquiry; campus-wide prevalence remains unknown.",
    "positives": "The college suspended the students pending inquiry and publicly stated a zero-tolerance approach.",
    "incidents": [
      {
        "year": 2025,
        "label": "Six final-year MBBS students suspended pending inquiry after junior complaint",
        "detail": "A junior alleged physical/mental harassment. A preliminary order said seniors called juniors to an unauthorized late-night hostel meeting and one student was made to kneel; the dean separately said the dispute was about kabaddi and that no ragging was involved. Investigation context is preserved."
      }
    ],
    "officialResponse": "College administration suspended six students and formed a high-level inquiry committee; police/NMC complaints were also reported.",
    "trend": "Recent serious incident warrants attention, but it is not evidence of a universal first-year rule system.",
    "unknowns": "Current batch-wide prevalence, hostel/gender differences and informal enforcement remain unknown.",
    "confidence": "High for suspension/inquiry facts · Medium for incident details · Low for campus-wide prevalence",
    "lastVerified": "21 Aug 2026",
    "artifactStatus": "No public senior-issued artifact verified",
    "artifactClaims": [],
    "sources": [
      {
        "kind": "news",
        "label": "New Indian Express — six students suspended after hostel complaint",
        "url": "https://www.newindianexpress.com/cities/chennai/2025/Dec/21/six-medical-students-suspended-for-ragging-juniors-at-hostel-in-madras-medical-college",
        "year": 2025
      },
      {
        "kind": "news",
        "label": "DT Next — six MMC students suspended, probe on",
        "url": "https://www.dtnext.in/news/chennai/six-mmc-students-suspended-over-ragging-probe-on",
        "year": 2025
      }
    ]
  }
});

Object.entries({
  "38": {
    "artifactStatus": "Public post reports an attached 24-rule image/PDF — not authenticated",
    "artifactClaims": [
      "senior-contact collection / intro messages",
      "very short haircut/head-shaving allegation",
      "formal wishing/address hierarchy",
      "reported restrictions around junior-senior interaction"
    ],
    "artifactNote": "The artifact is treated as evidence of a public allegation, not as an official or universally enforced AIIMS Patna document."
  },
  "49": {
    "artifactStatus": "Public images/posts of an alleged PMCH fresher rulebook found in 2025 and again Aug 2026 — authorship unverified",
    "artifactClaims": [
      "appearance/accessory restrictions reported in the circulated material",
      "first-year vehicle restriction discussed",
      "formal dress/behaviour expectations discussed",
      "senior-address conventions discussed"
    ],
    "artifactNote": "Recurring images strengthen evidence that a rulebook-like artifact circulated publicly; they do not establish who authored it or how much of it was enforced."
  },
  "168": {
    "artifactStatus": "Public post reproduces an alleged digital senior rule set — unverified",
    "artifactClaims": [
      "formal Sir/Ma’am address",
      "no eye contact / constrained interaction allegations",
      "messaging/reply expectations",
      "emoji/reaction restrictions",
      "reported access/behaviour controls"
    ],
    "artifactNote": "The reproduced rules are not an official AIIMS Bhopal document and final institutional adjudication was not verified."
  },
  "69": {
    "artifactStatus": "No senior-issued artifact verified; current student reports explicitly reject several stereotyped rules",
    "artifactClaims": [
      "no compulsory haircut/beard rule reported",
      "no bowing reported",
      "no mandatory social-media follow reported",
      "intros described as avoidable"
    ],
    "artifactNote": "These are student-reported counter-signals, not proof that no ragging ever occurs."
  }
}).forEach(([id, patch]) => Object.assign(JUNIOR_CULTURE[id], patch));

Object.values(JUNIOR_CULTURE).forEach(p => { if (!('artifactStatus' in p)) p.artifactStatus='No public senior-issued artifact verified in this pass'; if (!Array.isArray(p.artifactClaims)) p.artifactClaims=[]; if (!p.artifactNote) p.artifactNote='Absence of a found artifact is not evidence that one has never existed.'; });




'use strict';

// First 90 Days — structured lived-experience layer, 21 Aug 2026.
// Student posts support only the reported experience described; they do not establish prevalence.
const JUNIOR_FIRST90_META = {
  "updated": "21 Aug 2026",
  "scope": "31 Junior Culture profiles; unsupported fields remain explicitly unknown",
  "fields": [
    "firstWeeks",
    "hostellerVsDayScholar",
    "genderDifferences",
    "optOut",
    "afterFreshers"
  ],
  "rule": "Prospective questions, generic state-level claims, PG/nursing incidents and unverified similar-name artifacts do not fill MBBS first-90-day fields."
};

const JUNIOR_FIRST90 = {
  "38": {
    "evidenceLevel": "detailed",
    "evidenceLabel": "Detailed current lived-experience signal — conflicting periods within the same batch",
    "firstWeeks": "An anonymous Apr 2026 account says senior interaction began on the first day of foundation classes, with collection of seniors’ details, introduction messages and a reported 24-rule PDF. It also alleges a very short/bald haircut expectation for boys. These are public allegations, not institutional findings.",
    "hostellerVsDayScholar": "The current sources do not separate hostel and day-scholar exposure reliably.",
    "genderDifferences": "The clearest gender-specific allegation concerns boys being asked to shave their heads very closely. Current evidence for girls is not sufficiently detailed.",
    "optOut": "A Jul 2026 commenter identifying as an AIIMS Patna student said the batch collectively stopped following the rules and boycotted seniors, and that they no longer had to follow them. This is unusually useful opt-out evidence, but remains an anonymous public account.",
    "afterFreshers": "The Jul 2026 follow-up suggests the 2025 batch’s relationship with the reported rules changed substantially after the initial period; it does not establish whether every student or future batch will have the same experience.",
    "sourceNote": "Strongest current case for a documented change within one batch: an Apr allegation of structured rules followed by a Jul self-identified student report of collective refusal.",
    "sources": [
      {
        "kind": "student",
        "label": "Anonymous account — Interaction at AIIMS Patna (Apr 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1soxst2/interaction_at_aiims_patna/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Follow-up discussion — student says batch stopped following rules (Jul 2026)",
        "url": "https://www.reddit.com/r/genzmedschool/comments/1up48ur/one_of_my_aakash_senior_is_studying_in_aiims/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": true,
      "optOut": true,
      "afterFreshers": true
    }
  },
  "45": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Current but mostly second-hand first-year signal",
    "firstWeeks": "Current 2026 public discussion describes a first-year-only senior rule/dress culture, but the most specific accounts are second-hand rather than direct first-person reports.",
    "hostellerVsDayScholar": "No reliable hostel/day-scholar split was found.",
    "genderDifferences": "One Jul 2026 commenter describing a sibling’s experience said girls face less and boys somewhat more; another Aug discussion alleges stricter first-year appearance rules for girls. Both are public anecdotal claims, not verified prevalence data.",
    "optOut": "No reliable college-specific account was found describing the consequences of refusing the informal rules.",
    "afterFreshers": "A Jul 2026 second-hand account says the problem is mainly first year and that juniors are not bothered afterward. A separate dress-code discussion also frames senior rules as first-year-only. Confidence is low because these are not robust first-person accounts.",
    "sourceNote": "Useful for hypotheses about duration and gender, but not strong enough to characterize the whole college without caveats.",
    "sources": [
      {
        "kind": "student",
        "label": "Prospective PMCH/IGIMS thread with sibling-based IGIMS account (Jul 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1uzrsbs/any_future_pmch_patna_peeps_here_im_planning_to/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "PMCH & IGIMS dress-code discussion (Jun 2026)",
        "url": "https://www.reddit.com/r/MBBSindia/comments/1uhuplt/dress_code_in_pmch_igims_patna/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Public IGIMS/Bihar college discussion (Aug 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1vi2oen/why_arent_u_taking_clg_in_bihar/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": true,
      "optOut": false,
      "afterFreshers": true
    }
  },
  "49": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Current rulebook signal; enforcement and first-month experience still under-documented",
    "firstWeeks": "A public post on 20 Aug 2026 shows a rulebook described as being given to PMCH freshers, and a similar booklet claim appeared in Sep 2025. This supports a current artifact signal but does not establish when, how widely or how strictly the material is enforced.",
    "hostellerVsDayScholar": "No reliable current comparison between hostellers and day scholars was found.",
    "genderDifferences": "No reliable current gender comparison was found.",
    "optOut": "Public comments around the 2025 booklet suggest some students view many alleged rules as ignorable apart from basic courtesy, but no strong first-person 2026 account documents the consequences of refusing.",
    "afterFreshers": "No reliable current evidence establishes whether the alleged rules disappear after the freshers period or continue through first year.",
    "sourceNote": "The artifact itself is the strongest signal; lived enforcement remains a major research gap.",
    "sources": [
      {
        "kind": "student",
        "label": "Rulebook given to freshers at PMCH, Patna (Aug 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1vtkr1h/rulebook_given_to_freshers_at_pmchpatna/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "PMCH booklet confirmation thread (Sep 2025)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1n8xi7u/medicos_from_pmch_kindly_confirm_this/",
        "year": 2025
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": true,
      "afterFreshers": false
    }
  },
  "51": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "64": {
    "evidenceLevel": "official_only",
    "evidenceLabel": "First-month official protection is explicit; lived evidence remains thin",
    "firstWeeks": "AIIMS Delhi’s official hostel guidance specifically prohibits a junior from being taken into or found in a senior student’s room until the freshers’ welcome party is over, treating such a situation as ragging unless otherwise proved.",
    "hostellerVsDayScholar": "The clearest first-month evidence is an official hostel-room separation rule; no current student source quantifies day-scholar versus hosteller exposure.",
    "genderDifferences": "No reliable current gender-specific lived evidence was found.",
    "optOut": "Official anti-ragging policy provides formal protection and disciplinary mechanisms, but this research pass did not find a current first-person account describing social consequences of opting out.",
    "afterFreshers": "The official junior-in-senior-room restriction is explicitly tied to the period before the freshers’ welcome party. That does not establish what informal interaction looks like afterward.",
    "sourceNote": "This is protection-system evidence, not proof of the lived campus culture.",
    "sources": [
      {
        "kind": "official",
        "label": "AIIMS Delhi hostel FAQ — anti-ragging rules",
        "url": "https://www.aiims.edu/index.php/en/hostel_accomodation_faqs",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": true,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": true
    }
  },
  "65": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "66": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "69": {
    "evidenceLevel": "detailed",
    "evidenceLabel": "Detailed current accounts exist — and they conflict",
    "firstWeeks": "Two recent student accounts describe PDP/introduction activity as avoidable and reject stereotyped haircut, bowing and forced-intro rules. A separate May 2026 MAMC post, however, describes PDP pressure and social exclusion after refusing to conform. The correct summary is therefore not “no ragging”, but “experiences differ sharply by senior group and social circle”.",
    "hostellerVsDayScholar": "A Jul 2026 MAMC student AMA says hostellers generally face more interaction and that living in a PG away from senior-heavy areas can reduce exposure substantially.",
    "genderDifferences": "No reliable current source in this pass provides a college-wide boys-versus-girls comparison.",
    "optOut": "An Aug 2026 senior AMA says many students simply do not attend PDPs and some friends avoided them completely. The conflicting May 2026 account alleges social boycott for refusing to conform, so opting out appears possible but its social cost may vary.",
    "afterFreshers": "A Jul 2026 MAMC student says this kind of interaction is mainly a first-year issue and is not typically a major feature from second year onward. This remains a public student account, not a guarantee.",
    "sourceNote": "High-value conflict: avoidability is reported by multiple students, but at least one current account describes meaningful social coercion. The site keeps both.",
    "sources": [
      {
        "kind": "student",
        "label": "MAMC 2025-batch senior AMA — PDPs can be skipped (Aug 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1vl9ak9/senior_from_mamc_25_batch_ama/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "MAMC student AMA — hosteller/PG context and first-year duration (Jul 2026)",
        "url": "https://www.reddit.com/r/JEENEETards/comments/1uzwn2q/i_am_a_student_of_mamc_delhi_ama/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Conflicting MAMC account alleging PDP pressure and boycott (May 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1tfki4s/horrendous_college/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "MAMC no-weird-rules student post (Aug 2025)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1n4z2iw/mamc_has_no_weird_rules_for_1st_years/",
        "year": 2025
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": true,
      "genderSpecific": false,
      "optOut": true,
      "afterFreshers": true
    }
  },
  "71": {
    "evidenceLevel": "detailed",
    "evidenceLabel": "Detailed first-year account with hostel/day-scholar split",
    "firstWeeks": "A 2025 UCMS thread has two detailed student responses. One describes non-physical but sometimes odd senior interaction and says they avoided the canteen in first year as a day scholar. Another calls the PDP “tolerable”, says first-year boys are housed in a separate new boys’ hostel, and reports a clean-shaven expectation with other details communicated by seniors.",
    "hostellerVsDayScholar": "The clearest account says day scholars have lower exposure. A second day-scholar account still socialized with hostel friends/seniors but described the PDP as tolerable rather than absent. First-year boys are reported to have a separate hostel before moving to the senior hostel in second year.",
    "genderDifferences": "The strongest evidence is explicitly about boys. This pass did not find an equally detailed current account for UCMS women, so the male experience is not generalized.",
    "optOut": "Avoiding senior-heavy spaces such as the canteen reportedly reduced one day scholar’s exposure. The sources do not clearly establish what happens after a direct refusal of PDP requests.",
    "afterFreshers": "One account says seniors become friends later. The reported hostel structure also changes from a first-year-only boys’ hostel to the senior hostel in second year, but the exact point at which informal hierarchy relaxes is not quantified.",
    "sourceNote": "One of the strongest college-specific hosteller/day-scholar evidence sets in the current layer, but boys are overrepresented.",
    "sources": [
      {
        "kind": "student",
        "label": "UCMS senior/student discussion — admissions, ragging, hostel and dress (Aug 2025)",
        "url": "https://www.reddit.com/r/indianmedschool/comments/1mqy6gc/any_ucms_senior_here/",
        "year": 2025
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": true,
      "genderSpecific": true,
      "optOut": true,
      "afterFreshers": true
    }
  },
  "72": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Current lived signal suggests light hierarchy",
    "firstWeeks": "A current Aug 2026 student AMA describes the main senior convention as greeting seniors as sir/ma’am and otherwise reports limited hierarchy. This is a small sample.",
    "hostellerVsDayScholar": "No reliable current hostel/day-scholar comparison was found.",
    "genderDifferences": "No reliable current gender-specific comparison was found.",
    "optOut": "No specific evidence was found on direct refusal or social consequences.",
    "afterFreshers": "The source does not map a clear timeline beyond describing the current hierarchy as limited.",
    "sourceNote": "Reassuring current signal, but not enough detail to reconstruct the entire first 90 days.",
    "sources": [
      {
        "kind": "student",
        "label": "Public VMMC AMA (Aug 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1vjz21q/ama_related_to_vmmc/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "75": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "129": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "168": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Detailed rule-set allegation, but no 2026 lived follow-up",
    "firstWeeks": "A 2025 public complaint reproduced an alleged senior rule set controlling address, messaging, eye contact and behaviour. It is detailed enough to understand the alleged hierarchy, but not authenticated and not updated by a strong 2026 first-year follow-up.",
    "hostellerVsDayScholar": "No reliable hostel/day-scholar split was reconstructed.",
    "genderDifferences": "No reliable gender comparison was reconstructed.",
    "optOut": "No robust source describes what happened to students who refused the alleged rules.",
    "afterFreshers": "No reliable current evidence establishes when or whether the alleged rule system relaxed.",
    "sourceNote": "Strong artifact detail, weak timeline and prevalence evidence.",
    "sources": [
      {
        "kind": "student",
        "label": "Public AIIMS Bhopal rule-set allegation (2025)",
        "url": "https://www.reddit.com/r/indianmedschool/comments/1n484x3/",
        "year": 2025
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "181": {
    "evidenceLevel": "detailed",
    "evidenceLabel": "Strong current hostel/day-scholar differentiation",
    "firstWeeks": "Current Jul 2026 discussion says day scholars/PG stayers may get only one or two initial introductions, while hostel exposure is higher. An alumnus says old mandatory weekend “calls” lasting hours no longer occur in the same way, although the boys’ hostel still has some informal rules.",
    "hostellerVsDayScholar": "This is the clearest current difference found: several commenters say day-scholar exposure is low to almost nil, while hostel exposure is meaningfully higher. A self-identified long-term day scholar says day scholars are not socially boycotted and can still have hostel friends and attend hostel gatherings.",
    "genderDifferences": "The strongest current comments focus on the boys’ hostel; there is not enough equivalent evidence about women to infer a college-wide gender gap.",
    "optOut": "Choosing day-scholar/PG living is repeatedly described as reducing exposure. The evidence does not show that hostellers can simply refuse all interaction without consequence.",
    "afterFreshers": "One self-identified long-term day scholar says hostel ragging lasts less than a year, roughly 7–9 months; an alumnus says the old call system has already become much milder. Treat the duration as anecdotal rather than fixed.",
    "sourceNote": "Very useful residence-mode evidence, supported by more than one current discussion; exact severity still varies across commenters.",
    "sources": [
      {
        "kind": "student",
        "label": "MGM Indore ragging discussion — hostel vs day scholar (Jul 2026)",
        "url": "https://www.reddit.com/r/Indore/comments/1usi24e/what_is_ragging_scene_in_mgm_indore/",
        "year": 2026
      },
      {
        "kind": "student",
        "label": "Long-term day-scholar account — almost nil exposure, no social boycott (Jul/Aug 2026)",
        "url": "https://www.reddit.com/r/MBBSindia/comments/1v56ge5/bhai_mgm_indore_me_ragging_kitni_buri_hoti_h_can/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": true,
      "genderSpecific": true,
      "optOut": true,
      "afterFreshers": true
    }
  },
  "189": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "211": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Fresh current discussion with low-confidence timeline/gender details",
    "firstWeeks": "An Aug 2026 discussion describes “basic” introductions and mentions possible journal-writing for seniors, concentrated in an initial period. The commenters are anonymous and not all identify as GMC Nagpur students.",
    "hostellerVsDayScholar": "The available current discussion implies hostel and boys’ exposure may be higher, but it does not provide a strong direct day-scholar comparison.",
    "genderDifferences": "One commenter says conditions have improved and that girls do not face the same issue; another says boys face somewhat more. This remains low-confidence public testimony.",
    "optOut": "No reliable current account describes direct refusal and consequences.",
    "afterFreshers": "One commenter places the interaction in an initial phase of roughly six months. This is an anecdotal estimate, not an institutional timeline.",
    "sourceNote": "Fresh evidence, but provenance is mixed; the site labels the duration and gender claims low-confidence.",
    "sources": [
      {
        "kind": "student",
        "label": "Current GMC Nagpur senior-interaction thread (Aug 2026)",
        "url": "https://www.reddit.com/r/nagpur/comments/1vqnsng/anyone_from_gmc_nagpur/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": true,
      "genderSpecific": true,
      "optOut": false,
      "afterFreshers": true
    }
  },
  "220": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "226": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Reassuring current signal; first-90-day detail limited",
    "firstWeeks": "Recent public comments report little/no ragging at KEM, but do not reconstruct a structured first-week routine.",
    "hostellerVsDayScholar": "KEM’s first-year hostel availability is itself a practical constraint discussed publicly, but this pass did not find a reliable ragging comparison by residence mode.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No college-specific evidence found.",
    "afterFreshers": "No detailed current timeline found.",
    "sourceNote": "Useful for overall current signal, weak for exact first-90-day mechanics.",
    "sources": [
      {
        "kind": "student",
        "label": "KEM vs JJ discussion (Jul 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1uv2pn0/kem_or_jj/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "230": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "239": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Older detailed lived account suggests current culture had become very light",
    "firstWeeks": "A detailed 2024 public account says first year was academically stricter, while ragging had become almost nil after stronger administration. The author recalls only lighter regional interactions from earlier years.",
    "hostellerVsDayScholar": "No clear residence-mode difference is described in the source.",
    "genderDifferences": "No clear gender split is described.",
    "optOut": "No direct refusal scenario is described.",
    "afterFreshers": "The account says post-freshers seniors became important guides/friends, providing a positive example of the hierarchy relaxing rather than persisting. It is valuable but now two admission cycles old.",
    "sourceNote": "Good qualitative timeline, but not current enough to be treated as a 2026 guarantee.",
    "sources": [
      {
        "kind": "student",
        "label": "AIIMS Bhubaneswar lived-experience discussion (Sep 2024)",
        "url": "https://www.reddit.com/r/indianmedschool/comments/1f73hxr",
        "year": 2024
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": true
    }
  },
  "248": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "255": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "262": {
    "evidenceLevel": "official_only",
    "evidenceLabel": "First-month institutional protections are unusually detailed",
    "firstWeeks": "Official AIIMS Jodhpur material describes separate accommodation for new students, guards accompanying them to class, scheduled anti-ragging rounds and surprise checks of hostels/common areas during the fresher period.",
    "hostellerVsDayScholar": "Official measures specifically target hostel and campus movement of freshers; no current lived account compares day scholars and hostellers.",
    "genderDifferences": "No reliable current gender-specific lived evidence found.",
    "optOut": "The official framework provides monitoring/reporting rather than an informal “opt-out” account. No strong current student source describes social consequences of declining interaction.",
    "afterFreshers": "Official documents focus heavily on the admission/fresher period; current student evidence is too thin to say how quickly senior hierarchy normalizes.",
    "sourceNote": "Exceptional prevention-system detail, but still a major lived-experience gap.",
    "sources": [
      {
        "kind": "official",
        "label": "AIIMS Jodhpur annual report — fresher anti-ragging measures",
        "url": "https://www.aiimsjodhpur.edu.in/annual%20report/ENG%20-%20Annual%20Report%2023-24%20%288%29%20%281%29%20%281%29.pdf",
        "year": 2024
      },
      {
        "kind": "official",
        "label": "AIIMS Jodhpur anti-ragging notice / measures",
        "url": "https://www.aiimsjodhpur.edu.in/news/antiragging.pdf",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": true,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "288": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "323": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "327": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "360": {
    "evidenceLevel": "partial",
    "evidenceLabel": "2025 peer reports suggest college-hours appearance expectations; current enforcement unverified",
    "firstWeeks": "A 2025 Telangana-college discussion says seniors at Osmania/Gandhi generally expect formals and clean shaving during college hours, not 24/7. This is peer-reported rather than an authenticated senior rulebook.",
    "hostellerVsDayScholar": "No reliable current residence-mode comparison found.",
    "genderDifferences": "No reliable college-specific gender comparison found.",
    "optOut": "No reliable evidence found on refusal consequences.",
    "afterFreshers": "The source does not establish whether these appearance expectations are first-year-only or when they end.",
    "sourceNote": "Moderate usefulness for appearance expectations, low usefulness for severity/duration.",
    "sources": [
      {
        "kind": "student",
        "label": "Telangana colleges ragging/dress discussion (Aug 2025)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1mzqp9d",
        "year": 2025
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "372": {
    "evidenceLevel": "insufficient",
    "evidenceLabel": "Current first-90-days lived evidence insufficient",
    "firstWeeks": "No sufficiently specific 2025–26 first-year account was found in this research pass. The broader Junior Culture profile may still contain official policy or dated incident evidence.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "No reliable college-specific evidence found on what happens when a fresher declines informal senior interaction.",
    "afterFreshers": "No reliable college-specific evidence found on how the dynamic changes after the initial fresher period.",
    "sourceNote": "Absence of a detailed current account is recorded as an evidence gap, not as evidence that no ragging or hierarchy exists.",
    "sources": [],
    "coverage": {
      "firstWeeks": false,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "400": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Current accounts conflict; exact first-90-day mechanics unresolved",
    "firstWeeks": "A detailed Jun 2025 IMS-BHU AMA says the current culture was essentially limited to introductions. A Jul 2026 commenter, however, says there is a “decent amount” of ragging without describing the mechanics. The site therefore shows a conflict rather than choosing one narrative.",
    "hostellerVsDayScholar": "No reliable current comparison was found.",
    "genderDifferences": "No reliable current gender-specific comparison was found.",
    "optOut": "No robust current account was found about direct refusal and consequences.",
    "afterFreshers": "The 2025 AMA implies interactions are limited rather than a prolonged first-year system, but the 2026 conflicting comment prevents a confident timeline.",
    "sourceNote": "Strong example of why one AMA should not be converted into a campus-wide “safe” label.",
    "sources": [
      {
        "kind": "student",
        "label": "IMS-BHU AMA — “max intro” account (Jun 2025)",
        "url": "https://www.reddit.com/r/MBBSindia/comments/1llsyyj/ama_ask_me_anything_about_ims_bhu/",
        "year": 2025
      },
      {
        "kind": "student",
        "label": "Conflicting IMS-BHU culture thread (Jul 2026)",
        "url": "https://www.reddit.com/r/indianmedschool/comments/1usvziw/ims_bhu/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "402": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Current public signal suggests reduction, with recent documented precedent still relevant",
    "firstWeeks": "An Aug 2026 prospective-student thread contains a commenter saying there is “not much” ragging now and that first-years receive extra security; the same comment references the documented 2024 video-call case. The current part is second-hand and should not be treated as a first-person survey.",
    "hostellerVsDayScholar": "No reliable current direct comparison was found. The 2024 case is important because interaction occurred by video call despite physical hostel security.",
    "genderDifferences": "No reliable current gender comparison found.",
    "optOut": "No reliable current account documents refusal consequences.",
    "afterFreshers": "No detailed current duration estimate found.",
    "sourceNote": "Current reassurance is lower-confidence than the documented 2024 disciplinary evidence.",
    "sources": [
      {
        "kind": "student",
        "label": "Incoming KGMU student thread with current second-hand signal (Aug 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1vtss5c/whats_the_environment_in_kgmu/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": true,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  },
  "440": {
    "evidenceLevel": "partial",
    "evidenceLabel": "Very small current signal; details absent",
    "firstWeeks": "A Jun 2026 public discussion contains one anonymous statement that there is no ragging at IPGMER. It does not describe introductions, hierarchy or first-week routines.",
    "hostellerVsDayScholar": "Not reliably reconstructed.",
    "genderDifferences": "Not reliably reconstructed.",
    "optOut": "Not reliably reconstructed.",
    "afterFreshers": "Not reliably reconstructed.",
    "sourceNote": "Reassuring but extremely thin lived-experience evidence.",
    "sources": [
      {
        "kind": "student",
        "label": "Kolkata MBBS college discussion (Jun 2026)",
        "url": "https://www.reddit.com/r/MEDICOreTARDS/comments/1uelq3s/best_college_for_mbbs_in_kolkata/",
        "year": 2026
      }
    ],
    "coverage": {
      "firstWeeks": true,
      "residenceMode": false,
      "genderSpecific": false,
      "optOut": false,
      "afterFreshers": false
    }
  }
};




'use strict';

// Freshers Experience Timeline — phase-specific evidence layer, 21 Aug 2026.
// IMPORTANT: a phase is filled only when the existing source set supports that timing.
// Unknown phases are deliberately preserved instead of inferring a smooth narrative.
const FRESHERS_TIMELINE_META = {
  updated: '21 Aug 2026',
  scope: '31 Junior Culture profiles',
  phases: [
    { key:'arrival', label:'Joining / foundation period', short:'Joining' },
    { key:'weeks1_4', label:'Weeks 1–4', short:'Wk 1–4' },
    { key:'months2_3', label:'Months 2–3', short:'Mo 2–3' },
    { key:'freshers', label:'Freshers / formal welcome', short:'Freshers' },
    { key:'restFirstYear', label:'Rest of first year', short:'Rest Y1' },
    { key:'secondYear', label:'Second year', short:'Year 2' }
  ],
  evidenceGrades: {
    A: 'Strong phase-specific evidence: official/verified material or comparably strong documentation. This may describe protection systems rather than lived prevalence.',
    B: 'Moderate phase-specific evidence: detailed current first-hand account or multiple/corroborating contemporary signals.',
    C: 'Limited phase-specific evidence: isolated/second-hand/older account or timing that is only partly specified.',
    D: 'Lead only: ambiguous or unverified material that should not be published as a college fact.',
    GAP: 'No phase-specific evidence currently supports a claim.'
  },
  rule: 'Never move a general first-year claim into a specific month/week unless a source or already-reviewed structured field supports that timing.'
};

const FRESHERS_TIMELINE = {
  '38': { // AIIMS Patna
    phases: {
      arrival:{grade:'B',basis:'student',status:'reported',summary:'A detailed Apr 2026 anonymous account says senior interaction began on the first day of foundation classes, with collection of seniors’ details, introduction messages and a reported 24-rule PDF. It also alleges a very short/bald haircut expectation for boys.'},
      restFirstYear:{grade:'B',basis:'student',status:'changed',summary:'A Jul 2026 commenter identifying as an AIIMS Patna student said the batch had collectively stopped following the reported rules and boycotted seniors. This supports a change within the same batch, not a guarantee for future batches.'}
    }
  },
  '45': { // IGIMS
    phases: {
      weeks1_4:{grade:'C',basis:'student / second-hand',status:'reported',summary:'Current 2026 discussion describes an early first-year senior rule/dress culture, but the clearest details are second-hand and the exact week-by-week timing is not established.'},
      secondYear:{grade:'C',basis:'student / second-hand',status:'reported',summary:'A Jul 2026 second-hand account says the problem is mainly first year and juniors are not bothered afterward. Confidence is limited.'}
    }
  },
  '49': { // PMCH
    phases: {
      weeks1_4:{grade:'B',basis:'public artifact',status:'artifact',summary:'A public post on 20 Aug 2026 shows a rulebook described as being given to PMCH freshers, with a similar booklet claim in Sep 2025. The artifact signal is current; timing, authorship, reach and enforcement remain unverified.'}
    }
  },
  '64': { // AIIMS Delhi
    phases: {
      arrival:{grade:'A',basis:'official policy',status:'official',summary:'Official hostel guidance prohibits a junior from being taken into or found in a senior student’s room until the freshers’ welcome party is over, treating such a situation as ragging unless otherwise proved.'},
      freshers:{grade:'A',basis:'official policy',status:'official',summary:'The official junior-in-senior-room restriction is explicitly tied to the period before the freshers’ welcome party. This establishes a protection boundary, not the informal culture after the event.'}
    }
  },
  '69': { // MAMC
    phases: {
      weeks1_4:{grade:'B',basis:'multiple current student reports',status:'conflicting',summary:'Recent accounts conflict: some describe PDP/introduction activity as avoidable and reject stereotyped haircut/bowing rules, while another May 2026 account describes PDP pressure and social exclusion after refusing to conform.'},
      secondYear:{grade:'B',basis:'student',status:'reported',summary:'A Jul 2026 MAMC student says this kind of interaction is mainly a first-year issue and is not typically a major feature from second year onward.'}
    }
  },
  '71': { // UCMS
    phases: {
      weeks1_4:{grade:'B',basis:'multiple student reports',status:'reported',summary:'Detailed 2025 accounts describe non-physical but sometimes odd senior interaction, a “tolerable” PDP, a reported clean-shaven expectation, and lower exposure for at least one day scholar.'},
      secondYear:{grade:'B',basis:'student',status:'reported',summary:'One account says seniors become friends later; another reports that first-year boys move from a separate first-year hostel to the senior hostel in second year. The exact point at which hierarchy relaxes is not quantified.'}
    }
  },
  '72': { // VMMC
    phases: {
      weeks1_4:{grade:'B',basis:'current student',status:'reported',summary:'An Aug 2026 student AMA describes the main senior convention as greeting seniors as sir/ma’am and otherwise reports limited hierarchy. The sample is small.'}
    }
  },
  '168': { // AIIMS Bhopal
    phases: {
      weeks1_4:{grade:'C',basis:'public rule-set allegation',status:'reported',summary:'A 2025 public complaint reproduced an alleged senior rule set controlling address, messaging, eye contact and behaviour. It is detailed but unauthenticated, and no strong 2026 first-year follow-up was found.'}
    }
  },
  '181': { // MGM Indore
    phases: {
      weeks1_4:{grade:'B',basis:'current student/alumnus reports',status:'reported',summary:'Current Jul 2026 discussion says day scholars/PG stayers may get only one or two initial introductions, while hostel exposure is higher; an alumnus says old mandatory weekend “calls” no longer occur in the same way.'},
      restFirstYear:{grade:'C',basis:'student / alumnus',status:'reported',summary:'One long-term day scholar says hostel ragging lasts less than a year, roughly 7–9 months. Treat this as an anecdotal duration estimate, not a fixed college timeline.'}
    }
  },
  '211': { // GMC Nagpur
    phases: {
      weeks1_4:{grade:'C',basis:'anonymous discussion',status:'reported',summary:'An Aug 2026 discussion describes “basic” introductions and possible journal-writing for seniors concentrated in an initial period. Not all commenters identify as GMC Nagpur students.'},
      restFirstYear:{grade:'C',basis:'anonymous discussion',status:'reported',summary:'One commenter places the interaction in an initial phase of roughly six months. This is an anecdotal estimate.'}
    }
  },
  '226': { // KEM
    phases: {
      weeks1_4:{grade:'C',basis:'recent public comments',status:'thin',summary:'Recent public comments report little/no ragging at KEM but do not reconstruct a structured first-week routine. This is a reassuring but thin signal.'}
    }
  },
  '239': { // AIIMS Bhubaneswar
    phases: {
      weeks1_4:{grade:'C',basis:'2024 detailed public account',status:'reported',summary:'A detailed 2024 account says first year was academically stricter while ragging had become almost nil after stronger administration. It recalls only lighter regional interactions from earlier years.'},
      freshers:{grade:'C',basis:'2024 detailed public account',status:'changed',summary:'The same account says post-freshers seniors became important guides/friends, suggesting a relaxation of hierarchy rather than persistence. It is now two admission cycles old.'}
    }
  },
  '262': { // AIIMS Jodhpur
    phases: {
      arrival:{grade:'A',basis:'official prevention framework',status:'official',summary:'Official material describes separate accommodation for new students, guards accompanying them to class, scheduled anti-ragging rounds and surprise checks of hostels/common areas during the fresher period.'}
    }
  },
  '360': { // Osmania
    phases: {
      weeks1_4:{grade:'C',basis:'peer-reported',status:'reported',summary:'A 2025 Telangana-college discussion says seniors at Osmania/Gandhi generally expect formals and clean shaving during college hours, not 24/7. It does not establish how long this lasts.'}
    }
  },
  '400': { // IMS BHU
    phases: {
      weeks1_4:{grade:'B',basis:'conflicting student reports',status:'conflicting',summary:'A detailed Jun 2025 AMA says the culture was essentially limited to introductions, while a Jul 2026 commenter says there is a “decent amount” of ragging without describing the mechanics. The conflict is preserved.'}
    }
  },
  '402': { // KGMU
    phases: {
      weeks1_4:{grade:'C',basis:'current second-hand report + documented precedent',status:'reported',summary:'An Aug 2026 discussion says there is “not much” ragging now and that first-years receive extra security; the current claim is second-hand and sits alongside the documented 2024 video-call case.'}
    }
  },
  '440': { // IPGMER
    phases: {
      weeks1_4:{grade:'C',basis:'single anonymous comment',status:'thin',summary:'A Jun 2026 discussion contains one anonymous statement that there is no ragging at IPGMER. It does not describe introductions, hierarchy or first-week routines.'}
    }
  }
};

function freshersTimelineFor(collegeId){
  const id=String(collegeId);
  const base=FRESHERS_TIMELINE[id] || {phases:{}};
  return FRESHERS_TIMELINE_META.phases.map(p=>({
    ...p,
    ...(base.phases[p.key] || {grade:'GAP',basis:'none',status:'unknown',summary:'No phase-specific evidence has been reconstructed for this period.'})
  }));
}




'use strict';

const EVIDENCE_INBOX_META = {
  updated: '21 Aug 2026',
  storageKey: 'merit-register-evidence-inbox-v1',
  statuses: ['incoming','corroborated','published','ambiguous','rejected'],
  grades: ['A','B','C','D','Ungraded'],
  types: ['source_lead','research_gap','artifact','student_account','official','news_disciplinary'],
  rule: 'Inbox state is browser-local until exported. A lead does not become a published college claim without review.'
};

const EVIDENCE_INBOX_SEED = [
  {
    id:'lead-abvims-rml-ambiguous', collegeId:65, type:'source_lead', status:'ambiguous', grade:'D', batchYear:'unknown', phase:'unknown',
    title:'Viral “RML rules” list — provenance conflict', sourceType:'anonymous public post', firstHand:'unknown', artifact:'yes',
    sourceUrl:'https://www.reddit.com/r/MEDICOreTARDS/comments/1685gf9/',
    claim:'A viral multi-rule senior list is sometimes referred to online as “RML rules”, but the 2023 source did not identify a college and similar lists are associated elsewhere with Dr RMLIMS Lucknow.',
    reviewerNote:'Keep quarantined. Do not attribute to ABVIMS/Dr RML Hospital Delhi without provenance tying the artifact to this institution.', createdAt:'2026-08-21'
  },
  {
    id:'gap-aiims-delhi-lived-2026', collegeId:64, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Find current AIIMS Delhi first-year lived account', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'Official first-month protection is documented, but current 2025–26 first-person evidence about actual junior-senior interaction remains thin.',
    reviewerNote:'Prioritize hosteller/day-scholar exposure, opt-out consequences and what changes after the welcome/freshers period.', createdAt:'2026-08-21'
  },
  {
    id:'gap-aiims-jodhpur-lived-2026', collegeId:262, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Complement AIIMS Jodhpur official protections with lived evidence', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'Official anti-ragging protections during the fresher period are unusually detailed; current first-person evidence about actual senior hierarchy is still thin.',
    reviewerNote:'Look for 2025/2026 MBBS first-year accounts, especially hostel exposure and the point at which escorts/separation end.', createdAt:'2026-08-21'
  },
  {
    id:'gap-pmch-enforcement', collegeId:49, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Verify PMCH rulebook enforcement in the 2026 batch', sourceType:'research task', firstHand:'target', artifact:'yes', sourceUrl:'',
    claim:'A current rulebook-like artifact is publicly traceable, but who issued it, how widely it circulated and how strictly it is enforced remain unresolved.',
    reviewerNote:'Seek first-person hosteller/day-scholar accounts and specific evidence about refusing or ignoring the rules.', createdAt:'2026-08-21'
  },
  {
    id:'gap-aiims-patna-residence', collegeId:38, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'AIIMS Patna hosteller vs day-scholar exposure', sourceType:'research task', firstHand:'target', artifact:'yes', sourceUrl:'',
    claim:'The current account is detailed about rules and later collective refusal but does not reliably separate hostel and day-scholar exposure.',
    reviewerNote:'Look for independent corroboration and whether the reported 24-rule system persisted into the incoming 2026 batch.', createdAt:'2026-08-21'
  },
  {
    id:'gap-mamc-gender', collegeId:69, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Resolve MAMC gender-specific experience gap', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'Current accounts conflict on PDP pressure and opt-out experience; reliable gender-specific evidence is still missing.',
    reviewerNote:'Do not generalize boys-hostel accounts to women students without direct evidence.', createdAt:'2026-08-21'
  },
  {
    id:'gap-bsa-first90', collegeId:66, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Build first lived-experience profile for BSA Delhi', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'Official material exists, but first weeks, residence mode, gender differences, opt-out experience and later-year change are all still un-reconstructed.',
    reviewerNote:'High-value Delhi comparison gap.', createdAt:'2026-08-21'
  },
  {
    id:'gap-aiims-rishikesh-first90', collegeId:372, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Find current AIIMS Rishikesh MBBS first-year accounts', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'The Junior Culture profile lacks sufficiently specific current first-90-day lived evidence.',
    reviewerNote:'Prioritize first-month hostel practices, senior addressing conventions, freedom to opt out and whether things change after freshers.', createdAt:'2026-08-21'
  },
  {
    id:'gap-jipmer-first90', collegeId:255, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Find current JIPMER Puducherry first-year culture evidence', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'Current structured lived evidence about first-year senior-junior culture is insufficient.',
    reviewerNote:'Separate official anti-ragging systems from actual lived hierarchy; seek hostel/day-scholar differences if any.', createdAt:'2026-08-21'
  },
  {
    id:'gap-grant-current-lived', collegeId:220, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Update Grant/JJ after the 2024 disciplinary case', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'A dated 2024 disciplinary case is documented, but routine 2026 first-year lived experience remains thin.',
    reviewerNote:'Avoid treating a past incident as a permanent description of current culture.', createdAt:'2026-08-21'
  },
  {
    id:'gap-kgmu-current-duration', collegeId:402, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'restFirstYear',
    title:'Reconstruct KGMU duration and post-freshers change', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'Current second-hand reports suggest reduced ragging, but no detailed current duration estimate or opt-out account has been found.',
    reviewerNote:'Look for first-person 2026 hosteller accounts and whether current extra-security arrangements change after the opening months.', createdAt:'2026-08-21'
  },
  {
    id:'gap-imsbhu-conflict', collegeId:400, type:'research_gap', status:'incoming', grade:'Ungraded', batchYear:'2026', phase:'weeks1_4',
    title:'Resolve conflicting IMS-BHU 2025 vs 2026 accounts', sourceType:'research task', firstHand:'target', artifact:'no', sourceUrl:'',
    claim:'A detailed 2025 account describes mainly introductions, while a 2026 commenter reports a “decent amount” of ragging without mechanics.',
    reviewerNote:'Seek independent current first-person accounts before changing the profile narrative.', createdAt:'2026-08-21'
  }
];




'use strict';
const $i=s=>document.querySelector(s);
const escI=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const INBOX_KEY=(typeof EVIDENCE_INBOX_META!=='undefined'&&EVIDENCE_INBOX_META.storageKey)||'merit-register-evidence-inbox-v1';
function cloneSeed(){return JSON.parse(JSON.stringify(typeof EVIDENCE_INBOX_SEED!=='undefined'?EVIDENCE_INBOX_SEED:[]));}
function loadInbox(){try{const raw=localStorage.getItem(INBOX_KEY);const v=raw?JSON.parse(raw):null;return Array.isArray(v)?v:cloneSeed();}catch(e){return cloneSeed();}}
function saveInbox(rows){try{localStorage.setItem(INBOX_KEY,JSON.stringify(rows));}catch(e){} window.dispatchEvent(new CustomEvent('evidenceinboxchange',{detail:rows}));}
let inboxRows=[];
function collegeMapI(){return new Map((typeof ALL_COLLEGES!=='undefined'?ALL_COLLEGES:[]).map(c=>[String(c.id),c]));}
function phaseLabel(k){const p=(typeof FRESHERS_TIMELINE_META!=='undefined'?FRESHERS_TIMELINE_META.phases:[]).find(x=>x.key===k);return p?p.label:(k==='unknown'?'Not phase-specific':k||'Unknown');}
function statusLabel(v){return ({incoming:'Incoming',corroborated:'Corroborated',published:'Published',ambiguous:'Ambiguous',rejected:'Rejected'})[v]||v;}
function typeLabel(v){return String(v||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());}
function statsI(){const c={};for(const r of inboxRows)c[r.status]=(c[r.status]||0)+1;const vals=[[inboxRows.length,'total items'],[c.incoming||0,'incoming'],[c.corroborated||0,'corroborated'],[c.published||0,'published'],[c.ambiguous||0,'quarantined']];$i('#inbox-stats').innerHTML=vals.map(([n,l])=>`<div class="inbox-stat"><div class="n">${n}</div><div class="l">${escI(l)}</div></div>`).join('');}
function rowCard(r,map){const c=map.get(String(r.collegeId));const src=r.sourceUrl?`<a class="inbox-source-link" href="${escI(r.sourceUrl)}" target="_blank" rel="noopener">Open source →</a>`:'';return `<article class="inbox-card" data-id="${escI(r.id)}" data-status="${escI(r.status)}"><div class="inbox-card-head"><div class="inbox-card-top"><div class="inbox-badges"><span class="inbox-badge status-${escI(r.status)}">${escI(statusLabel(r.status))}</span><span class="inbox-badge">${escI(typeLabel(r.type))}</span><span class="inbox-badge grade grade-${escI(r.grade)}">${escI(r.grade||'Ungraded')}</span></div><span class="inbox-card-meta">${escI(r.createdAt||'')}</span></div><h3><a href="college.html?id=${escI(r.collegeId)}">${escI(c?.name||`College ${r.collegeId}`)}</a></h3><div class="inbox-card-meta">${escI(r.title)} · ${escI(phaseLabel(r.phase))}${r.batchYear?` · ${escI(r.batchYear)}`:''}</div></div><div class="inbox-card-body"><div class="inbox-field"><strong>Claim / research question</strong><p>${escI(r.claim)}</p>${src}</div><div class="inbox-field"><strong>Provenance</strong><p>${escI(r.sourceType||'Not recorded')} · first-hand: ${escI(r.firstHand||'unknown')} · artifact: ${escI(r.artifact||'unknown')}</p></div><div class="inbox-field"><strong>Reviewer note</strong><p>${escI(r.reviewerNote||'No reviewer note yet.')}</p></div><div class="inbox-review"><div class="inbox-review-grid"><label>Status<select data-field="status">${['incoming','corroborated','published','ambiguous','rejected'].map(x=>`<option value="${x}"${r.status===x?' selected':''}>${statusLabel(x)}</option>`).join('')}</select></label><label>Evidence grade<select data-field="grade">${['Ungraded','A','B','C','D'].map(x=>`<option${r.grade===x?' selected':''}>${x}</option>`).join('')}</select></label></div><textarea data-field="reviewerNote" aria-label="Reviewer note">${escI(r.reviewerNote||'')}</textarea><div class="inbox-review-actions"><button type="button" data-action="save">Save review</button><button type="button" data-action="corroborate">Corroborate</button><button type="button" data-action="publish">Publish status</button><button type="button" data-action="ambiguous">Quarantine</button><button type="button" data-action="reject">Reject</button></div></div></div></article>`;}
function filteredRows(){const q=$i('#inbox-search').value.trim().toLowerCase(),st=$i('#inbox-status').value,tp=$i('#inbox-type').value,gr=$i('#inbox-grade').value,map=collegeMapI();return inboxRows.filter(r=>{if(st!=='all'&&r.status!==st)return false;if(tp!=='all'&&r.type!==tp)return false;if(gr!=='all'&&r.grade!==gr)return false;if(q){const c=map.get(String(r.collegeId));const h=`${c?.name||''} ${c?.city||''} ${c?.state||''} ${r.title||''} ${r.claim||''} ${r.reviewerNote||''}`.toLowerCase();if(!h.includes(q))return false;}return true;});}
function renderI(){statsI();const map=collegeMapI(),rows=filteredRows();$i('#inbox-count').textContent=`Showing ${rows.length} of ${inboxRows.length} inbox items`;$i('#inbox-grid').innerHTML=rows.length?rows.map(r=>rowCard(r,map)).join(''):'<div class="inbox-empty">No evidence items match these filters.</div>';}
function updateFromCard(card,action){const id=card.dataset.id,idx=inboxRows.findIndex(x=>x.id===id);if(idx<0)return;const r=inboxRows[idx];const status=card.querySelector('[data-field="status"]').value,grade=card.querySelector('[data-field="grade"]').value,note=card.querySelector('[data-field="reviewerNote"]').value.trim();r.status=action==='corroborate'?'corroborated':action==='publish'?'published':action==='ambiguous'?'ambiguous':action==='reject'?'rejected':status;r.grade=grade;r.reviewerNote=note;r.reviewedAt=new Date().toISOString();saveInbox(inboxRows);renderI();}
function addItem(form){const fd=new FormData(form),now=new Date();const title=String(fd.get('title')||'').trim();const claim=String(fd.get('claim')||'').trim();if(!title||!claim)return;const row={id:`manual-${now.getTime()}`,collegeId:Number(fd.get('collegeId')),type:String(fd.get('type')),status:'incoming',grade:String(fd.get('grade')||'Ungraded'),batchYear:String(fd.get('batchYear')||'').trim()||'unknown',phase:String(fd.get('phase')||'unknown'),title,sourceType:String(fd.get('sourceType')||'').trim()||'not recorded',firstHand:String(fd.get('firstHand')||'unknown'),artifact:String(fd.get('artifact')||'unknown'),sourceUrl:String(fd.get('sourceUrl')||'').trim(),claim,reviewerNote:String(fd.get('reviewerNote')||'').trim(),createdAt:now.toISOString().slice(0,10)};inboxRows.unshift(row);saveInbox(inboxRows);form.reset();$i('#inbox-add-panel').hidden=true;renderI();}
function exportInbox(){const payload={meta:{exportedAt:new Date().toISOString(),schema:'evidence-inbox-v1',warning:'Browser-local research workflow export; status does not independently verify claims.'},items:inboxRows};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`merit-register-evidence-inbox-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('DOMContentLoaded',()=>{initTheme();inboxRows=loadInbox();const map=collegeMapI(),profileIds=new Set(typeof JUNIOR_CULTURE!=='undefined'?Object.keys(JUNIOR_CULTURE):[]);$i('#inbox-college').innerHTML=[...profileIds].map(id=>map.get(id)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${c.id}">${escI(c.name)}</option>`).join('');const types=[...new Set([...(EVIDENCE_INBOX_META?.types||[]),...inboxRows.map(x=>x.type)])];$i('#inbox-type').innerHTML='<option value="all">All types</option>'+types.map(x=>`<option value="${escI(x)}">${escI(typeLabel(x))}</option>`).join('');['inbox-search','inbox-status','inbox-type','inbox-grade'].forEach(id=>$i('#'+id).addEventListener(id==='inbox-search'?'input':'change',renderI));$i('#inbox-add-toggle').addEventListener('click',()=>{$i('#inbox-add-panel').hidden=!$i('#inbox-add-panel').hidden;});$i('#inbox-add-cancel').addEventListener('click',()=>{$i('#inbox-add-panel').hidden=true;});$i('#inbox-add-form').addEventListener('submit',e=>{e.preventDefault();addItem(e.currentTarget);});$i('#inbox-export').addEventListener('click',exportInbox);$i('#inbox-reset').addEventListener('click',()=>{if(confirm('Reset the browser-local inbox to the project seed? Manual review changes will be removed.')){inboxRows=cloneSeed();saveInbox(inboxRows);renderI();}});$i('#inbox-grid').addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const card=b.closest('.inbox-card');if(card)updateFromCard(card,b.dataset.action);});renderI();});

