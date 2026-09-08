// Resolves to '' in dev (Vite proxy handles /api/*) or the full backend URL in production
const API_BASE = ''; // Vite locally and Cloudflare Pages in production proxy to the backend.
/**
 * Drop-in fetch wrapper that:
 *  1. Prepends the configured API base URL
 *  2. Sends cookies (credentials: 'include') by default
 */
export const apiFetch = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(`${API_BASE}${path}`, { credentials: 'include', ...init });

export function getImageUrl(path?: string) {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  return `${API_BASE}${path}`;
}
