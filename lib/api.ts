/** Central API configuration. Add NEXT_PUBLIC_API_BASE_URL to .env.local when the backend is ready. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeoutMs: 15_000,
  isConfigured: Boolean(API_BASE_URL),
} as const;

export const API_ENDPOINTS = {
  appointments: "/appointments",
  doctorSearch: "/doctors/search",
  contact: "/contact",
  news: "/news",
} as const;

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
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    return (await response.json()) as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}

export function submitAppointment(payload: AppointmentPayload) {
  return apiRequest<{ success: boolean }>(API_ENDPOINTS.appointments, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
