import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("resume.")) {
    return NextResponse.redirect("https://kavyakat.de/Kavya_Kathuria_Resume.pdf", { status: 302 });
  }
  return NextResponse.next();
}
