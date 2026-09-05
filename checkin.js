let guests=[], scanner=null, busy=false, protocolToken=null, protocolName='', protocolRole='protocol', chiefTeam=[], chiefTasks=[], myTasks=[], chiefTables=[];
const A=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function msg(t){A('#loginMsg').textContent=t;A('#loginMsg').classList.remove('hidden')}
function toast(t){const x=document.createElement('div');x.className='reception-toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2800)}
async function init(){try{protocolToken=sessionStorage.getItem('protocolToken');protocolName=sessionStorage.getItem('protocolName')||'';protocolRole=sessionStorage.getItem('protocolRole')||'protocol'}catch(_){} if(protocolToken){const ok=await loadGuests(true);if(ok){await enter();return}try{sessionStorage.removeItem('protocolToken');sessionStorage.removeItem('protocolName');sessionStorage.removeItem('protocolRole')}catch(_){}} const {data}=await supabaseClient.auth.getSession();if(data.session){await enter()}else A('#login').classList.remove('hidden')}
async function enter(){A('#login').classList.add('hidden');A('#reception').classList.remove('hidden');A('#chiefTools')?.classList.toggle('hidden',protocolRole!=='chief');A('#myTasks')?.classList.remove('hidden');A('#liveDashboard')?.classList.toggle('hidden',protocolRole!=='chief');await loadGuests();await loadMyTasks();if(protocolRole==='chief')await loadChiefTools();startLiveRefresh();A('#code').focus()}
async function loadGuests(protocol=!!protocolToken){const r=protocol?await supabaseClient.rpc('protocol_checkin_list',{p_token:protocolToken}):await supabaseClient.rpc('admin_list_invitations_checkin');if(r.error){if(protocol)return false;toast(r.error.message);return false}guests=r.data||[];updateCounter();return true}
function updateCounter(){
 let arrived=0,people=0,confirmed=0;
 guests.forEach(g=>{if(g.rsvp_status==='confirmed')confirmed++;if(g.checked_in){arrived++;people+=1+(g.companion_count||0)}});
 const pending=Math.max(0,confirmed-arrived);
 A('#countIn').textContent=arrived; A('#countPeople').textContent=people; A('#countPending').textContent=pending;
 A('#liveConfirmed').textContent=confirmed; A('#liveArrived').textContent=arrived; A('#liveRemaining').textContent=pending; A('#livePeople').textContent=people;
 renderReceptionLive();
}

function renderReceptionLive(){
 const recent=A('#recentArrivals'), tables=A('#tableOccupancy');
 if(recent){
  const arr=guests.filter(g=>g.checked_in).sort((a,b)=>new Date(b.checked_in_at||0)-new Date(a.checked_in_at||0)).slice(0,6);
  recent.innerHTML=arr.map(g=>{const people=1+(g.companion_count||0);return `<div class="recent-arrival"><div><strong>${esc(g.full_name)}</strong><small>${esc(g.code)} · ${people} pessoa(s)</small></div><div class="arrival-meta"><b>${g.table_name?esc(g.table_name):'Sem mesa'}</b><small>${g.checked_in_at?new Date(g.checked_in_at).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):''}</small></div></div>`}).join('')||'<div class="empty-state">Ainda não há entradas registadas.</div>';
 }
 if(tables){
  const map={}; guests.forEach(g=>{if(g.table_name){const k=g.table_id||g.table_name;if(!map[k])map[k]={name:g.table_name,capacity:g.table_capacity||0,people:0}; if(g.checked_in)map[k].people+=1+(g.companion_count||0);}});
  const vals=Object.values(map).sort((a,b)=>a.name.localeCompare(b.name,'pt'));
  tables.innerHTML=vals.map(t=>{const cap=t.capacity||0;const pct=cap?Math.min(100,Math.round(t.people/cap*100)):0;return `<div class="table-occupancy"><div><strong>${esc(t.name)}</strong><small>${t.people} / ${cap||'—'} pessoas</small></div><div class="occupancy-track"><i style="width:${pct}%"></i></div></div>`}).join('')||'<div class="empty-state">As mesas atribuídas aparecerão aqui.</div>';
 }
}

function render(g){const box=A('#result');if(!g){box.classList.add('hidden');return}const people=1+(g.companion_count||0);let state;if(g.checked_in){state=`<div class="result-already"><b>✓ Entrada já registada</b><span>${g.checked_in_at?new Date(g.checked_in_at).toLocaleString('pt-PT'):''}</span></div>`}else if(g.rsvp_status==='confirmed'){state='<div class="result-valid"><b>✓ Presença confirmada</b><span>Convite válido para a recepção.</span></div>'}else{state=`<div class="result-warning"><b>⚠ Estado: ${esc(g.rsvp_status)}</b><span>Este convidado ainda não confirmou a presença.</span></div>`}box.innerHTML=`<div class="guest-result-inner"><div class="guest-main"><p class="eyebrow">Convidado</p><h2>${esc(g.full_name)}</h2><div class="guest-meta"><span><b>${esc(g.code)}</b></span><span>${people} pessoa(s)</span><span>Permitido: ${g.allowed_guests}</span></div>${g.table_name?`<div class="assigned-table"><small>MESA</small><strong>${esc(g.table_name)}</strong><span>${g.table_capacity?`Capacidade ${g.table_capacity} lugares`:''}</span></div>`:'<div class="assigned-table no-table"><small>ASSENTO</small><strong>Mesa ainda não atribuída</strong></div>'}${state}</div><div class="guest-action">${g.checked_in?'<button class="button secondary" id="again">Próximo convidado</button>':`<button class="button reception-confirm" id="confirm">Confirmar entrada</button>`}</div></div>`;box.classList.remove('hidden');A('#again')?.addEventListener('click',next);A('#confirm')?.addEventListener('click',()=>confirmEntry(g.id));}
async function search(raw){
 const key=String(raw||'').trim();
 if(!key){toast('Introduza o nome ou código do convite.');A('#code').focus();return}
 const q=key.toLocaleLowerCase('pt-PT');
 const exactCode=guests.find(x=>String(x.code||'').toLocaleLowerCase('pt-PT')===q);
 const exactName=guests.find(x=>String(x.full_name||'').toLocaleLowerCase('pt-PT')===q);
 if(exactCode||exactName){render(exactCode||exactName);return}
 const matches=guests.filter(x=>String(x.full_name||'').toLocaleLowerCase('pt-PT').includes(q)||String(x.code||'').toLocaleLowerCase('pt-PT').includes(q));
 if(matches.length===0){render(null);toast('Nenhum convidado encontrado.');return}
 if(matches.length===1){render(matches[0]);return}
 renderSearchMatches(matches);
}
function renderSearchMatches(matches){
 const box=A('#result');
 if(!box)return;
 box.innerHTML=`<div class="search-matches"><div class="search-matches-head"><div><p class="eyebrow">RESULTADOS</p><h2>Escolher convidado</h2><p>Encontrámos ${matches.length} pessoas. Seleccione o convidado correcto.</p></div></div><div class="search-match-list">${matches.slice(0,30).map((g,i)=>{const people=1+(g.companion_count||0);return `<button type="button" class="search-match" onclick="selectSearchMatch(${i})"><span class="search-match-name"><b>${esc(g.full_name)}</b><small>${esc(g.code)} · ${people} pessoa(s)</small></span><span class="search-match-side"><strong>${g.table_name?esc(g.table_name):'Sem mesa'}</strong><small>${g.checked_in?'✓ Já chegou':'Por chegar'}</small></span></button>`}).join('')}</div>${matches.length>30?'<p class="search-match-note">A mostrar os primeiros 30 resultados. Refine a pesquisa pelo nome ou código.</p>':''}</div>`;
 box.classList.remove('hidden');
 window.__searchMatches=matches;
}
window.selectSearchMatch=i=>{const g=window.__searchMatches?.[i];if(g)render(g)};
async function confirmEntry(id){if(busy)return;const g=guests.find(x=>x.id===id);if(!g||g.checked_in)return;busy=true;const b=A('#confirm');if(b){b.disabled=true;b.textContent='A confirmar…'}const {error}=protocolToken?await supabaseClient.rpc('protocol_check_in',{p_token:protocolToken,p_invitation_id:id}):await supabaseClient.rpc('admin_check_in_invitation',{invitation_id:id});if(error){toast(error.message);busy=false;if(b){b.disabled=false;b.textContent='Confirmar entrada'}return}await loadGuests();toast(`✓ Entrada confirmada — ${g.full_name}`);render(guests.find(x=>x.id===id));setTimeout(next,1800);busy=false}
function next(){A('#result').classList.add('hidden');A('#code').value='';A('#code').focus()}

async function loadMyTasks(){
 const box=A('#myTaskList');
 if(!box||!protocolToken)return;
 const r=await supabaseClient.rpc('protocol_my_tasks',{p_token:protocolToken});
 if(r.error){box.innerHTML='<div class="empty-state">Não foi possível carregar as tarefas.</div>';return}
 myTasks=r.data||[];
 renderMyTasks();
}
function renderMyTasks(){
 const box=A('#myTaskList');
 if(!box)return;
 box.innerHTML=myTasks.map(t=>`<div class="my-task ${t.completed?'is-done':''}"><div class="my-task-check">${t.completed?'✓':'○'}</div><div class="chief-task-main"><b>${esc(t.title)}</b><small>${esc(t.description||'Sem descrição')}</small><small>${t.completed?'Concluída':'Pendente'}</small></div><div class="chief-task-actions"><button class="icon-btn" type="button" onclick="toggleMyTask(${t.id},${!t.completed})">${t.completed?'Reabrir':'Concluir'}</button></div></div>`).join('')||'<div class="empty-state">Não existem tarefas atribuídas.</div>';
}
window.toggleMyTask=async(id,done)=>{
 const r=await supabaseClient.rpc('protocol_complete_task',{p_token:protocolToken,p_task_id:id,p_completed:done});
 if(r.error){toast(r.error.message);return}
 await loadMyTasks();
 if(protocolRole==='chief')await loadChiefTools();
};
A('#protocolLoginForm').onsubmit=async e=>{e.preventDefault();const {data,error}=await supabaseClient.rpc('verify_protocol',{p_access_code:A('#protocolAccessCode').value.trim(),p_pin:A('#protocolAccessPin').value.trim()});if(error||!data?.length){A('#protocolLoginMsg').textContent='Código ou PIN incorrecto.';A('#protocolLoginMsg').classList.remove('hidden');return}protocolToken=data[0].session_token;protocolName=data[0].full_name;protocolRole=data[0].role||'protocol';try{sessionStorage.setItem('protocolToken',protocolToken);sessionStorage.setItem('protocolName',protocolName);sessionStorage.setItem('protocolRole',protocolRole)}catch(_){}await enter()};
A('#loginForm').onsubmit=async e=>{e.preventDefault();const {error}=await supabaseClient.auth.signInWithPassword({email:A('#email').value,password:A('#password').value});if(error)msg('Email ou palavra-passe incorrectos.');else await enter()};
let liveRefreshTimer=null;
function startLiveRefresh(){clearInterval(liveRefreshTimer);liveRefreshTimer=setInterval(async()=>{if(document.visibilityState==='visible'){const ok=await loadGuests();if(!ok)clearInterval(liveRefreshTimer);else if(protocolRole==='chief')await loadChiefTools()}},15000)}
A('#logout').onclick=async()=>{try{sessionStorage.removeItem('protocolToken');sessionStorage.removeItem('protocolName');sessionStorage.removeItem('protocolRole')}catch(_){}await supabaseClient.auth.signOut();location.reload()};A('#search').onclick=()=>search(A('#code').value);A('#code').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search(e.target.value)}});
A('#startScanner').onclick=async()=>{if(!window.Html5Qrcode){toast('Leitor QR indisponível.');return}if(scanner)return;A('#reader').classList.remove('hidden');A('#startScanner').classList.add('hidden');A('#stopScanner').classList.remove('hidden');scanner=new Html5Qrcode('reader');try{await scanner.start({facingMode:'environment'},{fps:12,qrbox:{width:260,height:260}},text=>{let code=text;try{const u=new URL(text);code=u.searchParams.get('convite')||text}catch(_){}A('#code').value=code;search(code);stopScanner()},()=>{})}catch(e){toast('Não foi possível abrir a câmara. Verifique a permissão.');stopScanner()}};
async function stopScanner(){if(scanner){try{await scanner.stop()}catch(_){}try{scanner.clear()}catch(_){}scanner=null}A('#reader').classList.add('hidden');A('#startScanner').classList.remove('hidden');A('#stopScanner').classList.add('hidden')};A('#stopScanner').onclick=stopScanner;
init();

async function loadChiefTools(){
 const [team,tasks,status]=await Promise.all([
   supabaseClient.rpc('chief_list_protocols',{p_token:protocolToken}),
   supabaseClient.rpc('chief_list_tasks',{p_token:protocolToken}),
   supabaseClient.rpc('chief_reception_team',{p_token:protocolToken}),
   supabaseClient.rpc('chief_reception_tables',{p_token:protocolToken})
 ]);
 if(team.error||tasks.error){toast((team.error||tasks.error).message);return}
 chiefTeam=team.data||[];chiefTasks=tasks.data||[];
 chiefTables=status.data||[];
 if(!status.error) renderChiefReceptionStatus(status.data||[]);
 renderChiefTools();
}
function renderChiefReceptionStatus(teamStatus){
 const confirmed=guests.filter(g=>g.rsvp_status==='confirmed').length;
 const arrived=guests.filter(g=>g.checked_in).length;
 const people=guests.filter(g=>g.checked_in).reduce((n,g)=>n+1+(g.companion_count||0),0);
 const remaining=Math.max(0,confirmed-arrived);
 const online=(teamStatus||[]).filter(p=>p.role==='protocol'&&p.online).length;
 const totalTasks=(teamStatus||[]).reduce((n,p)=>n+Number(p.task_total||0),0);
 const doneTasks=(teamStatus||[]).reduce((n,p)=>n+Number(p.task_done||0),0);
 const tables=new Set(guests.filter(g=>g.checked_in&&g.table_id).map(g=>g.table_id));
 const set=(id,v)=>{const x=A(id);if(x)x.textContent=v};
 set('#chiefReceptionConfirmed',confirmed);set('#chiefReceptionArrived',arrived);set('#chiefReceptionRemaining',remaining);set('#chiefReceptionPeople',people);
 set('#chiefOnlineCount',online);set('#chiefTaskProgress',totalTasks?Math.round(doneTasks/totalTasks*100)+'%':'0%');set('#chiefTableCount',tables.size);
 const u=A('#chiefLastUpdate');if(u)u.textContent='Actualizado às '+new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}

function taskAge(createdAt){
 const d=new Date(createdAt||Date.now()),mins=Math.max(0,Math.floor((Date.now()-d.getTime())/60000));
 if(mins<60)return `há ${mins||1} min`;
 const h=Math.floor(mins/60); if(h<24)return `há ${h} h`;
 const days=Math.floor(h/24); return `há ${days} dia${days===1?'':'s'}`;
}
function renderChiefTables(){
 const box=A('#chiefTablesGrid'); if(!box)return;
 box.innerHTML=chiefTables.map(t=>{
   const cap=Number(t.capacity||0), invited=Number(t.invited_people||0), arrived=Number(t.arrived_people||0);
   const pct=cap?Math.round(arrived/cap*100):0;
   const cls=cap&&arrived>cap?'over':cap&&arrived>=cap?'full':arrived>0?'partial':'available';
   const names=String(t.guest_names||'').split(', ').filter(Boolean);
   const visible=names.slice(0,5).map(n=>`<span>${esc(n)}</span>`).join('');
   const more=names.length>5?`<em>+${names.length-5} convidados</em>`:'';
   return `<button type="button" class="chief-table-card ${cls}" data-table-id="${t.id}" data-table-name="${esc(t.name)}" onclick="openChiefTable(${t.id})"><div class="chief-table-top"><div class="table-circle"><b>${esc(t.name)}</b><small>${arrived}/${cap||'—'}</small></div><div class="chief-table-status"><strong>${arrived} / ${cap||'—'}</strong><span>${cap&&arrived>cap?'Acima da capacidade':cap&&arrived>=cap?'Completa':arrived?'Parcial':'Disponível'}</span></div></div><div class="chief-table-bar"><i style="width:${Math.min(100,pct)}%"></i></div><div class="chief-table-meta"><span>${invited} pessoa(s) atribuída(s)</span><span>${Number(t.arrived_groups||0)} grupo(s) chegou/chegaram</span></div><div class="chief-table-guests">${visible||'<small>Nenhum convidado atribuído</small>'}${more}</div><div class="chief-table-open">Ver convidados da mesa <span>↗</span></div></button>`;
 }).join('')||'<div class="empty-state">Ainda não existem mesas cadastradas.</div>';
}


function highlightChiefTable(tableId, scroll=true){
 const box=A('#chiefTablesGrid');
 if(!box)return;
 box.querySelectorAll('.chief-table-card.is-highlighted').forEach(el=>el.classList.remove('is-highlighted'));
 const card=box.querySelector(`.chief-table-card[data-table-id="${String(tableId)}"]`);
 if(!card)return;
 card.classList.add('is-highlighted');
 if(scroll) card.scrollIntoView({behavior:'smooth',block:'center'});
 window.setTimeout(()=>card.classList.remove('is-highlighted'),5000);
}


function highlightChiefTable(tableId, scroll=true){
 const box=A('#chiefTablesGrid');
 if(!box)return;
 box.querySelectorAll('.chief-table-card.is-highlighted').forEach(el=>el.classList.remove('is-highlighted'));
 const card=box.querySelector(`.chief-table-card[data-table-id="${String(tableId)}"]`);
 if(!card)return;
 card.classList.add('is-highlighted');
 if(scroll) card.scrollIntoView({behavior:'smooth',block:'center'});
 window.setTimeout(()=>card.classList.remove('is-highlighted'),5000);
}

window.openChiefTable=async tableId=>{
 const modal=A('#chiefTableModal'), title=A('#chiefTableModalTitle'), meta=A('#chiefTableModalMeta'), body=A('#chiefTableModalBody');
 if(!modal||!body)return;
 const table=chiefTables.find(t=>Number(t.id)===Number(tableId));
 if(!table)return;
 title.textContent=table.name;
 meta.textContent=`${Number(table.arrived_people||0)} de ${Number(table.invited_people||0)} pessoa(s) já chegaram · capacidade ${table.capacity||'—'}`;
 body.innerHTML='<div class="loading-state">A carregar convidados…</div>';
 modal.classList.add('is-open');
 document.body.classList.add('modal-open');
 const r=await supabaseClient.rpc('chief_table_guests',{p_token:protocolToken,p_table_id:tableId});
 if(r.error){body.innerHTML=`<div class="empty-state">Não foi possível carregar os convidados.<br><small>${esc(r.error.message)}</small></div>`;return}
 const rows=r.data||[];
 body.innerHTML=rows.map(g=>{
   const people=1+(g.companion_count||0);
   const status=g.checked_in?`<span class="table-guest-status arrived">✓ Chegou${g.checked_in_at?' · '+new Date(g.checked_in_at).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):''}</span>`:`<span class="table-guest-status waiting">Ainda não chegou</span>`;
   return `<div class="table-guest-row"><div class="table-guest-main"><b>${esc(g.full_name)}</b><small>${esc(g.code)} · ${people} pessoa(s) · ${g.rsvp_status==='confirmed'?'Presença confirmada':esc(g.rsvp_status||'')}</small></div>${status}</div>`;
 }).join('')||'<div class="empty-state">Não existem convidados atribuídos a esta mesa.</div>';
};
window.closeChiefTable=()=>{A('#chiefTableModal')?.classList.remove('is-open');document.body.classList.remove('modal-open')};

function renderChiefGuestSearch(g){
 const box=A('#chiefGuestSearchResult'); if(!box)return;
 if(!g){box.classList.remove('hidden');box.innerHTML='<div class="chief-direct-empty">Nenhum convidado encontrado. Tente outro nome ou código.</div>';return}
 const people=1+(g.companion_count||0);
 const state=g.checked_in?`<span class="chief-direct-state arrived">✓ Já chegou${g.checked_in_at?' · '+new Date(g.checked_in_at).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):''}</span>`:g.rsvp_status==='confirmed'?'<span class="chief-direct-state waiting">Por chegar</span>':'<span class="chief-direct-state warning">Presença não confirmada</span>';
 box.innerHTML=`<div class="chief-direct-result-head"><div><p class="section-kicker">CONVIDADO ENCONTRADO</p><h4>${esc(g.full_name)}</h4><p>${esc(g.code)} · ${people} pessoa(s)</p></div>${state}</div><div class="chief-direct-result-grid"><div><small>MESA</small><strong>${g.table_name?esc(g.table_name):'Sem mesa atribuída'}</strong></div><div><small>ENTRADA</small><strong>${g.checked_in?'Registada':'Ainda não registada'}</strong></div><div><small>PRESENÇA</small><strong>${esc(g.rsvp_status||'—')}</strong></div></div><div class="chief-direct-actions"><button type="button" class="button secondary" id="chiefOpenGuest">Abrir no check-in</button>${g.table_id?`<button type="button" class="button secondary" id="chiefOpenTable">Destacar mesa</button>`:''}</div>`;
 box.classList.remove('hidden');
 if(g.table_id) window.setTimeout(()=>highlightChiefTable(g.table_id,false),80);
 A('#chiefOpenGuest')?.addEventListener('click',()=>{A('#code').value=g.code;render(g);window.scrollTo({top:A('#result').getBoundingClientRect().top+window.scrollY-100,behavior:'smooth'})});
 A('#chiefOpenTable')?.addEventListener('click',()=>{highlightChiefTable(g.table_id,true);openChiefTable(g.table_id)});
}
function chiefSearchGuest(){
 const input=A('#chiefGuestSearch'); if(!input)return;
 const q=String(input.value||'').trim().toLocaleLowerCase('pt-PT');
 if(!q){toast('Introduza o nome ou código.');input.focus();return}
 const exact=guests.find(g=>String(g.code||'').toLocaleLowerCase('pt-PT')===q||String(g.full_name||'').toLocaleLowerCase('pt-PT')===q);
 if(exact){renderChiefGuestSearch(exact);return}
 const matches=guests.filter(g=>String(g.full_name||'').toLocaleLowerCase('pt-PT').includes(q)||String(g.code||'').toLocaleLowerCase('pt-PT').includes(q));
 if(matches.length===0){renderChiefGuestSearch(null);return}
 if(matches.length===1){renderChiefGuestSearch(matches[0]);return}
 const box=A('#chiefGuestSearchResult');
 box.innerHTML=`<div class="chief-direct-match-list"><p class="section-kicker">RESULTADOS</p><h4>Escolha o convidado</h4>${matches.slice(0,20).map((g,i)=>`<button type="button" class="chief-direct-match" onclick="selectChiefGuestSearch(${i})"><span><b>${esc(g.full_name)}</b><small>${esc(g.code)} · ${1+(g.companion_count||0)} pessoa(s)</small></span><strong>${g.table_name?esc(g.table_name):'Sem mesa'} · ${g.checked_in?'Chegou':'Por chegar'}</strong></button>`).join('')}${matches.length>20?'<small>A mostrar os primeiros 20 resultados.</small>':''}</div>`;
 box.classList.remove('hidden'); window.__chiefGuestMatches=matches;
}
window.selectChiefGuestSearch=i=>{const g=window.__chiefGuestMatches?.[i];if(g)renderChiefGuestSearch(g)};
A('#chiefGuestSearchBtn')?.addEventListener('click',chiefSearchGuest);
A('#chiefGuestSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();chiefSearchGuest()}});


function renderChiefTools(){
 const list=A('#chiefTeamList'),sel=A('#chiefTaskProtocol'),tasks=A('#chiefTaskList');
 const workers=chiefTeam.filter(p=>p.role==='protocol');
 const command=A('#chiefCommandTeam');
 if(command) command.innerHTML=workers.map(p=>{
   const total=Number(p.task_total||0),done=Number(p.task_done||0),pct=total?Math.round(done/total*100):0;
   return `<div class="chief-team-person"><div class="protocol-avatar">${esc((p.full_name||'?').slice(0,1).toUpperCase())}</div><div class="chief-team-person-main"><b>${esc(p.full_name)}</b><small>${esc(p.access_code)} · ${done}/${total} tarefas concluídas</small><span class="chief-team-status ${p.online?'online':'offline'}"><i></i>${p.online?'Online':'Offline'}</span></div><div class="chief-team-progress"><div class="chief-team-progress-track"><i style="width:${pct}%"></i></div><small>${pct}%</small></div></div>`;
 }).join('')||'<div class="empty-state">Ainda não existem protocolos na equipa.</div>';
 if(list)list.innerHTML=workers.map(p=>`<div class="chief-task"><div class="protocol-avatar">${esc((p.full_name||'?').slice(0,1).toUpperCase())}</div><div class="chief-task-main"><b>${esc(p.full_name)}</b><small>${esc(p.access_code)} · ${p.online?'Online':'Offline'} · ${Number(p.task_done||0)}/${Number(p.task_total||0)} tarefas</small></div></div>`).join('')||'<div class="empty-state">Ainda não existem protocolos.</div>';
 if(sel)sel.innerHTML=workers.map(p=>`<option value="${p.id}">${esc(p.full_name)}</option>`).join('')||'<option value="">Sem protocolos</option>';
 const cp=A('#chiefCountProtocols'),ct=A('#chiefCountTasks'),cd=A('#chiefCountDone'); if(cp)cp.textContent=workers.length; if(ct)ct.textContent=chiefTasks.length; if(cd)cd.textContent=chiefTasks.filter(t=>t.completed).length;
 const pending=chiefTasks.filter(t=>!t.completed).sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0));
 const pb=A('#chiefPendingTasks'),badge=A('#chiefPendingTaskBadge'); if(badge)badge.textContent=pending.length;
 if(pb)pb.innerHTML=pending.map(t=>`<div class="chief-attention-item"><div class="protocol-avatar">!</div><div class="chief-attention-main"><b>${esc(t.protocol_name)} — ${esc(t.title)}</b><small>${esc(t.description||'Sem descrição')}</small><small class="chief-task-age ${Date.now()-new Date(t.created_at||Date.now()).getTime()>86400000?'is-late':''}">${taskAge(t.created_at)} · ${Date.now()-new Date(t.created_at||Date.now()).getTime()>86400000?'precisa de atenção':'pendente'}</small></div></div>`).join('')||'<div class="empty-state">Excelente. Não existem tarefas pendentes.</div>';
 const remaining=guests.filter(g=>g.rsvp_status==='confirmed'&&!g.checked_in).sort((a,b)=>a.full_name.localeCompare(b.full_name,'pt'));
 const rb=A('#chiefRemainingGuests'),rbadge=A('#chiefRemainingBadge'); if(rbadge)rbadge.textContent=remaining.length;
 if(rb)rb.innerHTML=remaining.map(g=>`<div class="chief-remaining-item"><div class="chief-remaining-main"><b>${esc(g.full_name)}</b><small><span class="chief-remaining-code">${esc(g.code)}</span> · ${1+(g.companion_count||0)} pessoa(s)</small></div><span class="chief-remaining-table">${g.table_name?esc(g.table_name):'Sem mesa'}</span></div>`).join('')||'<div class="empty-state">Todos os convidados confirmados já chegaram.</div>';
 if(tasks)tasks.innerHTML=chiefTasks.map(t=>`<div class="chief-task"><div class="chief-task-main"><b>${esc(t.protocol_name)} — ${esc(t.title)}</b><small>${esc(t.description||'Sem descrição')}</small><small class="chief-task-age ${!t.completed&&Date.now()-new Date(t.created_at||Date.now()).getTime()>86400000?'is-late':''}">${t.completed?'Concluída':'Pendente'} · ${taskAge(t.created_at)}</small></div><div class="chief-task-actions"><button class="icon-btn" onclick="chiefToggleTask(${t.id},${!t.completed})">${t.completed?'Reabrir':'Concluir'}</button><button class="icon-btn danger" onclick="chiefDeleteTask(${t.id})">Remover</button></div></div>`).join('')||'<div class="empty-state">Ainda não existem tarefas atribuídas.</div>'; renderChiefTables();
}

A('#chiefTaskForm')?.addEventListener('submit',async e=>{e.preventDefault();const protocolId=A('#chiefTaskProtocol').value,title=A('#chiefTaskTitle').value.trim(),description=A('#chiefTaskDescription').value.trim();if(!protocolId||!title)return;const r=await supabaseClient.rpc('chief_create_task',{p_token:protocolToken,p_protocol_id:protocolId,p_title:title,p_description:description||null});if(r.error){toast(r.error.message);return}A('#chiefTaskForm').reset();await loadChiefTools();toast('Tarefa atribuída.')});
window.chiefToggleTask=async(id,done)=>{const r=await supabaseClient.rpc('chief_toggle_task',{p_token:protocolToken,p_task_id:id,p_completed:done});if(r.error){toast(r.error.message);return}await loadChiefTools()};
window.chiefDeleteTask=async id=>{if(!confirm('Remover esta tarefa?'))return;const r=await supabaseClient.rpc('chief_delete_task',{p_token:protocolToken,p_task_id:id});if(r.error){toast(r.error.message);return}await loadChiefTools()};
A('#chiefAddProtocol')?.addEventListener('click',async()=>{const name=prompt('Nome completo do novo protocolo:');if(!name)return;const phone=prompt('WhatsApp (opcional):')||'';const code=prompt('Código de acesso:');if(!code)return;const pin=prompt('PIN (mínimo 4 dígitos):');if(!pin)return;const r=await supabaseClient.rpc('chief_create_protocol',{p_token:protocolToken,p_full_name:name,p_whatsapp:phone,p_access_code:code,p_pin:pin});if(r.error){toast(r.error.message);return}await loadChiefTools();toast('Novo protocolo criado.')});
