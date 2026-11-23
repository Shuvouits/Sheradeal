
import { outletApiProxy } from "@/lib/outletApiProxy";

export async function GET(request) {
  return outletApiProxy(
    request,
    "/admin/store-outlets"
  );
}

export async function POST(request) {
  return outletApiProxy(
    request,
    "/admin/store-outlets",
    "POST"
  );
}
