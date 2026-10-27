import Link from "next/link";

type FooterProps = {
  name: string;
  tagline?: string;
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
};

export function SiteFooter({ name, tagline, address, phone, phoneHref, email }: FooterProps) {
  return <footer className="site-footer" id="contact"><div className="container footer-grid">
    <div><strong>{name}</strong><p>{tagline ?? "165-bed tertiary care hospital serving Gaya, Bodhgaya and the Magadh region."}</p></div>
    <div><strong>Explore</strong><Link href="/">Home</Link><Link href="/#specialities">Specialities</Link><Link href="/#doctors">Doctors</Link></div>
    <div><strong>Patient Care</strong><Link href="/#contact">Appointments</Link><Link href="/international-patients">International Patients</Link><Link href="/news-media">News & Media</Link></div>
    <div><strong>Contact</strong><p>{address}</p><a href={phoneHref}>{phone}</a><a href={`mailto:${email}`}>{email}</a></div>
  </div><div className="container footer-bottom">© 2026 ARSH Super Speciality Hospital. All rights reserved.</div></footer>;
}
