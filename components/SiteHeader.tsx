"use client";

import Link from "next/link";
import { useState } from "react";

type HeaderProps = {
  logoUrl: string;
  navItems: Array<{ label: string; href: string }>;
  phone: string;
  phoneHref: string;
};

export function SiteHeader({ logoUrl, navItems, phone, phoneHref }: HeaderProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="topbar"><div className="container topbar-inner"><span>ARSH Super Speciality Hospital · Gaya, Bihar</span><span>24×7 Emergency&nbsp; <a href={phoneHref}>{phone}</a></span></div></div>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="logo" href="/"><img src={logoUrl} alt="ARSH Super Speciality Hospital" /></Link>
          <nav className="desktop-nav">{navItems.map(({ label, href }) => <Link key={label} href={href}>{label}</Link>)}</nav>
          <div className="header-actions"><a className="header-phone" href={phoneHref}>☎ {phone}</a><Link className="header-cta" href="/#contact">Book Appointment</Link><button className="menu-button" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button></div>
        </div>
      </header>
      <div className={`mobile-drawer ${open ? "open" : ""}`}>
        {navItems.map(({ label, href }) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/international-patients" onClick={() => setOpen(false)}>International Patients</Link>
        <Link href="/news-media" onClick={() => setOpen(false)}>News & Media</Link>
      </div>
    </>
  );
}
