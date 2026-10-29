;(function () {
const api=window.ArshApi,PER_PAGE=6;
const grid=document.getElementById("grid"),moreBtn=document.getElementById("more"),emptyEl=document.getElementById("empty"),countEl=document.getElementById("count"),featBox=document.getElementById("featBox"),qEl=document.getElementById("bq"),catsEl=document.getElementById("cats");
let category="",page=1,total=0,pageSize=PER_PAGE,loading=false,hasMore=false,requestId=0,knownCategories=new Set();
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dateLabel=value=>{const d=new Date(String(value||"").replace(" ","T"));return Number.isNaN(d.getTime())?"":d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});};
const readMins=post=>Math.max(1,Math.ceil(String(post.content_html||post.excerpt||"").replace(/<[^>]*>/g," ").split(/\s+/).filter(Boolean).length/180));
const meta=post=>`<div class="bmeta"><span><i class="bi bi-calendar3"></i>${esc(dateLabel(post.publish_date))}</span><span><i class="bi bi-clock"></i>${readMins(post)} min read</span></div>`;
const image=post=>post.main_image||"/images/blog-placeholder.svg";
const detailUrl=post=>`/blog-detail?slug=${encodeURIComponent(post.slug)}`;
const card=post=>`<div class="col"><article class="bcard in"><a class="ph" href="${detailUrl(post)}" tabindex="-1"><img src="${esc(image(post))}" alt="${esc(post.main_image_alt||post.title)}" loading="lazy"><span class="cat">${esc(post.category)}</span></a><div class="body">${meta(post)}<h3><a href="${detailUrl(post)}">${esc(post.title)}</a></h3><p>${esc(post.excerpt||"")}</p><a class="read" href="${detailUrl(post)}">Read more <i class="bi bi-arrow-right"></i></a></div></article></div>`;
const feature=post=>`<article class="feat in"><div class="row g-0"><div class="col-lg-6"><a class="ph" href="${detailUrl(post)}" tabindex="-1"><img src="${esc(image(post))}" alt="${esc(post.main_image_alt||post.title)}"><span class="cat">${esc(post.category)}</span></a></div><div class="col-lg-6"><div class="body"><div class="kicker">Latest article</div>${meta(post)}<h2><a href="${detailUrl(post)}">${esc(post.title)}</a></h2><p>${esc(post.excerpt||"")}</p><a class="btn btn-arsh" href="${detailUrl(post)}">Read article</a></div></div></div></article>`;
function renderCategories(){
  const values=["",...knownCategories];catsEl.innerHTML="";
  values.forEach(value=>{const button=document.createElement("button");button.type="button";button.textContent=value||"All";button.classList.toggle("on",value===category);button.addEventListener("click",()=>{category=value;reload();});catsEl.appendChild(button);});
}
async function loadPage(reset){
  if(loading)return;loading=true;const ticket=++requestId;
  if(reset){page=1;total=0;hasMore=false;grid.innerHTML="";featBox.innerHTML="";emptyEl.style.display="none";moreBtn.parentElement.style.display="none";}
  moreBtn.disabled=true;moreBtn.textContent="Loading…";
  try{
    const response=await api.get("blogs",{q:qEl.value.trim(),category,page,per_page:PER_PAGE});
    if(ticket!==requestId)return;
    const posts=Array.isArray(response.data)?response.data:[];
    posts.forEach(post=>{if(post.category)knownCategories.add(post.category);});renderCategories();
    total=Number(response.meta?.total??posts.length);pageSize=Number(response.meta?.per_page)||PER_PAGE;
    if(page===1&&!qEl.value.trim()&&!category&&posts.length)featBox.innerHTML=feature(posts[0]);
    const visible=page===1&&!qEl.value.trim()&&!category?posts.slice(1):posts;
    grid.insertAdjacentHTML("beforeend",visible.map(card).join(""));
    hasMore=page*pageSize<total;page++;
    emptyEl.style.display=total?"none":"block";
    countEl.textContent=total?`Showing ${Math.min((page-1)*pageSize,total)} of ${total} articles`:"";
    moreBtn.parentElement.style.display=hasMore?"block":"none";
  }catch(error){if(ticket===requestId){emptyEl.textContent=error?.message||"Articles could not be loaded. Please try again.";emptyEl.style.display="block";}}
  finally{if(ticket===requestId){loading=false;moreBtn.disabled=false;moreBtn.innerHTML='Load more articles <i class="bi bi-arrow-down ms-1"></i>';}}
}
function reload(){requestId++;loading=false;loadPage(true);}
moreBtn.addEventListener("click",()=>loadPage(false));
let timer;qEl.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(reload,300);});
document.getElementById("reset").addEventListener("click",()=>{qEl.value="";category="";reload();});
const params=new URLSearchParams(location.search);if(params.get("q"))qEl.value=params.get("q");if(params.get("cat"))category=params.get("cat");
reload();
})();
