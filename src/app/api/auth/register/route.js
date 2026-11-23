
import { NextResponse } from "next/server";

export async function POST(request) {
  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const body = await request.json();

    const response = await fetch(
      `${backendUrl}/api/auth/register`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
    console.error("Registration API error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration information.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Registration service is unavailable.",
      },
      { status: 503 }
    );
  }
}
