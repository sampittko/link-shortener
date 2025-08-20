import { NextRequest, NextResponse } from "next/server";
import { createTrackedRedirect } from "@/lib/redirect-utils";

const ROOT_DESTINATION = "https://freewith.tech";
const ROOT_SLUG = "root";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return createTrackedRedirect(req, ROOT_DESTINATION, ROOT_SLUG, true);
}