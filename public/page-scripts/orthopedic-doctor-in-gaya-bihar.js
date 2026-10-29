(function () {
  const runPage = function () {
    ;(function () {
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
    
    /* Mobile carousels (arrows) */
    document.querySelectorAll(".cx").forEach(cx=>{
      const t=cx.querySelector(".snap"),p=cx.querySelector(".prev"),n=cx.querySelector(".next");
      const upd=()=>{p.disabled=t.scrollLeft<=2;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-2;};
      p.addEventListener("click",()=>t.scrollBy({left:-t.clientWidth,behavior:"smooth"}));
      n.addEventListener("click",()=>t.scrollBy({left:t.clientWidth,behavior:"smooth"}));
      t.addEventListener("scroll",upd,{passive:true});window.addEventListener("resize",upd);upd();
    });
    
    /* NOTE for dev: this form has no backend yet. Connect the submit handler to your
       CRM / WhatsApp / email endpoint before going live. Right now it only shows a
       client-side message and nothing is sent. */
    document.getElementById("form").addEventListener("submit",e=>{
      e.preventDefault();
      document.getElementById("success").classList.remove("d-none");
    });
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
