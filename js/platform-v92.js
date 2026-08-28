(()=>{
  const PAGE=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const labels={
    'decision.html':'Shortlist Builder',
    'choice.html':'Final Choices',
    'evidence.html':'Data Quality',
    'timeline.html':'First-Year Timeline',
    'assistant.html':'Help me choose',
    'culture.html':'Junior Culture',
    'movement.html':'Cutoff Trends'
  };
  const guides={
    'compare.html':['Compare colleges','Pick 2–4 colleges. Start with the big differences, then open the evidence only when you need it.'],
    'preference.html':['My List','Save every college you would genuinely consider. You can reorder or narrow the list later.'],
    'decision.html':['Shortlist Builder','Choose what matters to you. This ranks preference fit; it does not reorder colleges by admission probability.'],
    'choice.html':['Final Choices','This is your counselling order. Keep the college you prefer higher even when a lower choice is easier to get.'],
    'culture.html':['Advanced evidence tool','Use this when you want the detailed evidence behind junior-culture summaries on college pages.'],
    'evidence.html':['Advanced research tool','Use this to judge how complete the research is, not whether a college is safe or unsafe.'],
    'timeline.html':['Advanced timing tool','Use this to see what is known about first-day, first-month, freshers and later first-year timing.'],
    'movement.html':['Cutoff trends','Use historical movement as context, not as a guarantee of what the next round will do.'],
    'assistant.html':['Help me choose','Use this when you are stuck between colleges and want the site to structure the trade-offs.']
  };
  function colleges(){try{return typeof ALL_COLLEGES!=='undefined'&&Array.isArray(ALL_COLLEGES)?ALL_COLLEGES:[]}catch{return []}}
  function friendlyLabels(){
    document.querySelectorAll('a[href="decision.html"]').forEach(a=>{if(/Decision Mode|Shortlist Builder/i.test(a.textContent))a.textContent='Shortlist Builder'});
    document.querySelectorAll('a[href="choice.html"]').forEach(a=>{if(/Choice Filling|Final Choices|Choice$/i.test(a.textContent.trim()))a.textContent='Final Choices'});
    document.querySelectorAll('a[href="assistant.html"]').forEach(a=>{if(/Choice Assistant|Help me choose/i.test(a.textContent))a.textContent='Help me choose'});
    document.querySelectorAll('a[href="evidence.html"]').forEach(a=>{if(/Evidence Explorer|Data Quality/i.test(a.textContent))a.textContent='Data Quality'});
    document.querySelectorAll('a[href="timeline.html"]').forEach(a=>{if(/Timeline Explorer|First-Year Timeline/i.test(a.textContent))a.textContent='First-Year Timeline'});
    const flow={decision:'Shortlist',choice:'Final'};
    document.querySelectorAll('.workflow-step').forEach(a=>{if(a.href.endsWith('/decision.html')){const n=a.querySelector('.workflow-num')?.outerHTML||'';a.innerHTML=n+'Shortlist'}if(a.href.endsWith('/choice.html')){const n=a.querySelector('.workflow-num')?.outerHTML||'';a.innerHTML=n+'Final'}});
    document.querySelectorAll('.mobile-quick-nav a').forEach(a=>{if(a.href.endsWith('/choice.html')){const s=a.querySelector('span');if(s)s.textContent='Final'}});
    // Plain-language filters.
    const textMap={
      'Sort: Evidence coverage':'Sort: Best researched first',
      'Sort: Research gaps first':'Sort: Needs more research',
      'Evidence: Any':'Research depth: Any',
      'Deep profile (4+ core layers)':'Detailed profile',
      'Culture sources: Any':'Junior culture evidence: Any',
      'Freshers coverage: Any':'First-year evidence: Any',
      'Culture recency: Any':'Junior culture recency: Any',
      'Timeline: 1+ supported phase':'First-year timeline: some timing known',
      'Timeline: 3+ supported phases':'First-year timeline: detailed'
    };
    document.querySelectorAll('option').forEach(o=>{const t=o.textContent.trim();if(textMap[t])o.textContent=textMap[t]});
  }
  function addSearch(){
    if(document.querySelector('.platform-search-trigger'))return;
    const nav=document.querySelector('.site-nav');if(!nav)return;
    const btn=document.createElement('button');btn.type='button';btn.className='platform-search-trigger';btn.innerHTML='<span class="search-glyph" aria-hidden="true">⌕</span><span>Search colleges</span><kbd>/</kbd>';
    const more=nav.querySelector('.nav-more');nav.insertBefore(btn,more||null);
    const overlay=document.createElement('div');overlay.className='platform-search-overlay';overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="platform-search-dialog" role="dialog" aria-modal="true" aria-label="Search colleges"><div class="platform-search-head"><input class="platform-search-input" type="search" placeholder="Type a college, city or state…" aria-label="Search all colleges"><button class="platform-search-close" type="button" aria-label="Close search">×</button></div><div class="platform-search-help">Search all 465 colleges from anywhere on the site. Press <strong>Esc</strong> to close.</div><div class="platform-search-results"></div></div>';
    document.body.appendChild(overlay);
    const input=overlay.querySelector('input'),results=overlay.querySelector('.platform-search-results');
    const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
    function score(c,q){const n=norm(c.name),city=norm(c.city),state=norm(c.state),qq=norm(q);if(!qq)return 0;if(n===qq)return 100;if(n.startsWith(qq))return 80;if(n.includes(qq))return 60;if(city.startsWith(qq))return 45;if(state.startsWith(qq))return 35;if((n+' '+city+' '+state).includes(qq))return 20;return 0}
    function render(q=''){
      if(!q.trim()){results.innerHTML='<div class="platform-search-empty"><strong>Find any college instantly.</strong><br>Try “UCMS”, “Jodhpur”, “Kolkata” or a state name.</div>';return}
      const found=colleges().map(c=>[c,score(c,q)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]||a[0].name.localeCompare(b[0].name)).slice(0,10).map(x=>x[0]);
      results.innerHTML=found.length?found.map(c=>`<a class="platform-search-result" href="college.html?id=${encodeURIComponent(c.id)}"><div><strong>${c.name}</strong><span>${c.city||''}${c.city&&c.state?' · ':''}${c.state||''} · ${c.type||'Government'}</span></div><em>Open →</em></a>`).join(''):'<div class="platform-search-empty">No matching college. Try a shorter name, city or state.</div>';
    }
    function open(){overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.classList.add('platform-search-open');setTimeout(()=>input.focus(),0);render(input.value)}
    function close(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('platform-search-open');btn.focus()}
    btn.addEventListener('click',open);overlay.querySelector('.platform-search-close').addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close()});input.addEventListener('input',()=>render(input.value));
    document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();open()}if(e.key==='Escape'&&overlay.classList.contains('open'))close()});
  }
  function addHomeJourney(){
    if(PAGE!=='index.html'||document.querySelector('.platform-home-how'))return;
    const hero=document.querySelector('.hero-head');if(!hero)return;
    const box=document.createElement('div');box.className='platform-home-how';box.innerHTML='<h3>How to use The Merit Register</h3><p>You do not need to use every tool. Most people can follow these four steps.</p><ol><li><strong>Find colleges</strong><span>Search the directory and check your rank.</span></li><li><strong>Compare</strong><span>Put serious options side by side.</span></li><li><strong>Build My List</strong><span>Save only colleges you would actually take.</span></li><li><strong>Final Choices</strong><span>Order them for counselling and export the list.</span></li></ol>';
    hero.appendChild(box);
  }
  function addJourney(){
    if(PAGE==='index.html'||document.querySelector('.platform-journey'))return;
    const product=['compare.html','preference.html','decision.html','choice.html'];if(!product.includes(PAGE))return;
    const header=document.querySelector('header.masthead');if(!header)return;
    const section=document.createElement('section');section.className='platform-journey';section.innerHTML='<div class="wrap"><p class="platform-journey-title">Your counselling workflow</p><div class="platform-journey-grid"><a class="platform-journey-step" href="index.html#directory"><b>1</b><span>Find colleges<small>Search + rank reach</small></span></a><a class="platform-journey-step" href="compare.html"><b>2</b><span>Compare<small>See trade-offs</small></span></a><a class="platform-journey-step" href="preference.html"><b>3</b><span>Build My List<small>Save real options</small></span></a><a class="platform-journey-step" href="choice.html"><b>4</b><span>Final Choices<small>Order + export</small></span></a></div></div>';
    const old=document.querySelector('.workflow-strip');if(old)old.replaceWith(section);else header.insertAdjacentElement('afterend',section); section.querySelectorAll('.platform-journey-step').forEach(a=>{const target=(a.getAttribute('href')||'').split('#')[0];if(target===PAGE)a.classList.add('current')});
  }
  function addGuide(){
    const g=guides[PAGE];if(!g||document.querySelector('.platform-page-guide'))return;
    const header=document.querySelector('header.masthead');const after=document.querySelector('.platform-journey')||document.querySelector('.workflow-strip')||header;if(!after)return;
    const div=document.createElement('div');div.className='platform-page-guide';const adv=['culture.html','evidence.html','timeline.html'].includes(PAGE);div.innerHTML=`${adv?'<span class="platform-advanced-badge">Advanced</span>':''}<strong>${g[0]}:</strong> ${g[1]}${adv?' <a href="index.html#directory">Back to Colleges →</a>':''}`;after.insertAdjacentElement('afterend',div);
  }
  function floatingHelp(){
    if(document.querySelector('.platform-floating-help')||PAGE==='index.html')return;const x=document.createElement('div');x.className='platform-floating-help';x.innerHTML='<button type="button" class="platform-floating-search">⌕ Search</button><a href="index.html#directory">Colleges</a>';document.body.appendChild(x);x.querySelector('button').addEventListener('click',()=>document.querySelector('.platform-search-trigger')?.click());
  }
  function pageText(){
    if(PAGE==='decision.html'){const t=document.querySelector('title');if(t)t.textContent='Shortlist Builder — The Merit Register';const h=document.querySelector('.decision-empty h3');if(h)h.textContent='Add at least two colleges to compare';}
    if(PAGE==='choice.html'){const t=document.querySelector('title');if(t)t.textContent='Final Choices — The Merit Register';const e=document.querySelector('.choice-empty h3');if(e)e.textContent='Your My List is empty';}
    if(PAGE==='evidence.html'){const t=document.querySelector('title');if(t)t.textContent='Data Quality | The Merit Register';const h=document.querySelector('.evidence-hero h2');if(h)h.textContent='Data Quality';}
    if(PAGE==='timeline.html'){const t=document.querySelector('title');if(t)t.textContent='First-Year Timeline | The Merit Register';const h=document.querySelector('.timeline-hero h2');if(h)h.textContent='First-Year Timeline';}
  }
  document.addEventListener('DOMContentLoaded',()=>{friendlyLabels();pageText();addSearch();addHomeJourney();addJourney();addGuide();});
})();
