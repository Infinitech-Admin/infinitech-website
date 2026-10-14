/**
 * Admin API requests use the same-origin httpOnly session cookie. The cookie
 * is attached by the browser and validated by the Next.js authorization
 * middleware; client code must never read or attach the credential itself.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  return fetch(input, { ...init, credentials: "same-origin" });
}
