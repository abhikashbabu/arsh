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
  window.__arshRegisterEvent(document, "keydown",e=>{if(e.key==="Escape"){set(false);setDrawer(false);}});
})();

/* Media tabs */
const tabs=document.querySelectorAll("#mediaTabs .nav-link"),items=document.querySelectorAll("#mediaFeed [data-tab]");
tabs.forEach(t=>t.addEventListener("click",()=>{
  tabs.forEach(x=>{x.classList.toggle("active",x===t);x.setAttribute("aria-selected",x===t);});
  items.forEach(c=>c.classList.toggle("d-none",c.dataset.tab!==t.dataset.tab));
}));

/* Gallery arrows (mobile) */
document.querySelectorAll(".cx").forEach(cx=>{
  const t=cx.querySelector(".snap"),p=cx.querySelector(".prev"),n=cx.querySelector(".next");
  const upd=()=>{p.disabled=t.scrollLeft<=2;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-2;};
  p.addEventListener("click",()=>t.scrollBy({left:-t.clientWidth,behavior:"smooth"}));
  n.addEventListener("click",()=>t.scrollBy({left:t.clientWidth,behavior:"smooth"}));
  t.addEventListener("scroll",upd,{passive:true});window.__arshRegisterEvent(window, "resize",upd);upd();
});
})();