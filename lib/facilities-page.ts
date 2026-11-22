import { escapeHtml } from "@/lib/server-page-data";

export type Facility = {
  id: string | number;
  title?: string;
  slug?: string;
  top_subheading?: string;
  bottom_subheading?: string;
  banner_alt?: string;
  banner_button_text?: string;
  banner_button_url?: string;
  banner_url?: string | null;
  banner_points?: Array<{ text?: string; image_url?: string | null }>;
  recommended_points?: string[];
  is_active?: boolean;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=85",
];

function slugOf(facility: Facility) {
  const slug = facility.slug || String(facility.id);
  return slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || `facility-${facility.id}`;
}

function facilityRow(facility: Facility, index: number) {
  const title = facility.title || "Hospital facility";
  const slug = slugOf(facility);
  const image = facility.banner_url || fallbackImages[index % fallbackImages.length];
  const imageAlt = facility.banner_alt || title;
  const points = (facility.banner_points || []).map(point => `<span class="fx-badge">${point.image_url ? `<img src="${escapeHtml(point.image_url)}" alt="" loading="lazy">` : `<i class="bi bi-stars"></i>`}<span>${escapeHtml(point.text || "")}</span></span>`).join("");
  const recommended = (facility.recommended_points || []).map(point => `<li><i class="bi bi-check-circle-fill"></i>${escapeHtml(point)}</li>`).join("");
  const imageOrder = index % 2 ? " order-lg-2" : "";
  const textOrder = index % 2 ? " order-lg-1" : "";
  const buttonText = facility.banner_button_text?.trim();
  const buttonUrl = facility.banner_button_url || `#visit`;

  return `<div class="row g-4 g-xl-5 align-items-center fx" id="${escapeHtml(slug)}">
    <div class="col-lg-6${imageOrder}"><div class="fx-img"><img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}" loading="lazy" decoding="async">${points ? `<div class="fx-badges">${points}</div>` : ""}</div></div>
    <div class="col-lg-6${textOrder}">
      ${facility.top_subheading ? `<div class="kicker">${escapeHtml(facility.top_subheading)}</div>` : ""}
      <h2>${escapeHtml(title)}</h2>
      ${facility.bottom_subheading ? `<p>${escapeHtml(facility.bottom_subheading)}</p>` : ""}
      ${recommended ? `<ul class="fx-list">${recommended}</ul>` : ""}
      ${buttonText ? `<a class="btn btn-ghost" href="${escapeHtml(buttonUrl)}">${escapeHtml(buttonText)} <i class="bi bi-arrow-right ms-1"></i></a>` : ""}
    </div>
  </div>`;
}

function replaceFirstSectionAfter(html: string, marker: string, replacement: string) {
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) return html;
  const opening = /<section\b[^>]*>/gi;
  opening.lastIndex = markerAt + marker.length;
  const start = opening.exec(html);
  if (!start) return html;
  const tags = /<section\b[^>]*>|<\/section\s*>/gi;
  tags.lastIndex = start.index;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(0, start.index) + replacement + html.slice(tags.lastIndex);
  }
  return html;
}

export function renderFacilitiesBody(body: string, facilities: Facility[]) {
  const active = facilities.filter(facility => facility.is_active !== false);
  const heroPills = `<div class="hero-pills">${active.map(facility => `<a href="#${escapeHtml(slugOf(facility))}">${escapeHtml(facility.title || "Facility")}</a>`).join("")}<a href="#support">Support services</a><a href="#visit">Visit us</a></div>`;
  let html = body.replace(/<div class="hero-pills">[\s\S]*?<\/div>/i, heroPills);

  const section = `<section class="section">
  <div class="wrap">
    <div class="mb-4 mb-lg-5"><div class="kicker">Advanced Infrastructure</div><h2 class="title">World-class facilities under one roof</h2></div>
    ${active.map(facilityRow).join("\n")}
  </div>
</section>`;
  html = replaceFirstSectionAfter(html, "<!-- Main facilities -->", section);
  return html;
}

export const facilitiesPageCss = `.fx-badges{position:absolute;left:1rem;bottom:1rem;display:flex;flex-wrap:wrap;gap:.5rem;max-width:calc(100% - 2rem)}.fx-badge{position:static}.fx-badge img{width:25px;height:25px;object-fit:contain;background:#fff;border-radius:5px;flex:none}.fx-badge i{width:25px;height:25px;background:#fff;color:var(--blue);border-radius:5px;display:grid;place-items:center}`;
