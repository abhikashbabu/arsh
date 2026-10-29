;(function () {
const api=window.ArshApi;
const PER_PAGE=12;
const grid=document.getElementById("grid"),loader=document.getElementById("loader"),empty=document.getElementById("empty"),endNote=document.getElementById("endNote"),countEl=document.getElementById("count");
const qEl=document.getElementById("q"),specEl=document.getElementById("spec"),qGroup=document.getElementById("qGroup"),sentinel=document.getElementById("sentinel");
let page=1,total=0,pageSize=PER_PAGE,loading=false,done=false,ticket=0;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const msgFor=error=>error?.message||"Could not load this information. Please try again.";

async function loadSpecialities(){
  try{
    const response=await api.get("specialities");
    (response.data||[]).forEach(s=>{const option=document.createElement("option");option.value=String(s.id);option.textContent=s.name;option.dataset.slug=s.slug||"";specEl.appendChild(option);});
    const params=new URLSearchParams(location.search),wanted=params.get("speciality_id")||params.get("spec");
    if(wanted){const option=[...specEl.options].find(o=>o.value===wanted||o.dataset.slug===wanted||o.textContent.toLowerCase()===wanted.toLowerCase());if(option)specEl.value=option.value;}
  }catch(error){empty.textContent=msgFor(error);empty.style.display="block";}
}

const card=d=>`<div class="col"><article class="card-p dr-in">
  <div class="ph"><img src="${esc(d.photo_url||"/images/doctor-placeholder.svg")}" alt="${esc(d.name)}" loading="lazy"></div>
  <div class="body"><h3>${esc(d.name)}</h3><div class="sub">${esc(d.speciality)}</div>
    <div class="des">${esc(d.qualification||"Consultant")}</div>
    <div class="meta"><i class="bi bi-award me-1"></i>${d.experience?`${esc(d.experience)}+ years experience`:esc(d.status||"Appointments available")}</div>
    <div class="dr-actions"><a class="btn btn-arsh" href="/book-appointment?doctor=${encodeURIComponent(d.id)}&speciality_id=${encodeURIComponent(d.speciality_id)}">Appointment</a>
      <a class="btn btn-ghost" href="/doctors/${encodeURIComponent(d.slug)}">View Profile</a></div>
  </div></article></div>`;

function sync(){qGroup.classList.toggle("has-text",qEl.value.length>0);}
function updateCount(){countEl.innerHTML=total?`Showing <b>${Math.min((page-1)*pageSize,total)}</b> of <b>${total}</b> doctors`:"";}
async function loadMore(){
  if(loading||done)return;
  loading=true;loader.classList.add("on");const current=ticket;
  try{
    const response=await api.get("doctors",{q:qEl.value.trim(),speciality_id:specEl.value,page,per_page:PER_PAGE});
    if(current!==ticket)return;
    const items=Array.isArray(response.data)?response.data:[];
    total=Number(response.meta?.total??items.length);pageSize=Number(response.meta?.per_page)||PER_PAGE;
    grid.insertAdjacentHTML("beforeend",items.map(card).join(""));
    page++;done=items.length===0||((page-1)*pageSize>=total);
    empty.style.display=total===0?"block":"none";endNote.style.display=(done&&total>PER_PAGE)?"block":"none";
    updateCount();
  }catch(error){if(current===ticket){empty.textContent=msgFor(error);empty.style.display="block";}}
  finally{if(current===ticket){loader.classList.remove("on");loading=false;if(!done&&sentinel.getBoundingClientRect().top<innerHeight+300)setTimeout(loadMore,0);}}
}
function reload(){ticket++;page=1;total=0;done=false;loading=false;grid.innerHTML="";empty.textContent="No doctors found. Try another search or speciality.";empty.style.display="none";endNote.style.display="none";countEl.textContent="";loadMore();}

let debounce; qEl.addEventListener("input",()=>{sync();clearTimeout(debounce);debounce=setTimeout(reload,300);});
specEl.addEventListener("change",reload);
document.getElementById("finderForm").addEventListener("submit",event=>{event.preventDefault();reload();});
document.getElementById("qClear").addEventListener("click",()=>{qEl.value="";sync();qEl.focus();reload();});
document.getElementById("reset").addEventListener("click",()=>{qEl.value="";specEl.value="";sync();reload();});
const chips=["Cardiology","Orthopaedics","Neurology","Paediatrics","Gastroenterology"];
chips.forEach(text=>{const button=document.createElement("button");button.type="button";button.textContent=text;button.addEventListener("click",()=>{const option=[...specEl.options].find(o=>o.textContent.toLowerCase().includes(text.toLowerCase()));if(option){specEl.value=option.value;reload();}});document.getElementById("chips").appendChild(button);});
new IntersectionObserver(entries=>{if(entries[0].isIntersecting)loadMore();},{rootMargin:"300px"}).observe(sentinel);

const menuBtn=document.getElementById("menuBtn"),setDrawer=open=>{document.body.classList.toggle("drawer-open",open);menuBtn.setAttribute("aria-expanded",String(open));};
menuBtn.addEventListener("click",()=>setDrawer(true));document.getElementById("drawerClose").addEventListener("click",()=>setDrawer(false));document.getElementById("scrim").addEventListener("click",()=>setDrawer(false));
document.querySelectorAll("#drawer a").forEach(anchor=>anchor.addEventListener("click",()=>setDrawer(false)));
(()=>{const button=document.getElementById("searchBtn"),modal=document.getElementById("searchModal"),input=document.getElementById("searchInput");const set=open=>{modal.classList.toggle("open",open);button.setAttribute("aria-expanded",String(open));document.body.style.overflow=open?"hidden":"";if(open)setTimeout(()=>input.focus(),30);};button.addEventListener("click",()=>set(true));document.getElementById("searchClose").addEventListener("click",()=>set(false));modal.addEventListener("click",event=>{if(event.target===modal)set(false);});window.__arshRegisterEvent(document,"keydown",event=>{if(event.key==="Escape"){set(false);setDrawer(false);}});})();

loadSpecialities().then(reload);
})();
