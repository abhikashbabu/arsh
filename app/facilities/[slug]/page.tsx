import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SourcePage } from "@/components/SourcePage";
import angiographyPage from "@/content/angiography.json";
import type { Facility } from "@/lib/facilities-page";
import { facilityDetailCss, renderFacilityDetailBody } from "@/lib/facility-detail-page";
import { getCi4 } from "@/lib/server-page-data";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function getFacility(slug: string): Promise<Facility | null> {
  try {
    const data = await getCi4(`facilities/${encodeURIComponent(slug)}`);
    return data && typeof data === "object" ? data as Facility : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const facility = await getFacility(slug);
  if (!facility) return { title: "Hospital Facility | ARSH Hospital" };
  const title = facility.seo_title || `${facility.title || "Facility"} | ARSH Hospital`;
  return {
    title,
    description: facility.meta_description || facility.bottom_subheading,
    alternates: facility.canonical_url ? { canonical: facility.canonical_url } : undefined,
    robots: {
      index: facility.robots_index !== "noindex",
      follow: facility.robots_follow !== "nofollow",
    },
    openGraph: {
      title,
      description: facility.meta_description || facility.bottom_subheading,
      images: facility.banner_url ? [facility.banner_url] : undefined,
    },
  };
}

export default async function FacilityDetailPage({ params }: Props) {
  const { slug } = await params;
  const facility = await getFacility(slug);
  if (!facility || facility.is_active === false) notFound();

  return (
    <SourcePage
      data={{
        ...angiographyPage,
        title: facility.seo_title || `${facility.title || "Facility"} | ARSH Hospital`,
        body: renderFacilityDetailBody(angiographyPage.body, facility),
        css: `${angiographyPage.css}\n${facilityDetailCss()}`,
        slug: angiographyPage.slug,
      }}
    />
  );
}
