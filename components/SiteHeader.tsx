"use client";

import Link from "next/link";
import { useState } from "react";
import { hospital, navLinks } from "../lib/content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="topbar"><div className="container topbar-inner"><span>{hospital.name} · Gaya, Bihar</span><span>24×7 Emergency&nbsp; <a href={`tel:${hospital.phone}`}>{hospital.displayPhone}</a></span></div></div>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="logo" href="/"><img src={hospital.logo} alt={hospital.name} /></Link>
          <nav className="desktop-nav">{navLinks.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav>
          <div className="header-actions"><a className="header-phone" href={`tel:${hospital.phone}`}>☎ {hospital.displayPhone}</a><Link className="header-cta" href="/#contact">Book Appointment</Link><button className="menu-button" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button></div>
        </div>
      </header>
      <div className={`mobile-drawer ${open ? "open" : ""}`}>
        {navLinks.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/international-patients" onClick={() => setOpen(false)}>International Patients</Link>
        <Link href="/news-media" onClick={() => setOpen(false)}>News & Media</Link>
      </div>
    </>
  );
}
