(() => {
  function initNavMore(){
    document.querySelectorAll('.nav-more').forEach(root => {
      const btn=root.querySelector('.nav-more-btn');
      const menu=root.querySelector('.nav-more-menu');
      if(!btn || !menu) return;
      const close=()=>{root.classList.remove('open');btn.setAttribute('aria-expanded','false');};
      const open=()=>{root.classList.add('open');btn.setAttribute('aria-expanded','true');};
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();root.classList.contains('open')?close():open();});
      root.addEventListener('mouseenter',()=>{ if(window.matchMedia('(hover:hover)').matches) open(); });
      root.addEventListener('mouseleave',()=>{ if(window.matchMedia('(hover:hover)').matches) close(); });
      root.addEventListener('focusout',e=>{ if(!root.contains(e.relatedTarget)) close(); });
      if(menu.querySelector('a.active,[aria-current="page"]')) btn.classList.add('active');
      document.addEventListener('click',e=>{if(!root.contains(e.target)) close();});
      document.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initNavMore); else initNavMore();
})();
