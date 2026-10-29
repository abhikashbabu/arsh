(function () {
  const runPage = function () {
    ;(function () {
    /* ============================================================
       PATIENT STORIES DATA
       Replace the sample items below with your real videos.
       - yt: YouTube video ID (e.g. "dQw4w9WgXcQ"). Thumbnail is picked up automatically.
       - thumb: optional custom thumbnail (used if yt is empty)
       - Only publish stories with the patient's written consent.
       ============================================================ */
    const STORIES=[
     {title:"Knee replacement gave me a new life",who:"Orthopaedics patient, Gaya",cat:"Orthopaedics",dur:"02:14",yt:"",thumb:"photo-1584982751601-97dcc096659c"},
     {title:"A second chance after an accident",who:"Trauma care patient",cat:"Orthopaedics",dur:"03:30",yt:"",thumb:"photo-1551601651-2a8555f1a136"},
     {title:"Timely treatment saved my life",who:"Emergency care patient",cat:"Emergency",dur:"01:48",yt:"",thumb:"photo-1576091160399-112ba8d25d1d"},
     {title:"Walking again after hip surgery",who:"Orthopaedics patient",cat:"Orthopaedics",dur:"02:40",yt:"",thumb:"photo-1576091160550-2173dba999ef"},
     {title:"Back to farm work after fracture care",who:"Trauma care patient",cat:"Orthopaedics",dur:"02:05",yt:"",thumb:"photo-1631217868264-e5b90bb7e133"},
     {title:"Heart attack recovery and angioplasty",who:"Cardiology patient",cat:"Cardiology",dur:"03:12",yt:"",thumb:"photo-1516549655169-df83a0774514"},
     {title:"Pain-free after years of back pain",who:"Spine care patient",cat:"Orthopaedics",dur:"01:56",yt:"",thumb:"photo-1551076805-e1869033e561"},
     {title:"Stroke recovery step by step",who:"Neurology patient",cat:"Neurology",dur:"03:45",yt:"",thumb:"photo-1519494026892-80bbd2d6fd0d"},
     {title:"Safe delivery and a healthy baby",who:"Maternity patient",cat:"Gynaecology",dur:"02:22",yt:"",thumb:"photo-1586773860418-d37222d8fce3"},
     {title:"Relief from long-standing acidity",who:"Gastroenterology patient",cat:"Gastroenterology",dur:"01:38",yt:"",thumb:"photo-1559757175-0eb30cd8c063"},
     {title:"Cleared to play again after ACL surgery",who:"Sports injury patient",cat:"Orthopaedics",dur:"02:50",yt:"",thumb:"photo-1584982751601-97dcc096659c"},
     {title:"Our child recovered quickly",who:"Paediatrics parent",cat:"Paediatrics",dur:"01:44",yt:"",thumb:"photo-1551601651-2a8555f1a136"},
     {title:"Angiography: what I experienced",who:"Cardiology patient",cat:"Cardiology",dur:"02:08",yt:"",thumb:"photo-1516549655169-df83a0774514"},
     {title:"Shoulder pain gone after treatment",who:"Orthopaedics patient",cat:"Orthopaedics",dur:"01:52",yt:"",thumb:"photo-1576091160399-112ba8d25d1d"},
     {title:"Epilepsy care that changed our lives",who:"Neurology patient family",cat:"Neurology",dur:"03:05",yt:"",thumb:"photo-1576091160550-2173dba999ef"},
     {title:"Sinus surgery and a fresh start",who:"ENT patient",cat:"ENT",dur:"01:41",yt:"",thumb:"photo-1631217868264-e5b90bb7e133"},
     {title:"ICU care that gave us hope",who:"Family of ICU patient",cat:"Emergency",dur:"02:33",yt:"",thumb:"photo-1586773860418-d37222d8fce3"},
     {title:"Managing diabetes with the right guidance",who:"General Medicine patient",cat:"General Medicine",dur:"02:01",yt:"",thumb:"photo-1559757175-0eb30cd8c063"},
     {title:"High-risk pregnancy, safe outcome",who:"Maternity patient",cat:"Gynaecology",dur:"02:47",yt:"",thumb:"photo-1551076805-e1869033e561"},
     {title:"Gallbladder surgery, quick recovery",who:"Gastroenterology patient",cat:"Gastroenterology",dur:"01:59",yt:"",thumb:"photo-1519494026892-80bbd2d6fd0d"}
    ];
    
    const BATCH=8; /* 2 rows of 4 per load */
    const grid=document.getElementById("grid"),sentinel=document.getElementById("sentinel"),endNote=document.getElementById("endNote"),countLabel=document.getElementById("countLabel");
    let list=STORIES,shown=0,loading=false,filter="All";
    
    document.getElementById("totalCount").textContent=STORIES.length;
    
    /* Filters */
    const cats=["All",...new Set(STORIES.map(s=>s.cat))];
    const fBox=document.getElementById("filters");
    cats.forEach(c=>{const b=document.createElement("button");b.type="button";b.textContent=c;b.className=c==="All"?"on":"";b.addEventListener("click",()=>{
      fBox.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));
      filter=c;list=c==="All"?STORIES:STORIES.filter(s=>s.cat===c);
      grid.innerHTML="";shown=0;endNote.classList.add("d-none");loadMore();
    });fBox.appendChild(b);});
    
    const thumbOf=s=>s.yt?`https://img.youtube.com/vi/${s.yt}/hqdefault.jpg`:`https://images.unsplash.com/${s.thumb}?auto=format&fit=crop&w=700&q=80`;
    const esc=t=>t.replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
    
    function card(s){
      const col=document.createElement("div");col.className="col-12 col-sm-6 col-lg-3 v-item";
      col.innerHTML=`<button class="v-card" type="button" aria-label="Play: ${esc(s.title)}">
        <div class="v-thumb"><img src="${thumbOf(s)}" alt="${esc(s.title)}" loading="lazy"><span class="v-tag">${esc(s.cat)}</span><span class="v-dur">${s.dur}</span><span class="v-play"><i class="bi bi-play-fill"></i></span></div>
        <div class="v-body"><h3>${esc(s.title)}</h3><p>${esc(s.who)}</p></div></button>`;
      col.querySelector("button").addEventListener("click",()=>openVideo(s));
      return col;
    }
    function updateCount(){countLabel.textContent=`Showing ${Math.min(shown,list.length)} of ${list.length} stories`;}
    
    /* Render each batch immediately; the cards already use lazy-loaded thumbnails. */
    function loadMore(){
      if(loading||shown>=list.length)return;
      loading=true;
      const next=list.slice(shown,shown+BATCH);
      const f=document.createDocumentFragment();next.forEach(s=>f.appendChild(card(s)));grid.appendChild(f);
      shown+=next.length;loading=false;updateCount();
      if(shown>=list.length){endNote.classList.remove("d-none");io.disconnect();}
      else{io.disconnect();io.observe(sentinel);} /* re-check if sentinel is still visible */
    }
    
    /* Infinite scroll */
    const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting))loadMore();},{rootMargin:"300px 0px"});
    io.observe(sentinel);
    loadMore();
    
    /* Video modal */
    const modalEl=document.getElementById("videoModal"),modal=new bootstrap.Modal(modalEl),box=document.getElementById("videoBox"),vt=document.getElementById("videoTitle");
    function openVideo(s){
      vt.textContent=s.title;
      box.innerHTML=s.yt
        ?`<iframe src="https://www.youtube-nocookie.com/embed/${s.yt}?autoplay=1&rel=0" title="${esc(s.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
        :`<div class="v-empty"><div><i class="bi bi-camera-video fs-1 d-block mb-2"></i>Video coming soon</div></div>`;
      modal.show();
    }
    modalEl.addEventListener("hidden.bs.modal",()=>{box.innerHTML="";});
    
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
  };
  if (window.bootstrap) {
    runPage();
    return;
  }
  const bootstrapScript = document.createElement("script");
  bootstrapScript.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js";
  bootstrapScript.onload = runPage;
  document.head.appendChild(bootstrapScript);
})();
