import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function handler(request, context) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sheradeal_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { path = [] } = await context.params;

    const apiUrl = (
      process.env.LARAVEL_API_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");

    const endpoint = path
      .map((part) => encodeURIComponent(part))
      .join("/");

    const search = new URL(request.url).search;

    const url = `${apiUrl}/api/admin/orders${
      endpoint ? `/${endpoint}` : ""
    }${search}`;

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const options = {
      method: request.method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    };

    if (request.method !== "GET") {
      headers["Content-Type"] = "application/json";
      options.body = await request.text();
    }

    const response = await fetch(url, options);
    const raw = await response.text();

    let result;

    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        success: false,
        message: "Laravel returned an invalid response.",
      };
    }

    return NextResponse.json(result, {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Order API proxy failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Order service is unavailable.",
      },
      { status: 503 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
