import { NextResponse } from "next/server";
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

    const res = await fetch(`${WORDPRESS_URL}/wp-json/our/v1/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load orders." },
      { status: 500 }
    );
  }
}

