import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WORDPRESS_URL } from "@/lib/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("our_jwt_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const res = await fetch(`${WORDPRESS_URL}/wp-json/our/v1/addresses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load addresses." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("our_jwt_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const res = await fetch(`${WORDPRESS_URL}/wp-json/our/v1/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save address." },
      { status: 500 }
    );
  }
}

