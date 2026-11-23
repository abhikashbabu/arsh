(function () {
  const runPage = function () {
    ;(function () {
    let apiStories=[];
    try{const initial=document.getElementById("arshInitialApiData");if(initial?.textContent)apiStories=(JSON.parse(initial.textContent).stories||[]).filter(s=>s.is_published!==false&&s.is_published!==0&&s.is_published!=="0");}catch(_){apiStories=[];}
    const getYoutubeId=url=>{const m=String(url||"").match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);return m?m[1]:"";};
    const formatDuration=value=>{if(!value)return"";if(typeof value==="string"&&value.includes(":"))return value;const n=Number(value);if(!Number.isFinite(n)||n<=0)return"";return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(Math.floor(n%60)).padStart(2,"0")}`;};
    const STORIES=apiStories.map(s=>{
      const department=s.department||{};
      const videoUrl=s.video_url||s.video||s.url||"";
      return {
        id:s.id,title:s.title||"Patient story",who:s.patient_name||s.patient||`${department.name||s.department_name||"ARSH"} patient`,
        cat:department.name||s.department_name||s.category||"Patient story",dur:formatDuration(s.duration||s.video_duration),
        yt:(s.youtube_id||(s.video_source==="youtube"?s.video_id:""))||getYoutubeId(s.youtube_url||videoUrl),
        video_url:videoUrl,video_mime:s.video_mime||"video/mp4",
        thumbnail_url:s.thumbnail_url||s.poster_url||s.image_url||s.thumbnail||""
      };
    });
    
    const BATCH=8; /* 2 rows of 4 per load */
    const grid=document.getElementById("grid"),sentinel=document.getElementById("sentinel"),endNote=document.getElementById("endNote"),countLabel=document.getElementById("countLabel");
    let list=STORIES,shown=0,loading=false,filter="All";
    
    document.getElementById("totalCount").textContent=STORIES.length;
    document.getElementById("specialityCount").textContent=new Set(STORIES.map(s=>s.cat)).size;
    
    /* Filters */
    const cats=["All",...new Set(STORIES.map(s=>s.cat))];
    const fBox=document.getElementById("filters");
    cats.forEach(c=>{const b=document.createElement("button");b.type="button";b.textContent=c;b.className=c==="All"?"on":"";b.addEventListener("click",()=>{
      fBox.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));
      filter=c;list=c==="All"?STORIES:STORIES.filter(s=>s.cat===c);
      grid.innerHTML="";shown=0;endNote.classList.add("d-none");loadMore();
    });fBox.appendChild(b);});
    
    const thumbOf=s=>s.thumbnail_url||(s.yt?`https://img.youtube.com/vi/${s.yt}/hqdefault.jpg`:`/images/blog-placeholder.svg`);
    const esc=t=>t.replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));

    const thumbObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const img=entry.target;thumbObserver.unobserve(img);
      const story=STORIES.find(item=>String(item.id)===img.dataset.storyId);
      if(!story?.video_url||story.thumbnail_url||story.yt)return;
      const video=document.createElement("video");video.crossOrigin="anonymous";video.preload="auto";video.muted=true;video.playsInline=true;video.src=story.video_url;
      let done=false;
      const release=()=>{if(done)return;done=true;video.removeAttribute("src");video.load();};
      video.addEventListener("loadeddata",()=>{
        if(video.videoWidth&&video.videoHeight){
          const canvas=document.createElement("canvas"),ratio=Math.min(700/video.videoWidth,900/video.videoHeight,1);
          canvas.width=Math.round(video.videoWidth*ratio);canvas.height=Math.round(video.videoHeight*ratio);
          try{const context=canvas.getContext("2d");context?.drawImage(video,0,0,canvas.width,canvas.height);img.src=canvas.toDataURL("image/jpeg",.84);}catch(_){/* Keep the placeholder if this API origin disallows canvas capture. */}
        }
        release();
      },{once:true});
      video.addEventListener("error",release,{once:true});
      video.load();
      setTimeout(release,12000);
    }),{rootMargin:"300px 0px"});
    
    function card(s){
      const col=document.createElement("div");col.className="col-12 col-sm-6 col-lg-3 v-item";
      col.innerHTML=`<button class="v-card" type="button" aria-label="Play: ${esc(s.title)}">
        <div class="v-thumb"><img src="${thumbOf(s)}" data-story-id="${esc(String(s.id))}" alt="${esc(s.title)}" loading="lazy"><span class="v-tag">${esc(s.cat)}</span>${s.dur?'<span class="v-dur">'+esc(s.dur)+'</span>':""}<span class="v-play"><i class="bi bi-play-fill"></i></span></div>
        <div class="v-body"><h3>${esc(s.title)}</h3><p>${esc(s.who)}</p></div></button>`;
      const img=col.querySelector("img[data-story-id]");if(img&&s.video_url&&!s.thumbnail_url&&!s.yt)thumbObserver.observe(img);
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
    if(!STORIES.length){grid.innerHTML='<div class="col-12"><div class="v-body"><p>No patient stories available yet.</p></div></div>';countLabel.textContent="No patient stories available";endNote.classList.add("d-none");}
    loadMore();
    
    /* Video modal */
    const modalEl=document.getElementById("videoModal"),modal=new bootstrap.Modal(modalEl),box=document.getElementById("videoBox"),vt=document.getElementById("videoTitle");
    function openVideo(s){
      vt.textContent=s.title;
      box.innerHTML=s.yt
        ?`<iframe src="https://www.youtube-nocookie.com/embed/${s.yt}?autoplay=1&rel=0" title="${esc(s.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
        :s.video_url?`<video controls autoplay playsinline class="w-100 h-100"><source src="${esc(s.video_url)}" type="${esc(s.video_mime||"video/mp4")}"></video>`:`<div class="v-empty"><div><i class="bi bi-camera-video fs-1 d-block mb-2"></i>Video coming soon</div></div>`;
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
