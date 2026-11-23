import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const allowed =
  /^(?:statistics|tree|[1-9]\d*(?:\/(?:featured|cover|icon|restore))?)?$/;

async function forward(request, context) {
  try {
    const { path = [] } = await context.params;
    const endpoint = path.join("/");

    if (!allowed.test(endpoint)) {
      return NextResponse.json(
        { success: false, message: "Unknown category endpoint." },
        { status: 404 }
      );
    }

    const token = (await cookies()).get("sheradeal_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please sign in again." },
        { status: 401 }
      );
    }

    const baseUrl = (
      process.env.LARAVEL_API_URL || "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");

    const destination =
      `${baseUrl}/api/admin/categories` +
      (endpoint ? `/${endpoint}` : "") +
      new URL(request.url).search;

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const options = {
      method: request.method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    };

    if (!["GET", "HEAD"].includes(request.method)) {
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        options.body = await request.formData();
      } else {
        headers["Content-Type"] = "application/json";
        options.body = await request.text();
      }
    }

    const response = await fetch(destination, options);
    const raw = await response.text();

    let result;

    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: `Laravel returned invalid JSON (HTTP ${response.status}).`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Category API proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Cannot reach the Laravel Categories API.",
      },
      { status: 503 }
    );
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;