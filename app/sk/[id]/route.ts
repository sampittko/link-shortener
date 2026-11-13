import { NextRequest, NextResponse } from "next/server";
import { getPracticeDestination } from "@/lib/practice-redirects";
import { createTrackedRedirect } from "@/lib/redirect-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const destination = getPracticeDestination(id, "sk");

  if (!destination) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return createTrackedRedirect(req, destination, `sk/${id}`, true);
}
