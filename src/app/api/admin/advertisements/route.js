import { advertisementApiProxy } from "@/lib/advertisementApiProxy";

export async function GET(request) {
  return advertisementApiProxy(request, "", "GET");
}

export async function POST(request) {
  return advertisementApiProxy(request, "", "POST");
}
