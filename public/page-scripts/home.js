;(function () {
/* Find doctor */
const doctorMap={"Orthopaedics & Spine":["Dr. Navneet Nishchal"],"Cardiology":["Dr. Priya Sharma"],"Neurology & Neurosurgery":["Dr. Amit Kumar"],"Gastroenterology":["Dr. Rohan Mehta"],"Obstetrics & Gynaecology":["Dr. Ritu Singh"],"Paediatrics":["Dr. Neha Verma"],"General Medicine":["Dr. Anil Kumar"],"ENT":["Dr. Pankaj Singh"]};
const speciality=document.getElementById("speciality"),doctor=document.getElementById("doctor");
speciality.addEventListener("change",()=>{
  doctor.innerHTML='<option value="">Select doctor</option>';
  (doctorMap[speciality.value]||[]).forEach(n=>{const o=document.createElement("option");o.value=n;o.textContent=n;doctor.appendChild(o);});
});
document.getElementById("doctorForm").addEventListener("submit",e=>{e.preventDefault();document.getElementById("doctors").scrollIntoView({behavior:"smooth"});});

/* Mobile drawer */
const menuBtn=document.getElementById("menuBtn");
const setDrawer=o=>{document.body.classList.toggle("drawer-open",o);menuBtn.setAttribute("aria-expanded",o)};
menuBtn.addEventListener("click",()=>setDrawer(true));
document.getElementById("drawerClose").addEventListener("click",()=>setDrawer(false));
document.getElementById("scrim").addEventListener("click",()=>setDrawer(false));
document.querySelectorAll("#drawer a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));
document.addEventListener("keydown",e=>{if(e.key==="Escape")setDrawer(false)});

/* Search modal */
(()=>{
  const b=document.getElementById("searchBtn"),m=document.getElementById("searchModal"),i=document.getElementById("searchInput");
  const set=o=>{m.classList.toggle("open",o);b.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":"";if(o)setTimeout(()=>i.focus(),30);};
  b.addEventListener("click",()=>set(true));
  document.getElementById("searchClose").addEventListener("click",()=>set(false));
  m.addEventListener("click",e=>{if(e.target===m)set(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")set(false)});
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
  t.addEventListener("scroll",upd,{passive:true});window.addEventListener("resize",upd);upd();
});
})();