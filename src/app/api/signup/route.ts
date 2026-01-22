import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the admin's cookie from the request
    const adminCookie = request.headers.get("cookie") || "";
    
    // Get the backend URL from environment or use default
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/signup`
      : "https://ext-ent.com/api/signup";

    // Get FormData from the request
    const formData = await request.formData();

    // Forward the request to your backend with admin's cookie
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        // Forward the admin's cookie to maintain admin session on backend
        Cookie: adminCookie,
        // Don't set Content-Type - let fetch set it with boundary for FormData
      },
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    // Create response with same status
    const nextResponse = NextResponse.json(data, { status: response.status });

    // IMPORTANT: Do NOT forward Set-Cookie header from signup response
    // This prevents the newly created user's token from overwriting the admin's session
    // The admin's cookie is preserved in the browser

    return nextResponse;
  } catch (error) {
    console.error("Signup Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
