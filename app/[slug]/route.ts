import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { createTrackedRedirect } from "@/lib/redirect-utils";

interface Redirects {
  [key: string]: string;
}

const redirectsFile = path.join(process.cwd(), "redirects.json");
const redirects: Redirects = JSON.parse(fs.readFileSync(redirectsFile, "utf8"));

const ALLOWED_DOMAINS = [
  "github.com",
  "freewith.tech",
  "v1.freewith.tech",
  "v2.freewith.tech",
  "journey.freewith.tech",
  "youtu.be",
  "open.substack.com",
  "testflight.apple.com",
  "producthunt.com"
] as const;

function validateDestination(destination: string): NextResponse | null {
  try {
    const destinationUrl = new URL(destination);
    if (!ALLOWED_DOMAINS.includes(destinationUrl.hostname as any)) {
      console.error(`Blocked redirect to unauthorized domain: ${destinationUrl.hostname}`);
      return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
    }
    return null;
  } catch (error) {
    console.error(`Invalid destination URL: ${destination}`);
    return NextResponse.json({ error: "Invalid destination URL" }, { status: 400 });
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

  const validationError = validateDestination(destination);
  if (validationError) {
    return validationError;
  }

  return createTrackedRedirect(req, destination, slug);
} 