export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, { ...init, credentials: "same-origin" });

  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }

  return response;
}
