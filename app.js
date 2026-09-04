let currentInvitation = null;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function toast(text){
  const x=document.createElement('div');
  x.className='toast';
  x.textContent=text;
  document.body.appendChild(x);
  setTimeout(()=>x.remove(),3500);
}

function updateCountdown(id,target){
  const diff=Math.max(0,new Date(target).getTime()-Date.now());
  const sec=Math.floor(diff/1000);
  const vals=[Math.floor(sec/86400),Math.floor(sec%86400/3600),Math.floor(sec%3600/60),sec%60];
  ['days','hours','minutes','seconds'].forEach((u,i)=>{
    const el=document.getElementById(`${id}-${u}`);
    if(el) el.textContent=String(vals[i]).padStart(i===0?1:2,'0');
  });
}
function countdown(){
  updateCountdown('ceremony','2027-05-29T09:00:00+02:00');
  updateCountdown('reception','2027-05-29T15:00:00+02:00');
}
setInterval(countdown,1000); countdown();

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

/* Intro + navigation */
const intro=$('#introScreen');
const openInvite=$('#openInvite');
const musicButton=$('#musicButton');
const musicFrame=$('#musicFrame');
let musicPlaying=false;
function youtubeCommand(func){
  if(!musicFrame?.contentWindow)return;
  musicFrame.contentWindow.postMessage(JSON.stringify({event:'command',func,args:[]}), '*');
}
function setMusic(on){
  musicPlaying=on;
  if(on){
    youtubeCommand('playVideo');
    $('#musicIcon').textContent='Ⅱ';
    $('#musicText').textContent='Pausa';
  }else{
    youtubeCommand('pauseVideo');
    $('#musicIcon').textContent='▷';
    $('#musicText').textContent='Música';
  }
  musicButton?.setAttribute('aria-pressed',String(on));
}
function openInvitation(){
  intro?.classList.add('intro-screen--hidden');
  document.body.classList.remove('intro-locked');
  setTimeout(()=>setMusic(true),500);
}
openInvite?.addEventListener('click',openInvitation);
musicButton?.addEventListener('click',()=>setMusic(!musicPlaying));
document.body.classList.add('intro-locked');

const menuToggle=$('#menuToggle'), navLinks=$('#navLinks');
menuToggle?.addEventListener('click',()=>navLinks.classList.toggle('nav-links--open'));
$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('nav-links--open')));

/* Program modal */
$('#programOpen')?.addEventListener('click',()=>$('#programOverlay').classList.remove('hidden'));
$('#programClose')?.addEventListener('click',()=>$('#programOverlay').classList.add('hidden'));
$('#programOverlay')?.addEventListener('click',e=>{if(e.target.id==='programOverlay')e.currentTarget.classList.add('hidden')});

/* Accounts */
$$('.copy-account').forEach(btn=>btn.addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText(btn.dataset.account||'');
    const old=btn.textContent; btn.textContent='Copiado';
    setTimeout(()=>btn.textContent=old,1600);
  }catch{toast('Não foi possível copiar.');}
}));

/* RSVP */
async function findInvitation(presetKey=null){
  const key=String(presetKey ?? $('#lookupKey').value).trim();
  if(!key)return;
  $('#lookupKey').value=key;
  $('#findBtn').disabled=true;
  $('#lookupMsg').classList.add('hidden');
  const {data,error}=await supabaseClient.rpc('find_invitation',{search_key:key});
  $('#findBtn').disabled=false;
  if(error){
    $('#lookupMsg').textContent='Não foi possível procurar o convite. Tente novamente.';
    $('#lookupMsg').classList.remove('hidden'); return;
  }
  if(!data||data.length===0){
    $('#lookupMsg').textContent='Não encontrámos esse convite. Verifique o nome ou o código.';
    $('#lookupMsg').classList.remove('hidden'); return;
  }
  if(data.length>1){
    $('#lookupMsg').textContent='Encontrámos mais de um convidado com esse nome. Utilize o código do convite.';
    $('#lookupMsg').classList.remove('hidden'); return;
  }
  currentInvitation=data[0];
  const allowed=Math.max(0,Number(currentInvitation.allowed_guests||1)-1);
  $('#guestGreeting').innerHTML=`<strong>Olá, ${escapeHtml(currentInvitation.full_name)}! ❤️</strong><p>O seu convite permite ${Number(currentInvitation.allowed_guests||1)} pessoa(s) no total.</p>`;
  const select=$('#companionCount');
  select.innerHTML='';
  for(let i=0;i<=allowed;i++){
    const o=document.createElement('option');
    o.value=i; o.textContent=i===0?'Sem acompanhante':`${i} acompanhante${i>1?'s':''}`;
    select.appendChild(o);
  }
  $('#lookupStep').classList.add('hidden');
  $('#rsvpStep').classList.remove('hidden');
}
$('#rsvpSearchForm')?.addEventListener('submit',e=>{e.preventDefault();findInvitation();});
$('#changeGuest')?.addEventListener('click',()=>{
  $('#rsvpStep').classList.add('hidden'); $('#lookupStep').classList.remove('hidden');
  currentInvitation=null;
});
let selectedAttendance=null;
$$('[data-rsvp]').forEach(btn=>btn.addEventListener('click',()=>{
  selectedAttendance=btn.dataset.rsvp==='true';
  $$('[data-rsvp]').forEach(b=>b.classList.remove('is-selected'));
  btn.classList.add('is-selected');
  $('#rsvpConfirm').classList.remove('hidden');
  $('#companionArea').classList.toggle('hidden',!selectedAttendance || Number(currentInvitation?.allowed_guests||1)<=1);
  if(!selectedAttendance) $('#companionInputs').innerHTML='';
}));
$('#companionCount')?.addEventListener('change',()=>{
  const n=Number($('#companionCount').value);
  $('#companionInputs').innerHTML=Array.from({length:n},(_,i)=>`<div class="companion-field"><input class="comp-name" required placeholder="Nome do acompanhante ${i+1}"><input class="comp-whatsapp" required placeholder="WhatsApp"></div>`).join('');
});
$('#rsvpConfirm')?.addEventListener('click',async()=>{
  if(!currentInvitation||selectedAttendance===null)return;
  const count=selectedAttendance?Number($('#companionCount').value):0;
  const note='';
  const {error}=await supabaseClient.rpc('save_rsvp',{
    invitation_code:currentInvitation.code,
    attending:selectedAttendance,
    companion_count:count,
    note
  });
  const msg=$('#rsvpMsg'); msg.classList.remove('hidden');
  if(error){msg.textContent='Não foi possível guardar a resposta. Tente novamente.';return;}
  msg.textContent=selectedAttendance?`Obrigado, ${currentInvitation.full_name}! A sua presença foi confirmada. ❤️`:`Obrigado por nos avisar, ${currentInvitation.full_name}. Ficaremos com a sua resposta registada.`;
  $('#rsvpConfirm').disabled=true;
});

/* Gifts */
let allGifts=[], giftFilter='all', selectedGift=null;
function renderGifts(){
  const grid=$('#giftGrid'); if(!grid)return;
  const q=String($('#giftSearch')?.value||'').trim().toLowerCase();
  const filtered=allGifts.filter(g=>{
    const mq=!q||String(g.name).toLowerCase().includes(q)||String(g.item_no).includes(q);
    const mf=giftFilter==='all'||(giftFilter==='available'&&!g.reserved)||(giftFilter==='reserved'&&g.reserved);
    return mq&&mf;
  });
  $('#giftCount').textContent=filtered.length?`${filtered.length} ${filtered.length===1?'presente':'presentes'}`:'Nenhum presente encontrado.';
  if(!filtered.length){grid.innerHTML='<p class="gift-status">Nenhum presente encontrado.</p>';return;}
  grid.innerHTML=filtered.map(g=>{
    const reserved=!!g.reserved;
    return `<div class="gift-list-row ${reserved?'gift-list-row--reserved':''}">
      <span class="gift-index">${String(g.item_no).padStart(2,'0')}</span>
      <span class="gift-name">${escapeHtml(g.name)}</span>
      ${reserved?'<span class="reserved-label">Reservado</span>':'<button class="reserve-button" type="button" data-gift-id="'+g.id+'">Reservar</button>'}
    </div>`;
  }).join('');
  $$('.reserve-button').forEach(b=>b.addEventListener('click',()=>openReservation(b.dataset.giftId)));
}
async function loadGifts(){
  const code=currentInvitation?.code||null;
  const {data,error}=await supabaseClient.rpc('list_gifts',{p_invitation_code:code});
  if(error){$('#giftGrid').innerHTML='<p class="gift-status gift-status--error">Não foi possível carregar os presentes.</p>';return;}
  allGifts=data||[];
  const available=allGifts.filter(g=>!g.reserved).length;
  $('#giftAvailability').textContent=`${available} de ${allGifts.length} disponíveis`;
  renderGifts();
}
function openReservation(id){
  if(!currentInvitation){
    document.getElementById('rsvp').scrollIntoView({behavior:'smooth'});
    toast('Primeiro encontre o seu convite.');
    return;
  }
  const g=allGifts.find(x=>String(x.id)===String(id));
  if(!g||g.reserved)return;
  selectedGift=g;
  $('#reservationTitle').innerHTML=`Reservar<br><i>${escapeHtml(g.name)}</i>`;
  $('#guestName').value=currentInvitation.full_name||'';
  $('#guestWhatsapp').value=currentInvitation.whatsapp||'';
  $('#reservationOverlay').classList.remove('hidden');
}
async function confirmReservation(e){
  e.preventDefault();
  if(!selectedGift||!currentInvitation)return;
  const {error}=await supabaseClient.rpc('reserve_gift',{gift_id:selectedGift.id,invitation_code:currentInvitation.code});
  if(error){toast(error.message.toLowerCase().includes('reserv')?'Este presente já foi reservado por outra pessoa.':'Não foi possível reservar o presente.');return;}
  $('#reservationOverlay').classList.add('hidden');
  await loadGifts();
  toast('Reserva confirmada com carinho. ❤️');
}
$('#reservationForm')?.addEventListener('submit',confirmReservation);
$('#reservationClose')?.addEventListener('click',()=>$('#reservationOverlay').classList.add('hidden'));
$('#reservationCancel')?.addEventListener('click',()=>$('#reservationOverlay').classList.add('hidden'));
$('#giftSearch')?.addEventListener('input',renderGifts);
$$('.gift-filter').forEach(btn=>btn.addEventListener('click',()=>{
  giftFilter=btn.dataset.filter;
  $$('.gift-filter').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); renderGifts();
}));
loadGifts();

/* Personalized invitation */
const inviteParam=new URLSearchParams(location.search).get('convite');
if(inviteParam)setTimeout(()=>findInvitation(inviteParam),250);

/* V4.2 — modal de acessos reservados */
(() => {
  const trigger = document.getElementById('privateAccessTrigger');
  const modal = document.getElementById('privateAccessModal');
  const close = document.getElementById('privateAccessClose');
  if (!trigger || !modal || !close) return;

  const open = () => {
    modal.hidden = false;
    document.body.classList.add('private-access-open');
    close.focus();
  };
  const shut = () => {
    modal.hidden = true;
    document.body.classList.remove('private-access-open');
    trigger.focus();
  };

  trigger.addEventListener('click', open);
  close.addEventListener('click', shut);
  modal.querySelectorAll('[data-close-private]').forEach(el => el.addEventListener('click', shut));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) shut();
  });
})();
