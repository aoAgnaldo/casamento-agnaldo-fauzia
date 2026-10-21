(function(root){
 const blank=()=>({version:1,stages:[],items:[],contributions:[],budget:0,target:0});
 const safe=n=>{if(!Number.isSafeInteger(n)||n<0)throw Error('Valor fora do limite seguro.');return n;};
 const cents=n=>{if(!Number.isFinite(n)||n<0)throw Error('Valor monetário inválido.');return safe(Math.round(n*100));};
 const sum=xs=>xs.reduce((a,b)=>safe(a+b),0);
 function lineAmountCents(quantity,unitCents){
 if(!Number.isFinite(quantity)||quantity<=0||Math.abs(quantity*1000-Math.round(quantity*1000))>1e-7)throw Error('Quantidade inválida: use até três casas decimais.');
 const scaled=safe(Math.round(quantity*1000));safe(unitCents);const product=safe(scaled*unitCents);return safe(Math.round(product/1000));
 }
 function itemTotals(t){
 const parts=t.pricingMode==='components'?(t.components||[]):null;
 const estimate=parts?sum(parts.map(c=>lineAmountCents(c.quantity,c.estimatedUnitCents))):cents(t.estimate);
 const cost=parts?sum(parts.map(c=>lineAmountCents(c.quantity,c.finalUnitCents==null?c.estimatedUnitCents:c.finalUnitCents))):cents(t.actual===null?t.estimate:t.actual);
 const paid=cents(t.paid);return {estimate:estimate/100,cost:cost/100,paid:paid/100,due:Math.max(0,cost-paid)/100};
 }
 const total=p=>{const rows=p.items.map(itemTotals),amount=k=>sum(rows.map(t=>cents(t[k])))/100;return {estimate:amount('estimate'),cost:amount('cost'),paid:amount('paid'),due:amount('due'),saved:sum(p.contributions.map(c=>cents(c.amount)))/100,done:p.items.filter(t=>t.status==='done').length};};
 const stageTotals=(p,id)=>total({...p,items:p.items.filter(t=>t.stage===id),contributions:[]});
 function supplierValid(s){if(s==null)return;for(const k of ['name','phone','whatsapp','address'])if(typeof s[k]!=='string'||s[k].length>(k==='address'?1000:180))throw Error('Fornecedor inválido.');}
 function photoValid(path){if(path==null||path==='')return;if(typeof path!=='string'||path.length>600||!/^[-a-zA-Z0-9_]+\/[-a-zA-Z0-9_]+\/[-a-zA-Z0-9_]+\/[-a-zA-Z0-9_]+\.(webp|jpg|png)$/.test(path))throw Error('Referência de fotografia inválida.');}
 function validate(p){
 if(p&&p.budgetConfigured!==undefined&&typeof p.budgetConfigured!=='boolean')throw Error('Definição de orçamento inválida.');
 if(!p||![1,2].includes(p.version)||!Array.isArray(p.stages)||!Array.isArray(p.items)||!Array.isArray(p.contributions))throw Error('Cópia de planeamento inválida.');
 const ids=new Set();for(const x of [...p.stages,...p.items,...p.contributions]){if(!x||typeof x.id!=='string'||ids.has(x.id))throw Error('Registos inválidos ou duplicados.');ids.add(x.id);}
 for(const x of p.stages)if(typeof x.name!=='string'||!x.name.trim())throw Error('Etapa sem nome.');
 for(const t of p.items){if(typeof t.title!=='string'||!t.title.trim()||!['todo','doing','waiting','done'].includes(t.status)||!['task','purchase','service'].includes(t.kind)||!Array.isArray(t.subtasks)||(t.stage&&!p.stages.some(s=>s.id===t.stage)))throw Error('Tarefa inválida.');for(const k of ['estimate','ceiling','paid','quantity'])if(!Number.isFinite(t[k])||t[k]<0)throw Error('Valor inválido.');if(t.actual!==null&&(!Number.isFinite(t.actual)||t.actual<0))throw Error('Custo final inválido.');for(const s of t.subtasks)if(typeof s.title!=='string'||typeof s.done!=='boolean')throw Error('Subtarefa inválida.');}
 for(const t of p.items){
 if(t.pricingMode!==undefined&&!['manual','components'].includes(t.pricingMode))throw Error('Modo de preço inválido.');
 if(p.version===1&&(t.pricingMode==='components'||t.components?.length))throw Error('Active a versão de peças primeiro.');
 supplierValid(t.supplierDetails);photoValid(t.photoPath);
 if(t.components!==undefined&&(!Array.isArray(t.components)||t.components.length>200))throw Error('Máximo de 200 peças por conjunto.');
 for(const c of t.components||[]){
 if(!c||typeof c.id!=='string'||!c.id||ids.has(c.id))throw Error('Peça inválida ou duplicada.');ids.add(c.id);
 if(typeof c.title!=='string'||!c.title.trim()||c.title.length>180||typeof c.unit!=='string'||c.unit.length>80||typeof c.notes!=='string'||c.notes.length>5000)throw Error('Dados da peça inválidos.');
 lineAmountCents(c.quantity,c.estimatedUnitCents);if(c.finalUnitCents!==null)lineAmountCents(c.quantity,c.finalUnitCents);supplierValid(c.supplierDetails);photoValid(c.photoPath);
 }
 itemTotals(t);
 }
 for(const c of p.contributions)if(typeof c.name!=='string'||!Number.isFinite(c.amount)||c.amount<=0||typeof c.date!=='string')throw Error('Contribuição inválida.');
 for(const k of ['budget','target'])if(!Number.isFinite(p[k])||p[k]<0)throw Error('Meta inválida.');total(p);return p;
 }
 function updateRecord(list,record){const index=list.findIndex(x=>x.id===record.id);if(index<0)throw Error('Este registo já não existe no plano. Feche e volte a abrir.');list[index]=record;}
 function upgradePlan(input){validate(input);const p=JSON.parse(JSON.stringify(input));p.version=2;p.items=p.items.map(t=>({...t,pricingMode:t.pricingMode||'manual',components:t.components||[],supplierDetails:t.supplierDetails||null,photoPath:t.photoPath||null}));return validate(p);}
 const api={blank,total,validate,updateRecord,lineAmountCents,itemTotals,stageTotals,upgradePlan};if(typeof module!=='undefined')module.exports=api;else root.WeddingPlanner=api;
 })(typeof window!=='undefined'?window:globalThis);
