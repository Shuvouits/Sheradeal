import { NextResponse } from "next/server";
import { collectionApiProxy } from "@/lib/collectionApiProxy";

function isValidId(id) {
  return /^\d+$/.test(String(id));
}

export async function POST(request, { params }) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid collection ID." },
      { status: 400 }
    );
  }

  return collectionApiProxy(request, `/${id}/cover`, "POST");
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid collection ID." },
      { status: 400 }
    );
  }

  return collectionApiProxy(request, `/${id}/cover`, "DELETE");
}
