;(function () {
const specGrid=document.querySelector(".sp-card")?.parentElement?.parentElement;
const escapeText=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FEATURED_IDS=["3","1","4","15","2","6","8","16"];
const DEPARTMENT_COPY={
  "3":{title:"Orthopaedics & Spine",description:"Care for bone, joint, muscle and spine conditions, from injuries to planned treatment.",services:["Joint replacement","Trauma and fracture care","Spine and sports injury care"]},
  "1":{title:"Cardiology",description:"Heart assessment, treatment and follow-up with support from the hospital's cardiac team.",services:["ECG, Echo and TMT","Angiography and angioplasty","Heart emergency care"]},
  "4":{title:"Neurology & Neurosurgery",description:"Diagnosis and treatment for conditions affecting the brain, spine and nerves.",services:["Stroke and paralysis care","Seizure and headache care","Brain and spine surgery"]},
  "15":{title:"Gastroenterology",description:"Care for digestive, liver and pancreatic conditions with endoscopy services.",services:["Endoscopy and colonoscopy","Liver and gallbladder care","Digestive disorders"]},
  "2":{title:"Gynaecology",description:"Women's health services, including pregnancy care and gynaecological treatment.",services:["Pregnancy consultations","Menstrual and hormonal care","Gynaecological procedures"]},
  "6":{title:"Paediatrics",description:"Medical care for newborns, children and adolescents, with family-focused support.",services:["Newborn and child care","Vaccination","Growth and nutrition"]},
  "8":{title:"General Medicine",description:"First point of care for common illnesses, long-term conditions and preventive check-ups.",services:["Fever and infection care","Diabetes and thyroid care","Preventive health checks"]},
  "16":{title:"Critical Care",description:"Round-the-clock hospital care for patients who need urgent treatment and close monitoring.",services:["ICU and HDU support","Emergency stabilisation","Continuous patient monitoring"]}
};
if(specGrid&&specGrid.dataset.apiRendered!=="true"){
  window.ArshApi.get("specialities").then(response=>{
    const all=Array.isArray(response.data)?response.data:[];
    const items=FEATURED_IDS.map(id=>all.find(s=>String(s.id)===id)).filter(Boolean);
    if(!items.length)return;
    specGrid.innerHTML=items.map(s=>{const copy=DEPARTMENT_COPY[String(s.id)]||{title:s.name,description:s.description||"",services:[]};return `<div class="col-md-6 col-xl-4"><article class="sp-card"><a class="sp-card-hitarea" href="/specialities/${encodeURIComponent(s.slug)}" aria-label="Open ${escapeText(copy.title)} details"></a><div class="sp-top"><span class="sp-icon"><i class="bi bi-heart-pulse"></i></span><h3>${escapeText(copy.title)}</h3></div><p>${escapeText(s.description||copy.description)}</p><ul class="sp-list">${copy.services.map(service=>`<li><i class="bi bi-check-circle-fill"></i>${escapeText(service)}</li>`).join("")}${s.floor?`<li><i class="bi bi-geo-alt-fill"></i>${escapeText(s.floor)} floor</li>`:""}</ul><div class="sp-foot"><a href="/doctors?speciality_id=${encodeURIComponent(s.id)}">View doctors <i class="bi bi-arrow-right"></i></a><a class="book" href="/book-appointment?speciality_id=${encodeURIComponent(s.id)}">Book visit</a></div></article></div>`;}).join("");
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
