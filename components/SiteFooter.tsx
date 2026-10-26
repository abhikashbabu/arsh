import Link from "next/link";
import { hospital } from "../lib/content";

export function SiteFooter() {
  return <footer className="site-footer" id="contact"><div className="container footer-grid">
    <div><strong>{hospital.name}</strong><p>165-bed tertiary care hospital serving Gaya, Bodhgaya and the Magadh region.</p></div>
    <div><strong>Explore</strong><Link href="/">Home</Link><Link href="/#specialities">Specialities</Link><Link href="/#doctors">Doctors</Link></div>
    <div><strong>Patient Care</strong><Link href="/#contact">Appointments</Link><Link href="/international-patients">International Patients</Link><Link href="/news-media">News & Media</Link></div>
    <div><strong>Contact</strong><p>{hospital.address}</p><a href={`tel:${hospital.phone}`}>{hospital.displayPhone}</a><a href={`mailto:${hospital.email}`}>{hospital.email}</a></div>
  </div><div className="container footer-bottom">© 2026 ARSH Super Speciality Hospital. All rights reserved.</div></footer>;
}
