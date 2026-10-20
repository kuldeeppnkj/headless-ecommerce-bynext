import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

export async function GET(req: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const redirectPath = req.nextUrl.searchParams.get("redirect") || "/";
  const redirectUrl = new URL(redirectPath, req.nextUrl.origin);

  return NextResponse.redirect(redirectUrl);
}

