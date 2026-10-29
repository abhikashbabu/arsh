(function () {
  const runPage = function () {
    ;(function () {
    /* ============================================================
       CONFIG (dev: update before going live)
       - DEMO_MODE: true = payment is simulated, nothing is charged.
         Set to false once the real payment gateway is connected.
       - FEES: placeholder consultation fees per speciality. Replace with real fees.
       - PARTIAL_PCT: percentage payable now for "Partial payment".
       ============================================================ */
    const DEMO_MODE=true;
    const PARTIAL_PCT=50;
    const SPECS={
     "Orthopaedics & Spine":{fee:600,doctors:["Dr. Navneet Nishchal"]},
     "Cardiology":{fee:700,doctors:["Dr. Priya Sharma"]},
     "Neurology & Neurosurgery":{fee:700,doctors:["Dr. Amit Kumar"]},
     "Gastroenterology":{fee:600,doctors:["Dr. Rohan Mehta"]},
     "Obstetrics & Gynaecology":{fee:600,doctors:["Dr. Ritu Singh"]},
     "Paediatrics":{fee:500,doctors:["Dr. Neha Verma"]},
     "General Medicine":{fee:400,doctors:["Dr. Anil Kumar"]},
     "ENT":{fee:500,doctors:["Dr. Pankaj Singh"]}
    };
    /* OPD 9:00 AM to 6:00 PM, 30-minute slots (last slot 5:30 PM) */
    const SLOT_START=9*60,SLOT_END=18*60,SLOT_STEP=30;
    
    const $=id=>document.getElementById(id);
    const inr=n=>"\u20B9"+Number(n).toLocaleString("en-IN");
    const fmtDate=v=>v?new Date(v+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}):"-";
    const fmtTime=m=>{const h=Math.floor(m/60),mi=m%60,ap=h>=12?"PM":"AM",h12=h%12||12;return h12+":"+String(mi).padStart(2,"0")+" "+ap;};
    const esc=t=>String(t).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
    const pad=n=>String(n).padStart(2,"0");
    const today=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());};
    
    $("pctLbl").textContent=PARTIAL_PCT;
    if(DEMO_MODE)$("testNote").classList.remove("d-none");
    
    /* Specialities */
    const specSel=$("pSpec"),docSel=$("pDoc"),dateIn=$("pDate");
    Object.keys(SPECS).forEach(s=>{const o=document.createElement("option");o.value=s;o.textContent=s;specSel.appendChild(o);});
    specSel.addEventListener("change",()=>{
      docSel.innerHTML='<option value="">Any available doctor</option>';
      const s=SPECS[specSel.value];
      if(s){s.doctors.forEach(d=>{const o=document.createElement("option");o.value=d;o.textContent=d;docSel.appendChild(o);});docSel.disabled=false;}else docSel.disabled=true;
      update();
    });
    docSel.addEventListener("change",update);
    
    /* Date limits: today to +30 days */
    dateIn.min=today();
    const mx=new Date();mx.setDate(mx.getDate()+30);dateIn.max=mx.getFullYear()+"-"+pad(mx.getMonth()+1)+"-"+pad(mx.getDate());
    dateIn.addEventListener("change",()=>{renderSlots();update();});
    
    /* Time slots */
    function renderSlots(){
      const box=$("slotBox"),d=dateIn.value;
      if(!d){box.innerHTML='<div class="slot-hint"><i class="bi bi-info-circle me-1"></i>Select a date to see available time slots.</div>';return;}
      const now=new Date(),isToday=d===today(),nowMin=now.getHours()*60+now.getMinutes();
      const groups=[["Morning","bi-sunrise",SLOT_START,12*60],["Afternoon","bi-sun",12*60,16*60],["Evening","bi-sunset",16*60,SLOT_END]];
      let html="",any=false;
      groups.forEach(([name,ic,a,b])=>{
        let btns="";
        for(let m=a;m<b;m+=SLOT_STEP){
          const dis=isToday&&m<=nowMin+30;
          if(!dis)any=true;
          btns+=`<input type="radio" class="btn-check" name="slot" id="sl${m}" value="${m}" ${dis?"disabled":""} autocomplete="off"><label class="btn" for="sl${m}">${fmtTime(m)}</label>`;
        }
        html+=`<div class="slot-group"><h3><i class="bi ${ic}"></i>${name}</h3><div class="slots">${btns}</div></div>`;
      });
      box.innerHTML=any?html:'<div class="slot-hint"><i class="bi bi-info-circle me-1"></i>No slots left for today. Please choose another date.</div>';
      box.querySelectorAll("input[name=slot]").forEach(r=>r.addEventListener("change",()=>{$("slotErr").style.display="none";update();}));
    }
    
    /* Summary + amounts */
    const fee=()=>SPECS[specSel.value]?SPECS[specSel.value].fee:0;
    const payType=()=>document.querySelector("input[name=payType]:checked").value;
    const payNow=()=>payType()==="full"?fee():Math.round(fee()*PARTIAL_PCT/100);
    const slotVal=()=>{const r=document.querySelector("input[name=slot]:checked");return r?+r.value:null;};
    function update(){
      const f=fee(),pn=payNow(),sl=slotVal();
      $("amtFull").textContent=inr(f);$("amtPart").textContent=inr(Math.round(f*PARTIAL_PCT/100));
      $("sName").textContent=$("pName").value.trim()||"-";
      $("sSpec").textContent=specSel.value||"-";
      $("sDoc").textContent=docSel.value||(specSel.value?"Any available doctor":"-");
      $("sDate").textContent=fmtDate(dateIn.value);
      $("sTime").textContent=sl!==null?fmtTime(sl):"-";
      $("sFee").textContent=inr(f);$("sPay").textContent=inr(pn);
      $("sBal").textContent=f&&payType()==="partial"?`Balance ${inr(f-pn)} to be paid at the hospital.`:"";
      $("payBtn").innerHTML=`<i class="bi bi-lock-fill me-2"></i>Pay ${f?inr(pn)+" &amp; ":""}confirm appointment`;
    }
    ["pName"].forEach(id=>$(id).addEventListener("input",update));
    document.querySelectorAll("input[name=payType]").forEach(r=>r.addEventListener("change",update));
    $("pMobile").addEventListener("input",e=>{e.target.value=e.target.value.replace(/\D/g,"").slice(0,10);});
    update();
    
    /* Submit */
    const form=$("bookForm"),payModal=new bootstrap.Modal($("payModal"));
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const slotOk=slotVal()!==null;
      $("slotErr").style.display=slotOk?"none":"block";
      form.classList.add("was-validated");
      if(!form.checkValidity()||!slotOk){
        const bad=form.querySelector(":invalid")||$("slotBox");
        bad.scrollIntoView({behavior:"smooth",block:"center"});if(bad.focus)bad.focus({preventScroll:true});
        return;
      }
      const order={
        name:$("pName").value.trim(),mobile:$("pMobile").value,email:$("pEmail").value.trim(),
        gender:$("pGender").value,age:$("pAge").value,
        speciality:specSel.value,doctor:docSel.value||"Any available doctor",
        date:dateIn.value,slot:slotVal(),
        payType:payType(),fee:fee(),paid:payNow()
      };
      order.balance=order.fee-order.paid;
      startPayment(order).then(res=>{
        payModal.hide();
        const booking={...order,token:res.token,bookingId:res.bookingId,paymentId:res.paymentId,paidAt:res.paidAt};
        try{sessionStorage.setItem("arshBooking",JSON.stringify(booking));}catch(_){}
        showThanks(booking);
      }).catch(()=>{
        payModal.hide();
        alert("Payment was not completed. No appointment has been booked. Please try again.");
      });
    });
    
    /* ------------------------------------------------------------
       PAYMENT HOOK (dev: replace this function)
       Real flow:
       1. POST the order to your server -> server creates the payment order
          (Razorpay / PayU / etc.) and returns the order id.
       2. Open the gateway checkout with that order id.
       3. After payment, VERIFY the payment on the server, then save the booking
          and let the SERVER generate the token number and booking id.
       4. Resolve with { token, bookingId, paymentId, paidAt }.
       Never trust a client-side success message or a client-side token.
       The demo below only simulates this so the screens can be reviewed.
       ------------------------------------------------------------ */
    function startPayment(order){
      payModal.show();
      return new Promise(resolve=>{
        setTimeout(()=>{
          const key="arshToken_"+order.date;let n=1;
          try{n=(+localStorage.getItem(key)||0)+1;localStorage.setItem(key,n);}catch(_){n=Math.floor(Math.random()*40)+1;}
          const d=order.date.replace(/-/g,"").slice(2);
          resolve({token:"T-"+pad(n),bookingId:"ARSH-"+d+"-"+String(Math.floor(Math.random()*9000)+1000),paymentId:DEMO_MODE?"TEST-"+Date.now().toString(36).toUpperCase():"",paidAt:new Date().toISOString()});
        },1800);
      });
    }
    
    /* Thank-you view */
    function row(k,v){return `<div class="r"><span>${k}</span><span>${esc(v)}</span></div>`;}
    function showThanks(b){
      $("tyToken").textContent=b.token;
      $("tyMsg").textContent=`Booking ID: ${b.bookingId}`+(b.email?` \u00B7 A copy will be sent to ${b.email}`:"");
      $("dlPatient").innerHTML=row("Patient name",b.name)+row("Mobile","+91 "+b.mobile)+row("Email",b.email||"Not provided")+row("Gender",b.gender)+row("Age",b.age+" years");
      $("dlAppt").innerHTML=row("Speciality",b.speciality)+row("Doctor",b.doctor)+row("Date",fmtDate(b.date))+row("Time slot",fmtTime(b.slot))+row("Token number",b.token)+row("Booking ID",b.bookingId);
      $("dlPay").innerHTML=row("Payment type",b.payType==="full"?"Full payment":`Partial payment (${PARTIAL_PCT}%)`)+row("Consultation fee",inr(b.fee))+row("Amount paid",inr(b.paid))+row("Balance at hospital",inr(b.balance))+row("Payment ID",b.paymentId||"-")+row("Paid on",new Date(b.paidAt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}));
      $("bookView").classList.add("d-none");$("thanksView").classList.remove("d-none");
      window.scrollTo({top:0,behavior:"smooth"});
    }
    $("newBooking").addEventListener("click",()=>{
      try{sessionStorage.removeItem("arshBooking");}catch(_){}
      form.reset();form.classList.remove("was-validated");docSel.disabled=true;docSel.innerHTML='<option value="">Any available doctor</option>';
      renderSlots();update();
      $("thanksView").classList.add("d-none");$("bookView").classList.remove("d-none");
      window.scrollTo({top:0,behavior:"smooth"});
    });
    /* Keep the thank-you page after refresh */
    try{const saved=sessionStorage.getItem("arshBooking");if(saved)showThanks(JSON.parse(saved));}catch(_){}
    
    /* Mobile drawer */
    const menuBtn=$("menuBtn");
    const setDrawer=o=>{document.body.classList.toggle("drawer-open",o);menuBtn.setAttribute("aria-expanded",o)};
    menuBtn.addEventListener("click",()=>setDrawer(true));
    $("drawerClose").addEventListener("click",()=>setDrawer(false));
    $("scrim").addEventListener("click",()=>setDrawer(false));
    document.querySelectorAll("#drawer a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));
    window.__arshRegisterEvent(document, "keydown",e=>{if(e.key==="Escape")setDrawer(false)});
    
    /* Search modal */
    (()=>{
      const b=$("searchBtn"),m=$("searchModal"),i=$("searchInput");
      const set=o=>{m.classList.toggle("open",o);b.setAttribute("aria-expanded",o);document.body.style.overflow=o?"hidden":"";if(o)setTimeout(()=>i.focus(),30);};
      b.addEventListener("click",()=>set(true));
      $("searchClose").addEventListener("click",()=>set(false));
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
