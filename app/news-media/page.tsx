import Link from "next/link";
import { getBlogPost, getHomeData } from "../../lib/api";
import { NewsMediaClient } from "./NewsMediaClient";

export default async function NewsMediaPage() {
  const home = await getHomeData().catch(() => null);
  const update = home?.updates?.[0] ?? null;
  const blog = update ? await getBlogPost(update.key).catch(() => null) : null;

  return <main><div className="container breadcrumb"><Link href="/">Home</Link> / News & Media</div><NewsMediaClient update={update} blog={blog} facilities={home?.facilities ?? []} patients={home?.patient_stories ?? []} /></main>;
}
