(()=>{
  const STOP=new Set(['of','and','the','for','at','in','on','a','an','dr','dr.']);
  const TRAILING=new Set(['hospital','hospitals','attached','teaching','new','delhi']);
  const MANUAL={
    45:['IGIMS','IGIMS Patna'],
    49:['PMCH','Patna Medical College Hospital'],
    48:['NMCH','Nalanda Medical College Hospital','NMCH Patna'],
    64:['AIIMS Delhi','AIIMS New Delhi','AIIMSD'],
    65:['ABVIMS','ABVIMS RML','RML','RML Hospital','ABVIMS Delhi'],
    69:['MAMC','MAMC Delhi'],
    70:['NDMC Medical College','Hindu Rao','NDMC Hindu Rao'],
    71:['UCMS','UCMS Delhi','GTB','GTB Hospital','UCMS GTB'],
    72:['VMMC','VMMC Delhi','Safdarjung','SJH','VMMC Safdarjung'],
    220:['GMC Mumbai','Grant','Grant Medical College','JJ','JJ Hospital','Grant JJ'],
    255:['JIPMER','JIPMER Puducherry','JIPMER Pondicherry'],
    402:['KGMU','KGMC','King George Medical University'],
    457:['JIPMER Karaikal'],
    467:['CAPFIMS','CAPF IMS','CAPF Institute of Medical Sciences']
  };
  function norm(v){return String(v||'').toLowerCase().replace(/&/g,' and ').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
  function words(v){return norm(v).split(' ').filter(Boolean)}
  function acronym(v){
    const w=words(v).filter(x=>!STOP.has(x));
    return w.map(x=>/^\d+$/.test(x)?'':x[0]).join('').toUpperCase();
  }
  function acronymCompact(v){
    const raw=String(v||'').replace(/\([^)]*\)/g,' ');
    const w=raw.match(/[A-Za-z0-9]+/g)||[];
    return w.filter(x=>!STOP.has(x.toLowerCase())).map(x=>x.length===1?x.toUpperCase():x[0].toUpperCase()).join('');
  }
  function mainSegments(name){
    const first=String(name||'').split(',')[0].trim();
    const out=new Set([first]);
    [' & ',' and Dr. ',' and Dr ',' and '].forEach(sep=>{if(first.includes(sep))out.add(first.split(sep)[0].trim())});
    return [...out].filter(Boolean);
  }
  function autoAliases(c){
    if(!c)return [];
    const out=new Set();
    const name=String(c.name||''); const city=String(c.city||'');
    const parens=[...name.matchAll(/\(([^)]+)\)/g)].map(m=>m[1].trim()).filter(Boolean);
    parens.forEach(x=>out.add(x));
    for(const seg of mainSegments(name)){
      const a=acronym(seg); const b=acronymCompact(seg);
      if(a.length>=2&&a.length<=12)out.add(a);
      if(b.length>=2&&b.length<=12)out.add(b);
      // Common generic-college short forms become useful when paired with location.
      if(city){if(a)out.add(`${a} ${city}`);if(b)out.add(`${b} ${city}`)}
    }
    // Common generic institutional prefixes.
    const n=norm(name);
    if(n.includes('government medical college')&&city){out.add('GMC');out.add(`GMC ${city}`)}
    if(n.includes('government medical college and hospital')&&city){out.add('GMCH');out.add(`GMCH ${city}`)}
    if(n.includes('all india institute of medical sciences')&&city){out.add('AIIMS');out.add(`AIIMS ${city}`)}
    if(n.includes('employees state insurance')||n.includes('esic')){out.add('ESIC');if(city)out.add(`ESIC ${city}`)}
    if(n.includes('employees state insurance corporation')){out.add('ESIC');if(city)out.add(`ESIC ${city}`)}
    if(n.includes('government institute of medical sciences')&&city){out.add('GIMS');out.add(`GIMS ${city}`)}
    if(n.includes('rajiv gandhi institute of medical sciences')&&city){out.add('RIMS');out.add(`RIMS ${city}`);out.add('RGIMS');out.add(`RGIMS ${city}`)}
    return [...out];
  }
  function aliases(c){
    const out=new Set([...(MANUAL[Number(c?.id)]||[]),...autoAliases(c)]);
    return [...out].filter(Boolean);
  }
  function text(c){return [c?.name,c?.city,c?.state,c?.type,...aliases(c)].filter(Boolean).join(' ')}
  function matches(c,q){
    const nq=norm(q);if(!nq)return true;
    const hay=norm(text(c));
    return nq.split(' ').every(t=>hay.includes(t));
  }
  function score(c,q){
    const nq=norm(q);if(!nq)return 0;
    const name=norm(c?.name),city=norm(c?.city),state=norm(c?.state);
    const manual=(MANUAL[Number(c?.id)]||[]).map(norm);
    const aa=aliases(c).map(norm);
    let s=0;
    if(name===nq)s=Math.max(s,140); else if(name.startsWith(nq))s=Math.max(s,105); else if(name.includes(nq))s=Math.max(s,70);
    manual.forEach(a=>{if(a===nq)s=Math.max(s,240);else if(a.startsWith(nq))s=Math.max(s,165);else if(a.includes(nq))s=Math.max(s,130)});
    aa.forEach(a=>{if(a===nq)s=Math.max(s,180);else if(a.startsWith(nq))s=Math.max(s,125);else if(a.includes(nq))s=Math.max(s,95)});
    if(city===nq)s=Math.max(s,50);else if(city.startsWith(nq))s=Math.max(s,40);
    if(state===nq)s=Math.max(s,35);else if(state.startsWith(nq))s=Math.max(s,25);
    if(matches(c,q))s=Math.max(s,20);
    return s;
  }
  window.COLLEGE_SEARCH_ALIASES=MANUAL;
  window.collegeAliases=aliases;
  window.collegeSearchText=text;
  window.collegeSearchMatches=matches;
  window.collegeSearchScore=score;
  window.collegeSearchNormalize=norm;
})();
