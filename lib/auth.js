export const AUTH_STORAGE_KEY = "induslink_user";

export function setAuthUser(user, token) {
  if (typeof window === "undefined") return;
  const userData = { ...user, token };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
}

export function getAuthUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function clearAuthUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
