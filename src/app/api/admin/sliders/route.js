
import { sliderApiProxy } from "@/lib/sliderApiProxy";

export async function GET(request) {
  return sliderApiProxy(request, "", "GET");
}

export async function POST(request) {
  return sliderApiProxy(request, "", "POST");
}
