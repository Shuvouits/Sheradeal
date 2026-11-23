import { NextResponse } from "next/server";

export async function GET(request) {
  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const incoming = new URL(request.url).searchParams;

  const query = new URLSearchParams({
    search: incoming.get("search") || "",
    sort: incoming.get("sort") || "relevance",
    page: incoming.get("page") || "1",
    per_page: "20",
  });

  try {
    const response = await fetch(
      `${backendUrl}/api/storefront/search/products?${query.toString()}`,
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
    console.error("Product search API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to search products.",
        data: null,
      },
      { status: 503 }
    );
  }
}
