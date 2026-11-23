import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const LARAVEL_API_URL = (
  process.env.LARAVEL_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

async function handleRequest(request, context) {
  try {
    // Get optional catch-all route segments
    const { path = [] } = await context.params;

    const endpoint = path.join("/");

    // Allow only known Brands API endpoints
    const allowedEndpoint =
      /^(?:statistics|[1-9]\d*(?:\/(?:featured|archive|unarchive|restore|logo))?)?$/;

    if (!allowedEndpoint.test(endpoint)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Brands API endpoint.",
        },
        { status: 404 }
      );
    }

    // Get JWT token from HttpOnly cookie
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

    // Construct Laravel API URL
    const requestUrl = new URL(request.url);

    const targetUrl =
      `${LARAVEL_API_URL}/api/admin/brands` +
      (endpoint ? `/${endpoint}` : "") +
      requestUrl.search;

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

    // Forward JSON or multipart request bodies
    if (!["GET", "HEAD"].includes(request.method)) {
      const contentType = request.headers.get("content-type");

      if (contentType?.includes("multipart/form-data")) {
        options.body = await request.formData();
      } else {
        headers["Content-Type"] = "application/json";
        options.body = await request.text();
      }
    }

    // Forward request to Laravel backend
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

    // Return Laravel response to Next.js frontend
    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Brands API Proxy Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to Laravel Brands API.",
      },
      { status: 503 }
    );
  }
}

// Brands Listing, Statistics, Details
export async function GET(request, context) {
  return handleRequest(request, context);
}

// Create Brand, Upload Logo
export async function POST(request, context) {
  return handleRequest(request, context);
}

// Update Brand
export async function PUT(request, context) {
  return handleRequest(request, context);
}

// Featured, Archive, Restore
export async function PATCH(request, context) {
  return handleRequest(request, context);
}

// Delete Brand
export async function DELETE(request, context) {
  return handleRequest(request, context);
}
