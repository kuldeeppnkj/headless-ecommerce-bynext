import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WORDPRESS_URL } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, first_name, last_name } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${WORDPRESS_URL}/wp-json/our/v1/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: first_name || "",
        last_name: last_name || "",
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return NextResponse.json(
        { success: false, message: json.message || "Registration failed." },
        { status: res.status || 400 }
      );
    }

    const token = json.data?.token;
    const user = json.data?.user;

    // Set secure HTTP-only cookie if token returned
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set("our_jwt_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error: any) {
    console.error("Register route error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}

