import { collectionApiProxy } from "@/lib/collectionApiProxy";

export async function GET(request) {
  return collectionApiProxy(request, "/products/search", "GET");
}
