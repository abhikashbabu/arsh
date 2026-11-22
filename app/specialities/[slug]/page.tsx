import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SourcePage } from "@/components/SourcePage";
import orthopaedicsPage from "@/content/orthopedic-doctor-in-gaya-bihar.json";
import { getSpeciality, renderSpecialityBody, specialityMetadata } from "@/lib/speciality-page";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return specialityMetadata(await getSpeciality(slug));
}

export default async function SpecialityDetailRoute({ params }: Props) {
  const { slug } = await params;
  const item = await getSpeciality(slug);
  if (item) {
    const data = {
      ...orthopaedicsPage,
      title: item.seo?.seo_title || item.title || item.name || orthopaedicsPage.title,
      body: renderSpecialityBody(orthopaedicsPage.body, item),
      css: `${orthopaedicsPage.css}\n.api-section-image{width:100%;height:180px;object-fit:cover;border-radius:14px}.ico img{width:28px;height:28px;object-fit:contain}`,
      slug: orthopaedicsPage.slug,
    };
    return <SourcePage data={data} />;
  }
  // Keep the existing Orthopaedics design available until its detail record is published.
  if (slug === "3-orthopaedics") return <SourcePage data={orthopaedicsPage} />;
  notFound();
}
