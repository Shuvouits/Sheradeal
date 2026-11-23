import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = (
  process.env.LARAVEL_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

async function proxy(request, context) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sheradeal_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login again.",
        },
        { status: 401 }
      );
    }

    const { path = [] } = await context.params;

    // Prevent unexpected path traversal.
    if (
      !Array.isArray(path) ||
      path.some(
        (segment) =>
          !segment ||
          segment === "." ||
          segment === ".." ||
          segment.includes("/") ||
          segment.includes("\\")
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid API path.",
        },
        { status: 400 }
      );
    }

    const incomingUrl = new URL(request.url);

    const suffix = path
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    const upstreamUrl =
      `${API_BASE}/api/admin/products` +
      (suffix ? `/${suffix}` : "") +
      incomingUrl.search;

    const method = request.method.toUpperCase();

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const contentType = request.headers.get("content-type");

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    const fetchOptions = {
      method,
      headers,
      cache: "no-store",
    };

    if (!["GET", "HEAD"].includes(method)) {
      fetchOptions.body = await request.arrayBuffer();
    }

    const response = await fetch(upstreamUrl, fetchOptions);

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Product API Proxy Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the product API.",
      },
      { status: 502 }
    );
  }
}

export async function GET(request, context) {
  return proxy(request, context);
}

export async function POST(request, context) {
  return proxy(request, context);
}

export async function PUT(request, context) {
  return proxy(request, context);
}

export async function PATCH(request, context) {
  return proxy(request, context);
}

export async function DELETE(request, context) {
  return proxy(request, context);
}
