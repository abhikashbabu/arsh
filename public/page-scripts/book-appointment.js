(function () {
const api=window.ArshApi,$=id=>document.getElementById(id),esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const inr=value=>"₹"+Number(value||0).toLocaleString("en-IN"),pad=value=>String(value).padStart(2,"0");
const today=()=>{const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;};
const formatDate=value=>value?new Date(value+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}):"-";
const formatTime=value=>{const [hour,minute]=String(value||"").split(":").map(Number),date=new Date();date.setHours(hour||0,minute||0,0,0);return date.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"});};
const specSel=$("pSpec"),docSel=$("pDoc"),dateInput=$("pDate"),form=$("bookForm"),typeSelect=document.createElement("select");
docSel.required=true;
const doctorLabel=document.querySelector('label[for="pDoc"]');if(doctorLabel)doctorLabel.innerHTML="Doctor";
let specialities=[],doctors=[],slots=[],hospitalConfig={payment_method:"pay_at_hospital",max_advance_days:90},selectedSlot="",currentBooking=null;

// The CI4 booking contract accepts a visit type and payment_method=pay_at_hospital.
const paymentCard=form.querySelector('input[name="payType"]')?.closest(".fcard");
if(paymentCard){
  paymentCard.querySelector(".fhead h2").textContent="Consultation option";
  paymentCard.querySelector(".fhead small").textContent="Consultation charges are paid at the hospital.";
  typeSelect.id="apptType";typeSelect.className="form-select";typeSelect.required=true;
  typeSelect.innerHTML='<option value="normal">Standard consultation</option>';
  const row=paymentCard.querySelector(".row");row.innerHTML='<div class="col-md-8"><label class="form-label" for="apptType">Visit type</label></div><div class="col-md-8"></div>';
  row.children[0].appendChild(typeSelect);row.children[1].innerHTML='<div class="pay-box"><span class="radio-dot"></span><span><b>Pay at hospital</b><span class="d">Pay the consultation fee at reception.</span><span class="amt" id="amtFull">₹0</span></span></div>';
}
const summaryCard=$("payBtn").closest(".sum-card");
summaryCard.querySelector(".test-note")?.remove();
summaryCard.querySelector(".sum-total span").textContent="Payment method";
$("sPay").textContent="Pay at hospital";$("sBal").textContent="";
$("payBtn").innerHTML='<i class="bi bi-calendar2-check me-2"></i>Request appointment';
summaryCard.querySelector(".secure").innerHTML='<i class="bi bi-shield-check"></i>Appointment details are sent securely';
document.querySelector(".page-hero p").textContent="Choose your doctor, check live availability and request an appointment. Pay the consultation fee at the hospital.";
const processingModal=$("payModal");if(processingModal){processingModal.querySelector("h2").textContent="Submitting appointment";processingModal.querySelector("p").textContent="Please wait while we save your request.";}

function selectedDoctor(){return doctors.find(doctor=>String(doctor.id)===docSel.value);}
function selectedFee(){const doctor=selectedDoctor(),type=typeSelect.value;return Number(doctor?.fees?.[type]??doctor?.fees?.normal??0);}
function slotValue(){return selectedSlot;}
function updateSummary(){
  const doctor=selectedDoctor(),slot=slotValue();
  $("sName").textContent=$("pName").value.trim()||"-";
  $("sSpec").textContent=specialities.find(s=>String(s.id)===specSel.value)?.name||"-";
  $("sDoc").textContent=doctor?.name||"-";$("sDate").textContent=formatDate(dateInput.value);$("sTime").textContent=slot?formatTime(slot):"-";
  $("sFee").textContent=inr(selectedFee());$("sPay").textContent="Pay at hospital";$("amtFull").textContent=inr(selectedFee());
}
function renderSlots(){
  const box=$("slotBox");selectedSlot="";updateSummary();
  if(!dateInput.value){box.innerHTML='<div class="slot-hint"><i class="bi bi-info-circle me-1"></i>Select a doctor and date to see live availability.</div>';return;}
  if(!docSel.value){box.innerHTML='<div class="slot-hint"><i class="bi bi-info-circle me-1"></i>Select a doctor first to see available times.</div>';return;}
  box.innerHTML='<div class="slot-hint"><span class="spinner-border spinner-border-sm me-2"></span>Checking available times…</div>';
  api.get("appointments/availability",{doctor_id:docSel.value,date:dateInput.value}).then(response=>{
    slots=Array.isArray(response.data?.slots)?response.data.slots:[];
    if(!slots.length){box.innerHTML='<div class="slot-hint">No appointments are available for this doctor and date. Choose another date.</div>';return;}
    box.innerHTML=`<div class="slot-group"><h3><i class="bi bi-clock"></i>Available times</h3><div class="slots">${slots.map((slot,index)=>{const value=slot.start||slot.time||"",disabled=Number(slot.remaining??1)<=0,id=`slot-${index}-${value.replace(/\W/g,"")}`;return `<input type="radio" class="btn-check" name="slot" id="${id}" value="${esc(value)}" ${disabled?"disabled":""} autocomplete="off"><label class="btn" for="${id}">${esc(formatTime(value))}</label>`;}).join("")}</div></div>`;
    box.querySelectorAll('input[name="slot"]').forEach(radio=>radio.addEventListener("change",()=>{selectedSlot=radio.value;$("slotErr").style.display="none";updateSummary();}));
  }).catch(error=>{box.innerHTML=`<div class="slot-hint text-danger">${esc(error.message||"Could not load availability. Try again.")}</div>`;});
}
async function loadDoctors(){
  docSel.disabled=true;docSel.innerHTML='<option value="">Loading doctors…</option>';doctors=[];
  const response=await api.get("doctors",{speciality_id:specSel.value,per_page:12,page:1});
  doctors=Array.isArray(response.data)?response.data:[];
  const pageSize=Number(response.meta?.per_page)||12,total=Number(response.meta?.total)||doctors.length;
  for(let nextPage=2;doctors.length<total;nextPage++){
    const next=await api.get("doctors",{speciality_id:specSel.value,per_page:pageSize,page:nextPage});
    const items=Array.isArray(next.data)?next.data:[];if(!items.length)break;doctors.push(...items);
  }
  const selectedId=new URLSearchParams(location.search).get("doctor");
  docSel.innerHTML='<option value="">Select a doctor</option>'+doctors.map(doctor=>`<option value="${esc(doctor.id)}">${esc(doctor.name)}${doctor.status?` — ${esc(doctor.status)}`:""}</option>`).join("");
  if(selectedId&&doctors.some(doctor=>String(doctor.id)===selectedId))docSel.value=selectedId;
  docSel.disabled=false;
  const keys=[...new Set(doctors.flatMap(doctor=>Object.keys(doctor.fees||{})))];
  const options=keys.length?keys:["normal"];
  typeSelect.innerHTML=options.map(key=>`<option value="${esc(key)}">${esc(key.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()))}</option>`).join("");
  updateSummary();
}

specSel.addEventListener("change",async()=>{docSel.value="";dateInput.value="";renderSlots();try{await loadDoctors();}catch(error){docSel.innerHTML='<option value="">Doctors could not be loaded</option>';docSel.disabled=true;}});
docSel.addEventListener("change",()=>{renderSlots();updateSummary();});
dateInput.addEventListener("change",renderSlots);typeSelect.addEventListener("change",updateSummary);
["pName","pMobile","pAge","pGender"].forEach(id=>$(id).addEventListener("input",updateSummary));
$("pMobile").addEventListener("input",event=>{event.target.value=event.target.value.replace(/\D/g,"").slice(0,10);});
dateInput.min=today();

function messageBox(text,isError){let box=$("bookingMessage");if(!box){box=document.createElement("div");box.id="bookingMessage";box.setAttribute("role","status");form.prepend(box);}box.className=`alert ${isError?"alert-danger":"alert-success"} mb-3`;box.textContent=text;box.scrollIntoView({behavior:"smooth",block:"center"});}
function row(label,value){return `<div class="r"><span>${esc(label)}</span><span>${esc(value||"-")}</span></div>`;}
function showThanks(response,request){
  const data=response.data||response,bookingId=data.booking_id||data.bookingId||data.appointment_id||data.id||"Request received",token=data.token_number||data.token||data.token_no||"Assigned by reception";
  currentBooking={...request,...data,booking_id:bookingId,token_number:token};
  $("tyToken").textContent=token;$("tyMsg").textContent=`Appointment reference: ${bookingId}. Our team will contact you to confirm the request.`;
  $("dlPatient").innerHTML=row("Patient name",request.name)+row("Mobile","+91 "+request.phone)+row("Gender",request.gender)+row("Age",request.age+" years");
  $("dlAppt").innerHTML=row("Speciality",specialities.find(s=>String(s.id)===String(request.speciality_id))?.name)+row("Doctor",selectedDoctor()?.name)+row("Date",formatDate(request.date))+row("Time slot",formatTime(request.start))+row("Visit type",request.type)+row("Appointment reference",bookingId);
  $("dlPay").innerHTML=row("Payment method","Pay at hospital")+row("Consultation fee",inr(selectedFee()));
  $("thanksView").classList.remove("d-none");$("bookView").classList.add("d-none");window.scrollTo({top:0,behavior:"smooth"});
}
form.addEventListener("submit",async event=>{
  event.preventDefault();
  $("slotErr").style.display=selectedSlot?"none":"block";
  form.classList.add("was-validated");
  if(!form.checkValidity()||!selectedSlot){const invalid=form.querySelector(":invalid")||$("slotBox");invalid.scrollIntoView({behavior:"smooth",block:"center"});invalid.focus?.({preventScroll:true});return;}
  const doctor=selectedDoctor();if(!doctor){messageBox("Choose a doctor before requesting an appointment.",true);return;}
  const email=$("pEmail").value.trim();
  const request={doctor_id:Number(doctor.id),date:dateInput.value,start:selectedSlot,name:$("pName").value.trim(),...(email?{email}:{}),phone:$("pMobile").value.trim(),age:Number($("pAge").value),gender:$("pGender").value,type:typeSelect.value||"normal",consent:$("consent").checked,payment_method:hospitalConfig.payment_method||"pay_at_hospital"};
  const button=$("payBtn"),old=button.innerHTML;button.disabled=true;button.innerHTML='<span class="spinner-border spinner-border-sm me-2"></span>Sending appointment…';$("bookingMessage")?.remove();
  try{const response=await api.post("appointments",request);showThanks(response,request);}
  catch(error){messageBox(error.message||"Appointment could not be saved. Please try again or call the hospital.",true);}
  finally{button.disabled=false;button.innerHTML=old;}
});
$("newBooking").addEventListener("click",()=>{currentBooking=null;form.reset();form.classList.remove("was-validated");$("bookingMessage")?.remove();specSel.value="";docSel.disabled=true;docSel.innerHTML='<option value="">Choose a speciality first</option>';dateInput.min=today();dateInput.value="";renderSlots();updateSummary();$("thanksView").classList.add("d-none");$("bookView").classList.remove("d-none");window.scrollTo({top:0,behavior:"smooth"});});

async function init(){
  try{
    const [specResponse,homeResponse]=await Promise.all([api.get("specialities"),api.get("home")]);
    specialities=Array.isArray(specResponse.data)?specResponse.data:[];hospitalConfig=homeResponse.data?.booking||hospitalConfig;
    const query=new URLSearchParams(location.search),requestedSpec=query.get("speciality_id");
    specSel.innerHTML='<option value="">Select speciality</option>'+specialities.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
    if(requestedSpec&&specialities.some(s=>String(s.id)===requestedSpec)){specSel.value=requestedSpec;await loadDoctors();}
    const maxDate=new Date();maxDate.setDate(maxDate.getDate()+Number(hospitalConfig.max_advance_days||90));dateInput.max=`${maxDate.getFullYear()}-${pad(maxDate.getMonth()+1)}-${pad(maxDate.getDate())}`;
  }catch(error){messageBox(error.message||"Appointment information could not be loaded.",true);}
  updateSummary();renderSlots();
}
init();

const menuBtn=$("menuBtn"),setDrawer=open=>{document.body.classList.toggle("drawer-open",open);menuBtn.setAttribute("aria-expanded",String(open));};
menuBtn.addEventListener("click",()=>setDrawer(true));$("drawerClose").addEventListener("click",()=>setDrawer(false));$("scrim").addEventListener("click",()=>setDrawer(false));document.querySelectorAll("#drawer a").forEach(anchor=>anchor.addEventListener("click",()=>setDrawer(false)));
(()=>{const button=$("searchBtn"),modal=$("searchModal"),input=$("searchInput");const set=open=>{modal.classList.toggle("open",open);button.setAttribute("aria-expanded",String(open));document.body.style.overflow=open?"hidden":"";if(open)setTimeout(()=>input.focus(),30);};button.addEventListener("click",()=>set(true));$("searchClose").addEventListener("click",()=>set(false));modal.addEventListener("click",event=>{if(event.target===modal)set(false);});window.__arshRegisterEvent(document,"keydown",event=>{if(event.key==="Escape"){set(false);setDrawer(false);}});})();
})();
