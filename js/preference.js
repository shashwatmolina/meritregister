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
  const loaded=has2026CutoffData();
  el.innerHTML=`<div class="pref-candidate-card is-set"><div><strong>AIR ${formatIndianRank(p.air)} · ${escapeHtml(CATEGORY_LABELS[p.category])}</strong><span>${loaded?'Using imported 2026 MCC data where available; later rounds stay pending.':'2026 provisional result is published but not yet imported. Reach labels below are explicitly 2025 historical.'}</span></div><button type="button" id="pref-set-profile">Edit →</button></div>`;
  document.getElementById('pref-set-profile').onclick=()=>document.getElementById('candidate-profile-chip')?.click();
}
function r1For(id,year,category){const r=categoryRoundsFromRecord(recordForYear(id,year),category);return validRank(r&&r.R1);}
function renderPreferenceInsights(){
  const el=document.getElementById('pref-insights');if(!el)return;
  const p=getCandidateProfile();
  if(!p.air||!order.length){el.hidden=true;el.innerHTML='';return;}
  const reaches=order.map(id=>({id,reach:getCollegeReach(id,p.air,p.category),c:COLLEGE_BY_ID[id]}));
  const notes=[];
  const unknown=reaches.filter(x=>['unknown'].includes(x.reach.state));
  if(unknown.length) notes.push({kind:'info',title:'Evidence gaps',text:`${unknown.length} choice${unknown.length===1?' has':'s have'} no usable ${p.category} cutoff series. Unknown is not being treated as weak or out of reach.`});
  const last=reaches[reaches.length-1];
  if(last && ['historical-out','missed-current'].includes(last.reach.state)) notes.push({kind:'warn',title:'Safety gap',text:`Your last choice, ${formatCollegeName(last.c.name)}, is not currently a safety anchor for AIR ${formatIndianRank(p.air)}. Consider whether you intentionally want the list to end there.`});
  else if(last && last.reach.state==='historical-reach' && last.reach.chance==='Reach') notes.push({kind:'warn',title:'Thin safety margin',text:`Your final choice is still a historical Reach rather than a clear safety. That may be intentional, but it is worth reviewing before locking choices.`});
  let inversion=null;
  for(let i=0;i<order.length-1&&!inversion;i++){
    const a=COLLEGE_BY_ID[order[i]],b=COLLEGE_BY_ID[order[i+1]];const ar=r1For(a.id,2025,p.category),br=r1For(b.id,2025,p.category);
    if(ar&&br&&br<ar*.72) inversion={a,b,ar,br};
  }
  if(inversion) notes.push({kind:'info',title:'Demand-order check',text:`${formatCollegeName(inversion.b.name)} had substantially stronger 2025 R1 demand than ${formatCollegeName(inversion.a.name)} but is placed below it. Keep the order if that reflects your real preference.`});
  if(!notes.length){notes.push({kind:'ok',title:'List sanity check',text:'No obvious safety or evidence warning was triggered by the loaded cutoff data. This does not replace your own preference judgement.'});}
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
        ${(()=>{const p=getCandidateProfile();if(!p.air)return '';const r=getCollegeReach(id,p.air,p.category);const mv=getRoundMovement(id,p.category,'R1');return `<div class="pref-reach"><span class="reach-badge ${escapeHtml(r.state)}">${escapeHtml(reachShortText(r))}</span>${mv?`<span class="pref-movement">${escapeHtml(movementText(mv))}</span>`:''}</div>`;})()}
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
