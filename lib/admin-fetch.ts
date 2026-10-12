export function authHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("adminToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    for (const [key, value] of Object.entries(authHeaders())) {
        headers.set(key, value);
    }

    const response = await fetch(input, { ...init, headers });

    if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
    }

    return response;
}