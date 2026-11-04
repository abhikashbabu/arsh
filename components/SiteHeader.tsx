"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const logo = "https://arshhospitals.com/wp-content/uploads/2021/12/Arsh-Logo-png-2-e1639235875839.png";
const specialities = [
  { name: "Orthopaedics & Spine", slug: "3-orthopaedics", note: "Bone, joint and spine care" },
  { name: "Cardiology", slug: "cardiology", note: "Heart care and treatment" },
  { name: "Neurology & Neurosurgery", slug: "4-neurology", note: "Brain, spine and nerve care" },
  { name: "Gastroenterology", slug: "15-gastroenterology", note: "Digestive and liver care" },
  { name: "Gynaecology", slug: "2-gynaecology", note: "Women’s health and maternity" },
  { name: "Paediatrics", slug: "6-paediatrics", note: "Newborn and child care" },
  { name: "General Medicine", slug: "8-general-medicine", note: "Everyday and preventive care" },
  { name: "Critical Care", slug: "16-critical-care", note: "Round-the-clock critical care" },
];
const facilities = [
  { name: "Cath Lab & Cardiac Care", href: "/angiography", note: "Cardiac procedures and support", icon: "bi-heart-pulse" },
  { name: "Modular Operation Theatres", href: "/facilities#operation-theatre", note: "Surgical care and recovery", icon: "bi-scissors" },
  { name: "ICU & HDU", href: "/facilities#icu", note: "24x7 critical care", icon: "bi-activity" },
  { name: "Advanced Radiology", href: "/facilities#radiology", note: "Imaging and diagnostics", icon: "bi-radioactive" },
  { name: "Patient Support Services", href: "/facilities#support", note: "Support for patients and families", icon: "bi-people" },
  { name: "Plan Your Visit", href: "/facilities#visit", note: "Location and visiting details", icon: "bi-geo-alt" },
];

function MenuPanel({ kind, close }: { kind: "specialities" | "facilities"; close: () => void }) {
  const isSpeciality = kind === "specialities";
  const entries = isSpeciality ? specialities : facilities;
  return (
    <div className="mega open" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) close(); }}>
      <div className="wrap mega-in">
        <aside className="mega-side">
          <span className="mega-count">{isSpeciality ? "8 featured departments" : "Care and support"}</span>
          <h3>{isSpeciality ? "Specialities" : "Facilities"}</h3>
          <p>{isSpeciality ? "Explore departments and find the right specialist for your care." : "Explore the hospital’s facilities, services and patient support."}</p>
          <Link className="btn btn-arsh" href={isSpeciality ? "/specialities" : "/facilities"} onClick={close}>Explore all {isSpeciality ? "specialities" : "facilities"}</Link>
          <Link className="mega-link" href="/doctors" onClick={close}>Find a doctor <i className="bi bi-arrow-right" /></Link>
        </aside>
        <div className="mgrid">
          {entries.map((entry) => {
            const href = isSpeciality ? `/specialities/${(entry as typeof specialities[number]).slug}` : (entry as typeof facilities[number]).href;
            const note = isSpeciality ? (entry as typeof specialities[number]).note : (entry as typeof facilities[number]).note;
            const icon = isSpeciality ? "bi-heart-pulse" : (entry as typeof facilities[number]).icon;
            return <Link className="mi" href={href} key={entry.name} onClick={close}><span className="mi-ic"><i className={`bi ${icon}`} /></span><span><b>{entry.name}</b><small>{note}</small></span></Link>;
          })}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"specialities" | "facilities" | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<"specialities" | "facilities" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", openDrawer);
    return () => document.body.classList.remove("drawer-open");
  }, [openDrawer]);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  useEffect(() => {
    setOpenMenu(null);
    setOpenDrawer(false);
    setOpenAccordion(null);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpenMenu(null); setOpenDrawer(false); setSearchOpen(false); }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  const isSpecialities = pathname.startsWith("/specialities") || pathname.startsWith("/orthopedic-doctor");
  const isFacilities = pathname.startsWith("/facilities") || pathname.startsWith("/angiography");
  const toggleMenu = (kind: "specialities" | "facilities") => setOpenMenu((value) => value === kind ? null : kind);
  const closeMenus = () => setOpenMenu(null);
  const closeDrawer = () => setOpenDrawer(false);
  const toggleAccordion = (kind: "specialities" | "facilities") => setOpenAccordion((value) => value === kind ? null : kind);

  return (
    <>
      <header className="site-header" onMouseLeave={closeMenus}>
        <div className="wrap">
          <Link className="logo" href="/"><img src={logo} alt="ARSH Super Speciality Hospital" /></Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link className={pathname === "/" ? "active" : ""} href="/">Home</Link>
            <Link className={pathname === "/about" ? "active" : ""} href="/about">About</Link>
            <button className={`mega-trigger${isSpecialities ? " active" : ""}`} type="button" aria-expanded={openMenu === "specialities"} onClick={() => toggleMenu("specialities")}>Specialities <i className="bi bi-chevron-down" /></button>
            <Link className={pathname.startsWith("/doctors") ? "active" : ""} href="/doctors">Doctors</Link>
            <button className={`mega-trigger${isFacilities ? " active" : ""}`} type="button" aria-expanded={openMenu === "facilities"} onClick={() => toggleMenu("facilities")}>Facilities <i className="bi bi-chevron-down" /></button>
            <Link className={pathname === "/patient-stories" ? "active" : ""} href="/patient-stories">Patient Stories</Link>
            <Link className={pathname === "/contact" ? "active" : ""} href="/contact">Contact</Link>
          </nav>
          <button className="search-btn" id="searchBtn" type="button" aria-label="Search" aria-expanded={searchOpen} aria-controls="searchModal" onClick={() => setSearchOpen(true)}><i className="bi bi-search" /></button>
          <a className="header-emergency" href="tel:+917321831111" aria-label="Call 24x7 emergency at +91 73218 31111"><i className="bi bi-telephone-fill" /><span><small>24x7 Emergency</small>+91 73218 31111</span></a>
          <Link className="btn btn-arsh header-cta" href="/book-appointment"><i className="bi bi-calendar2-check me-1" />Book Appointment</Link>
          <button className="menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded={openDrawer} aria-controls="drawer" onClick={() => setOpenDrawer(true)}><i className="bi bi-list" /></button>
        </div>
        {(openMenu === "specialities" || openMenu === "facilities") && <MenuPanel kind={openMenu} close={closeMenus} />}
      </header>

      <div className={`sm${searchOpen ? " open" : ""}`} id="searchModal" role="dialog" aria-modal="true" aria-label="Search ARSH" onClick={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
        <div className="sm-box">
          <div className="sm-head"><h2>Search ARSH</h2><button className="sm-close" id="searchClose" type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><i className="bi bi-x-lg" /></button></div>
          <form role="search" action="/search" method="get"><div className="input-group"><span className="input-group-text"><i className="bi bi-search" /></span><input className="form-control" id="searchInput" type="search" name="q" placeholder="Search doctors, specialities or services" autoComplete="off" /><button className="btn btn-arsh" type="submit">Search</button></div></form>
          <div className="sm-chips">{["Cardiology", "Orthopaedics", "Neurology", "Emergency", "Book appointment"].map((term) => <button type="button" key={term} onClick={() => { const input = document.getElementById("searchInput") as HTMLInputElement | null; if (input) { input.value = term; input.focus(); } }}>{term}</button>)}</div>
        </div>
      </div>

      <div className="scrim" id="scrim" onClick={closeDrawer} />
      <aside className="drawer" id="drawer" aria-label="Mobile menu" aria-hidden={!openDrawer}>
        <div className="drawer-top"><img src={logo} alt="ARSH" /><button className="drawer-close" id="drawerClose" type="button" aria-label="Close menu" onClick={closeDrawer}><i className="bi bi-x-lg" /></button></div>
        <nav className="drawer-links">
          <Link href="/" onClick={closeDrawer}><i className="bi bi-house-door" />Home</Link>
          <Link href="/about" onClick={closeDrawer}><i className="bi bi-info-circle" />About</Link>
          <div className="ditem"><button className="dacc" type="button" aria-expanded={openAccordion === "specialities"} onClick={() => toggleAccordion("specialities")}><i className="bi bi-heart-pulse" />Specialities</button><div className={`dsub${openAccordion === "specialities" ? " open" : ""}`}><div><Link className="dall" href="/specialities" onClick={closeDrawer}>Explore all specialities</Link>{specialities.map((item) => <Link href={`/specialities/${item.slug}`} key={item.slug} onClick={closeDrawer}><i className="bi bi-heart-pulse" />{item.name}</Link>)}</div></div></div>
          <Link href="/doctors" onClick={closeDrawer}><i className="bi bi-person-badge" />Doctors</Link>
          <div className="ditem"><button className="dacc" type="button" aria-expanded={openAccordion === "facilities"} onClick={() => toggleAccordion("facilities")}><i className="bi bi-hospital" />Facilities</button><div className={`dsub${openAccordion === "facilities" ? " open" : ""}`}><div><Link className="dall" href="/facilities" onClick={closeDrawer}>Explore all facilities</Link>{facilities.map((item) => <Link href={item.href} key={item.name} onClick={closeDrawer}><i className={`bi ${item.icon}`} />{item.name}</Link>)}</div></div></div>
          <Link href="/patient-stories" onClick={closeDrawer}><i className="bi bi-chat-heart" />Patient Stories</Link>
          <Link href="/contact" onClick={closeDrawer}><i className="bi bi-telephone" />Contact</Link>
        </nav>
        <div className="drawer-foot"><a className="drawer-emerg" href="tel:+917321831111"><i className="bi bi-telephone-fill" /><span><small>24x7 Emergency</small>+91 73218 31111</span></a><Link className="btn btn-arsh w-100" href="/book-appointment" onClick={closeDrawer}><i className="bi bi-calendar2-check me-1" />Book Appointment</Link></div>
      </aside>
    </>
  );
}
