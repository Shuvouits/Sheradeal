import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(
      `${backendUrl}/api/storefront/brands/menu`,
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
    }));

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Brand Mega Menu API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load brands.",
        data: {
          brands: [],
          total: 0,
        },
      },
      { status: 503 }
    );
  }
}