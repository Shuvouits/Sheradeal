
import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(
      `${backendUrl}/api/storefront/categories`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to load storefront categories.",
      },
      { status: 502 }
    );
  }
}
