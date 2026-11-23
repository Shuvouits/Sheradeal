import { NextResponse } from "next/server";

export async function GET(request) {
  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const { searchParams } = new URL(request.url);
  const requestedLimit = Number(searchParams.get("limit") || 15);

  const limit = Number.isFinite(requestedLimit)
    ? Math.min(24, Math.max(1, Math.floor(requestedLimit)))
    : 15;

  try {
    const response = await fetch(
      `${backendUrl}/api/storefront/products/new-arrivals?limit=${limit}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    const result = await response.json().catch(() => ({
      success: false,
      message: "Invalid response from Laravel.",
      data: [],
    }));

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("New Arrival API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load new arrival products.",
        data: [],
      },
      { status: 503 }
    );
  }
}
