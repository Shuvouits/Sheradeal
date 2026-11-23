import { NextResponse } from "next/server";
import { homepageCategorySectionProxy } from "@/lib/homepageCategorySectionProxy";

function invalidId(id) {
  return !/^\d+$/.test(String(id));
}

export async function PUT(request, { params }) {
  const { id } = await params;

  if (invalidId(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid section ID." },
      { status: 400 }
    );
  }

  return homepageCategorySectionProxy(
    request,
    `/${id}`,
    "PUT"
  );
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  if (invalidId(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid section ID." },
      { status: 400 }
    );
  }

  return homepageCategorySectionProxy(
    request,
    `/${id}`,
    "DELETE"
  );
}
