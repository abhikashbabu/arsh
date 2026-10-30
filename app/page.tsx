import type { Metadata } from "next";
import home from "@/content/home.json";
import { SourcePage } from "@/components/SourcePage";
import { getCi4, renderHomeBody } from "@/lib/server-page-data";

export const metadata: Metadata = { title: home.title };
export const revalidate = 60;

export default async function HomePage() {
  let body = home.body;
  let initialApiData: unknown;
  try {
    const data = await getCi4("home");
    if (data && Array.isArray(data.specialities) && Array.isArray(data.doctors)) {
      body = renderHomeBody(body, data);
      initialApiData = data;
    }
  } catch {
    // Use the shipped page markup if the hospital API cannot be reached during rendering.
  }
  return <SourcePage data={{ ...home, body, initialApiData }} />;
}
