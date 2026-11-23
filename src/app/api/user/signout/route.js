import { NextResponse } from "next/server";

export async function POST(request) {
  const token = request.cookies.get("sheradeal_token")?.value;

  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  if (token) {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
    } catch (error) {
      console.error("Laravel logout request failed:", error);
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Signed out successfully.",
  });

  response.cookies.set("sheradeal_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}