import { NextResponse } from "next/server";
import { advertisementApiProxy } from "@/lib/advertisementApiProxy";

function validId(id) {
  return /^\d+$/.test(String(id));
}

export async function GET(request, { params }) {
  const { id } = await params;

  if (!validId(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid advertisement ID." },
      { status: 400 }
    );
  }

  return advertisementApiProxy(request, `/${id}`, "GET");
}

export async function PUT(request, { params }) {
  const { id } = await params;

  if (!validId(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid advertisement ID." },
      { status: 400 }
    );
  }

  return advertisementApiProxy(request, `/${id}`, "PUT");
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (!validId(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid advertisement ID." },
      { status: 400 }
    );
  }

  return advertisementApiProxy(request, `/${id}`, "DELETE");
}
