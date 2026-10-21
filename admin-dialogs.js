/* Presentation and keyboard support only; existing handlers own save/close. */
(function(){
 'use strict';
 function viewportBounds(viewport,fallback){return {height:viewport?.height>0?viewport.height:fallback,top:Math.max(0,viewport?.offsetTop||0)};}
 function focusStep(index,count,back){if(!count)return -1;if(index<0)return back?count-1:0;return (index+(back?-1:1)+count)%count;}
 if(typeof module==='object'&&module.exports){module.exports={viewportBounds,focusStep};return;}
 const selector='.modal:not(.hidden),.guest-picker-modal:not(.hidden)';
 let active=null,previous=null,lastOutside=document.activeElement,serial=0,queued=false;
 document.addEventListener('focusin',e=>{if(!e.target.closest('.modal,.guest-picker-modal'))lastOutside=e.target;});
 function bounds(){const b=viewportBounds(window.visualViewport,innerHeight);document.documentElement.style.setProperty('--dialog-height',b.height+'px');document.documentElement.style.setProperty('--dialog-top',b.top+'px');}
 function sync(){
  queued=false;
  const next=[...document.querySelectorAll(selector)].filter(e=>getComputedStyle(e).display!=='none').at(-1);
  if(next===active)return;
  if(active&&previous?.isConnected&&!next)previous.focus({preventScroll:true});
  active=next||null;if(!active)return;
  previous=lastOutside;
  const box=active.querySelector('.modal-box,.guest-picker');if(!box)return;
  box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
  const title=box.querySelector('h2,h3');if(title){if(!title.id)title.id='dialog-title-'+(++serial);box.setAttribute('aria-labelledby',title.id);}
  const close=box.querySelector('.modal-close-fixed,#closeGuestPicker,[data-close]');
  const actions=box.querySelector('.modal-actions');
  if(actions&&close&&!actions.querySelector('.dialog-cancel')){
   const cancel=document.createElement('button');cancel.type='button';cancel.className='button secondary dialog-cancel';cancel.textContent='Cancelar';cancel.onclick=()=>close.click();actions.prepend(cancel);
  }
  // Opening a dialog must not summon the phone keyboard before the user chooses a field.
  if(matchMedia('(max-width:760px)').matches&&close){if(box.contains(document.activeElement))document.activeElement.blur();close.focus({preventScroll:true});}
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(sync);}}
 document.addEventListener('keydown',e=>{
  if(e.key!=='Tab'||!active||document.querySelector('dialog[open]'))return;
  const nodes=[...active.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(n=>!n.disabled&&n.tabIndex>=0&&n.getClientRects().length);
  const index=nodes.indexOf(document.activeElement),next=focusStep(index,nodes.length,e.shiftKey);
  if(next>=0){e.preventDefault();nodes[next].focus();}
 });
 new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 window.visualViewport?.addEventListener('resize',bounds);window.visualViewport?.addEventListener('scroll',bounds);window.addEventListener('resize',bounds);
 bounds();sync();
})();
