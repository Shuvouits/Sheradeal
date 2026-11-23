
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sheradeal_token")?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Not authenticated.",
      },
      { status: 401 }
    );
  }

  const apiUrl = (
    process.env.LARAVEL_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: result.message || "Session invalid.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: result.data?.user || result.data,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Authentication service unavailable.",
      },
      { status: 503 }
    );
  }
}
