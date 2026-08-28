/* V9.4 first-time-friendly behavior. */
(()=>{
  const PAGE=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  function colleges(){try{return Array.isArray(window.ALL_COLLEGES)?window.ALL_COLLEGES:(typeof ALL_COLLEGES!=='undefined'&&Array.isArray(ALL_COLLEGES)?ALL_COLLEGES:[])}catch(e){return []}}
  function score(c,q){try{return typeof collegeSearchScore==='function'?collegeSearchScore(c,q):0}catch(e){return 0}}
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function simplifyExistingUx(){
    document.querySelectorAll('.platform-home-how,.platform-journey').forEach(x=>x.remove());
    // V9.2 page guides are useful, but remove jargon and excessive prefixes.
    document.querySelectorAll('.platform-page-guide').forEach(g=>{
      const strong=g.querySelector('strong'); if(strong&&/How to use|Your counselling workflow/i.test(strong.textContent)) strong.remove();
    });
  }
  function groupMore(){
    const menu=document.querySelector('.nav-more-menu'); if(!menu||menu.dataset.grouped==='1')return;
    menu.dataset.grouped='1';
    const links=[...menu.querySelectorAll(':scope > a')];
    const groups=[
      ['Planning',['decision.html','choice.html','assistant.html']],
      ['Research',['culture.html','evidence.html','timeline.html','movement.html']],
      ['About',['status.html','about.html']]
    ];
    menu.innerHTML='';
    groups.forEach((g,gi)=>{
      if(gi){const sep=document.createElement('span');sep.className='friendly-menu-sep';menu.appendChild(sep)}
      const label=document.createElement('span');label.className='friendly-menu-label';label.textContent=g[0];menu.appendChild(label);
      g[1].forEach(h=>{const a=links.find(x=>(x.getAttribute('href')||'').endsWith(h));if(a)menu.appendChild(a)});
    });
  }
  function homeSearch(){
    const input=document.getElementById('friendly-home-search-input'),out=document.getElementById('friendly-home-search-results'); if(!input||!out)return;
    function render(){
      const q=input.value.trim(); if(!q){out.classList.remove('open');out.innerHTML='';return}
      const found=colleges().map(c=>[c,score(c,q)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]||a[0].name.localeCompare(b[0].name)).slice(0,7).map(x=>x[0]);
      out.classList.add('open');
      out.innerHTML=found.length?found.map(c=>`<a class="friendly-home-result" href="college.html?id=${encodeURIComponent(c.id)}"><div><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.city||'')}${c.city&&c.state?' · ':''}${escapeHtml(c.state||'')}${typeof collegeAliases==='function'&&collegeAliases(c).length?' · '+escapeHtml(collegeAliases(c).slice(0,3).join(' / ')):''}</span></div><em>View college →</em></a>`).join(''):`<div class="friendly-home-search-empty">No match yet. Try an acronym, shorter college name, city or state.</div>`;
    }
    input.addEventListener('input',render);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){const a=out.querySelector('a');if(a)location.href=a.href}});
    document.addEventListener('click',e=>{if(!e.target.closest('.friendly-home-search'))out.classList.remove('open')});
  }
  function nextStep(){
    const map={
      'compare.html':['Compare only colleges you would genuinely consider.','Happy with the trade-offs? Save the serious options to My List.','preference.html','Open My List'],
      'preference.html':['This is your working shortlist — not yet your MCC order.','Want help deciding which of these you prefer?','decision.html','Plan my shortlist'],
      'decision.html':['This ranks your shortlist around your priorities, not admission probability.','When the order feels right, move to the counselling list.','choice.html','Build final choices'],
      'choice.html':['This is the final counselling order.','Keep the college you truly prefer higher, even if a lower option is safer.','index.html#directory','Back to colleges']
    };
    const m=map[PAGE]; if(!m||document.querySelector('.friendly-next-step'))return;
    const anchor=document.querySelector('.platform-page-guide')||document.querySelector('header.masthead'); if(!anchor)return;
    const d=document.createElement('div');d.className='friendly-next-step';d.innerHTML=`<p><strong>${m[0]}</strong> ${m[1]}</p><a href="${m[2]}">${m[3]} →</a>`;anchor.insertAdjacentElement('afterend',d);
  }
  function improveEmptyStates(){
    const configs=[
      ['.decision-empty','Nothing to rank yet','Add at least two colleges to My List first. Then come back here to rank them around what matters to you.','index.html#directory','Find colleges'],
      ['.choice-empty','Your final list is empty','Save colleges to My List first. Final Choices will use that list as your starting order.','preference.html','Open My List']
    ];
    configs.forEach(([sel,title,text,href,label])=>{const e=document.querySelector(sel);if(!e||e.dataset.friendly)return;e.dataset.friendly='1';e.classList.add('friendly-empty-help');const h=e.querySelector('h3')||document.createElement('h3');h.textContent=title;if(!h.parentNode)e.prepend(h);let p=e.querySelector('p');if(!p){p=document.createElement('p');e.appendChild(p)}p.textContent=text;if(!e.querySelector('.friendly-empty-link')){const a=document.createElement('a');a.className='friendly-empty-link';a.href=href;a.textContent=label+' →';e.appendChild(a)}});
  }

  function simplifyMobileNav(){
    const nav=document.querySelector('.mobile-quick-nav'); if(!nav)return;
    nav.innerHTML='<a href="index.html"><span>Home</span></a><button type="button" class="friendly-mobile-search"><span>Search</span></button><a href="preference.html" data-my-list-link="true"><span>My List</span></a>';
    const b=nav.querySelector('.friendly-mobile-search'); if(b)b.addEventListener('click',()=>document.querySelector('.platform-search-trigger')?.click());
  }

  function renameTechnicalCopy(){
    const replacements=new Map([
      ['Shortlist Builder','Plan my shortlist'],
      ['Final Choices','Final choice list'],
      ['Data Quality','Research quality'],
      ['First-Year Timeline','First-year timeline']
    ]);
    // Only page headings/titles, not every occurrence inside research data.
    document.querySelectorAll('h1,h2,.platform-page-guide strong').forEach(el=>{const t=el.textContent.trim();if(replacements.has(t))el.textContent=replacements.get(t)});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    simplifyExistingUx(); groupMore(); homeSearch(); nextStep(); improveEmptyStates(); simplifyMobileNav(); renameTechnicalCopy();
  });
})();
