let currentInvitation=null;
const $=s=>document.querySelector(s);
function toast(t){const x=document.createElement('div');x.className='toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),3500)}
function countdown(){const end=new Date('2027-05-29T15:00:00+02:00').getTime(),n=new Date().getTime(),d=Math.max(0,end-n),sec=Math.floor(d/1000);$('#days').textContent=Math.floor(sec/86400);$('#hours').textContent=Math.floor(sec%86400/3600);$('#minutes').textContent=Math.floor(sec%3600/60);$('#seconds').textContent=sec%60}
setInterval(countdown,1000);countdown();

async function findInvitation(presetKey=null){
 const key=String(presetKey??$('#lookupKey').value).trim(); if(!key)return;
 $('#lookupKey').value=key;
 $('#findBtn').disabled=true; $('#lookupMsg').classList.add('hidden');
 const {data,error}=await supabaseClient.rpc('find_invitation',{search_key:key});
 $('#findBtn').disabled=false;
 if(error){$('#lookupMsg').textContent='Não foi possível procurar o convite. Tente novamente.';$('#lookupMsg').classList.remove('hidden');return}
 if(!data||data.length===0){$('#lookupMsg').textContent='Não encontrámos esse convite. Verifique o nome ou o código.';$('#lookupMsg').classList.remove('hidden');return}
 if(data.length>1){$('#lookupMsg').textContent='Encontrámos mais de um convidado com esse nome. Por favor, utilize o código do convite.';$('#lookupMsg').classList.remove('hidden');return}
 currentInvitation=data[0];
 $('#guestGreeting').innerHTML=`Olá, <strong>${escapeHtml(currentInvitation.full_name)}</strong>! ❤️<br>O seu convite permite ${currentInvitation.allowed_guests} pessoa(s) no total.`;
 const s=$('#companionCount');s.innerHTML='';for(let i=0;i<=Math.max(0,currentInvitation.allowed_guests-1);i++){const o=document.createElement('option');o.value=i;o.textContent=i===0?'Apenas eu':`${i} acompanhante${i>1?'s':''}`;s.appendChild(o)}
 $('#lookupStep').classList.add('hidden');$('#rsvpStep').classList.remove('hidden');
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
$('#findBtn').onclick=findInvitation;
$('#lookupKey').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();findInvitation()}});
$('#changeGuest').onclick=()=>{$('#rsvpStep').classList.add('hidden');$('#lookupStep').classList.remove('hidden');currentInvitation=null};

$('#rsvpForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!currentInvitation)return;
 const attending=$('input[name="attending"]:checked')?.value==='true';
 const count=attending?Number($('#companionCount').value):0;
 const note=$('#note').value.trim();
 const {error}=await supabaseClient.rpc('save_rsvp',{invitation_code:currentInvitation.code,attending,companion_count:count,note});
 const msg=$('#rsvpMsg');msg.classList.remove('hidden');
 if(error){msg.textContent='Não foi possível guardar a resposta. Tente novamente.';return}
 msg.textContent=attending?`Obrigado, ${currentInvitation.full_name}! A sua presença foi confirmada. ❤️`:`Obrigado por nos avisar, ${currentInvitation.full_name}. Ficaremos com a sua resposta registada.`;
 e.target.querySelector('button[type="submit"]').disabled=true;
 loadGifts();
});

let allGifts=[];
let giftFilter='all';
function renderGifts(){
 const grid=$('#giftGrid');grid.innerHTML='';
 const q=String($('#giftSearch')?.value||'').trim().toLowerCase();
 const filtered=allGifts.filter(g=>{
   const matchesQ=!q||String(g.name).toLowerCase().includes(q)||String(g.item_no).includes(q);
   const matchesF=giftFilter==='all'||(giftFilter==='available'&&!g.reserved)||(giftFilter==='reserved'&&g.reserved);
   return matchesQ&&matchesF;
 });
 $('#giftCount').textContent=filtered.length?`${filtered.length} ${filtered.length===1?'presente':'presentes'}`:'Nenhum presente encontrado.';
 if(!filtered.length){grid.innerHTML='<div class="gift-empty"><div>♡</div><strong>Não encontrámos esse presente.</strong><p class="muted">Experimente outro termo ou veja todos os presentes.</p></div>';return}
 filtered.forEach(g=>{
   const d=document.createElement('article');d.className='gift'+(g.reserved?' reserved':'')+(g.reserved_by_me?' mine':'');
   const photo=g.image_url?`<div class="gift-media"><img src="${escapeHtml(g.image_url)}" alt="${escapeHtml(g.name)}" class="gift-photo"><span class="gift-status ${g.reserved_by_me?'mine':'reserved'}">${g.reserved_by_me?'Reservado por si':'Reservado'}</span></div>`:`<div class="gift-media no-photo"><span>♡</span></div>`;
   let action='';
   if(g.reserved_by_me){action='<div class="gift-mine"><span>✓ Este presente está reservado por si.</span><button class="button gift-share" type="button">Partilhar no WhatsApp</button></div>'}
   else if(g.reserved){action='<div class="gift-locked">Este presente já foi escolhido por outro convidado.</div>'}
   else if(currentInvitation){action='<button class="button gift-reserve" type="button">Quero oferecer este presente</button>'}
   else{action='<p class="muted gift-login-hint">Encontre o seu convite acima para reservar.</p>'}
   d.innerHTML=`${photo}<div class="gift-body"><span class="gift-number">${g.item_no}</span><h3>${escapeHtml(g.name)}</h3>${action}</div>`;
   const reserve=d.querySelector('.gift-reserve');if(reserve)reserve.onclick=()=>reserveGift(g.id);
   const share=d.querySelector('.gift-share');if(share)share.onclick=()=>shareGift(g);
   grid.appendChild(d);
 });
}
async function loadGifts(){
 const code=currentInvitation?.code||null;
 const {data,error}=await supabaseClient.rpc('list_gifts',{p_invitation_code:code});
 if(error){$('#giftGrid').innerHTML='<p class="muted">A lista de presentes estará disponível em breve.</p>';return}
 allGifts=data||[];renderGifts();
}
async function reserveGift(id){
 if(!currentInvitation){location.hash='confirmar';toast('Primeiro encontre o seu convite.');return}
 const g=allGifts.find(x=>String(x.id)===String(id));if(!g||g.reserved)return;
 if(!confirm(`Deseja reservar “${g.name}” como presente para Agnaldo & Fáuzia?`))return;
 const {error}=await supabaseClient.rpc('reserve_gift',{gift_id:id,invitation_code:currentInvitation.code});
 if(error){toast(error.message.toLowerCase().includes('reservado')||error.message.toLowerCase().includes('reserved')?'Este presente acabou de ser reservado por outra pessoa.':'Não foi possível reservar o presente.');return}
 await loadGifts();toast('Presente reservado com sucesso. ❤️');
}
function shareGift(g){
 const text=`Olá! ❤️ Reservei “${g.name}” como presente para o casamento de Agnaldo & Fáuzia, no dia 29 de Maio de 2027. 🎁`;
 const url=`https://wa.me/?text=${encodeURIComponent(text)}`;window.open(url,'_blank');
}
$('#giftSearch')?.addEventListener('input',renderGifts);
document.querySelectorAll('.gift-filter').forEach(btn=>btn.addEventListener('click',()=>{giftFilter=btn.dataset.filter;document.querySelectorAll('.gift-filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderGifts()}));
loadGifts();
const inviteParam=new URLSearchParams(location.search).get('convite');
if(inviteParam){setTimeout(()=>findInvitation(inviteParam),150);}
