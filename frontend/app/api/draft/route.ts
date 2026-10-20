import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

const PREVIEW_SECRET =
  process.env.DRAFT_SECRET || "paradise_preview_secret_2026";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") || "";

  // 1. Verify Secret
  if (secret !== PREVIEW_SECRET) {
    return NextResponse.json(
      { message: "Invalid preview secret token." },
      { status: 401 }
    );
  }

  // 2. Enable Draft Mode
  const draft = await draftMode();
  draft.enable();

  // 3. Determine redirect URL
  const destination =
    !slug || slug === "home" ? "/" : `/${slug.replace(/^\//, "")}`;

  // 4. Redirect editor to the page in draft mode
  const redirectUrl = new URL(destination, req.nextUrl.origin);
  return NextResponse.redirect(redirectUrl);
}

