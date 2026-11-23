
import { NextResponse } from "next/server";
import { outletApiProxy } from "@/lib/outletApiProxy";

export async function POST(request, { params }) {
  const { id } = await params;

  if (!/^\d+$/.test(String(id))) {
    return NextResponse.json(
      { success: false, message: "Invalid outlet ID." },
      { status: 400 }
    );
  }

  return outletApiProxy(
    request,
    `/admin/store-outlets/${id}/images`,
    "POST"
  );
}
