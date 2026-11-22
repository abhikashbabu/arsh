import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SourcePage } from "@/components/SourcePage";
import orthopaedicsPage from "@/content/orthopedic-doctor-in-gaya-bihar.json";
import { getRelevantPatientStories, getSpeciality, getSpecialityDoctors, getSpecialityList, renderSpecialityBody, specialityMetadata } from "@/lib/speciality-page";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getSpeciality(slug);
  const fallback = slug === "3-orthopaedics" ? (await getSpecialityList()).find(item => item.slug === slug) || null : null;
  return specialityMetadata(detail || fallback);
}

export default async function SpecialityDetailRoute({ params }: Props) {
  const { slug } = await params;
  const item = await getSpeciality(slug);
  const fallback = !item && slug === "3-orthopaedics" ? (await getSpecialityList()).find(speciality => speciality.slug === slug) || null : null;
  const speciality = item || fallback;
  if (speciality) {
    const [doctors, stories] = await Promise.all([
      getSpecialityDoctors(speciality.id),
      getRelevantPatientStories(speciality.id),
    ]);
    const data = {
      ...orthopaedicsPage,
      title: speciality.seo?.seo_title || speciality.title || speciality.name || orthopaedicsPage.title,
      body: renderSpecialityBody(orthopaedicsPage.body, speciality, doctors, stories),
      css: `${orthopaedicsPage.css}\n.api-section-image{width:100%;height:180px;object-fit:cover;border-radius:14px}.ico img{width:28px;height:28px;object-fit:contain}`,
      slug: orthopaedicsPage.slug,
    };
    return <SourcePage data={data} />;
  }
  notFound();
}
