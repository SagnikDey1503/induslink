export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

function getServerOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (explicit) return normalizeBaseUrl(explicit);
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function getApiBaseUrl() {
  if (API_BASE) return normalizeBaseUrl(API_BASE);
  // In the browser, relative URLs work fine (same-origin).
  if (typeof window !== "undefined") return "";
  // On the server we need an absolute URL.
  return getServerOrigin();
}

function buildApiUrl(path) {
  const base = getApiBaseUrl();
  return base ? `${base}${path}` : path;
}

export async function apiFetch(path, options = {}) {
  const body = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (body != null && !isFormData && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: options.credentials ?? "include",
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text().then((text) => (text ? { error: text } : {})).catch(() => ({}));

  if (!response.ok) {
    let message = payload?.error || "Request failed.";
    if (payload?.details) {
      const detailsText = Array.isArray(payload.details) ? payload.details.join(", ") : String(payload.details);
      if (detailsText && detailsText !== message) {
        message = `${message} ${detailsText}`.trim();
      }
    }
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function getIndustries() {
  try {
    const response = await fetch(buildApiUrl("/api/industries"), { next: { revalidate: 60 } });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? payload?.data || [] : [];
  } catch (error) {
    console.error("Failed to fetch industries:", error);
    return [];
  }
}

export async function getMachines(params = {}) {
  try {
    const search = new URLSearchParams();
    if (params.industry) search.set("industry", params.industry);
    if (params.subIndustry) search.set("subIndustry", params.subIndustry);
    if (params.verified) search.set("verified", "true");

    const url = buildApiUrl(`/api/machines?${search.toString()}`);
    const response = await fetch(url, { next: { revalidate: 60 } });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? payload?.data || [] : [];
  } catch (error) {
    console.error("Failed to fetch machines:", error);
    return [];
  }
}

export async function getMachine(id) {
  try {
    const response = await fetch(buildApiUrl(`/api/machines/${id}`), { next: { revalidate: 60 } });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? payload?.data || null : null;
  } catch (error) {
    console.error("Failed to fetch machine:", error);
    return null;
  }
}
