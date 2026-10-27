"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Carousel } from "../components/Carousel";
import { Doctor, HomeData, normalizeImageUrl, Speciality } from "../lib/api";
import { hospital, images } from "../lib/content";

const fallbackSpecialities: Speciality[] = [
  "Orthopaedics & Spine", "Cardiology", "Neurology & Neurosurgery", "Gastroenterology",
  "Obstetrics & Gynaecology", "Paediatrics", "General Medicine", "ENT",
].map((name, index) => ({ id: index + 1, slug: name.toLowerCase().replaceAll(" ", "-"), name }));

const fallbackDoctors: Doctor[] = [
  ["Dr. Navneet Nishchal", "Orthopaedics & Joint Replacement", "15+ Years Experience"],
  ["Dr. Priya Sharma", "Cardiology", "12+ Years Experience"],
  ["Dr. Amit Kumar", "Neurology", "10+ Years Experience"],
  ["Dr. Ritu Singh", "Obstetrics & Gynaecology", "14+ Years Experience"],
].map(([name, speciality, experience_label], index) => ({
  id: index + 1,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  name,
  speciality,
  speciality_id: index + 1,
  experience_label,
  photo_url: images.doctors[index],
}));

const specialityIcons = ["⌁", "♥", "◉", "◌", "♙", "●", "⚕", "◒"];
const actionIcons: Record<string, string> = { appointment: "▣", doctor: "♙", emergency: "✚", facility: "⌂" };

function imageOrFallback(value: string | undefined, fallback: string) {
  return normalizeImageUrl(value) || fallback;
}

export function HomePageClient({ home }: { home: HomeData | null }) {
  const specialities = home?.specialities?.length ? home.specialities : fallbackSpecialities;
  const doctors = home?.doctors?.length ? home.doctors : fallbackDoctors;
  const facilities = home?.facilities ?? [];
  const patients = home?.patient_stories ?? [];
  const updates = home?.updates ?? [];
  const [speciality, setSpeciality] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const filteredDoctors = useMemo(() => doctors.filter(doctor => {
    const matchesSpeciality = !speciality || doctor.speciality === speciality;
    const matchesSearch = !search || doctor.name.toLowerCase().includes(search.toLowerCase());
    return matchesSpeciality && matchesSearch;
  }), [doctors, search, speciality]);

  const hero = home?.hero;
  const emergency = home?.emergency;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth" });
  };

  return <main id="home">
    <section className="hero"><div className="container hero-inner"><div className="hero-copy"><div className="eyebrow">{hero?.eyebrow ?? "CARE TODAY FOR A BRIGHTER TOMORROW"}</div><h1>{hero?.title ?? "Expert Care"} <span>{hero?.title_highlight ?? "Closer to You"}</span></h1><p>{hero?.description ?? "Advanced technology. Experienced specialists. A healthier tomorrow for you and your family."}</p><div className="hero-actions"><Link className="hero-button red" href="#find-doctor">▣ &nbsp; Book an Appointment →</Link><Link className="hero-button white" href="#find-doctor">♙ &nbsp; Find a Doctor →</Link></div></div><div className="hero-photo"><img src={imageOrFallback(hero?.image, images.hero)} alt={hero?.image_alt ?? "Doctor providing care"} /><div className="healing">{(hero?.badge ?? "Healing\nLives\nTogether").split("\n").map(line => <span key={line}>{line}<br /></span>)}</div></div></div></section>

    <section className="quick"><div className="container quick-grid">{(home?.quick_actions ?? [
      { key: "appointment", title: "Book an Appointment", subtitle: "Schedule your visit easily", target: "#find-doctor" },
      { key: "doctor", title: "Find a Doctor", subtitle: "Expert care for you", target: "#find-doctor" },
      { key: "emergency", title: "Emergency Care", subtitle: "24×7 trauma support", target: "#emergency" },
      { key: "facility", title: "Our Facilities", subtitle: "Cath Lab, ICU, OT & more", target: "#facilities" },
    ]).map(action => <Link className="quick-card" href={action.target} key={action.key}><div className="q-icon">{actionIcons[action.key] ?? "✚"}</div><div><div className="q-title">{action.title}</div><div className="q-sub">{action.subtitle}</div></div><span className="q-arrow">→</span></Link>)}</div></section>

    <section className="find" id="find-doctor"><div className="container"><div className="find-box"><div className="find-intro"><div className="find-icon">⌕</div><div><h2>{home?.find_doctor.title ?? "Find the Right Care for You"}</h2><p>{home?.find_doctor.description ?? "Choose a speciality and doctor to book an appointment."}</p></div></div><form className="find-form" onSubmit={submit}><div className="field"><label>Choose Speciality</label><select value={speciality} onChange={event => { setSpeciality(event.target.value); setDoctorId(""); }}><option value="">Select Speciality</option>{specialities.map(item => <option value={item.name} key={item.id}>{item.name}</option>)}</select></div><div className="field"><label>Choose Doctor</label><select value={doctorId} onChange={event => setDoctorId(event.target.value)}><option value="">Select Doctor</option>{doctors.filter(doctor => !speciality || doctor.speciality === speciality).map(doctor => <option value={String(doctor.id)} key={doctor.id}>{doctor.name}</option>)}</select></div><div className="field"><label>Search Doctor (Optional)</label><input value={search} onChange={event => setSearch(event.target.value)} placeholder="⌕  Search by name" /></div><button className="find-search" type="submit">Search</button></form>{submitted && <p className="success-message">{filteredDoctors.length ? `Showing ${filteredDoctors.length} available doctor${filteredDoctors.length === 1 ? "" : "s"}.` : "No matching doctor found. Please call the hospital team."}</p>}</div></div></section>

    <section className="section" id="about"><div className="container spec-wrap" id="specialities"><div className="spec-intro"><div className="kicker">Our Specialities</div><h2 className="title">Comprehensive Care<br />for Every Need</h2><Link className="view-btn" href="#specialities">View All Specialities →</Link></div><Carousel className="spec-carousel">{specialities.map((item, index) => <div className="spec" key={item.id}><div className="spec-icon">{specialityIcons[index % specialityIcons.length]}</div><div className="spec-name">{item.name}</div></div>)}</Carousel></div></section>

    <section className="section" id="doctors"><div className="container"><div className="section-head"><div><div className="kicker">Our Doctors</div><h2 className="title">Meet the Experts Behind Your Care</h2></div><Link className="view" href="#find-doctor">Find a Doctor →</Link></div><Carousel>{(filteredDoctors.length ? filteredDoctors : doctors).map((doctor, index) => <article className="doctor" key={doctor.id}><img src={imageOrFallback(doctor.photo_url, images.doctors[index % images.doctors.length])} alt={doctor.name} /><div className="doctor-body"><div className="doctor-name">{doctor.name}</div><div className="doctor-exp">{doctor.speciality}</div><div className="doctor-years">{doctor.experience_label ?? `${doctor.experience_years ?? ""}+ Years Experience`}</div><Link className="profile" href={`/doctors/${doctor.id}`}>View Profile →</Link></div></article>)}</Carousel></div></section>

    <section className="section facility-section" id="facilities"><div className="container"><div className="section-head"><div><div className="kicker">Advanced Infrastructure</div><h2 className="title">World-Class Facilities</h2></div><Link className="view" href="/angiography">Explore Our Facilities →</Link></div><Carousel>{facilities.map(facility => <article className="facility" key={facility.key}><img src={imageOrFallback(facility.image, images.hero)} alt={facility.image_alt ?? facility.name} /><div className="facility-body"><div className="facility-name">{facility.name}</div><div className="facility-desc">{facility.description}</div><Link className="learn" href="/angiography">Learn More →</Link></div></article>)}</Carousel></div></section>

    <section className="section" id="patients"><div className="container"><div className="section-head"><div><div className="kicker">Happy Patients</div></div><Link className="view" href="/news-media">View All Videos →</Link></div><Carousel>{patients.map(patient => <article className="patient" key={patient.key}><img src={imageOrFallback(patient.image, images.hero)} alt={patient.title} /><span className="duration">{patient.duration ?? "02:14"}</span><span className="play">▶</span><div className="patient-title">{patient.title}</div></article>)}</Carousel></div></section>

    <section className="section life" id="guide"><div className="container"><div className="section-head"><div><div className="kicker">Recent Events · Hospital Videos · Updates</div><h2 className="title">Life at ARSH</h2></div><Link className="view" href="/news-media">View All Updates →</Link></div><Carousel>{updates.map(update => <article className="life-card" key={update.key}><div className="life-media"><img src={imageOrFallback(update.image, images.hero)} alt={update.title} /><span className="life-badge">{update.type === "health" ? "HEALTH UPDATE" : "HOSPITAL UPDATE"}</span><span className="life-play">▶</span></div><div className="life-body"><h3>{update.title}</h3><p>{update.description?.slice(0, 150)}{update.description && update.description.length > 150 ? "…" : ""}</p><Link href={`/news-media/${update.key}`}>{update.action ?? "View Update"} →</Link></div></article>)}</Carousel></div></section>

    <section className="emergency" id="emergency"><div className="container emergency-inner"><div><h2>{emergency?.title ?? "When every second counts"}</h2><p>{emergency?.subtitle ?? "24×7 Emergency & Trauma Care"}</p></div><a href={emergency?.tel_url ?? `tel:${hospital.phone}`}>{emergency?.phone ?? hospital.displayPhone}</a></div></section>
  </main>;
}
