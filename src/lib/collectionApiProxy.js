import { NextResponse } from "next/server";

export async function collectionApiProxy(request, path = "", method = "GET") {
  const token = request.cookies.get("sheradeal_token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated." },
      { status: 401 }
    );
  }

  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const url = new URL(`${backendUrl}/api/admin/collections${path}`);

  if (method === "GET") {
    url.search = new URL(request.url).search;
  }

  try {
    const options = {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(30000),
    };

    if (method === "POST" || method === "PUT") {
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        options.body = await request.formData();

        if (method === "PUT") {
          options.method = "POST";
          options.body.set("_method", "PUT");
        }
      } else {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(await request.json());
      }
    }

    const response = await fetch(url, options);

    const result = await response.json().catch(() => ({
      success: false,
      message: "Invalid response from Laravel.",
    }));

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Collections API proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the backend.",
      },
      { status: 503 }
    );
  }
}
