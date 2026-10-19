/* v8.56 — approved composition, projected onto existing controls and real counts. */
(function(){
 'use strict';
 const count=v=>Number.isFinite(Number(v))?Math.max(0,Math.floor(Number(v))):0;
 function seatModel(occupied,capacity){occupied=count(occupied);capacity=count(capacity);const seats=Math.min(capacity,12),percent=capacity?Math.min(100,Math.round(occupied/capacity*100)):0;return {occupied,capacity,free:Math.max(0,capacity-occupied),seats,filled:capacity?Math.min(seats,Math.round(occupied/capacity*seats)):0,percent};}
 if(typeof module==='object'&&module.exports){module.exports={seatModel};return;}
 const all=(s,r=document)=>[...r.querySelectorAll(s)];
 document.body.classList.add('integrated56');
 function tables(){all('#tableList .table-card').forEach(card=>{
  const counters=all('.table-capacity-summary strong',card);if(counters.length<2)return;
  const occupied=Number(counters[0].textContent),free=Number(counters[1].textContent);
  const actual=(window.receptionTables||[]).find(t=>String(t.id)===card.dataset.tableCard);
  const m=seatModel(occupied,actual?actual.capacity:occupied+free);
  let diagram=card.querySelector('.l56-seat-model');if(!diagram){diagram=document.createElement('div');diagram.className='l56-seat-model';diagram.setAttribute('role','img');card.querySelector('.table-card-head')?.after(diagram);}
  const key=m.occupied+':'+m.capacity;if(diagram.dataset.model!==key){diagram.dataset.model=key;diagram.setAttribute('aria-label',m.occupied+' pessoas atribuídas de '+m.capacity+' lugares. Disposição ilustrativa.');
   diagram.innerHTML=Array.from({length:m.seats},(_,i)=>{const a=i*Math.PI*2/m.seats-Math.PI/2;return '<span class="l56-seat '+(i<m.filled?'filled':'')+'" style="--x:'+Math.round(Math.cos(a)*53)+';--y:'+Math.round(Math.sin(a)*53)+'" aria-hidden="true"></span>';}).join('')+'<div class="l56-seat-centre"><strong>'+m.occupied+'<small> / '+m.capacity+'</small></strong><span>pessoas</span></div>';
  }
  const list=card.querySelector('.table-guests');if(list&&!list.closest('.l56-guests')){const details=document.createElement('details');details.className='l56-guests';const title=document.createElement('summary');details.append(title);list.before(details);details.append(list);}
  const summary=card.querySelector('.l56-guests summary');if(summary){const label='Ver convites atribuídos ('+all('.seat-guest',card).length+')';if(summary.textContent!==label)summary.textContent=label;}
 });}
 let queued=false;function update(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;tables();});}
 function start(){tables();const list=document.getElementById('tableList');if(list)new MutationObserver(update).observe(list,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,350),{once:true});else setTimeout(start,350);
})();
