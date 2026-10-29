;(function(){
const menuBtn=document.getElementById("menuBtn");
const setDrawer=o=>{document.body.classList.toggle("drawer-open",o);menuBtn.setAttribute("aria-expanded",o)};
menuBtn.addEventListener("click",()=>setDrawer(!document.body.classList.contains("drawer-open")));
document.getElementById("drawerClose").addEventListener("click",()=>setDrawer(false));
document.getElementById("scrim").addEventListener("click",()=>setDrawer(false));
document.querySelectorAll("#drawer a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));
window.__arshRegisterEvent(document,"keydown",e=>{if(e.key==="Escape"){setDrawer(false);setSearch(false)}});
const searchBtn=document.getElementById("searchBtn"),searchModal=document.getElementById("searchModal"),searchInput=document.getElementById("searchInput");
function setSearch(open){searchModal.classList.toggle("open",open);searchBtn.setAttribute("aria-expanded",open);document.body.style.overflow=open?"hidden":"";if(open)searchInput.focus()}
searchBtn.addEventListener("click",()=>setSearch(true));
document.getElementById("searchClose").addEventListener("click",()=>setSearch(false));
searchModal.addEventListener("click",e=>{if(e.target===searchModal)setSearch(false)});
searchModal.querySelectorAll(".sm-chips button").forEach(b=>b.addEventListener("click",()=>{searchInput.value=b.textContent;searchInput.focus()}));
})();
