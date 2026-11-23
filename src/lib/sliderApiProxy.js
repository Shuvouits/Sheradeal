import { NextResponse } from "next/server";

export async function sliderApiProxy(request, path, method = "GET") {
  const token = request.cookies.get("sheradeal_token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated." },
      { status: 401 }
    );
  }

  const baseUrl = (
    process.env.LARAVEL_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  try {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const options = {
      method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    };

    if (method !== "GET" && method !== "DELETE") {
      const formData = await request.formData();

      if (method === "PUT") {
        formData.set("_method", "PUT");
        options.method = "POST";
      }

      options.body = formData;
    }

    const url = new URL(`${baseUrl}/api/admin/sliders${path}`);

    if (method === "GET") {
      const params = new URL(request.url).searchParams;
      url.search = params.toString();
    }

    const response = await fetch(url.toString(), options);
    const result = await response.json().catch(() => ({
      success: false,
      message: "Invalid response from Laravel.",
    }));

    const nextResponse = NextResponse.json(result, {
      status: response.status,
    });

    nextResponse.headers.set("Cache-Control", "no-store");

    return nextResponse;
  } catch (error) {
    console.error("Slider API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the Laravel server.",
      },
      { status: 503 }
    );
  }
}
