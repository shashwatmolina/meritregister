'use strict';
const $s=id=>document.getElementById(id);
function hasDemand(id){return !!(AIIMS_R1_MEDIAN_TRENDS[id]||BIHAR_GMC_R1_MEDIAN_TRENDS[id]);}
function deepCount(id){return [CLINICAL_EXPOSURE[id],ACADEMICS_TEACHING[id],RESEARCH_USMLE[id],CAMPUS_STUDENT_LIFE[id],FEES_BOND_STIPEND[id],HOSTELS[id]].filter(Boolean).length;}
function dot(v,partial=false){return `<span class="status-dot ${v?(partial?'partial':'yes'):'no'}">${v?(partial?'~':'✓'):'—'}</span>`;}
function renderStatus(){
 const q=($s('status-search').value||'').trim().toLowerCase(), filter=$s('status-filter').value;
 const rows=ALL_COLLEGES.filter(c=>{const dc=deepCount(c.id);const text=`${c.name} ${c.city} ${c.state}`.toLowerCase();if(q&&!text.includes(q))return false;if(filter==='deep'&&dc<5)return false;if(filter==='hostel'&&!HOSTELS[c.id])return false;if(filter==='missing'&&dc>=5)return false;return true;});
 $s('status-body').innerHTML=rows.map(c=>{const dc=deepCount(c.id);return `<tr><td class="status-college"><strong>${c.name}</strong><small>#${c.id} · ${c.city}, ${c.state} · ${dc}/6 deep dimensions</small></td><td>${dot(!!CUTOFFS[c.id])}</td><td>${dot(hasDemand(c.id))}</td><td>${dot(!!HOSTELS[c.id],!!HOSTELS[c.id]&&String(HOSTELS[c.id].confidence||'').toLowerCase().includes('low'))}</td><td>${dot(!!CLINICAL_EXPOSURE[c.id])}</td><td>${dot(!!ACADEMICS_TEACHING[c.id])}</td><td>${dot(!!RESEARCH_USMLE[c.id])}</td><td>${dot(!!CAMPUS_STUDENT_LIFE[c.id])}</td><td>${dot(!!FEES_BOND_STIPEND[c.id])}</td><td>${dot(!!DEEP_RESEARCH_REFRESH[c.id])}</td><td>${dot(!!DIMENSION_CALIBRATION[c.id])}</td></tr>`}).join('');
 const deep=ALL_COLLEGES.filter(c=>deepCount(c.id)>=5).length,host=Object.keys(HOSTELS).length,cut=Object.keys(CUTOFFS).length,cal=Object.keys(DIMENSION_CALIBRATION).length;
 $s('status-summary').innerHTML=`<div class="status-stat"><strong>${ALL_COLLEGES.length}</strong><span>College master</span></div><div class="status-stat"><strong>${cut}</strong><span>AIQ cutoff profiles</span></div><div class="status-stat"><strong>${deep}</strong><span>Deep compare profiles</span></div><div class="status-stat"><strong>${host}</strong><span>Hostel profiles</span></div><div class="status-stat"><strong>${cal}</strong><span>Calibrated profiles</span></div>`;
}
$s('status-search').addEventListener('input',renderStatus);$s('status-filter').addEventListener('change',renderStatus);initTheme();renderStatus();
