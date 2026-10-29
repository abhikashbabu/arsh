import { ApiDetailPage } from "@/components/ApiDetailPage";

export default async function SpecialityDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ApiDetailPage kind="speciality" slug={slug} />;
}
