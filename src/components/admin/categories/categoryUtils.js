export function apiImage(path) {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = (
    process.env.NEXT_PUBLIC_LARAVEL_URL || "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");

  return `${base}/storage/${String(path).replace(/^\/+/, "")}`;
}

export async function categoryRequest(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  const raw = await response.text();
  let result;

  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error(
      `API returned a non-JSON response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || !result.success) {
    const firstError = result.errors
      ? Object.values(result.errors).flat()[0]
      : null;

    throw new Error(
      firstError ||
      result.message ||
      `Request failed (HTTP ${response.status}).`
    );
  }

  return result.data;
}

export function toSlug(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function flattenTree(tree, depth = 0, result = []) {
  for (const item of tree || []) {
    result.push({ ...item, depth });
    flattenTree(item.children || [], depth + 1, result);
  }

  return result;
}