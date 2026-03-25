export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL?.trim();
  const useProxy = import.meta.env.VITE_USE_PROXY === "true";

  if (useProxy || !raw) return "";

  return raw.replace(/\/+$/, "");
}
