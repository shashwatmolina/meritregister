'use strict';
// Aug-2026 deep research refresh: newest source-backed findings layered on top of the structured profiles.


function deepUniqueSources(c){
  const objs=[CLINICAL_EXPOSURE[c.id],ACADEMICS_TEACHING[c.id],RESEARCH_USMLE[c.id],CAMPUS_STUDENT_LIFE[c.id],FEES_BOND_STIPEND[c.id],HOSTELS[c.id],DEEP_RESEARCH_REFRESH[c.id]];
  const seen=new Map();
  objs.forEach(o=>{if(!o)return;const srcs=o.sources||[];srcs.forEach(s=>{const label=Array.isArray(s)?s[0]:s.label,url=Array.isArray(s)?s[1]:s.url;if(url&&!seen.has(url))seen.set(url,{label:label||new URL(url).hostname,url});});});
  return [...seen.values()];
}
function deepLine(label,val){if(val===null||val===undefined||val===''||String(val)==='Unknown')return '';return `<div class="deep-line"><strong>${esc(label)}:</strong> ${esc(typeof val==='object'?JSON.stringify(val):val)}</div>`;}
function deepRoom(h){if(!h)return '';const r=h.roomAllocation||{};return [r.year1&&`Y1 ${r.year1}`,r.year2&&`Y2 ${r.year2}`,r.year3&&`Y3 ${r.year3}`,r.year4&&`Y4 ${r.year4}`,r.internship&&`Intern ${r.internship}`].filter(Boolean).join(' · ');}
function deepDossierCard(c){
 const cl=CLINICAL_EXPOSURE[c.id]||{},ac=ACADEMICS_TEACHING[c.id]||{},re=RESEARCH_USMLE[c.id]||{},ca=CAMPUS_STUDENT_LIFE[c.id]||{},fi=FEES_BOND_STIPEND[c.id]||{},h=HOSTELS[c.id]||{},rf=DEEP_RESEARCH_REFRESH[c.id]||{};
 const src=deepUniqueSources(c),cov=profileDimensionCoverage(c);
 const srcHtml=src.length?`<div class="deep-source-list">${src.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label||'Source')}</a>`).join('')}</div>`:'<div class="deep-line">No auditable source link stored.</div>';
 return `<details class="deep-dossier"><summary><span class="deep-college-name">${esc(c.name)}</span></summary><div class="deep-meta"><a class="deep-profile-link" href="college.html?id=${c.id}">Open profile →</a><span>${cov.known}/6 dimensions</span><span>${src.length} unique sources</span><span>Freshness ${esc(rf.freshness||'Mixed')}</span><span>Verified 20 Aug 2026</span></div>
 ${rf.findings?.length?`<div class="deep-section"><div class="deep-section-title">New findings in this pass</div>${rf.findings.map(x=>`<div class="deep-finding">${esc(x)}</div>`).join('')}</div>`:''}
 <div class="deep-section"><div class="deep-section-title">Clinical dossier</div>${deepLine('Teaching hospitals',cl.hospitals)}${deepLine('Beds',cl.beds)}${deepLine('OPD',cl.opd)}${deepLine('Emergency',cl.emergency)}${deepLine('IPD',cl.ipd)}${deepLine('Surgery / procedures',cl.surgery)}${deepLine('Trauma',cl.trauma)}${deepLine('Superspecialties',cl.superspecialty)}${deepLine('Patient mix',cl.patientMix)}${deepLine('UG learning context',cl.teaching)}</div>
 <div class="deep-section"><div class="deep-section-title">Academics dossier</div>${deepLine('Teaching model',ac.teachingModel)}${deepLine('Attendance',ac.attendance)}${deepLine('Internal assessment',ac.internalAssessment)}${deepLine('Clinical teaching',ac.clinicalTeaching)}${deepLine('Library',ac.library)}${deepLine('Reading hours',ac.readingHours)}${deepLine('Academic culture',ac.learningEnvironment)}${deepLine('Student reports',ac.studentReported)}</div>
 <div class="deep-section"><div class="deep-section-title">Research / international dossier</div>${deepLine('Research ecosystem',re.researchStrength)}${deepLine('UG access',re.undergradAccess)}${deepLine('Funding',re.funding)}${deepLine('Infrastructure',re.infrastructure)}${deepLine('Student opportunities',re.studentOpportunities)}${deepLine('International / USMLE',re.internationalPathway)}${deepLine('Networking',re.cityNetworking)}${deepLine('International alumni evidence',re.alumniInternational)}</div>
 <div class="deep-section"><div class="deep-section-title">Hostel dossier</div>${deepLine('Hostel blocks',h.hostelBlocks)}${deepLine('Year-wise rooms',deepRoom(h))}${deepLine('Boys',h.genderRoomAllocation?.boys)}${deepLine('Girls',h.genderRoomAllocation?.girls)}${deepLine('Bathroom',h.bathroom)}${deepLine('Bathroom ratio',h.bathroomRatio)}${deepLine('Room size',h.roomSize)}${deepLine('Mess',h.messDetails)}${deepLine('Wi‑Fi',yesno(h.wifi))}${deepLine('Cooling',joinTruthy([h.acProvided===true?'AC provided':null,h.acAllowed===true?'AC allowed':h.acAllowed===false?'AC not allowed':null,h.coolerAllowed===true?'Cooler allowed':null]))}${deepLine('Housekeeping',h.housekeeping)}${deepLine('Curfew',h.curfew)}${deepLine('Condition',joinTruthy([h.roomCondition,h.hygiene,h.renovationStatus,h.blockVariation]))}${deepLine('Student report',h.studentReport)}</div>
 <div class="deep-section"><div class="deep-section-title">Campus / student-life dossier</div>${deepLine('Campus',ca.campus)}${deepLine('Sports',ca.sports)}${deepLine('Clubs',ca.clubs)}${deepLine('Fest',ca.fest)}${deepLine('Food',ca.food)}${deepLine('City / transport',ca.city)}${deepLine('Social culture',ca.social)}${deepLine('Safety / welfare',ca.safety)}${deepLine('Main trade-off',ca.tradeoff)}</div>
 <div class="deep-section"><div class="deep-section-title">Finance / admin dossier</div>${deepLine('Academic fee',fi.academicFee)}${deepLine('Hostel fee',fi.hostelFee)}${deepLine('Mess',fi.mess)}${deepLine('Intern stipend',fi.internStipend)}${deepLine('Service bond',fi.bond)}${deepLine('Bond terms',fi.penalty)}${deepLine('Currentness',fi.currentness)}</div>
 <div class="deep-section"><div class="deep-section-title">Evidence ledger</div>${deepLine('Clinical confidence',cl.confidence)}${deepLine('Academic confidence',ac.confidence)}${deepLine('Research confidence',re.confidence)}${deepLine('Campus confidence',ca.confidence)}${deepLine('Finance confidence',fi.confidence)}${deepLine('Hostel confidence',h.confidence)}${srcHtml}</div></details>`;
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
  const url=location.pathname+'?'+p.toString(); history[replace?'replaceState':'pushState'](null,'',url);
}
function normalizeSearch(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim();}
function acronym(name){const stop=new Set(['of','and','the','for','in','at','hospital','college']);return normalizeSearch(name).split(' ').filter(w=>w&&!stop.has(w)).map(w=>w[0]).join('');}
function collegeSearchIndex(c){return normalizeSearch([c.name,c.city,c.state,c.type,c.management,acronym(c.name)].join(' '));}
function searchColleges(q){const nq=normalizeSearch(q);if(!nq)return [];const terms=nq.split(/\s+/);return ALL_COLLEGES.filter(c=>!selected.includes(c.id)).map(c=>{const idx=collegeSearchIndex(c),name=normalizeSearch(c.name),acr=acronym(c.name);if(!terms.every(t=>idx.includes(t)))return null;let score=0;if(name.startsWith(nq))score+=100;if(name.includes(nq))score+=60;if(acr===nq)score+=120;else if(acr.startsWith(nq))score+=70;if(normalizeSearch(c.city)===nq)score+=25;if(normalizeSearch(c.state)===nq)score+=20;return {c,score};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.c.name.localeCompare(b.c.name)).slice(0,12).map(x=>x.c);}
function renderSearchResults(){const input=$('#college-search'),box=$('#college-search-results'),count=$('#search-count');if(!input||!box)return;const q=input.value.trim();count.textContent=selected.length>=4?'Maximum 4 selected':'';if(!q||selected.length>=4){box.hidden=true;box.innerHTML='';return;}const results=searchColleges(q);box.innerHTML=results.length?results.map(c=>`<div class="search-result"><a class="search-result-main profile-inline-link" href="college.html?id=${c.id}"><span class="search-result-name">${esc(c.name)}</span><span class="search-result-meta">${esc(c.city)}, ${esc(c.state)} · ${esc(c.type)}</span></a><button class="search-result-add" type="button" data-add-college="${c.id}">+ Add</button></div>`).join(''):`<div class="search-empty">No matching colleges. Try a shorter name, city, state or abbreviation.</div>`;box.hidden=false;box.querySelectorAll('[data-add-college]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.addCollege);if(selected.length<4&&!selected.includes(id)){selected.push(id);input.value='';box.hidden=true;syncUrl();renderAll();input.focus();}});}
function populateOptions(){const input=$('#college-search');if(!input)return;input.addEventListener('input',renderSearchResults);input.addEventListener('focus',renderSearchResults);input.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#college-search-results').hidden=true;}if(e.key==='Enter'){const first=$('#college-search-results [data-add-college]');if(first){e.preventDefault();first.click();}}});document.addEventListener('click',e=>{if(!e.target.closest('.college-search-block'))$('#college-search-results').hidden=true;});}
function renderPickers(){const root=$('#compare-pickers');if(!root)return;root.innerHTML=selected.map((id,i)=>{const c=collegeById(id);return `<div class="selected-chip"><div class="selected-chip-text"><a class="selected-chip-name profile-inline-link" href="college.html?id=${c.id}">${esc(c.name)}</a><div class="selected-chip-meta">${esc(c.city)}, ${esc(c.state)}</div></div><button type="button" data-remove="${i}" aria-label="Remove ${esc(c.name)}">×</button></div>`;}).join('');root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{selected.splice(Number(b.dataset.remove),1);syncUrl();renderAll();});const ct=$('#selected-count');if(ct)ct.textContent=`${selected.length} / 4`;const sc=$('#search-count');if(sc)sc.textContent=selected.length>=4?'Maximum 4 selected':'';}
function cutoffRounds(id){
  const co=CUTOFFS[id]; if(!co) return null;
  const cr=co.category_rounds?.[category];
  if(cr) return {R1:posnum(cr.R1),R2:posnum(cr.R2),R3:posnum(cr.R3)};
  if(category==='General') return {R1:posnum(co.r1?.closing),R2:posnum(co.r2?.closing),R3:posnum(co.r3?.closing)};
  return null;
}
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
function roomProgression(h){if(!h) return 'Unknown'; const r=h.roomAllocation||{}; const parts=[['Y1',r.year1],['Y2',r.year2],['Y3',r.year3],['Y4',r.year4],['Intern',r.internship]].filter(([,v])=>v); return parts.length?parts.map(([k,v])=>`${k}: ${v}`).join(' | '):'Unknown';}
function hostelAmenity(h,keys){if(!h)return 'Unknown'; return keys.map(([lab,key])=>h[key]===true?lab:h[key]===false?`No ${lab}`:null).filter(Boolean).join(' · ')||'Unknown';}
function sourceCount(h){return Array.isArray(h?.source)?h.source.length:(Array.isArray(h?.sources)?h.sources.length:'Unknown');}

function aspectRow(label,value,raw=false){const unknown=value===null||value===undefined||value===''||value==='Unknown';const val=raw?value:esc(fmt(value));return `<div class="aspect-row"><span class="aspect-label">${esc(label)}</span><span class="aspect-value${unknown?' unknown':''}">${val}</span></div>`;}
function aspectSection(title,subtitle,cols,cardBuilder){return `<section class="compare-section-card"><div class="compare-section-head"><h3>${esc(title)}</h3>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><div class="compare-card-grid" style="--compare-cols:${cols.length}">${cols.map(cardBuilder).join('')}</div></section>`;}
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
 const positive=Object.entries(priorityImportance).filter(([,v])=>Number(v)>0);
 const total=positive.reduce((s,[,v])=>s+Number(v),0);
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
 return `<details class="priority-mode" id="priority-mode" open><summary><span class="priority-summary-copy"><span class="priority-summary-title">Personalize this comparison</span><span class="priority-summary-sub">Just choose how important each factor is. We calculate the percentages automatically.</span></span></summary><div class="priority-inner"><div class="priority-intro">No percentage balancing needed. Pick an importance level for each factor; the site automatically normalizes your choices to 100%. Set a factor to <strong>Not important</strong> to exclude it.</div><div class="priority-presets"><button type="button" class="priority-preset" data-priority-preset="balanced">Balanced</button><button type="button" class="priority-preset" data-priority-preset="clinical">Clinical-first</button><button type="button" class="priority-preset" data-priority-preset="research">Research / USMLE</button><button type="button" class="priority-preset" data-priority-preset="campus">Campus life</button><button type="button" class="priority-preset" data-priority-preset="delhi">Networking</button><button type="button" class="priority-preset" data-priority-preset="comfort">Hostel / comfort</button><button type="button" class="priority-preset" data-priority-reset="1">Reset</button></div><div class="priority-grid priority-grid-easy">${Object.entries(PRIORITY_LABELS).map(([key,label])=>importanceControl(key,label)).join('')}</div><div class="priority-total" id="priority-total">Calculated weights: ${Object.entries(weights).filter(([,v])=>v>0).map(([k,v])=>`${PRIORITY_LABELS[k]} ${v}%`).join(' · ')||'Choose at least one factor'}</div><div id="priority-rank-output">${Object.values(weights).some(v=>v>0)?renderPriorityRank(cols):'<div class="compare-empty-state" style="margin-top:10px">Choose at least one factor to calculate your personalized ranking.</div>'}</div></div></details>`;
}
function refreshPriorityUI(){
 const cols=selected.map(collegeById).filter(Boolean),weights=normalizedPriorityWeights();
 document.querySelectorAll('[data-priority-key][data-priority-level]').forEach(btn=>{const active=Number(priorityImportance[btn.dataset.priorityKey])===Number(btn.dataset.priorityLevel);btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');});
 Object.entries(weights).forEach(([k,v])=>{const el=document.getElementById(`priority-auto-${k}`);if(el)el.textContent=v>0?`${IMPORTANCE_LABELS[priorityImportance[k]]} · ${v}%`:'Excluded';});
 const totalEl=document.getElementById('priority-total');if(totalEl)totalEl.textContent=`Calculated weights: ${Object.entries(weights).filter(([,v])=>v>0).map(([k,v])=>`${PRIORITY_LABELS[k]} ${v}%`).join(' · ')||'Choose at least one factor'}`;
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

function renderComparison(){const cols=selected.map(collegeById).filter(Boolean),n=cols.length;document.documentElement.style.setProperty('--compare-cols',n);if(n<2){$('#compare-output').innerHTML='<div class="compare-empty-state">Search above and add at least two colleges to start comparing.</div>';return;}let out=`<div class="compare-output-v3"><div class="compare-overview-grid" style="--compare-cols:${n}">`;out+=cols.map(c=>{const r=cutoffRounds(c.id),h=hasHostel(c.id),cov=profileDimensionCoverage(c);return `<article class="compare-overview-card"><a class="compare-overview-name profile-inline-link" href="college.html?id=${c.id}">${esc(c.name)}</a><div class="compare-overview-meta">${esc(c.city)}, ${esc(c.state)} · ${esc(c.type)}</div><div class="compare-overview-stats"><span class="compare-pill">${fmt(c.seats_2026||c.seats)} seats</span>${r?.R1?`<span class="compare-pill accent">R1 ${r.R1.toLocaleString('en-IN')}</span>`:''}<span class="compare-pill">${h?'Hostel researched':'Hostel pending'}</span><span class="compare-pill profile-coverage-pill">Profile ${cov.known}/${cov.total}</span></div></article>`}).join('')+`</div>`;
out+=renderStrengthSummary(cols);
out+=renderPriorityMode(cols);
out+=renderDeepResearch(cols);
out+=aspectSection('College profile','Key institutional facts.',cols,c=>collegeCard(c,aspectRow('City / state',`${c.city}, ${c.state}`)+aspectRow('Institution type',c.type)+aspectRow('Management',c.management)+aspectRow('Established',c.established)));
out+=aspectSection('MBBS seats · 2026','Current intake.',cols,c=>collegeCard(c,aspectRow('Total MBBS seats',c.seats_2026||c.seats)+aspectRow('Increase for 2026',c.seats_increased_2026)));
out+=aspectSection(`MCC AIQ cutoffs · 2025 · ${category}`,'Lower AIR means more competitive.',cols,c=>{const r=cutoffRounds(c.id)||{};return collegeCard(c,`<div class="cutoff-tiles">${['R1','R2','R3'].map(x=>`<div class="cutoff-tile"><div class="cutoff-round">${x}</div><div class="cutoff-air${r[x]?'':' unknown'}">${r[x]?r[x].toLocaleString('en-IN'):'Unknown'}</div></div>`).join('')}</div>`)});
out+=aspectSection('Round-1 demand history','Median AIR where reconstructed; missing history means unresearched.',cols,c=>{const t=trendFor(c.id);let move='Unknown';if(t&&posnum(t[2022])&&posnum(t[2025])){const d=t[2025]-t[2022];move=`${Math.abs(d).toLocaleString('en-IN')} ranks ${d<0?'stronger':d>0?'weaker':'flat'}`;}return collegeCard(c,trendMini(c.id)+aspectRow('2022 → 2025',move));});
out+=aspectSection('Academics & teaching','Teaching structure, attendance, assessment and study infrastructure. Student-reported strictness is labelled separately from official rules.',cols,c=>{const d=ACADEMICS_TEACHING[c.id];return collegeCard(c,`<div class="hostel-glance">${academicsGlance(c,d)}</div>${d&&d.learningEnvironment?`<div class="hostel-note">${esc(String(d.learningEnvironment).length>155?String(d.learningEnvironment).slice(0,152)+'…':d.learningEnvironment)}</div>`:''}<details class="compare-detail-toggle"><summary>View academic details</summary>${academicsDetailBody(c)}</details>`) });
out+=aspectSection('Research & international pathway','Undergraduate research access, funding, mentorship and international-pathway context. No fake USMLE score: weak or unverified evidence stays explicitly limited.',cols,c=>{const d=RESEARCH_USMLE[c.id];return collegeCard(c,`<div class="hostel-glance">${researchGlance(d)}</div>${d&&d.studentOpportunities?`<div class="hostel-note">${esc(String(d.studentOpportunities).length>155?String(d.studentOpportunities).slice(0,152)+'…':d.studentOpportunities)}</div>`:''}<details class="compare-detail-toggle"><summary>View research / international details</summary>${researchDetailBody(c)}</details>`) });
out+=aspectSection('Fees, bond & internship stipend','Current official figures are preferred. Stale fee schedules and unverified bond penalties are explicitly flagged instead of silently reused.',cols,c=>{const d=FEES_BOND_STIPEND[c.id];return collegeCard(c,`<div class="hostel-glance">${financeGlance(d)}</div>${d&&d.currentness?`<div class="hostel-note">${esc(String(d.currentness).length>155?String(d.currentness).slice(0,152)+'…':d.currentness)}</div>`:''}<details class="compare-detail-toggle"><summary>View fees / bond / stipend details</summary>${financeDetailBody(c)}</details>`) });
out+=aspectSection('Campus & student life','Campus character, sports, fests, societies and city access. Official facilities are separated from student-reported lived experience.',cols,c=>{const d=CAMPUS_STUDENT_LIFE[c.id];return collegeCard(c,`<div class="hostel-glance">${campusGlance(d)}</div>${d&&d.tradeoff?`<div class="hostel-note">${esc(String(d.tradeoff).length>155?String(d.tradeoff).slice(0,152)+'…':d.tradeoff)}</div>`:''}<details class="compare-detail-toggle"><summary>View campus / student-life details</summary>${campusDetailBody(c)}</details>`) });
out+=aspectSection('Clinical exposure','Hospital scale, patient load and tertiary-care breadth. Official figures are preferred; unknowns stay unknown.',cols,c=>{const d=CLINICAL_EXPOSURE[c.id];return collegeCard(c,`<div class="hostel-glance">${clinicalGlance(d)}</div>${d&&d.superspecialty?`<div class="hostel-note">${esc(String(d.superspecialty).length>150?String(d.superspecialty).slice(0,147)+'…':d.superspecialty)}</div>`:''}<details class="compare-detail-toggle"><summary>View clinical details</summary>${clinicalDetailBody(c)}</details>`)});
out+=aspectSection('Hostel','Quick decision view. Open details only when you want the full evidence.',cols,c=>{const h=HOSTELS[c.id],ok=hasHostel(c.id),prof=ok?hostelDecisionProfile(h):null;if(h)h.__collegeId=c.id;const fee=ok?(h.annualFee||'Fee unknown'):'Fee unknown';const mess=ok?(h.messMonthly||'Mess unknown'):'Mess unknown';const curfew=ok?(h.curfew||'Curfew unknown'):'Curfew unknown';return collegeCard(c,`<div class="hostel-badge-line">${qualityBadge(prof?.overall?.label||'Unknown')}</div><div class="hostel-glance">${glanceChip(ok?compactRoom(h):'Room unknown')}${glanceChip(ok?compactBath(h):'Bathroom unknown')}${glanceChip(fee)}${glanceChip(mess)}${glanceChip(ok?compactCooling(h):'Cooling unknown')}${glanceChip(curfew)}</div>${ok&&h.studentReport?`<div class="hostel-note">${esc(String(h.studentReport).length>145?String(h.studentReport).slice(0,142)+'…':h.studentReport)}</div>`:''}<details class="compare-detail-toggle"><summary>View hostel details</summary>${hostelDetailBody(h,ok)}</details>`)});
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
