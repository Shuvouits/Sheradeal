
import { NextResponse } from "next/server";

export async function advertisementApiProxy(
  request,
  path = "",
  method = "GET"
) {
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
    const url = new URL(
      `${backendUrl}/api/admin/advertisements${path}`
    );

    if (method === "GET") {
      url.search = new URL(request.url).search;
    }

    const options = {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(30000),
    };

    if (method === "POST" || method === "PUT") {
      const body = await request.formData();

      if (method === "PUT") {
        body.set("_method", "PUT");
        options.method = "POST";
      }

      options.body = body;
    }

    const response = await fetch(url, options);

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
    console.error("Advertisement API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to Laravel.",
      },
      { status: 503 }
    );
  }
}
