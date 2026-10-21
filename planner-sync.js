(function(root){
 'use strict';
 const core=typeof module==='object'&&module.exports?require('./planner-core.js'):root.WeddingPlanner;
 const clone=v=>JSON.parse(JSON.stringify(v));
 const nonempty=p=>p.items.length||p.stages.length||p.contributions.length||p.budget||p.target;
 class SharedPlanner{
  constructor({remote,userId,storage,onChange=()=>{},schedule=setTimeout,cancel=clearTimeout}){
   this.remote=remote;this.userId=userId;this.storage=storage;this.onChange=onChange;this.schedule=schedule;this.cancel=cancel;this.key='wedding-planner-shared-v1:'+userId;this.stopped=false;this.timer=null;this.id=null;this.change=0;
   this.state={plan:core.blank(),revision:null,dirty:false,busy:false,ready:false,shared:false,conflict:false,localFailure:false,recovery:null,message:'A ligar ao planeamento partilhado…'};
  }
  emit(){if(!this.stopped)this.onChange(clone(this.state));}
  readCache(key){try{const s=JSON.parse(this.storage.getItem(key)||'null');if(s?.plan){core.validate(s.plan);return s;}}catch{}return null;}
  persist(){try{this.storage.setItem(this.key,JSON.stringify({plan:this.state.plan,revision:this.state.revision,dirty:this.state.dirty,id:this.id,conflict:this.state.conflict}));this.state.localFailure=false;}catch{this.state.localFailure=true;}}
  backup(){this.storage.setItem(this.key+':backup:'+Date.now(),JSON.stringify({plan:this.state.plan,revision:this.state.revision,dirty:this.state.dirty,id:this.id}));}
  queue(){if(this.timer)this.cancel(this.timer);if(!this.stopped&&this.state.shared&&!this.state.conflict)this.timer=this.schedule(()=>this.flush(),650);}
  async load(){
   const cache=this.readCache(this.key),legacy=this.readCache('wedding-planner-v1:'+this.userId),browser=this.readCache('wedding-planner-v1:local');
   if(cache){this.state.plan=clone(cache.plan);this.state.dirty=!!cache.dirty;this.state.revision=cache.revision;this.state.conflict=!!cache.conflict;this.id=cache.id;}
   this.state.recovery=legacy&&nonempty(legacy.plan)?legacy.plan:browser&&nonempty(browser.plan)?browser.plan:null;
   const startChange=this.change;this.emit();
   try{
    if(!this.userId||!this.remote)throw Error('Entre na conta para partilhar o planeamento.');
    const row=await this.remote.read();if(this.stopped)return;if(!row)throw Error('Esta conta não tem acesso ao plano partilhado.');core.validate(row.content);
    this.state.shared=true;
    if(this.change!==startChange){
     this.id=row.id;if(this.state.revision!==row.revision&&!(this.state.revision===null&&!nonempty(row.content))){this.state.conflict=true;this.state.message='Há uma versão partilhada diferente. A cópia local mantém-se preservada.';}else{this.state.revision=row.revision;this.state.message='Alterações locais a aguardar gravação partilhada.';}
    }else if(cache?.dirty&&cache.id==null&&!nonempty(row.content)){
     this.id=row.id;this.state.revision=row.revision;this.state.message='A recuperar as alterações locais para o plano partilhado…';
    }else if(cache?.dirty&&(cache.id!==row.id||cache.revision!==row.revision)){
     this.id=row.id;this.state.conflict=true;this.state.message='Outra versão foi guardada. A sua cópia está preservada; exporte-a ou carregue o plano partilhado.';
    }else if(cache?.dirty){this.id=row.id;this.state.message='Alterações locais a aguardar gravação partilhada.';}
    else if(!nonempty(row.content)&&legacy&&nonempty(legacy.plan)){
     this.id=row.id;this.state.plan=clone(legacy.plan);this.state.revision=row.revision;this.state.dirty=true;this.state.message='A recuperar a cópia anterior para o plano partilhado…';
    }else{this.id=row.id;this.state.plan=clone(row.content);this.state.revision=row.revision;this.state.dirty=false;this.state.conflict=false;this.state.message='Plano partilhado carregado · gravação automática activa.';}
    this.persist();
   }catch(e){if(this.stopped)return;this.state.shared=false;if(!cache&&legacy)this.state.plan=clone(legacy.plan);this.state.message=(e.message||'Sem ligação ao servidor.')+' As alterações ficam apenas neste navegador.';}
   this.state.ready=true;this.emit();if(this.state.dirty)this.queue();
  }
  save(plan){
   if(!this.state.ready)throw Error('Aguarde o carregamento do plano antes de guardar.');
   this.state.plan=clone(core.validate(plan));this.change++;this.state.dirty=true;this.persist();
   this.state.message=this.state.conflict?'Conflito de versões. Cópia local preservada; não foi substituído o plano partilhado.':this.state.shared?'A guardar no plano partilhado…':'Guardado só neste navegador · sem ligação ao plano partilhado.';
   if(this.state.localFailure)this.state.message='Não foi possível criar a cópia local. Exporte o plano antes de sair.';
   this.emit();this.queue();
  }
  async upgrade(){
   if(!this.state.ready||this.state.busy||this.state.dirty||this.state.conflict)throw Error('Sincronize o plano e resolva alterações pendentes antes de activar as peças.');
   if(!this.remote?.canUpgrade||!await this.remote.canUpgrade())throw Error('A preparação do servidor ainda não está disponível.');
   if(this.stopped)throw Error('A conta mudou. Volte a abrir o plano.');
   this.backup();this.save(core.upgradePlan(this.state.plan));await this.flush();
  }
  async flush(){
   if(this.stopped||this.state.busy||this.state.conflict||!this.state.dirty)return;
   if(!this.state.shared||!this.id){this.state.message='Ainda não foi guardado no servidor. Cópia apenas neste navegador.';this.emit();return;}
   this.state.busy=true;this.state.message='A guardar no plano partilhado…';this.emit();const payload=clone(this.state.plan),revision=this.state.revision;
   try{
    const row=await this.remote.write(this.id,revision,payload);if(this.stopped)return;
    if(!row){this.state.conflict=true;this.state.message='Outra conta alterou o plano. A sua cópia está preservada; carregue a versão partilhada antes de continuar.';this.persist();}
    else{this.state.revision=row.revision;this.state.dirty=JSON.stringify(payload)!==JSON.stringify(this.state.plan);this.persist();this.state.message=this.state.dirty?'Há alterações novas a guardar.':'Guardado no plano partilhado · disponível nas duas contas.';}
   }catch{if(!this.stopped){this.state.message='Não foi possível guardar no servidor. Cópia local preservada; voltaremos a tentar.';this.persist();}}
   finally{this.state.busy=false;this.emit();}
   if(this.state.dirty&&!this.state.conflict&&this.state.message==='Há alterações novas a guardar.')this.queue();
  }
  async refresh(){
   if(this.stopped||this.state.busy||!this.state.ready||this.state.conflict)return;
   if(!this.state.shared){await this.load();return;}if(this.state.dirty){await this.flush();return;}
   const revision=this.state.revision,change=this.change;
   try{const row=await this.remote.read();if(this.stopped||this.state.dirty||this.state.busy||this.state.revision!==revision||this.change!==change||!row)return;if(row.revision>this.state.revision){this.state.plan=clone(core.validate(row.content));this.state.revision=row.revision;this.persist();this.state.message='Plano actualizado com as alterações da outra conta.';this.emit();}}catch{}
  }
  async reloadRemote(){
   if(this.state.busy)return;this.backup();this.state.busy=true;this.state.ready=false;this.emit();
   try{const row=await this.remote.read();if(this.stopped)return;if(!row)throw Error('Sem acesso ao plano partilhado.');
    this.state.plan=clone(core.validate(row.content));this.id=row.id;this.state.revision=row.revision;this.state.dirty=false;this.state.conflict=false;this.state.shared=true;this.persist();this.state.message='Versão partilhada carregada. A cópia anterior foi preservada neste navegador.';
   }finally{this.state.busy=false;this.state.ready=true;this.emit();}
  }
  dispose(){this.stopped=true;if(this.timer)this.cancel(this.timer);}
 }
 const api={SharedPlanner};if(typeof module==='object'&&module.exports)module.exports=api;else root.WeddingPlannerSync=api;
})(typeof window==='undefined'?globalThis:window);
