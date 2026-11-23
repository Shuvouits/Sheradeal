import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(
      `${backendUrl}/api/storefront/category-sections`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Storefront Category Sections:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load category sections.",
        data: [],
      },
      { status: 503 }
    );
  }
}
