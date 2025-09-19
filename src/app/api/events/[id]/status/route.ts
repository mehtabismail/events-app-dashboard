import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const backendUrl = `https://events-app-backend-stage.up.railway.app/events/${id}/status`;

    console.log("Updating event status from backend:", backendUrl);
    console.log("Status update body:", body);

    // Forward the request to your backend
    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "", // Forward cookies
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to update event status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Event Status Update API Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
