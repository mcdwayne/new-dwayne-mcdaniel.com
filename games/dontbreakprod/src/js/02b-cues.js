/* ============================== what you can use ==============================
   Every hotspot gets a quiet cue drawn over the scene, in the same colours as the list of things under the picture:
   a small speech bubble beside people and a small arrow over ways out. Things have no marker until you point at them:
   pointing (mouse, or focusing it in the list) outlines whatever is there. Nothing moves or blinks. The menu can turn the cues off. */
let hiSpot=null;
const CUE={thing:"rgba(255,255,85,.75)",who:"rgba(255,158,255,.85)",exit:"rgba(255,180,94,.85)",edge:"rgba(0,0,0,.45)"};
function cuesOn(){try{return localStorage.getItem("dontbreakprod.cues")!=="off";}catch(e){return true;}}
function setCues(on){try{localStorage.setItem("dontbreakprod.cues",on?"on":"off");}catch(e){}}
const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);};
function cueTicks([x,y,w,h],c){const a=Math.max(2,Math.min(4,(w/4)|0,(h/4)|0));
  px(x,y,a,1,c);px(x,y,1,a,c);px(x+w-a,y,a,1,c);px(x+w-1,y,1,a,c);
  px(x,y+h-1,a,1,c);px(x,y+h-a,1,a,c);px(x+w-a,y+h-1,a,1,c);px(x+w-1,y+h-a,1,a,c);}
/* the bubble sits beside the person's head, tail pointing at them */
function cueBubble(x,y,c){y=Math.max(1,y);x=Math.min(308,x);
  px(x,y,9,5,CUE.edge);px(x+1,y+1,7,3,c);px(x,y+5,2,2,CUE.edge);px(x+1,y+4,1,2,c);}
function cueArrow(cx,top,c){const y=Math.max(1,top-5);
  for(let i=0;i<3;i++)px(cx-2+i,y+i,5-2*i,1,c);}
function cueKind(s){return s.talk?"who":s.exit?"exit":"thing";}
function drawCues(){if(!S||!SPOTS[S.room])return;
  if(cuesOn())for(const s of SPOTS[S.room]){const [x,y,w]=s.r;if(s.floor)continue;
    if(s.talk)cueBubble(x+w-4,y+3,CUE.who);else if(s.exit)cueArrow(x+(w>>1),y,CUE.exit);}
  const h=hiSpot&&SPOTS[S.room].find(s=>s.id===hiSpot);
  if(h){const [x,y,w,hh]=h.r;g.lineWidth=1;g.strokeStyle=CUE[cueKind(h)];g.strokeRect(x+0.5,y+0.5,w-1,hh-1);}}
function hilite(id){if(hiSpot===id)return;hiSpot=id;if(typeof draw==="function"&&S&&!document.getElementById("pcroot"))draw();}
document.addEventListener("focusin",e=>{const b=e.target.closest&&e.target.closest("[data-here]");if(b)hilite(b.dataset.here);});
document.addEventListener("focusout",e=>{const b=e.target.closest&&e.target.closest("[data-here]");if(b)hilite(null);});
document.addEventListener("mouseover",e=>{const b=e.target.closest&&e.target.closest("[data-here]");if(b)hilite(b.dataset.here);});
document.addEventListener("mouseout",e=>{const b=e.target.closest&&e.target.closest("[data-here]");if(b)hilite(null);});
