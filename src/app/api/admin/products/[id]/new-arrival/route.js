import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  const { id } = await params;

  if (!/^\d+$/.test(String(id))) {
    return NextResponse.json(
      { success: false, message: "Invalid product ID." },
      { status: 400 }
    );
  }

  const token = request.cookies.get("sheradeal_token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated." },
      { status: 401 }
    );
  }

  const backendUrl = (
    process.env.LARAVEL_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const body = await request.json();

    const response = await fetch(
      `${backendUrl}/api/admin/products/${id}/new-arrival`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    const result = await response.json().catch(() => ({
      success: false,
      message: "Invalid Laravel API response.",
    }));

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("New Arrival update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update New Arrival status.",
      },
      { status: 503 }
    );
  }
}
