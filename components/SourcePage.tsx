import { PageBehavior } from "@/components/PageBehavior";

type SourcePageData = {
  title: string;
  body: string;
  css: string;
  jsonLd: string[];
  slug: string;
  needsBootstrap: boolean;
  initialApiData?: unknown;
};

export function SourcePage({ data }: { data: SourcePageData }) {
  return (
    <>
      {data.css ? <style dangerouslySetInnerHTML={{ __html: data.css }} /> : null}
      <link rel="preload" href={`/page-scripts/${data.slug}.js`} as="script" />
      {data.needsBootstrap ? (
        <link rel="preload" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" as="script" />
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: data.body }} />
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
