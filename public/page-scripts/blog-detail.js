;(function () {
const article=document.querySelector("main article.col-lg-10"),slug=new URLSearchParams(location.search).get("slug");
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function safeArticleHtml(html){
  const doc=new DOMParser().parseFromString(`<div>${html||""}</div>`,"text/html"),allowed=new Set(["P","H2","H3","H4","STRONG","B","EM","I","UL","OL","LI","BLOCKQUOTE","BR","A"]);
  const clean=node=>{[...node.children].forEach(child=>{if(!allowed.has(child.tagName)){child.replaceWith(document.createTextNode(child.textContent||""));return;}[...child.attributes].forEach(attr=>{if(child.tagName!=="A"||attr.name!=="href")child.removeAttribute(attr.name);});if(child.tagName==="A"){const href=child.getAttribute("href")||"";if(!/^(https?:|mailto:|tel:)/i.test(href))child.removeAttribute("href");else{child.setAttribute("rel","noopener noreferrer");if(/^https?:/i.test(href))child.setAttribute("target","_blank");}}clean(child);});};
  const root=doc.body.firstElementChild;if(root)clean(root);return root?.innerHTML||"";
}
if(slug&&article){
  window.ArshApi.get(`blogs/${encodeURIComponent(slug)}`).then(response=>{
    const post=response.data||{},title=article.querySelector(".post-title"),category=article.querySelector(".post-cat"),meta=article.querySelector(".post-meta"),image=article.querySelector(".post-hero"),body=article.querySelector(".post-body");
    title.textContent=post.title||"Article";document.title=`${post.seo_title||post.title||"Article"} | ARSH Hospital`;
    category.textContent=post.category||"Health";category.href=`/blog?cat=${encodeURIComponent(post.category||"")}`;
    image.src=post.main_image||"/images/blog-placeholder.svg";image.alt=post.main_image_alt||post.title||"Hospital health article";
    const date=new Date(String(post.publish_date||"").replace(" ","T")),dateText=Number.isNaN(date.getTime())?"":date.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
    const words=String(post.content_html||"").replace(/<[^>]*>/g," ").split(/\s+/).filter(Boolean).length,mins=Math.max(1,Math.ceil(words/180));
    meta.innerHTML=`<span><i class="bi bi-calendar3"></i>${esc(dateText)}</span><span><i class="bi bi-clock"></i>${mins} min read</span>`;
    body.innerHTML=safeArticleHtml(post.content_html);
  }).catch(error=>{article.querySelector(".post-title").textContent="Article unavailable";article.querySelector(".post-body").textContent=error.message||"This article could not be loaded.";});
}
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
  window.__arshRegisterEvent(document, "keydown",e=>{if(e.key==="Escape"){set(false);setDrawer(false);}});
})();


/* Reading progress */
const prog=document.getElementById("prog");
window.__arshRegisterEvent(window, "scroll",()=>{const h=document.documentElement;const m=h.scrollHeight-h.clientHeight;prog.style.width=(m>0?h.scrollTop/m*100:0)+"%";},{passive:true});
/* Share links */
const u=encodeURIComponent(location.href),tt=encodeURIComponent(document.title);
document.getElementById("shFb").href="https://www.facebook.com/sharer/sharer.php?u="+u;
document.getElementById("shX").href="https://twitter.com/intent/tweet?url="+u+"&text="+tt;
document.getElementById("shWa").href="https://wa.me/?text="+tt+"%20"+u;
document.getElementById("shCopy").addEventListener("click",()=>{
  const ok=()=>{const c=document.getElementById("copied");c.style.display="inline";setTimeout(()=>c.style.display="none",1800);};
  if(navigator.clipboard)navigator.clipboard.writeText(location.href).then(ok);
});
})();
