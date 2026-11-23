
import { outletApiProxy } from "@/lib/outletApiProxy";

export async function GET(request) {
  return outletApiProxy(
    request,
    "/storefront/outlets",
    "GET",
    false
  );
}
