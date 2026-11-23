import { NextResponse } from "next/server";
import { collectionApiProxy } from "@/lib/collectionApiProxy";

function isValidId(id) {
  return /^\d+$/.test(String(id));
}

function invalidResponse() {
  return NextResponse.json(
    { success: false, message: "Invalid collection ID." },
    { status: 400 }
  );
}

export async function GET(request, { params }) {
  const { id } = await params;

  if (!isValidId(id)) return invalidResponse();

  return collectionApiProxy(request, `/${id}`, "GET");
}

export async function PUT(request, { params }) {
  const { id } = await params;

  if (!isValidId(id)) return invalidResponse();

  return collectionApiProxy(request, `/${id}`, "PUT");
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!isValidId(id)) return invalidResponse();

  return collectionApiProxy(request, `/${id}`, "DELETE");
}
