import type { Metadata } from "next";
import { SourcePage } from "@/components/SourcePage";
import facilitiesPage from "@/content/facilities.json";
import { facilitiesPageCss, renderFacilitiesBody, type Facility } from "@/lib/facilities-page";
import { getCi4 } from "@/lib/server-page-data";

export const revalidate = 60;

export const metadata: Metadata = { title: facilitiesPage.title };

export default async function FacilitiesPage() {
  let facilities: Facility[] = [];
  try {
    const data = await getCi4("facilities");
    if (Array.isArray(data)) facilities = data as Facility[];
  } catch {
    // Keep the existing facilities content available while the API is unreachable.
  }

  return (
    <SourcePage
      data={{
        ...facilitiesPage,
        body: facilities.length ? renderFacilitiesBody(facilitiesPage.body, facilities) : facilitiesPage.body,
        css: `${facilitiesPage.css}\n${facilitiesPageCss}`,
      }}
    />
  );
}
