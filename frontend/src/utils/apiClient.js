export default async function apiFetch(path, options = {}) {
  // Default to localhost backend port 4000 when NEXT_PUBLIC_API_URL is not provided
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const { clientId, ...rest } = options || {};
  const headers = new Headers(rest.headers || {});
  headers.set("x-client-id", clientId ? String(clientId) : process.env.NEXT_PUBLIC_CLIENT_ID || "web-client");

  const merged = {
    credentials: "include",
    ...rest,
    headers,
  };

  return fetch(url, merged);
}
