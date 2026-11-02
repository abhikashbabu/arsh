import type { Ci4Speciality } from "@/lib/server-page-data";
import { escapeHtml } from "@/lib/server-page-data";

const FEATURED_IDS = ["3", "1", "4", "15", "2", "6", "8", "16"];
const FEATURED_LABELS: Record<string, string> = {
  "3": "Orthopaedics & Spine",
  "4": "Neurology & Neurosurgery",
};
const FEATURED_DESCRIPTIONS: Record<string, string> = {
  "3": "Bone, joint and spine care",
  "1": "Heart care and treatment",
  "4": "Brain, spine and nerve care",
  "15": "Digestive and liver care",
  "2": "Women’s health and maternity",
  "6": "Newborn and child care",
  "8": "Everyday and preventive care",
  "16": "Round-the-clock critical care",
};
const FALLBACK_SPECIALITIES: Ci4Speciality[] = [
  { id: "3", name: "Orthopaedics", slug: "3-orthopaedics" },
  { id: "1", name: "Cardiology", slug: "cardiology" },
  { id: "4", name: "Neurology", slug: "4-neurology" },
  { id: "15", name: "Gastroenterology", slug: "15-gastroenterology" },
  { id: "2", name: "Gynaecology", slug: "2-gynaecology" },
  { id: "6", name: "Paediatrics", slug: "6-paediatrics" },
  { id: "8", name: "General Medicine", slug: "8-general-medicine" },
  { id: "16", name: "Critical Care", slug: "16-critical-care" },
];

const FACILITIES = [
  { name: "Cath Lab & Cardiac Care", href: "/angiography", icon: "bi-heart-pulse", note: "Cardiac procedures and support" },
  { name: "Critical Care", href: "/facilities#support", icon: "bi-activity", note: "Hospital support services" },
  { name: "Emergency Care", href: "/facilities#emergency", icon: "bi-life-preserver", note: "24x7 emergency assistance" },
  { name: "Diagnostics", href: "/facilities#support", icon: "bi-search-heart", note: "Diagnostic services" },
  { name: "Patient Services", href: "/facilities#support", icon: "bi-person-hearts", note: "Support for patients and families" },
  { name: "Plan Your Visit", href: "/facilities#visit", icon: "bi-geo-alt", note: "Location and visiting information" },
];

function specialtyEntries(items: Ci4Speciality[]) {
  return FEATURED_IDS.map((id) => items.find((item) => String(item.id) === id))
    .filter((item): item is Ci4Speciality => Boolean(item));
}

function desktopMenu(title: string, kind: "specialities" | "facilities", items: Ci4Speciality[]) {
  const featured = kind === "specialities" ? specialtyEntries(items).map((item) => {
    const id = String(item.id);
    const label = FEATURED_LABELS[id] || item.name;
    return `<a class="mi" href="/specialities/${encodeURIComponent(item.slug)}"><span class="mi-ic"><i class="bi bi-heart-pulse"></i></span><span><b>${escapeHtml(label)}</b><small>${escapeHtml(FEATURED_DESCRIPTIONS[id] || item.description || "Specialist care at ARSH")}</small></span></a>`;
  }).join("") : FACILITIES.map((item) =>
    `<a class="mi" href="${item.href}"><span class="mi-ic"><i class="bi ${item.icon}"></i></span><span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.note)}</small></span></a>`,
  ).join("");
  const allHref = kind === "specialities" ? "/specialities" : "/facilities";
  const description = kind === "specialities"
    ? "Explore departments and find the right specialist for your care."
    : "Explore the hospital’s facilities, services and patient support.";
  return `<div class="mega" id="mega-${kind}" data-mega-panel="${kind}" aria-hidden="true"><div class="wrap mega-in"><aside class="mega-side"><span class="mega-count">${kind === "specialities" ? "8 featured departments" : "Care and support"}</span><h3>${title}</h3><p>${description}</p><a class="btn btn-arsh" href="${allHref}">Explore all ${title.toLowerCase()}</a><a class="mega-link" href="/doctors">Find a doctor <i class="bi bi-arrow-right"></i></a></aside><div class="mgrid">${featured}</div></div></div>`;
}

function mobileAccordion(title: string, kind: "specialities" | "facilities", items: Ci4Speciality[]) {
  const icon = kind === "specialities" ? "bi-heart-pulse" : "bi-hospital";
  const entries = kind === "specialities"
    ? specialtyEntries(items).map((item) => `<a href="/specialities/${encodeURIComponent(item.slug)}"><i class="bi bi-heart-pulse"></i>${escapeHtml(FEATURED_LABELS[String(item.id)] || item.name)}</a>`).join("")
    : FACILITIES.map((item) => `<a href="${item.href}"><i class="bi ${item.icon}"></i>${escapeHtml(item.name)}</a>`).join("");
  const allHref = kind === "specialities" ? "/specialities" : "/facilities";
  return `<div class="ditem"><button class="dacc" type="button" aria-expanded="false" aria-controls="dsub-${kind}" data-drawer-accordion="${kind}"><i class="bi ${icon}"></i>${title}</button><div class="dsub" id="dsub-${kind}"><div><a class="dall" href="${allHref}">Explore all ${title}</a>${entries}</div></div></div>`;
}

export function addSiteNavigationMenus(body: string, items: Ci4Speciality[]) {
  let result = body;
  const menuItems = specialtyEntries(items).length ? items : FALLBACK_SPECIALITIES;
  result = result.replace(/<a([^>]*)href="\/specialities"([^>]*)>([\s\S]*?)<\/a>/i, (_match, before, _after, label) =>
    `<button class="mega-trigger${/\bactive\b/.test(before) ? " active" : ""}" type="button" aria-expanded="false" aria-controls="mega-specialities" data-mega-trigger="specialities">${label.replace(/<[^>]*>/g, "").trim()} <i class="bi bi-chevron-down"></i></button>`,
  );
  result = result.replace(/<a([^>]*)href="\/facilities"([^>]*)>([\s\S]*?)<\/a>/i, (_match, _before, _after, label) =>
    `<button class="mega-trigger" type="button" aria-expanded="false" aria-controls="mega-facilities" data-mega-trigger="facilities">${label.replace(/<[^>]*>/g, "").trim()} <i class="bi bi-chevron-down"></i></button>`,
  );
  // Add the real facility/speciality menus to the desktop header.
  const panels = `${desktopMenu("Specialities", "specialities", menuItems)}${desktopMenu("Facilities", "facilities", menuItems)}`;
  if (/<header\b[^>]*class="[^"]*site-header[^"]*"[^>]*>[\s\S]*?<\/header>/i.test(result)) {
    result = result.replace(/(<header\b[^>]*class="[^"]*site-header[^"]*"[^>]*>[\s\S]*?)(<\/header>)/i, `$1${panels}$2`);
  }

  // Replace the plain mobile links with expandable, keyboard-operable accordions.
  result = result.replace(/(<nav\b[^>]*class="[^"]*drawer-links[^"]*"[^>]*>[\s\S]*?)<a([^>]*)href="\/specialities"[^>]*>[\s\S]*?<\/a>/i,
    `$1${mobileAccordion("Specialities", "specialities", menuItems)}`);
  result = result.replace(/(<nav\b[^>]*class="[^"]*drawer-links[^"]*"[^>]*>[\s\S]*?)<a([^>]*)href="\/facilities"[^>]*>[\s\S]*?<\/a>/i,
    `$1${mobileAccordion("Facilities", "facilities", menuItems)}`);
  return result;
}

export const siteNavigationCss = `
.site-header{position:sticky;isolation:isolate}
.site-header .mega{position:absolute;left:0;right:0;top:100%;z-index:1031;background:#fff;border-top:1px solid #dce9f4;box-shadow:0 28px 55px rgba(7,61,120,.16);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .2s,transform .2s,visibility .2s;max-height:calc(100vh - 76px);overflow:auto}
.site-header .mega.open{opacity:1;visibility:visible;transform:none}
.site-header .mega-in{display:grid;grid-template-columns:minmax(210px,260px) 1fr;gap:1.25rem;padding-block:1.25rem}
.site-header .mega-side{background:linear-gradient(145deg,#073d78,#1267bd);color:#fff;border-radius:18px;padding:1.2rem;display:flex;flex-direction:column;align-items:flex-start}
.site-header .mega-count{font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#d8ebfb;margin-bottom:.7rem}
.site-header .mega-side h3{color:#fff;font-size:1.2rem;font-weight:800;margin:0 0 .35rem}
.site-header .mega-side p{font-size:.82rem;color:#d8ebfb;margin:0 0 .9rem}
.site-header .mega-side .btn{font-size:.8rem;padding:.5rem .85rem;box-shadow:none}
.site-header .mega-link{margin-top:.7rem;color:#fff;font-size:.82rem;font-weight:700}
.site-header .mgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.3rem;align-content:start}
.site-header .mi{display:flex;gap:.6rem;align-items:center;padding:.55rem;border-radius:12px;text-decoration:none}
.site-header .mi:hover{background:#eef7fd}
.site-header .mi-ic{width:38px;height:38px;border-radius:11px;background:#eef7fd;color:#1267bd;display:grid;place-items:center;flex:none}
.site-header .mi b{display:block;color:#073d78;font-size:.82rem;line-height:1.25}
.site-header .mi small{display:block;color:#5f7387;font-size:.69rem;line-height:1.3;margin-top:.1rem}
.main-nav .mega-trigger{border:0;background:transparent;display:flex;align-items:center;gap:.35rem;padding:.5rem .65rem;border-radius:10px;color:#244665;font-family:inherit;font-size:.88rem;font-weight:600;cursor:pointer}
.main-nav .mega-trigger:hover,.main-nav .mega-trigger[aria-expanded=true]{background:#eef7fd;color:#1267bd}
.main-nav .mega-trigger i{font-size:.68rem;transition:transform .2s}
.main-nav .mega-trigger[aria-expanded=true] i{transform:rotate(180deg)}
.ditem{display:block}
.drawer-links .dacc{width:100%;display:flex;align-items:center;gap:.9rem;padding:.65rem .7rem;border:0;background:transparent;border-radius:14px;font-family:inherit;font-size:.95rem;font-weight:600;color:#073d78;text-align:left;cursor:pointer}
.drawer-links .dacc>i{width:38px;height:38px;border-radius:12px;background:#eef7fd;color:#1267bd;display:grid;place-items:center;font-size:1.05rem}
.drawer-links .dacc::after{content:"⌄";margin-left:auto;color:#7891a8;transition:transform .2s}
.drawer-links .dacc[aria-expanded=true]{background:#eef7fd}
.drawer-links .dacc[aria-expanded=true]::after{transform:rotate(180deg)}
.drawer-links .dsub{display:grid;grid-template-rows:0fr;transition:grid-template-rows .25s ease}
.drawer-links .dsub.open{grid-template-rows:1fr}
.drawer-links .dsub>div{overflow:hidden;padding-left:1rem}
.drawer-links .dsub a{display:flex;align-items:center;gap:.6rem;padding:.55rem .65rem;font-size:.86rem;font-weight:500;color:#244665;border-radius:10px}
.drawer-links .dsub a::after{display:none}
.drawer-links .dsub a i{width:28px;height:28px;border-radius:9px;background:#eef7fd;color:#1267bd;display:grid;place-items:center;font-size:.84rem}
.drawer-links .dsub a.dall{color:#1267bd;font-weight:700}
@media(max-width:1199.98px){.site-header .mega-in{grid-template-columns:210px 1fr}.site-header .mgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:991.98px){.site-header .mega{display:none}}
@media(prefers-reduced-motion:reduce){.site-header .mega,.drawer-links .dsub{transition:none}}
`;
