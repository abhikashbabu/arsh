import { ApiDetailPage } from "@/components/ApiDetailPage";

export default async function DoctorDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ApiDetailPage kind="doctor" slug={slug} />;
}
