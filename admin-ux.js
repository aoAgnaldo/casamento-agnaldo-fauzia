/* v8.54 — presentation and keyboard assistance; no data writes. */
(function(){
 'use strict';
 const $=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
 const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
 const focusable=r=>all('button:not(:disabled),a[href],input:not(:disabled):not([type=hidden]),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]',r).filter(visible);
 const previous=new WeakMap();
 function modalState(modal){
  const open=!modal.classList.contains('hidden')&&visible(modal);
  modal.setAttribute('aria-hidden',String(!open));
  if(open&&!previous.has(modal)){
   previous.set(modal,document.activeElement);
   modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
   const title=$('h2,h3',modal);if(title){if(!title.id)title.id=modal.id+'-heading';modal.setAttribute('aria-labelledby',title.id);}
   requestAnimationFrame(()=>{if(visible(modal)){const first=focusable(modal).find(e=>e.matches('input:not([readonly]),select,textarea'))||focusable(modal)[0];first?.focus({preventScroll:true});}});
  }else if(!open&&previous.has(modal)){
   const origin=previous.get(modal);previous.delete(modal);if(origin?.isConnected&&visible(origin))origin.focus({preventScroll:true});
  }
 }
 function forms(){
  all('#adminThemeToggle button').forEach(button=>button.setAttribute('aria-label',button.textContent.includes('Escuro')?'Modo escuro':'Modo claro'));
  all('.status,#v836EditorStatus').forEach(e=>{e.setAttribute('role','status');e.setAttribute('aria-live','polite');e.setAttribute('aria-atomic','true');});
  const labels={guestSearch:'Pesquisar convidados por nome, código ou WhatsApp',checkinCode:'Nome ou código do convite',email:'Email',password:'Palavra-passe'};
  Object.entries(labels).forEach(([id,label])=>{const e=document.getElementById(id);if(e&&!e.getAttribute('aria-label'))e.setAttribute('aria-label',label);});
  ['checkinCode','guestSearch','giftSearch'].forEach(id=>{const e=document.getElementById(id);if(e){e.setAttribute('enterkeyhint','search');e.setAttribute('autocapitalize','none');e.setAttribute('spellcheck','false');}});
  const email=$('#email');if(email)email.autocomplete='username';
  all('input[type=password]').forEach(input=>{
   if(input.dataset.uxPassword)return;input.dataset.uxPassword='true';
   if(input.id==='password')input.autocomplete='current-password';
   const button=document.createElement('button');button.type='button';button.className='ux-password-toggle';button.textContent='Mostrar palavra-passe';button.setAttribute('aria-pressed','false');if(input.id)button.setAttribute('aria-controls',input.id);
   button.addEventListener('click',()=>{const show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'Ocultar palavra-passe':'Mostrar palavra-passe';button.setAttribute('aria-pressed',String(show));});
   input.after(button);
  });
 }
 function editor(){
  const host=$('#site-editor'),save=$('#v836SaveContent');if(!host||!save||$('.ux-save-dock',host))return;
  const dock=document.createElement('div');dock.className='ux-save-dock';dock.setAttribute('aria-label','Guardar conteúdo do convite');
  const note=document.createElement('p');note.textContent='As alterações só ficam públicas depois de guardar.';
  const action=document.createElement('button');action.type='button';action.className='button';action.textContent='Guardar alterações';
  action.addEventListener('click',()=>save.click());dock.append(note,action);host.append(dock);
  new MutationObserver(()=>{action.disabled=save.disabled;action.textContent=save.disabled?'A guardar…':'Guardar alterações';}).observe(save,{attributes:true,attributeFilter:['disabled']});
  host.addEventListener('input',e=>{if(e.target.matches('input,textarea,select'))note.textContent='Alterações por guardar.';});
  const status=$('#v836EditorStatus');if(status)new MutationObserver(()=>{if(status.dataset.state==='success')note.textContent='Alterações guardadas.';else if(status.dataset.state==='error')note.textContent='Não foi possível guardar. Consulte a mensagem no formulário.';}).observe(status,{childList:true,attributes:true,attributeFilter:['data-state']});
 }
 function init(){
  forms();editor();
  all('.modal').forEach(modal=>{modalState(modal);new MutationObserver(()=>modalState(modal)).observe(modal,{attributes:true,attributeFilter:['class','style']});});
  document.addEventListener('keydown',e=>{
   if(e.key!=='Tab')return;const modal=all('.modal:not(.hidden)').filter(visible).at(-1);if(!modal)return;
   const items=focusable(modal);if(!items.length)return;const first=items[0],last=items.at(-1);
   if(e.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){e.preventDefault();first.focus();}
  });
  document.addEventListener('invalid',e=>e.target.setAttribute('aria-invalid','true'),true);
  document.addEventListener('input',e=>{if(e.target.matches('input,select,textarea')&&e.target.validity.valid)e.target.removeAttribute('aria-invalid');});
  const host=$('#site-editor');if(host)new MutationObserver(()=>{editor();}).observe(host,{childList:true,subtree:true});
  const direct=$('.admin-dashboard-sidebar a[href$="checkin.html"]');if(direct){direct.textContent='Aplicação de recepção ↗';direct.setAttribute('title','Abrir a aplicação de recepção');direct.setAttribute('aria-label','Aplicação de recepção — abrir página separada');}
  const hint=$('#checkinCode');if(hint){hint.placeholder='Nome completo ou código do convite';const label=hint.closest('label');if(label&&label.firstChild?.nodeType===3)label.firstChild.textContent='Nome ou código do convite';}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500),{once:true});else setTimeout(init,500);
})();
