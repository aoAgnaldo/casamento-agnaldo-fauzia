let session=null, guests=[], gifts=[];
let guestFilter='all';
const A=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function showMsg(el,t){el.textContent=t;el.classList.remove('hidden')}
function genCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='AF-';for(let i=0;i<6;i++)out+=chars[Math.floor(Math.random()*chars.length)];return out}
function inviteUrl(){return location.origin+location.pathname.replace(/admin\.html$/,'index.html')}
function makeMessage(g){return `Olá, ${g.full_name}! ❤️\n\nÉ com muita alegria que nós, Agnaldo & Fáuzia, queremos convidar-te para o nosso casamento.\n\n📅 29 de Maio de 2027\n📍 Igreja Universal do Jardim — 09:00\n🎉 Recepção: Sala de Eventos do Kaya Kwanga Residence, às 15h\n\nPreparamos um convite especial para ti:\n👉 ${inviteUrl()}?convite=${encodeURIComponent(g.code)}\n\n🔐 Código do teu convite: ${g.code}\n\nAgradecemos que confirmes a tua presença até 30 de Abril de 2027. ❤️\n\nSerá uma alegria celebrar este momento contigo!`;}
async function init(){const {data}=await supabaseClient.auth.getSession();if(data.session){session=data.session;await enter()}else A('#login').classList.remove('hidden')}
async function enter(){A('#login').classList.add('hidden');A('#app').classList.remove('hidden');await refresh()}
A('#loginForm').onsubmit=async e=>{e.preventDefault();const {error}=await supabaseClient.auth.signInWithPassword({email:A('#email').value,password:A('#password').value});if(error)showMsg(A('#loginMsg'),'Email ou palavra-passe incorrectos.');else await enter()}
A('#logout')?.addEventListener('click',()=>supabaseClient.auth.signOut().then(()=>location.reload()));

async function refresh(){const [{data:g,error:ge},{data:gi,error:gie}]=await Promise.all([supabaseClient.rpc('admin_list_invitations_checkin'),supabaseClient.rpc('admin_list_gifts')]);if(ge){toast(ge.message);return}if(gie){toast(gie.message);return}guests=g||[];gifts=gi||[];render()}
function render(){
 const c={total:guests.length,pending:0,confirmed:0,declined:0,people:0,checkedIn:0,notCheckedIn:0,presentPeople:0};guests.forEach(g=>{if(c[g.rsvp_status]!==undefined)c[g.rsvp_status]++;if(g.rsvp_status==='confirmed'){const people=1+(g.companion_count||0);c.people+=people;if(g.checked_in){c.checkedIn++;c.presentPeople+=people}}});c.notCheckedIn=c.confirmed-c.checkedIn;A('#stTotal').textContent=c.total;A('#stPending').textContent=c.pending;A('#stConfirmed').textContent=c.confirmed;A('#stDeclined').textContent=c.declined;A('#stPeople').textContent=c.people;A('#stCheckedIn').textContent=c.checkedIn;A('#stNotCheckedIn').textContent=c.notCheckedIn;A('#stPresentPeople').textContent=c.presentPeople;
 const q=String(A('#guestSearch')?.value||'').trim().toLowerCase();
 const filteredGuests=guests.filter(g=>{
   const hay=[g.full_name,g.code,g.whatsapp].map(v=>String(v||'').toLowerCase()).join(' ');
   const matchesQ=!q||hay.includes(q);
   const matchesF=guestFilter==='all'||(guestFilter==='confirmed'&&g.rsvp_status==='confirmed')||(guestFilter==='pending'&&g.rsvp_status==='pending')||(guestFilter==='declined'&&g.rsvp_status==='declined')||(guestFilter==='checked'&&!!g.checked_in)||(guestFilter==='waiting'&&g.rsvp_status==='confirmed'&&!g.checked_in);
   return matchesQ&&matchesF;
 });
 A('#guestCount').textContent=`${filteredGuests.length} de ${guests.length} convite(s)`;
 A('#guestRows').innerHTML=filteredGuests.map(g=>`<tr><td data-label="Nome"><span class="mobile-row-title">${esc(g.full_name)}</span></td><td data-label="Código"><strong>${esc(g.code)}</strong></td><td data-label="WhatsApp">${esc(g.whatsapp||'—')}</td><td data-label="Lotação">${g.allowed_guests}</td><td data-label="Estado"><span class="badge ${g.rsvp_status}">${g.rsvp_status}</span></td><td data-label="Pessoas">${g.rsvp_status==='confirmed'?1+(g.companion_count||0):0}</td><td data-label="Confirmado em">${g.rsvp_at?new Date(g.rsvp_at).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'}):'—'}</td><td data-label="Entrada">${g.checked_in?'<span class="badge confirmed">Entrada registada</span>':'<span class="badge pending">Por entrar</span>'}</td><td data-label="Acções"><div class="mobile-actions"><button class="button secondary" onclick="editGuest('${g.id}')">Editar</button> <button class="button secondary" onclick="openQR('${g.id}')">▣ QR</button> <button class="button secondary" onclick="openWhats('${g.id}')">${g.invitation_sent_at?'Reenviar':'Enviar convite'}</button> <button class="button danger" onclick="removeGuest('${g.id}')">Remover</button></div></td></tr>`).join('');
 A('#giftRows').innerHTML=gifts.map(g=>`<tr><td data-label="Foto">${g.image_url?`<img class="gift-admin-thumb" src="${esc(g.image_url)}" alt="">`:'<div class="gift-admin-placeholder">♡</div>'}</td><td data-label="#">${g.item_no}</td><td data-label="Presente"><span class="mobile-row-title">${esc(g.name)}</span></td><td data-label="Estado">${g.reserved?'<span class="badge confirmed">Reservado</span>':'<span class="badge pending">Livre</span>'}</td><td data-label="Reservado por">${esc(g.reserved_by_name||'—')}</td><td data-label="Acções"><div class="gift-actions"><button class="button secondary" onclick="editGift(${g.id})">Editar</button><button class="button danger" onclick="deleteGift(${g.id})" ${g.reserved?'disabled':''}>Remover</button></div></td></tr>`).join('');
}

let currentQrGuest=null;
window.openQR=id=>{
 const g=guests.find(x=>x.id===id); if(!g)return; currentQrGuest=g;
 const url=inviteUrl()+`?convite=${encodeURIComponent(g.code)}`;
 A('#qrGuestName').textContent=`${g.full_name} — ${g.code}`;
 A('#qrUrl').textContent=url;
 const box=A('#qrCode'); box.innerHTML='';
 new QRCode(box,{text:url,width:240,height:240});
 A('#qrModal').classList.remove('hidden');
};
A('#closeQrModal').onclick=()=>A('#qrModal').classList.add('hidden');
A('#copyInviteLink').onclick=async()=>{if(!currentQrGuest)return;const url=inviteUrl()+`?convite=${encodeURIComponent(currentQrGuest.code)}`;await navigator.clipboard.writeText(url);toast('Link do convite copiado.');};
A('#downloadQr').onclick=()=>{const img=A('#qrCode img')||A('#qrCode canvas');if(!img){toast('QR Code ainda não está pronto.');return;}const a=document.createElement('a');a.href=img.tagName.toLowerCase()==='canvas'?img.toDataURL('image/png'):img.src;a.download=`convite-${currentQrGuest.code}.png`;a.click();};
function openModal(g={id:'',full_name:'',whatsapp:'',allowed_guests:1,code:genCode()}){A('#modalTitle').textContent=g.id?'Editar convidado':'Novo convidado';A('#guestId').value=g.id;A('#gName').value=g.full_name;A('#gPhone').value=g.whatsapp||'';A('#gAllowed').value=g.allowed_guests;A('#gCode').value=g.code;A('#gMessage').value=makeMessage(g);A('#waLink').href=g.whatsapp?`https://wa.me/${String(g.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(makeMessage(g))}`:'#';A('#modal').classList.remove('hidden')}
window.editGuest=id=>openModal(guests.find(x=>x.id===id));
window.sendWhats=async id=>{const g=guests.find(x=>x.id===id);if(!g)return;if(!g.whatsapp){toast('Este convidado ainda não tem WhatsApp registado.');return}const url=`https://wa.me/${String(g.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(makeMessage(g))}`;window.open(url,'_blank');const {error}=await supabaseClient.rpc('admin_mark_invitation_sent',{invitation_id:id});if(error){toast('WhatsApp aberto, mas não foi possível registar o envio.');return}await refresh();toast('Convite marcado como enviado. ❤️')};
window.openWhats=window.sendWhats;
window.removeGuest=async id=>{const g=guests.find(x=>x.id===id);if(!g)return;if(!confirm(`Remover o convite de “${g.full_name}”? Esta acção não pode ser anulada.`))return;const {error}=await supabaseClient.rpc('admin_delete_invitation',{invitation_id:id});if(error){toast(error.message);return}await refresh();toast('Convidado removido.')} ;

A('#guestSearch')?.addEventListener('input',render);
document.querySelectorAll('.guest-filter').forEach(btn=>btn.addEventListener('click',()=>{guestFilter=btn.dataset.guestFilter;document.querySelectorAll('.guest-filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');render()}));
A('#addBtn').onclick=()=>openModal();A('#addBtn2')?.addEventListener('click',()=>openModal());A('#closeModal').onclick=()=>A('#modal').classList.add('hidden');
async function saveGuestForm(){
 const id=A('#guestId').value;
 const name=A('#gName').value.trim();
 const phone=A('#gPhone').value.trim();
 const allowed=Number(A('#gAllowed').value);
 const code=A('#gCode').value.trim();
 const btn=document.querySelector('#guestForm button[type=submit]');
 const msg=A('#formMsg');
 if(!name){showMsg(msg,'Preencha o nome completo do convidado.');A('#gName').focus();return}
 if(!allowed || allowed<1){showMsg(msg,'Indique quantas pessoas são permitidas.');A('#gAllowed').focus();return}
 btn.disabled=true;btn.textContent='A guardar…';msg.classList.add('hidden');
 try{
  if(!navigator.onLine) throw new Error('Sem ligação à Internet. Verifique a ligação e tente novamente.');
  if(id){
   const r=await supabaseClient.rpc('admin_update_invitation',{invitation_id:id,p_full_name:name,p_whatsapp:phone,p_allowed_guests:allowed});
   if(r.error) throw r.error;
  }else{
   let created=false,lastErr=null;
   for(let attempt=0;attempt<5&&!created;attempt++){
    const newCode=attempt===0&&code?code:genCode();
    const r=await supabaseClient.rpc('admin_create_invitation',{p_code:newCode,p_full_name:name,p_whatsapp:phone,p_allowed_guests:allowed});
    if(!r.error) created=true; else lastErr=r.error;
   }
   if(!created) throw lastErr||new Error('Não foi possível criar o convite.');
  }
  A('#modal').classList.add('hidden');
  await refresh();
  toast('Convidado guardado. ❤️');
 }catch(err){
  console.error('Erro ao guardar convidado:',err);
  showMsg(msg,err?.message||String(err));
 }finally{btn.disabled=false;btn.textContent='Guardar'}
}
A('#guestForm').addEventListener('submit',e=>{e.preventDefault();saveGuestForm()});
A('#guestForm button[type=submit]').addEventListener('click',e=>{e.preventDefault();saveGuestForm()});
A('#copyMsg').onclick=async()=>{await navigator.clipboard.writeText(A('#gMessage').value);toast('Mensagem copiada.')}
A('#csvBtn').onclick=()=>A('#csvFile').click();
A('#csvFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;const text=await f.text();const lines=text.split(/\r?\n/).filter(Boolean);const sep=lines[0].includes(';')?';':',';const heads=lines.shift().split(sep).map(x=>x.trim().toLowerCase());let ok=0;for(const line of lines){const v=line.split(sep).map(x=>x.trim().replace(/^"|"$/g,''));const row=Object.fromEntries(heads.map((h,i)=>[h,v[i]||'']));const {error}=await supabaseClient.rpc('admin_create_invitation',{p_code:row.codigo||genCode(),p_full_name:row.nome||row.name||'',p_whatsapp:row.whatsapp||row.telefone||'',p_allowed_guests:Number(row.permitidos||row.allowed_guests||1)});if(!error)ok++}toast(`${ok} convidado(s) importado(s).`);await refresh();e.target.value=''};
A('#exportBtn').onclick=()=>{const heads=['nome','codigo','whatsapp','permitidos','estado','acompanhantes'];const rows=guests.map(g=>[g.full_name,g.code,g.whatsapp||'',g.allowed_guests,g.rsvp_status,g.companion_count||0]);const csv=[heads,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');const blob=new Blob(["\ufeff"+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='convidados-agnaldo-fauzia.csv';a.click();URL.revokeObjectURL(a.href)};

// ---------------- CHECK-IN ----------------
let scanner=null;
function renderCheckinResult(g){
 const box=A('#checkinResult');
 if(!g){box.classList.add('hidden');return;}
 const people=1+(g.companion_count||0);
 const status=g.checked_in
   ? `<div class="checkin-ok"><strong>✓ Entrada já registada</strong><span>${g.checked_in_at?new Date(g.checked_in_at).toLocaleString('pt-PT'):''}</span></div>`
   : `<div class="checkin-wait"><strong>Convite válido</strong><span>${g.rsvp_status==='confirmed'?'Presença confirmada':'Estado: '+g.rsvp_status}</span></div>`;
 box.innerHTML=`<div class="checkin-person"><div><p class="eyebrow">Convidado</p><h3>${esc(g.full_name)}</h3><p><strong>${esc(g.code)}</strong> · ${people} pessoa(s) · permitido: ${g.allowed_guests}</p>${status}</div><div>${g.checked_in?`<button class="button secondary" onclick="cancelCheckin('${g.id}')">Anular entrada</button>`:`<button class="button" onclick="confirmCheckin('${g.id}')">Confirmar entrada</button>`}</div></div>`;
 box.classList.remove('hidden');
}
async function searchCheckin(raw){
 const key=String(raw||'').trim(); if(!key){toast('Introduza o código do convite.');return;}
 const g=guests.find(x=>x.code.toLowerCase()===key.toLowerCase());
 if(!g){renderCheckinResult(null);toast('Convite não encontrado.');return;}
 renderCheckinResult(g);
}
window.confirmCheckin=async id=>{const g=guests.find(x=>x.id===id);if(!g)return;if(g.checked_in){renderCheckinResult(g);return}const {error}=await supabaseClient.rpc('admin_check_in_invitation',{invitation_id:id});if(error){toast(error.message);return}await refresh();const updated=guests.find(x=>x.id===id);renderCheckinResult(updated);toast(`Entrada confirmada: ${g.full_name}. ❤️`);};
window.cancelCheckin=async id=>{const g=guests.find(x=>x.id===id);if(!g)return;if(!confirm(`Anular a entrada de “${g.full_name}”?`))return;const {error}=await supabaseClient.rpc('admin_cancel_check_in',{invitation_id:id});if(error){toast(error.message);return}await refresh();renderCheckinResult(guests.find(x=>x.id===id));toast('Entrada anulada.');};
A('#checkinSearchBtn').onclick=()=>searchCheckin(A('#checkinCode').value);
A('#checkinCode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchCheckin(e.target.value)}});
A('#startScannerBtn').onclick=async()=>{
 if(!window.Html5Qrcode){toast('Leitor QR indisponível.');return}
 if(scanner)return;
 const reader=A('#qrReader');reader.classList.remove('hidden');A('#startScannerBtn').classList.add('hidden');A('#stopScannerBtn').classList.remove('hidden');
 scanner=new Html5Qrcode('qrReader');
 try{await scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:250,height:250}},text=>{let code=text;try{const u=new URL(text);code=u.searchParams.get('convite')||text}catch(_){}A('#checkinCode').value=code;searchCheckin(code);stopScanner();},()=>{});}catch(err){toast('Não foi possível abrir a câmara. Verifique a permissão do navegador.');stopScanner();}
};
async function stopScanner(){if(!scanner){A('#qrReader').classList.add('hidden');A('#startScannerBtn').classList.remove('hidden');A('#stopScannerBtn').classList.add('hidden');return}try{await scanner.stop();}catch(_){}try{scanner.clear();}catch(_){}scanner=null;A('#qrReader').classList.add('hidden');A('#startScannerBtn').classList.remove('hidden');A('#stopScannerBtn').classList.add('hidden');}
A('#stopScannerBtn').onclick=stopScanner;
// ---------------- PRESENTES ----------------
let editingGiftId=null;
let oldGiftImageUrl=null;
let removeGiftImage=false;

function giftPathFromUrl(url){
 if(!url)return null;
 const marker='/storage/v1/object/public/gift-photos/';
 const idx=String(url).indexOf(marker);
 return idx>=0?String(url).slice(idx+marker.length):null;
}

function resetGiftModal(){
 editingGiftId=null; oldGiftImageUrl=null; removeGiftImage=false;
 A('#giftForm').reset();
 A('#giftId').value='';
 A('#giftModalTitle').textContent='Novo presente';
 A('#giftSaveBtn').textContent='Guardar presente';
 A('#removeGiftPhoto').classList.add('hidden');
 A('#giftCurrent').classList.add('hidden');A('#giftCurrent').innerHTML='';
 A('#giftPreview').classList.add('hidden');A('#giftPreview').innerHTML='';
 A('#giftFormMsg').classList.add('hidden');A('#giftFormMsg').textContent='';
}

A('#addGiftBtn').onclick=()=>{resetGiftModal();A('#giftModal').classList.remove('hidden')};
A('#closeGiftModal').onclick=()=>A('#giftModal').classList.add('hidden');

window.editGift=id=>{
 const g=gifts.find(x=>String(x.id)===String(id)); if(!g)return;
 resetGiftModal(); editingGiftId=g.id; oldGiftImageUrl=g.image_url||null;
 A('#giftId').value=g.id; A('#giftName').value=g.name||'';
 A('#giftModalTitle').textContent='Editar presente'; A('#giftSaveBtn').textContent='Guardar alterações';
 if(g.image_url){
   A('#giftCurrent').innerHTML=`<p class="muted">Fotografia actual:</p><img src="${esc(g.image_url)}" alt="${esc(g.name)}">`;
   A('#giftCurrent').classList.remove('hidden'); A('#removeGiftPhoto').classList.remove('hidden');
 }
 A('#giftModal').classList.remove('hidden');
};

A('#removeGiftPhoto').onclick=()=>{
 if(!editingGiftId){return}
 removeGiftImage=true;
 A('#giftCurrent').classList.add('hidden');
 A('#removeGiftPhoto').classList.add('hidden');
 A('#giftPreview').classList.add('hidden'); A('#giftPreview').innerHTML='';
 toast('A fotografia será removida ao guardar.');
};

A('#giftPhoto').onchange=e=>{
 const f=e.target.files[0],box=A('#giftPreview');
 if(!f){box.classList.add('hidden');return}
 if(!/^image\/(jpeg|png|webp)$/.test(f.type)){showMsg(A('#giftFormMsg'),'Escolha uma imagem JPG, PNG ou WebP válida.');e.target.value='';return}
 if(f.size>15*1024*1024){showMsg(A('#giftFormMsg'),'A fotografia original é demasiado grande. Escolha uma imagem com menos de 15 MB.');e.target.value='';return}
 removeGiftImage=false;
 const url=URL.createObjectURL(f);
 box.innerHTML=`<p class="muted">Pré-visualização:</p><img src="${url}" alt="Pré-visualização">`;box.classList.remove('hidden');
};

async function compressGiftImage(file){
 const img=new Image();
 const src=URL.createObjectURL(file);
 try{
   await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Não foi possível ler a fotografia.')) ;img.src=src});
   const max=1600, scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
   const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext('2d'); if(!ctx)throw new Error('O navegador não conseguiu preparar a fotografia.');
   ctx.drawImage(img,0,0,w,h);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.82));
   if(!blob)throw new Error('Não foi possível comprimir a fotografia.');
   return new File([blob],`presente-${Date.now()}.webp`,{type:'image/webp'});
 }finally{URL.revokeObjectURL(src)}
}

async function uploadGiftPhoto(giftId,file){
 const compressed=await compressGiftImage(file);
 const path=`${giftId}/${crypto.randomUUID()}.webp`;
 const up=await supabaseClient.storage.from('gift-photos').upload(path,compressed,{cacheControl:'31536000',upsert:false,contentType:'image/webp'});
 if(up.error)throw new Error('A fotografia não pôde ser carregada: '+up.error.message);
 return {path,url:supabaseClient.storage.from('gift-photos').getPublicUrl(path).data.publicUrl};
}

async function setGiftImage(id,url){
 const {error}=await supabaseClient.rpc('admin_update_gift_image',{gift_id:id,p_image_url:url||null});
 if(error)throw new Error('Não foi possível guardar a fotografia: '+error.message);
}

A('#giftForm').onsubmit=async e=>{
 e.preventDefault();
 const name=A('#giftName').value.trim(),file=A('#giftPhoto').files[0],id=editingGiftId;
 if(!name)return;
 const btn=A('#giftSaveBtn');btn.disabled=true;btn.textContent=file?'A preparar fotografia…':'A guardar…';A('#giftFormMsg').classList.add('hidden');
 let createdId=null,newUpload=null;
 try{
   if(id){
     const {error}=await supabaseClient.rpc('admin_update_gift',{gift_id:id,p_name:name});
     if(error)throw new Error('Não foi possível actualizar o presente: '+error.message);
     if(file){
       newUpload=await uploadGiftPhoto(id,file);
       await setGiftImage(id,newUpload.url);
       if(oldGiftImageUrl && oldGiftImageUrl!==newUpload.url){const oldPath=giftPathFromUrl(oldGiftImageUrl);if(oldPath)await supabaseClient.storage.from('gift-photos').remove([oldPath]);}
     }else if(removeGiftImage && oldGiftImageUrl){
       await setGiftImage(id,null);
       const oldPath=giftPathFromUrl(oldGiftImageUrl);if(oldPath)await supabaseClient.storage.from('gift-photos').remove([oldPath]);
     }
     A('#giftModal').classList.add('hidden');await refresh();toast('Presente actualizado com sucesso. ❤️');
   }else{
     const {data,error}=await supabaseClient.rpc('admin_create_gift',{p_name:name});
     if(error)throw new Error('Não foi possível criar o presente: '+error.message);
     createdId=typeof data==='object'&&data!==null?(data.id??data):data;
     if(!createdId)throw new Error('O presente foi criado, mas o sistema não recebeu o identificador.');
     if(file){
       try{newUpload=await uploadGiftPhoto(createdId,file);await setGiftImage(createdId,newUpload.url)}
       catch(err){await supabaseClient.rpc('admin_delete_gift',{gift_id:createdId});if(newUpload?.path)await supabaseClient.storage.from('gift-photos').remove([newUpload.path]);throw err}
     }
     A('#giftModal').classList.add('hidden');await refresh();toast('Presente adicionado com sucesso. ❤️');
   }
 }catch(err){showMsg(A('#giftFormMsg'),err.message||String(err));}
 finally{btn.disabled=false;btn.textContent=id?'Guardar alterações':'Guardar presente';}
};

window.deleteGift=async id=>{
 const g=gifts.find(x=>String(x.id)===String(id));if(!g)return;
 if(g.reserved){toast('Não é possível remover um presente já reservado.');return}
 if(!confirm(`Remover o presente “${g.name}”?`))return;
 const {error}=await supabaseClient.rpc('admin_delete_gift',{gift_id:id});
 if(error){toast(error.message);return}
 const path=giftPathFromUrl(g.image_url);if(path)await supabaseClient.storage.from('gift-photos').remove([path]);
 await refresh();toast('Presente removido.');
};

function toast(t){const x=document.createElement('div');x.className='toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),3000)}
init();