import { footerApiProxy } from "@/lib/footerApiProxy";

export async function GET(request) {
  return footerApiProxy(request, "/admin/footer");
}

export async function PUT(request) {
  return footerApiProxy(request, "/admin/footer", "PUT");
}
