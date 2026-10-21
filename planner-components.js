(function(root){
 'use strict';
 const core=typeof module!=='undefined'?require('./planner-core.js'):root.WeddingPlanner;
 const copy=x=>JSON.parse(JSON.stringify(x));
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>new Intl.NumberFormat('pt-MZ',{maximumFractionDigits:2}).format(n)+' MT';
 function supplierLinks(s={}){
 const phone=String(s?.phone||'').trim(),wa=String(s?.whatsapp||'').trim();
 const valid=v=>/^\+?[0-9 ()-]{6,25}$/.test(v);
 return {phone:valid(phone)?'tel:'+phone.replace(/[ ()-]/g,''):null,whatsapp:valid(wa)&&wa.startsWith('+')&&wa.replace(/\D/g,'').length>=10?'https://wa.me/'+wa.replace(/\D/g,''):null};
 }
 const nextPieceMode=(mode,count,isNew)=>isNew&&count===0?'components':mode||'manual';
 function componentDraft(item,id){const found=item.components.find(c=>c.id===id);return found?copy(found):null;}
 function removeComponent(item,id){const next=copy(item);next.components=next.components.filter(c=>c.id!==id);return next;}
 function commitById(items,original,next){const live=items.find(t=>t.id===original.id);if(!live)throw Error('Este conjunto já não existe no plano.');if(JSON.stringify(live)!==JSON.stringify(original))throw Error('Este conjunto foi alterado enquanto o editava. Feche e volte a abrir para ver a versão actual.');if(next.id!==original.id)throw Error('Identidade do conjunto inválida.');return copy(next);}
 function supplierPreview(s){if(!s)return '';const links=supplierLinks(s);return `<div class="wpc-supplier"><strong>${esc(s.name)}</strong>${links.phone?`<a class="wp-btn" href="${esc(links.phone)}">Ligar</a>`:''}${links.whatsapp?`<a class="wp-btn" href="${esc(links.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`:''}<p>${esc(s.address)}</p>${s.address?`<button type="button" class="wp-btn" data-copy-address="${esc(s.address)}">Copiar endereço</button>`:''}</div>`;}
 function render(item){const v=core.itemTotals(item);return `<section class="wpc-summary"><strong>${esc(item.title)}</strong><span>${(item.components||[]).length} peças · ${money(v.cost)}</span></section>`;}
 function openEditor({item,stages,onCommit,onPhotoRequest,photoUrl}){
 let draft=copy(item);draft.components=draft.components||[];
 let photoRequest=0;const original=copy(item),dialog=document.createElement('dialog');dialog.className='wp-dialog wpc-dialog';document.body.append(dialog);
 const field=(label,key,value='',attrs='')=>`<label>${label}<input name="${key}" value="${esc(value)}" ${attrs}></label>`;
 const supplier=(value,inherited)=>`<fieldset><legend>Fornecedor ${inherited?'· vazio para usar o do conjunto':''}</legend>${field('Nome','supplierName',value?.name||'','maxlength="180"')}${field('Telefone','supplierPhone',value?.phone||'','type="tel" maxlength="180"')}${field('WhatsApp · inclua + e código do país','supplierWhatsapp',value?.whatsapp||'','type="tel" placeholder="+258…" maxlength="180"')}${field('Endereço','supplierAddress',value?.address||'','maxlength="1000"')}</fieldset>`;
 const readSupplier=f=>{const s={name:String(f.get('supplierName')||'').trim(),phone:String(f.get('supplierPhone')||'').trim(),whatsapp:String(f.get('supplierWhatsapp')||'').trim(),address:String(f.get('supplierAddress')||'').trim()};return Object.values(s).some(Boolean)?s:null;};
 function close(){photoRequest++;dialog.close();dialog.remove();}
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('click',async e=>{const b=e.target.closest('[data-copy-address]');if(b)try{await navigator.clipboard.writeText(b.dataset.copyAddress);b.textContent='Endereço copiado';}catch{dialog.querySelector('.wp-error').textContent='Não foi possível copiar. Seleccione o endereço apresentado.';}});
 function show(content,submit){photoRequest++;dialog.innerHTML=`<form class="wp-form"><header><div><p class="wp-kicker">CONJUNTO E PEÇAS</p><h2>${esc(draft.title)}</h2></div><button type="button" data-action="close" aria-label="Fechar">×</button></header>${content}<p class="wp-error" role="alert"></p><footer><button class="wp-btn wp-primary" type="submit">Guardar</button><button class="wp-btn" type="button" data-action="cancel">Cancelar</button></footer></form>`;dialog.querySelector('[data-action="close"]').onclick=close;dialog.querySelector('[data-action="cancel"]').onclick=close;dialog.querySelector('form').onsubmit=e=>{e.preventDefault();try{submit(new FormData(e.target));}catch(err){dialog.querySelector('.wp-error').textContent=err.message;}};if(!dialog.open)dialog.showModal();}
 function validateDraft(){core.validate({version:2,stages,items:[draft],contributions:[],budget:0,target:0});}
 function overview(){
 const v=core.itemTotals(draft);
 show(`<p>As peças são somadas no conjunto. O pagamento continua registado no conjunto.</p><div class="wpc-totals"><strong>${money(v.cost)}</strong><span>Pago ${money(v.paid)} · por pagar ${money(v.due)}</span></div><label>Como calcular o preço<select name="pricingMode"><option value="manual" ${draft.pricingMode!=='components'?'selected':''}>Valores manuais do conjunto</option><option value="components" ${draft.pricingMode==='components'?'selected':''}>Somar as peças</option></select></label><p>Valores manuais preservados: previsto ${money(draft.estimate)}, custo ${draft.actual===null?'por confirmar':money(draft.actual)}.</p><section class="wpc-list">${draft.components.map(c=>`<article><div><strong>${esc(c.title)}</strong><small>${c.quantity} ${esc(c.unit)} · ${money(core.lineAmountCents(c.quantity,c.finalUnitCents??c.estimatedUnitCents)/100)}${!c.supplierDetails?' · fornecedor do conjunto':''}</small></div><button type="button" class="wp-btn" data-piece="${esc(c.id)}">Editar</button><button type="button" class="wp-btn wp-danger" data-remove="${esc(c.id)}" aria-label="Eliminar ${esc(c.title)}">×</button></article>`).join('')||'<p>Ainda sem peças. Em modo de peças, o conjunto vazio vale zero.</p>'}</section><button type="button" class="wp-btn" data-add>＋ Adicionar peça</button>${supplier(draft.supplierDetails,false)}${supplierPreview(draft.supplierDetails)}${onPhotoRequest?'<button type="button" class="wp-btn" data-photo>Escolher fotografia do conjunto</button>':''}`,f=>{
 const mode=String(f.get('pricingMode'));if(mode==='manual'&&draft.pricingMode==='components'&&!confirm('Voltar aos valores manuais apresentados? Os preços das peças ficam preservados mas deixam de entrar no total.'))return;
 draft.pricingMode=mode;draft.supplierDetails=readSupplier(f);validateDraft();onCommit(copy(draft),original);close();
 });
 const capture=()=>{const f=new FormData(dialog.querySelector('form'));draft.supplierDetails=readSupplier(f);};
 dialog.querySelector('[name="pricingMode"]').onchange=e=>{const mode=e.target.value;if(mode==='manual'&&draft.pricingMode==='components'&&!confirm('Voltar aos valores manuais apresentados? As peças ficam preservadas, mas deixam de entrar no total.')){e.target.value=draft.pricingMode;return;}capture();draft.pricingMode=mode;overview();};
 dialog.querySelector('[data-add]').onclick=()=>{capture();if(draft.components.length>=200){dialog.querySelector('.wp-error').textContent='Máximo de 200 peças por conjunto.';return;}piece();};
 dialog.querySelectorAll('[data-piece]').forEach(b=>b.onclick=()=>{capture();piece(b.dataset.piece);});
 dialog.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const c=draft.components.find(x=>x.id===b.dataset.remove);if(confirm('Eliminar a peça “'+c.title+'”?')){capture();draft=removeComponent(draft,c.id);overview();}});
 dialog.querySelector('[data-photo]')?.addEventListener('click',()=>{capture();const request=++photoRequest;onPhotoRequest({itemId:draft.id,componentId:null,onReady:path=>{if(dialog.isConnected&&request===photoRequest){capture();draft.photoPath=path;overview();}}}).catch(e=>{dialog.querySelector('.wp-error').textContent=e.message;});});
 showPhotos();
 }
 function piece(id){
 const existing=componentDraft(draft,id),c=existing||{id:crypto.randomUUID(),title:'',quantity:1,unit:'unidade',estimatedUnitCents:0,finalUnitCents:null,notes:'',supplierDetails:null,photoPath:null};
 show(`<h3>${existing?'Editar peça':'Nova peça'}</h3>${field('Nome','title',c.title,'required maxlength="180"')}<div class="wp-form-grid">${field('Quantidade','quantity',c.quantity,'type="number" required min="0.001" step="0.001"')}${field('Unidade','unit',c.unit,'maxlength="80"')}${field('Preço previsto por unidade (MT)','estimate',c.estimatedUnitCents/100,'type="number" required min="0" step="0.01"')}${field('Preço final por unidade (MT) · opcional','final',c.finalUnitCents===null?'':c.finalUnitCents/100,'type="number" min="0" step="0.01"')}</div>${supplier(c.supplierDetails,true)}${supplierPreview(c.supplierDetails||draft.supplierDetails)}<label>Notas<textarea name="notes" maxlength="5000" rows="3">${esc(c.notes)}</textarea></label>${onPhotoRequest?'<button type="button" class="wp-btn" data-piece-photo>Escolher fotografia desta peça</button><span data-photo-status></span>':''}<p>Ao guardar a primeira peça, o preço do conjunto passa a ser calculado pelas peças. Os valores manuais são preservados.</p>`,f=>{
 const next={...c,title:String(f.get('title')).trim(),quantity:Number(f.get('quantity')),unit:String(f.get('unit')),estimatedUnitCents:Math.round(Number(f.get('estimate'))*100),finalUnitCents:f.get('final')===''?null:Math.round(Number(f.get('final'))*100),notes:String(f.get('notes')),supplierDetails:readSupplier(f),photoPath:c.photoPath};
 const previous=copy(draft),mode=nextPieceMode(draft.pricingMode,draft.components.length,!existing);if(existing)core.updateRecord(draft.components,next);else draft.components.push(next);draft.pricingMode=mode;try{validateDraft();}catch(e){draft=previous;throw e;}overview();
 });
 const view=++photoRequest;
 dialog.querySelector('[data-piece-photo]')?.addEventListener('click',()=>{const request=++photoRequest;onPhotoRequest({itemId:draft.id,componentId:c.id,onReady:path=>{if(dialog.isConnected&&request===photoRequest){c.photoPath=path;dialog.querySelector('[data-photo-status]').textContent='Fotografia pronta. Guarde a peça e depois o conjunto.';}}}).catch(e=>{dialog.querySelector('.wp-error').textContent=e.message;});});
 dialog.querySelector('[data-action="cancel"]').onclick=()=>{photoRequest++;overview();};
 }
 function showPhotos(){
  if(!photoUrl)return;const request=++photoRequest,holder=document.createElement('div');holder.className='wpc-photos';dialog.querySelector('footer').before(holder);
  for(const entry of [draft,...draft.components].filter(t=>t.photoPath))photoUrl(entry.photoPath).then(url=>{if(!dialog.isConnected||request!==photoRequest)return;const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=url;img.alt='Fotografia de '+entry.title;caption.textContent=entry.title;figure.append(img,caption);holder.append(figure);}).catch(()=>{if(request===photoRequest&&dialog.isConnected){const text=document.createElement('p');text.textContent='Fotografia temporariamente indisponível. A referência foi preservada.';holder.append(text);}});
 }
 overview();return {close};
 }
 const api={supplierLinks,removeComponent,componentDraft,nextPieceMode,commitById,render,openEditor};if(typeof module!=='undefined')module.exports=api;else root.WeddingPlannerComponents=api;
})(typeof window!=='undefined'?window:globalThis);
