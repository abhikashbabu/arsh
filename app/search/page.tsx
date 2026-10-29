"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import homePage from "@/content/home.json";

type SearchData = { doctors?: any[]; specialities?: any[]; blogs?: any[] };

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState(query);
  const [data, setData] = useState<SearchData>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
    setQuery(initialQuery); setTerm(initialQuery);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("drawer-open", menuOpen);
    return () => document.body.classList.remove("drawer-open");
  }, [menuOpen]);

  useEffect(() => {
    setTerm(query);
    if (!query.trim()) { setData({}); return; }
    let active = true;
    setLoading(true); setError("");
    fetch(`/api/ci4/search?q=${encodeURIComponent(query)}`, { cache: "no-store" })
      .then(async response => {
        const payload = await response.json();
        if (!response.ok || payload?.ok === false) throw new Error(payload?.errors?.join(" ") || "Search is unavailable.");
        if (active) setData(payload.data || {});
      })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Search is unavailable."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = term.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  }

  const count = (data.doctors?.length || 0) + (data.specialities?.length || 0) + (data.blogs?.length || 0);
  return (
    <div style={{ minHeight: "100vh", background: "#f5f9fc", color: "#17324b", fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: homePage.css }} />
      <div className="topbar d-none d-lg-block"><div className="wrap d-flex justify-content-between py-2"><span><i className="bi bi-geo-alt me-1" />Gaya, Bihar</span><span><i className="bi bi-clock me-1" />OPD 9 AM - 6 PM &nbsp;|&nbsp; <i className="bi bi-telephone me-1" />Emergency 24x7: <a href="tel:+917321831111">+91 73218 31111</a></span></div></div>
      <header className="site-header"><div className="wrap"><Link className="logo" href="/"><img src="https://arshhospitals.com/wp-content/uploads/2021/12/Arsh-Logo-png-2-e1639235875839.png" alt="ARSH Super Speciality Hospital" /></Link><nav className="main-nav" aria-label="Main"><Link href="/">Home</Link><Link href="/about">About</Link><Link href="/specialities">Specialities</Link><Link href="/doctors">Doctors</Link><Link href="/facilities">Facilities</Link><Link href="/patient-stories">Patient Stories</Link><Link href="/contact">Contact</Link></nav><Link className="search-btn" href="/search" aria-label="Search"><i className="bi bi-search" /></Link><Link className="btn btn-arsh header-cta" href="/book-appointment"><i className="bi bi-calendar2-check me-1" />Book Appointment</Link><button className="menu-btn" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><i className="bi bi-list" /></button></div></header>
      {menuOpen && <><button className="scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} /><aside className="drawer"><nav className="drawer-links"><Link href="/">Home</Link><Link href="/about">About</Link><Link href="/specialities">Specialities</Link><Link href="/doctors">Doctors</Link><Link href="/facilities">Facilities</Link><Link href="/contact">Contact</Link></nav><Link className="btn btn-arsh w-100" href="/book-appointment">Book Appointment</Link></aside></>}
      <main className="container py-5">
        <p className="text-secondary small"><Link href="/">Home</Link> / Search</p><h1 className="fw-bold">Search ARSH Hospital</h1>
        <form className="input-group my-4" onSubmit={submit}><input className="form-control" value={term} onChange={event => setTerm(event.target.value)} aria-label="Search doctors, specialities or blogs" placeholder="Search doctors, specialities or services" /><button className="btn btn-primary" type="submit">Search</button></form>
        {loading && <p className="text-secondary">Searching…</p>}{error && <div className="alert alert-warning">{error}</div>}
        {!loading && query && !error && count === 0 && <div className="bg-white rounded-4 p-4">No matching doctors or specialities found. Try another search.</div>}
        {!!data.doctors?.length && <section className="mb-5"><h2 className="h3 mb-3">Doctors</h2><div className="row g-3">{data.doctors.map(doctor => <div className="col-md-6 col-xl-4" key={doctor.id}><article className="bg-white border rounded-4 p-3 d-flex align-items-center gap-3 h-100"><img src={doctor.photo_url || "/images/doctor-placeholder.svg"} alt="" width="72" height="72" style={{ objectFit: "cover", borderRadius: "50%" }} /><div><h3 className="h6 mb-1">{doctor.name}</h3><p className="small text-secondary mb-2">{doctor.speciality}</p><Link href={`/doctors/${encodeURIComponent(doctor.slug)}`}>View doctor</Link></div></article></div>)}</div></section>}
        {!!data.specialities?.length && <section className="mb-5"><h2 className="h3 mb-3">Specialities</h2><div className="row g-3">{data.specialities.map(speciality => <div className="col-sm-6 col-lg-4" key={speciality.id}><Link href={`/specialities/${encodeURIComponent(speciality.slug)}`} className="d-block bg-white border rounded-4 p-3 text-decoration-none h-100"><strong>{speciality.name}</strong>{speciality.floor && <span className="d-block small text-secondary mt-1">{speciality.floor} floor</span>}</Link></div>)}</div></section>}
        {!!data.blogs?.length && <section><h2 className="h3 mb-3">Health articles</h2><div className="row g-3">{data.blogs.map(blog => <div className="col-md-6 col-lg-4" key={blog.id}><Link href={`/blog-detail?slug=${encodeURIComponent(blog.slug)}`} className="d-block bg-white border rounded-4 p-3 text-decoration-none h-100"><strong>{blog.title}</strong><span className="d-block small text-secondary mt-2">{blog.excerpt}</span></Link></div>)}</div></section>}
      </main>
      <footer><div className="wrap"><div className="row g-4"><div className="col-lg-5"><h6>ARSH Super Speciality Hospital</h6><p>165-bed tertiary care hospital serving Gaya, Bodhgaya and the Magadh region.</p></div><div className="col-6 col-lg-2 fl"><h6>Explore</h6><Link href="/about">About</Link><Link href="/specialities">Specialities</Link><Link href="/doctors">Doctors</Link><Link href="/news-media">News &amp; Media</Link><Link href="/blog">Health Blog</Link></div><div className="col-6 col-lg-2 fl"><h6>Patient care</h6><Link href="/book-appointment">Appointments</Link><Link href="/international-patients">International Patients</Link><Link href="/patient-stories">Patient videos</Link></div><div className="col-lg-3"><h6>Contact</h6><div className="fi"><i className="bi bi-geo-alt" />Gaya, Bihar</div><div className="fi"><i className="bi bi-telephone" />+91 73218 31111</div><div className="fi"><i className="bi bi-envelope" />info@arshhospitals.com</div><div className="fi"><i className="bi bi-clock" />OPD 9 AM - 6 PM</div></div></div><div className="copy"><span>© ARSH Super Speciality Hospital. All rights reserved.</span><span>Powered by <a href="https://thebsocial.in/" target="_blank" rel="noopener">TheBsocial</a></span></div></div></footer>
    </div>
  );
}
