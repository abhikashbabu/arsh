"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import homePage from "@/content/home.json";

type Doctor = {
  id: string | number;
  slug: string;
  name: string;
  speciality?: string;
  speciality_id?: string | number;
  qualification?: string;
  experience?: number | string;
  status?: string;
  photo_url?: string | null;
  floor?: string;
  description?: string;
  fees?: Record<string, number>;
};

type ApiDetailPageProps = { kind: "doctor" | "speciality"; slug: string };

const SPECIALITY_COPY: Record<string, { title: string; description: string; services: string[] }> = {
  "3": { title: "Orthopaedics & Spine", description: "Care for bone, joint, muscle and spine conditions, from injuries to planned treatment.", services: ["Joint replacement", "Trauma and fracture care", "Spine and sports injury care"] },
  "1": { title: "Cardiology", description: "Heart assessment, treatment and follow-up with support from the hospital's cardiac team.", services: ["ECG, Echo and TMT", "Angiography and angioplasty", "Heart emergency care"] },
  "4": { title: "Neurology & Neurosurgery", description: "Diagnosis and treatment for conditions affecting the brain, spine and nerves.", services: ["Stroke and paralysis care", "Seizure and headache care", "Brain and spine surgery"] },
  "15": { title: "Gastroenterology", description: "Care for digestive, liver and pancreatic conditions with endoscopy services.", services: ["Endoscopy and colonoscopy", "Liver and gallbladder care", "Digestive disorders"] },
  "2": { title: "Gynaecology", description: "Women's health services, including pregnancy care and gynaecological treatment.", services: ["Pregnancy consultations", "Menstrual and hormonal care", "Gynaecological procedures"] },
  "6": { title: "Paediatrics", description: "Medical care for newborns, children and adolescents, with family-focused support.", services: ["Newborn and child care", "Vaccination", "Growth and nutrition"] },
  "8": { title: "General Medicine", description: "First point of care for common illnesses, long-term conditions and preventive check-ups.", services: ["Fever and infection care", "Diabetes and thyroid care", "Preventive health checks"] },
  "16": { title: "Critical Care", description: "Round-the-clock hospital care for patients who need urgent treatment and close monitoring.", services: ["ICU and HDU support", "Emergency stabilisation", "Continuous patient monitoring"] },
};

export function ApiDetailPage({ kind, slug }: ApiDetailPageProps) {
  const [item, setItem] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/ci4/${kind === "doctor" ? `doctors/${encodeURIComponent(slug)}` : "specialities"}`, { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || payload?.ok === false) throw new Error(payload?.errors?.join(" ") || "Could not load this page.");
        const found = kind === "doctor" ? payload.data : (payload.data || []).find((speciality: Doctor) => speciality.slug === slug);
        if (!found) throw new Error("This page could not be found.");
        if (!active) return;
        setItem(found);
        if (kind === "speciality") {
          const doctorResponse = await fetch(`/api/ci4/doctors?speciality_id=${encodeURIComponent(String(found.id))}&per_page=100&page=1`, { cache: "no-store" });
          const doctorPayload = await doctorResponse.json();
          if (doctorResponse.ok && doctorPayload?.ok !== false && active) setDoctors(Array.isArray(doctorPayload.data) ? doctorPayload.data : []);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load this page.");
      }
    }
    load();
    return () => { active = false; };
  }, [kind, slug]);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", menuOpen);
    return () => document.body.classList.remove("drawer-open");
  }, [menuOpen]);

  const specialityCopy = item ? SPECIALITY_COPY[String(item.id)] : undefined;
  const title = (kind === "speciality" ? specialityCopy?.title : item?.name) || item?.name || item?.speciality || "ARSH Hospital";
  return (
    <div style={{ minHeight: "100vh", color: "#17324b", background: "#f7fbfe", fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: homePage.css }} />
      <div className="topbar d-none d-lg-block"><div className="wrap d-flex justify-content-between py-2"><span><i className="bi bi-geo-alt me-1" />Gaya, Bihar</span><span><i className="bi bi-clock me-1" />OPD 9 AM - 6 PM &nbsp;|&nbsp; <i className="bi bi-telephone me-1" />Emergency 24x7: <a href="tel:+917321831111">+91 73218 31111</a></span></div></div>
      <header className="site-header"><div className="wrap">
        <Link className="logo" href="/"><img src="https://arshhospitals.com/wp-content/uploads/2021/12/Arsh-Logo-png-2-e1639235875839.png" alt="ARSH Super Speciality Hospital" /></Link>
        <nav className="main-nav" aria-label="Main"><Link href="/">Home</Link><Link href="/about">About</Link><Link href="/specialities">Specialities</Link><Link href="/doctors">Doctors</Link><Link href="/facilities">Facilities</Link><Link href="/patient-stories">Patient Stories</Link><Link href="/contact">Contact</Link></nav>
        <Link className="search-btn" href="/search" aria-label="Search"><i className="bi bi-search" /></Link>
        <Link className="btn btn-arsh header-cta" href="/book-appointment"><i className="bi bi-calendar2-check me-1" />Book Appointment</Link>
        <button className="menu-btn" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><i className="bi bi-list" /></button>
      </div></header>
      {menuOpen && <><button className="scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} /><aside className="drawer"><nav className="drawer-links"><Link href="/">Home</Link><Link href="/about">About</Link><Link href="/specialities">Specialities</Link><Link href="/doctors">Doctors</Link><Link href="/facilities">Facilities</Link><Link href="/contact">Contact</Link></nav><Link className="btn btn-arsh w-100" href="/book-appointment">Book Appointment</Link></aside></>}
      <main className="container py-5">
        <div className="text-secondary small mb-3"><Link href="/">Home</Link> / {kind === "doctor" ? <Link href="/doctors">Doctors</Link> : <Link href="/specialities">Specialities</Link>} / {title}</div>
        {error ? <div className="alert alert-warning">{error}</div> : !item ? <div className="py-5 text-center"><span className="spinner-border text-primary" aria-label="Loading" /></div> : (
          <>
            <section className="rounded-4 p-4 p-lg-5 mb-4" style={{ color: "white", background: "linear-gradient(120deg,#075c91,#1187b5)" }}>
              <div className="row align-items-center g-4">
                {kind === "doctor" && <div className="col-auto"><img src={item.photo_url || "/images/doctor-placeholder.svg"} alt={title} width="150" height="150" style={{ objectFit: "cover", borderRadius: "50%", border: "4px solid #ffffff88", background: "white" }} /></div>}
                <div className="col"><div className="text-uppercase small fw-bold mb-2">{kind === "doctor" ? item.speciality || "ARSH Specialist" : "ARSH Speciality"}</div><h1 className="display-5 fw-bold">{title}</h1>
                  {kind === "doctor" ? <><p className="lead mb-2">{item.qualification || "Consultant"}</p><p className="mb-0">{item.experience ? `${item.experience} years of experience` : item.status || "Appointments available"}</p></> : <p className="lead mb-0">{item.description || specialityCopy?.description || `Meet the doctors available for ${title} at ARSH Hospital.`}{item.floor ? ` · ${item.floor} floor` : ""}</p>}
                </div>
                <div className="col-12 col-lg-auto"><Link className="btn btn-light btn-lg" href={`/book-appointment?${kind === "doctor" ? `doctor=${encodeURIComponent(String(item.id))}&speciality_id=${encodeURIComponent(String(item.speciality_id || ""))}` : `speciality_id=${encodeURIComponent(String(item.id))}`}`}>Book an appointment</Link></div>
              </div>
            </section>
            {kind === "doctor" ? (
              <div className="row g-4">
                <section className="col-lg-7"><div className="bg-white rounded-4 p-4 h-100"><h2 className="h4">Doctor information</h2><dl className="row mb-0"><dt className="col-sm-4">Speciality</dt><dd className="col-sm-8">{item.speciality || "-"}</dd><dt className="col-sm-4">Qualification</dt><dd className="col-sm-8">{item.qualification || "-"}</dd><dt className="col-sm-4">Experience</dt><dd className="col-sm-8">{item.experience ? `${item.experience} years` : "-"}</dd><dt className="col-sm-4">Status</dt><dd className="col-sm-8">{item.status || "Contact hospital"}</dd></dl></div></section>
                <section className="col-lg-5"><div className="bg-white rounded-4 p-4 h-100"><h2 className="h4">Consultation fees</h2>{Object.entries(item.fees || {}).map(([name, fee]) => <div className="d-flex justify-content-between border-bottom py-2" key={name}><span className="text-capitalize">{name.replace(/_/g, " ")}</span><strong>₹{Number(fee).toLocaleString("en-IN")}</strong></div>)}{item.fees && Object.keys(item.fees).length === 0 && <p>Contact the hospital for fee information.</p>}</div></section>
              </div>
            ) : (
              <section className="bg-white rounded-4 p-4"><h2 className="h3 mb-3">Care available in {title}</h2>{specialityCopy && <ul className="row list-unstyled g-2 mb-4">{specialityCopy.services.map(service => <li className="col-md-4" key={service}><span className="d-block border rounded-3 p-3"><i className="bi bi-check-circle-fill text-success me-2" />{service}</span></li>)}</ul>}<h2 className="h3 mb-4">Doctors in {title}</h2>{doctors.length ? <div className="row g-3">{doctors.map(doctor => <div className="col-md-6 col-xl-4" key={doctor.id}><article className="border rounded-4 p-3 h-100 d-flex gap-3 align-items-center"><img src={doctor.photo_url || "/images/doctor-placeholder.svg"} alt="" width="64" height="64" style={{ objectFit: "cover", borderRadius: "50%" }} /><div><h3 className="h6 mb-1">{doctor.name}</h3><p className="small text-secondary mb-2">{doctor.qualification || doctor.speciality}</p><Link href={`/doctors/${encodeURIComponent(doctor.slug)}`}>View profile</Link></div></article></div>)}</div> : <p className="text-secondary">No doctors are listed for this speciality yet. Contact our team to find the right care.</p>}</section>
            )}
          </>
        )}
      </main>
      <footer><div className="wrap"><div className="row g-4"><div className="col-lg-5"><h6>ARSH Super Speciality Hospital</h6><p>165-bed tertiary care hospital serving Gaya, Bodhgaya and the Magadh region.</p></div><div className="col-6 col-lg-2 fl"><h6>Explore</h6><Link href="/about">About</Link><Link href="/specialities">Specialities</Link><Link href="/doctors">Doctors</Link><Link href="/news-media">News &amp; Media</Link><Link href="/blog">Health Blog</Link></div><div className="col-6 col-lg-2 fl"><h6>Patient care</h6><Link href="/book-appointment">Appointments</Link><Link href="/international-patients">International Patients</Link><Link href="/patient-stories">Patient videos</Link></div><div className="col-lg-3"><h6>Contact</h6><div className="fi"><i className="bi bi-geo-alt" />Gaya, Bihar</div><div className="fi"><i className="bi bi-telephone" />+91 73218 31111</div><div className="fi"><i className="bi bi-envelope" />info@arshhospitals.com</div><div className="fi"><i className="bi bi-clock" />OPD 9 AM - 6 PM</div></div></div><div className="copy"><span>© ARSH Super Speciality Hospital. All rights reserved.</span><span>Powered by <a href="https://thebsocial.in/" target="_blank" rel="noopener">TheBsocial</a></span></div></div></footer>
    </div>
  );
}
