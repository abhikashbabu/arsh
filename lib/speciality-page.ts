import type { Metadata } from "next";
import { getCi4 } from "@/lib/server-page-data";

export type SpecialityItem = {
  id: string | number;
  name?: string;
  title?: string;
  description?: string;
  floor?: string;
  slug: string;
  image_url?: string | null;
  icon_url?: string | null;
  content?: Record<string, any> | null;
  seo?: Record<string, any> | null;
};

export async function getSpeciality(slug: string): Promise<SpecialityItem | null> {
  try {
    const item = await getCi4(`specialities/${encodeURIComponent(slug)}`);
    return item && typeof item === "object" ? item as SpecialityItem : null;
  } catch {
    return null;
  }
}

export function specialityMetadata(item: SpecialityItem | null): Metadata {
  if (!item) return { title: "Speciality | ARSH Hospital" };
  const title = item.seo?.seo_title || item.title || item.name || "Speciality";
  const description = item.seo?.meta_description || item.description || "Specialist care at ARSH Super Speciality Hospital, Gaya.";
  return {
    title,
    description,
    alternates: item.seo?.canonical_url ? { canonical: item.seo.canonical_url } : undefined,
    robots: {
      index: item.seo?.robots_index !== "noindex",
      follow: item.seo?.robots_follow !== "nofollow",
    },
    openGraph: { title, description, images: item.image_url ? [item.image_url] : undefined },
  };
}

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const text = (value: any) => typeof value === "string" || typeof value === "number" ? String(value) : "";
const list = (value: any): any[] => Array.isArray(value) ? value : [];
const field = (item: any, ...keys: string[]) => {
  for (const key of keys) {
    const result = text(item?.[key]);
    if (result.trim()) return result;
  }
  return "";
};
const titleOf = (item: SpecialityItem) => item.title || item.name || "Speciality";

function sectionById(html: string, id: string, replacement: string) {
  const opening = new RegExp(`<section\\b(?=[^>]*\\bid=["']${id}["'])[^>]*>`, "i").exec(html);
  if (!opening) return html;
  const tags = /<section\b[^>]*>|<\/section\s*>/gi;
  tags.lastIndex = opening.index;
  let depth = 0, match: RegExpExecArray | null;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(0, opening.index) + replacement + html.slice(tags.lastIndex);
  }
  return html;
}

function sectionByClass(html: string, className: string, replacement: string) {
  const opening = new RegExp(`<section\\b(?=[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'])[^>]*>`, "i").exec(html);
  if (!opening) return html;
  const tags = /<section\b[^>]*>|<\/section\s*>/gi;
  tags.lastIndex = opening.index;
  let depth = 0, match: RegExpExecArray | null;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(0, opening.index) + replacement + html.slice(tags.lastIndex);
  }
  return html;
}

function cardItems(items: any[], className = "col") {
  return items.map((item) => {
    const title = field(item, "title", "name", "heading", "label") || text(item);
    const description = field(item, "description", "content", "text", "details");
    const icon = field(item, "icon_url", "icon") || "bi-heart-pulse";
    const image = field(item, "image_url", "image");
    return `<div class="${className}"><article class="card-p p-4 h-100">${image ? `<img class="api-section-image mb-3" src="${esc(image)}" alt="${esc(title)}" loading="lazy">` : `<span class="ico mb-3">${icon.startsWith("http") ? `<img src="${esc(icon)}" alt="" loading="lazy">` : `<i class="bi ${esc(icon.replace(/^bi\s+/, ""))}"></i>`}</span>`}<h3>${esc(title)}</h3>${description ? `<p>${esc(description)}</p>` : ""}</article></div>`;
  }).join("");
}

function genericSection(id: string, data: any, kicker: string, classes = "section") {
  const items = list(data?.items);
  if (!field(data, "title", "heading") && !field(data, "description", "content") && !items.length) return "";
  const heading = field(data, "title", "heading") || kicker;
  const description = field(data, "description", "content");
  return `<section class="${classes}" id="${id}"><div class="wrap"><div class="row g-3 align-items-end mb-4"><div class="col-lg-7"><div class="kicker">${esc(kicker)}</div><h2 class="title">${esc(heading)}</h2></div>${description ? `<div class="col-lg-5"><p class="lead-sm">${esc(description)}</p></div>` : ""}</div>${items.length ? `<div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">${cardItems(items)}</div>` : description && !field(data, "title", "heading") ? `<p class="text-secondary">${esc(description)}</p>` : ""}</div></section>`;
}

function renderBanner(banner: any, item: SpecialityItem) {
  const name = titleOf(item);
  const heading = field(banner, "heading", "title") || name;
  const subheading = field(banner, "subheading", "description") || item.description || `Specialist care at ARSH Super Speciality Hospital, Gaya.`;
  const image = field(banner, "image_url") || item.image_url || "";
  const alt = field(banner, "alt") || heading;
  const points = list(banner?.points).map(point => `<span><i class="bi bi-check-circle-fill"></i>${esc(field(point, "title", "name", "text") || point)}</span>`).join("");
  return `<section class="page-hero"><div class="wrap"><nav aria-label="breadcrumb"><ol class="breadcrumb mb-0"><li class="breadcrumb-item"><a href="/">Home</a></li><li class="breadcrumb-item"><a href="/specialities">Specialities</a></li><li class="breadcrumb-item active" aria-current="page">${esc(name)}</li></ol></nav><div class="row g-4 g-xl-5 align-items-center"><div class="col-lg-${image ? "6" : "10"}"><span class="hero-tag"><i class="bi bi-heart-pulse-fill"></i> ARSH Hospital · Gaya</span><h1>${esc(heading)}</h1><p class="lead">${esc(subheading)}</p><div class="d-flex flex-wrap gap-2 gap-md-3"><a class="btn btn-arsh" href="/book-appointment?speciality_id=${encodeURIComponent(String(item.id))}"><i class="bi bi-calendar2-check me-2"></i>Book an appointment</a><a class="btn btn-ghost" href="tel:+917321831111"><i class="bi bi-telephone me-2"></i>Call the hospital</a></div>${points ? `<div class="hero-points">${points}</div>` : ""}</div>${image ? `<div class="col-lg-6"><div class="hero-photo"><img src="${esc(image)}" alt="${esc(alt)}"><div class="hero-badge a"><i class="bi bi-person-check-fill"></i><span>Patient-first<small>Care at every step</small></span></div></div></div>` : ""}</div></div></section>`;
}

function renderHighlights(items: any[]) {
  if (!items.length) return "";
  return `<div class="band"><div class="wrap"><div class="row row-cols-2 row-cols-lg-4 g-0">${items.map(item => {
    const label = field(item, "title", "name", "text", "label") || text(item);
    const icon = field(item, "icon_url", "icon") || "bi-check2-circle";
    return `<div class="col"><div class="it">${icon.startsWith("http") ? `<img src="${esc(icon)}" alt="" loading="lazy">` : `<i class="bi ${esc(icon.replace(/^bi\s+/, ""))}"></i>`}${esc(label)}</div></div>`;
  }).join("")}</div></div></div>`;
}

function renderFaqs(faqs: any[]) {
  if (!faqs.length) return "";
  return `<section class="section pt-0" id="faq"><div class="wrap"><div class="row g-4"><div class="col-lg-4"><div class="kicker">Patient questions</div><h2 class="title mb-3">Frequently Asked Questions</h2></div><div class="col-lg-8"><div class="accordion" id="specialityFaq">${faqs.map((faq, i) => `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button ${i ? "collapsed" : ""}" type="button" data-bs-toggle="collapse" data-bs-target="#specialityFaq${i}" aria-expanded="${i ? "false" : "true"}">${esc(field(faq, "question", "title", "name"))}<span class="acc-ic" aria-hidden="true"><i class="bi bi-plus-lg"></i><i class="bi bi-dash-lg"></i></span></button></h3><div id="specialityFaq${i}" class="accordion-collapse collapse ${i ? "" : "show"}" data-bs-parent="#specialityFaq"><div class="accordion-body">${esc(field(faq, "answer", "description", "content"))}</div></div></div>`).join("")}</div></div></div></div></section>`;
}

export function renderSpecialityBody(body: string, item: SpecialityItem) {
  const content = item.content || {};
  let result = sectionByClass(body, "page-hero", renderBanner(content.banner || {}, item));
  const band = /<div class="band">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i;
  result = result.replace(band, renderHighlights(list(content.highlights)));
  result = sectionById(result, "overview", genericSection("overview", content.arsh, "About this speciality"));
  result = sectionById(result, "facilities", genericSection("facilities", content.hospital_facilities, "Hospital facilities", "section soft-bg"));
  result = sectionById(result, "conditions", genericSection("conditions", content.what_we_treat, "What we treat"));
  const why = content.why_choose || {};
  const whyHtml = field(why, "title", "heading") || field(why, "description", "content") ? `<section class="section bg-white pt-4"><div class="wrap"><div class="mx-auto" style="max-width:780px"><div class="kicker">Why choose ARSH</div><h2 class="title mb-3">${esc(field(why, "title", "heading") || "Why choose ARSH Hospital")}</h2><p>${esc(field(why, "description", "content"))}</p></div></div></section>` : "";
  result = sectionByClass(result, "bg-white pt-4", whyHtml);
  result = sectionById(result, "treatments", genericSection("treatments", content.services, "Specialised services", "section treat"));
  result = sectionById(result, "doctors", "");
  result = sectionById(result, "testimonials", "");
  // The page template has a single section without an id for the care approach.
  const approachHtml = genericSection("approach", content.approach, "Our approach");
  if (approachHtml) result = result.replace(/<section class="section">[\s\S]*?<\/section>/i, approachHtml);
  result = sectionById(result, "faq", renderFaqs(list(content.faqs)));
  return result;
}
