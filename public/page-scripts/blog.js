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
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){set(false);setDrawer(false);}});
})();


const IMG=id=>"https://images.unsplash.com/photo-"+id+"?auto=format&fit=crop&w=900&q=80";
const POSTS=[
 {t:"7 warning signs of a heart problem you should never ignore",c:"Heart Health",d:"28 Oct 2026",r:6,i:"1516549655169-df83a0774514",e:"Chest pressure, breathlessness and unusual tiredness can all point to a heart problem. Learn which signs need urgent care and which need a check-up."},
 {t:"Knee replacement: what to expect before and after surgery",c:"Orthopaedics",d:"22 Oct 2026",r:7,i:"1584982751601-97dcc096659c",e:"A simple guide to preparing for knee replacement, the recovery timeline and the exercises that help you walk with confidence again."},
 {t:"Pregnancy care: a trimester-by-trimester checklist",c:"Women's Health",d:"16 Oct 2026",r:8,i:"1576091160399-112ba8d25d1d",e:"Check-ups, scans, nutrition and warning signs to watch for at every stage of pregnancy, explained in plain language."},
 {t:"Child has fever? When to wait and when to see a doctor",c:"Child Care",d:"10 Oct 2026",r:5,i:"1551601651-2a8555f1a136",e:"Fever is common in children. Know how to care for your child at home and the signs that mean you should seek medical help."},
 {t:"Acidity and gas: everyday habits that make it worse",c:"Digestive Health",d:"04 Oct 2026",r:5,i:"1559757175-0eb30cd8c063",e:"Late meals, skipped breakfast and too much tea or coffee are common triggers. Small changes can bring real relief."},
 {t:"Health camp at ARSH: free screening for the community",c:"Hospital News",d:"29 Sep 2026",r:3,i:"1576671081837-49000212a370",e:"Our recent health camp offered free BP, sugar and ECG screening. Here is what we found and how you can join the next one."},
 {t:"Back pain at a desk job: simple ways to protect your spine",c:"Orthopaedics",d:"21 Sep 2026",r:6,i:"1519494026892-80bbd2d6fd0d",e:"Sitting for long hours strains the back. Posture tips, stretches and when back pain needs an expert opinion."},
 {t:"Managing diabetes: a practical food and routine guide",c:"General Health",d:"15 Sep 2026",r:7,i:"1586773860418-d37222d8fce3",e:"Meal timing, portion control and a daily walk make a big difference to blood sugar. Start with these simple steps."},
 {t:"Headache or migraine? How to tell the difference",c:"Neurology",d:"09 Sep 2026",r:5,i:"1585435557343-3b092031a831",e:"Not every headache is a migraine. Learn the typical signs, common triggers and when a scan or specialist visit is needed."},
 {t:"How to prepare for your first hospital visit",c:"Hospital News",d:"02 Sep 2026",r:4,i:"1495020689067-958852a7765e",e:"Documents to carry, questions to ask and what happens at registration, so your first visit to ARSH is smooth."},
 {t:"Healthy heart diet: foods to add and foods to cut down",c:"Heart Health",d:"26 Aug 2026",r:6,i:"1612349317150-e413f6a5b16d",e:"Less salt, less fried food, more fibre. A realistic Indian-kitchen guide to eating for a healthier heart."},
 {t:"Newborn care basics for first-time parents",c:"Child Care",d:"19 Aug 2026",r:7,i:"1551076805-e1869033e561",e:"Feeding, sleep, vaccination and warning signs in the first weeks, answered in simple, practical steps."}
];
POSTS.forEach(p=>{p.slug=p.t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);p.img=IMG(p.i);});
const PER=6;
const grid=document.getElementById("grid"),moreBtn=document.getElementById("more"),emptyEl=document.getElementById("empty"),countEl=document.getElementById("count"),featBox=document.getElementById("featBox"),qEl=document.getElementById("bq"),catsEl=document.getElementById("cats");
let cat="",shown=0,list=[];
const CATS=[...new Set(POSTS.map(p=>p.c))];
["All",...CATS].forEach(c=>{
  const b=document.createElement("button");b.type="button";b.textContent=c;b.dataset.c=c==="All"?"":c;
  b.addEventListener("click",()=>{cat=b.dataset.c;render();});catsEl.appendChild(b);
});
const meta=p=>`<div class="bmeta"><span><i class="bi bi-calendar3"></i>${p.d}</span><span><i class="bi bi-clock"></i>${p.r} min read</span></div>`;
const card=p=>`<div class="col"><article class="bcard in"><a class="ph" href="/blog/${p.slug}" tabindex="-1"><img src="${p.img}" alt="${p.t}" loading="lazy"><span class="cat">${p.c}</span></a><div class="body">${meta(p)}<h3><a href="/blog/${p.slug}">${p.t}</a></h3><p>${p.e}</p><a class="read" href="/blog/${p.slug}">Read more <i class="bi bi-arrow-right"></i></a></div></article></div>`;
const feat=p=>`<article class="feat in"><div class="row g-0"><div class="col-lg-6"><a class="ph" href="/blog/${p.slug}" tabindex="-1"><img src="${p.img}" alt="${p.t}"><span class="cat">${p.c}</span></a></div><div class="col-lg-6"><div class="body"><div class="kicker">Featured article</div>${meta(p)}<h2><a href="/blog/${p.slug}">${p.t}</a></h2><p>${p.e}</p><a class="btn btn-arsh" href="/blog/${p.slug}">Read article</a></div></div></div></article>`;
function render(){
  [...catsEl.children].forEach(b=>b.classList.toggle("on",b.dataset.c===cat));
  const q=qEl.value.trim().toLowerCase();
  const filtering=!!(q||cat);
  const base=POSTS.filter(p=>(!cat||p.c===cat)&&(!q||(p.t+" "+p.c+" "+p.e).toLowerCase().includes(q)));
  featBox.innerHTML=!filtering?feat(POSTS[0]):"";
  list=!filtering?base.slice(1):base;
  grid.innerHTML="";shown=0;emptyEl.style.display=base.length?"none":"block";
  countEl.innerHTML=filtering?`Found <b>${base.length}</b> article${base.length===1?"":"s"}`:"Latest articles";
  more();
}
function more(){
  const next=list.slice(shown,shown+PER);
  grid.insertAdjacentHTML("beforeend",next.map(card).join(""));
  shown+=next.length;
  moreBtn.parentElement.style.display=shown<list.length?"block":"none";
}
moreBtn.addEventListener("click",more);
let t;qEl.addEventListener("input",()=>{clearTimeout(t);t=setTimeout(render,250);});
document.getElementById("reset").addEventListener("click",()=>{qEl.value="";cat="";render();});
const prm=new URLSearchParams(location.search);
if(prm.get("q"))qEl.value=prm.get("q");
if(prm.get("cat")&&CATS.includes(prm.get("cat")))cat=prm.get("cat");
render();
})();