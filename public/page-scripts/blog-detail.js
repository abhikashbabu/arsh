;(function () {
/* Drawer */
const menuBtn=document.getElementById("menuBtn");
const setDrawer=o=>{document.body.classList.toggle("drawer-open",o);menuBtn.setAttribute("aria-expanded",o)};
menuBtn.addEventListener("click",()=>setDrawer(true));
document.getElementById("drawerClose").addEventListener("click",()=>setDrawer(false));
document.getElementById("scrim").addEventListener("click",()=>setDrawer(false));
document.querySelectorAll("#drawer a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));

/* Search modal */
(()=>{
  const b=document.getElementById("searchBtn"),m=document.getElementById("searchModal"),i=document.getElementById("searchInput");
  const set=o=>{m.classList.toggle("open",o);b.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":"";if(o)setTimeout(()=>i.focus(),30);};
  b.addEventListener("click",()=>set(true));
  document.getElementById("searchClose").addEventListener("click",()=>set(false));
  m.querySelectorAll(".sm-chips button").forEach(x=>x.addEventListener("click",()=>{i.value=x.textContent;i.focus();}));
  m.addEventListener("click",e=>{if(e.target===m)set(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){set(false);setDrawer(false);}});
})();


/* Reading progress */
const prog=document.getElementById("prog");
addEventListener("scroll",()=>{const h=document.documentElement;const m=h.scrollHeight-h.clientHeight;prog.style.width=(m>0?h.scrollTop/m*100:0)+"%";},{passive:true});
/* Share links */
const u=encodeURIComponent(location.href),tt=encodeURIComponent(document.title);
document.getElementById("shFb").href="https://www.facebook.com/sharer/sharer.php?u="+u;
document.getElementById("shX").href="https://twitter.com/intent/tweet?url="+u+"&text="+tt;
document.getElementById("shWa").href="https://wa.me/?text="+tt+"%20"+u;
document.getElementById("shCopy").addEventListener("click",()=>{
  const ok=()=>{const c=document.getElementById("copied");c.style.display="inline";setTimeout(()=>c.style.display="none",1800);};
  if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(ok);
});
})();