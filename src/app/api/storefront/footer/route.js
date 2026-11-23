import { footerApiProxy } from "@/lib/footerApiProxy";

export async function GET(request) {
  return footerApiProxy(
    request,
    "/storefront/footer",
    "GET",
    false
  );
}
