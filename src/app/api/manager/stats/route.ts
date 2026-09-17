import { NextResponse } from "next/server";
import { db } from "@/db/store";

export async function GET() {
  try {
    const stats = db.getManagerStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to retrieve statistics" } },
      { status: 500 }
    );
  }
}
