
import { NextResponse } from "next/server";
import { outletApiProxy } from "@/lib/outletApiProxy";

function pathFor(id) {
  return /^\d+$/.test(String(id))
    ? `/admin/store-outlets/${id}`
    : null;
}

function invalidId() {
  return NextResponse.json(
    { success: false, message: "Invalid outlet ID." },
    { status: 400 }
  );
}

export async function GET(request, { params }) {
  const { id } = await params;
  const path = pathFor(id);

  return path
    ? outletApiProxy(request, path, "GET")
    : invalidId();
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const path = pathFor(id);

  return path
    ? outletApiProxy(request, path, "PUT")
    : invalidId();
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const path = pathFor(id);

  return path
    ? outletApiProxy(request, path, "DELETE")
    : invalidId();
}
