(function(root){
 const blank=()=>({version:1,stages:[],items:[],contributions:[],budget:0,target:0});
 const total=p=>({estimate:p.items.reduce((a,t)=>a+t.estimate,0),cost:p.items.reduce((a,t)=>a+(t.actual===null?t.estimate:t.actual),0),paid:p.items.reduce((a,t)=>a+t.paid,0),due:p.items.reduce((a,t)=>a+Math.max(0,(t.actual===null?t.estimate:t.actual)-t.paid),0),saved:p.contributions.reduce((a,c)=>a+c.amount,0),done:p.items.filter(t=>t.status==='done').length});
 function validate(p){
 if(!p||p.version!==1||!Array.isArray(p.stages)||!Array.isArray(p.items)||!Array.isArray(p.contributions))throw Error('Cópia de planeamento inválida.');
 const ids=new Set();for(const x of [...p.stages,...p.items,...p.contributions]){if(!x||typeof x.id!=='string'||ids.has(x.id))throw Error('Registos inválidos ou duplicados.');ids.add(x.id);}
 for(const x of p.stages)if(typeof x.name!=='string'||!x.name.trim())throw Error('Etapa sem nome.');
 for(const t of p.items){if(typeof t.title!=='string'||!t.title.trim()||!['todo','doing','waiting','done'].includes(t.status)||!['task','purchase','service'].includes(t.kind)||!Array.isArray(t.subtasks)||(t.stage&&!p.stages.some(s=>s.id===t.stage)))throw Error('Tarefa inválida.');for(const k of ['estimate','ceiling','paid','quantity'])if(!Number.isFinite(t[k])||t[k]<0)throw Error('Valor inválido.');if(t.actual!==null&&(!Number.isFinite(t.actual)||t.actual<0))throw Error('Custo final inválido.');for(const s of t.subtasks)if(typeof s.title!=='string'||typeof s.done!=='boolean')throw Error('Subtarefa inválida.');}
 for(const c of p.contributions)if(typeof c.name!=='string'||!Number.isFinite(c.amount)||c.amount<=0||typeof c.date!=='string')throw Error('Contribuição inválida.');
 for(const k of ['budget','target'])if(!Number.isFinite(p[k])||p[k]<0)throw Error('Meta inválida.');return p;
 }
 function updateRecord(list,record){const index=list.findIndex(x=>x.id===record.id);if(index<0)throw Error('Este registo já não existe no plano. Feche e volte a abrir.');list[index]=record;}
 const api={blank,total,validate,updateRecord};if(typeof module!=='undefined')module.exports=api;else root.WeddingPlanner=api;
 })(typeof window!=='undefined'?window:globalThis);
