import { NextRequest, NextResponse } from "next/server";
import { createTrackedRedirect } from "@/lib/redirect-utils";
import redirectsData from "@/redirects.json";

const redirects: Record<string, string> = redirectsData;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;
  const destination = redirects[slug];

  if (!destination) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return createTrackedRedirect(req, destination, slug);
} 
