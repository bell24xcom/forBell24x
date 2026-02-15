export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = searchParams.get("hours") || "24";
    
    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/admin/ab-test/stats?hours=${hours}`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching A/B test stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

