import type { Metadata } from "next";
import home from "@/content/home.json";
import { SourcePage } from "@/components/SourcePage";

export const metadata: Metadata = { title: home.title };

export default function HomePage() {
  return <SourcePage data={home} />;
}
