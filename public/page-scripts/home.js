;(function () {
/* Hospital home feed and doctor finder */
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const api=window.ArshApi,speciality=document.getElementById("speciality"),doctor=document.getElementById("doctor"),doctorSearch=document.getElementById("doctorSearch");
let homeData={specialities:[],doctors:[],blogs:[]};
function renderDoctorOptions(){
  const filtered=homeData.doctors.filter(d=>!speciality.value||String(d.speciality_id)===speciality.value);
  doctor.innerHTML='<option value="">Select doctor</option>'+filtered.map(d=>`<option value="${esc(d.id)}" data-slug="${esc(d.slug)}">${esc(d.name)}</option>`).join("");
}
function renderHomeFeed(){
  const specSnap=document.querySelector("#specialities .snap");
  if(specSnap&&homeData.specialities.length)specSnap.innerHTML=homeData.specialities.map(s=>`<div class="col"><div class="spec"><a class="spec-hitarea" href="/specialities/${encodeURIComponent(s.slug)}" aria-label="View ${esc(s.name)}"></a><div class="spec-icon"><i class="bi bi-heart-pulse"></i></div><div class="spec-name">${esc(s.name)}</div></div></div>`).join("");
  const doctorSnap=document.querySelector("#doctors .snap");
  if(doctorSnap&&homeData.doctors.length)doctorSnap.innerHTML=homeData.doctors.slice(0,8).map(d=>`<div class="col-6 col-lg-3"><article class="card-p"><div class="ph"><img src="${esc(d.photo_url||"/images/doctor-placeholder.svg")}" alt="${esc(d.name)}" loading="lazy"></div><div class="body"><h3>${esc(d.name)}</h3><div class="sub">${esc(d.speciality)}</div><div class="meta"><i class="bi bi-award me-1"></i>${d.experience?`${esc(d.experience)}+ years experience`:esc(d.qualification||"Available for appointments")}</div><a class="link-sm" href="/doctors/${encodeURIComponent(d.slug)}">View profile <i class="bi bi-arrow-right"></i></a></div></article></div>`).join("");
}
speciality.addEventListener("change",renderDoctorOptions);
document.getElementById("doctorForm").addEventListener("submit",event=>{
  event.preventDefault();
  const selectedDoctor=doctor.selectedOptions[0],params=new URLSearchParams();
  if(selectedDoctor?.value){const record=homeData.doctors.find(entry=>String(entry.id)===selectedDoctor.value);if(record?.slug){location.assign(`/doctors/${encodeURIComponent(record.slug)}`);return;}}
  if(speciality.value)params.set("speciality_id",speciality.value);
  if(doctorSearch.value.trim())params.set("q",doctorSearch.value.trim());
  location.assign(`/doctors${params.size?`?${params}`:""}`);
});
api.get("home").then(response=>{
  homeData=response.data||homeData;
  speciality.innerHTML='<option value="">Select speciality</option>'+homeData.specialities.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
  renderDoctorOptions();renderHomeFeed();
}).catch(()=>{ /* Keep the page usable if the hospital API is temporarily down. */ });

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

/* Hero slider */
(()=>{
  const hero=document.getElementById("heroSlider"),slides=[...hero.querySelectorAll(".slide")],dotsBox=document.getElementById("hDots");
  let i=0,timer;
  const dots=slides.map((_,n)=>{const b=document.createElement("button");b.setAttribute("aria-label","Slide "+(n+1));b.addEventListener("click",()=>{go(n);restart();});dotsBox.appendChild(b);return b;});
  function go(n){i=(n+slides.length)%slides.length;slides.forEach((s,k)=>s.classList.toggle("active",k===i));dots.forEach((d,k)=>d.classList.toggle("on",k===i));}
  function restart(){clearInterval(timer);if(!matchMedia("(prefers-reduced-motion:reduce)").matches)timer=setInterval(()=>go(i+1),6000);}
  document.getElementById("hPrev").addEventListener("click",()=>{go(i-1);restart();});
  document.getElementById("hNext").addEventListener("click",()=>{go(i+1);restart();});
  hero.addEventListener("mouseenter",()=>clearInterval(timer));hero.addEventListener("mouseleave",restart);
  go(0);restart();
})();

/* Mobile carousels (arrows) */
document.querySelectorAll(".cx").forEach(cx=>{
  const t=cx.querySelector(".snap"),p=cx.querySelector(".prev"),n=cx.querySelector(".next");
  const upd=()=>{p.disabled=t.scrollLeft<=2;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-2;};
  p.addEventListener("click",()=>t.scrollBy({left:-t.clientWidth,behavior:"smooth"}));
  n.addEventListener("click",()=>t.scrollBy({left:t.clientWidth,behavior:"smooth"}));
  t.addEventListener("scroll",upd,{passive:true});window.__arshRegisterEvent(window, "resize",upd);upd();
});
})();
