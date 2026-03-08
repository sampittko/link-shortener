import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { createTrackedRedirect } from "@/lib/redirect-utils";

interface Redirects {
  [key: string]: string;
}

const redirectsFile = path.join(process.cwd(), "redirects.json");
const redirects: Redirects = JSON.parse(fs.readFileSync(redirectsFile, "utf8"));

const ALLOWED_DOMAINS = new Set<string>([
  "github.com",
  "freewith.tech",
  "v1.freewith.tech",
  "v2.freewith.tech",
  "journey.freewith.tech",
  "youtu.be",
  "youtube.com",
  "open.substack.com",
  "testflight.apple.com",
  "producthunt.com",
  "apps.apple.com"
]);

function validateDestination(slug: string, destination: string): NextResponse | null {
  try {
    const destinationUrl = new URL(destination);
    if (!ALLOWED_DOMAINS.has(destinationUrl.hostname)) {
      console.error(
        `Blocked redirect for slug "${slug}" to unauthorized domain: ${destinationUrl.hostname}`
      );
      return NextResponse.json({ error: "Redirect configuration error" }, { status: 500 });
    }
    return null;
  } catch {
    console.error(`Invalid destination URL for slug "${slug}": ${destination}`);
    return NextResponse.json({ error: "Redirect configuration error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;
  const destination = redirects[slug];

  if (!destination) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const validationError = validateDestination(slug, destination);
  if (validationError) {
    return validationError;
  }

  return createTrackedRedirect(req, destination, slug);
} 
