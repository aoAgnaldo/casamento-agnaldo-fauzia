(function(root){
 'use strict';
 async function compressPhoto(file){
 const bitmap=await createImageBitmap(file);try{
 const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
 for(const quality of [.85,.7,.55,.4]){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(blob?.type==='image/webp'&&blob.size<=1048576)return blob;}
 throw Error('Não foi possível reduzir a fotografia a 1 MB. Escolha outra imagem.');
 }finally{bitmap.close();}
 }
 function indexedStore(){
 let connection;
 async function db(){if(!connection)connection=new Promise((resolve,reject)=>{const r=indexedDB.open('wedding-planner-media-v2',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return connection;}
 async function run(mode,action){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('photos',mode),r=action(tx.objectStore('photos'));tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Local storage unavailable'));});}
 return {put:r=>run('readwrite',s=>s.put(r)),get:id=>run('readonly',s=>s.get(id)),remove:id=>run('readwrite',s=>s.delete(id)),all:()=>run('readonly',s=>s.getAll())};
 }
 class MediaQueue{
 constructor({store=indexedStore(),compress=compressPhoto,currentUser,transport,uuid=()=>crypto.randomUUID()}){Object.assign(this,{store,compress,currentUser,transport,uuid});}
 async stagePhoto({userId,planId,itemId,componentId,file}){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Escolha uma fotografia JPEG, PNG ou WebP.');
 if(file.size>15*1024*1024)throw Error('A fotografia deve ter até 15 MB.');
 if(userId!==this.currentUser())throw Error('A conta mudou.');
 for(const value of [planId,itemId,componentId||'conjunto'])if(!/^[-a-zA-Z0-9_]+$/.test(value))throw Error('Identidade da fotografia inválida.');
 const blob=await this.compress(file);if(!blob||blob.type!=='image/webp'||blob.size>1048576)throw Error('Falha ao comprimir a fotografia.');
 if(userId!==this.currentUser())throw Error('A conta mudou.');
 const id=this.uuid(),row={id,userId,planId,itemId,componentId,blob,path:planId+'/'+itemId+'/'+(componentId||'conjunto')+'/'+this.uuid()+'.webp'};
 try{await this.store.put(row);}catch{throw Error('A fotografia não foi guardada neste dispositivo. Mantenha o ficheiro original e tente novamente.');}return id;
 }
 async uploadPhoto(id){const row=await this.store.get(id);if(!row)throw Error('Fotografia pendente não encontrada.');if(row.userId!==this.currentUser())throw Error('A conta mudou.');if(!row.uploaded){try{await this.transport.upload(row.path,row.blob);}catch(error){if(row.userId!==this.currentUser()||!this.transport.verify||!await this.transport.verify(row.path,row.blob))throw error;}if(row.userId!==this.currentUser())throw Error('A conta mudou.');row.uploaded=true;await this.store.put(row);}return {path:row.path};}
 async pending(userId,planId){return (await this.store.all()).filter(r=>r.userId===userId&&r.planId===planId);}
 acknowledge(id){return this.store.remove(id);}
 async reconcile({userId,planId,referencedPaths}){if(userId!==this.currentUser())throw Error('A conta mudou.');const paths=new Set(referencedPaths);for(const row of await this.pending(userId,planId)){if(userId!==this.currentUser())throw Error('A conta mudou.');if(paths.has(row.path))await this.acknowledge(row.id);}}
 async photoUrl(path){const url=await this.transport.signedUrl(path);if(!/^https:\/\//.test(url))throw Error('Endereço de fotografia inválido.');return url;}
 }
 const api={MediaQueue,compressPhoto,indexedStore};if(typeof module!=='undefined')module.exports=api;else root.WeddingPlannerMedia=api;
})(typeof window==='undefined'?globalThis:window);
