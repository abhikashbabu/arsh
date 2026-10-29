;(function () {
const specGrid=document.querySelector(".sp-card")?.parentElement;
const escapeText=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
if(specGrid){
  window.ArshApi.get("specialities").then(response=>{
    const items=Array.isArray(response.data)?response.data:[];
    if(!items.length)return;
    specGrid.innerHTML=items.map(s=>`<div class="col-md-6 col-xl-4"><article class="sp-card"><a class="sp-card-hitarea" href="/specialities/${encodeURIComponent(s.slug)}" aria-label="Open ${escapeText(s.name)} details"></a><div class="sp-top"><span class="sp-icon"><i class="bi bi-heart-pulse"></i></span><h3>${escapeText(s.name)}</h3></div><p>${escapeText(s.description||`Explore ${s.name} care and meet the doctors available at ARSH Hospital.`)}</p><ul class="sp-list"><li><i class="bi bi-check-circle-fill"></i>Doctors and consultation details</li>${s.floor?`<li><i class="bi bi-check-circle-fill"></i>${escapeText(s.floor)} floor</li>`:""}</ul><div class="sp-foot"><a href="/doctors?speciality_id=${encodeURIComponent(s.id)}">View doctors <i class="bi bi-arrow-right"></i></a><a class="book" href="/book-appointment?speciality_id=${encodeURIComponent(s.id)}">Book visit</a></div></article></div>`).join("");
  }).catch(()=>{});
}
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
