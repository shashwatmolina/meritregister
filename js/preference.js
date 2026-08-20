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
function renderList(){
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
        <p class="name">${escapeHtml(formatCollegeName(c.name))}</p>
        <div class="pref-meta"><span class="type-badge ${escapeHtml(c.type)}">${escapeHtml(c.type)}</span><span class="loc">${escapeHtml(c.city)}, ${escapeHtml(c.state)}</span><span>&middot; ${(c.seats_2026 || c.seats || '—')} seats</span></div>
      </div>
      <div class="pref-controls">
        <button class="icon-btn up" type="button" aria-label="Move ${escapeHtml(formatCollegeName(c.name))} up" draggable="false" ${i===0?'disabled':''}>&uarr;</button>
        <button class="icon-btn down" type="button" aria-label="Move ${escapeHtml(formatCollegeName(c.name))} down" draggable="false" ${i===order.length-1?'disabled':''}>&darr;</button>
        <button class="icon-btn remove" type="button" aria-label="Remove ${escapeHtml(formatCollegeName(c.name))} from list" draggable="false">&times;</button>
      </div>
    </li>`;
  }).join('');
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
  p.set('cat', 'General');
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
  window.addEventListener('storage', e => {
    if(e.key === SHORTLIST_KEY || e.key === ORDER_KEY){ loadState(); renderList(); }
  });
}

document.addEventListener('DOMContentLoaded', () => { initTheme(); loadState(); bindEvents(); renderList(); });
