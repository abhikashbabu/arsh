import { escapeHtml } from "@/lib/server-page-data";
import type { Facility } from "@/lib/facilities-page";

function replaceSectionById(html: string, id: string, replacement: string) {
  const opening = new RegExp(`<section\\b(?=[^>]*\\bid=["']${id}["'])[^>]*>`, "i").exec(html);
  if (!opening) return html;
  const tags = /<section\b[^>]*>|<\/section\s*>/gi;
  tags.lastIndex = opening.index;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (!depth) return html.slice(0, opening.index) + replacement + html.slice(tags.lastIndex);
  }
  return html;
}

function renderBanner(body: string, facility: Facility) {
  const title = facility.title || "Hospital facility";
  const points = (facility.banner_points || []).map(point => `<span class="facility-banner-point">${point.image_url ? `<img src="${escapeHtml(point.image_url)}" alt="" loading="lazy">` : `<i class="bi bi-check-circle-fill"></i>`}<span>${escapeHtml(point.text || "")}</span></span>`).join("");
  const image = facility.banner_url
    ? `<img class="banner-art api-banner-art" src="${escapeHtml(facility.banner_url)}" alt="${escapeHtml(facility.banner_alt || title)}">`
    : `<svg class="banner-art" viewBox="0 0 420 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M210,320 C90,240 55,150 110,105 C145,77 190,95 210,140 C230,95 275,77 310,105 C365,150 330,240 210,320 Z" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="7" stroke-linejoin="round"/><path d="M210,150 C190,178 165,190 148,218 M210,150 C230,178 255,190 272,216 M210,150 L210,255" stroke="#8fd0f5" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="148" cy="218" r="8" fill="#d7192e"/><circle cx="148" cy="218" r="14" fill="none" stroke="#d7192e" stroke-width="2" opacity=".6"/><path d="M20,300 H95 L115,258 L138,332 L160,278 L180,300 H400" stroke="rgba(255,255,255,.55)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const button = facility.banner_button_text?.trim()
    ? `<a class="btn btn-light facility-banner-cta" href="#overview">${escapeHtml(facility.banner_button_text)} <i class="bi bi-arrow-down-right ms-1"></i></a>`
    : "";
  const section = `<section class="banner">${image}<div class="wrap"><span class="tag"><i class="bi bi-heart-pulse-fill"></i>${escapeHtml(facility.top_subheading || "ARSH Hospital, Gaya")}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(facility.bottom_subheading || "")}</p>${points ? `<div class="facility-banner-points">${points}</div>` : ""}${button}</div></section>`;
  return body.replace(/<section class="banner">[\s\S]*?<\/section>/i, section);
}

function renderOverview(facility: Facility) {
  const title = facility.overview_heading?.trim();
  const description = facility.overview_description?.trim();
  const glance = (facility.at_a_glance || []).map(item => `<div class="r"><span>${escapeHtml(item.title || "")}</span><span>${escapeHtml(item.subhead || "")}</span></div>`).join("");
  return `<section class="section" id="overview"><div class="wrap"><div class="row g-4 g-xl-5 align-items-start"><div class="col-lg-7"><div class="kicker">Overview</div>${title ? `<h2 class="title mb-3">${escapeHtml(title)}</h2>` : ""}${description ? `<p class="text-secondary" style="line-height:1.85">${escapeHtml(description)}</p>` : ""}</div><div class="col-lg-5"><div class="glance"><h3>At a glance</h3>${glance || `<div class="r"><span>Facility</span><span>${escapeHtml(facility.title || "ARSH Hospital")}</span></div>`}<a class="btn btn-arsh w-100 mt-3" href="#contact"><i class="bi bi-calendar2-check me-2"></i>Book a Consultation</a></div></div></div></div></section>`;
}

function renderRecommended(facility: Facility) {
  const points = (facility.recommended_points || []).map(point => `<div class="col"><div class="ind"><i class="bi bi-check-circle-fill"></i>${escapeHtml(point)}</div></div>`).join("");
  if (!points) return "";
  return `<section class="section soft-bg" id="indications"><div class="wrap"><div class="kicker">When it's recommended</div>${facility.recommended_heading ? `<h2 class="title mb-4">${escapeHtml(facility.recommended_heading)}</h2>` : ""}<div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">${points}</div></div></section>`;
}

function renderFaq(facility: Facility) {
  const faqs = facility.faqs || [];
  if (!faqs.length) return "";
  const name = facility.title || "Facility";
  return `<section class="section" id="faq"><div class="wrap"><div class="row g-4 g-xl-5"><div class="col-lg-4"><div class="kicker">Patient questions</div><h2 class="title mb-3">${escapeHtml(name)} FAQs</h2><p class="text-secondary small mb-0">For personal advice, please consult your treating specialist.</p></div><div class="col-lg-8"><div class="accordion" id="facilityFaq">${faqs.map((faq, index) => `<div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button ${index ? "collapsed" : ""}" type="button" data-bs-toggle="collapse" data-bs-target="#facilityFaq${index}" aria-expanded="${index ? "false" : "true"}">${escapeHtml(faq.q || "") }<span class="acc-ic" aria-hidden="true"><i class="bi bi-plus-lg"></i><i class="bi bi-dash-lg"></i></span></button></h3><div id="facilityFaq${index}" class="accordion-collapse collapse ${index ? "" : "show"}" data-bs-parent="#facilityFaq"><div class="accordion-body">${escapeHtml(faq.a || "")}</div></div></div>`).join("")}</div></div></div></div></section>`;
}

export function renderFacilityDetailBody(body: string, facility: Facility) {
  let html = renderBanner(body, facility);
  html = replaceSectionById(html, "overview", renderOverview(facility));
  html = replaceSectionById(html, "indications", renderRecommended(facility));
  html = replaceSectionById(html, "faq", renderFaq(facility));
  const title = facility.title || "facility";
  html = html.replace("Book an angiography consultation", `Book a ${escapeHtml(title)} consultation`);
  html = html.replace(
    "Share your details and our patient care team will contact you to confirm your appointment with the cardiology team.",
    `Share your details and our patient care team will contact you to confirm your ${escapeHtml(title)} appointment.`,
  );
  return html;
}

export function facilityDetailCss() {
  return `.api-banner-art{width:min(34vw,360px);height:88%;right:4%;object-fit:contain;opacity:.48}.facility-banner-points{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:1rem;margin-bottom:1rem}.facility-banner-point{display:inline-flex;align-items:center;gap:.5rem;background:#fff;color:#17324b;border:1px solid rgba(255,255,255,.65);border-radius:999px;padding:.3rem .75rem;font-size:.82rem;font-weight:600}.facility-banner-point img,.facility-banner-point i{width:25px;height:25px;object-fit:contain;background:#fff;border-radius:50%;display:grid;place-items:center;flex:none}.facility-banner-cta{color:#073d78;font-weight:700;border:0;border-radius:10px}`;
}
