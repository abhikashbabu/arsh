;(function () {
/* ---------- Dummy data (replace with your CI4 endpoint, see fetchDoctors) ---------- */
const SPEC_KEYWORDS={
  "Orthopaedics & Spine":"bone fracture joint knee hip shoulder back pain spine arthritis replacement sports injury",
  "Cardiology":"heart chest pain bp blood pressure hypertension angiography angioplasty palpitation cholesterol",
  "Neurology & Neurosurgery":"brain headache migraine stroke seizure epilepsy nerve paralysis dizziness",
  "Gastroenterology":"stomach acidity gas liver piles digestion ulcer jaundice constipation endoscopy",
  "Obstetrics & Gynaecology":"pregnancy delivery women periods pcos fertility maternity ladies",
  "Paediatrics":"child baby kids infant fever vaccination newborn growth",
  "General Medicine":"fever cold cough diabetes sugar thyroid infection checkup typhoid",
  "ENT":"ear nose throat sinus hearing tonsil sore throat allergy snoring"
};
const IMGS=[
 "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
 "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
 "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
 "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80"
];
const RAW=[
 ["Dr. Navneet Nishchal","Orthopaedics & Spine","Joint Replacement Surgeon",15],
 ["Dr. Sandeep Rao","Orthopaedics & Spine","Spine Surgeon",12],
 ["Dr. Kavita Jha","Orthopaedics & Spine","Sports Injury Specialist",9],
 ["Dr. Manish Tiwari","Orthopaedics & Spine","Orthopaedic Surgeon",18],
 ["Dr. Priya Sharma","Cardiology","Interventional Cardiologist",12],
 ["Dr. Rajeev Anand","Cardiology","Consultant Cardiologist",16],
 ["Dr. Meena Gupta","Cardiology","Cardiac Imaging Specialist",10],
 ["Dr. Arvind Prasad","Cardiology","Heart Failure Specialist",14],
 ["Dr. Amit Kumar","Neurology & Neurosurgery","Consultant Neurologist",10],
 ["Dr. Shalini Verma","Neurology & Neurosurgery","Stroke Specialist",11],
 ["Dr. Rohit Saxena","Neurology & Neurosurgery","Neurosurgeon",17],
 ["Dr. Nidhi Mishra","Neurology & Neurosurgery","Epilepsy Specialist",8],
 ["Dr. Rohan Mehta","Gastroenterology","Gastroenterologist",13],
 ["Dr. Pooja Singhal","Gastroenterology","Liver Specialist",9],
 ["Dr. Vikas Chandra","Gastroenterology","Endoscopy Specialist",15],
 ["Dr. Anjali Roy","Gastroenterology","Consultant Gastroenterologist",7],
 ["Dr. Ritu Singh","Obstetrics & Gynaecology","Obstetrician",14],
 ["Dr. Sunita Pandey","Obstetrics & Gynaecology","Infertility Specialist",16],
 ["Dr. Neelam Sinha","Obstetrics & Gynaecology","Gynaecologist",11],
 ["Dr. Radhika Kumari","Obstetrics & Gynaecology","High-risk Pregnancy Specialist",9],
 ["Dr. Neha Verma","Paediatrics","Paediatrician",10],
 ["Dr. Sameer Khan","Paediatrics","Neonatologist",12],
 ["Dr. Isha Kapoor","Paediatrics","Child Health Specialist",8],
 ["Dr. Gaurav Dubey","Paediatrics","Paediatric Consultant",13],
 ["Dr. Anil Kumar","General Medicine","Consultant Physician",20],
 ["Dr. Seema Rani","General Medicine","Diabetes Specialist",12],
 ["Dr. Prakash Yadav","General Medicine","Internal Medicine",15],
 ["Dr. Farah Siddiqui","General Medicine","General Physician",9],
 ["Dr. Pankaj Singh","ENT","ENT Surgeon",14],
 ["Dr. Madhuri Das","ENT","Hearing Specialist",10],
 ["Dr. Tarun Bhatt","ENT","Head and Neck Surgeon",13],
 ["Dr. Kriti Agarwal","ENT","ENT Consultant",7]
];
const DOCTORS=RAW.map((d,i)=>({
  id:i+1,name:d[0],spec:d[1],des:d[2],years:d[3],
  img:IMGS[i%IMGS.length],
  slug:d[0].toLowerCase().replace(/^dr\.\s*/,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),
  hay:(d[0]+" "+d[1]+" "+d[2]+" "+SPEC_KEYWORDS[d[1]]).toLowerCase()
}));

/* Swap this function for a CI4 call, e.g. fetch('/api/doctors?q=..&spec=..&page=..').
   It must return { items: [...], total: N } with the same fields. */
async function fetchDoctors({q,spec,offset,limit}){
  const tokens=q.toLowerCase().split(/\s+/).filter(Boolean);
  const all=DOCTORS.filter(d=>(!spec||d.spec===spec)&&tokens.every(t=>d.hay.includes(t)));
  return {items:all.slice(offset,offset+limit),total:all.length};
}

/* ---------- UI ---------- */
const PER_LOAD=8;
const grid=document.getElementById("grid"),loader=document.getElementById("loader"),empty=document.getElementById("empty"),endNote=document.getElementById("endNote"),countEl=document.getElementById("count");
const qEl=document.getElementById("q"),specEl=document.getElementById("spec"),qGroup=document.getElementById("qGroup");
let offset=0,total=0,loading=false,done=false,ticket=0;

Object.keys(SPEC_KEYWORDS).forEach(s=>{const o=document.createElement("option");o.value=s;o.textContent=s;specEl.appendChild(o);});
["Chest pain","Knee pain","Pregnancy","Child fever","Headache","Acidity","Diabetes"].forEach(t=>{
  const b=document.createElement("button");b.type="button";b.textContent=t;
  b.addEventListener("click",()=>{qEl.value=t;sync();reload();});
  document.getElementById("chips").appendChild(b);
});

const card=d=>`<div class="col"><article class="card-p dr-in">
  <div class="ph"><img src="${d.img}" alt="${d.name}" loading="lazy"></div>
  <div class="body">
    <h3>${d.name}</h3>
    <div class="sub">${d.spec}</div>
    <div class="des">${d.des}</div>
    <div class="meta"><i class="bi bi-award me-1"></i>${d.years}+ years experience</div>
    <div class="dr-actions">
      <a class="btn btn-arsh" href="/book-appointment?doctor=${d.slug}">Appointment</a>
      <a class="btn btn-ghost" href="${d.spec.includes("Orthopaedics")?"/orthopedic-doctor-in-gaya-bihar":"/doctors"}">View Profile</a>
    </div>
  </div></article></div>`;

function sync(){qGroup.classList.toggle("has-text",qEl.value.length>0);}
function updateCount(){
  countEl.innerHTML=total?`Showing <b>${Math.min(offset,total)}</b> of <b>${total}</b> doctors`:"";
}

async function loadMore(){
  if(loading||done)return;
  loading=true;loader.classList.add("on");
  const my=ticket;
  const res=await fetchDoctors({q:qEl.value.trim(),spec:specEl.value,offset,limit:PER_LOAD});
  if(my!==ticket)return; /* a newer search started */
  loader.classList.remove("on");
  total=res.total;
  grid.insertAdjacentHTML("beforeend",res.items.map(card).join(""));
  offset+=res.items.length;
  done=offset>=total;
  empty.style.display=total===0?"block":"none";
  endNote.style.display=(done&&total>PER_LOAD)?"block":"none";
  updateCount();
  loading=false;
  /* if the sentinel is still on screen after a short batch, keep loading */
  if(!done&&sentinel.getBoundingClientRect().top<innerHeight+300)loadMore();
}

function reload(){
  ticket++;offset=0;total=0;done=false;loading=false;
  grid.innerHTML="";empty.style.display="none";endNote.style.display="none";countEl.textContent="";
  loadMore();
}

let t;
qEl.addEventListener("input",()=>{sync();clearTimeout(t);t=setTimeout(reload,300);});
specEl.addEventListener("change",reload);
document.getElementById("finderForm").addEventListener("submit",e=>{e.preventDefault();reload();});
document.getElementById("qClear").addEventListener("click",()=>{qEl.value="";sync();qEl.focus();reload();});
document.getElementById("reset").addEventListener("click",()=>{qEl.value="";specEl.value="";sync();reload();});

const sentinel=document.getElementById("sentinel");
new IntersectionObserver(es=>{if(es[0].isIntersecting)loadMore();},{rootMargin:"300px"}).observe(sentinel);

/* Pre-fill from URL, e.g. /doctors?q=heart&spec=Cardiology */
const params=new URLSearchParams(location.search);
if(params.get("q"))qEl.value=params.get("q");
if(params.get("spec")&&SPEC_KEYWORDS[params.get("spec")])specEl.value=params.get("spec");
sync();

/* ---------- Header: drawer + search modal ---------- */
const menuBtn=document.getElementById("menuBtn");
const setDrawer=o=>{document.body.classList.toggle("drawer-open",o);menuBtn.setAttribute("aria-expanded",o)};
menuBtn.addEventListener("click",()=>setDrawer(true));
document.getElementById("drawerClose").addEventListener("click",()=>setDrawer(false));
document.getElementById("scrim").addEventListener("click",()=>setDrawer(false));
document.querySelectorAll("#drawer a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));
(()=>{
  const b=document.getElementById("searchBtn"),m=document.getElementById("searchModal"),i=document.getElementById("searchInput");
  const set=o=>{m.classList.toggle("open",o);b.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":"";if(o)setTimeout(()=>i.focus(),30);};
  b.addEventListener("click",()=>set(true));
  document.getElementById("searchClose").addEventListener("click",()=>set(false));
  m.addEventListener("click",e=>{if(e.target===m)set(false)});
  window.__arshRegisterEvent(document, "keydown",e=>{if(e.key==="Escape"){set(false);setDrawer(false);}});
})();
})();
