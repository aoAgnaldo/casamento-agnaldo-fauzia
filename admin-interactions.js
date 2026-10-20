/* v8.58 — shared action overlays; does not read or write wedding records. */
(function(){
 'use strict';
 let active=null,serial=0;
 function close(restore=false){
  if(!active)return;
  const {menu,panel,trigger}=active;active=null;menu.open=false;
  trigger.setAttribute('aria-expanded','false');panel.removeAttribute('data-active');
  if(typeof panel.hidePopover==='function'&&panel.matches(':popover-open'))panel.hidePopover();
  if(restore&&trigger.isConnected)trigger.focus({preventScroll:true});
 }
 function open(menu){
  if(active?.menu===menu)return;
  close();
  const panel=menu.querySelector('.v838-action-menu-panel'),trigger=menu.querySelector('summary');
  if(!panel||!trigger)return;
  menu.open=true;
  if(!panel.dataset.overlayReady){
   panel.dataset.overlayReady='true';panel.id='admin-action-overlay-'+(++serial);
   const heading=document.createElement('strong');heading.className='action-overlay-heading';heading.textContent='Mais opções';
   const exit=document.createElement('button');exit.type='button';exit.className='action-overlay-close';exit.textContent='Fechar';exit.setAttribute('aria-label','Fechar opções');exit.onclick=()=>close(true);
   panel.prepend(heading,exit);
   panel.setAttribute('role','group');panel.setAttribute('aria-label','Mais opções');
   if(typeof panel.showPopover==='function')panel.setAttribute('popover','auto');
   panel.addEventListener('toggle',e=>{if(e.newState==='closed'&&active?.panel===panel)close();});
   trigger.setAttribute('aria-controls',panel.id);
  }
  active={menu,panel,trigger};panel.dataset.active='true';trigger.setAttribute('aria-expanded','true');
  if(panel.hasAttribute('popover'))panel.showPopover();
  if(!matchMedia('(max-width: 760px)').matches){
   const r=trigger.getBoundingClientRect(),p=panel.getBoundingClientRect(),gap=8;
   panel.style.setProperty('--action-left',Math.max(gap,Math.min(r.right-p.width,innerWidth-p.width-gap))+'px');
   panel.style.setProperty('--action-top',Math.max(gap,Math.min(r.bottom+gap,innerHeight-p.height-gap))+'px');
  }
 }
 document.addEventListener('toggle',e=>{
  if(!e.target.matches?.('.v838-action-menu'))return;
  if(e.target.open)open(e.target);else if(active?.menu===e.target)close();
 },true);
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&active){e.preventDefault();close(true);return;}
  const trigger=e.target.closest?.('.v838-action-menu>summary');
  if(trigger&&e.key==='ArrowDown'){e.preventDefault();open(trigger.parentElement);active?.panel.querySelector('.v838-menu-action:not(:disabled)')?.focus();}
 });
 document.addEventListener('click',e=>{
  if(active&&!active.menu.contains(e.target))close();
 });
 document.addEventListener('scroll',e=>{if(active&&!active.panel.contains(e.target))close();},true);
 window.addEventListener('resize',()=>close());window.addEventListener('hashchange',()=>close());
 new MutationObserver(()=>{if(active&&!active.menu.isConnected)close();}).observe(document.body,{childList:true,subtree:true});
})();
