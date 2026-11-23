import { NextResponse } from "next/server";

export async function footerApiProxy(
  request,
  path,
  method = "GET",
  requiresAuth = true
) {
  const token = request.cookies.get("sheradeal_token")?.value;

  if (requiresAuth && !token) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated." },
      { status: 401 }
    );
  }

  const baseUrl = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const url = `${baseUrl}/api${path}`;

  try {
    const headers = {
      Accept: "application/json",
    };

    if (requiresAuth) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    };

    if (method === "POST" || method === "PUT") {
      const type = request.headers.get("content-type") || "";

      if (type.includes("multipart/form-data")) {
        options.body = await request.formData();
      } else {
        headers["Content-Type"] = "application/json";
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
    console.error("Footer API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load footer settings.",
      },
      { status: 503 }
    );
  }
}
