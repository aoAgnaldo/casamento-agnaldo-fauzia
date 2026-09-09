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
    $('#musicText').textContent='Pausar';
    musicButton?.setAttribute('aria-label','Pausar música');
  }else{
    youtubeCommand('pauseVideo');
    $('#musicIcon').textContent='▷';
    $('#musicText').textContent='Música';
    musicButton?.setAttribute('aria-label','Reproduzir música');
  }
  musicButton?.setAttribute('aria-pressed',String(on));
}
function releaseIntroScroll(){
  document.body.classList.remove('intro-locked');
  document.documentElement.classList.remove('intro-locked');
}
function openInvitation(){
  releaseIntroScroll();
  document.body.classList.add('invitation-opened');
  document.documentElement.classList.add('invitation-opened');
  intro?.classList.add('intro-screen--hidden');
  // Garantir posição inicial consistente depois de desbloquear o documento.
  if(window.scrollY < 2) window.scrollTo({top:0,left:0,behavior:'auto'});
  setTimeout(()=>setMusic(true),500);
}
openInvite?.addEventListener('click',openInvitation);
musicButton?.addEventListener('click',()=>setMusic(!musicPlaying));
document.body.classList.add('intro-locked');
document.documentElement.classList.add('intro-locked');

const menuToggle=$('#menuToggle'), navLinks=$('#navLinks');
function toggleNav(){
  const willOpen=!navLinks?.classList.contains('nav-links--open');
  navLinks?.classList.toggle('nav-links--open',willOpen);
  menuToggle?.setAttribute('aria-expanded',String(willOpen));
  menuToggle?.setAttribute('aria-label',willOpen?'Fechar menu':'Abrir menu');
}
function closeNav(){
  navLinks?.classList.remove('nav-links--open');
  menuToggle?.setAttribute('aria-expanded','false');
  menuToggle?.setAttribute('aria-label','Abrir menu');
}
menuToggle?.addEventListener('click',toggleNav);
$$('.nav-links a').forEach(a=>a.addEventListener('click',closeNav));

/* Program modal + programa editável */
const programOverlay=$('#programOverlay');
const reservationOverlay=$('#reservationOverlay');
function setPublicModalLock(locked){
  document.body.classList.toggle('public-modal-open',locked);
  document.documentElement.classList.toggle('public-modal-open',locked);
}
function closeProgram(){
  programOverlay?.classList.add('hidden');
  setPublicModalLock(false);
}
function openProgram(){
  programOverlay?.classList.remove('hidden');
  setPublicModalLock(true);
  setTimeout(()=>$('#programClose')?.focus(),50);
}
$('#programOpen')?.addEventListener('click',openProgram);
$('#programClose')?.addEventListener('click',closeProgram);
programOverlay?.addEventListener('click',e=>{if(e.target===programOverlay)closeProgram()});

const fallbackProgram=[
 {date:'29 MAIO',time:'09:00',title:'Cerimónia religiosa',description:'Na Igreja Universal — Jardim, vamos celebrar a nossa união perante Deus, a família e os amigos.',location:'Igreja Universal — Jardim, Maputo',map_url:'https://www.google.com/maps/search/?api=1&query=Igreja%20Universal%20Jardim%20Maputo'},
 {date:'29 MAIO',time:'Depois da cerimónia',title:'Sessão de fotos',description:'Após a cerimónia, teremos um momento reservado para fotografias e para guardar memórias deste dia especial.',location:'',map_url:''},
 {date:'29 MAIO',time:'15:00',title:'Recepção',description:'Receberemos os nossos convidados na Sala de Eventos do Kaya Kwanga Residence.',location:'Sala de Eventos do Kaya Kwanga Residence, Maputo',map_url:'https://www.google.com/maps/search/?api=1&query=Kaya%20Kwanga%20Residence%20Maputo'}
];
function renderProgramItems(items){
  const compact=document.querySelector('#programCompactList'), modal=document.querySelector('#programModalList');
  if(!compact&&!modal)return;
  const list=(Array.isArray(items)&&items.length?items:fallbackProgram);
  const html=list.map((p,i)=>`<article class="program-item"><span class="program-number">${String(i+1).padStart(2,'0')}</span><div><p class="program-time">${escapeHtml(p.date||'')}${p.time?' · '+escapeHtml(p.time):''}</p><h3>${escapeHtml(p.title||'')}</h3><p>${escapeHtml(p.description||'')}</p>${p.location?`<p class="program-location">⌖ ${escapeHtml(p.location)}</p>`:''}${p.map_url?`<a href="${escapeHtml(p.map_url)}" target="_blank" rel="noreferrer">Ver localização ↗</a>`:''}</div></article>`).join('');
  if(compact)compact.innerHTML=html; if(modal)modal.innerHTML=html;
}
async function loadProgram(){
  try{
    const {data,error}=await supabaseClient.from('wedding_settings').select('program_items').eq('id',1).maybeSingle();
    if(error||!data?.program_items){renderProgramItems(fallbackProgram);return}
    renderProgramItems(data.program_items);
  }catch(_){renderProgramItems(fallbackProgram)}
}
loadProgram();

/* Accounts */
$$('.copy-account').forEach(btn=>btn.addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText(btn.dataset.account||'');
    const old=btn.textContent; btn.textContent='Copiado';
    setTimeout(()=>btn.textContent=old,1600);
  }catch{toast('Não foi possível copiar.');}
}));

/* Imagens do convite — geridas pelo painel Admin */
async function loadWeddingImages(){
  try{
    const {data,error}=await supabaseClient.from('wedding_settings').select('cover_image_url,story_image_url,details_image_url,story_text,site_content,bank_accounts,details_items,story_images').eq('id',1).maybeSingle();
    if(error || !data) return;
    const content=data.site_content||{};
    const cover=data.cover_image_url || 'monogram.svg';
    const story=data.story_image_url || cover;
    const details=data.details_image_url || cover;
    const coverImg=document.querySelector('.hero-image img');
    const q=(sel)=>document.querySelector(sel);
    const heroKicker=q('.hero-kicker'), heroTitle=q('.hero h2'), heroCopy=q('.hero-copy');
    if(heroKicker&&content.hero_kicker)heroKicker.textContent=content.hero_kicker;
    if(heroTitle&&(content.hero_title_line1||content.hero_title_line2))heroTitle.innerHTML=`${escapeHtml(content.hero_title_line1||'Um amor')}<br><i>${escapeHtml(content.hero_title_line2||'toda a vida')}</i>`;
    if(heroCopy&&content.hero_copy)heroCopy.textContent=content.hero_copy;
    const dateMain=q('.date-main h2'); if(dateMain&&content.date_label)dateMain.textContent=content.date_label;
    const sig=q('.signature'); if(sig&&content.story_signature)sig.textContent=content.story_signature;
    const giftsIntro=q('#presentes .gifts-heading > p:not(.section-label)'); if(giftsIntro&&content.gifts_intro)giftsIntro.textContent=content.gifts_intro;
    const contribName=q('.contribution-box p:nth-of-type(2) strong'); if(contribName&&content.contribution_name)contribName.textContent=content.contribution_name;
    const giftsNote=q('.gift-list-note'); if(giftsNote&&content.gifts_note)giftsNote.textContent=content.gifts_note;
    const rsvpCopy=q('.rsvp-copy'); if(rsvpCopy&&content.rsvp_copy)rsvpCopy.textContent=content.rsvp_copy;
    const rsvpHelp=q('.rsvp-help a'); if(rsvpHelp&&content.rsvp_help)rsvpHelp.textContent=content.rsvp_help;
    const footerNames=q('.footer-names'); if(footerNames&&content.footer_names)footerNames.innerHTML=escapeHtml(content.footer_names).replace('&amp;','<i>&amp;</i>');
    const footerDate=q('.footer > div:first-child p:nth-child(2)'); if(footerDate&&content.footer_date)footerDate.textContent=content.footer_date;
    const detailsH=q('.details-copy h2'); if(detailsH&&(content.details_title_1||content.details_title_2))detailsH.innerHTML=`${escapeHtml(content.details_title_1||'Alguns detalhes')}<br><i>${escapeHtml(content.details_title_2||'importantes')}</i>`;
    const storyImg=document.querySelector('.story-image img');
    const detailsImg=document.querySelector('.details-image img');
    if(coverImg) coverImg.src=cover;
    if(storyImg) storyImg.src=story;
    if(detailsImg) detailsImg.src=details;
    const gallery=Array.isArray(data.story_images)&&data.story_images.length?data.story_images.filter(x=>x?.url).map((x,i)=>({url:x.url,caption:x.caption||`Momento ${i+1}`})):[{url:story,caption:'Onde tudo faz sentido'},{url:details,caption:'Para sempre começa agora'}];
    setMobileGalleryImages(gallery);
    if(data.story_text){
      const box=document.querySelector('#storyTextContent');
      if(box) box.innerHTML=String(data.story_text).split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>`).join('');
    }
    renderEditableGuestContent(data);
  }catch(_){/* mantém as imagens de fallback */}
}
loadWeddingImages();

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
  document.querySelector('.rsvp-mobile-steps span:nth-child(1)')?.classList.remove('is-active');
  document.querySelector('.rsvp-mobile-steps span:nth-child(2)')?.classList.add('is-active');
}
$('#rsvpSearchForm')?.addEventListener('submit',e=>{e.preventDefault();findInvitation();});
$('#changeGuest')?.addEventListener('click',()=>{
  $('#rsvpStep').classList.add('hidden'); $('#lookupStep').classList.remove('hidden');
  document.querySelector('.rsvp-mobile-steps span:nth-child(2)')?.classList.remove('is-active');
  document.querySelector('.rsvp-mobile-steps span:nth-child(1)')?.classList.add('is-active');
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
const giftPhotoLightbox=document.createElement('div');
giftPhotoLightbox.id='giftPhotoLightbox';
giftPhotoLightbox.className='gift-photo-lightbox hidden';
giftPhotoLightbox.innerHTML='<div class="gift-photo-lightbox-inner"><button class="gift-photo-lightbox-close" type="button" aria-label="Fechar fotografia">×</button><img class="gift-photo-lightbox-image" alt="Fotografia do presente"><p class="gift-photo-lightbox-caption"></p></div>';
document.body.appendChild(giftPhotoLightbox);
const giftPhotoLightboxImage=giftPhotoLightbox.querySelector('.gift-photo-lightbox-image');
const giftPhotoLightboxCaption=giftPhotoLightbox.querySelector('.gift-photo-lightbox-caption');
function openGiftPhoto(url,name){
  if(!url)return;
  giftPhotoLightboxImage.src=url;
  giftPhotoLightboxImage.alt=name?`Fotografia de ${name}`:'Fotografia do presente';
  giftPhotoLightboxCaption.textContent=name||'';
  giftPhotoLightbox.classList.remove('hidden');
  setPublicModalLock(true);
  setTimeout(()=>giftPhotoLightbox.querySelector('.gift-photo-lightbox-close')?.focus(),30);
}
function closeGiftPhoto(){
  giftPhotoLightbox.classList.add('hidden');
  giftPhotoLightboxImage.src='';
  giftPhotoLightboxCaption.textContent='';
  setPublicModalLock(false);
}
giftPhotoLightbox.querySelector('.gift-photo-lightbox-close')?.addEventListener('click',closeGiftPhoto);
giftPhotoLightbox.addEventListener('click',e=>{if(e.target===giftPhotoLightbox)closeGiftPhoto()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!giftPhotoLightbox.classList.contains('hidden'))closeGiftPhoto()});
function renderGifts(){
  const grid=$('#giftGrid'); if(!grid)return;
  const q=String($('#giftSearch')?.value||'').trim().toLowerCase();
  const normalizeText = (value='') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const nq=normalizeText(q);
  const filtered=allGifts.filter(g=>{
    const name=normalizeText(g.name||'');
    const itemNo=String(g.item_no||'').toLowerCase();
    const mq=!nq||name.includes(nq)||itemNo.includes(nq);
    const mf=giftFilter==='all'||(giftFilter==='available'&&!g.reserved)||(giftFilter==='reserved'&&g.reserved);
    return mq&&mf;
  });
  $('#giftCount').textContent=filtered.length
    ? `${filtered.length} ${filtered.length===1?'presente':'presentes'}`
    : 'Nenhum presente encontrado.';
  if(!filtered.length){
    grid.innerHTML='<p class="gift-status gift-empty">Nenhum presente encontrado.</p>';
    return;
  }

  grid.innerHTML=filtered.map(g=>{
    const reserved=!!g.reserved;
    const no=String(g.item_no).padStart(2,'0');
    const thumb=g.image_url
      ? `<button class="gift-photo-trigger" type="button" data-gift-photo="${escapeHtml(g.image_url)}" data-gift-name="${escapeHtml(g.name)}" aria-label="Ampliar fotografia de ${escapeHtml(g.name)}">
           <img src="${escapeHtml(g.image_url)}" alt="" class="gift-photo-thumb" loading="lazy">
           <span class="gift-photo-icon" aria-hidden="true">⌕</span>
         </button>`
      : `<span class="gift-photo-trigger gift-photo-trigger--empty" aria-hidden="true"><span class="gift-photo-icon">♡</span></span>`;

    const action=reserved
      ? '<span class="reserved-label">Reservado</span>'
      : `<button class="reserve-button" type="button" data-gift-id="${escapeHtml(g.id)}">Reservar</button>`;

    return `<article class="gift-list-row ${reserved?'gift-list-row--reserved':''}">
      <span class="gift-index" aria-hidden="true">${no}</span>
      <div class="gift-item-main">
        ${thumb}
        <div class="gift-item-copy">
          <span class="gift-name">${escapeHtml(g.name)}</span>
          ${reserved?'<span class="gift-item-state">Este presente já foi reservado.</span>':''}
        </div>
        <div class="gift-item-action">${action}</div>
      </div>
    </article>`;
  }).join('');

  $$('.reserve-button').forEach(b=>b.addEventListener('click',()=>openReservation(b.dataset.giftId)));
  $$('.gift-photo-trigger[data-gift-photo]').forEach(b=>b.addEventListener('click',()=>openGiftPhoto(b.dataset.giftPhoto,b.dataset.giftName)));
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
  reservationOverlay?.classList.remove('hidden');
  setPublicModalLock(true);
  setTimeout(()=>$('#reservationClose')?.focus(),50);
}
function closeReservation(){
  reservationOverlay?.classList.add('hidden');
  setPublicModalLock(false);
  selectedGift=null;
}
async function confirmReservation(e){
  e.preventDefault();
  if(!selectedGift||!currentInvitation)return;
  const {error}=await supabaseClient.rpc('reserve_gift',{gift_id:selectedGift.id,invitation_code:currentInvitation.code});
  if(error){toast(error.message.toLowerCase().includes('reserv')?'Este presente já foi reservado por outra pessoa.':'Não foi possível reservar o presente.');return;}
  reservationOverlay?.classList.add('hidden');
  setPublicModalLock(false);
  await loadGifts();
  toast('Reserva confirmada com carinho. ❤️');
}
$('#reservationForm')?.addEventListener('submit',confirmReservation);
reservationOverlay?.addEventListener('click',e=>{if(e.target===reservationOverlay) closeReservation()});
$('#reservationClose')?.addEventListener('click',closeReservation);
$('#reservationCancel')?.addEventListener('click',closeReservation);
$('#giftSearch')?.addEventListener('input',renderGifts);
$$('.gift-filter').forEach(btn=>btn.addEventListener('click',()=>{
  giftFilter=btn.dataset.filter;
  $$('.gift-filter').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); renderGifts();
}));
loadGifts();

/* Dados bancários e detalhes importantes — conteúdo editável no Admin */
function renderEditableGuestContent(data){
  const accounts=Array.isArray(data?.bank_accounts)?data.bank_accounts:[];
  const bankBox=document.querySelector('.account-list');
  if(bankBox&&accounts.length){bankBox.innerHTML=accounts.map(x=>{const account=String(x?.account||''),copy=String(x?.copy||account);return `<div class="account-row"><span><b>${escapeHtml(x?.bank||'')}</b> ${escapeHtml(account)}</span><button class="copy-account" data-account="${escapeHtml(copy)}">Copiar</button></div>`}).join('');
    $$('.copy-account').forEach(btn=>btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(btn.dataset.account||'');btn.textContent='Copiado';setTimeout(()=>btn.textContent='Copiar',1400)}catch{toast('Não foi possível copiar.')}}));
  }
  const details=Array.isArray(data?.details_items)?data.details_items:[];const box=document.querySelector('.details-copy');
  if(box&&details.length){box.querySelectorAll('.detail-row').forEach(x=>x.remove());details.forEach(x=>{const row=document.createElement('div');row.className='detail-row';row.innerHTML=`<span class="detail-icon" aria-hidden="true">${escapeHtml(x?.icon||'⌁')}</span><div><strong>${escapeHtml(x?.title||'')}</strong><p>${escapeHtml(x?.text||'')}</p></div>`;box.appendChild(row)});}
}
/* Mobile story gallery — usa as três imagens já geridas pelo Admin. */
const storyGallery=$('#storyGallery');
const storyImageEl=$('#storyImage');
const storyCaptionEl=$('#storyImageCaption');
const storyDots=$('#storyGalleryDots');
const storyPrev=$('#storyPrev');
const storyNext=$('#storyNext');
let mobileGalleryImages=[{url:'monogram.svg',caption:'Onde tudo faz sentido'}];
let mobileGalleryIndex=0;
function renderStoryGallery(){
  if(!storyImageEl||!storyGallery)return;
  const item=mobileGalleryImages[mobileGalleryIndex]||mobileGalleryImages[0];
  storyImageEl.src=item.url;
  storyImageEl.alt=item.caption||'Agnaldo e Fáuzia';
  if(storyCaptionEl)storyCaptionEl.textContent=item.caption||'';
  if(storyDots){
    storyDots.innerHTML=mobileGalleryImages.map((_,i)=>`<button type="button" class="story-gallery-dot ${i===mobileGalleryIndex?'is-active':''}" aria-label="Imagem ${i+1}" data-story-index="${i}"></button>`).join('');
    storyDots.querySelectorAll('[data-story-index]').forEach(b=>b.addEventListener('click',()=>{mobileGalleryIndex=Number(b.dataset.storyIndex);renderStoryGallery();}));
  }
}
function changeStoryGallery(step){
  if(mobileGalleryImages.length<2)return;
  mobileGalleryIndex=(mobileGalleryIndex+step+mobileGalleryImages.length)%mobileGalleryImages.length;
  renderStoryGallery();
}
storyPrev?.addEventListener('click',()=>changeStoryGallery(-1));
storyNext?.addEventListener('click',()=>changeStoryGallery(1));
let galleryTouchX=null;
storyImageEl?.addEventListener('touchstart',e=>{galleryTouchX=e.touches[0].clientX},{passive:true});
storyImageEl?.addEventListener('touchend',e=>{
  if(galleryTouchX===null)return;
  const dx=e.changedTouches[0].clientX-galleryTouchX;
  galleryTouchX=null;
  if(Math.abs(dx)>42)changeStoryGallery(dx<0?1:-1);
},{passive:true});
function setMobileGalleryImages(images){
  const valid=Array.isArray(images)?images.filter(x=>x?.url):[];
  if(!valid.length)return;
  mobileGalleryImages=valid;
  mobileGalleryIndex=Math.min(mobileGalleryIndex,mobileGalleryImages.length-1);
  renderStoryGallery();
}
renderStoryGallery();
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
    if(e.key !== 'Escape') return;
    if(!modal.hidden){ shut(); return; }
    if(!programOverlay?.classList.contains('hidden')){ closeProgram(); return; }
    if(!reservationOverlay?.classList.contains('hidden')){ closeReservation(); return; }
  });
})();

/* V8.7 — controlos do topo: a visibilidade pertence ao CSS, nunca a estilos inline. */
(() => {
  const menu = document.getElementById('menuToggle');
  const nav = document.getElementById('navLinks');

  menu?.addEventListener('click', () => {
    if (!nav) return;
    requestAnimationFrame(() => {
      if (nav.classList.contains('nav-links--open')) nav.style.display = 'flex';
      else nav.style.display = '';
    });
  });
})();
