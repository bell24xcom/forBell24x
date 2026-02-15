export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/admin/tasks/pending`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pending tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

