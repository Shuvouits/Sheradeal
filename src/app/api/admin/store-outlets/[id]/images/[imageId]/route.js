
import { NextResponse } from "next/server";
import { outletApiProxy } from "@/lib/outletApiProxy";

export async function DELETE(request, { params }) {
  const { id, imageId } = await params;

  if (
    !/^\d+$/.test(String(id)) ||
    !/^\d+$/.test(String(imageId))
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid image ID." },
      { status: 400 }
    );
  }

  return outletApiProxy(
    request,
    `/admin/store-outlets/${id}/images/${imageId}`,
    "DELETE"
  );
}
