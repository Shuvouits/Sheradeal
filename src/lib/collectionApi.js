const BASE_URL = "/api/admin/collections";

export async function collectionRequest(
  path = "",
  options = {}
) {
  const { body, headers, ...rest } = options;

  const requestOptions = {
    ...rest,
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...headers,
    },
  };

  if (body instanceof FormData) {
    requestOptions.body = body;
  } else if (body !== undefined) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(
    `${BASE_URL}${path}`,
    requestOptions
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success !== true) {
    const validationError = result.errors
      ? Object.values(result.errors).flat()[0]
      : null;

    throw new Error(
      validationError ||
      result.message ||
      `Request failed (${response.status}).`
    );
  }

  return result.data;
}
