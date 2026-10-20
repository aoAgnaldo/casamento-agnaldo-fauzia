/* v8.59 — navigation state only; existing routes own all record operations. */
(function(root){
 'use strict';
 function areaForHash(hash){
  const route=String(hash||'#visao-geral').replace(/^#/,'');
  if(route.startsWith('content-')||['site-capa','site-historia','programa-admin'].includes(route))return 'site-editor';
  return ['visao-geral','convidados','mesas','presentes','protocolos','checkin','site-editor','tarefas'].includes(route)?route:'visao-geral';
 }
 if(typeof module==='object'&&module.exports){module.exports={areaForHash};return;}
 document.body.classList.add('responsive59');
 function sync(){
  const area=areaForHash(location.hash);
  document.querySelectorAll('.admin-mobile-area-nav a[data-mobile-nav]').forEach(link=>{
   const current=link.dataset.mobileNav===area;
   link.classList.toggle('active',current);
   if(current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
 }
 function mount(){
  const nav=document.querySelector('.admin-mobile-area-nav');
  if(!nav)return;
  nav.querySelectorAll('a').forEach(link=>{
   const source=[...document.querySelectorAll('.admin-dashboard-sidebar a')].find(a=>a.getAttribute('href')===link.getAttribute('href'));
   const svg=source?.querySelector('.nav-icon svg');
   if(svg)link.querySelector('.mobile-nav-icon').replaceChildren(svg.cloneNode(true));
  });
  sync();
 }
 window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);
 document.addEventListener('click',e=>{if(e.target.closest('a[href^="#"]'))setTimeout(sync,0);});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,450),{once:true});else setTimeout(mount,450);
})(typeof window==='undefined'?globalThis:window);
