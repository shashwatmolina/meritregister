'use strict';
const fs=require('fs'),vm=require('vm');
const root=require('path').resolve(__dirname,'..');
let passed=0,failed=0,results=[];
function test(name,fn){try{const detail=fn();results.push({name,pass:true,detail});passed++;console.log('PASS',name,detail??'');}catch(e){results.push({name,pass:false,error:e.message});failed++;console.error('FAIL',name,e.message);}}
function ctx(storageImpl){
  const store=storageImpl||(()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),_m:m};})();
  const document={readyState:'loading',addEventListener(){},getElementById(){return null},body:{dataset:{}},querySelector(){return null},querySelectorAll(){return []}};
  return vm.createContext({console,localStorage:store,document,window:{addEventListener(){}},navigator:{},location:{search:'',href:'file:///choice.html',pathname:'/choice.html'},URLSearchParams,Blob:function(){},URL:{createObjectURL(){return 'blob:x'},revokeObjectURL(){}},setTimeout(){},prompt(){},Number,String,Math,JSON,Set,Map,Object,Array,Date});
}
function run(c,file){vm.runInContext(fs.readFileSync(root+'/'+file,'utf8'),c,{filename:file});}
const master=fs.readFileSync(root+'/js/shared-master-v8.js','utf8');
const counselling=fs.readFileSync(root+'/js/shared-counselling-v8.js','utf8');

test('Choice Filling survives blocked localStorage reads',()=>{const bad={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};const c=ctx(bad);vm.runInContext(master,c);vm.runInContext(counselling,c);run(c,'js/choice.js');const p=vm.runInContext('profileC()',c);if(p.category!=='General'||p.air!==null)throw Error('fallback profile incorrect');return p;});

test('Choice order removes stale IDs and follows shortlist membership',()=>{const s=ctx();vm.runInContext(master,s);vm.runInContext(counselling,s);run(s,'js/choice.js');const ids=vm.runInContext('Object.keys(COLLEGE_BY_ID).slice(0,3).map(Number)',s);s.localStorage.setItem('shortlist',JSON.stringify([ids[0],ids[2]]));s.localStorage.setItem('preference_order',JSON.stringify([ids[0],999999,ids[1]]));vm.runInContext('loadOrderC()',s);const out=vm.runInContext('orderC.slice()',s);if(JSON.stringify(out)!==JSON.stringify([ids[0],ids[2]]))throw Error('normalized order '+JSON.stringify(out));return out;});

test('Conditional route movement is not mislabeled as AIQ movement',()=>{const c=ctx();vm.runInContext(master,c);vm.runInContext(counselling,c);run(c,'js/choice.js');const r=vm.runInContext("movementC(71,{category:'General'},{code:'DU'})",c);if(r.comparable!==false)throw Error('conditional route marked comparable');return r;});

test('AIQ/Open movement remains comparable when both years exist',()=>{const c=ctx();vm.runInContext(master,c);vm.runInContext(counselling,c);run(c,'js/choice.js');const ids=vm.runInContext('Object.keys(AIQ_CUTOFFS_2026).map(Number)',c);let found=null;for(const id of ids){const r=vm.runInContext(`movementC(${id},{category:'General'},{code:'AI'})`,c);if(r.comparable){found={id,...r};break;}}if(!found)throw Error('no comparable sample found');return found;});

test('Timeline deep-link code resolves canonical numeric college IDs',()=>{const txt=fs.readFileSync(root+'/js/timeline.js','utf8');if(!txt.includes("const c=tlCollege(raw);document.getElementById('timeline-search').value=c?c.name:raw"))throw Error('ID resolution missing');if(!txt.includes('[r.id,r.college.name'))throw Error('ID search missing');return 'numeric ID resolution + ID search present';});

test('Timeline theme storage is guarded',()=>{const txt=fs.readFileSync(root+'/js/timeline.js','utf8');if(!txt.includes('function tlGet(')||!txt.includes('function tlSet('))throw Error('safe wrappers missing');return 'safe wrappers present';});


test('Feedback reporter resolves college context without COLLEGE_BY_ID global',()=>{const txt=fs.readFileSync(root+'/js/v9-beta.js','utf8');if(!txt.includes("typeof ALL_COLLEGES!=='undefined'"))throw Error('ALL_COLLEGES fallback missing');return 'canonical ALL_COLLEGES fallback present';});

const out={build:'V9.0 RC',date:'2026-08-28',total:passed+failed,passed,failed,results};fs.writeFileSync(root+'/audit/v9-rc-regression-results-2026-08-28.json',JSON.stringify(out,null,2));process.exitCode=failed?1:0;
