import { PageBehavior } from "@/components/PageBehavior";
import { getCi4, type Ci4Speciality } from "@/lib/server-page-data";
import { addSiteNavigationMenus, siteNavigationCss } from "@/lib/site-navigation";

type SourcePageData = {
  title: string;
  body: string;
  css: string;
  jsonLd: string[];
  slug: string;
  needsBootstrap: boolean;
  initialApiData?: unknown;
};

export async function SourcePage({ data }: { data: SourcePageData }) {
  let specialities: Ci4Speciality[] = [];
  const initial = data.initialApiData as { specialities?: Ci4Speciality[] } | undefined;
  if (Array.isArray(initial?.specialities)) specialities = initial.specialities;
  else {
    try {
      const response = await getCi4("specialities");
      if (Array.isArray(response)) specialities = response as Ci4Speciality[];
    } catch {
      // Keep the shared navigation usable with its main destination links if the API is offline.
    }
  }
  const body = addSiteNavigationMenus(data.body, specialities);
  return (
    <>
      {data.css ? <style dangerouslySetInnerHTML={{ __html: data.css }} /> : null}
      <style dangerouslySetInnerHTML={{ __html: siteNavigationCss }} />
      <link rel="preload" href={`/page-scripts/${data.slug}.js`} as="script" />
      {data.needsBootstrap ? (
        <link rel="preload" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" as="script" />
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: body }} />
      {data.initialApiData ? (
        <script
          id="arshInitialApiData"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data.initialApiData).replace(/</g, "\\u003c") }}
        />
      ) : null}
      {data.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
      <PageBehavior slug={data.slug} />
    </>
  );
}
