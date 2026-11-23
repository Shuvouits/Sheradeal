
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const API_BASE = (
  process.env.LARAVEL_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

async function handleRequest(request, context) {
  try {
    const { path = [] } = await context.params;

    const endpoint = path.join("/");
    const method = request.method.toUpperCase();

    console.log("GLOBAL VARIANT REQUEST:", {
      method,
      endpoint,
    });

    // Only allow known API paths
    const allowedPath = /^(?:[1-9]\d*(?:\/reorder)?)?$/;

    if (!allowedPath.test(endpoint)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Global Variants endpoint.",
        },
        { status: 404 }
      );
    }

    // JWT token
    const cookieStore = await cookies();

    const token = cookieStore.get("sheradeal_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthenticated. Please log in again.",
        },
        { status: 401 }
      );
    }

    // Laravel endpoint
    const requestUrl = new URL(request.url);

    const targetUrl =
      `${API_BASE}/api/admin/global-variants` +
      (endpoint ? `/${endpoint}` : "") +
      requestUrl.search;

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const options = {
      method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    };

    // Request body
    if (!["GET", "HEAD"].includes(method)) {
      headers["Content-Type"] = "application/json";

      const body = await request.text();

      if (body) {
        options.body = body;
      }
    }

    // Forward to Laravel
    const response = await fetch(targetUrl, options);

    const rawResponse = await response.text();

    let result;

    try {
      result = JSON.parse(rawResponse);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Laravel returned an invalid JSON response.",
          upstream_status: response.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });

  } catch (error) {
    console.error("Global Variants API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to Laravel Global Variants API.",
      },
      { status: 503 }
    );
  }
}

export async function GET(request, context) {
  return handleRequest(request, context);
}

export async function POST(request, context) {
  return handleRequest(request, context);
}

export async function PUT(request, context) {
  return handleRequest(request, context);
}

export async function PATCH(request, context) {
  return handleRequest(request, context);
}

export async function DELETE(request, context) {
  return handleRequest(request, context);
}
