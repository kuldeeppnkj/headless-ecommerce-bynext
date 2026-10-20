import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WORDPRESS_URL } from "@/lib/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("our_jwt_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const res = await fetch(`${WORDPRESS_URL}/wp-json/our/v1/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const json = await res.json();
    if (json.success && json.data) {
      return NextResponse.json({
        authenticated: true,
        user: json.data,
      });
    }

    return NextResponse.json({ authenticated: false, user: null });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

