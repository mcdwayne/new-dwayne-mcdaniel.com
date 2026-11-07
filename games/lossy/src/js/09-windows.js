/* ============================== windows, dialogs, death ============================== */
let MQ=[],showing=false;
const ML=()=>document.getElementById("msglayer"),PL=()=>document.getElementById("pclayer");
function say(txt,pts,who){if(pts)txt+=`\n\n[+${pts} points]`;msgBox(txt,who);updateBar();draw();}
function msgBox(txt,who,then){MQ.push({txt,who,then});if(!showing)nextMsg();}
function nextMsg(){const m=MQ.shift();if(!m){showing=false;if(S&&!S.dead)checkEnd();return;}showing=true;const w=document.createElement("div");w.className="msgwrap";
  w.innerHTML=`<div class="msg" role="dialog" aria-modal="true" tabindex="-1">${m.who?`<span class="who">${esc(m.who)}</span>`:""}${esc(m.txt)}<span class="hint">click or press Enter</span></div>`;
  const close=()=>{w.remove();document.removeEventListener("keydown",kd);updateBar();if(m.then)m.then();nextMsg();};const kd=ev=>{if(!w.isConnected){document.removeEventListener("keydown",kd);return;}if(ev.key==="Enter"||ev.key==="Escape"){ev.preventDefault();close();}};
  w.addEventListener("click",close);document.addEventListener("keydown",kd);ML().appendChild(w);w.querySelector(".msg").focus();}
function clearMsgs(){MQ=[];showing=false;ML().innerHTML="";}
function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function flash(t){const w=document.createElement("div");w.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:60;background:#FFF;color:#000;border:3px solid #0000AA;padding:6px 12px;font:17px var(--f-pix);max-width:calc(100% - 32px)";w.setAttribute("role","status");w.textContent=t;document.body.appendChild(w);setTimeout(()=>w.remove(),3500);updateBar();}
function portrait(who){const c=document.createElement("canvas");c.width=48;c.height=48;c.style.width="96px";c.style.height="96px";const x=c.getContext("2d");const P=(a,b,w,h,col)=>{x.fillStyle=PAL[col];x.fillRect(a,b,w,h);};
  P(0,0,48,48,{dana:5,ravi:2,amara:3,kofi:1}[who]||1);P(14,10,20,24,6);P(12,6,24,8,who==="amara"?5:0);if(who==="dana"){P(10,8,6,26,0);P(32,8,6,26,0);P(8,34,32,14,4);}else if(who==="ravi"){P(8,36,32,12,2);P(14,4,20,4,0);}else if(who==="amara"){P(10,6,28,8,5);P(8,36,32,12,3);}else{P(8,36,32,12,8);P(20,36,8,12,15);P(22,38,4,10,4);}
  P(18,18,3,3,0);P(27,18,3,3,0);P(20,27,8,2,4);return c;}
function dialog(name,who,intro,builder){snapshot();const L=ML();const w=document.createElement("div");w.className="msgwrap";
  w.innerHTML=`<div class="dlg" role="dialog" aria-modal="true"><div class="pf"></div><div><span class="who">${esc(name)}</span><div class="say">${esc(intro)}</div></div><div class="opts"></div></div>`;
  w.querySelector(".pf").appendChild(portrait(who));const box=w.querySelector(".opts"),sayEl=w.querySelector(".say");
  const render=list=>{box.innerHTML="";list.forEach(([label,fn])=>{const b=document.createElement("button");b.textContent=label;if(!fn)b.className="bye";b.onclick=ev=>{ev.stopPropagation();
    if(!fn){w.remove();updateBar();draw();checkEnd();return;}snapshot();const r=fn();if(r){if(!r.end)advance(5);if(after())return;sayEl.textContent=r.t+(r.p?`\n\n[+${r.p} points]`:"");updateBar();draw();
      if(r.end){box.innerHTML="";const z=document.createElement("button");z.textContent="Continue";z.onclick=()=>{w.remove();endDay();};box.appendChild(z);return;}
      render(builder());}};box.appendChild(b);});};
  render(builder());L.appendChild(w);}
