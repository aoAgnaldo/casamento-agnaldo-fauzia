(function(){
 'use strict';
 const tables=document.getElementById('mesas'),list=document.getElementById('tableList');
 const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(tables&&list){
 const tools=document.createElement('div');tools.className='ux48-tools';tools.innerHTML='<label>Encontrar mesa ou convidado<input type="search" placeholder="Nome da mesa, convidado ou descrição…" aria-label="Pesquisar mesas e convidados"></label><label>Ocupação<select aria-label="Filtrar ocupação das mesas"><option value="all">Todas as mesas</option><option value="available">Com lugares livres</option><option value="full">Mesas cheias</option></select></label>';
 const result=document.createElement('p');result.className='ux48-result';result.setAttribute('role','status');
 const layout=tables.querySelector('.seating-layout');layout.before(tools,result);
 function apply(){const q=normal(tools.querySelector('input').value),filter=tools.querySelector('select').value;const cards=[...list.querySelectorAll('.table-card')];let shown=0;
 for(const card of cards){const full=!!card.querySelector('.table-state.full');const show=(!q||normal(card.textContent).includes(q))&&(filter==='all'||(filter==='full'?full:!full));if(card.classList.contains('ux48-hidden')===show)card.classList.toggle('ux48-hidden',!show);if(show)shown++;}
 const text=`${shown} de ${cards.length} mesas${shown===0&&cards.length?' · Nenhum resultado. Ajuste a pesquisa ou o filtro.':''}`;if(result.textContent!==text)result.textContent=text;
 }
 tools.addEventListener('input',apply);tools.addEventListener('change',apply);new MutationObserver(apply).observe(list,{childList:true,subtree:true});apply();
 }
 let dirty=false,note=null,editor=null;
 function attach(){editor=document.getElementById('site-editor');if(!editor||editor.dataset.ux48)return;editor.dataset.ux48='true';note=document.createElement('p');note.className='ux48-dirty';note.setAttribute('role','status');editor.querySelector('.v837-editor-header')?.append(note);
 editor.addEventListener('input',e=>{if(e.target.matches('input,textarea,select')){dirty=true;note.textContent='Tem alterações por guardar.';}});
 editor.addEventListener('change',e=>{if(e.target.matches('input,textarea,select')){dirty=true;note.textContent='Tem alterações por guardar.';}});
 const status=document.getElementById('v836EditorStatus');if(status){status.setAttribute('role','status');status.setAttribute('aria-live','polite');new MutationObserver(()=>{if(status.textContent.startsWith('Alterações guardadas.')){dirty=false;note.textContent='Alterações guardadas no convite.';}}).observe(status,{childList:true,subtree:true,characterData:true});}
 }
 attach();const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!dirty||!a||!editor?.classList.contains('admin-view-active'))return;const hash=a.getAttribute('href');if(['#site-editor','#site-capa','#site-historia'].includes(hash))return;if(!confirm('Tem alterações no conteúdo do site por guardar. Sair desta área?')){e.preventDefault();e.stopImmediatePropagation();}},true);
})();
