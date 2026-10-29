import { PageBehavior } from "@/components/PageBehavior";

type SourcePageData = {
  title: string;
  body: string;
  css: string;
  jsonLd: string[];
  slug: string;
  needsBootstrap: boolean;
};

export function SourcePage({ data }: { data: SourcePageData }) {
  return (
    <>
      {data.css ? <style dangerouslySetInnerHTML={{ __html: data.css }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: data.body }} />
      {data.jsonLd.map((json, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
      <PageBehavior slug={data.slug} />
    </>
  );
}
