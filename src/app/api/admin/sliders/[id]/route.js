import { sliderApiProxy } from "@/lib/sliderApiProxy";

export async function GET(request, { params }) {
  const { id } = await params;
  return sliderApiProxy(request, `/${encodeURIComponent(id)}`, "GET");
}

export async function PUT(request, { params }) {
  const { id } = await params;
  return sliderApiProxy(request, `/${encodeURIComponent(id)}`, "PUT");
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return sliderApiProxy(request, `/${encodeURIComponent(id)}`, "DELETE");
}
