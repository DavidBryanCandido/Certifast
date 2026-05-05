/**
 * Base URL for Express routes mounted under `/api/*`.
 * VITE_API_URL may be set with or without the `/api` suffix (a common misconfiguration on Vercel).
 */
export function getApiBase() {
    const raw =
        import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";
    const base = raw.replace(/\/+$/, "");
    if (/\/api$/i.test(base)) return base;
    return `${base}/api`;
}
