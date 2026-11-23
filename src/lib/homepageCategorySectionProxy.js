import { NextResponse } from "next/server";

export async function homepageCategorySectionProxy(
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

  const url = new URL(
    `${backendUrl}/api/admin/homepage-category-sections${path}`
  );

  if (method === "GET") {
    url.search = new URL(request.url).search;
  }

  try {
    const options = {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(20000),
    };

    if (method === "POST" || method === "PUT") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(await request.json());
    }

    const response = await fetch(url, options);

    const result = await response.json().catch(() => ({
      success: false,
      message: "Invalid Laravel response.",
    }));

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Homepage Category Section API:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to Laravel.",
      },
      { status: 503 }
    );
  }
}
