import { collectionApiProxy } from "@/lib/collectionApiProxy";

export async function GET(request) {
  return collectionApiProxy(request, "", "GET");
}

export async function POST(request) {
  return collectionApiProxy(request, "", "POST");
}
