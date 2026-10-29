;(function(){
const enquiryForm=document.querySelector('form[action^="mailto:"]');
if(enquiryForm){
  const submitButton=enquiryForm.querySelector('button[type="submit"]'),status=document.createElement("div");
  status.className="alert mt-3 d-none";status.setAttribute("role","status");enquiryForm.appendChild(status);
  enquiryForm.addEventListener("submit",async event=>{
    event.preventDefault();if(!enquiryForm.reportValidity())return;
    const values=new FormData(enquiryForm),original=submitButton.innerHTML;submitButton.disabled=true;submitButton.textContent="Sending…";status.className="alert mt-3 d-none";status.textContent="";
    try{
      const response=await window.ArshApi.post("enquiries",{name:values.get("Your Name"),email:values.get("Your Email"),phone:values.get("Phone Number"),subject:values.get("Subject"),message:values.get("Your Message")});
      status.className="alert alert-success mt-3";status.textContent=response.message||"Thank you. Your enquiry has been sent to our team.";enquiryForm.reset();
    }catch(error){status.className="alert alert-danger mt-3";status.textContent=error.message||"Your enquiry could not be sent. Please try again or call us.";}
    finally{submitButton.disabled=false;submitButton.innerHTML=original;}
  });
}
const menuBtn=document.getElementById("menuBtn");
const setDrawer=o=>{document.body.classList.toggle("drawer-open",o);menuBtn.setAttribute("aria-expanded",o)};
menuBtn.addEventListener("click",()=>setDrawer(!document.body.classList.contains("drawer-open")));
document.getElementById("drawerClose").addEventListener("click",()=>setDrawer(false));
document.getElementById("scrim").addEventListener("click",()=>setDrawer(false));
document.querySelectorAll("#drawer a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));
window.__arshRegisterEvent(document,"keydown",e=>{if(e.key==="Escape"){setDrawer(false);setSearch(false)}});
const searchBtn=document.getElementById("searchBtn"),searchModal=document.getElementById("searchModal"),searchInput=document.getElementById("searchInput");
function setSearch(open){searchModal.classList.toggle("open",open);searchBtn.setAttribute("aria-expanded",open);document.body.style.overflow=open?"hidden":"";if(open)searchInput.focus()}
searchBtn.addEventListener("click",()=>setSearch(true));
document.getElementById("searchClose").addEventListener("click",()=>setSearch(false));
searchModal.addEventListener("click",e=>{if(e.target===searchModal)setSearch(false)});
searchModal.querySelectorAll(".sm-chips button").forEach(b=>b.addEventListener("click",()=>{searchInput.value=b.textContent;searchInput.focus()}));
})();
