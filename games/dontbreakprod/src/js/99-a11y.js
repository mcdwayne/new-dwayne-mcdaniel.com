
/* ============================== Accessibility (WCAG 2.2 AA), shared by every game ============================== */
(()=>{document.documentElement.lang="en";
  /* 1.1.1 / 4.1.2: the pixel scene is an image with a description that follows the room */
  const sc=document.getElementById("scene");if(sc){sc.setAttribute("role","img");}
  let lastLabel="";
  function describe(){if(!sc||typeof S==="undefined"||!S)return;try{const room=S.room;const spots=(typeof roomSpots==="function"?roomSpots(room):SPOTS[room])||[];
      const name=(typeof ROOMNAME!=="undefined"&&ROOMNAME[room])||room;const lab=`${name}. You can see: ${spots.filter(s=>!s.exit).map(s=>s.name).join(", ")}. Exits: ${spots.filter(s=>s.exit).map(s=>s.name).join(", ")||"none"}.`;
      if(lab!==lastLabel){sc.setAttribute("aria-label",lab);lastLabel=lab;}}catch(e){}}
  const _draw=draw;draw=function(){_draw.apply(this,arguments);describe();};
  /* 4.1.2: the room list is a named group; empty buttons get a name */
  const here=document.getElementById("here");if(here)here.setAttribute("role","group");
  const ex=document.getElementById("exitbtn");if(ex&&!ex.textContent.trim())ex.setAttribute("aria-label","Exit");
  /* 4.1.3: the next-step bar is announced politely when it changes */
  const gt=document.getElementById("goalTxt");if(gt){gt.setAttribute("aria-live","polite");gt.setAttribute("role","status");}
  /* 2.1.1: clickable table rows are reachable and usable from the keyboard */
  const fixRows=root=>{try{if(typeof document==="undefined"||!document||!document.body)return;(root||document).querySelectorAll("tr.click:not([tabindex])").forEach(t=>{t.tabIndex=0;});
    (root||document).querySelectorAll(".tw:not([tabindex]),.slmsgs:not([tabindex])").forEach(el=>{el.tabIndex=0;if(!el.getAttribute("role")){el.setAttribute("role","region");el.setAttribute("aria-label",el.classList.contains("slmsgs")?"Messages":"Table");}});}catch(e){}};
  new MutationObserver(()=>fixRows()).observe(document.body,{childList:true,subtree:true});
  document.addEventListener("keydown",e=>{const t=e.target;if(t&&t.matches&&t.matches("tr.click")&&(e.key==="Enter"||e.key===" ")){e.preventDefault();t.click();}});
  /* 2.2.2: animation can be turned off from the menu, not only by the OS setting */
  try{const v=localStorage.getItem("games.motion");if(v==="off")reduce=true;}catch(e){}
  new MutationObserver(()=>{if(typeof document==="undefined"||!document)return;const b=document.querySelector(".msg .btns:not(.tmenu)");if(!b||b.querySelector("[data-motion]")||!b.querySelector("[data-mn]"))return;
    const m=document.createElement("button");m.dataset.motion="1";m.textContent=reduce?"Animation: off":"Animation: on";m.setAttribute("aria-pressed",String(!reduce));b.appendChild(m);}).observe(document.getElementById("msglayer"),{childList:true,subtree:true});
  document.addEventListener("click",e=>{const b=e.target.closest("[data-motion]");if(!b)return;e.stopPropagation();reduce=!reduce;try{localStorage.setItem("games.motion",reduce?"off":"on");}catch(err){}
    b.textContent=reduce?"Animation: off":"Animation: on";b.setAttribute("aria-pressed",String(!reduce));},true);
})();
