// File: lib/api-client.ts

/**
 * Wraps fetch() and attaches `Authorization: Bearer <token>` using the
 * admin token stored in localStorage. The token lives in localStorage
 * (not a cookie), so it's only visible to client-side JS — every request
 * that needs auth must go through this instead of calling fetch directly,
 * or the Next.js API routes will never see an Authorization header and
 * Laravel will return "Unauthenticated."
 *
 * Use this only in client components ("use client"), since localStorage
 * doesn't exist on the server.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
