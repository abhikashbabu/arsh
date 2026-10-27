import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { getHomeData } from "../lib/api";
import { hospital, navLinks } from "../lib/content";

export const metadata: Metadata = {
  title: "ARSH Super Speciality Hospital | Gaya, Bihar",
  description: "Expert, patient-first healthcare at ARSH Super Speciality Hospital in Gaya and Bodhgaya, Bihar.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const home = await getHomeData().catch(() => null);
  const navItems = home?.navigation.items.map(item => ({
    label: item.label,
    href: item.target.startsWith("#") ? `/${item.target}` : item.target,
  })) ?? navLinks.map(([label, href]) => ({ label, href }));
  const phone = home?.contact.phone ?? hospital.displayPhone;
  const phoneHref = home?.emergency.tel_url ?? `tel:${hospital.phone}`;
  const email = home?.contact.email ?? hospital.email;
  const address = home?.contact.address ?? hospital.address;
  const name = home?.site.name ?? hospital.name;

  return (
    <html lang="en">
      <body>
        <SiteHeader logoUrl={home?.site.logo_url ?? hospital.logo} navItems={navItems} phone={phone} phoneHref={phoneHref} />
        {children}
        <SiteFooter name={name} tagline={home?.site.tagline} address={address} phone={phone} phoneHref={phoneHref} email={email} />
      </body>
    </html>
  );
}
