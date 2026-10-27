import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentForm } from "../../../components/AppointmentForm";
import { getDoctor, normalizeImageUrl } from "../../../lib/api";
import { hospital, images } from "../../../lib/content";

type DoctorPageProps = { params: { id: string } };

export async function generateMetadata({ params }: DoctorPageProps) {
  const doctor = await getDoctor(params.id).catch(() => null);
  return doctor ? { title: `${doctor.name} | ARSH Hospital`, description: `${doctor.name}, ${doctor.speciality} at ARSH Super Speciality Hospital, Gaya.` } : { title: "Doctor | ARSH Hospital" };
}

export default async function DoctorPage({ params }: DoctorPageProps) {
  const doctor = await getDoctor(params.id).catch(() => null);
  if (!doctor) notFound();

  return <main><div className="container breadcrumb"><Link href="/">Home</Link> / <Link href="/#doctors">Doctors</Link> / {doctor.name}</div><section className="page-hero"><div className="container"><span className="eyebrow">● &nbsp; {doctor.speciality}</span><h1>{doctor.name}</h1><p>{doctor.qualification ?? "Specialist doctor"} · {doctor.experience_label ?? `${doctor.experience_years ?? ""}+ Years Experience`}</p></div></section><section className="page-section"><div className="container contact-grid"><div className="ortho-photo"><img src={normalizeImageUrl(doctor.photo_url) || images.doctors[0]} alt={doctor.name} /></div><div><div className="kicker">Doctor profile</div><h2>{doctor.name}</h2><p>{doctor.speciality} specialist at ARSH Super Speciality Hospital, Gaya.</p><div className="contact-points"><span>✓ {doctor.status ?? "Available"}</span><span>✓ {doctor.experience_label ?? `${doctor.experience_years ?? ""}+ Years Experience`}</span></div><div className="actions"><Link className="btn primary" href="#contact">Request consultation →</Link><a className="btn secondary" href={`tel:${hospital.phone}`}>Call hospital</a></div></div></div></section><section className="page-section alt" id="contact"><div className="container contact-grid"><div><div className="kicker">Take the next step</div><h2>Book a consultation with {doctor.name}</h2><p>Share your details and our patient care team will contact you to confirm your appointment.</p></div><AppointmentForm /></div></section></main>;
}
