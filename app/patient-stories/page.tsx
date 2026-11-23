import type { Metadata } from "next";
import { SourcePage } from "@/components/SourcePage";
import patientStoriesPage from "@/content/patient-stories.json";
import { getCi4 } from "@/lib/server-page-data";

export const revalidate = 60;
export const metadata: Metadata = { title: patientStoriesPage.title };

async function loadStories() {
  const stories: unknown[] = [];
  for (let page = 1; page <= 20; page++) {
    try {
      const data = await getCi4(`patient-stories?per_page=50&page=${page}`);
      if (!Array.isArray(data)) break;
      stories.push(...data);
      if (data.length < 50) break;
    } catch {
      break;
    }
  }
  return stories;
}

export default async function PatientStoriesPage() {
  const stories = await loadStories();

  const body = patientStoriesPage.body.replace('<strong>8+</strong>', '<strong id="specialityCount">0</strong>');
  return <SourcePage data={{ ...patientStoriesPage, body, initialApiData: { stories } }} />;
}
