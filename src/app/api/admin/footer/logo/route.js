import { footerApiProxy } from "@/lib/footerApiProxy";

export async function POST(request) {
  return footerApiProxy(
    request,
    "/admin/footer/logo",
    "POST"
  );
}

export async function DELETE(request) {
  return footerApiProxy(
    request,
    "/admin/footer/logo",
    "DELETE"
  );
}
