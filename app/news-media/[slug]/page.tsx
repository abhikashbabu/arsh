import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, normalizeImageUrl } from "../../../lib/api";
import { images } from "../../../lib/content";

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug).catch(() => null);
  if (!post) notFound();

  return <main><div className="container breadcrumb"><Link href="/">Home</Link> / <Link href="/news-media">News & Media</Link> / {post.title}</div><section className="page-hero"><div className="container"><span className="eyebrow">● &nbsp; ARSH Health Update</span><h1>{post.title}</h1><p>{post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN") : "ARSH Hospital, Gaya"}</p></div></section><section className="page-section"><div className="container prose"><img className="article-image" src={normalizeImageUrl(post.image) || images.hero} alt={post.title} /><div className="article-copy">{post.description}</div></div></section></main>;
}
