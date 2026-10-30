export type Ci4Speciality = {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  floor?: string;
};

const FEATURED_IDS = ["3", "1", "4", "15", "2", "6", "8", "16"];
const LABELS: Record<string, string> = { "3": "Orthopaedics & Spine", "4": "Neurology & Neurosurgery" };
const COPY: Record<string, { title: string; description: string; services: string[] }> = {
  "3": { title: "Orthopaedics & Spine", description: "Care for bone, joint, muscle and spine conditions, from injuries to planned treatment.", services: ["Joint replacement", "Trauma and fracture care", "Spine and sports injury care"] },
  "1": { title: "Cardiology", description: "Heart assessment, treatment and follow-up with support from the hospital's cardiac team.", services: ["ECG, Echo and TMT", "Angiography and angioplasty", "Heart emergency care"] },
  "4": { title: "Neurology & Neurosurgery", description: "Diagnosis and treatment for conditions affecting the brain, spine and nerves.", services: ["Stroke and paralysis care", "Seizure and headache care", "Brain and spine surgery"] },
  "15": { title: "Gastroenterology", description: "Care for digestive, liver and pancreatic conditions with endoscopy services.", services: ["Endoscopy and colonoscopy", "Liver and gallbladder care", "Digestive disorders"] },
  "2": { title: "Gynaecology", description: "Women's health services, including pregnancy care and gynaecological treatment.", services: ["Pregnancy consultations", "Menstrual and hormonal care", "Gynaecological procedures"] },
  "6": { title: "Paediatrics", description: "Medical care for newborns, children and adolescents, with family-focused support.", services: ["Newborn and child care", "Vaccination", "Growth and nutrition"] },
  "8": { title: "General Medicine", description: "First point of care for common illnesses, long-term conditions and preventive check-ups.", services: ["Fever and infection care", "Diabetes and thyroid care", "Preventive health checks"] },
  "16": { title: "Critical Care", description: "Round-the-clock hospital care for patients who need urgent treatment and close monitoring.", services: ["ICU and HDU support", "Emergency stabilisation", "Continuous patient monitoring"] },
};

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export async function getCi4(path: string) {
  const base = (process.env.CI4_API_BASE_URL || "https://arsh.appsredx.com/api/v1").replace(/\/+$/, "");
  const response = await fetch(`${base}/${path.replace(/^\/+/, "")}`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`CI4 API returned ${response.status}`);
  const payload = await response.json();
  if (payload?.ok === false) throw new Error("CI4 API returned an error");
  return payload.data;
}

function replaceDivAfter(html: string, marker: string, classTest: (className: string) => boolean, replacement: string) {
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) return html;
  const tags = /<div\b[^>]*>|<\/div\s*>/gi;
  tags.lastIndex = markerAt + marker.length;
  let start = -1;
  let opening = "";
  let match: RegExpExecArray | null;
  while ((match = tags.exec(html))) {
    if (match[0].startsWith("</")) continue;
    const className = match[0].match(/\bclass="([^"]*)"/)?.[1] || "";
    if (classTest(className)) { start = match.index; opening = match[0]; break; }
  }
  if (start < 0) return html;
  let depth = 1;
  tags.lastIndex = start + opening.length;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + replacement + html.slice(tags.lastIndex);
  }
  return html;
}

export function featuredSpecialities(items: Ci4Speciality[]) {
  return FEATURED_IDS.map((id) => items.find((item) => String(item.id) === id)).filter((item): item is Ci4Speciality => Boolean(item));
}

function specialityCard(speciality: Ci4Speciality) {
  const id = String(speciality.id);
  const copy = COPY[id] || { title: speciality.name, description: speciality.description || "", services: [] };
  const description = speciality.description || copy.description;
  const services = copy.services.map((service) => `<li><i class="bi bi-check-circle-fill"></i>${escapeHtml(service)}</li>`).join("");
  const floor = speciality.floor ? `<li><i class="bi bi-geo-alt-fill"></i>${escapeHtml(speciality.floor)} floor</li>` : "";
  const slug = encodeURIComponent(speciality.slug);
  return `<div class="col-md-6 col-xl-4"><article class="sp-card"><a class="sp-card-hitarea" href="/specialities/${slug}" aria-label="Open ${escapeHtml(copy.title)} details"></a><div class="sp-top"><span class="sp-icon"><i class="bi bi-heart-pulse"></i></span><h3>${escapeHtml(copy.title)}</h3></div><p>${escapeHtml(description)}</p><ul class="sp-list">${services}${floor}</ul><div class="sp-foot"><a href="/doctors?speciality_id=${encodeURIComponent(id)}">View doctors <i class="bi bi-arrow-right"></i></a><a class="book" href="/book-appointment?speciality_id=${encodeURIComponent(id)}">Book visit</a></div></article></div>`;
}

export function renderSpecialitiesBody(body: string, items: Ci4Speciality[]) {
  const cards = featuredSpecialities(items).map(specialityCard).join("");
  const row = `<div class="row g-3 g-lg-4" data-api-rendered="true">${cards}</div>`;
  return replaceDivAfter(body, "Clinical Departments", (className) => className === "row g-3 g-lg-4", row);
}

export function renderHomeBody(body: string, data: { specialities?: Ci4Speciality[]; doctors?: any[] }) {
  let result = body;
  const specs = featuredSpecialities(data.specialities || []).map((speciality) => {
    const title = LABELS[String(speciality.id)] || speciality.name;
    return `<div class="col"><div class="spec"><a class="spec-hitarea" href="/specialities/${encodeURIComponent(speciality.slug)}" aria-label="View ${escapeHtml(title)}"></a><div class="spec-icon"><i class="bi bi-heart-pulse"></i></div><div class="spec-name">${escapeHtml(title)}</div></div></div>`;
  }).join("");
  result = replaceDivAfter(result, 'id="specialities"', (className) => className.includes("snap") && className.includes("row"), `<div class="row row-cols-2 row-cols-md-3 row-cols-xl-4 snap" data-api-rendered="true">${specs}</div>`);
  const doctors = (data.doctors || []).slice(0, 8).map((doctor) => `<div class="col-6 col-lg-3"><article class="card-p"><div class="ph"><img src="${escapeHtml(doctor.photo_url || "/images/doctor-placeholder.svg")}" alt="${escapeHtml(doctor.name)}" loading="lazy"></div><div class="body"><h3>${escapeHtml(doctor.name)}</h3><div class="sub">${escapeHtml(doctor.speciality)}</div><div class="meta"><i class="bi bi-award me-1"></i>${doctor.experience ? `${escapeHtml(doctor.experience)}+ years experience` : escapeHtml(doctor.qualification || "Available for appointments")}</div><a class="link-sm" href="/doctors/${encodeURIComponent(doctor.slug)}">View profile <i class="bi bi-arrow-right"></i></a></div></article></div>`).join("");
  result = replaceDivAfter(result, 'id="doctors"', (className) => className === "row snap", `<div class="row snap" data-api-rendered="true">${doctors}</div>`);
  const select = /(<select\b[^>]*\bid="speciality"[^>]*>)[\s\S]*?(<\/select>)/.exec(result);
  if (select) {
    const opening = select[1].replace(/\sdata-api-rendered="true"/g, "").replace(/>$/, ' data-api-rendered="true">');
    const options = (data.specialities || []).map((speciality) => `<option value="${escapeHtml(speciality.id)}">${escapeHtml(LABELS[String(speciality.id)] || speciality.name)}</option>`).join("");
    const replacement = `${opening}<option value="">Select speciality</option>${options}${select[2]}`;
    result = result.slice(0, select.index) + replacement + result.slice(select.index + select[0].length);
  }
  return result;
}
