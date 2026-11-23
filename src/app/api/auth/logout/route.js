
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sheradeal_token")?.value;

  const apiUrl = (
    process.env.LARAVEL_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  let revoked = !token;

  if (token) {
    try {
      const response = await fetch(
        `${apiUrl}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }
      );

      revoked = response.ok;
    } catch (error) {
      console.error("Laravel logout failed:", error);
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Signed out from SheraDeal.",
    token_revoked: revoked,
  });

  response.cookies.set("sheradeal_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}
