/** Shared API client and response types for the ARSH website. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeoutMs: 15_000,
  isConfigured: Boolean(API_BASE_URL),
} as const;

export const API_ENDPOINTS = {
  home: "/home",
  specialities: "/specialities",
  doctors: "/doctors",
  doctor: (id: number | string) => `/doctors/${encodeURIComponent(String(id))}`,
  blogs: (slugOrId: number | string) => `/blogs/${encodeURIComponent(String(slugOrId))}`,
  logo: "/assets/logo",
  appointments: "/appointments",
  doctorSearch: "/doctors/search",
  contact: "/contact",
  news: "/news",
} as const;

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

export type Speciality = {
  id: number;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  doctor_count?: number;
};

export type Doctor = {
  id: number;
  slug: string;
  name: string;
  speciality: string;
  speciality_id: number;
  qualification?: string;
  experience_years?: number;
  experience_label?: string;
  status?: string;
  photo_url?: string;
  profile_url?: string;
};

export type Facility = {
  key: string;
  name: string;
  description: string;
  image: string;
  image_alt?: string;
};

export type PatientStory = {
  key: string;
  title: string;
  duration?: string;
  image: string;
  video_url?: string | null;
};

export type HomeUpdate = {
  key: string;
  type?: string;
  title: string;
  description?: string;
  image?: string;
  action?: string;
  url?: string;
  published_at?: string;
};

export type EmergencyInfo = {
  title: string;
  subtitle: string;
  phone: string;
  tel_url: string;
};

export type ContactInfo = {
  hospital_name: string;
  tagline?: string;
  address: string;
  phone: string;
  email: string;
  emergency?: string;
};

export type HomeData = {
  site: {
    name: string;
    logo_url: string;
    tagline: string;
  };
  navigation: {
    items: Array<{ label: string; target: string }>;
    appointment_url?: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    title_highlight: string;
    description: string;
    image: string;
    image_alt?: string;
    badge?: string;
  };
  quick_actions: Array<{
    key: string;
    title: string;
    subtitle: string;
    icon?: string;
    target: string;
  }>;
  find_doctor: {
    title: string;
    description: string;
    specialities_url?: string;
    doctors_url?: string;
  };
  specialities: Speciality[];
  doctors: Doctor[];
  facilities: Facility[];
  patient_stories: PatientStory[];
  updates: HomeUpdate[];
  emergency: EmergencyInfo;
  contact: ContactInfo;
};

export type BlogPost = HomeUpdate & {
  id: number;
  slug: string;
  description: string;
};

export type AppointmentPayload = {
  name: string;
  phone: string;
  message?: string;
  concern?: string;
  preferredDate?: string;
  source?: string;
};

export function getApiUrl(endpoint: string) {
  return `${API_BASE_URL}${endpoint}`;
}

export async function apiRequest<TResponse>(endpoint: string, init: RequestInit = {}): Promise<TResponse> {
  if (!API_CONFIG.isConfigured) {
    throw new Error("API is not configured. Add NEXT_PUBLIC_API_BASE_URL to .env.local.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
  try {
    const response = await fetch(getApiUrl(endpoint), {
      ...init,
      cache: init.cache ?? "no-store",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    return (await response.json()) as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}

async function apiData<T>(endpoint: string): Promise<T> {
  const response = await apiRequest<ApiEnvelope<T>>(endpoint);
  if (!response.success) throw new Error(`API request failed for ${endpoint}`);
  return response.data;
}

export function normalizeImageUrl(value: string | undefined | null) {
  if (!value) return "";
  const dataUrlStart = value.indexOf("data:image/");
  return dataUrlStart >= 0 ? value.slice(dataUrlStart) : value;
}

export async function getHomeData() {
  return apiData<HomeData>(API_ENDPOINTS.home);
}

export async function getSpecialities() {
  const data = await apiData<{ items: Speciality[] }>(API_ENDPOINTS.specialities);
  return data.items;
}

export async function getDoctors() {
  const data = await apiData<{ items: Doctor[] }>(API_ENDPOINTS.doctors);
  return data.items;
}

export async function getDoctor(id: number | string) {
  const data = await apiData<{ doctor: Doctor }>(API_ENDPOINTS.doctor(id));
  return data.doctor;
}

export async function getBlogPost(slugOrId: number | string) {
  const data = await apiData<{ update: BlogPost }>(API_ENDPOINTS.blogs(slugOrId));
  return data.update;
}

export function submitAppointment(payload: AppointmentPayload) {
  return apiRequest<{ success: boolean }>(API_ENDPOINTS.appointments, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
