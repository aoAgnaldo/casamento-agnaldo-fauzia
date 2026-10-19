/* Stitch v8.53 — estruturas visuais do ZIP (4), sobre os controlos existentes. */
(function(){
'use strict';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>Math.max(0,Number(v)||0);
const people=g=>1+n(g.companion_count);
function summary(guests){
 const confirmed=guests.filter(g=>g.rsvp_status==='confirmed');
 return {invitations:guests.length,confirmed:confirmed.length,pending:guests.filter(g=>g.rsvp_status==='pending').length,declined:guests.filter(g=>g.rsvp_status==='declined').length,confirmedPeople:confirmed.reduce((s,g)=>s+people(g),0),allowed:guests.reduce((s,g)=>s+Math.max(1,n(g.allowed_guests)),0),assignedPeople:confirmed.filter(g=>g.table_id).reduce((s,g)=>s+people(g),0),unassignedPeople:confirmed.filter(g=>!g.table_id).reduce((s,g)=>s+people(g),0)};
}
function tableSummary(tables,guests){
 const counts=tables.map(t=>({capacity:n(t.capacity),people:guests.filter(g=>g.rsvp_status!=='declined'&&String(g.table_id)===String(t.id)).reduce((s,g)=>s+people(g),0)}));
 return {tables:tables.length,capacity:counts.reduce((s,t)=>s+t.capacity,0),occupied:counts.reduce((s,t)=>s+t.people,0),full:counts.filter(t=>t.capacity>0&&t.people>=t.capacity).length,partial:counts.filter(t=>t.people>0&&t.people<t.capacity).length,empty:counts.filter(t=>!t.people).length};
}
if(typeof module==='object'&&module.exports){module.exports={summary,tableSummary,escapeHtml};return;}
document.body.classList.add('stitch53');
const $=(s,r=document)=>r.querySelector(s);
const all=(s,r=document)=>[...r.querySelectorAll(s)];
const pct=(a,b)=>b?Math.min(100,Math.round(a/b*100)):0;
const bar=(a,b)=>'<div class="stitch-progress"><i style="width:'+pct(a,b)+'%"></i></div>';
function replaceHtml(el,html){if(el&&el.innerHTML!==html)el.innerHTML=html;}
window.renderAtelierGuestSummary=function(guests){
 const tools=$('#convidados .guest-tools');if(!tools)return;
 let root=$('#atelierGuestSummary');
 if(!root){root=document.createElement('div');root.id='atelierGuestSummary';root.className='atelier-metrics';root.setAttribute('aria-label','Resumo dos convidados');tools.before(root);}
 const s=summary(Array.isArray(guests)?guests:[]);
 const codes=guests.filter(g=>String(g.code||'').trim()).length;
 replaceHtml(root,
 '<div class="stitch-metric"><span>Pessoas confirmadas</span><strong>'+s.confirmedPeople+'<small> / '+s.allowed+'</small></strong><p>Capacidade dos convites</p>'+bar(s.confirmedPeople,s.allowed)+'</div>'+
 '<div class="stitch-metric"><span>Estado dos convites</span><div class="stitch-status-counts"><b>'+s.confirmed+'<small>Confirmados</small></b><b>'+s.pending+'<small>Pendentes</small></b><b>'+s.declined+'<small>Recusados</small></b></div>'+bar(s.confirmed,s.invitations)+'</div>'+
 '<div class="stitch-metric"><span>Alocação de mesas</span><strong>'+s.assignedPeople+'<small> / '+s.confirmedPeople+'</small></strong><p>'+s.unassignedPeople+' pessoas confirmadas sem mesa</p>'+bar(s.assignedPeople,s.confirmedPeople)+'</div>'+
 '<div class="stitch-metric"><span>Portaria & QR Codes</span><strong>'+codes+'<small> códigos</small></strong><p>Identificadores dos convites registados</p>'+bar(codes,s.invitations)+'</div>');
};
function guests(){
 const rows=$('#guestRows');if(!rows)return;
 let head=$('#stitchGuestHeader');
 if(!head){head=document.createElement('div');head.id='stitchGuestHeader';head.className='stitch-guest-header';head.setAttribute('aria-hidden','true');head.innerHTML='<span>Convidado / titular</span><span>Pessoas</span><span>Estado RSVP</span><span>Mesa atribuída</span><span>Acções</span>';rows.before(head);}
 all('.guest-card',rows).forEach(card=>{
  if(card.dataset.stitchReady)return;
  const main=$('.guest-card-main',card),badge=$('.badge',main||card);
  if(badge){const status=document.createElement('div');status.className='stitch-rsvp';status.append(badge);card.append(status);}
  card.dataset.stitchReady='true';
 });
 window.renderAtelierGuestSummary(window.guests||[]);
 const exp=$('#adminExportTrigger');
 if(exp&&!exp.querySelector('.stitch-button-label'))exp.insertAdjacentHTML('beforeend','<span class="stitch-button-label">Exportar CSV</span>');
}
function shell(){
 const sidebar=$('.admin-dashboard-sidebar');
 if(sidebar&&!$('.stitch-account',sidebar)){
  const card=document.createElement('div');card.className='stitch-account';
  card.innerHTML='<button type="button" class="stitch-account-open" aria-label="Abrir menu da minha conta"><span class="stitch-account-avatar">A&F</span><span><strong class="stitch-account-name">Administração</strong><small>Conta do painel</small></span></button><a href="index.html" target="_blank" rel="noopener">Ver site público ↗</a>';
  card.querySelector('button').onclick=()=>$('#adminIdentity')?.click();sidebar.append(card);
  const principal=$('.admin-sidebar-section-label strong');if(principal)principal.textContent='Principal';
 }
 const name=$('#adminHeaderName')?.textContent||'Administração';
 const account=$('.stitch-account-name');if(account&&account.textContent!==name)account.textContent=name;
 const header=$('.admin-header-actions');
 if(header&&!$('.stitch-countdown',header)){const badge=document.createElement('span');badge.className='stitch-countdown';header.prepend(badge);}
 const eventDate=$('#v836-event_datetime')?.value||'2027-05-29T09:00';
 const days=Math.max(0,Math.ceil((new Date(eventDate).getTime()-Date.now())/86400000));
 const count=$('.stitch-countdown');if(count){const text=Number.isFinite(days)?'◷ Faltam '+days+' dias':'◷ O grande dia';if(count.textContent!==text)count.textContent=text;}
 const brand=$('.admin-sidebar-brand');if(brand&&!$('.stitch-private',brand)){const p=document.createElement('span');p.className='stitch-private';p.textContent='Privado';brand.append(p);}
}
function tableMap(){
 const dash=$('#v838Dashboard');if(!dash||$('.stitch-map',dash))return;
 const tables=window.receptionTables||[],guests=window.guests||[];
 const grid=$('.v839-dash-grid',dash);if(!grid)return;
 const card=document.createElement('section');card.className='stitch-map stitch-panel';
 const rows=tables.slice(0,6).map(t=>{
  const occupied=guests.filter(g=>g.rsvp_status!=='declined'&&String(g.table_id)===String(t.id)).reduce((s,g)=>s+people(g),0);
  return '<a href="#mesas" class="stitch-map-table"><span>'+escapeHtml(t.name)+'</span><b>'+occupied+' / '+n(t.capacity)+'</b>'+bar(occupied,n(t.capacity))+'</a>';
 }).join('');
 card.innerHTML='<header><div><p class="section-kicker">Recepção & assentos</p><h2>Ocupação do salão & mesas</h2></div><a href="#mesas">Ver todas as mesas ↗</a></header><div class="stitch-map-grid">'+(rows||'<p class="stitch-empty">Crie as mesas para organizar os lugares do vosso casamento.</p>')+'</div><a class="button secondary" href="#mesas">Organizar pessoas sem mesa →</a>';
 grid.prepend(card);
 const heading=$('.v839-dash-heading',dash);
 if(heading&&!$('.stitch-dashboard-actions',heading)){
  const actions=document.createElement('div');actions.className='stitch-dashboard-actions';
  actions.innerHTML='<button type="button" class="button secondary">＋ Novo convidado</button><a class="button" href="#checkin">Abrir portaria / Check-in</a>';
  actions.querySelector('button').onclick=()=>$('#addBtn2')?.click();heading.append(actions);
 }
}
function tables(){
 const host=$('#mesas');if(!host)return;
 const list=$('#tableList');if(list&&!$('.stitch-salon-label',host)){
  const label=document.createElement('div');label.className='stitch-salon-label';label.textContent='Disposição das mesas · recepção';list.before(label);
 }
 all('.table-card').forEach((card,i)=>{
  const title=$('.table-card-head>div:first-child',card);
  if(title&&!$('.stitch-table-number',title)){const number=document.createElement('span');number.className='stitch-table-number';number.textContent=String(i+1).padStart(2,'0');title.prepend(number);}
 });
}
function content(){
 const pane=$('[data-v837-pane="geral"]');if(!pane)return;
 let hero=$('.stitch-cover-editor',pane);
 if(!hero){
  hero=document.createElement('section');hero.className='stitch-cover-editor';
  hero.innerHTML='<header><div><h3>Fotografia de capa</h3><p>A primeira imagem que recebe os vossos convidados.</p></div><span>16:9 · Convite</span></header><div class="stitch-cover-photo"><img alt="Imagem de capa actualmente utilizada"><div><small>O nosso grande dia</small><strong>Agnaldo & Fáuzia</strong></div></div><button type="button" class="button">✎ Substituir imagem</button>';
  const before=$('.v837-pane-fields',pane);if(before)before.before(hero);else pane.append(hero);
  hero.querySelector('button').onclick=()=>window.openImageSettings?.('cover');
 }
 const src=$('#siteCoverPreview')?.getAttribute('src')||$('#v837PreviewCover')?.getAttribute('src')||'monogram.svg';
 const image=$('img',hero);if(image.getAttribute('src')!==src)image.setAttribute('src',src);
 const names=[$('#v836-couple_one')?.value,$('#v836-couple_two')?.value].filter(Boolean).join(' & ');
 const coverName=$('.stitch-cover-photo strong',hero);if(coverName&&names&&coverName.textContent!==names)coverName.textContent=names;
 const heading=$('#site-editor .v837-editor-header h2');if(heading&&heading.textContent!=='Gestão de conteúdos do convite')heading.textContent='Gestão de conteúdos do convite';
}
function refresh(){
 shell();guests();tables();content();tableMap();
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh();});}
function start(){
 refresh();
 ['guestRows','tableList','v838Dashboard','site-editor'].forEach(id=>{const el=document.getElementById(id);if(el)new MutationObserver(schedule).observe(el,{childList:true,subtree:true});});
 window.addEventListener('hashchange',schedule);
 document.addEventListener('input',e=>{if(e.target.closest('#site-editor'))schedule();});
 const cover=$('#siteCoverPreview');if(cover)new MutationObserver(schedule).observe(cover,{attributes:true,attributeFilter:['src']});
 const name=$('#adminHeaderName');if(name)new MutationObserver(schedule).observe(name,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,250),{once:true});else setTimeout(start,250);
})();
