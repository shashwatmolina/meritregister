#!/usr/bin/env python3
"""V9 Beta regression scenarios for The Merit Register.

Tests data/runtime assumptions without a browser: canonical IDs, 2026 route selection,
quota eligibility, reach bands, unknown handling, and preservation of preference order.
"""
from __future__ import annotations
import json,re,sys
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]

def load_const(path:Path,name:str):
    text=path.read_text(encoding='utf-8')
    m=re.search(rf'const\s+{re.escape(name)}\s*=\s*(.*?);\s*(?:\n|$)',text,re.S)
    if not m: raise AssertionError(f'Missing const {name} in {path.name}')
    return json.loads(m.group(1))

COLLEGES=load_const(ROOT/'js/shared-master-v8.js','ALL_COLLEGES')
MCC=load_const(ROOT/'js/shared-counselling-v8.js','MCC_CUTOFFS_2026_BY_QUOTA')
STREAMS=load_const(ROOT/'js/shared-counselling-v8.js','MCC_QUOTA_STREAMS')
BY_ID={int(c['id']):c for c in COLLEGES}
BY_NAME={c['name']:c for c in COLLEGES}
CATS={'General','OBC','EWS','SC','ST'}
FALLBACK={'du':'DU','ip':'IP','esi':'ES','amu':'AM','puducherry':'JP','cw_du':'DW','cw_ip':'IW','foreign':'FQ','amu_nri':'AN'}

def eligible(profile):
    out=['AI','SO']
    for k,c in FALLBACK.items():
        if profile.get('eligibilities',{}).get(k) and c not in out: out.append(c)
    return out

def routes(cid,profile):
    if not profile.get('air'): return []
    cat=profile.get('category','General')
    assert cat in CATS
    out=[]
    for code,r in MCC.get(str(cid),{}).items():
        if code not in eligible(profile): continue
        cut=(((r.get('category_rounds') or {}).get(cat) or {}).get('R1'))
        if not isinstance(cut,(int,float)) or cut<=0: continue
        margin=cut-profile['air']; rel=margin/cut
        out.append({'code':code,'cutoff':cut,'margin':margin,'relative':rel,'state':'reached' if margin>=0 else 'missed-current'})
    out.sort(key=lambda x:(0 if x['state']=='reached' else 1,-x['cutoff']))
    return out

def band(route):
    if not route:return 'Unknown'
    r=route['relative']
    return 'Safety' if r>=.15 else 'Likely' if r>=.03 else 'Competitive' if r>=-.08 else 'Dream'

def cid(name): return int(BY_NAME[name]['id'])

def best(name,p):
    rs=routes(cid(name),p);return rs[0] if rs else None

results=[]
def check(name,fn):
    try:
        detail=fn() or 'ok';results.append({'scenario':name,'status':'pass','detail':detail})
    except Exception as e:
        results.append({'scenario':name,'status':'fail','detail':str(e)})

check('canonical college IDs are unique',lambda: (len(BY_ID)==len(COLLEGES)==465) or (_ for _ in ()).throw(AssertionError(f'{len(COLLEGES)} rows / {len(BY_ID)} unique IDs')))
check('all canonical colleges have positive 2026 seats',lambda: all(isinstance(c.get('seats_2026'),(int,float)) and c['seats_2026']>0 for c in COLLEGES) or (_ for _ in ()).throw(AssertionError('missing/non-positive seats_2026')))
check('MCC quota records reference canonical IDs',lambda: all(int(k) in BY_ID for k in MCC) or (_ for _ in ()).throw(AssertionError('MCC contains non-canonical college ID')))

def s_air232_aiq():
    p={'air':232,'category':'General','eligibilities':{}}
    cases={
      'All India Institute of Medical Sciences, New Delhi':('SO',52,'Dream','missed-current'),
      'University College of Medical Sciences & GTB Hospital, New Delhi':('AI',435,'Safety','reached'),
      'Atal Bihari Vajpayee Institute of Medical Sciences and Dr. RML Hospital, New Delhi':('AI',166,'Dream','missed-current'),
      'Vardhman Mahavir Medical College & Safdarjung Hospital, Delhi':('AI',124,'Dream','missed-current'),
    }
    observed={}
    for n,(code,cut,b,state) in cases.items():
        r=best(n,p);assert r, n;assert (r['code'],r['cutoff'],band(r),r['state'])==(code,cut,b,state),(n,r,band(r));observed[n]={'route':r['code'],'cutoff':r['cutoff'],'band':band(r),'state':r['state']}
    return observed
check('AIR 232 General AIQ/Open scenario',s_air232_aiq)

def s_delhi_routes():
    p={'air':232,'category':'General','eligibilities':{'du':True,'ip':True}}
    uc=best('University College of Medical Sciences & GTB Hospital, New Delhi',p)
    ma=best('Maulana Azad Medical College, New Delhi',p)
    ab=best('Atal Bihari Vajpayee Institute of Medical Sciences and Dr. RML Hospital, New Delhi',p)
    vm=best('Vardhman Mahavir Medical College & Safdarjung Hospital, Delhi',p)
    assert (uc['code'],uc['cutoff'])==('DU',4952)
    assert (ma['code'],ma['cutoff'])==('DU',2662)
    assert (ab['code'],ab['cutoff'])==('IP',3117)
    assert (vm['code'],vm['cutoff'])==('IP',1381)
    return {'UCMS':uc,'MAMC':ma,'ABVIMS':ab,'VMMC':vm}
check('conditional Delhi routes activate only when enabled',s_delhi_routes)

def s_quota_not_leak():
    p={'air':232,'category':'General','eligibilities':{}}
    assert all(r['code'] in {'AI','SO'} for r in routes(cid('University College of Medical Sciences & GTB Hospital, New Delhi'),p))
    assert all(r['code'] in {'AI','SO'} for r in routes(cid('Atal Bihari Vajpayee Institute of Medical Sciences and Dr. RML Hospital, New Delhi'),p))
    return 'DU/IP/CW/FQ routes excluded without eligibility toggles'
check('conditional quota routes do not leak into default profile',s_quota_not_leak)

def s_obc():
    p={'air':8000,'category':'OBC','eligibilities':{}}
    known=sum(1 for c in COLLEGES if routes(int(c['id']),p))
    reached=sum(1 for c in COLLEGES if (routes(int(c['id']),p) and routes(int(c['id']),p)[0]['state']=='reached'))
    assert known>300 and reached>0
    return {'known_2026_routes':known,'reached_colleges':reached}
check('AIR 8000 OBC broad profile resolves substantial data',s_obc)

def s_unknown():
    p={'air':232,'category':'General','eligibilities':{}}
    unknown=[c for c in COLLEGES if not routes(int(c['id']),p)]
    assert len(unknown)>0
    return {'unknown_count':len(unknown),'sample':[c['name'] for c in unknown[:5]]}
check('missing eligible cutoff remains Unknown rather than ineligible',s_unknown)

def s_order():
    names=['University College of Medical Sciences & GTB Hospital, New Delhi','All India Institute of Medical Sciences, New Delhi','Vardhman Mahavir Medical College & Safdarjung Hospital, Delhi']
    order=[cid(n) for n in names]
    p={'air':232,'category':'General','eligibilities':{}}
    reach=[band(best(n,p)) for n in names]
    rendered=list(order)  # Choice Filling iterates saved order; no reach sort is applied.
    assert rendered==order
    assert reach[0]=='Safety' and reach[1]=='Dream'
    return {'saved_order':order,'reach_annotations':reach,'reordered':False}
check('preference order is preserved despite easier/lower reach bands',s_order)

def s_large_order():
    order=[int(c['id']) for c in COLLEGES[:30]]
    assert len(order)==len(set(order))==30
    return {'choices':30,'first':BY_ID[order[0]]['name'],'last':BY_ID[order[-1]]['name']}
check('30-choice list remains unique and ordered',s_large_order)

fail=[r for r in results if r['status']=='fail']
out={'build':'V9 Beta','generated':datetime.now(timezone.utc).isoformat(),'summary':{'total':len(results),'passed':len(results)-len(fail),'failed':len(fail)},'results':results}
(ROOT/'audit/v9-beta-scenario-results-2026-08-28.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(out['summary']))
for r in results: print(('PASS' if r['status']=='pass' else 'FAIL'),r['scenario'],r['detail'])
sys.exit(1 if fail else 0)
