
import { NextResponse } from "next/server";

export async function outletApiProxy(
  request,
  path,
  method = "GET",
  protectedRoute = true
) {
  const token = request.cookies.get("sheradeal_token")?.value;

  if (protectedRoute && !token) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated." },
      { status: 401 }
    );
  }

  const baseUrl = (
    process.env.LARAVEL_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const url = new URL(`${baseUrl}/api${path}`);

  if (method === "GET") {
    url.search = new URL(request.url).search;
  }

  try {
    const headers = {
      Accept: "application/json",
    };

    if (protectedRoute) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    };

    if (method === "POST" || method === "PUT") {
      const contentType =
        request.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        options.body = await request.formData();
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(await request.json());
      }
    }

    const response = await fetch(url, options);

    const result = await response.json().catch(() => ({
      success: false,
      message: "Invalid Laravel response.",
    }));

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Outlet API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the Laravel API.",
      },
      { status: 503 }
    );
  }
}
