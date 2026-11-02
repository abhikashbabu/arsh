;(function () {
const api=window.ArshApi, PER_PAGE=12;
const runtime=window;
if(runtime.__arshDoctorsPageInitialized)return;
runtime.__arshDoctorsPageInitialized=true;
const $=id=>document.getElementById(id);
const grid=$("grid"),loader=$("loader"),empty=$("empty"),endNote=$("endNote"),countEl=$("count"),sentinel=$("sentinel");
const qEl=$("q"),deptEl=$("dept"),docEl=$("doc"),typeEl=$("ctype"),filterForm=$("fform"),filterColumn=$("fcol"),toggle=$("ftoggle");
let page=1,total=0,pageSize=PER_PAGE,loading=false,done=false,ticket=0,doctors=[],debounce;
const registered=[];
let observer,timer;
const urlParams=new URLSearchParams(location.search);
const initialSpeciality=urlParams.get("speciality_id")||urlParams.get("spec")||urlParams.get("dept")||"";
if(urlParams.get("q"))qEl.value=urlParams.get("q");
function listen(target,type,handler){target.addEventListener(type,handler);registered.push([target,type,handler]);}
function cleanup(){
  ticket++;clearTimeout(debounce);clearTimeout(timer);observer?.disconnect();
  registered.forEach(([target,type,handler])=>target.removeEventListener(type,handler));
  registered.length=0;runtime.__arshDoctorsPageInitialized=false;
  if(runtime.__arshPageScriptCleanup===cleanup)delete runtime.__arshPageScriptCleanup;
}
runtime.__arshPageScriptCleanup=cleanup;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const errorText=error=>error?.message||"Could not load doctors. Please try again.";

function closeFilters(){filterColumn.classList.remove("open");toggle.setAttribute("aria-expanded","false");}
function updateDoctorOptions(){
  const selected=docEl.value,department=deptEl.value;
  const visible=doctors.filter(doctor=>!department||String(doctor.speciality_id)===department);
  docEl.innerHTML='<option value="">Select doctor</option>'+visible.map(doctor=>`<option value="${esc(doctor.name)}">${esc(doctor.name)}</option>`).join("");
  if(visible.some(doctor=>doctor.name===selected))docEl.value=selected;
}
async function loadFilters(){
  const wanted=initialSpeciality;
  try{
    deptEl.querySelectorAll("option:not(:first-child)").forEach(option=>option.remove());
    const response=await api.get("specialities");
    const specialities=Array.isArray(response.data)?response.data:[];
    specialities.forEach(s=>{const option=document.createElement("option");option.value=String(s.id);option.textContent=s.name;option.dataset.slug=s.slug||"";deptEl.appendChild(option);});
    if(wanted){const option=[...deptEl.options].find(o=>o.value===wanted||o.dataset.slug===wanted||o.textContent.toLowerCase()===wanted.toLowerCase());if(option)deptEl.value=option.value;}
  }catch(error){empty.querySelector("p").textContent=errorText(error);}
  try{
    const response=await api.get("doctors",{page:1,per_page:100});
    doctors=Array.isArray(response.data)?response.data:[];
    updateDoctorOptions();
    const wantedDoctor=urlParams.get("doctor");
    if(wantedDoctor){const doctor=doctors.find(item=>String(item.id)===wantedDoctor||item.slug===wantedDoctor||item.name.toLowerCase()===wantedDoctor.toLowerCase());if(doctor)docEl.value=doctor.name;}
  }catch(error){empty.querySelector("p").textContent=errorText(error);}
}

const card=doctor=>`<div class="col"><article class="dcard in">
  <div class="dph"><img src="${esc(doctor.photo_url||"/images/doctor-placeholder.svg")}" alt="${esc(doctor.name)}" loading="lazy"><span class="bar">${esc(doctor.speciality||"ARSH Specialist")}</span></div>
  <div class="dbody"><h3>${esc(doctor.name)}</h3><div class="dsub">${esc(doctor.speciality||"Consultant")}</div>
    <div class="dq"><b>Qualification:</b> ${esc(doctor.qualification||"Details available at appointment")}</div>
    <div class="dmeta"><span><i class="bi bi-award"></i>${doctor.experience?`${esc(doctor.experience)}+ years experience`:esc(doctor.status||"Appointments available")}</span><span><i class="bi bi-calendar-check"></i>${esc(doctor.status||"Appointments available")}</span></div>
    <div class="dact"><a class="btn btn-arsh" href="/book-appointment?doctor=${encodeURIComponent(doctor.id)}&speciality_id=${encodeURIComponent(doctor.speciality_id)}">Book Appointment</a>
      <a class="btn btn-ghost" href="/doctors/${encodeURIComponent(doctor.slug)}">View Profile</a></div>
  </div></article></div>`;
function updateCount(){countEl.innerHTML=total?`Showing <b>${Math.min((page-1)*pageSize,total)}</b> of <b>${total}</b> doctors`:"";}
async function loadMore(){
  if(loading||done)return;
  loading=true;loader.classList.add("on");const current=ticket;
  try{
    const query=[qEl.value.trim(),docEl.value].filter(Boolean).join(" ");
    const response=await api.get("doctors",{q:query,speciality_id:deptEl.value||initialSpeciality,page,per_page:PER_PAGE});
    if(current!==ticket)return;
    const items=Array.isArray(response.data)?response.data:[];
    total=Number(response.meta?.total??items.length);pageSize=Number(response.meta?.per_page)||PER_PAGE;
    grid.insertAdjacentHTML("beforeend",items.map(card).join(""));
    page++;done=items.length===0||((page-1)*pageSize>=total);
    empty.style.display=total===0?"block":"none";endNote.style.display=(done&&total>PER_PAGE)?"block":"none";
    updateCount();
  }catch(error){if(current===ticket){empty.querySelector("p").textContent=errorText(error);empty.style.display="block";}}
  finally{if(current===ticket){loader.classList.remove("on");loading=false;if(!done&&sentinel.getBoundingClientRect().top<innerHeight+300)timer=setTimeout(loadMore,0);}}
}
function reload(){ticket++;page=1;total=0;done=false;loading=false;grid.innerHTML="";empty.querySelector("p").textContent="Try a different department, name or problem.";empty.style.display="none";endNote.style.display="none";countEl.textContent="";loadMore();}
function resetAll(){qEl.value="";deptEl.value="";docEl.value="";typeEl.value="";updateDoctorOptions();reload();closeFilters();}

listen(qEl,"input",()=>{clearTimeout(debounce);debounce=setTimeout(reload,300);});
listen(deptEl,"change",()=>{docEl.value="";updateDoctorOptions();reload();});
listen(docEl,"change",reload);
listen(typeEl,"change",()=>{if(typeEl.value==="video"){typeEl.value="";return;}reload();});
listen(filterForm,"submit",event=>{event.preventDefault();reload();closeFilters();});
listen($("freset"),"click",resetAll);listen($("reset2"),"click",resetAll);
listen(toggle,"click",()=>{const open=filterColumn.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));});
$("tries").querySelectorAll("button").forEach(button=>button.remove());
["Chest pain","Knee pain","Pregnancy","Child fever","Headache","Acidity"].forEach(term=>{const button=document.createElement("button");button.type="button";button.textContent=term;listen(button,"click",()=>{qEl.value=term;reload();closeFilters();});$("tries").appendChild(button);});

const menuBtn=$("menuBtn"),setDrawer=open=>{document.body.classList.toggle("drawer-open",open);menuBtn.setAttribute("aria-expanded",String(open));};
listen(menuBtn,"click",()=>setDrawer(true));listen($("drawerClose"),"click",()=>setDrawer(false));listen($("scrim"),"click",()=>setDrawer(false));
document.querySelectorAll("#drawer a").forEach(anchor=>listen(anchor,"click",()=>setDrawer(false)));
(()=>{const button=$("searchBtn"),modal=$("searchModal"),input=$("searchInput");const set=open=>{modal.classList.toggle("open",open);button.setAttribute("aria-expanded",String(open));document.body.style.overflow=open?"hidden":"";if(open)setTimeout(()=>input.focus(),30);};listen(button,"click",()=>set(true));listen($("searchClose"),"click",()=>set(false));listen(modal,"click",event=>{if(event.target===modal)set(false);});listen(document,"keydown",event=>{if(event.key==="Escape"){set(false);setDrawer(false);}});})();

observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting)loadMore();},{rootMargin:"300px"});
observer.observe(sentinel);
reload();
loadFilters().then(()=>{if(urlParams.has("doctor"))reload();});
})();
