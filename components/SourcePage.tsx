import Script from "next/script";

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
      {data.needsBootstrap ? (
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      ) : null}
      <Script src={`/page-scripts/${data.slug}.js`} strategy="afterInteractive" />
    </>
  );
}
