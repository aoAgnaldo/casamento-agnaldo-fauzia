let session=null, guests=[], gifts=[], receptionTables=[], protocols=[];
let guestFilter='all';
let giftSearch='';
let giftStatusFilter='all';
let giftSort='number';
let giftView='list';
let giftPage=1;
const GIFT_PAGE_SIZE=8;
const A=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

const ACTION_ICONS={
  edit:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Zm9.8-12.8 4 4M14 5l1.2-1.2a1.7 1.7 0 0 1 2.4 0l2.6 2.6a1.7 1.7 0 0 1 0 2.4L19 10.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  qr:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2h4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M6 6h2M16 6h2M6 16h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  whatsapp:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.85 11.85 0 0 0 12.04 0 11.99 11.99 0 0 0 1.6 17.7L0 24l6.45-1.69A12 12 0 0 0 24 12c0-3.2-1.25-6.2-3.5-8.5Zm-8.46 17.1h-.01a9.98 9.98 0 0 1-5.08-1.39l-.36-.21-3.83 1 1.02-3.74-.23-.38a10 10 0 1 1 8.49 4.72Zm5.48-7.52c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" fill="currentColor"/></svg>',
  remove:'×',
  deactivate:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M7.8 5.8a8 8 0 1 0 8.4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  activate:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  view:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  add:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  organize:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 7h4M17 10v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  choose:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 18 12-12M12 6h6v6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  done:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  reopen:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 8a8 8 0 1 0 1 7M20 4v4h-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  download:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M8 11l4 4 4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  copy:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  location:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-12A7 7 0 0 0 5 9c0 5.9 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9" r="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'
};
function iconBtn(icon,label,onclick='',extra=''){
  const danger=['remove','deactivate'].includes(icon)?' danger':'';
  return `<button type="button" class="icon-btn ui-icon-btn${danger}" aria-label="${esc(label)}" title="${esc(label)}" data-tooltip="${esc(label)}" ${extra} ${onclick?`onclick="${onclick}"`:''}>${ACTION_ICONS[icon]||icon}</button>`;
}

function showMsg(el,t){el.textContent=t;el.classList.remove('hidden')}
function genCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='AF-';for(let i=0;i<6;i++)out+=chars[Math.floor(Math.random()*chars.length)];return out}
function inviteUrl(){return location.origin+location.pathname.replace(/admin\.html$/,'index.html')}
function makeMessage(g){return `Olá, ${g.full_name}! ❤️\n\nÉ com muita alegria que nós, Agnaldo & Fáuzia, queremos convidar-te para o nosso casamento.\n\n📅 29 de Maio de 2027\n📍 Igreja Universal do Jardim — 09:00\n🎉 Recepção: Sala de Eventos do Kaya Kwanga Residence, às 15h\n\nPreparamos um convite especial para ti:\n👉 ${inviteUrl()}?convite=${encodeURIComponent(g.code)}\n\n🔐 Código do teu convite: ${g.code}\n\nAgradecemos que confirmes a tua presença até 30 de Abril de 2027. ❤️\n\nSerá uma alegria celebrar este momento contigo!`;}
async function init(){const {data}=await supabaseClient.auth.getSession();if(data.session){session=data.session;await enter()}else A('#login').classList.remove('hidden')}

const ADMIN_CREATE_FUNCTION_URL = SUPABASE_URL + '/functions/v1/create-admin';
let currentAdminProfile = {display_name:'', avatar_url:''};
let weddingImages = {cover_image_url:'monogram.svg', story_image_url:'monogram.svg', details_image_url:'monogram.svg', story_text:''};
let imageSettingsTarget = 'cover';

async function loadWeddingImagesAdmin(){
  const {data,error}=await supabaseClient.from('wedding_settings').select('cover_image_url,story_image_url,details_image_url,story_text').eq('id',1).maybeSingle();
  if(!error && data){
    weddingImages={
      cover_image_url:data.cover_image_url||'monogram.svg',
      story_image_url:data.story_image_url||data.cover_image_url||'monogram.svg',
      details_image_url:data.details_image_url||data.cover_image_url||'monogram.svg',
      story_text:data.story_text||''
    };
  }
  applyWeddingImagesAdmin();
}
function applyWeddingImagesAdmin(){
  const img=A('.wedy-cover img');
  if(img)img.src=weddingImages.cover_image_url||'monogram.svg';
  const cover=A('#siteCoverPreview'),story=A('#siteStoryPreview'),details=A('#siteDetailsPreview'),storyLarge=A('#siteStoryLargePreview'),storyText=A('#siteStoryTextPreview');
  if(cover)cover.src=weddingImages.cover_image_url||'monogram.svg';
  if(story)story.src=weddingImages.story_image_url||'monogram.svg';
  if(details)details.src=weddingImages.details_image_url||'monogram.svg';
  if(storyLarge)storyLarge.src=weddingImages.story_image_url||'monogram.svg';
  if(storyText)storyText.textContent=weddingImages.story_text||'A nossa história ainda não foi preenchida.';
}
function imagePathFromUrl(url){
  const marker='/storage/v1/object/public/wedding-images/';
  const i=String(url||'').indexOf(marker);
  return i>=0?String(url).slice(i+marker.length):null;
}
async function compressWeddingImage(file){
  const img=new Image(),src=URL.createObjectURL(file);
  try{
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));img.src=src});
    const max=1800,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);
    const b=await new Promise(r=>c.toBlob(r,'image/webp',.86));
    if(!b)throw new Error('Não foi possível preparar a imagem.');
    return new File([b],`wedding-${Date.now()}.webp`,{type:'image/webp'});
  }finally{URL.revokeObjectURL(src)}
}
function openImageSettings(target){
  imageSettingsTarget=target;
  const isCover=target==='cover', isStory=target==='story';
  A('#imageSettingsTitle').textContent=isCover?'Alterar imagem da capa':isStory?'Alterar imagem e texto da nossa história':'Alterar imagem de alguns detalhes importantes';
  A('#imageSettingsDescription').textContent=isCover?'Esta imagem aparece na capa do convite.':isStory?'Altere a fotografia e o texto apresentados em “A nossa história”.':'Esta imagem aparece na secção “Alguns detalhes importantes”.';
  A('#imageSettingsPreview').src=isCover?weddingImages.cover_image_url:isStory?weddingImages.story_image_url:weddingImages.details_image_url;
  A('#storyTextEditor').classList.toggle('hidden',!isStory);
  if(isStory)A('#storyTextInput').value=weddingImages.story_text||'';
  A('#imageSettingsFile').value='';A('#imageSettingsNewPreview').classList.add('hidden');A('#imageSettingsNewPreview').innerHTML='';A('#imageSettingsMsg').classList.add('hidden');
  A('#imageSettingsModal').classList.remove('hidden');document.body.classList.add('modal-scroll-lock');
}
function closeImageSettings(){A('#imageSettingsModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock')}
window.openImageSettings=openImageSettings;
A('#editCoverBtn')?.addEventListener('click',()=>openImageSettings('cover'));
A('#editStoryBtn')?.addEventListener('click',()=>openImageSettings('story'));
A('#editDetailsBtn')?.addEventListener('click',()=>openImageSettings('details'));
A('#closeImageSettingsModal')?.addEventListener('click',closeImageSettings);
A('#imageSettingsModal')?.addEventListener('mousedown',e=>{if(e.target===A('#imageSettingsModal'))closeImageSettings()});
A('#imageSettingsFile')?.addEventListener('change',e=>{
  const f=e.target.files?.[0],box=A('#imageSettingsNewPreview');
  if(!f){box.classList.add('hidden');return}
  if(!/^image\/(jpeg|png|webp)$/.test(f.type)){showMsg(A('#imageSettingsMsg'),'Escolha uma imagem JPG, PNG ou WebP válida.');e.target.value='';return}
  if(f.size>20*1024*1024){showMsg(A('#imageSettingsMsg'),'A imagem é demasiado grande. Escolha uma imagem com menos de 20 MB.');e.target.value='';return}
  const u=URL.createObjectURL(f);box.innerHTML=`<img src="${u}" alt="Nova imagem">`;box.classList.remove('hidden');A('#imageSettingsMsg').classList.add('hidden');
});
A('#imageSettingsForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const file=A('#imageSettingsFile').files?.[0],btn=A('#imageSettingsSaveBtn'),msg=A('#imageSettingsMsg'),storyText=A('#storyTextInput')?.value.trim()||'';
  const isStory=imageSettingsTarget==='story';
  if(!file && !isStory){showMsg(msg,'Escolha uma nova imagem antes de guardar.');return}
  if(isStory && !file && !storyText){showMsg(msg,'Altere a imagem, o texto, ou ambos antes de guardar.');return}
  btn.disabled=true;btn.textContent='A guardar…';msg.classList.add('hidden');
  let newPath=null;
  try{
    let url=null;
    if(file){
      const compressed=await compressWeddingImage(file);
      const folder=imageSettingsTarget==='cover'?'cover':imageSettingsTarget==='story'?'story':'details';
      newPath=`${folder}/${crypto.randomUUID()}.webp`;
      const up=await supabaseClient.storage.from('wedding-images').upload(newPath,compressed,{cacheControl:'31536000',upsert:false,contentType:'image/webp'});
      if(up.error)throw new Error('A imagem não pôde ser carregada: '+up.error.message);
      url=supabaseClient.storage.from('wedding-images').getPublicUrl(newPath).data.publicUrl;
    }
    const oldUrl=imageSettingsTarget==='cover'?weddingImages.cover_image_url:imageSettingsTarget==='story'?weddingImages.story_image_url:weddingImages.details_image_url;
    const args={p_cover_image_url:imageSettingsTarget==='cover'?url:null,p_story_image_url:imageSettingsTarget==='story'?url:null,p_details_image_url:imageSettingsTarget==='details'?url:null,p_story_text:isStory?storyText:null};
    const {error}=await supabaseClient.rpc('admin_update_wedding_images',args);
    if(error){if(newPath)await supabaseClient.storage.from('wedding-images').remove([newPath]);throw error}
    if(imageSettingsTarget==='cover'&&url)weddingImages.cover_image_url=url;
    if(imageSettingsTarget==='story'){if(url)weddingImages.story_image_url=url;weddingImages.story_text=storyText}
    if(imageSettingsTarget==='details'&&url)weddingImages.details_image_url=url;
    applyWeddingImagesAdmin();closeImageSettings();
    toast(isStory?'Imagem e texto da história actualizados. ❤️':imageSettingsTarget==='cover'?'Imagem da capa actualizada. ❤️':'Imagem dos detalhes actualizada. ❤️');
    if(url && oldUrl&&imagePathFromUrl(oldUrl))await supabaseClient.storage.from('wedding-images').remove([imagePathFromUrl(oldUrl)]);
  }catch(err){showMsg(msg,err?.message||String(err))}
  finally{btn.disabled=false;btn.textContent='Guardar alterações'}
});

function fallbackAdminName(user){
 const meta=user?.user_metadata||{};
 if(meta.display_name) return meta.display_name;
 const email=String(user?.email||'').toLowerCase();
 if(email==='aoagnaldo@gmail.com') return 'Agnaldo';
 const local=email.split('@')[0].replace(/[._-]+/g,' ').trim();
 return local ? local.replace(/\b\w/g,c=>c.toUpperCase()) : 'Administrador';
}
function initials(name){return String(name||'A').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'A'}
function applyAdminIdentity(user,profile){
 const name=profile?.display_name||fallbackAdminName(user), avatar=profile?.avatar_url||user?.user_metadata?.avatar_url||'';
 currentAdminProfile={display_name:name,avatar_url:avatar};
 const hName=A('#adminHeaderName'),hMeta=A('#adminHeaderMeta'),hAvatar=A('#adminHeaderAvatar'),mName=A('#adminMenuName'),mEmail=A('#adminMenuEmail'),mAvatar=A('#adminMenuAvatar'),dAvatar=A('#adminDashboardAvatar');
 const dashboardName=A('#adminDashboardName');
 if(dashboardName)dashboardName.textContent=name;
 if(hName)hName.textContent=name;
 if(hMeta)hMeta.textContent='Administrador · Casamento · 29 Maio 2027';
 if(mName)mName.textContent=name;
 if(mEmail)mEmail.textContent=user?.email||'—';
 [hAvatar,mAvatar,dAvatar].forEach(el=>{if(!el)return;if(avatar){el.innerHTML=`<img src="${esc(avatar)}" alt="">`;el.classList.add('has-photo')}else{el.textContent=initials(name);el.classList.remove('has-photo')}});
 const pv=A('#profileAvatarPreview');if(pv){if(avatar){pv.innerHTML=`<img src="${esc(avatar)}" alt="">`;pv.classList.add('has-photo')}else{pv.textContent=initials(name);pv.classList.remove('has-photo')}}
 if(A('#profileName'))A('#profileName').value=name;
 if(A('#profileAccountEmail'))A('#profileAccountEmail').textContent=user?.email||'—';
}
async function loadAdminProfile(){
 const user=session?.user;if(!user)return;
 let profile=null;
 const {data,error}=await supabaseClient.from('admin_profiles').select('display_name,avatar_url').eq('user_id',user.id).maybeSingle();
 if(!error&&data)profile=data;
 applyAdminIdentity(user,profile);
}
async function openProfileModal(){
 closeAdminMenu();
 await loadAdminProfile();
 A('#profileFormMsg').classList.add('hidden');A('#profilePhoto').value='';A('#profilePhotoPreview').classList.add('hidden');A('#profilePhotoPreview').innerHTML='';
 A('#profileModal').classList.remove('hidden');document.body.classList.add('modal-scroll-lock');setTimeout(()=>A('#profileName').focus(),80);
}
function closeProfileModal(){A('#profileModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock')}
async function compressAdminImage(file){
 const img=new Image(),src=URL.createObjectURL(file);
 try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Não foi possível ler a fotografia.'));img.src=src});const max=900,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);const b=await new Promise(r=>c.toBlob(r,'image/webp',.84));if(!b)throw new Error('Não foi possível preparar a fotografia.');return new File([b],`avatar-${Date.now()}.webp`,{type:'image/webp'})}finally{URL.revokeObjectURL(src)}
}
async function uploadAdminAvatar(file){
 const compressed=await compressAdminImage(file),path=`${session.user.id}/${crypto.randomUUID()}.webp`;
 const up=await supabaseClient.storage.from('admin-avatars').upload(path,compressed,{cacheControl:'31536000',upsert:false,contentType:'image/webp'});
 if(up.error)throw new Error('A fotografia não pôde ser carregada: '+up.error.message);
 return supabaseClient.storage.from('admin-avatars').getPublicUrl(path).data.publicUrl;
}
A('#profilePhoto')?.addEventListener('change',e=>{const f=e.target.files?.[0],box=A('#profilePhotoPreview');if(!f){box.classList.add('hidden');return}if(!/^image\/(jpeg|png|webp)$/.test(f.type)){showMsg(A('#profileFormMsg'),'Escolha uma imagem JPG, PNG ou WebP válida.');e.target.value='';return}const u=URL.createObjectURL(f);box.innerHTML=`<img src="${u}" alt="Pré-visualização">`;box.classList.remove('hidden')});
A('#profileForm')?.addEventListener('submit',async e=>{e.preventDefault();const btn=A('#profileSaveBtn'),msg=A('#profileFormMsg');btn.disabled=true;msg.classList.add('hidden');try{let avatar=currentAdminProfile.avatar_url||null;const file=A('#profilePhoto').files?.[0];if(file)avatar=await uploadAdminAvatar(file);const name=A('#profileName').value.trim();const {error}=await supabaseClient.from('admin_profiles').upsert({user_id:session.user.id,display_name:name,avatar_url:avatar,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;await loadAdminProfile();closeProfileModal();toast('Perfil actualizado.');}catch(err){showMsg(msg,err?.message||String(err))}finally{btn.disabled=false}});

function closeAdminMenu(){const p=A('#adminMenuPanel'),b=A('#adminMenuBtn');if(p)p.classList.add('hidden');if(b)b.setAttribute('aria-expanded','false')}
A('#openProfileSettings')?.addEventListener('click',openProfileModal);
A('#openAdminSettings')?.addEventListener('click',async()=>{closeAdminMenu();await openAdminsModal()});
A('#menuLogout')?.addEventListener('click',()=>supabaseClient.auth.signOut().then(()=>location.reload()));

// V6.43 — menu superior direito: abrir/fechar sempre de forma directa e fiável.
(function initAdminHeaderMenu(){
  const button=A('#adminMenuBtn'), panel=A('#adminMenuPanel'), identity=A('#adminIdentity');
  if(!button || !panel) return;
  const setOpen=open=>{
    panel.classList.toggle('hidden',!open);
    button.setAttribute('aria-expanded',open?'true':'false');
    if(identity) identity.setAttribute('aria-expanded',open?'true':'false');
  };
  const toggle=e=>{ e?.preventDefault(); e?.stopPropagation(); setOpen(panel.classList.contains('hidden')); };
  button.addEventListener('click',toggle);
  if(identity){
    identity.setAttribute('role','button');
    identity.setAttribute('tabindex','0');
    identity.addEventListener('click',toggle);
    identity.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle(e)}});
  }
  panel.addEventListener('click',e=>{e.stopPropagation();if(e.target.closest('a'))setOpen(false);});
  document.addEventListener('click',e=>{if(!panel.contains(e.target)&&e.target!==button&&!identity?.contains(e.target))setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
})();

A('#closeProfileModal')?.addEventListener('click',closeProfileModal);
A('#profileModal')?.addEventListener('mousedown',e=>{if(e.target===A('#profileModal'))closeProfileModal()});

async function openAdminsModal(){
 A('#adminCreateMsg').classList.add('hidden');A('#adminCreateForm').reset();A('#adminsModal').classList.remove('hidden');document.body.classList.add('modal-scroll-lock');await loadAdmins();setTimeout(()=>A('#newAdminName').focus(),80);
}
function closeAdminsModal(){A('#adminsModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock')}
A('#closeAdminsModal')?.addEventListener('click',closeAdminsModal);
A('#adminsModal')?.addEventListener('mousedown',e=>{if(e.target===A('#adminsModal'))closeAdminsModal()});
async function loadAdmins(){
 const box=A('#adminsList');box.innerHTML='<div class="admin-list-loading">A carregar administradores…</div>';
 const {data,error}=await supabaseClient.rpc('admin_list_admins');
 if(error){box.innerHTML=`<div class="status">${esc(error.message)}</div>`;return}
 box.innerHTML=(data||[]).map(a=>`<div class="admin-account-row"><div class="admin-account-avatar">${a.avatar_url?`<img src="${esc(a.avatar_url)}" alt="">`:esc(initials(a.display_name||a.email))}</div><div><strong>${esc(a.display_name||'Administrador')}</strong><small>${esc(a.email||'')}</small></div>${a.user_id===session.user.id?'<span class="admin-you">Tu</span>':''}</div>`).join('')||'<div class="empty-state">Ainda não existem administradores.</div>';
}
A('#adminCreateForm')?.addEventListener('submit',async e=>{e.preventDefault();const btn=A('#createAdminBtn'),msg=A('#adminCreateMsg');btn.disabled=true;msg.classList.add('hidden');try{const body={email:A('#newAdminEmail').value.trim(),password:A('#newAdminPassword').value,display_name:A('#newAdminName').value.trim()};if(body.password.length<6)throw new Error('A palavra-passe deve ter pelo menos 6 caracteres.');const {data:sd}=await supabaseClient.auth.getSession();const token=sd?.session?.access_token;if(!token)throw new Error('A sessão expirou. Entre novamente no painel.');const res=await fetch(ADMIN_CREATE_FUNCTION_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify(body)});let payload={};try{payload=await res.json()}catch(_){}if(!res.ok)throw new Error(payload.error||'Não foi possível criar o administrador.');A('#adminCreateForm').reset();await loadAdmins();toast(`Administrador ${body.display_name} criado com sucesso.`)}catch(err){showMsg(msg,err?.message||String(err))}finally{btn.disabled=false}});

async function enter(){A('#login').classList.add('hidden');A('#app').classList.remove('hidden');await loadAdminProfile();await loadWeddingImagesAdmin();await refresh()}

A('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,btn=form.querySelector('button[type=submit]'),msgEl=A('#loginMsg');const email=A('#email')?.value.trim()||'',password=A('#password')?.value||'';if(!email||!password){showMsg(msgEl,'Introduza o email e a palavra-passe.');return}if(btn)btn.disabled=true;msgEl.classList.add('hidden');try{const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});if(error){showMsg(msgEl,error.message||'Não foi possível iniciar sessão.');return}session=data?.session||null;await enter()}catch(err){showMsg(msgEl,err?.message||'Não foi possível iniciar sessão.')}finally{if(btn)btn.disabled=false}});
A('#logout')?.addEventListener('click',()=>supabaseClient.auth.signOut().then(()=>location.reload()));

async function refresh(){const [{data:g,error:ge},{data:gi,error:gie},{data:t,error:te},{data:p,error:pe}]=await Promise.all([supabaseClient.rpc('admin_list_invitations_checkin'),supabaseClient.rpc('admin_list_gifts'),supabaseClient.rpc('admin_list_tables'),supabaseClient.rpc('admin_list_protocols')]);if(ge){toast(ge.message);return}if(gie){toast(gie.message);return}if(te){toast(te.message);return}if(pe){toast(pe.message);return}guests=g||[];gifts=gi||[];receptionTables=t||[];protocols=p||[];window.guests=guests;window.gifts=gifts;window.receptionTables=receptionTables;window.protocols=protocols;render();renderTables();renderProtocols()}
function renderModernDashboard(){
 const total=guests.length, confirmed=guests.filter(g=>g.rsvp_status==='confirmed').length;
 const people=confirmedGuests().reduce((n,g)=>n+peopleForGuest(g),0);
 const arrivedGuests=guests.filter(g=>g.checked_in), arrivedPeople=arrivedGuests.reduce((n,g)=>n+peopleForGuest(g),0);
 const waiting=Math.max(0,confirmed-arrivedGuests.filter(g=>g.rsvp_status==='confirmed').length);
 const pct=(n,d)=>d?Math.max(0,Math.min(100,Math.round(n/d*100))):0;
 const cp=pct(confirmed,total), ap=pct(arrivedPeople,people), wp=confirmed?pct(waiting,confirmed):0;
 [['#kpiConfirmed',confirmed],['#kpiTotal',total],['#kpiPeople',people],['#kpiArrived',arrivedPeople],['#kpiWaiting',waiting],['#kpiConfirmedPct',cp+'%'],['#kpiArrivedPct',ap+'%'],['#kpiWaitingPct',wp+'%']].forEach(([sel,val])=>{if(A(sel))A(sel).textContent=val});
 if(A('#kpiConfirmedBar'))A('#kpiConfirmedBar').style.width=cp+'%'; if(A('#kpiPeopleBar'))A('#kpiPeopleBar').style.width='100%'; if(A('#kpiArrivedBar'))A('#kpiArrivedBar').style.width=ap+'%'; if(A('#kpiWaitingBar'))A('#kpiWaitingBar').style.width=wp+'%';
 const days=Math.max(0,Math.ceil((new Date('2027-05-29T00:00:00')-new Date())/86400000));if(A('#adminDaysLeft'))A('#adminDaysLeft').textContent=days;
 const stats=receptionTables.map(t=>{const gs=guests.filter(g=>Number(g.table_id)===Number(t.id)&&g.rsvp_status==='confirmed');const p=gs.reduce((n,g)=>n+peopleForGuest(g),0);return {capacity:Number(t.capacity)||0,people:p}});
 const full=stats.filter(x=>x.capacity>0&&x.people>=x.capacity).length, partial=stats.filter(x=>x.people>0&&x.people<x.capacity).length, empty=stats.filter(x=>x.people===0).length, noGuest=Math.max(0,stats.length-full-partial-empty);
 [['#overviewTableCount',stats.length],['#overviewFullTables',full],['#overviewPartialTables',partial],['#overviewEmptyTables',empty],['#overviewNoGuestTables',noGuest]].forEach(([sel,val])=>{if(A(sel))A(sel).textContent=val});
 const totalTables=stats.length||1, fp=full/totalTables*100, pp=partial/totalTables*100, ep=empty/totalTables*100; if(A('#dashboardTableDonut'))A('#dashboardTableDonut').style.background=`conic-gradient(#2e8968 0 ${fp}%,#f8d9ca ${fp}% ${fp+pp}%,#f59a7b ${fp+pp}% ${fp+pp+ep}%,#d6d9da ${fp+pp+ep}% 100%)`;
 const pbox=A('#overviewProtocolList');if(pbox)pbox.innerHTML=protocols.slice(0,4).map(p=>`<div class="overview-protocol"><span class="mini-avatar">${esc(initials(p.full_name||'?'))}</span><div><b>${esc(p.full_name||'Protocolo')}</b><small>${p.role==='chief'?'Protocolo Chefe':'Protocolo'}</small></div><i class="${p.active?'online':'offline'}"></i></div>`).join('')||'<div class="empty-state">Sem protocolos.</div>';
 const abox=A('#overviewArrivals');if(abox)abox.innerHTML=arrivedGuests.sort((a,b)=>new Date(b.checked_in_at||0)-new Date(a.checked_in_at||0)).slice(0,4).map(g=>`<div><span class="mini-avatar">${esc(initials(g.full_name||'?'))}</span><div><b>${esc(g.full_name)}</b><small>${esc(g.table_name||'Sem mesa')}</small></div><time>${g.checked_in_at?new Date(g.checked_in_at).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):'—'}</time></div>`).join('')||'<div class="empty-state">Ainda não existem entradas.</div>';
}

function guestStatusLabel(status){return ({confirmed:'Confirmado',pending:'Pendente',declined:'Recusado'}[status]||status||'—')}
function guestInitials(name){return String(name||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function tableOptionsForGuest(guestId,currentId=''){
 const guest=guests.find(g=>String(g.id)===String(guestId));
 const need=guest?peopleForGuest(guest):1;
 const direct=guestAssignedTable(guestId);
 const resolvedCurrent=currentId||direct?.id||'';
 const tables=receptionTables.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt'));
 return `<option value="">Sem mesa</option>`+tables.map(t=>{
   const occupied=tableOccupancy(t).list.filter(g=>String(g.id)!==String(guestId)).reduce((n,g)=>n+peopleForGuest(g),0);
   const remaining=Math.max(0,Number(t.capacity||0)-occupied);
   const selected=String(resolvedCurrent)===String(t.id)?' selected':'';
   const disabled=remaining<need && !selected?' disabled':'';
   return `<option value="${t.id}"${selected}${disabled}>${esc(t.name)} · ${remaining} livre${remaining===1?'':'s'}${remaining<need&&!selected?' · sem espaço':''}</option>`;
 }).join('');
}
window.quickAssignGuest=async function(guestId,select){
 const nextId=select?.value||'';
 const guest=guests.find(g=>String(g.id)===String(guestId));
 if(!guest)return;
 if(nextId){
   const table=receptionTables.find(t=>String(t.id)===String(nextId));
   if(!table){select.value=String(guestAssignedTable(guest.id)?.id||'');return}
   const occupied=tableOccupancy(table).list.filter(g=>String(g.id)!==String(guestId)).reduce((n,g)=>n+peopleForGuest(g),0);
   const remaining=Number(table.capacity||0)-occupied;
   if(peopleForGuest(guest)>remaining){
     toast(`A ${table.name} não tem lugares suficientes para este convite.`);
     select.value=String(guest.table_id||'');
     return;
   }
 }
 select.disabled=true;
 const ok=await assignTable(guestId,nextId);
 select.disabled=false;
 if(!ok) select.value=String(guestAssignedTable(guest.id)?.id||'');
}

function render(){
 renderModernDashboard();
 const c={total:guests.length,pending:0,confirmed:0,declined:0,people:0,checkedIn:0,notCheckedIn:0,presentPeople:0};guests.forEach(g=>{if(c[g.rsvp_status]!==undefined)c[g.rsvp_status]++;if(g.rsvp_status==='confirmed'){const people=1+(g.companion_count||0);c.people+=people;if(g.checked_in){c.checkedIn++;c.presentPeople+=people}}});c.notCheckedIn=c.confirmed-c.checkedIn;if(A('#stTotal'))A('#stTotal').textContent=c.total;if(A('#stPending'))A('#stPending').textContent=c.pending;if(A('#stConfirmed'))A('#stConfirmed').textContent=c.confirmed;if(A('#stDeclined'))A('#stDeclined').textContent=c.declined;if(A('#stPeople'))A('#stPeople').textContent=c.people; if(A('#stCheckedIn')) A('#stCheckedIn').textContent=c.checkedIn; if(A('#stNotCheckedIn')) A('#stNotCheckedIn').textContent=c.notCheckedIn; if(A('#stCheckedIn2')) A('#stCheckedIn2').textContent=c.checkedIn; if(A('#stNotCheckedIn2')) A('#stNotCheckedIn2').textContent=c.notCheckedIn; A('#stPresentPeople').textContent=c.presentPeople; if(A('#stPresentPeopleDashboard'))A('#stPresentPeopleDashboard').textContent=c.presentPeople;
 const pct=(n,d)=>d?Math.max(0,Math.min(100,Math.round(n/d*100))):0;
 const confirmedPct=pct(c.confirmed,c.total), arrivedPct=pct(c.presentPeople,c.people), waitingPct=c.confirmed?Math.max(0,100-pct(c.checkedIn,c.confirmed)):0;
 const setBar=(id,v)=>{const el=A(id);if(el)el.style.width=v+'%'};
 setBar('#kpiConfirmedBar',confirmedPct);setBar('#kpiPeopleBar',100);setBar('#kpiArrivedBar',arrivedPct);setBar('#kpiWaitingBar',waitingPct);
 if(A('#dashboardAdminName'))A('#dashboardAdminName').textContent=currentAdminProfile.display_name||fallbackAdminName(session?.user);
 setBar('#prepConfirmed',confirmedPct);if(A('#prepConfirmedText'))A('#prepConfirmedText').textContent=confirmedPct+'%';
 const assigned=guests.filter(g=>g.table_id).length, confirmedGuests=guests.filter(g=>g.rsvp_status==='confirmed').length, tablePct=pct(assigned,confirmedGuests);setBar('#prepTables',tablePct);if(A('#prepTablesText'))A('#prepTablesText').textContent=tablePct+'%';
 const reserved=gifts.filter(g=>g.reserved).length,giftPct=pct(reserved,gifts.length);setBar('#prepGifts',giftPct);if(A('#prepGiftsText'))A('#prepGiftsText').textContent=giftPct+'%';
 const tableStats=receptionTables.map(t=>{const gs=guests.filter(g=>Number(g.table_id)===Number(t.id)&&g.rsvp_status==='confirmed');const people=gs.reduce((n,g)=>n+1+(g.companion_count||0),0);return {capacity:Number(t.capacity)||0,people}});
 const full=tableStats.filter(x=>x.capacity>0&&x.people>=x.capacity).length,partial=tableStats.filter(x=>x.people>0&&x.people<x.capacity).length,empty=Math.max(0,tableStats.length-full-partial);
 if(A('#overviewTableCount'))A('#overviewTableCount').textContent=tableStats.length;if(A('#overviewFullTables'))A('#overviewFullTables').textContent=full;if(A('#overviewPartialTables'))A('#overviewPartialTables').textContent=partial;if(A('#overviewEmptyTables'))A('#overviewEmptyTables').textContent=empty;
 const pbox=A('#overviewProtocolList');if(pbox)pbox.innerHTML=protocols.slice(0,4).map(p=>`<div class="overview-protocol"><span class="mini-avatar">${esc((p.full_name||'?').slice(0,1).toUpperCase())}</span><div><b>${esc(p.full_name)}</b><small>${p.role==='chief'?'Protocolo Chefe':'Protocolo'}</small></div><i class="${p.active?'online':'offline'}"></i></div>`).join('')||'<div class="empty-state">Sem protocolos.</div>';
 const arrivals=guests.filter(g=>g.checked_in).sort((a,b)=>new Date(b.checked_in_at||0)-new Date(a.checked_in_at||0)).slice(0,5);const abox=A('#overviewArrivals');if(abox)abox.innerHTML=arrivals.map(g=>`<div class="overview-arrival"><span class="mini-avatar">${esc((g.full_name||'?').slice(0,1).toUpperCase())}</span><div><b>${esc(g.full_name)}</b><small>${esc(g.table_name||'Sem mesa')}</small></div><time>${g.checked_in_at?new Date(g.checked_in_at).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'}):'—'}</time></div>`).join('')||'<div class="empty-state">Ainda não existem entradas.</div>';
 const q=String(A('#guestSearch')?.value||'').trim().toLowerCase();
 const filteredGuests=guests.filter(g=>{
   const hay=[g.full_name,g.code,g.whatsapp].map(v=>String(v||'').toLowerCase()).join(' ');
   const matchesQ=!q||hay.includes(q);
   const matchesF=guestFilter==='all'||(guestFilter==='confirmed'&&g.rsvp_status==='confirmed')||(guestFilter==='pending'&&g.rsvp_status==='pending')||(guestFilter==='declined'&&g.rsvp_status==='declined')||(guestFilter==='checked'&&!!g.checked_in)||(guestFilter==='waiting'&&g.rsvp_status==='confirmed'&&!g.checked_in);
   return matchesQ&&matchesF;
 });
 A('#guestCount').textContent=`${filteredGuests.length} de ${guests.length} convite(s)`;
 A('#guestRows').innerHTML=filteredGuests.map(g=>{
  const people=g.rsvp_status==='confirmed'?peopleForGuest(g):0;
  const confirmedDate=g.rsvp_at?new Date(g.rsvp_at).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';
  const tableName=g.table_name||'Sem mesa';
  return `<article class="guest-card">
    <div class="guest-card-main">
      <div class="guest-avatar">${esc(guestInitials(g.full_name))}</div>
      <div class="guest-primary"><strong>${esc(g.full_name)}</strong><div class="guest-meta"><span class="guest-code">${esc(g.code)}</span><span>${esc(g.whatsapp||'Sem WhatsApp')}</span></div></div>
      <span class="badge ${g.rsvp_status}">${esc(guestStatusLabel(g.rsvp_status))}</span>
    </div>
    <div class="guest-card-details">
      <div><small>Presença</small><strong>${people} ${people===1?'pessoa':'pessoas'}</strong></div>
      <div><small>Lotação</small><strong>${Number(g.allowed_guests||1)} ${Number(g.allowed_guests||1)===1?'pessoa':'pessoas'}</strong></div>
      <div><small>Mesa</small><strong class="${g.table_name?'':'is-muted'}">${esc(tableName)}</strong></div>
      <div><small>Entrada</small><strong class="${g.checked_in?'is-success':'is-muted'}">${g.checked_in?'Chegou':'Por entrar'}</strong></div>
      <div><small>Confirmado</small><strong class="is-muted">${confirmedDate}</strong></div>
    </div>
    <div class="guest-card-footer"><div class="guest-table-quick"><label for="guest-table-${g.id}">Mesa</label><select id="guest-table-${g.id}" aria-label="Escolher mesa para ${esc(g.full_name)}" onchange="quickAssignGuest('${g.id}',this)">${tableOptionsForGuest(g.id,g.table_id||'')}</select></div><div class="guest-card-actions">${iconBtn('edit','Editar convidado',`editGuest('${g.id}')`)}${iconBtn('qr','Abrir / editar QR Code',`openQR('${g.id}')`)}${iconBtn('whatsapp',g.invitation_sent_at?'Reenviar convite por WhatsApp':'Enviar convite por WhatsApp',`openWhats('${g.id}')`)}${iconBtn('remove','Remover convidado',`removeGuest('${g.id}')`)}</div></div>
  </article>`;
}).join('');
 renderGiftsPanel();
}


function giftSortList(items){
  return items.slice().sort((a,b)=>{
    if(giftSort==='name') return String(a.name||'').localeCompare(String(b.name||''),'pt',{sensitivity:'base'});
    if(giftSort==='status') return Number(!!b.reserved)-Number(!!a.reserved) || Number(a.item_no||0)-Number(b.item_no||0);
    return Number(a.item_no||0)-Number(b.item_no||0);
  });
}
function giftFilteredList(){
  const q=giftSearch.trim().toLowerCase();
  return giftSortList(gifts.filter(g=>{
    const hay=[g.name,g.item_no,g.reserved_by_name].map(v=>String(v||'').toLowerCase()).join(' ');
    const matchQ=!q||hay.includes(q);
    const matchS=giftStatusFilter==='all'||(giftStatusFilter==='reserved'&&!!g.reserved)||(giftStatusFilter==='available'&&!g.reserved);
    return matchQ&&matchS;
  }));
}
function renderGiftActionButtons(g){
  return `${iconBtn('edit','Editar presente',`editGift(${g.id})`)}${iconBtn('remove','Remover presente',`deleteGift(${g.id})`,g.reserved?'disabled':'')}`;
}
function renderGiftsPanel(){
  const total=gifts.length;
  const reserved=gifts.filter(g=>!!g.reserved).length;
  const available=Math.max(0,total-reserved);
  const reservedPct=total?Math.round(reserved/total*100):0;
  const availablePct=total?Math.round(available/total*100):0;
  const setText=(sel,val)=>{const el=A(sel);if(el)el.textContent=String(val)};
  setText('#giftStatTotal',total);setText('#giftStatReserved',reserved);setText('#giftStatAvailable',available);setText('#giftStatRate',reservedPct+'%');
  setText('#giftStatReservedPct',reservedPct+'%');setText('#giftStatAvailablePct',availablePct+'%');
  const rb=A('#giftStatReservedBar');if(rb)rb.style.width=Math.max(0,reservedPct)+'%';
  const ab=A('#giftStatAvailableBar');if(ab)ab.style.width=Math.max(0,availablePct)+'%';
  const items=giftFilteredList();
  const pages=Math.max(1,Math.ceil(items.length/GIFT_PAGE_SIZE));
  giftPage=Math.min(Math.max(1,giftPage),pages);
  const start=(giftPage-1)*GIFT_PAGE_SIZE;
  const pageItems=items.slice(start,start+GIFT_PAGE_SIZE);
  setText('#giftCountText',items.length===total?`A mostrar 1 a ${Math.min(GIFT_PAGE_SIZE,total)} de ${total} presentes`:`A mostrar ${items.length?start+1:0} a ${Math.min(start+GIFT_PAGE_SIZE,items.length)} de ${items.length} presentes`);
  setText('#giftPageText',`Página ${giftPage} de ${pages}`);
  const container=A('#giftRows');if(!container)return;
  if(!pageItems.length){container.innerHTML='<div class="gift-empty">Não encontrámos presentes com estes critérios.</div>';} else if(giftView==='grid'){
    container.innerHTML=`<div class="gift-grid">${pageItems.map(g=>`<article class="gift-card-item"><div>${g.image_url?`<img class="gift-photo" src="${esc(g.image_url)}" alt="${esc(g.name)}">`:'<div class="gift-photo placeholder">♡</div>'}</div><div class="gift-card-main"><span class="gift-name">${esc(g.name)}</span><div class="gift-card-meta"><span>#${esc(g.item_no)}</span><span class="gift-status ${g.reserved?'reserved':'available'}">${g.reserved?'Reservado':'Disponível'}</span></div></div><div class="gift-card-footer"><span class="gift-reserved-by">${g.reserved?`Reservado por ${esc(g.reserved_by_name||'—')}`:'Ainda disponível'}</span><div class="gift-actions">${renderGiftActionButtons(g)}</div></div></article>`).join('')}</div>`;
  } else {
    container.innerHTML=`<table class="gift-table gift-desktop-table"><thead><tr><th class="gift-col-photo">Foto</th><th class="gift-col-no">#</th><th>Presente</th><th class="gift-col-state">Estado</th><th class="gift-col-reserved">Reservado por</th><th class="gift-col-actions">Acções</th></tr></thead><tbody>${pageItems.map(g=>`<tr><td class="gift-photo-cell" data-label="Foto">${g.image_url?`<img class="gift-photo" src="${esc(g.image_url)}" alt="${esc(g.name)}">`:'<div class="gift-photo placeholder">♡</div>'}</td><td data-label="#"><span class="gift-number">${esc(g.item_no)}</span></td><td data-label="Presente"><span class="gift-name">${esc(g.name)}</span></td><td class="gift-state-cell" data-label="Estado"><span class="gift-status ${g.reserved?'reserved':'available'}">${g.reserved?'Reservado':'Disponível'}</span></td><td class="gift-reserved-cell" data-label="Reservado por"><span class="${g.reserved_by_name?'gift-reserved-by':'gift-reserved-empty'}">${esc(g.reserved_by_name||'—')}</span></td><td class="gift-actions-cell" data-label="Acções"><div class="gift-actions">${renderGiftActionButtons(g)}</div></td></tr>`).join('')}</tbody></table><div class="gift-mobile-list">${pageItems.map(g=>`<article class="gift-mobile-card" data-gift-open="${esc(g.id)}" tabindex="0" role="button" aria-label="Ver detalhes de ${esc(g.name)}"><div class="gift-mobile-photo">${g.image_url?`<img src="${esc(g.image_url)}" alt="">`:'<span>♡</span>'}</div><div class="gift-mobile-info"><div class="gift-mobile-title-row"><span class="gift-mobile-no">#${esc(g.item_no)}</span><span class="gift-mobile-name">${esc(g.name)}</span></div><span class="gift-status ${g.reserved?'reserved':'available'}">${g.reserved?'Reservado':'Disponível'}</span>${g.reserved?`<span class="gift-mobile-reserved">Por: ${esc(g.reserved_by_name||'—')}</span>`:''}</div><div class="gift-mobile-actions"><button type="button" class="ui-icon-btn" aria-label="Editar ${esc(g.name)}" title="Editar presente" data-gift-edit="${esc(g.id)}">✎</button><button type="button" class="ui-icon-btn danger" aria-label="Remover ${esc(g.name)}" title="Remover presente" data-gift-delete="${esc(g.id)}" ${g.reserved?'disabled':''}>×</button><span class="gift-mobile-chevron" aria-hidden="true">›</span></div></article>`).join('')}</div>`;
  }
  const pag=A('#giftPagination');if(!pag)return;
  const buttons=[];
  buttons.push(`<button type="button" data-gift-page="prev" ${giftPage<=1?'disabled':''} aria-label="Página anterior">‹</button>`);
  for(let p=1;p<=pages;p++){
    if(p>5 && p<pages-1 && Math.abs(p-giftPage)>1){if(p===6)buttons.push('<span style="padding:0 4px;color:#9b9189">…</span>');continue;}
    buttons.push(`<button type="button" data-gift-page="${p}" class="${p===giftPage?'active':''}" aria-current="${p===giftPage?'page':'false'}">${p}</button>`);
  }
  buttons.push(`<button type="button" data-gift-page="next" ${giftPage>=pages?'disabled':''} aria-label="Página seguinte">›</button>`);
  pag.innerHTML=buttons.join('');
  updateGiftViewButtons();
}
function updateGiftViewButtons(){
  A('#giftViewGrid')?.classList.toggle('active',giftView==='grid');
  A('#giftViewList')?.classList.toggle('active',giftView==='list');
}
A('#giftSearch')?.addEventListener('input',e=>{giftSearch=e.target.value||'';giftPage=1;renderGiftsPanel()});
A('#giftStatusFilter')?.addEventListener('change',e=>{giftStatusFilter=e.target.value;giftPage=1;renderGiftsPanel()});
A('#giftSort')?.addEventListener('change',e=>{giftSort=e.target.value;giftPage=1;renderGiftsPanel()});
A('#giftViewGrid')?.addEventListener('click',()=>{giftView='grid';renderGiftsPanel()});
A('#giftViewList')?.addEventListener('click',()=>{giftView='list';renderGiftsPanel()});
A('#giftPagination')?.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-gift-page]');if(!btn||btn.disabled)return;
  const action=btn.dataset.giftPage;
  const totalPages=Math.max(1,Math.ceil(giftFilteredList().length/GIFT_PAGE_SIZE));
  if(action==='prev')giftPage=Math.max(1,giftPage-1);else if(action==='next')giftPage=Math.min(totalPages,giftPage+1);else giftPage=Math.min(totalPages,Math.max(1,Number(action)||1));
  renderGiftsPanel();
});

A('#giftRows')?.addEventListener('click',e=>{
  const edit=e.target.closest('[data-gift-edit]');
  if(edit){e.stopPropagation();editGift(edit.dataset.giftEdit);return;}
  const del=e.target.closest('[data-gift-delete]');
  if(del){e.stopPropagation();if(!del.disabled)deleteGift(del.dataset.giftDelete);return;}
  const card=e.target.closest('[data-gift-open]');
  if(card)openGiftDetails(card.dataset.giftOpen);
});
A('#giftRows')?.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ') && e.target.closest('[data-gift-open]')){e.preventDefault();openGiftDetails(e.target.closest('[data-gift-open]').dataset.giftOpen);}
});

function openGiftDetails(id){
  const g=gifts.find(x=>String(x.id)===String(id)); if(!g)return;
  const modal=A('#giftDetailModal'); if(!modal)return;
  const image=g.image_url?`<img src="${esc(g.image_url)}" alt="${esc(g.name)}">`:'<div class="gift-detail-placeholder">♡</div>';
  setText('#giftDetailNo','#'+(g.item_no??'—')); setText('#giftDetailName',g.name||'');
  setText('#giftDetailCategory',g.category||'Lista de presentes'); setText('#giftDetailValue',g.estimated_value?String(g.estimated_value)+' MT':'—');
  setText('#giftDetailStatus',g.reserved?'Reservado':'Disponível'); setText('#giftDetailReservedBy',g.reserved_by_name||'—'); setText('#giftDetailReservedDate',g.reserved_at?new Date(g.reserved_at).toLocaleDateString('pt-PT'):'—');
  const desc=A('#giftDetailDescription'); if(desc)desc.textContent=g.description||'Presente da nossa lista de casamento.';
  const img=A('#giftDetailImage'); if(img)img.innerHTML=image;
  const reserve=A('#giftDetailReserve'); if(reserve){reserve.textContent=g.reserved?'Já reservado':'Ver no convite';reserve.disabled=!!g.reserved;reserve.onclick=()=>{if(g.reserved)return;toast('A reserva é feita pelos convidados através do convite. ❤️');};}
  A('#giftDetailEdit').onclick=()=>{closeGiftDetails();editGift(id)};
  A('#giftDetailDelete').onclick=()=>{closeGiftDetails();if(!g.reserved)deleteGift(id);};
  modal.classList.remove('hidden'); document.body.classList.add('modal-scroll-lock');
}
function closeGiftDetails(){const modal=A('#giftDetailModal');if(modal)modal.classList.add('hidden');document.body.classList.remove('modal-scroll-lock');}
A('#closeGiftDetailModal')?.addEventListener('click',closeGiftDetails);
A('#giftDetailModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeGiftDetails()});

// ---------------- ATALHOS DO DASHBOARD ----------------
A('#shareInviteHome')?.addEventListener('click',async()=>{
 const url=inviteUrl();
 try{
  if(navigator.share){await navigator.share({title:'Agnaldo & Fáuzia',text:'O nosso convite de casamento',url});}
  else{await navigator.clipboard.writeText(url);toast('Link do convite copiado.');}
 }catch(e){if(e?.name!=='AbortError')toast('Não foi possível partilhar o convite.');}
});
const carouselTrack=document.querySelector('.carousel-track');
A('#carouselPrev')?.addEventListener('click',()=>carouselTrack?.scrollBy({left:-260,behavior:'smooth'}));
A('#carouselNext')?.addEventListener('click',()=>carouselTrack?.scrollBy({left:260,behavior:'smooth'}));

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
A('#closeQrModal')?.addEventListener('click',()=>closeAnyModal(A('#qrModal')));
A('#copyInviteLink')?.addEventListener('click',async()=>{if(!currentQrGuest)return;const url=inviteUrl()+`?convite=${encodeURIComponent(currentQrGuest.code)}`;await navigator.clipboard.writeText(url);toast('Link do convite copiado.');});
A('#downloadQr')?.addEventListener('click',()=>{const img=A('#qrCode img')||A('#qrCode canvas');if(!img){toast('QR Code ainda não está pronto.');return;}const a=document.createElement('a');a.href=img.tagName.toLowerCase()==='canvas'?img.toDataURL('image/png'):img.src;a.download=`convite-${currentQrGuest.code}.png`;a.click();});
function openModal(g={id:'',full_name:'',whatsapp:'',allowed_guests:1,code:genCode()}){A('#modalTitle').textContent=g.id?'Editar convidado':'Novo convidado';A('#guestId').value=g.id;A('#gName').value=g.full_name;A('#gPhone').value=g.whatsapp||'';A('#gAllowed').value=g.allowed_guests;A('#gCode').value=g.code;A('#gMessage').value=makeMessage(g);A('#waLink').href=g.whatsapp?`https://wa.me/${String(g.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(makeMessage(g))}`:'#';A('#modal').classList.remove('hidden');document.body.classList.add('modal-scroll-lock');setTimeout(()=>A('#gName').focus(),80)}
window.editGuest=id=>openModal(guests.find(x=>x.id===id));
window.sendWhats=async id=>{const g=guests.find(x=>x.id===id);if(!g)return;if(!g.whatsapp){toast('Este convidado ainda não tem WhatsApp registado.');return}const url=`https://wa.me/${String(g.whatsapp).replace(/\D/g,'')}?text=${encodeURIComponent(makeMessage(g))}`;window.open(url,'_blank');const {error}=await supabaseClient.rpc('admin_mark_invitation_sent',{invitation_id:id});if(error){toast('WhatsApp aberto, mas não foi possível registar o envio.');return}await refresh();toast('Convite marcado como enviado. ❤️')};
window.openWhats=window.sendWhats;
window.removeGuest=async id=>{const g=guests.find(x=>x.id===id);if(!g)return;if(!confirm(`Remover o convite de “${g.full_name}”? Esta acção não pode ser anulada.`))return;const {error}=await supabaseClient.rpc('admin_delete_invitation',{invitation_id:id});if(error){toast(error.message);return}await refresh();toast('Convidado removido.')} ;

A('#guestSearch')?.addEventListener('input',render);
document.querySelectorAll('.guest-filter').forEach(btn=>btn.addEventListener('click',()=>{guestFilter=btn.dataset.guestFilter;document.querySelectorAll('.guest-filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');render()}));
A('#addBtn')?.addEventListener('click',()=>openModal());A('#addBtn2')?.addEventListener('click',()=>openModal());A('#closeModal')?.addEventListener('click',()=>{A('#modal')?.classList.add('hidden');document.body.classList.remove('modal-scroll-lock')});
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
A('#copyMsg')?.addEventListener('click',async()=>{await navigator.clipboard.writeText(A('#gMessage').value);toast('Mensagem copiada.')});
A('#csvBtn')?.addEventListener('click',()=>A('#csvFile')?.click());
A('#csvFile')?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;const text=await f.text();const lines=text.split(/\r?\n/).filter(Boolean);const sep=lines[0].includes(';')?';':',';const heads=lines.shift().split(sep).map(x=>x.trim().toLowerCase());let ok=0;for(const line of lines){const v=line.split(sep).map(x=>x.trim().replace(/^"|"$/g,''));const row=Object.fromEntries(heads.map((h,i)=>[h,v[i]||'']));const {error}=await supabaseClient.rpc('admin_create_invitation',{p_code:row.codigo||genCode(),p_full_name:row.nome||row.name||'',p_whatsapp:row.whatsapp||row.telefone||'',p_allowed_guests:Number(row.permitidos||row.allowed_guests||1)});if(!error)ok++}toast(`${ok} convidado(s) importado(s).`);await refresh();e.target.value=''});
A('#exportBtn')?.addEventListener('click',()=>{const heads=['nome','codigo','whatsapp','permitidos','estado','acompanhantes'];const rows=guests.map(g=>[g.full_name,g.code,g.whatsapp||'',g.allowed_guests,g.rsvp_status,g.companion_count||0]);const csv=[heads,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');const blob=new Blob(["\ufeff"+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='convidados-agnaldo-fauzia.csv';a.click();URL.revokeObjectURL(a.href)});

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
A('#checkinSearchBtn')?.addEventListener('click',()=>searchCheckin(A('#checkinCode')?.value||''));
A('#checkinCode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchCheckin(e.target.value)}});
A('#startScannerBtn')?.addEventListener('click',async()=>{
 if(!window.Html5Qrcode){toast('Leitor QR indisponível.');return}
 if(scanner)return;
 const reader=A('#qrReader');reader.classList.remove('hidden');A('#startScannerBtn').classList.add('hidden');A('#stopScannerBtn').classList.remove('hidden');
 scanner=new Html5Qrcode('qrReader');
 try{await scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:250,height:250}},text=>{let code=text;try{const u=new URL(text);code=u.searchParams.get('convite')||text}catch(_){}A('#checkinCode').value=code;searchCheckin(code);stopScanner();},()=>{});}catch(err){toast('Não foi possível abrir a câmara. Verifique a permissão do navegador.');stopScanner();}
});
async function stopScanner(){if(!scanner){A('#qrReader').classList.add('hidden');A('#startScannerBtn').classList.remove('hidden');A('#stopScannerBtn').classList.add('hidden');return}try{await scanner.stop();}catch(_){}try{scanner.clear();}catch(_){}scanner=null;A('#qrReader').classList.add('hidden');A('#startScannerBtn').classList.remove('hidden');A('#stopScannerBtn').classList.add('hidden');}
A('#stopScannerBtn')?.addEventListener('click',stopScanner);
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

A('#addGiftBtn')?.addEventListener('click',()=>{resetGiftModal();A('#giftModal').classList.remove('hidden');document.body.classList.add('modal-scroll-lock');setTimeout(()=>A('#giftName').focus(),80)});
A('#closeGiftModal')?.addEventListener('click',()=>{A('#giftModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock')});

window.editGift=id=>{
 const g=gifts.find(x=>String(x.id)===String(id)); if(!g)return;
 resetGiftModal(); editingGiftId=g.id; oldGiftImageUrl=g.image_url||null;
 A('#giftId').value=g.id; A('#giftName').value=g.name||'';
 A('#giftModalTitle').textContent='Editar presente'; A('#giftSaveBtn').textContent='Guardar alterações';
 if(g.image_url){
   A('#giftCurrent').innerHTML=`<p class="muted">Fotografia actual:</p><img src="${esc(g.image_url)}" alt="${esc(g.name)}">`;
   A('#giftCurrent').classList.remove('hidden'); A('#removeGiftPhoto').classList.remove('hidden');
 }
 A('#giftModal').classList.remove('hidden');document.body.classList.add('modal-scroll-lock');setTimeout(()=>A('#giftName').focus(),80);
};

A('#removeGiftPhoto')?.addEventListener('click',()=>{
 if(!editingGiftId){return}
 removeGiftImage=true;
 A('#giftCurrent').classList.add('hidden');
 A('#removeGiftPhoto').classList.add('hidden');
 A('#giftPreview').classList.add('hidden'); A('#giftPreview').innerHTML='';
 toast('A fotografia será removida ao guardar.');
});

A('#giftPhoto')?.addEventListener('change',e=>{
 const f=e.target.files[0],box=A('#giftPreview');
 if(!f){box.classList.add('hidden');return}
 if(!/^image\/(jpeg|png|webp)$/.test(f.type)){showMsg(A('#giftFormMsg'),'Escolha uma imagem JPG, PNG ou WebP válida.');e.target.value='';return}
 if(f.size>15*1024*1024){showMsg(A('#giftFormMsg'),'A fotografia original é demasiado grande. Escolha uma imagem com menos de 15 MB.');e.target.value='';return}
 removeGiftImage=false;
 const url=URL.createObjectURL(f);
 box.innerHTML=`<p class="muted">Pré-visualização:</p><img src="${url}" alt="Pré-visualização">`;box.classList.remove('hidden');
});

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
     A('#giftModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock');await refresh();toast('Presente actualizado com sucesso. ❤️');
   }else{
     const {data,error}=await supabaseClient.rpc('admin_create_gift',{p_name:name});
     if(error)throw new Error('Não foi possível criar o presente: '+error.message);
     createdId=typeof data==='object'&&data!==null?(data.id??data):data;
     if(!createdId)throw new Error('O presente foi criado, mas o sistema não recebeu o identificador.');
     if(file){
       try{newUpload=await uploadGiftPhoto(createdId,file);await setGiftImage(createdId,newUpload.url)}
       catch(err){await supabaseClient.rpc('admin_delete_gift',{gift_id:createdId});if(newUpload?.path)await supabaseClient.storage.from('gift-photos').remove([newUpload.path]);throw err}
     }
     A('#giftModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock');await refresh();toast('Presente adicionado com sucesso. ❤️');
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
// Fecho universal dos pop-ups: cada modal recebe um X real e funcional no canto superior direito.
function closeAnyModal(modal){
  if(!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-scroll-lock');
}
// V6.41: o X dos pop-ups é criado apenas pelo script de fecho fixo em admin.html.
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('mousedown',e=>{if(e.target===m)closeAnyModal(m)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.modal:not(.hidden)').forEach(closeAnyModal)}});

// ---------------- MESAS ----------------
let drawerGuestSearch='';
let pickerTableId=null;

function peopleForGuest(g){return 1+Number(g?.companion_count||0)}
// Compatibilidade: o dashboard continua a usar a colecção de convidados confirmados.
function confirmedGuests(){return guests.filter(g=>g.rsvp_status==='confirmed')}

// Para organização de mesas, um convite recusado não é candidato a lugar.
// Convites confirmados e pendentes podem ser organizados antecipadamente.
function seatableGuests(){return guests.filter(g=>g.rsvp_status!=='declined')}

function tableGuestList(t){
  return Array.isArray(t?.guests)
    ? t.guests.filter(g=>g && g.rsvp_status!=='declined')
    : [];
}

function guestAssignedTable(guestId){
 const g=guests.find(x=>String(x.id)===String(guestId));
 if(g?.table_id){
   const direct=receptionTables.find(t=>String(t.id)===String(g.table_id));
   if(direct)return direct;
 }
 for(const t of receptionTables){
   if(tableGuestList(t).some(x=>String(x.id)===String(guestId))) return t;
 }
 return null;
}

function unassignedGuests(){return seatableGuests().filter(g=>!guestAssignedTable(g.id))}

function tableOccupancy(t){
 const list=tableGuestList(t);
 const people=list.reduce((n,g)=>n+peopleForGuest(g),0);
 const capacity=Number(t.capacity)||0;
 return {list,people,capacity,remaining:Math.max(0,capacity-people),pct:capacity?Math.min(100,Math.round(people/capacity*100)):0};
}

function renderTables(){
 const totalSeats=receptionTables.reduce((n,t)=>n+Number(t.capacity||0),0);
 const seatingGuests=seatableGuests();
 const totalPeople=seatingGuests.reduce((n,g)=>n+peopleForGuest(g),0);
 const assignedPeople=seatingGuests.filter(g=>guestAssignedTable(g.id)).reduce((n,g)=>n+peopleForGuest(g),0);
 const waitingPeople=Math.max(0,totalPeople-assignedPeople);
 A('#seatingSummary').innerHTML=`<div class="seat-stat"><strong>${receptionTables.length}</strong><span>Mesas</span></div><div class="seat-stat"><strong>${totalSeats}</strong><span>Lugares</span></div><div class="seat-stat"><strong>${assignedPeople}</strong><span>Pessoas distribuídas</span></div><div class="seat-stat"><strong>${waitingPeople}</strong><span>Pessoas sem mesa</span></div>`;

 A('#tableList').innerHTML=receptionTables.map(t=>{
   const o=tableOccupancy(t);
   const status=o.people>=o.capacity&&o.capacity>0?'Cheia':o.people?'Parcial':'Livre';
   const statusClass=o.people>=o.capacity&&o.capacity>0?'full':o.people?'partial':'available';
   const guestHtml=o.list.length?o.list.map(g=>`<div class="seat-guest"><div><strong>${esc(g.full_name)}</strong><small>${peopleForGuest(g)} ${peopleForGuest(g)===1?'pessoa':'pessoas'}${g.rsvp_status==='pending'?' · Pendente':''}</small></div>${iconBtn('remove','Retirar convidado da mesa',`assignTable('${g.id}','')`)}</div>`).join(''):'<p class="muted empty-seat">Ainda não há convidados nesta mesa.</p>';
   return `<article class="table-card" data-table-card="${t.id}">
     <div class="table-card-head"><div><p class="section-kicker">MESA</p><h3>${esc(t.name)}</h3><small>${esc(t.description||'')}</small></div>
     <div class="table-card-actions">${iconBtn('edit','Editar mesa',`editTable(${t.id})`)}${iconBtn('remove','Remover mesa',`deleteTable(${t.id})`)}</div></div>
     <div class="table-capacity-summary"><div><strong>${o.people}</strong><span>ocupados</span></div><div><strong>${o.remaining}</strong><span>livres</span></div><span class="table-state ${statusClass}">${status}</span></div>
     <div class="capacity-track"><i style="width:${o.pct}%"></i></div>
     <div class="table-guests">${guestHtml}</div>
     <button class="drawer-add-guests table-add-guest-btn" type="button" onclick="openGuestPicker(${t.id})" ${o.remaining<1?'':'aria-label'}="Adicionar convidado">${ACTION_ICONS.add}<span>Adicionar convidado</span></button>
   </article>`;
 }).join('')||'<div class="empty-state">Ainda não existem mesas. Crie a primeira mesa.</div>';

 const un=unassignedGuests();
 A('#unassignedGuests').innerHTML=un.length?un.map(g=>`<div class="unassigned-guest"><div><b>${esc(g.full_name)}</b><small>${peopleForGuest(g)} ${peopleForGuest(g)===1?'pessoa':'pessoas'} · ${esc(g.code)}${g.rsvp_status==='pending'?' · Pendente':''}</small></div><select aria-label="Escolher mesa para ${esc(g.full_name)}" onchange="quickAssignGuest('${g.id}',this)">${tableOptionsForGuest(g.id,guestAssignedTable(g.id)?.id||'')}</select></div>`).join(''):'<div class="empty-state">Todos os convidados aptos para a organização já têm mesa.</div>';
 renderTableDrawer();
}

function renderTableDrawer(){
 const q=drawerGuestSearch.trim().toLowerCase();
 const un=unassignedGuests().filter(g=>!q || `${g.full_name} ${g.code} ${g.whatsapp||''}`.toLowerCase().includes(q));
 const totalUnassigned=unassignedGuests().length;
 A('#drawerUnassignedCount').textContent=`${totalUnassigned} ${totalUnassigned===1?'convidado':'convidados'} sem mesa`;
 A('#drawerUnassignedGuests').innerHTML=un.length?un.map(g=>`<div class="drawer-person" draggable="true" data-guest-id="${g.id}"><span class="drawer-person-dot"></span><div class="drawer-person-main"><strong>${esc(g.full_name)}</strong><small>${peopleForGuest(g)} ${peopleForGuest(g)===1?'pessoa':'pessoas'} · ${esc(g.code)}${g.rsvp_status==='pending'?' · Pendente':''}</small></div><button class="drawer-mini-btn" type="button" aria-label="Escolher mesa para ${esc(g.full_name)}" title="Escolher mesa" onclick="openGuestPicker(null,'${g.id}')">＋</button><span class="drag-handle" title="Arrastar convidado">⠿</span></div>`).join(''):`<div class="drawer-empty">Não há convidados sem mesa${q?' para esta pesquisa':''}.</div>`;

 A('#drawerTableList').innerHTML=receptionTables.length?receptionTables.map(t=>{
   const o=tableOccupancy(t);
   const status=o.people>=o.capacity&&o.capacity>0?'Cheia':o.people?'Parcial':'Livre';
   const statusClass=o.people>=o.capacity&&o.capacity>0?'full':o.people?'partial':'available';
   const guestsHtml=o.list.length?o.list.map(g=>`<div class="drawer-slot filled drawer-draggable" draggable="true" data-guest-id="${g.id}" data-table-id="${t.id}"><span><strong>${esc(g.full_name)}</strong><small>${peopleForGuest(g)} ${peopleForGuest(g)===1?'pessoa':'pessoas'}${g.rsvp_status==='pending'?' · Pendente':''}</small></span>${iconBtn('remove','Retirar da mesa',`assignTable('${g.id}','')`)}</div>`).join(''):'<div class="drawer-table-empty">Nenhum convidado atribuído.</div>';
   return `<div class="drawer-table" data-table-id="${t.id}"><div class="drawer-table-head"><div><h4>${esc(t.name)}</h4><span class="drawer-table-meta">${o.people}/${o.capacity} pessoas · ${o.remaining} livres <b class="drawer-status ${statusClass}">${status}</b></span></div><div class="drawer-table-actions">${iconBtn('edit','Editar mesa',`editTable(${t.id})`)}${iconBtn('remove','Remover mesa',`deleteTable(${t.id})`)}</div></div><div class="drawer-capacity-track"><i style="width:${o.pct}%"></i></div><div class="drawer-slots">${guestsHtml}</div><button class="drawer-add-guests" type="button" onclick="openGuestPicker(${t.id})" aria-label="Adicionar convidados a ${esc(t.name)}">${ACTION_ICONS.add}<span>Adicionar convidado</span></button></div>`;
 }).join(''):'<div class="drawer-empty">Adicione a primeira mesa para começar a organização.</div>';
 bindDrawerDnD();
}

function bindDrawerDnD(){
 document.querySelectorAll('#drawerUnassignedGuests [draggable],#drawerTableList [draggable]').forEach(el=>{
   el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',el.dataset.guestId);e.dataTransfer.effectAllowed='move';el.classList.add('dragging')});
   el.addEventListener('dragend',()=>el.classList.remove('dragging'));
 });
 document.querySelectorAll('#drawerTableList .drawer-table').forEach(table=>{
   table.addEventListener('dragover',e=>{e.preventDefault();table.classList.add('drag-target')});
   table.addEventListener('dragleave',()=>table.classList.remove('drag-target'));
   table.addEventListener('drop',async e=>{e.preventDefault();table.classList.remove('drag-target');const id=e.dataTransfer.getData('text/plain');if(id)await assignTable(id,table.dataset.tableId)});
 });
}

function openTableOrganizer(tableId){
 A('#tableOrganizer').classList.remove('hidden');A('#tableOrganizer').setAttribute('aria-hidden','false');document.body.classList.add('modal-scroll-lock','admin-modal-open');
 renderTableDrawer();
 if(tableId)setTimeout(()=>document.querySelector(`#drawerTableList [data-table-id="${tableId}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'}),50);
}
function closeTableOrganizer(){A('#tableOrganizer').classList.add('hidden');A('#tableOrganizer').setAttribute('aria-hidden','true');document.body.classList.remove('modal-scroll-lock','admin-modal-open');closeGuestPicker();}

function openGuestPicker(tableId,focusGuestId=''){
 pickerTableId=tableId?String(tableId):null;
 let m=A('#guestPickerModal');
 if(!m){m=document.createElement('div');m.id='guestPickerModal';m.className='guest-picker-modal hidden';m.innerHTML=`<div class="guest-picker"><header class="guest-picker-head"><div><p class="drawer-kicker">CONVIDADOS</p><h3 id="guestPickerTitle">Adicionar convidados</h3><span id="guestPickerCapacity" class="guest-picker-capacity"></span></div><button id="closeGuestPicker" type="button" aria-label="Fechar">×</button></header><div class="guest-picker-search"><input id="guestPickerSearch" type="search" placeholder="Pesquisar por nome, código ou WhatsApp"></div><div class="guest-picker-list" id="guestPickerList"></div></div>`;document.body.appendChild(m);m.addEventListener('mousedown',e=>{if(e.target===m)closeGuestPicker()});A('#closeGuestPicker').onclick=closeGuestPicker;A('#guestPickerSearch').addEventListener('input',renderGuestPicker)}
 const table=receptionTables.find(t=>String(t.id)===String(pickerTableId));
 A('#guestPickerTitle').textContent=table?`Adicionar convidados em “${table.name}”`:'Escolher mesa';
 A('#guestPickerSearch').value=focusGuestId?(unassignedGuests().find(g=>String(g.id)===String(focusGuestId))?.full_name||''):'';
 m.classList.remove('hidden');document.body.classList.add('modal-scroll-lock');renderGuestPicker();setTimeout(()=>A('#guestPickerSearch').focus(),50);
}
function closeGuestPicker(){const m=A('#guestPickerModal');if(m)m.classList.add('hidden');pickerTableId=null}

function renderGuestPicker(){
 const q=(A('#guestPickerSearch')?.value||'').trim().toLowerCase();
 const table=pickerTableId?receptionTables.find(t=>String(t.id)===String(pickerTableId)):null;
 const allCandidates=unassignedGuests();
 const candidates=allCandidates.filter(g=>!q||`${g.full_name} ${g.code} ${g.whatsapp||''}`.toLowerCase().includes(q));
 const o=table?tableOccupancy(table):null;
 const cap=A('#guestPickerCapacity');
 if(cap)cap.textContent=table?`${o.people}/${o.capacity} pessoas · ${o.remaining} lugar(es) livres`:`${allCandidates.length} convidados aptos sem mesa`;
 const list=candidates.map(g=>{
   const fits=!table||peopleForGuest(g)<=o.remaining;
   const meta=`${peopleForGuest(g)} ${peopleForGuest(g)===1?'pessoa':'pessoas'} · ${esc(g.code)}${g.rsvp_status==='pending'?' · Pendente':''}`;
   const action=table?(fits?iconBtn('choose','Adicionar convidado à mesa',`pickerAssign('${g.id}')`):'<span class="picker-status picker-status-muted">Sem espaço</span>'):'<span class="picker-status picker-status-ok">Seleccione uma mesa</span>';
   return `<div class="picker-guest" data-guest-id="${g.id}"><span class="drawer-person-dot"></span><div><strong>${esc(g.full_name)}</strong><small>${meta}</small></div>${action}</div>`;
 }).join('');
 A('#guestPickerList').innerHTML=candidates.length?list:`<div class="drawer-empty">${allCandidates.length?'Nenhum convidado corresponde à pesquisa.':'Não existem convidados aptos sem mesa.'}</div>`;
}
window.pickerAssign=async id=>{
 if(!pickerTableId)return;
 const guest=guests.find(g=>String(g.id)===String(id)),table=receptionTables.find(t=>String(t.id)===String(pickerTableId));
 if(!guest||!table)return;
 const o=tableOccupancy(table);
 if(peopleForGuest(guest)>o.remaining){toast(`A ${table.name} não tem lugares suficientes para este convite.`);return}
 const ok=await assignTable(id,String(pickerTableId));
 if(ok)renderGuestPicker();
};
window.quickPickerAssign=async function(id,select){const old=select.value;await quickAssignGuest(id,select);if(select.value===''){select.value=old}}
window.assignTable=async(id,tableId)=>{
 const guest=guests.find(g=>String(g.id)===String(id));
 if(!guest)return false;
 if(tableId){
   const table=receptionTables.find(t=>String(t.id)===String(tableId));
   if(!table){toast('Mesa não encontrada.');return false}
   const o=tableOccupancy(table);
   const alreadyInTarget=o.list.some(g=>String(g.id)===String(id));
   const remaining=o.remaining+(alreadyInTarget?peopleForGuest(guest):0);
   if(peopleForGuest(guest)>remaining){toast(`A ${table.name} não tem lugares suficientes para este convite.`);return false}
 }
 const r=await supabaseClient.rpc('admin_assign_guest_table',{p_invitation_id:id,p_table_id:tableId?Number(tableId):null});
 if(r.error){toast(r.error.message);await refresh();return false}
 await refresh();toast(tableId?'Mesa atribuída.':'Convidado retirado da mesa.');return true
};
function openTableModal(t){
 A('#tableModalTitle').textContent=t?'Editar mesa':'Nova mesa';
 A('#tableName').value=t?.name||'';
 A('#tableCapacity').value=t?.capacity||8;
 A('#tableDescription').value=t?.description||'';
 A('#tableModal').dataset.id=t?.id||'';
 A('#tableFormMsg').classList.add('hidden');
 A('#tableModal').classList.remove('hidden');
 A('#tableModal').setAttribute('aria-hidden','false');
 document.body.classList.add('modal-scroll-lock');
 setTimeout(()=>A('#tableName').focus(),80);
}
window.editTable=id=>openTableModal(receptionTables.find(t=>String(t.id)===String(id)));
window.deleteTable=async id=>{
 const t=receptionTables.find(x=>String(x.id)===String(id));
 if(!t)return;
 if(!confirm(`Remover a mesa “${t.name}”? Os convidados ficarão sem mesa.`))return;
 const r=await supabaseClient.rpc('admin_delete_table',{p_id:Number(id)});
 if(r.error){toast(r.error.message);return}
 await refresh();
 toast('Mesa removida.');
};
A('#addTableBtn')?.addEventListener('click',()=>openTableModal());
A('#organizeTablesBtn')?.addEventListener('click',()=>openTableOrganizer());
A('#closeTableOrganizer')?.addEventListener('click',closeTableOrganizer);
A('#closeTableModal')?.addEventListener('click',()=>{
 const m=A('#tableModal');
 if(m){m.classList.add('hidden');m.setAttribute('aria-hidden','true')}
 document.body.classList.remove('modal-scroll-lock');
});
A('#drawerAddTable')?.addEventListener('click',()=>openTableModal());
A('#drawerGuestSearch')?.addEventListener('input',e=>{drawerGuestSearch=e.target.value;renderTableDrawer()});
A('#tableForm')?.addEventListener('submit',async e=>{
 e.preventDefault();
 const modal=A('#tableModal');
 const id=modal?.dataset.id||'';
 const name=A('#tableName').value.trim();
 const capacity=Number(A('#tableCapacity').value);
 const description=A('#tableDescription').value.trim();
 if(!name||capacity<1){showMsg(A('#tableFormMsg'),'Preencha o nome e uma capacidade válida.');return}
 const fn=id?'admin_update_table':'admin_create_table';
 const args=id?{p_id:Number(id),p_name:name,p_capacity:capacity,p_description:description}:{p_name:name,p_capacity:capacity,p_description:description};
 const r=await supabaseClient.rpc(fn,args);
 if(r.error){showMsg(A('#tableFormMsg'),r.error.message);return}
 modal.classList.add('hidden');
 modal.setAttribute('aria-hidden','true');
 document.body.classList.remove('modal-scroll-lock');
 await refresh();
 toast(id?'Mesa actualizada.':'Mesa criada.');
 if(!id)openTableOrganizer();
});

// ---------------- PROTOCOLOS ----------------
function renderProtocols(){A('#protocolList').innerHTML=protocols.map(p=>`<article class="protocol-card"><div class="protocol-avatar">${esc((p.full_name||'?').slice(0,1).toUpperCase())}</div><div class="protocol-info"><h3>${esc(p.full_name)}</h3><p>${esc(p.whatsapp||'Sem WhatsApp')}</p><span class="protocol-code">${esc(p.access_code)}</span><span class="protocol-role">${p.role==='chief'?'PROTOCOLO CHEFE':'PROTOCOLO'}</span></div><div class="protocol-actions"><span class="badge ${p.active?'confirmed':'pending'}">${p.active?'Activo':'Inactivo'}</span>${iconBtn('edit','Editar protocolo',`editProtocol('${p.id}')`)}${iconBtn(p.active?'deactivate':'activate',p.active?'Desactivar protocolo':'Activar protocolo',`toggleProtocol('${p.id}',${!p.active})`)}${iconBtn('remove','Remover protocolo',`deleteProtocol('${p.id}')`)}</div></article>`).join('')||'<div class="empty-state">Ainda não existem protocolos adicionados.</div>'}
function openProtocolModal(p=null){A('#protocolModalTitle').textContent=p?'Editar protocolo':'Novo protocolo';A('#protocolModalDescription').textContent=p?'Actualize os dados de acesso deste protocolo.':'Crie um acesso individual para quem vai trabalhar na recepção.';A('#protocolSubmitBtn').textContent=p?'Guardar alterações':'Criar acesso';A('#protocolPin').required=!p;A('#protocolPin').value='';A('#protocolPinHint').textContent=p?'Deixe o PIN vazio para manter o actual. Se quiser corrigir ou trocar o PIN, introduza um novo PIN.':'Mínimo de 4 dígitos.';A('#protocolName').value=p?.full_name||'';A('#protocolPhone').value=p?.whatsapp||'';A('#protocolCode').value=p?.access_code||'';A('#protocolRole').value=p?.role||'protocol';A('#protocolForm').dataset.id=p?.id||'';A('#protocolFormMsg').classList.add('hidden');A('#protocolModal').classList.remove('hidden');document.body.classList.add('modal-scroll-lock');setTimeout(()=>A('#protocolName').focus(),80)}
A('#addProtocolBtn')?.addEventListener('click',()=>openProtocolModal());
window.editProtocol=id=>{const p=protocols.find(x=>x.id===id);if(p)openProtocolModal(p)};
A('#closeProtocolModal')?.addEventListener('click',()=>{A('#protocolModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock')});
A('#protocolForm').onsubmit=async e=>{e.preventDefault();const id=A('#protocolForm').dataset.id||'',name=A('#protocolName').value.trim(),phone=A('#protocolPhone').value.trim(),code=A('#protocolCode').value.trim(),pin=A('#protocolPin').value.trim(),role=A('#protocolRole').value;if(!name||!code||(id===''&&!pin)){showMsg(A('#protocolFormMsg'),'Preencha o nome, código e PIN.');return}const fn=id?'admin_update_protocol':'admin_create_protocol';const args=id?{p_id:id,p_full_name:name,p_whatsapp:phone,p_access_code:code,p_pin:pin||null,p_role:role}:{p_full_name:name,p_whatsapp:phone,p_access_code:code,p_pin:pin,p_role:role};const r=await supabaseClient.rpc(fn,args);if(r.error){showMsg(A('#protocolFormMsg'),r.error.message);return}A('#protocolModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock');await refresh();toast(id?'Protocolo actualizado.':'Acesso de protocolo criado.')};
window.toggleProtocol=async(id,active)=>{const r=await supabaseClient.rpc('admin_toggle_protocol',{p_id:id,p_active:active});if(r.error){toast(r.error.message);return}await refresh()};window.deleteProtocol=async id=>{const p=protocols.find(x=>x.id===id);if(!p)return;if(!confirm(`Remover o acesso de “${p.full_name}”?`))return;const r=await supabaseClient.rpc('admin_delete_protocol',{p_id:id});if(r.error){toast(r.error.message);return}await refresh();toast('Acesso removido.')};

init();
// ---------------- PROGRAMA ----------------
let programItems=[];
function normaliseProgramItem(x){
  return {date:String(x?.date||''),time:String(x?.time||''),title:String(x?.title||''),description:String(x?.description||''),location:String(x?.location||''),map_url:String(x?.map_url||'')};
}
async function loadProgramAdmin(){
  const {data,error}=await supabaseClient.from('wedding_settings').select('program_items').eq('id',1).maybeSingle();
  if(error){toast(error.message);return}
  programItems=Array.isArray(data?.program_items)?data.program_items.map(normaliseProgramItem):[];
  renderProgramAdmin();
}
function renderProgramAdmin(){
  const box=A('#programAdminList'); if(!box)return;
  if(!programItems.length){box.innerHTML='<div class="empty-state">Ainda não existem momentos no programa.</div>';return}
  box.innerHTML=programItems.map((p,i)=>`<article class="program-admin-card"><div class="program-admin-number">${String(i+1).padStart(2,'0')}</div><div class="program-admin-info"><p class="program-time">${esc(p.date)}${p.time?' · '+esc(p.time):''}</p><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${p.location?`<small>⌖ ${esc(p.location)}</small>`:''}</div><div class="program-admin-actions">${iconBtn('edit','Editar momento do programa',`editProgram(${i})`,'type="button"')}${iconBtn('remove','Remover momento do programa',`deleteProgram(${i})`,'type="button"')}</div></article>`).join('');
}
function resetProgramModal(){
  A('#programForm').reset(); A('#programId').value=''; A('#programModalTitle').textContent='Novo momento'; A('#deleteProgramBtn').classList.add('hidden'); A('#programFormMsg').classList.add('hidden');
}
function openProgramModal(item=null,index=null){
  resetProgramModal();
  if(item){A('#programId').value=String(index);A('#programModalTitle').textContent='Editar momento';A('#programDate').value=item.date;A('#programTime').value=item.time;A('#programTitle').value=item.title;A('#programDescription').value=item.description;A('#programLocation').value=item.location;A('#programMapUrl').value=item.map_url;A('#deleteProgramBtn').classList.remove('hidden')}
  A('#programModal').classList.remove('hidden');document.body.classList.add('modal-scroll-lock');setTimeout(()=>A('#programDate').focus(),80);
}
A('#addProgramBtn')?.addEventListener('click',()=>openProgramModal());
A('#closeProgramModal')?.addEventListener('click',()=>{A('#programModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock')});
A('#programModal')?.addEventListener('mousedown',e=>{if(e.target===A('#programModal')){A('#programModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock')}});
window.editProgram=i=>openProgramModal(programItems[i],i);
window.deleteProgram=async i=>{
  if(!programItems[i])return;
  if(!confirm(`Remover “${programItems[i].title}” do programa?`))return;
  programItems.splice(i,1);
  const {error}=await supabaseClient.rpc('admin_update_program',{p_program_items:programItems});
  if(error){toast(error.message);return}
  renderProgramAdmin();toast('Momento removido do programa.');
};
A('#deleteProgramBtn')?.addEventListener('click',async()=>{
  const i=Number(A('#programId').value); if(!Number.isInteger(i)||!programItems[i])return;
  if(!confirm(`Remover “${programItems[i].title}” do programa?`))return;
  programItems.splice(i,1);
  const {error}=await supabaseClient.rpc('admin_update_program',{p_program_items:programItems});
  if(error){showMsg(A('#programFormMsg'),error.message);return}
  A('#programModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock');renderProgramAdmin();toast('Momento removido do programa.');
});
A('#programForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const item=normaliseProgramItem({date:A('#programDate').value.trim(),time:A('#programTime').value.trim(),title:A('#programTitle').value.trim(),description:A('#programDescription').value.trim(),location:A('#programLocation').value.trim(),map_url:A('#programMapUrl').value.trim()});
  const i=A('#programId').value===''?null:Number(A('#programId').value);
  if(i===null)programItems.push(item);else programItems[i]=item;
  const btn=A('#programSaveBtn');btn.disabled=true;btn.textContent='A guardar…';
  try{
    const {error}=await supabaseClient.rpc('admin_update_program',{p_program_items:programItems});
    if(error)throw error;
    A('#programModal').classList.add('hidden');document.body.classList.remove('modal-scroll-lock');renderProgramAdmin();toast('Programa actualizado com sucesso. ❤️');
  }catch(err){if(i===null)programItems.pop();else await loadProgramAdmin();showMsg(A('#programFormMsg'),err?.message||String(err));}
  finally{btn.disabled=false;btn.textContent='Guardar momento'}
});
const _refreshOriginal=refresh;
refresh=async function(){await _refreshOriginal();await loadProgramAdmin()};

/* V6.70 — no mobile, a lista de presentes é a vista principal para evitar grelha apertada. */
(function(){
  const mq=window.matchMedia('(max-width:760px)');
  function syncGiftMobile(){
    if(mq.matches && typeof giftView!=='undefined' && giftView!=='list'){
      giftView='list';
      if(typeof renderGiftsPanel==='function') renderGiftsPanel();
    }
  }
  syncGiftMobile();
  mq.addEventListener?.('change',syncGiftMobile);
})();
