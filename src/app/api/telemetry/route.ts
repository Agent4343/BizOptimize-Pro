import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.info("[telemetry::api]", body);
  } catch (error) {
    console.error("[telemetry::api:error]", error);
  }
  return NextResponse.json({ success: true });
}
