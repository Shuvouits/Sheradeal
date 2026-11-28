import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();

    const backendUrl = (
      process.env.LARAVEL_API_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");

    const cookieStore = await cookies();

    // Match this cookie with the existing authentication system.
    const token = cookieStore.get("sheradeal_token")?.value;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${backendUrl}/api/storefront/checkout`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );

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
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Checkout API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to confirm checkout. Check your orders before trying again.",
      },
      { status: 503 }
    );
  }
}
