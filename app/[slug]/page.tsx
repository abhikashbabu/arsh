import type { Metadata } from "next";
import { notFound } from "next/navigation";
import blog from "@/content/blog.json";
import blogDetail from "@/content/blog-detail.json";
import doctors from "@/content/doctors.json";
import newsMedia from "@/content/news-media.json";
import bookAppointment from "@/content/book-appointment.json";
import facilities from "@/content/facilities.json";
import angiography from "@/content/angiography.json";
import internationalPatients from "@/content/international-patients.json";
import patientStories from "@/content/patient-stories.json";
import specialities from "@/content/specialities.json";
import orthopaedics from "@/content/orthopedic-doctor-in-gaya-bihar.json";
import { SourcePage } from "@/components/SourcePage";

const pages = {
  blog,
  "blog-detail": blogDetail,
  doctors,
  "news-media": newsMedia,
  "book-appointment": bookAppointment,
  facilities,
  angiography,
  "international-patients": internationalPatients,
  "patient-stories": patientStories,
  specialities,
  "orthopedic-doctor-in-gaya-bihar": orthopaedics,
};

type PageSlug = keyof typeof pages;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug as PageSlug];
  return page ? { title: page.title } : {};
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as PageSlug];
  if (!page) notFound();
  return <SourcePage data={page} />;
}
