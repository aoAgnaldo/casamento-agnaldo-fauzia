/* v8.59 — navigation state only; existing routes own all record operations. */
(function(root){
 'use strict';
 function areaForHash(hash){
  const route=String(hash||'#visao-geral').replace(/^#/,'');
  if(route.startsWith('content-')||['site-capa','site-historia','programa-admin'].includes(route))return 'site-editor';
  return ['visao-geral','convidados','mesas','presentes','protocolos','checkin','site-editor','tarefas'].includes(route)?route:'visao-geral';
 }
 function createNavigationState(){return {open:false,area:'visao-geral',suppressed:false,toggle(){if(!this.suppressed)this.open=!this.open;},close(){this.open=false;},navigate(hash){this.area=areaForHash(hash);this.close();},suppress(value){this.suppressed=!!value;if(value)this.close();}};}
 const keyboardIsOpen=(focused,baseline,current)=>!!focused&&baseline-current>150;
 if(typeof module==='object'&&module.exports){module.exports={areaForHash,createNavigationState,keyboardIsOpen};return;}
 document.body.classList.add('responsive59','responsive60');
 const state=createNavigationState();let nav,trigger,baseline=window.visualViewport?.height||innerHeight,viewportWidth=innerWidth;
 function close(restore=false){state.close();if(!nav)return;nav.removeAttribute('data-expanded');nav.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');if(typeof nav.hidePopover==='function'&&nav.matches(':popover-open'))nav.hidePopover();if(restore&&!state.suppressed)trigger?.focus({preventScroll:true});}
 function suppress(){
  const editing=!!document.querySelector('.modal:not(.hidden),dialog[open],.table-drawer-overlay:not(.hidden),#app.hidden');
  const field=document.activeElement?.matches('input,textarea,select'),visible=window.visualViewport?.height||innerHeight;
  if(!field||Math.abs(innerWidth-viewportWidth)>80){baseline=Math.max(innerHeight,visible);viewportWidth=innerWidth;}
  const keyboard=keyboardIsOpen(field,baseline,visible);
  state.suppress(editing||keyboard);document.body.classList.toggle('floating-nav-suppressed',state.suppressed);if(state.suppressed)close();
 }
 function sync(){
  const area=areaForHash(location.hash);
  state.area=area;
  document.querySelectorAll('.admin-mobile-area-nav a[data-mobile-nav]').forEach(link=>{
   const current=link.dataset.mobileNav===area;
   link.classList.toggle('active',current);
   if(current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
 }
 function mount(){
  nav=document.querySelector('.admin-mobile-area-nav');
  if(!nav)return;
  nav.id='adminAreaPanel';nav.setAttribute('aria-hidden','true');
  if(typeof nav.showPopover==='function')nav.setAttribute('popover','auto');
  trigger=document.createElement('button');trigger.type='button';trigger.className='floating-panels-button';trigger.textContent='☷  Painéis';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',nav.id);trigger.setAttribute('aria-haspopup','true');nav.before(trigger);
  const heading=document.createElement('div');heading.className='floating-panels-heading';heading.innerHTML='<strong>Ir para um painel</strong><button type="button" aria-label="Fechar painéis">×</button>';nav.prepend(heading);heading.querySelector('button').onclick=()=>close(true);
  trigger.onclick=()=>{suppress();if(state.suppressed)return;if(state.open){close(true);return;}document.querySelectorAll('.v838-action-menu[open]').forEach(e=>{e.open=false;});state.toggle();nav.dataset.expanded='true';nav.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');if(typeof nav.showPopover==='function')nav.showPopover();nav.querySelector('a[aria-current="page"]')?.focus({preventScroll:true});};
  nav.addEventListener('toggle',e=>{if(e.newState==='closed')close();});
  nav.addEventListener('click',e=>{if(e.target.closest('a')){state.navigate(e.target.closest('a').hash);close();}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open){e.preventDefault();close(true);}});
  document.addEventListener('click',e=>{if(state.open&&!nav.contains(e.target)&&!trigger.contains(e.target))close();});
  document.addEventListener('scroll',e=>{if(state.open&&!nav.contains(e.target))close();},true);
  window.addEventListener('resize',()=>{close();suppress();});
  window.visualViewport?.addEventListener('resize',suppress);
  document.addEventListener('focusin',suppress);document.addEventListener('focusout',()=>setTimeout(suppress,0));
  new MutationObserver(suppress).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','open']});
  suppress();
  nav.querySelectorAll('a').forEach(link=>{
   const source=[...document.querySelectorAll('.admin-dashboard-sidebar a')].find(a=>a.getAttribute('href')===link.getAttribute('href'));
   const svg=source?.querySelector('.nav-icon svg');
   if(svg)link.querySelector('.mobile-nav-icon').replaceChildren(svg.cloneNode(true));
  });
  sync();
 }
 window.addEventListener('hashchange',()=>{close();sync();});window.addEventListener('popstate',()=>{close();sync();});
 document.addEventListener('click',e=>{if(e.target.closest('a[href^="#"]'))setTimeout(sync,0);});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,450),{once:true});else setTimeout(mount,450);
})(typeof window==='undefined'?globalThis:window);
