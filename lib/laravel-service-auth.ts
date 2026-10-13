export function laravelServiceHeaders(): Record<string, string> {
  const token = process.env.LARAVEL_SERVICE_TOKEN;
  if (!token) {
    throw new Error("LARAVEL_SERVICE_TOKEN is not configured for the server.");
  }

  return { Authorization: `Bearer ${token}` };
}
