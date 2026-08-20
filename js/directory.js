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

function init(){
  loadCompareSelection();
  const trayClear=document.getElementById('compare-tray-clear');if(trayClear)trayClear.addEventListener('click',clearCompareSelection);
  renderCompareTray();
  const totalSeats = ALL_COLLEGES.reduce((sum, c) => sum + Number(c.seats || 0), 0);
  const totalSeatsEl = document.getElementById('total-seats');
  if (totalSeatsEl) totalSeatsEl.textContent = totalSeats.toLocaleString('en-IN');
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
  document.getElementById('load-more').addEventListener('click', ()=>{visibleCount+=50; renderList();});
  initPredictorControls();
  document.getElementById('check-btn').addEventListener('click', runChecker);
  document.getElementById('air-input').addEventListener('keydown', e=>{ if(e.key==='Enter') runChecker(); });
  document.getElementById('modal-overlay').addEventListener('click', e=>{
    if(e.target.id==='modal-overlay') closeModal();
  });
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
    const searchable = [c.name, formatCollegeName(c.name), c.city, c.state, c.type].join(' ').toLowerCase();
    if(q && !searchable.includes(q)) return false;
    return true;
  });
  const sort = document.getElementById('sort-select').value;
  if(sort==='seats-desc') list.sort((a,b)=>b.seats-a.seats);
  else if(sort==='estd-asc') list.sort((a,b)=>a.established-b.established);
  else if(sort==='estd-desc') list.sort((a,b)=>b.established-a.established);
  else if(sort==='cutoff-first') list.sort((a,b)=>(CUTOFFS[b.id]?1:0)-(CUTOFFS[a.id]?1:0));
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
    const cutoff = CUTOFFS[c.id];
    row.innerHTML = `
      <button class="star-btn ${starred?'active':''}" data-id="${c.id}" title="Shortlist">${starred?'&#9733;':'&#9734;'}</button>
      <div class="row-main">
        <div class="name">${escapeHtml(formatCollegeName(c.name))}</div>
        <div class="row-subline">
          <div class="loc">${escapeHtml(c.city)}, ${escapeHtml(c.state)} &middot; Est. ${c.established}${c.established===2026 ? ' &middot; <span class="new-2026-tag">NEW 2026</span>' : ''}${HOSTELS[c.id]&&hasHostelData(HOSTELS[c.id]) ? ' <span class="hostel-data-tag">HOSTEL PROFILE</span>' : ''}</div>
          <button class="compare-mini-btn ${compareSelection.includes(c.id)?'is-active':''}" data-compare-id="${c.id}" type="button">${compareSelection.includes(c.id)?'✓ Compare':'+ Compare'}</button>
        </div>
      </div>
      <span class="type-badge ${c.type}">${c.type}</span>
      <span class="seats-col">${c.seats}</span>
      <span class="cutoff-col ${cutoff?'has-data':''}">${cutoffLabel(cutoff)}</span>
    `;
    row.querySelector('.star-btn').addEventListener('click', (e)=>{ e.stopPropagation(); toggleShortlist(c.id); });
    const compareBtn=row.querySelector('[data-compare-id]');
    if(compareBtn) compareBtn.addEventListener('click',(e)=>{e.stopPropagation();toggleCompareSelection(c.id);});
    row.addEventListener('click', ()=>openModal(c.id));
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
  // automatically prefers it. A Round-1-only 2026 object is valid; R2/R3
  // simply remain unavailable until added.
  if(typeof AIQ_CUTOFFS_2026 !== 'undefined' && AIQ_CUTOFFS_2026 && Object.keys(AIQ_CUTOFFS_2026).length){
    return {year:2026, data:AIQ_CUTOFFS_2026, label:'MCC AIQ 2026'};
  }
  return {year:2025, data:CUTOFFS, label:'MCC AIQ 2025'};
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
  if(note) note.textContent=`${dataset.label} historical reference`;
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


function renderTopMatches(eligible, air){
  const top=eligible.slice(0,8);
  const body=top.map((e,i)=>{
    const best=e.best;
    return `<div class="top-match-row">
      <span class="top-match-index">${i+1}</span>
      <button class="top-match-open" type="button" data-open-college="${e.college.id}">
        <span class="top-match-name">${escapeHtml(formatCollegeName(e.college.name))}</span>
        <span class="top-match-loc">${escapeHtml(e.college.city)}, ${escapeHtml(e.college.state)}</span>
      </button>
      <span class="top-match-side">
        <span class="reach-status ${e.reachClass.className}">${escapeHtml(e.reachClass.label)}</span>
        <span class="top-match-round">${escapeHtml(best.basisRound)} ${Number(best.closing).toLocaleString('en-IN')}</span>
      </span>
      <button class="compare-mini-btn ${compareSelection.includes(e.college.id)?'is-active':''}" type="button" data-compare-id="${e.college.id}">${compareSelection.includes(e.college.id)?'✓ Compare':'+ Compare'}</button>
    </div>`;
  }).join('');
  return `<div class="top-matches">
    <div class="top-matches-head">
      <div><div class="top-matches-title">Top matches</div><div class="top-matches-sub">Best reachable colleges, ranked by verified historical R1 demand.</div></div>
    </div>
    ${body}
  </div>`;
}

function renderFullPredictorResults(eligible, air){
  return eligible.map(e=>{
    const best=e.best;
    const margin=Number(best.closing)-air;
    return `
    <div class="result-row" data-college-id="${e.college.id}">
      <div class="result-main">
        <button class="result-name" type="button" data-open-college="${e.college.id}">${escapeHtml(formatCollegeName(e.college.name))}</button>
        <div class="result-loc">${escapeHtml(e.college.city)}, ${escapeHtml(e.college.state)}</div>
        <div class="route-stack"><div class="route-line best">Earliest: ${escapeHtml(best.basisRound)} · historical cutoff ${Number(best.closing).toLocaleString('en-IN')} · ${escapeHtml(formatRankMargin(margin))}</div></div>
      </div>
      <div class="result-side">
        <span class="reach-status ${e.reachClass.className}">${escapeHtml(e.reachClass.label)}</span>
        <div class="result-cutoff"><div class="result-rank">${escapeHtml(best.basisRound)} ${Number(best.closing).toLocaleString('en-IN')}</div></div>
        <button class="compare-mini-btn ${compareSelection.includes(e.college.id)?'is-active':''}" type="button" data-compare-id="${e.college.id}">${compareSelection.includes(e.college.id)?'✓ Compare':'+ Compare'}</button>
      </div>
    </div>`;
  }).join('');
}

function runChecker(){
  const air=parseInt(document.getElementById('air-input').value,10);
  const aiqCategory=document.getElementById('category-select').value;
  const resultsEl=document.getElementById('checker-results');
  const dataset=getActiveAiqPredictorDataset();
  const stateFilter=(document.getElementById('predictor-filter-state')||{}).value||'';
  const typeFilter=(document.getElementById('predictor-filter-type')||{}).value||'';
  const statusFilter=(document.getElementById('predictor-filter-status')||{}).value||'';
  const sortMode=(document.getElementById('predictor-sort')||{}).value||'demand';

  if(!air || air<1){
    resultsEl.innerHTML='<p class="empty-note">Enter a valid AIR to check.</p>';
    return;
  }

  let eligible=[];
  Object.keys(dataset.data).forEach(id=>{
    const college=ALL_COLLEGES.find(c=>c.id===Number(id));
    if(!college) return;
    const cutoff=dataset.data[id];
    const reach=earliestAiqReach(cutoff,aiqCategory,air);
    if(!reach) return;
    const best={...reach,routeKey:'AIQ',quotaLabel:'MCC / AIQ',demandSortRank:aiqDemandSortRank(cutoff,aiqCategory)};
    const reachClass=classifyHistoricalReach(best,air);
    eligible.push({college,routes:[best],best,reachClass,demandSortRank:best.demandSortRank});
  });

  // Apply presentation filters after eligibility is calculated, so filters never alter cutoff logic.
  eligible=eligible.filter(e=>(!stateFilter||e.college.state===stateFilter) && (!typeFilter||e.college.type===typeFilter) && (!statusFilter||e.reachClass.label===statusFilter));

  const roundScore=e=>routeRoundPriority(e.best);
  const safetyScore=e=>({Safe:0,Competitive:1,Reach:2}[e.reachClass.label]??9);
  eligible.sort((a,b)=>{
    if(sortMode==='safety'){
      const s=safetyScore(a)-safetyScore(b); if(s) return s;
      const d=a.demandSortRank-b.demandSortRank; if(Number.isFinite(d)&&d!==0) return d;
    } else if(sortMode==='round'){
      const r=roundScore(a)-roundScore(b); if(r) return r;
      const d=a.demandSortRank-b.demandSortRank; if(Number.isFinite(d)&&d!==0) return d;
    } else if(sortMode==='name'){
      return a.college.name.localeCompare(b.college.name);
    } else {
      const d=a.demandSortRank-b.demandSortRank;
      if(Number.isFinite(d)&&d!==0) return d;
      if(Number.isFinite(a.demandSortRank)&&!Number.isFinite(b.demandSortRank)) return -1;
      if(!Number.isFinite(a.demandSortRank)&&Number.isFinite(b.demandSortRank)) return 1;
    }
    return a.college.name.localeCompare(b.college.name);
  });

  if(!eligible.length){
    resultsEl.innerHTML=`<p class="empty-note">No college in the loaded ${escapeHtml(dataset.label)} data matches AIR ${air.toLocaleString('en-IN')}, ${escapeHtml(aiqCategory)}, and the current filters.</p>`;
    return;
  }

  const sortLabel={demand:'R1 demand',safety:'safety',round:'earliest qualifying round',name:'college name'}[sortMode]||'R1 demand';
  const allId='predictor-all-results';
  const toggleId='predictor-show-all';
  resultsEl.innerHTML=
    `<div class="simple-results-head">
      <div class="simple-results-title">${eligible.length} reachable college${eligible.length===1?'':'s'} for AIR ${air.toLocaleString('en-IN')}</div>
      <div class="simple-results-sub">${escapeHtml(dataset.label)} · ${escapeHtml(aiqCategory)}${sortMode!=='demand'?' · sorted by '+escapeHtml(sortLabel):''}</div>
    </div>`+
    renderTopMatches(eligible,air)+
    (eligible.length>8 ? `<button class="show-all-colleges" id="${toggleId}" type="button" aria-expanded="false">Show all ${eligible.length} reachable colleges</button>` : '')+
    `<div class="all-predictor-results ${eligible.length>8?'is-collapsed':''}" id="${allId}">${renderFullPredictorResults(eligible,air)}</div>`;

  const toggle=document.getElementById(toggleId);
  const allResults=document.getElementById(allId);
  if(toggle && allResults){
    toggle.addEventListener('click',()=>{
      const collapsed=allResults.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.textContent=collapsed ? `Show all ${eligible.length} reachable colleges` : 'Hide full list';
    });
  }

  resultsEl.querySelectorAll('[data-open-college]').forEach(btn=>{
    btn.addEventListener('click',()=>openModal(Number(btn.dataset.openCollege)));
  });
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
  ].filter(([,v])=>v!==null && v!==undefined && v!=='' && Number.isFinite(Number(v)));

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
  ].filter(([,v])=>v!==null && v!==undefined && v!=='');
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
       <h4>MCC / AIQ cutoff</h4>
       <div id="aiq-cutoff-panel">${renderAiqCategorySelector(cutoff, cutoff && cutoff.category_rounds ? 'General' : (cutoff && cutoff.categories_final_round ? Object.keys(cutoff.categories_final_round)[0] : 'General'))}</div>
     </div>



     ${renderAimsMedianTrend(id)}
     ${renderBiharGmcMedianTrend(id)}


     ${renderHostelSection(id)}

     <div class="msection">
       <h4>Ragging</h4>
       <div class="safety-note">No verified official incident data is included for any college in this build &mdash; unverified claims aren't published here. For any concern, the National Anti-Ragging Helpline is 24&times;7 toll-free: <strong>1800-180-5522</strong> / helpline@antiragging.in.</div>
     </div>

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
