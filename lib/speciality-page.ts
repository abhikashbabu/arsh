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

export type SpecialityDoctor = {
  id: string | number;
  name: string;
  slug: string;
  speciality?: string;
  speciality_id?: string | number;
  qualification?: string;
  experience?: number | string;
  status?: string;
  photo_url?: string | null;
};

export type PatientStory = {
  id: string | number;
  title: string;
  department_id?: string | number;
  video_url?: string;
  video_mime?: string;
  is_published?: boolean;
};

export async function getSpeciality(slug: string): Promise<SpecialityItem | null> {
  try {
    const item = await getCi4(`specialities/${encodeURIComponent(slug)}`);
    return item && typeof item === "object" ? item as SpecialityItem : null;
  } catch {
    return null;
  }
}

export async function getSpecialityList(): Promise<SpecialityItem[]> {
  try {
    const data = await getCi4("specialities");
    return Array.isArray(data) ? data as SpecialityItem[] : [];
  } catch {
    return [];
  }
}

export async function getSpecialityDoctors(specialityId: string | number): Promise<SpecialityDoctor[]> {
  try {
    const data = await getCi4(`doctors?speciality_id=${encodeURIComponent(String(specialityId))}&per_page=100&page=1`);
    return Array.isArray(data) ? data as SpecialityDoctor[] : [];
  } catch {
    return [];
  }
}

export async function getRelevantPatientStories(specialityId: string | number): Promise<PatientStory[]> {
  try {
    const data = await getCi4("patient-stories");
    return Array.isArray(data)
      ? (data as PatientStory[]).filter(story => story.is_published !== false && String(story.department_id) === String(specialityId))
      : [];
  } catch {
    return [];
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
const paragraphs = (value: string) => value.split(/\n\s*\n/).map(line => `<p>${esc(line)}</p>`).join("");

function specialityFallback(item: SpecialityItem) {
  const name = titleOf(item);
  const intro = item.description || `Specialist consultations and care planning for ${name.toLowerCase()} at ARSH Super Speciality Hospital, Gaya.`;
  return {
    banner: { heading: name, subheading: intro, points: ["Specialist consultation", "Individual care planning"] },
    highlights: ["Specialist consultation", "Assessment and diagnosis", "Individual care planning", "Follow-up support"],
    arsh: { title: `${name} care at ARSH Hospital`, description: intro, items: [{ title: "Consultation", subtitle: "Discuss your symptoms, medical history and concerns with the care team." }, { title: "Assessment", subtitle: "The clinician reviews findings and recommends next steps for your needs." }, { title: "Care planning", subtitle: "Understand suitable treatment options and follow-up." }] },
    hospital_facilities: { title: `Hospital support for ${name}`, description: "Hospital teams can help coordinate appointments, assessment and care when needed.", items: [{ title: "Emergency support", subtitle: "Urgent medical concerns can be assessed by the hospital team." }, { title: "Diagnostic coordination", subtitle: "Investigations are advised by the treating clinician." }, { title: "Inpatient care", subtitle: "Hospital care and monitoring when admission is recommended." }, { title: "Patient assistance", subtitle: "Help with appointments and care coordination." }] },
    what_we_treat: { title: `${name} concerns we assess`, description: `A specialist can assess symptoms and concerns related to ${name.toLowerCase()} and recommend appropriate next steps.`, items: [{ title: "New or persistent symptoms", subtitle: "Assessment of symptoms that are affecting daily life." }, { title: "Ongoing health concerns", subtitle: "Review of existing conditions and previous treatment." }, { title: "Diagnostic questions", subtitle: "Guidance on investigations when clinically appropriate." }] },
    why_choose: { title: `Care for ${name} at ARSH`, description: "Patients receive an individual assessment, an explanation of findings and guidance on appropriate care and follow-up." },
    services: { title: `${name} services`, description: "Care is planned according to each patient's symptoms, medical history and clinical findings.", items: [{ title: "Specialist consultation", subtitle: `Discuss your ${name.toLowerCase()} concerns with the care team.` }, { title: "Assessment and guidance", subtitle: "Understand recommended evaluations and next steps." }, { title: "Follow-up planning", subtitle: "Review progress and care needs over time." }] },
    approach: { title: "A clear path to care", description: "The care team explains each step and supports informed decisions.", items: [{ title: "Listen and assess", subtitle: "Review symptoms, history and health concerns." }, { title: "Evaluate", subtitle: "Review findings and arrange tests when needed." }, { title: "Discuss options", subtitle: "Explain suitable treatment choices and next steps." }, { title: "Follow up", subtitle: "Review progress and adjust the care plan as needed." }] },
    faqs: [{ q: `When should I consult a ${name.toLowerCase()} specialist?`, a: "Consult a clinician for persistent, worsening or concerning symptoms, or if a health issue is affecting daily activities." }, { q: "What should I bring to my appointment?", a: "Bring previous prescriptions, investigation reports, a list of medicines and a brief history of your symptoms." }, { q: "Will I need tests?", a: "Your clinician will decide whether tests are needed based on your symptoms and examination." }],
  };
}

function mergeApiContent(fallback: any, fromApi: any): any {
  if (Array.isArray(fallback)) return Array.isArray(fromApi) && fromApi.length ? fromApi : fallback;
  if (fallback && typeof fallback === "object") {
    const source = fromApi && typeof fromApi === "object" && !Array.isArray(fromApi) ? fromApi : {};
    const merged: Record<string, any> = { ...fallback };
    for (const [key, fallbackValue] of Object.entries(fallback)) {
      merged[key] = mergeApiContent(fallbackValue, source[key]);
    }
    for (const [key, apiValue] of Object.entries(source)) {
      if (!(key in merged) && apiValue != null && apiValue !== "") merged[key] = apiValue;
    }
    return merged;
  }
  if (fromApi != null && fromApi !== "") return fromApi;
  return fallback;
}

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
    const description = field(item, "subtitle", "description", "content", "text", "details");
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
  const paragraphs = description.split(/\n\s*\n/).map((line: string) => `<p>${esc(line)}</p>`).join("");
  return `<section class="${classes}" id="${id}"><div class="wrap"><div class="row g-3 align-items-end mb-4"><div class="col-lg-7"><div class="kicker">${esc(kicker)}</div><h2 class="title">${esc(heading)}</h2></div>${description ? `<div class="col-lg-5 lead-sm">${paragraphs}</div>` : ""}</div>${items.length ? `<div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">${cardItems(items)}</div>` : ""}</div></section>`;
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
  return `<section class="section pt-0" id="faq"><div class="wrap"><div class="row g-4"><div class="col-lg-4"><div class="kicker">Patient questions</div><h2 class="title mb-3">Frequently Asked Questions</h2></div><div class="col-lg-8"><div class="accordion" id="specialityFaq">${faqs.map((faq, i) => `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button ${i ? "collapsed" : ""}" type="button" data-bs-toggle="collapse" data-bs-target="#specialityFaq${i}" aria-expanded="${i ? "false" : "true"}">${esc(field(faq, "q", "question", "title", "name"))}<span class="acc-ic" aria-hidden="true"><i class="bi bi-plus-lg"></i><i class="bi bi-dash-lg"></i></span></button></h3><div id="specialityFaq${i}" class="accordion-collapse collapse ${i ? "" : "show"}" data-bs-parent="#specialityFaq"><div class="accordion-body">${esc(field(faq, "a", "answer", "description", "content"))}</div></div></div>`).join("")}</div></div></div></div></section>`;
}

function renderDoctors(doctors: SpecialityDoctor[], item: SpecialityItem) {
  const title = titleOf(item);
  const doctorCards = doctors.map(doctor => `<div class="col"><article class="card-p h-100"><div class="doc-ph"><img src="${esc(doctor.photo_url || "/images/doctor-placeholder.svg")}" alt="${esc(doctor.name)}" loading="lazy"></div><div class="p-3 p-md-4"><h3>${esc(doctor.name)}</h3><p>${esc(doctor.qualification || doctor.speciality || title)}${doctor.experience ? ` · ${esc(doctor.experience)} years' experience` : ""}</p><a class="link-sm" href="/doctors/${encodeURIComponent(doctor.slug)}">View profile <i class="bi bi-arrow-right"></i></a></div></article></div>`).join("");
  const body = doctors.length ? `<div class="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3 g-lg-4">${doctorCards}</div>` : `<div class="card-p p-4"><p class="mb-0">Doctor profiles for ${esc(title)} will appear here when they are published. Call ARSH Hospital to book a consultation.</p></div>`;
  return `<section class="section" id="doctors"><div class="wrap"><div class="d-flex justify-content-between align-items-end gap-3 mb-4"><div><div class="kicker">Meet the team</div><h2 class="title">Meet Our ${esc(title)} Doctors in Gaya</h2></div><a class="link-sm flex-shrink-0" href="/doctors?speciality_id=${encodeURIComponent(String(item.id))}">All doctors <i class="bi bi-arrow-right"></i></a></div>${body}</div></section>`;
}

function renderPatientStories(stories: PatientStory[], item: SpecialityItem) {
  if (!stories.length) return `<section class="section soft-bg pt-5" id="testimonials"><div class="wrap"><div class="kicker">Patient stories</div><h2 class="title mb-3">Patient Stories</h2><p class="lead-sm mb-0">Patient stories for ${esc(titleOf(item))} will appear here when a matching story is published.</p></div></section>`;
  const cards = stories.map(story => `<div class="col"><article class="card-p p-4 h-100"><div class="kicker">${esc(titleOf(item))} patient story</div><h3>${esc(story.title)}</h3>${story.video_url ? `<a class="link-sm" href="${esc(story.video_url)}" target="_blank" rel="noopener">Watch story <i class="bi bi-arrow-up-right"></i></a>` : ""}</article></div>`).join("");
  return `<section class="section soft-bg pt-5" id="testimonials"><div class="wrap"><div class="d-flex justify-content-between align-items-end mb-4"><div><div class="kicker">Patient stories</div><h2 class="title">What Our ${esc(titleOf(item))} Patients Say</h2></div><a class="link-sm" href="/patient-stories">View all stories <i class="bi bi-arrow-right"></i></a></div><div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">${cards}</div></div></section>`;
}

export function renderSpecialityBody(body: string, item: SpecialityItem, doctors: SpecialityDoctor[] = [], stories: PatientStory[] = []) {
  const apiContent = item.content || {};
  const hasContent = Object.values(apiContent).some(value => value && (Array.isArray(value) ? value.length > 0 : typeof value === "object" ? Object.keys(value).length > 0 : Boolean(value)));
  if (!hasContent && titleOf(item).toLowerCase().includes("orthop")) {
    let template = sectionById(body, "doctors", renderDoctors(doctors, item));
    if (stories.length || !titleOf(item).toLowerCase().includes("orthop")) template = sectionById(template, "testimonials", renderPatientStories(stories, item));
    return template;
  }
  const content = mergeApiContent(specialityFallback(item), apiContent);
  let result = sectionByClass(body, "page-hero", renderBanner(content.banner || {}, item));
  const band = /<div class="band">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i;
  result = result.replace(band, renderHighlights(list(content.highlights)));
  result = sectionById(result, "overview", genericSection("overview", content.arsh, "About this speciality"));
  result = sectionById(result, "facilities", genericSection("facilities", content.hospital_facilities, "Hospital facilities", "section soft-bg"));
  result = sectionById(result, "conditions", genericSection("conditions", content.what_we_treat, "What we treat"));
  const why = content.why_choose || {};
  const whyHtml = field(why, "title", "heading") || field(why, "description", "content") ? `<section class="section bg-white pt-4"><div class="wrap"><div class="mx-auto" style="max-width:780px"><div class="kicker">Why choose ARSH</div><h2 class="title mb-3">${esc(field(why, "title", "heading") || "Why choose ARSH Hospital")}</h2>${paragraphs(field(why, "description", "content"))}</div></div></section>` : "";
  result = sectionByClass(result, "bg-white pt-4", whyHtml);
  result = sectionById(result, "treatments", genericSection("treatments", content.services, "Specialised services", "section treat"));
  result = sectionById(result, "doctors", renderDoctors(doctors, item));
  result = sectionById(result, "testimonials", renderPatientStories(stories, item));
  // The page template has a single section without an id for the care approach.
  const approachHtml = genericSection("approach", content.approach, "Our approach");
  result = result.replace(/<section class="section">[\s\S]*?<\/section>/i, approachHtml);
  result = sectionById(result, "faq", renderFaqs(list(content.faqs)));
  return result;
}
