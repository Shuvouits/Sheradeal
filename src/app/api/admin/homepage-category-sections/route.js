
import { homepageCategorySectionProxy } from "@/lib/homepageCategorySectionProxy";

export async function GET(request) {
  return homepageCategorySectionProxy(request, "", "GET");
}

export async function POST(request) {
  return homepageCategorySectionProxy(request, "", "POST");
}
