import type { Metadata } from "next";
import specialitiesPage from "@/content/specialities.json";
import { SourcePage } from "@/components/SourcePage";
import { Ci4Speciality, getCi4, renderSpecialitiesBody } from "@/lib/server-page-data";

export const metadata: Metadata = { title: specialitiesPage.title };
export const revalidate = 60;

export default async function SpecialitiesPage() {
  let body = specialitiesPage.body;
  try {
    const data = await getCi4("specialities");
    if (Array.isArray(data)) body = renderSpecialitiesBody(body, data as Ci4Speciality[]);
  } catch {
    // Keep the original source content available if CI4 is temporarily unreachable.
  }
  return <SourcePage data={{ ...specialitiesPage, body }} />;
}
