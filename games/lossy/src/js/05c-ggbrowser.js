/* ============================== GitGuardian runs in a browser ==============================
   Shared by every game in this series. The GitGuardian window gets browser chrome: Back, Forward and an address bar.
   History is recorded from whatever page GitGuardian shows, so every link, nav item and breadcrumb is covered.
   Switching tabs inside a page (Overview, Occurrences...) updates the current entry instead of adding one, like a real SPA.
   Closing the GitGuardian window, or a new day or level, starts a fresh history. */
const GGH={stack:[],i:-1,win:null,nav:false};
const ggKey=r=>JSON.stringify([r.page,r.id==null?null:String(r.id),r.host||null]);
const ggClean=r=>{const o=Object.assign({},r);delete o.fresh;return o;};
function ggTrack(){const w=WM.wins.find(x=>x.app==="gg");if(w!==GGH.win){GGH.win=w;GGH.stack=[];GGH.i=-1;}
  const cur=ggClean(ggRoute);
  if(GGH.nav){GGH.nav=false;GGH.stack[GGH.i]=cur;return;}
  const top=GGH.stack[GGH.i];
  if(top&&ggKey(top)===ggKey(cur)){GGH.stack[GGH.i]=cur;return;}
  GGH.stack=GGH.stack.slice(0,GGH.i+1);GGH.stack.push(cur);GGH.i=GGH.stack.length-1;}
function ggURL(r){const id=r.id!=null?r.id:"";const P={list:"incidents/secrets",incident:`incidents/secrets/${id}`,hist:`incidents/secrets/${id}`,denied:`incidents/secrets/${id}`,
  publist:"incidents/public",map:id?`incidents/secrets/${id}/exploration`:"nhi/exploration",endpoints:"endpoints",endpoint:`endpoints/${r.host||""}`,
  honeytokens:"honeytokens",honeytoken:"honeytokens",perimeter:"perimeter",inventory:"nhi/inventory",playbooks:"settings/workspace/playbooks",
  workflow:"settings/workspace/remediation-workflow",secmgr:"settings/integrations/secrets-managers",restricted:"incidents/secrets"}[r.page]||r.page;
  return `https://dashboard.gitguardian.com/workspace/7311/${P}`;}
function ggChrome(){const b=GGH.i>0,f=GGH.i<GGH.stack.length-1;const url=ggURL(ggRoute);
  return `<div class="ggbar" role="toolbar" aria-label="Browser"><button class="ggb-btn" data-ggnav="back" ${b?"":"disabled"} aria-label="Back" title="Back">◀ Back</button><button class="ggb-btn" data-ggnav="fwd" ${f?"":"disabled"} aria-label="Forward" title="Forward">▶</button><label class="sr" for="ggurl">Address</label><input id="ggurl" class="ggurl" type="text" readonly value="${url}" aria-label="Address"></div>`;}
(function(){const inner=APPS.gg;APPS.gg=function(){ggTrack();const html=inner.apply(this,arguments);ggTrack();return `<div class="ggbrowser">${ggChrome()}${html}</div>`;};})();
function ggGo(d){const j=GGH.i+d;if(j<0||j>=GGH.stack.length)return;GGH.i=j;ggRoute=Object.assign({},GGH.stack[j]);GGH.nav=true;if(typeof modal!=="undefined")modal=null;renderPC();
  const el=document.querySelector(`[data-ggnav="${d<0?"back":"fwd"}"]:not([disabled])`)||document.querySelector("#ggurl");if(el)try{el.focus({preventScroll:true});}catch(e){}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ggnav]");if(!b||b.disabled)return;e.stopPropagation();ggGo(b.dataset.ggnav==="back"?-1:1);},true);
document.addEventListener("keydown",e=>{if(!document.getElementById("w31")||pcApp!=="gg")return;if(e.altKey&&(e.key==="ArrowLeft"||e.key==="ArrowRight")){e.preventDefault();ggGo(e.key==="ArrowLeft"?-1:1);}});
