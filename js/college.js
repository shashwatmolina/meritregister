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
  return renderSources(Object.entries(u).filter(([,url])=>url).map(([round,url])=>({label:`Official ${round} result`,url})),'Counselling sources');
}
function cutoffTable(cutoff,year){
  if(!cutoff)return pending(`${year} MCC AIQ cutoff data is not loaded for this college.`);
  const cats=availableCategories(cutoff); if(!cats.length)return pending(`${year} cutoff record exists, but no round-wise category table is available.`);
  const rows=cats.map(cat=>{const r=cutoffRow(cutoff,cat)||{};return `<tr><td>${esc(cat==='General'?'General / UR':cat)}</td><td class="rank">${r.R1?fmt(r.R1):'—'}</td><td class="rank">${r.R2?fmt(r.R2):'—'}</td><td class="rank">${r.R3?fmt(r.R3):'—'}</td></tr>`}).join('');
  return `<div class="profile-cutoff-table-wrap"><table class="profile-cutoff-table"><thead><tr><th>Category</th><th>Round 1</th><th>Round 2</th><th>Round 3</th></tr></thead><tbody>${rows}</tbody></table></div><div class="profile-cutoff-note">Ranks are historical closing AIRs in the loaded MCC dataset. A dash means no verified value is stored for that round; it does not mean the category was ineligible.${cutoff.source?`<br>Dataset source: ${esc(cutoff.source)}`:''}</div>${cutoffSourceLinks(cutoff)}`;
}
function renderCutoffs(id){
  const c25=CUTOFFS[id]; const c26=(typeof AIQ_CUTOFFS_2026!=='undefined'?AIQ_CUTOFFS_2026[id]:null);
  const has26=!!c26;
  return card('MCC / AIQ cutoffs','Category-wise historical closing All India Ranks. 2026 is shown automatically once official data is loaded.',`<div class="profile-cutoff-toolbar"><div class="profile-year-badge">${has26?'2026 CURRENT DATA':'2025 HISTORICAL DATA'}</div>${has26?'<select id="profile-cutoff-year"><option value="2026">2026</option><option value="2025">2025</option></select>':''}</div><div id="profile-cutoff-content">${cutoffTable(has26?c26:c25,has26?2026:2025)}</div>`);
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
  finance:[['Academic fee','academicFee'],['Hostel fee','hostelFee'],['Mess','mess'],['Internship stipend','internStipend'],['Service bond','bond'],['Penalty','penalty'],['Currentness','currentness']]
};
function renderEvidenceSection(title,subtitle,data,map){
  if(!data)return card(title,subtitle,pending('This research layer has not been reconstructed for this college yet. Missing evidence is not treated as a negative signal.'));
  const fields=map.map(([lab,key])=>field(lab,data[key])).join('');
  return card(title,subtitle,`<div class="profile-section-grid">${fields}</div>${renderSources(data.sources)}`,data.confidence||'');
}

function roomProgression(h){const r=h?.roomAllocation||{};return [['1st year',r.year1],['2nd year',r.year2],['3rd year',r.year3],['Final year',r.year4],['Internship',r.internship]].filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join(' | ')||null;}
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
  const dims=[['Clinical',CLINICAL_EXPOSURE[id]],['Academics',ACADEMICS_TEACHING[id]],['Research',RESEARCH_USMLE[id]],['Hostel',HOSTELS[id]],['Campus',CAMPUS_STUDENT_LIFE[id]],['Finance',FEES_BOND_STIPEND[id]]];
  return dims;
}
function renderCoverage(id){
  const dims=researchCoverage(id),known=dims.filter(([,v])=>!!v).length;
  return `<div class="side-card"><h3>Evidence coverage</h3><div class="coverage-list">${dims.map(([lab,v])=>`<div class="coverage-row"><span><span class="coverage-dot ${v?'yes':''}"></span>${esc(lab)}</span><strong>${v?'Researched':'Pending'}</strong></div>`).join('')}</div><p style="margin-top:10px">${known}/6 deep comparison layers currently reconstructed. Pending never means poor.</p></div>`;
}
function renderMethod(){return `<div class="side-card"><h3>How to read this profile</h3><p>Official institutional material is preferred for hard facts. Student-reported material is labelled where used. “Pending” means the field has not been reconstructed yet, not that the college lacks the facility.</p></div>`;}

function renderHero(c){
  const coverage=researchCoverage(c.id).filter(([,v])=>!!v).length;const co=(typeof AIQ_CUTOFFS_2026!=='undefined'&&AIQ_CUTOFFS_2026[c.id])||CUTOFFS[c.id];const r1=cutoffRow(co,'General')?.R1;
  return `<div class="profile-breadcrumb"><a href="index.html">Directory</a><span>›</span><span>${esc(shortName(c.name))}</span></div>
  <section class="profile-hero"><div class="profile-hero-top"><div class="profile-title-wrap"><div class="profile-kicker"><span class="profile-tag accent">${esc(c.type)}</span>${c.established===2026?'<span class="profile-tag accent">NEW 2026</span>':''}<span class="profile-tag">Research ${coverage}/6</span></div><h2 class="profile-title">${esc(shortName(c.name))}</h2><p class="profile-location">${esc(c.city)}, ${esc(c.state)} · ${esc(c.management||'Management not recorded')}</p></div><div class="profile-actions"><button class="profile-action" id="profile-pref-btn" type="button"></button><button class="profile-action" id="profile-compare-btn" type="button"></button><a class="profile-action primary" id="profile-open-compare" href="compare.html">Open Compare →</a></div></div>
  <div class="profile-stat-grid">${[['2026 MBBS seats',c.seats_2026||c.seats],['Established',c.established],['MCC code',c.mcc_code_2026||'Not recorded'],['General R1',r1?fmt(r1):'Not loaded'],['Research depth',`${coverage}/6 layers`]].map(([lab,val])=>`<div class="profile-stat"><div class="label">${esc(lab)}</div><div class="value">${esc(val)}</div></div>`).join('')}</div></section>`;
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
  root.innerHTML=`${renderHero(c)}<div class="profile-layout"><div class="profile-main">${renderLatest(c.id)}${renderCutoffs(c.id)}${renderDemand(c.id)}${renderEvidenceSection('Clinical exposure','Hospitals, patient load, trauma, specialty breadth and MBBS learning context.',CLINICAL_EXPOSURE[c.id],FIELD_MAPS.clinical)}${renderEvidenceSection('Academics & teaching','Teaching model, attendance, internal assessment, clinical teaching and study infrastructure.',ACADEMICS_TEACHING[c.id],FIELD_MAPS.academics)}${renderEvidenceSection('Research & international pathway','Institutional research strength, undergraduate access, mentorship, funding and international context.',RESEARCH_USMLE[c.id],FIELD_MAPS.research)}${renderHostel(c.id)}${renderEvidenceSection('Campus & student life','Sports, clubs, festivals, city access, social environment and the main lifestyle trade-off.',CAMPUS_STUDENT_LIFE[c.id],FIELD_MAPS.campus)}${renderEvidenceSection('Fees, bond & stipend','Current fee evidence, hostel/mess cost, internship stipend and service obligations.',FEES_BOND_STIPEND[c.id],FIELD_MAPS.finance)}</div><aside class="profile-side">${renderCoverage(c.id)}${renderSimilar(c)}${renderMethod()}</aside></div>`;
  root.hidden=false;$('#profile-loading').hidden=true;bindActions(c);
  const yearSel=$('#profile-cutoff-year');if(yearSel)yearSel.addEventListener('change',()=>{const y=Number(yearSel.value);$('#profile-cutoff-content').innerHTML=cutoffTable(y===2026?AIQ_CUTOFFS_2026[c.id]:CUTOFFS[c.id],y);});
}

function renderError(){
  const root=$('#profile-root');$('#profile-loading').hidden=true;root.hidden=false;root.innerHTML=`<div class="profile-error"><h2>College profile not found</h2><p>The link does not contain a valid college ID from the current 465-college master dataset.</p><a class="profile-action primary" href="index.html">Back to Directory →</a></div>`;
}

document.addEventListener('DOMContentLoaded',()=>{initTheme();const id=Number(new URLSearchParams(location.search).get('id'));const c=collegeById(id);if(!c)return renderError();renderProfile(c);});
