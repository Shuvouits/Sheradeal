
import { homepageCategorySectionProxy } from "@/lib/homepageCategorySectionProxy";

export async function GET(request) {
  return homepageCategorySectionProxy(
    request,
    "/products",
    "GET"
  );
}
