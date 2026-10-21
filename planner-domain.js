(function(root){
 'use strict';
 const core=typeof module==='object'&&module.exports?require('./planner-core.js'):root.WeddingPlanner;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const newItem=({id,stage=''})=>({id,title:'',stage,kind:'task',status:'todo',priority:'normal',owner:'',due:'',estimate:0,actual:null,paid:0,ceiling:0,quantity:1,unit:'',supplier:'',notes:'',subtasks:[],pricingMode:'manual',components:[],supplierDetails:null,photoPath:null});
 function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const d=new Date(s+'T12:00:00');return Number.isFinite(+d)&&[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')===s;}
 function addDays(s,n){if(!validDate(s))throw Error('Data inválida.');const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
 const byDate=(a,b)=>(a.due||'9999').localeCompare(b.due||'9999')||a.id.localeCompare(b.id);
 function agendaGroups(p,today){const g={late:[],today:[],week:[],later:[],undated:[]},end=addDays(today,7);for(const t of p.items.filter(t=>t.status!=='done').slice().sort(byDate)){const key=!validDate(t.due)?'undated':t.due<today?'late':t.due===today?'today':t.due<=end?'week':'later';g[key].push(t);}return g;}
 function financialSummary(p){const v=core.total(p),configured=p.budgetConfigured??p.budget>0;return {...v,budget:p.budget,budgetConfigured:configured,balance:configured?p.budget-v.cost:null,overpaid:Math.round(p.items.reduce((a,t)=>a+Math.max(0,core.itemTotals(t).paid-core.itemTotals(t).cost),0)*100)/100};}
 function stageRows(p){return [...p.stages,{id:'',name:'Sem etapa'}].map(s=>{const items=p.items.filter(t=>(t.stage||'')===s.id);return {...s,items,...core.stageTotals(p,s.id),count:items.length};}).filter(s=>s.id||s.count);}
 function summary(p,today){const g=agendaGroups(p,today);return {attention:[...g.late,...g.today,...g.week].slice(0,5),next:[...g.late,...g.today,...g.week,...g.later][0]||null,done:p.items.filter(t=>t.status==='done').length,count:p.items.length,finance:financialSummary(p)};}
 function supplierLinks(s={}){const clean=x=>String(x||'').trim(),phone=clean(s?.phone),wa=clean(s?.whatsapp),valid=x=>/^\+?[0-9 ()-]{6,25}$/.test(x);return {phone:valid(phone)?'tel:'+phone.replace(/[ ()-]/g,''):null,whatsapp:valid(wa)&&wa.startsWith('+')&&wa.replace(/\D/g,'').length>=10?'https://wa.me/'+wa.replace(/\D/g,''):null};}
 const beginDraft=clone;
 function validateItem(item){return core.validate({version:2,stages:item.stage?[{id:item.stage,name:item.stage}]:[],items:[item],contributions:[],budget:0,target:0});}
 function applyPiece(item,piece){const next=clone(item),index=(next.components||[]).findIndex(c=>c.id===piece.id);next.components=next.components||[];if(index<0){if(!next.components.length)next.pricingMode='components';next.components.push(clone(piece));}else next.components[index]=clone(piece);validateItem({...next,title:next.title||'Rascunho'});return next;}
 function removePiece(item,id){const next=clone(item);next.components=(next.components||[]).filter(c=>c.id!==id);return next;}
 function commitDraft({livePlan,baseItem,draft}){const next=clone(livePlan),live=next.items.find(t=>t.id===draft.id);if(baseItem){if(!live)throw Error('Este item já não existe. O rascunho mantém-se disponível.');if(JSON.stringify(live)!==JSON.stringify(baseItem))throw Error('Este item foi alterado pela outra conta. Preserve o rascunho e consulte a versão partilhada.');if(baseItem.id!==draft.id)throw Error('Identidade inválida.');}else if(live)throw Error('Já existe um item com esta identidade.');validateItem(draft);if(live)next.items[next.items.findIndex(t=>t.id===draft.id)]=clone(draft);else next.items.push(clone(draft));return core.validate(next);}
 function moveStageItems(plan,id){const next=clone(plan);next.items.forEach(t=>{if(t.stage===id)t.stage='';});next.stages=next.stages.filter(s=>s.id!==id);return core.validate(next);}
 const api={clone,newItem,validDate,addDays,agendaGroups,financialSummary,stageRows,summary,supplierLinks,beginDraft,applyPiece,removePiece,commitDraft,moveStageItems};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.WeddingPlannerDomain=api;
})(typeof window==='undefined'?globalThis:window);
