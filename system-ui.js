/* Shared, data-free enhancements. No authentication or record operations. */
(function(root){
 'use strict';
 function createFrameScheduler(requestFrame,work){let queued=false;return ()=>{if(queued)return;queued=true;requestFrame(()=>{queued=false;work();});};}
 function enhanceImage(img){if(img.tagName!=='IMG')return;const critical=!!img.closest('.hero-image,.intro-screen,.brand,.wedy-brand,.rsvp-mark');if(!img.hasAttribute('decoding'))img.setAttribute('decoding','async');if(!img.hasAttribute('loading'))img.setAttribute('loading',critical?'eager':'lazy');if(critical&&!img.hasAttribute('fetchpriority')&&img.closest('.hero-image'))img.setAttribute('fetchpriority','high');}
 if(typeof module==='object'&&module.exports){module.exports={createFrameScheduler,enhanceImage};return;}
 const pending=new Set();
 function enhance(node){if(node.nodeType!==1)return;if(node.tagName==='IMG')enhanceImage(node);node.querySelectorAll('img').forEach(enhanceImage);}
 const flush=createFrameScheduler(requestAnimationFrame,()=>{const batch=[...pending];pending.clear();batch.filter(node=>node.isConnected&&!batch.some(parent=>parent!==node&&parent.contains(node))).forEach(enhance);});
 function start(){enhance(document.body);new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)pending.add(node);if(pending.size)flush();}).observe(document.body,{childList:true,subtree:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(typeof window==='undefined'?globalThis:window);
