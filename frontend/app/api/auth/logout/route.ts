import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("our_jwt_token");

    return NextResponse.json({
      success: true,
      message: "Successfully logged out.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Logout failed." },
      { status: 500 }
    );
  }
}

