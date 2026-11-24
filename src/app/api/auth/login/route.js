import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 422 }
      );
    }

    const apiUrl = (
      process.env.LARAVEL_API_URL ||
      "http://127.0.0.1:8000"
    ).replace(/\/+$/, "");

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Invalid email or password.",
        },
        { status: response.status }
      );
    }

    const token = result?.data?.access_token;

    if (typeof token !== "string" || !token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token was not returned.",
        },
        { status: 502 }
      );
    }

    const sixtyDays = 60 * 24 * 60 * 60;
    const expiresIn = Number(result?.data?.expires_in);

    const cookieAge =
      Number.isFinite(expiresIn) && expiresIn > 0
        ? Math.min(expiresIn, sixtyDays)
        : sixtyDays;

    const nextResponse = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: result?.data?.user || null,
    });

    nextResponse.cookies.set("sheradeal_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: cookieAge,
    });

    nextResponse.headers.set("Cache-Control", "no-store");

    return nextResponse;
  } catch (error) {
    console.error("Authentication request failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Authentication service is unavailable. Please try again.",
      },
      { status: 503 }
    );
  }
}