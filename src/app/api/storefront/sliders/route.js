import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = (
    process.env.LARAVEL_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(
      `${apiUrl}/api/storefront/sliders`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    const result = await response.json();

    const nextResponse = NextResponse.json(result, {
      status: response.status,
    });

    nextResponse.headers.set("Cache-Control", "no-store");

    return nextResponse;
  } catch (error) {
    console.error("Storefront slider API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load homepage sliders.",
        data: [],
      },
      { status: 503 }
    );
  }
}
