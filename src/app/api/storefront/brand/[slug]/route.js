import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      {
        success: false,
        message: "Brand slug is required.",
      },
      { status: 400 }
    );
  }

  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const searchParams = new URL(request.url).searchParams;

  const query = new URLSearchParams();

  query.set("page", searchParams.get("page") || "1");
  query.set("per_page", "20");
  query.set("sort", searchParams.get("sort") || "newest");

  try {
    const response = await fetch(
      `${backendUrl}/api/storefront/brand/${encodeURIComponent(slug)}?${query.toString()}`,
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
    console.error("Brand products API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load brand products.",
        data: null,
      },
      { status: 503 }
    );
  }
}
