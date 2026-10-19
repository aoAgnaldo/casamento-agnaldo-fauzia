/* Atelier: apresentação e localização apenas. Nenhuma escrita de dados. */
(function(root){
 'use strict';
 function activeHref(hash){
  const route=String(hash||'#visao-geral');
  return route.startsWith('#content-')||['#site-capa','#site-historia'].includes(route)?'#site-editor':route;
 }
 function guestMetrics(guests){return {total:guests.length,confirmed:guests.filter(g=>g.rsvp_status==='confirmed').length,pending:guests.filter(g=>g.rsvp_status==='pending').length,declined:guests.filter(g=>g.rsvp_status==='declined').length};}
 if(typeof module==='object'&&module.exports){module.exports={activeHref,guestMetrics};return;}
 window.renderAtelierGuestSummary=function(guests){
  const tools=document.querySelector('#convidados .guest-tools');if(!tools)return;
  let summary=document.querySelector('#atelierGuestSummary');
  if(!summary){summary=document.createElement('div');summary.id='atelierGuestSummary';summary.className='atelier-metrics';summary.setAttribute('aria-label','Resumo dos convites');tools.before(summary);}
  const counts=guestMetrics(Array.isArray(guests)?guests:[]);
  summary.innerHTML=[['total','Total de convites'],['confirmed','Confirmados'],['pending','Pendentes'],['declined','Recusados']].map(([key,label])=>'<div class="atelier-metric '+key+'"><span>'+label+'</span><strong>'+counts[key]+'</strong><small>convites</small></div>').join('');
 };
 const icons={
  '#visao-geral':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  '#convidados':'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5"/>',
  '#mesas':'<path d="M3 7h18v7H3zM5 14v7M19 14v7M8 3h8"/>',
  '#presentes':'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>',
  '#protocolos':'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  '#site-editor':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M8 8v13M12 12h5M12 16h5"/>',
  '#tarefas':'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4M16 2v4M8 11h8M8 15h5"/>',
  '#checkin':'<path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M8 12l3 3 6-6"/>'
 };
 function sync(){
  const current=activeHref(location.hash);
  document.querySelectorAll('.admin-dashboard-sidebar a[href^="#"]').forEach(link=>{
   const on=link.getAttribute('href')===current;
   if(link.classList.contains('active')!==on)link.classList.toggle('active',on);
   if(!on&&link.classList.contains('v838-content-active'))link.classList.remove('v838-content-active');
   if(on&&link.getAttribute('aria-current')!=='page')link.setAttribute('aria-current','page');
   if(!on&&link.hasAttribute('aria-current'))link.removeAttribute('aria-current');
  });
 }
 function mount(){
  const header=document.querySelector('.wedy-header');
  if(header&&!header.querySelector('.atelier-mobile-brand')){
   const brand=document.createElement('a');brand.className='atelier-mobile-brand';brand.href='#visao-geral';
   brand.innerHTML='<span>A&amp;F</span><span>Agnaldo &amp; Fáuzia<small>PAINEL DOS NOIVOS</small></span>';header.prepend(brand);
  }
  document.querySelectorAll('.admin-dashboard-sidebar a').forEach(link=>{
   const icon=link.querySelector('.nav-icon');const path=icons[link.getAttribute('href')];
   if(icon&&path)icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+path+'</svg>';
  });
  sync();
  window.renderAtelierGuestSummary(window.guests||[]);
  const sidebar=document.querySelector('.admin-dashboard-sidebar');
  if(sidebar)new MutationObserver(sync).observe(sidebar,{subtree:true,attributes:true,attributeFilter:['class']});
 }
 window.addEventListener('hashchange',sync);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,120),{once:true});else setTimeout(mount,120);
})(typeof window==='undefined'?globalThis:window);
