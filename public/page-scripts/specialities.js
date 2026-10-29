;(function () {
/* Mobile drawer */
const menuBtn=document.getElementById("menuBtn");
const setDrawer=o=>{document.body.classList.toggle("drawer-open",o);menuBtn.setAttribute("aria-expanded",o)};
menuBtn.addEventListener("click",()=>setDrawer(true));
document.getElementById("drawerClose").addEventListener("click",()=>setDrawer(false));
document.getElementById("scrim").addEventListener("click",()=>setDrawer(false));
document.querySelectorAll("#drawer a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));
window.__arshRegisterEvent(document, "keydown",e=>{if(e.key==="Escape")setDrawer(false)});

/* Search modal */
(()=>{
  const b=document.getElementById("searchBtn"),m=document.getElementById("searchModal"),i=document.getElementById("searchInput");
  const set=o=>{m.classList.toggle("open",o);b.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":"";if(o)setTimeout(()=>i.focus(),30);};
  b.addEventListener("click",()=>set(true));
  document.getElementById("searchClose").addEventListener("click",()=>set(false));
  m.addEventListener("click",e=>{if(e.target===m)set(false)});
  window.__arshRegisterEvent(document, "keydown",e=>{if(e.key==="Escape")set(false)});
  m.querySelectorAll(".sm-chips button").forEach(c=>c.addEventListener("click",()=>{i.value=c.textContent;i.focus();}));
})();
})();