import { ApiDetailPage } from "@/components/ApiDetailPage";
import { SourcePage } from "@/components/SourcePage";
import orthopaedicsPage from "@/content/orthopedic-doctor-in-gaya-bihar.json";

export default async function SpecialityDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "3-orthopaedics") return <SourcePage data={orthopaedicsPage} />;
  return <ApiDetailPage kind="speciality" slug={slug} />;
}
